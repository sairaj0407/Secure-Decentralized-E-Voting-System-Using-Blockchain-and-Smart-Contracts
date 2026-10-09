import eciLogo from "./assets/eci_logo.svg";

/**
 * Official Election Commission of India (ECI) Vector Insignia & Seal
 * Renders the authentic official ECI vector asset (eci_logo.svg):
 * - Dynamic tricolor geometry (Saffron #F58220, White #FFFFFF, India Green #00A651, Cyan nodes #8EBBD0)
 * - Official bilingual circular typography: "भारत निर्वाचन आयोग" and "ELECTION COMMISSION OF INDIA"
 * - High-contrast seal variant for perfect legibility across dark headers and light cards.
 */
export default function ECIEmblem({ size = 40, variant = "seal", className = "", style = {} }) {
  if (variant === "tricolor-strip") {
    return (
      <div
        style={{
          height: "4px",
          width: "100%",
          background: "linear-gradient(to right, #ea580c 0%, #ea580c 33.3%, #ffffff 33.3%, #ffffff 66.6%, #15803d 66.6%, #15803d 100%)",
          ...style
        }}
      />
    );
  }

  // Raw authentic ECI Vector Graphic image
  const rawLogo = (
    <img
      src={eciLogo}
      width={size}
      height={size}
      alt="Election Commission of India (भारत निर्वाचन आयोग)"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        objectFit: "contain",
        flexShrink: 0,
        ...style
      }}
    />
  );

  // If raw or transparent variant requested, return directly
  if (variant === "raw" || variant === "transparent") {
    return rawLogo;
  }

  // Default "seal" or "badge" variant: High-contrast white circular roundel with subtle ring
  return (
    <div
      className={`eci-emblem-badge ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(226, 232, 240, 0.8)",
        flexShrink: 0,
        padding: `${Math.max(2, Math.round(size * 0.08))}px`,
        boxSizing: "border-box",
        ...style
      }}
      title="Election Commission of India (भारत निर्वाचन आयोग)"
    >
      <img
        src={eciLogo}
        alt="Election Commission of India"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block"
        }}
      />
    </div>
  );
}
