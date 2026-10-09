/**
 * Official ECI SMS Gateway Service
 * Supports:
 * 1. Fast2SMS (Real SMS to Indian Mobile Handsets via FAST2SMS_API_KEY)
 * 2. Twilio (Real Global SMS via TWILIO_ACCOUNT_SID)
 * 3. Custom SMS Webhook (via SMS_WEBHOOK_URL)
 * 4. Zero-Cost Terminal Audit & In-App Virtual SMS Simulator Fallback
 */

const crypto = require("crypto");

/**
 * Dispatches an official 6-digit OTP code to a mobile phone number.
 * @param {string} phone - 10-digit Indian mobile number
 * @param {string} otpCode - 6-digit verification code
 * @param {object} options - Extra context (aadhaarMasked, electorName)
 * @returns {Promise<object>} Dispatch delivery report
 */
async function sendSmsOtp(phone, otpCode, options = {}) {
    const cleanPhone = phone.toString().replace(/\D/g, "").slice(-10);
    const maskedPhone = `+91-${cleanPhone.slice(0, 2)}******${cleanPhone.slice(-2)}`;
    const smsText = `Your Aadhaar verification OTP is ${otpCode} for ECI E-Voting registration. Valid for 10 minutes. Do not share this code. - Election Commission of India`;

    let provider = "VIRTUAL_SIMULATION";
    let realDeliverySuccess = false;
    let providerResponse = null;

    // 1. FAST2SMS Real SMS Gateway (India)
    if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== "") {
        try {
            console.log(`[SMS Gateway] Attempting real SMS delivery via Fast2SMS to +91-${cleanPhone}...`);
            const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    "authorization": process.env.FAST2SMS_API_KEY.trim(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    route: "otp",
                    variables_values: otpCode,
                    numbers: cleanPhone
                })
            });
            const data = await res.json();
            providerResponse = data;
            if (data.return === true || data.status_code === 200) {
                provider = "FAST2SMS_LIVE";
                realDeliverySuccess = true;
                console.log(`[SMS Gateway] Real SMS dispatched successfully via Fast2SMS to +91-${cleanPhone}!`);
            } else {
                console.warn(`[SMS Gateway] Fast2SMS notice: ${data.message || JSON.stringify(data)}. Falling back to simulation.`);
            }
        } catch (fErr) {
            console.error(`[SMS Gateway] Fast2SMS API call error: ${fErr.message}`);
        }
    }

    // 2. TWILIO SMS Gateway
    if (!realDeliverySuccess && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
            console.log(`[SMS Gateway] Attempting real SMS delivery via Twilio to +91${cleanPhone}...`);
            const authHeader = "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
            const params = new URLSearchParams();
            params.append("To", `+91${cleanPhone}`);
            params.append("From", process.env.TWILIO_PHONE_NUMBER);
            params.append("Body", smsText);

            const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });
            const tData = await res.json();
            providerResponse = tData;
            if (tData.sid) {
                provider = "TWILIO_LIVE";
                realDeliverySuccess = true;
                console.log(`[SMS Gateway] Real SMS dispatched successfully via Twilio (SID: ${tData.sid}) to +91${cleanPhone}!`);
            } else {
                console.warn(`[SMS Gateway] Twilio notice: ${tData.message || JSON.stringify(tData)}`);
            }
        } catch (tErr) {
            console.error(`[SMS Gateway] Twilio API call error: ${tErr.message}`);
        }
    }

    // 3. Custom SMS Webhook Gateway
    if (!realDeliverySuccess && process.env.SMS_WEBHOOK_URL && process.env.SMS_WEBHOOK_URL.trim() !== "") {
        try {
            console.log(`[SMS Gateway] Forwarding SMS payload to custom Webhook: ${process.env.SMS_WEBHOOK_URL}...`);
            const res = await fetch(process.env.SMS_WEBHOOK_URL.trim(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: cleanPhone,
                    otp: otpCode,
                    message: smsText,
                    sender: "VK-ECISMS",
                    timestamp: new Date().toISOString()
                })
            });
            if (res.ok) {
                provider = "WEBHOOK_GATEWAY";
                realDeliverySuccess = true;
                console.log(`[SMS Gateway] Dispatched via Webhook successfully!`);
            }
        } catch (wErr) {
            console.error(`[SMS Gateway] Webhook error: ${wErr.message}`);
        }
    }

    // Terminal Audit Logging
    console.log("==================================================");
    console.log(`[ECI SMS GATEWAY] Dispatch Target: ${maskedPhone}`);
    console.log(`[ECI SMS GATEWAY] Verification Code (OTP): ${otpCode}`);
    console.log(`[ECI SMS GATEWAY] Delivery Mode: ${provider} (Real SMS Sent: ${realDeliverySuccess})`);
    console.log(`[ECI SMS GATEWAY] Message: "${smsText}"`);
    console.log("==================================================");

    return {
        success: true,
        dispatched: true,
        realSmsSent: realDeliverySuccess,
        provider: provider,
        phone: cleanPhone,
        maskedPhone: maskedPhone,
        virtualSms: {
            senderId: "VK-ECISMS",
            phone: cleanPhone,
            maskedPhone: maskedPhone,
            otp: otpCode,
            validMinutes: 10,
            text: smsText,
            timestamp: new Date().toISOString(),
            realDelivery: realDeliverySuccess
        }
    };
}

module.exports = { sendSmsOtp };
