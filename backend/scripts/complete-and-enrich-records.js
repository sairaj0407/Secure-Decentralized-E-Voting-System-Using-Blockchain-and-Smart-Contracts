const pool = require('../config/database');

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("=== STARTING COMPLETE DATA ENRICHMENT & DEMO RECORD CLEANUP ===");

        // 1. UPDATE AND CLEAN ELECTIONS
        console.log("1. Cleaning election titles and demo records...");
        
        // Fix short / test titles
        await client.query(`
            UPDATE elections 
            SET title = 'General Election to Legislative Assembly (Maharashtra State 2026)',
                description = 'General election to the Maharashtra Legislative Assembly across 288 constituencies.',
                election_code = 'MH-LA-2026',
                election_type = 'ASSEMBLY'
            WHERE id = 76
        `);

        await client.query(`
            UPDATE elections 
            SET title = 'General Parliamentary Constituency Election (Mumbai South 2026)',
                description = 'Statutory Lok Sabha general election for Parliamentary Constituency 31 - Mumbai South.',
                election_code = 'MH-PC-MUMS-2026',
                election_type = 'PARLIAMENTARY'
            WHERE id = 54
        `);

        await client.query(`
            UPDATE elections 
            SET title = 'General Parliamentary Constituency Election (New Delhi 2026)',
                description = 'Statutory Lok Sabha general election for Parliamentary Constituency 04 - New Delhi.',
                election_code = 'DL-PC-NDL-2026',
                election_type = 'PARLIAMENTARY'
            WHERE id = 51
        `);

        await client.query(`
            UPDATE elections 
            SET title = 'General Parliamentary & Assembly Election (Lok Sabha 2026)',
                description = 'Official statutory general election conducted under the authority of the Election Commission of India and Representation of the People Act, 1951.',
                election_code = 'ELEC-LS-2026',
                election_type = 'PARLIAMENTARY',
                status = 'ACTIVE'
            WHERE id = 77
        `);

        // Clean all elections with timestamped test names into official named elections
        const testPolls = await client.query(`
            SELECT id FROM elections 
            WHERE title ILIKE '%poll 17%' OR title ILIKE '%test%' OR title ILIKE '%dummy%' OR title ILIKE '%sample%'
            ORDER BY id
        `);

        const officialTitles = [
            "General Election to Legislative Assembly (Uttar Pradesh Phase I)",
            "General Election to Legislative Assembly (West Bengal Phase I)",
            "General Election to Legislative Assembly (Tamil Nadu Phase I)",
            "General Election to Legislative Assembly (Karnataka Phase I)",
            "General Election to Legislative Assembly (Kerala Phase I)",
            "General Election to Legislative Assembly (Gujarat Phase I)",
            "General Election to Legislative Assembly (Punjab Phase I)",
            "General Election to Legislative Assembly (Rajasthan Phase I)",
            "General Election to Legislative Assembly (Madhya Pradesh Phase I)",
            "General Election to Legislative Assembly (Bihar Phase I)",
            "General Election to Legislative Assembly (Telangana Phase I)",
            "General Election to Legislative Assembly (Odisha Phase I)",
            "General Election to Legislative Assembly (Assam Phase I)",
            "General Election to Legislative Assembly (Haryana Phase I)",
            "National General Parliamentary Election (Phase I)",
            "National General Parliamentary Election (Phase II)",
            "National General Parliamentary Election (Phase III)",
            "National General Parliamentary Election (Phase IV)",
            "National General Parliamentary Election (Phase V)",
            "National General Parliamentary Election (Phase VI)",
            "National General Parliamentary Election (Phase VII)",
            "Bye-Election to Parliamentary Constituency (Pune Segment)",
            "Bye-Election to Parliamentary Constituency (Nagpur Segment)",
            "Bye-Election to Parliamentary Constituency (Chandni Chowk Segment)",
            "Bye-Election to Parliamentary Constituency (Bengaluru South Segment)",
            "Bye-Election to Parliamentary Constituency (Chennai Central Segment)",
            "Bye-Election to Parliamentary Constituency (Kolkata North Segment)",
            "Bye-Election to Parliamentary Constituency (Hyderabad Segment)",
            "Bye-Election to Parliamentary Constituency (Ahmedabad West Segment)",
            "Bye-Election to Parliamentary Constituency (Jaipur Urban Segment)"
        ];

        for (let i = 0; i < testPolls.rows.length; i++) {
            const elId = testPolls.rows[i].id;
            const title = officialTitles[i % officialTitles.length] + ` [Segment ${elId}]`;
            await client.query(`
                UPDATE elections 
                SET title = $1,
                    description = 'Official statutory election conducted under the supervisory authority of the Election Commission of India.',
                    election_code = 'ELEC-ECI-' || $2
                WHERE id = $2
            `, [title, elId]);
        }
        console.log(`[PASS] Cleaned and renamed ${testPolls.rows.length} election records.`);

        // 2. ENRICH USERS / ELECTORS
        console.log("2. Enriching users, electors, and officers...");
        
        // ECI Admin
        await client.query(`
            UPDATE users 
            SET voter_id = 'ECI-HQ-ADM01',
                phone = '9527218716',
                status = 'VERIFIED',
                is_verified = TRUE
            WHERE id = 1
        `);

        // Rameshwar Narayan Patil (was Aadhaar Verified Citizen 3756)
        await client.query(`
            UPDATE users 
            SET name = 'Rameshwar Narayan Patil',
                email = 'rameshwar.patil@gov.in',
                dob = '1988-06-14',
                gender = 'Male',
                relative_name = 'Narayan Patil',
                relative_type = 'Father',
                address = 'Plot 14, Shanti Nagar, Nashik Road',
                pincode = '422101',
                status = 'VERIFIED',
                is_verified = TRUE,
                aadhaar_verified = TRUE,
                biometric_verified = TRUE
            WHERE id = 3756
        `);

        // Sunita Meena Sharma (was Aadhaar Verified Citizen 3757)
        await client.query(`
            UPDATE users 
            SET name = 'Sunita Meena Sharma',
                email = 'sunita.sharma@gov.in',
                dob = '1994-09-22',
                gender = 'Female',
                relative_name = 'Rajesh Sharma',
                relative_type = 'Husband',
                address = 'Flat 402, Green Avenue, Vasant Kunj',
                pincode = '110070',
                status = 'VERIFIED',
                is_verified = TRUE,
                aadhaar_verified = TRUE,
                biometric_verified = TRUE
            WHERE id = 3757
        `);

        // Returning Officer New Delhi (3728)
        await client.query(`
            UPDATE users 
            SET phone = '9811234567',
                status = 'VERIFIED',
                is_verified = TRUE
            WHERE id = 3728
        `);

        // Constitutional Comptroller Auditor (3729)
        await client.query(`
            UPDATE users 
            SET phone = '9822345678',
                status = 'VERIFIED',
                is_verified = TRUE
            WHERE id = 3729
        `);

        // Primary Elector: KANDEKAR SAIRAJ SUNIL (3758)
        await client.query(`
            UPDATE users 
            SET constituency_id = 153394,
                assembly_constituency_id = 22336,
                district_id = 8702,
                state_id = 1,
                polling_station_id = 45092,
                status = 'VERIFIED',
                is_verified = TRUE,
                aadhaar_verified = TRUE,
                biometric_verified = TRUE,
                liveness_score = 0.99
            WHERE id = 3758
        `);
        console.log("[PASS] All user profiles enriched with complete statutory particulars.");

        // 3. ENRICH CANDIDATES FOR ELECTION 77 WITH COMPLETE BIOGRAPHIES & IMAGES
        console.log("3. Enriching candidates for Election 77...");
        const portraitUrl1 = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250";
        const portraitUrl2 = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250";
        const portraitUrl3 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250";
        const portraitUrl4 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250";

        await client.query(`
            UPDATE candidates 
            SET biography = 'Senior economist, public policy researcher, and former member of State Planning Board with 22 years of public service.',
                image_url = $1,
                status = 'FINAL'
            WHERE election_id = 77 AND id = 1
        `, [portraitUrl1]);

        await client.query(`
            UPDATE candidates 
            SET biography = 'Senior Advocate at the Supreme Court of India, civil liberties reformer, and environmental law practitioner.',
                image_url = $1,
                status = 'FINAL'
            WHERE election_id = 77 AND id = 2
        `, [portraitUrl2]);

        await client.query(`
            UPDATE candidates 
            SET biography = 'Technology innovator, education access advocate, and urban civic infrastructure specialist graduated from IIT Bombay.',
                image_url = $1,
                status = 'FINAL'
            WHERE election_id = 77 AND id = 3
        `, [portraitUrl3]);

        await client.query(`
            UPDATE candidates 
            SET biography = 'Professor of Applied Economics, labor rights researcher, and advisor on universal minimum wage standards.',
                image_url = $1,
                status = 'FINAL'
            WHERE election_id = 77 AND id = 4
        `, [portraitUrl4]);

        await client.query(`
            UPDATE candidates 
            SET biography = 'Constitutional statutory option provided under Rule 64A of Conduct of Elections Rules, 1961 enabling secret dissent.',
                status = 'FINAL'
            WHERE election_id = 77 AND id = 5
        `);

        // Also add authentic candidates for Election 76 (Maharashtra Assembly Election)
        const checkCands76 = await client.query("SELECT id FROM candidates WHERE election_id = 76");
        if (checkCands76.rows.length === 0) {
            console.log("Nominating authentic candidates for Election 76 (Maharashtra State Assembly)...");
            const cands76 = [
                {
                    name: "Smt. Vandana Hemant Deshmukh",
                    party: "Mahayuti Alliance (BJP/SS/NCP)",
                    symbol: "Bow and Arrow",
                    education: "Master of Arts (Political Science, Mumbai University)",
                    total_assets: "₹ 4,12,00,000 (Declared)",
                    total_liabilities: "₹ 11,50,000",
                    criminal_cases_count: 0,
                    affidavit_summary: "Form 26 affidavit scrutinized and verified by Returning Officer. Impeccable public service track record.",
                    manifesto: "Kisan Samriddhi irrigation network, suburban railway modernization, coastal highway extension, and women entrepreneur micro-grants.",
                    biography: "Social reformer and three-term municipal legislator specializing in rural credit access."
                },
                {
                    name: "Shri Aditya Jayantrao Patil",
                    party: "Maha Vikas Aghadi (MVA)",
                    symbol: "Flaming Torch (Mashal)",
                    education: "Bachelor of Engineering (Civil, COEP Pune)",
                    total_assets: "₹ 2,85,00,000 (Declared)",
                    total_liabilities: "₹ 6,20,000",
                    criminal_cases_count: 0,
                    affidavit_summary: "Statutory Form 26 validated under Section 33A of RPA 1951. Zero convictions or pending inquiries.",
                    manifesto: "Comprehensive farm loan waiver, guaranteed youth employment apprenticeship, affordable public health centers in every taluka.",
                    biography: "Agrarian cooperative leader and youth federation organizer with 15 years grassroots leadership."
                },
                {
                    name: "Adv. Prakash Tukaram Kamble",
                    party: "Vanchit Bahujan Aaghadi (VBA)",
                    symbol: "Gas Cylinder",
                    education: "Master of Laws (LL.M., Pune University)",
                    total_assets: "₹ 78,00,000 (Declared)",
                    total_liabilities: "₹ 0 (Nil)",
                    criminal_cases_count: 0,
                    affidavit_summary: "Complete financial transparency submitted in Form 26. Clean legal record.",
                    manifesto: "Strict enforcement of SC/ST sub-plans, universal English-medium public schooling, free municipal legal aid bureaus.",
                    biography: "Human rights advocate representing marginalized workers and unorganized labor unions."
                },
                {
                    name: "None of the Above (NOTA)",
                    party: "Statutory ECI Option",
                    symbol: "Ballot Cross",
                    education: "Statutory Constitutional Option (Section 49-O & Rule 64A)",
                    total_assets: "₹ 0 (Statutory Entity)",
                    total_liabilities: "₹ 0",
                    criminal_cases_count: 0,
                    affidavit_summary: "Empowerment right enabling electors to decline voting for all listed candidates without revealing identity.",
                    manifesto: "Enables constitutional democratic dissent under Supreme Court mandate.",
                    biography: "Statutory ballot choice for voters rejecting all nominated contestants."
                }
            ];

            for (let i = 0; i < cands76.length; i++) {
                const c = cands76[i];
                await client.query(`
                    INSERT INTO candidates 
                    (election_id, name, party, symbol, education, total_assets, total_liabilities, criminal_cases_count, affidavit_summary, manifesto, biography, status, blockchain_candidate_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'FINAL', $12)
                `, [76, c.name, c.party, c.symbol, c.education, c.total_assets, c.total_liabilities, c.criminal_cases_count, c.affidavit_summary, c.manifesto, c.biography, i + 1]);
            }
            console.log("[PASS] Seeded 4 authentic candidates for Election 76.");
        }

        // 4. SEED REALISTIC STATUTORY VOTER SERVICE REQUESTS
        console.log("4. Seeding realistic statutory voter service requests...");
        const existingServices = await client.query("SELECT id FROM voter_service_requests WHERE user_id = 3758");
        if (existingServices.rows.length === 0) {
            await client.query(`
                INSERT INTO voter_service_requests (user_id, request_type, category, details, status, created_at)
                VALUES 
                (3758, 'FORM_8_CORRECTION', 'Correction of Particulars (e-EPIC Address Sync)', 
                 '{"applicationNumber": "ACK-ERO-2026-0814", "fieldModified": "Address & Polling Station Alignment", "previousAddress": "Shirdi Old Town", "requestedAddress": "Near Sai Temple, Pimpalwadi Road, Shirdi - 423109", "supportingDocument": "Aadhaar Card UID-9527", "verificationOfficer": "Booth Level Officer (BLO) Shirdi"}', 
                 'APPROVED', NOW() - INTERVAL '5 days'),

                (3758, 'SAKSHAM_ASSISTANCE', 'Accessible Elections (Senior Citizen / PwD Navigation)', 
                 '{"applicationNumber": "ACK-BLO-2026-1192", "assistanceType": "Wheelchair Support & Priority Ramp Navigation", "designatedStation": "Booth 02 - Municipal Community Center, Shirdi", "volunteerAssigned": "Dedicated National Service Scheme (NSS) Cadet", "contactHelpdesk": "1950"}', 
                 'APPROVED', NOW() - INTERVAL '2 days')
            `);
            console.log("[PASS] Seeded realistic voter service applications for primary user.");
        }

        // 5. UPDATE ELECTION PHASES TO 2026 GENERAL ELECTION
        console.log("5. Aligning election phases to 2026 General Election (Election 77)...");
        await client.query(`
            UPDATE election_phases 
            SET election_id = 77
        `);

        await client.query(`
            UPDATE election_phases SET polling_date = '2026-04-19 07:00:00', status = 'COMPLETED' WHERE phase_number = 1;
            UPDATE election_phases SET polling_date = '2026-04-26 07:00:00', status = 'COMPLETED' WHERE phase_number = 2;
            UPDATE election_phases SET polling_date = '2026-05-07 07:00:00', status = 'ACTIVE' WHERE phase_number = 3;
            UPDATE election_phases SET polling_date = '2026-05-13 07:00:00', status = 'UPCOMING' WHERE phase_number = 4;
            UPDATE election_phases SET polling_date = '2026-05-20 07:00:00', status = 'UPCOMING' WHERE phase_number = 5;
            UPDATE election_phases SET polling_date = '2026-05-25 07:00:00', status = 'UPCOMING' WHERE phase_number = 6;
            UPDATE election_phases SET polling_date = '2026-06-01 07:00:00', status = 'UPCOMING' WHERE phase_number = 7;
        `);
        console.log("[PASS] Election phases synchronized with Election 77.");

        // 6. ENRICH GRIEVANCES FOR USER 3758
        console.log("6. Enriching citizen grievances...");
        const userGrievances = await client.query("SELECT id FROM grievances WHERE complainant_id = 3758");
        if (userGrievances.rows.length === 0) {
            await client.query(`
                INSERT INTO grievances (complainant_id, category, description, status, assigned_to, resolution, created_at)
                VALUES 
                (3758, 'Voter Registration & EPIC Card', 
                 'Request for expedited PVC physical card dispatch following online address update on digital e-EPIC portal.', 
                 'RESOLVED', 1, 
                 'District Election Officer verified Form 8 acknowledgment. Digital e-EPIC QR validated on national roll. Speed Post tracking number assigned.', 
                 NOW() - INTERVAL '3 days')
            `);
            console.log("[PASS] Seeded realistic grievance tracking record.");
        }

        // Commit all changes
        await client.query('COMMIT');
        console.log("\n=== COMPLETE DATA ENRICHMENT FINISHED SUCCESSFULLY! ===");

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("FATAL ERROR ENRICHING DATA:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
