import ECIEmblem from "./ECIEmblem";
import { IconShield, IconPhone } from "./GovIcons";

/**
 * Official Election Commission of India (ECI) Master Common Footer
 * Single clean government-style statutory footer across the entire application.
 * Fully GIGW 3.0 compliant, high-contrast, zero emojis, clean government typography.
 */
export default function GovFooter() {
  return (
    <footer className="gov-official-footer no-print" style={{ width: "100%", marginTop: "auto" }}>
      {/* Tricolor National Accent Line */}
      <div
        style={{
          height: "3px",
          width: "100%",
          background: "linear-gradient(90deg, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)"
        }}
      />

      {/* Single Clean Government Statutory Footer Content */}
      <div className="gov-compact-footer-body">
        {/* Left: Emblem & Institutional Title */}
        <div className="gov-compact-left">
          <ECIEmblem size={24} />
          <div>
            <div className="gov-compact-title-main">
              <span>भारत निर्वाचन आयोग</span>
              <span className="gov-compact-sep">|</span>
              <span>ELECTION COMMISSION OF INDIA</span>
            </div>
            <div className="gov-compact-subtitle">
              National Secure Decentralized E-Voting Management System (SDEMS)
            </div>
          </div>
        </div>

        {/* Center: Helpline & Official Portal Link */}
        <div className="gov-compact-center">
          <div className="gov-compact-helpline">
            <IconPhone size={13} />
            <span>Voter Helpline: <strong>1950</strong> (Toll-Free 24x7)</span>
          </div>
          <span className="gov-compact-sep">•</span>
          <a
            href="https://voters.eci.gov.in"
            target="_blank"
            rel="noreferrer"
            className="gov-compact-link"
          >
            voters.eci.gov.in
          </a>
          <span className="gov-compact-sep">•</span>
          <span className="gov-compact-hq">Nirvachan Sadan, New Delhi - 110001</span>
        </div>

        {/* Right: Security, Verifiability & Compliance */}
        <div className="gov-compact-right">
          <div className="gov-compact-badge">
            <IconShield size={12} />
            <span>E2E Blockchain Verifiable</span>
          </div>
          <span className="gov-compact-sep">•</span>
          <span>GIGW 3.0 Certified</span>
          <span className="gov-compact-sep">•</span>
          <span>Section 128 RPA 1951</span>
          <span className="gov-compact-sep">•</span>
          <span>&copy; 2026 ECI</span>
        </div>
      </div>
    </footer>
  );
}
