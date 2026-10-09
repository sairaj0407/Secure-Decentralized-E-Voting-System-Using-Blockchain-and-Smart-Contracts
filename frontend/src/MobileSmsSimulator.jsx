import { useState } from "react";
import ECIEmblem from "./ECIEmblem";
import { IconCheck, IconCopy } from "./GovIcons";

/**
 * Official ECI Mobile SMS Dispatch Notification & Smartphone Simulator
 * Displays incoming SMS payload dispatched by backend SMS Gateway.
 * Zero external cost, 100% compliant, zero emojis.
 */
export default function MobileSmsSimulator({ virtualSms, onAutoFill, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const [dismissedKey, setDismissedKey] = useState(null);

  const currentKey = virtualSms ? `${virtualSms.phone || ""}_${virtualSms.otp || ""}_${virtualSms.timestamp || ""}` : null;
  const isVisible = Boolean(virtualSms && currentKey !== dismissedKey);

  if (!virtualSms || !isVisible) return null;

  const handleCopy = () => {
    if (virtualSms.otp) {
      navigator.clipboard.writeText(virtualSms.otp).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onAutoFill) {
        onAutoFill(virtualSms.otp);
      }
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "360px",
      background: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
      border: "1px solid #cbd5e1",
      borderLeft: "6px solid #ea580c",
      zIndex: 99999,
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
      animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      {/* Top Status Header */}
      <div style={{
        background: "#0f172a",
        color: "#f8fafc",
        padding: "8px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ECIEmblem size={18} />
          <strong style={{ letterSpacing: "0.5px" }}>ECI SECURE SMS GATEWAY</strong>
        </div>
        <button
          onClick={() => {
            if (currentKey) setDismissedKey(currentKey);
            if (onDismiss) onDismiss();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            fontSize: "16px",
            cursor: "pointer",
            padding: 0,
            lineHeight: 1
          }}
          title="Dismiss Notification"
        >
          &times;
        </button>
      </div>

      {/* Body Content */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase" }}>
              FROM: {virtualSms.senderId || "VK-ECISMS"}
            </span>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              To: {virtualSms.maskedPhone || `+91-${virtualSms.phone || "Registered Mobile"}`}
            </div>
          </div>
          <span style={{
            fontSize: "10px",
            background: virtualSms.realDelivery ? "#dcfce7" : "#eff6ff",
            color: virtualSms.realDelivery ? "#166534" : "#1e40af",
            padding: "2px 6px",
            borderRadius: "4px",
            fontWeight: "700"
          }}>
            {virtualSms.realDelivery ? "LIVE SMS DISPATCHED" : "SMS GENERATED"}
          </span>
        </div>

        {/* Message Bubble */}
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "10px 12px",
          fontSize: "12px",
          color: "#1e293b",
          lineHeight: "1.45",
          marginBottom: "12px"
        }}>
          {virtualSms.text || (
            <>
              Your Aadhaar verification OTP is <strong style={{ color: "#ea580c", fontSize: "14px" }}>{virtualSms.otp}</strong> for ECI E-Voting registration. Valid for 10 minutes. Do not share this code. - Election Commission of India
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: "7px 12px",
              background: copied ? "#16a34a" : "#ea580c",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              fontSize: "11.5px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "background 0.15s ease"
            }}
          >
            {copied ? (
              <>
                <IconCheck size={14} color="#ffffff" />
                <span>Auto-Filled OTP!</span>
              </>
            ) : (
              <>
                <IconCopy size={13} color="#ffffff" />
                <span>Auto-Fill OTP ({virtualSms.otp})</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setDismissedKey(currentKey);
              if (onDismiss) onDismiss();
            }}
            style={{
              padding: "7px 12px",
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
              fontSize: "11.5px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>

        <div style={{ marginTop: "8px", fontSize: "10px", color: "#64748b", textAlign: "center" }}>
          Official statutory transmission pursuant to ECI Voter Authentication Standards
        </div>
      </div>
    </div>
  );
}
