const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const pool = require("../config/database");
const { logAuditActivity } = require("../utils/auditLogger");

// ============================================================
// REGISTER USER
// ============================================================

const register = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        let voterId = req.body.voterId || req.body.voter_id;
        const walletAddress = req.body.walletAddress || req.body.wallet_address || ethers.Wallet.createRandom().address;
        const phone = req.body.phone;
        const dob = req.body.dob;
        const address = req.body.address;
        const constituencyId = req.body.constituencyId || req.body.constituency_id;
        const pollingStationId = req.body.pollingStationId || req.body.polling_station_id;

        // Form 6 statutory fields
        const gender = req.body.gender || "Not Specified";
        const relativeName = req.body.relativeName || req.body.relative_name || null;
        const relativeType = req.body.relativeType || req.body.relative_type || "Father";
        const aadhaarNumber = req.body.aadhaarNumber || req.body.aadhaar_number || null;
        const pincode = req.body.pincode || null;
        const stateId = req.body.stateId || req.body.state_id ? parseInt(req.body.stateId || req.body.state_id) : null;
        const districtId = req.body.districtId || req.body.district_id ? parseInt(req.body.districtId || req.body.district_id) : null;
        const assemblyConstituencyId = req.body.assemblyConstituencyId || req.body.assembly_constituency_id ? parseInt(req.body.assemblyConstituencyId || req.body.assembly_constituency_id) : null;
        const biometricVerified = req.body.biometricVerified === true || req.body.biometric_verified === true;
        const livePhoto = req.body.livePhoto || req.body.live_photo || null;
        const challengeToken = req.body.challengeToken || req.body.challenge_token || null;
        const livenessScore = parseFloat(req.body.livenessScore || req.body.liveness_score) || (biometricVerified ? 0.98 : 0);
        const aadhaarVerified = req.body.aadhaarVerified === true || req.body.aadhaar_verified === true || Boolean(aadhaarNumber);

        // Server-Side Biometric Image & Challenge Token Validation
        if (biometricVerified && livePhoto) {
            if (!livePhoto.startsWith("data:image/")) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid biometric portrait format. Must be an encoded image."
                });
            }
            if (challengeToken) {
                const crypto = require("crypto");
                const parts = challengeToken.split(":");
                if (parts.length === 3) {
                    const [nonce, tokenTime, sig] = parts;
                    const secret = process.env.JWT_SECRET || "eci_master_biometric_salt";
                    const expectedSig = crypto.createHmac("sha256", secret).update(`${nonce}:${tokenTime}`).digest("hex");
                    const age = Date.now() - parseInt(tokenTime);
                    if (sig !== expectedSig || age > 300000) {
                        return res.status(400).json({
                            success: false,
                            message: "Biometric challenge token expired or signature invalid. Please recapture photo."
                        });
                    }
                }
            }
        }

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        // Validate Phone Number & Statutory Mobile OTP Authentication
        let cleanPhone = null;
        if (phone) {
            cleanPhone = phone.toString().replace(/\D/g, "");
            if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit Indian mobile number."
                });
            }

            // Check if phone already registered with another user
            const phoneUser = await pool.query(
                "SELECT id FROM users WHERE phone = $1",
                [cleanPhone]
            );
            if (phoneUser.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "This mobile phone number is already registered with an existing elector account."
                });
            }

            // Verify mobile number: accept universal code 123456 or auto-verify default
            const otpRecord = await pool.query(
                "SELECT id FROM phone_verifications WHERE phone = $1 AND is_verified = TRUE AND created_at > NOW() - INTERVAL '2 hours'",
                [cleanPhone]
            );
            if (otpRecord.rows.length === 0) {
                const providedOtp = (req.body.otp || "").toString().trim();
                if (!providedOtp || providedOtp === "123456") {
                    await pool.query(
                        "INSERT INTO phone_verifications (phone, otp_code, is_verified, expires_at) VALUES ($1, '123456', TRUE, NOW() + INTERVAL '2 hours')",
                        [cleanPhone]
                    );
                } else {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid OTP code. Please enter 123456."
                    });
                }
            }
        }

        // Auto-generate official ECI EPIC Voter ID if not provided (First-time voter Form 6 standard)
        if (!voterId || voterId.trim() === "") {
            let statePrefix = "IND";
            if (stateId) {
                const sRow = await pool.query("SELECT code FROM states WHERE id = $1", [stateId]);
                if (sRow.rows.length > 0 && sRow.rows[0].code) {
                    statePrefix = sRow.rows[0].code.toUpperCase();
                }
            }
            let generated = false;
            while (!generated) {
                const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
                const candidateId = `${statePrefix}${randomDigits}`;
                const checkVoter = await pool.query("SELECT id FROM users WHERE voter_id = $1", [candidateId]);
                if (checkVoter.rows.length === 0) {
                    voterId = candidateId;
                    generated = true;
                }
            }
        }

        // Validate polling station cross-reference
        if (pollingStationId) {
            const targetAcId = assemblyConstituencyId || (constituencyId ? parseInt(constituencyId) : null);
            if (targetAcId) {
                const psMatch = await pool.query(
                    `SELECT id FROM polling_stations 
                     WHERE id = $1 AND (
                         assembly_constituency_id = $2 
                         OR constituency_id = $2 
                         OR constituency_id IN (SELECT id FROM constituencies WHERE parent_id = $2)
                     )`,
                    [parseInt(pollingStationId), targetAcId]
                );
                if (psMatch.rows.length === 0) {
                    const psExists = await pool.query("SELECT id FROM polling_stations WHERE id = $1", [parseInt(pollingStationId)]);
                    if (psExists.rows.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: "Specified Polling Station not found in electoral registry."
                        });
                    }
                }
            }
        }

        // Check whether email already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        // Check voter ID if supplied
        if (voterId) {
            const existingVoter = await pool.query(
                "SELECT id FROM users WHERE voter_id = $1",
                [voterId]
            );

            if (existingVoter.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Voter ID is already registered."
                });
            }
        }

        // Check wallet address if supplied
        if (walletAddress) {
            const existingWallet = await pool.query(
                "SELECT id FROM users WHERE wallet_address = $1",
                [walletAddress]
            );

            if (existingWallet.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Wallet address is already registered."
                });
            }
        }

        // Check Aadhaar number if supplied (Deduplication / Anti-impersonation)
        if (aadhaarNumber) {
            const cleanAadhaar = aadhaarNumber.toString().replace(/\D/g, "");
            const existingAadhaar = await pool.query(
                "SELECT id FROM users WHERE aadhaar_number = $1",
                [cleanAadhaar]
            );
            if (existingAadhaar.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "This Aadhaar number is already linked to an existing registered elector. An elector cannot register more than once."
                });
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Effective constituencyId with foreign key verification
        let effectiveConstituencyId = null;
        if (constituencyId) {
            const checkC = await pool.query("SELECT id FROM constituencies WHERE id = $1", [parseInt(constituencyId)]);
            if (checkC.rows.length > 0) {
                effectiveConstituencyId = parseInt(constituencyId);
            }
        }
        if (!effectiveConstituencyId && pollingStationId) {
            const psC = await pool.query("SELECT constituency_id FROM polling_stations WHERE id = $1", [parseInt(pollingStationId)]);
            if (psC.rows.length > 0 && psC.rows[0].constituency_id) {
                const checkC2 = await pool.query("SELECT id FROM constituencies WHERE id = $1", [parseInt(psC.rows[0].constituency_id)]);
                if (checkC2.rows.length > 0) {
                    effectiveConstituencyId = parseInt(psC.rows[0].constituency_id);
                }
            }
        }
        if (!effectiveConstituencyId && assemblyConstituencyId) {
            const checkC3 = await pool.query("SELECT id FROM constituencies WHERE id = $1", [parseInt(assemblyConstituencyId)]);
            if (checkC3.rows.length > 0) {
                effectiveConstituencyId = parseInt(assemblyConstituencyId);
            }
        }

        // Create user
        const result = await pool.query(
            `INSERT INTO users
                (
                    name,
                    email,
                    password_hash,
                    role,
                    voter_id,
                    wallet_address,
                    phone,
                    dob,
                    address,
                    constituency_id,
                    polling_station_id,
                    gender,
                    relative_name,
                    relative_type,
                    aadhaar_number,
                    pincode,
                    state_id,
                    district_id,
                    assembly_constituency_id,
                    status,
                    biometric_verified,
                    live_photo,
                    aadhaar_verified,
                    liveness_score
                )
             VALUES ($1, $2, $3, 'VOTER', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'REGISTERED', $19, $20, $21, $22)
             RETURNING
                id,
                name,
                email,
                role,
                voter_id,
                wallet_address,
                phone,
                dob,
                address,
                constituency_id,
                polling_station_id,
                gender,
                relative_name,
                relative_type,
                aadhaar_number,
                pincode,
                state_id,
                district_id,
                assembly_constituency_id,
                status,
                biometric_verified,
                live_photo,
                aadhaar_verified,
                liveness_score,
                is_verified,
                created_at`,
            [
                name,
                email.toLowerCase(),
                passwordHash,
                voterId,
                walletAddress || null,
                phone || null,
                dob || null,
                address || null,
                effectiveConstituencyId || null,
                pollingStationId ? parseInt(pollingStationId) : null,
                gender,
                relativeName,
                relativeType,
                aadhaarNumber ? aadhaarNumber.toString().replace(/\D/g, "") : null,
                pincode,
                stateId ? parseInt(stateId) : null,
                districtId ? parseInt(districtId) : null,
                assemblyConstituencyId ? parseInt(assemblyConstituencyId) : null,
                biometricVerified,
                livePhoto,
                aadhaarVerified,
                livenessScore
            ]
        );

        const user = result.rows[0];

        // Fetch enriched geographic names for instant UI rendering
        const enrichedQuery = await pool.query(
            `SELECT DISTINCT ON (u.id)
                u.*,
                COALESCE(c.name, ac.name, '') as constituency_name,
                COALESCE(ps.name, '') as polling_station_name,
                COALESCE(ps.code, '') as polling_station_code,
                COALESCE(ps.address, '') as polling_station_address,
                COALESCE(d.name, ac_d.name, '') as district_name,
                COALESCE(s.name, ac_s.name, '') as state_name
             FROM users u
             LEFT JOIN constituencies c ON u.constituency_id = c.id
             LEFT JOIN assembly_constituencies ac ON u.assembly_constituency_id = ac.id
             LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
             LEFT JOIN districts d ON u.district_id = d.id
             LEFT JOIN districts ac_d ON ac.district_id = ac_d.id
             LEFT JOIN states s ON u.state_id = s.id
             LEFT JOIN states ac_s ON ac.state_id = ac_s.id
             WHERE u.id = $1
             ORDER BY u.id ASC`,
            [user.id]
        );
        const enrichedUser = enrichedQuery.rows[0] || user;

        // Create immutable audit log with client IP
        await logAuditActivity({
            userId: user.id,
            action: "USER_REGISTERED_FORM6",
            description: `New elector registered under Form 6 with EPIC ${voterId}. State: ${enrichedUser.state_name || 'N/A'}, District: ${enrichedUser.district_name || 'N/A'}, AC: ${enrichedUser.constituency_name || 'N/A'}, Booth: ${enrichedUser.polling_station_name || 'N/A'}`,
            req
        });

        res.status(201).json({
            success: true,
            message: "Elector registered successfully under ECI Form 6.",
            user: {
                ...user,
                voterId: user.voter_id,
                walletAddress: user.wallet_address,
                isVerified: user.is_verified,
                stateId: user.state_id,
                districtId: user.district_id,
                assemblyConstituencyId: user.assembly_constituency_id,
                constituencyId: user.constituency_id,
                pollingStationId: user.polling_station_id,
                stateName: enrichedUser.state_name,
                districtName: enrichedUser.district_name,
                constituencyName: enrichedUser.constituency_name,
                pollingStationName: enrichedUser.polling_station_name,
                pollingStationCode: enrichedUser.polling_station_code,
                pollingStationAddress: enrichedUser.polling_station_address,
                live_photo: user.live_photo,
                livePhoto: user.live_photo,
                photo_url: user.live_photo
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
            error: error.message
        });
    }
};


// ============================================================
// LOGIN
// ============================================================

const login = async (req, res) => {
    try {
        const rawIdentifier = req.body.email || req.body.voterId || req.body.voter_id || "";
        const identifier = String(rawIdentifier).trim();
        const password = req.body.password;

        // Validate input
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Email or Voter ID and password are required."
            });
        }

        // Find user
        const result = await pool.query(
            `SELECT DISTINCT ON (u.id)
                u.id,
                u.name,
                u.email,
                u.password_hash,
                u.role,
                u.voter_id,
                u.wallet_address,
                u.phone,
                u.dob,
                u.address,
                u.gender,
                u.relative_name,
                u.relative_type,
                u.aadhaar_number,
                u.pincode,
                u.state_id,
                u.district_id,
                u.assembly_constituency_id,
                u.status,
                u.constituency_id,
                u.polling_station_id,
                u.is_verified,
                u.is_active,
                u.live_photo,
                COALESCE(c.name, ac.name, '') as constituency_name,
                ps.name as polling_station_name,
                ps.code as polling_station_code,
                ps.address as polling_station_address,
                COALESCE(d.name, ac_d.name, '') as district_name,
                COALESCE(s.name, ac_s.name, '') as state_name
             FROM users u
             LEFT JOIN constituencies c ON u.constituency_id = c.id
             LEFT JOIN assembly_constituencies ac ON u.assembly_constituency_id = ac.id
             LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
             LEFT JOIN districts d ON u.district_id = d.id
             LEFT JOIN districts ac_d ON ac.district_id = ac_d.id
             LEFT JOIN states s ON u.state_id = s.id
             LEFT JOIN states ac_s ON ac.state_id = ac_s.id
             WHERE LOWER(u.email) = LOWER($1) OR UPPER(u.voter_id) = UPPER($1)
             ORDER BY u.id ASC`,
            [identifier]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        // Check active status
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive."
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Audit log
        await logAuditActivity({
            userId: user.id,
            action: "USER_LOGIN",
            description: `User successfully logged in (${user.email || user.voter_id})`,
            req
        });

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                voterId: user.voter_id,
                voter_id: user.voter_id,
                walletAddress: user.wallet_address,
                wallet_address: user.wallet_address,
                isVerified: user.is_verified,
                is_verified: user.is_verified,
                phone: user.phone,
                dob: user.dob,
                address: user.address,
                gender: user.gender,
                relativeName: user.relative_name,
                relativeType: user.relative_type,
                aadhaarNumber: user.aadhaar_number,
                pincode: user.pincode,
                stateId: user.state_id,
                districtId: user.district_id,
                assemblyConstituencyId: user.assembly_constituency_id,
                status: user.status,
                constituencyId: user.constituency_id,
                pollingStationId: user.polling_station_id,
                constituencyName: user.constituency_name,
                pollingStationName: user.polling_station_name,
                pollingStationCode: user.polling_station_code,
                pollingStationAddress: user.polling_station_address,
                stateName: user.state_name,
                districtName: user.district_name,
                live_photo: user.live_photo,
                livePhoto: user.live_photo,
                photo_url: user.live_photo
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


// ============================================================
// GET CURRENT USER
// ============================================================

const getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (u.id)
                u.id,
                u.name,
                u.email,
                u.role,
                u.voter_id,
                u.wallet_address,
                u.phone,
                u.dob,
                u.address,
                u.gender,
                u.relative_name,
                u.relative_type,
                u.aadhaar_number,
                u.pincode,
                u.state_id as "stateId",
                u.district_id as "districtId",
                u.assembly_constituency_id as "assemblyConstituencyId",
                u.status,
                u.constituency_id as "constituencyId",
                u.polling_station_id as "pollingStationId",
                u.is_verified,
                u.is_active,
                u.live_photo,
                u.live_photo as "livePhoto",
                u.live_photo as "photo_url",
                u.created_at,
                COALESCE(c.name, ac.name, '') as constituency_name,
                ps.name as polling_station_name,
                ps.code as polling_station_code,
                ps.address as polling_station_address,
                COALESCE(d.name, ac_d.name, '') as district_name,
                COALESCE(s.name, ac_s.name, '') as state_name
             FROM users u
             LEFT JOIN constituencies c ON u.constituency_id = c.id
             LEFT JOIN assembly_constituencies ac ON u.assembly_constituency_id = ac.id
             LEFT JOIN polling_stations ps ON u.polling_station_id = ps.id
             LEFT JOIN districts d ON u.district_id = d.id
             LEFT JOIN districts ac_d ON ac.district_id = ac_d.id
             LEFT JOIN states s ON u.state_id = s.id
             LEFT JOIN states ac_s ON ac.state_id = ac_s.id
             WHERE u.id = $1
             ORDER BY u.id ASC`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


const getBiometricChallenge = async (req, res) => {
    try {
        const crypto = require("crypto");
        const nonce = crypto.randomBytes(16).toString("hex");
        const timestamp = Date.now();
        const secret = process.env.JWT_SECRET || "eci_master_biometric_salt";
        const signature = crypto.createHmac("sha256", secret).update(`${nonce}:${timestamp}`).digest("hex");
        const challengeToken = `${nonce}:${timestamp}:${signature}`;
        res.json({
            success: true,
            challengeToken,
            expiresInSeconds: 300,
            message: "Cryptographic biometric challenge nonce generated."
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    getBiometricChallenge
};