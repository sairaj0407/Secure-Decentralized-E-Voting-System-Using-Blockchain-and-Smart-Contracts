import { useState, useEffect, useMemo, useCallback } from "react";
import ECIEmblem from "./ECIEmblem";
import ECISymbolIcon from "./ECISymbolIcon";
import { IconRefresh } from "./GovIcons";
import { INDIA_STATE_VECTORS, INDIA_VIEWBOX } from "./indiaStateVectors";
import "./IndiaElectionMap.css";

const API_BASE = "http://localhost:5000/api";

// Official ECI Standard Colors for Political Parties
const PARTY_COLORS = {
  "BJP": "#ea580c",
  "Bharatiya Janata Party": "#ea580c",
  "NDA": "#ea580c",
  "INC": "#2563eb",
  "Indian National Congress": "#2563eb",
  "UPA": "#2563eb",
  "AAP": "#0284c7",
  "Aam Aadmi Party": "#0284c7",
  "AITC": "#16a34a",
  "All India Trinamool Congress": "#16a34a",
  "BSP": "#4f46e5",
  "Bahujan Samaj Party": "#4f46e5",
  "SS(UBT)": "#e11d48",
  "SP": "#dc2626",
  "DMK": "#d97706",
  "AIADMK": "#15803d",
  "BJD": "#0891b2",
  "BRS": "#db2777",
  "JD(U)": "#10b981",
  "JMM": "#65a30d",
  "TDP": "#ca8a04",
  "YSRCP": "#3b82f6",
  "CPI(M)": "#b91c1c",
  "Independent": "#64748b"
};

// Canonical State Code Aliases for cross-database alignment
const STATE_CODE_ALIASES = {
  "CG": "CT", "CT": "CG",
  "OD": "OR", "OR": "OD",
  "TS": "TG", "TG": "TS",
  "UK": "UT", "UT": "UK",
  "DH": "DN", "DN": "DH", "DD": "DN"
};

export default function IndiaElectionMap({ onSelectElection, initialSelectedState = "MH" }) {
  const [nationalMetrics, setNationalMetrics] = useState(null);
  const [statesData, setStatesData] = useState({});
  const [selectedStateCode, setSelectedStateCode] = useState(initialSelectedState);
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState("status"); // 'status' | 'party' | 'turnout'

  // Fetch National Atlas Data from Backend
  const fetchAtlasData = async () => {
    try {
      const res = await fetch(`${API_BASE}/elections/state-summary`);
      const data = await res.json();
      if (data.success) {
        setNationalMetrics(data.nationalMetrics);
        const mapObj = {};
        data.states.forEach(s => {
          mapObj[s.code] = s;
        });
        setStatesData(mapObj);
      }
    } catch (err) {
      console.error("Error fetching ECI Atlas Data:", err);
    }
  };

  useEffect(() => {
    fetchAtlasData();
  }, []);

  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const resolveState = useCallback((code) => {
    if (!code) return null;
    if (statesData[code]) return statesData[code];
    const alias = STATE_CODE_ALIASES[code];
    if (alias && statesData[alias]) return statesData[alias];
    return null;
  }, [statesData]);

  const selectedState = useMemo(() => {
    const fromApi = resolveState(selectedStateCode);
    const fromVectors = INDIA_STATE_VECTORS.find(v => v.code === selectedStateCode || v.code === STATE_CODE_ALIASES[selectedStateCode]);
    if (fromApi && fromVectors) {
      return { ...fromVectors, ...fromApi };
    }
    return fromApi || fromVectors || null;
  }, [resolveState, selectedStateCode]);

  // Official ECI Map Colors:
  // - Active: #16a34a (Green)
  // - Upcoming: #ea580c (Saffron)
  // - Results: #1e3a8a (Navy)
  // - Inactive: #e2e8f0 (Light Grey)
  const getStateFillColor = (code) => {
    const s = resolveState(code);
    if (viewMode === "status") {
      switch (s?.status) {
        case "ACTIVE":
          return "#16a34a"; // ECI Green
        case "UPCOMING":
          return "#ea580c"; // ECI Saffron
        case "RESULTS_PUBLISHED":
          return "#1e3a8a"; // ECI Navy
        default:
          return "#e2e8f0"; // Neutral Light Grey
      }
    } else if (viewMode === "party") {
      const party = s?.leadingParty || "Independent";
      return PARTY_COLORS[party] || "#64748b";
    } else if (viewMode === "turnout") {
      const turnout = s?.turnoutPercentage || 0;
      if (turnout === 0) return "#e2e8f0";
      if (turnout < 50) return "#93c5fd";
      if (turnout < 65) return "#3b82f6";
      if (turnout < 75) return "#1d4ed8";
      return "#1e3a8a";
    }
    return "#e2e8f0";
  };

  return (
    <div className="eci-map-container" onMouseMove={handleMouseMove}>
      {/* 1. CLEAN ECI HEADER */}
      <div className="eci-map-header">
        <div className="eci-map-title-row">
          <ECIEmblem size={38} />
          <div>
            <h2>भारत निर्वाचन आयोग | ELECTION COMMISSION OF INDIA</h2>
            <p>National Electoral Map & State Overview</p>
          </div>
        </div>

        {/* National Quick Stats */}
        <div className="eci-map-quick-stats">
          <div className="eci-quick-stat">
            <span>States / UTs</span>
            <strong>{nationalMetrics?.totalStatesUTs || 36}</strong>
          </div>
          <div className="eci-quick-stat">
            <span>Active Polling</span>
            <strong style={{ color: "#16a34a" }}>{nationalMetrics?.activeStatesCount || 0}</strong>
          </div>
          <div className="eci-quick-stat">
            <span>Total Elections</span>
            <strong>{nationalMetrics?.totalElectionsCount || 0}</strong>
          </div>
          <div className="eci-quick-stat">
            <span>Votes Recorded</span>
            <strong style={{ color: "#1e3a8a" }}>{nationalMetrics?.totalVotesRecorded || 0}</strong>
          </div>
          <button 
            onClick={fetchAtlasData} 
            className="eci-refresh-icon-btn"
            title="Refresh Map Data"
          >
            <IconRefresh size={14} />
          </button>
        </div>
      </div>

      {/* 2. NORMAL TOOLBAR (Clean buttons + dropdown) */}
      <div className="eci-map-toolbar">
        <div className="eci-view-tabs">
          <button
            className={`eci-tab-btn ${viewMode === "status" ? "active" : ""}`}
            onClick={() => setViewMode("status")}
          >
            Election Status
          </button>
          <button
            className={`eci-tab-btn ${viewMode === "party" ? "active" : ""}`}
            onClick={() => setViewMode("party")}
          >
            Party Leads
          </button>
          <button
            className={`eci-tab-btn ${viewMode === "turnout" ? "active" : ""}`}
            onClick={() => setViewMode("turnout")}
          >
            Voter Turnout
          </button>
        </div>

        <div className="eci-select-wrapper">
          <label>Select State / UT:</label>
          <select
            value={selectedStateCode}
            onChange={(e) => setSelectedStateCode(e.target.value)}
            className="eci-state-dropdown"
          >
            {INDIA_STATE_VECTORS.map(st => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code}) — {st.lsSeats} LS Seats
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. NORMAL TWO-COLUMN LAYOUT: MAP ON LEFT, STATE CARD ON RIGHT */}
      <div className="eci-map-body">
        
        {/* LEFT: NORMAL INDIA MAP */}
        <div className="eci-map-canvas-card">
          <svg
            className="eci-india-map-svg"
            viewBox={INDIA_VIEWBOX}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 36 States SVG Paths */}
            <g id="states-group">
              {INDIA_STATE_VECTORS.map((st) => {
                const isSelected = selectedStateCode === st.code || selectedStateCode === STATE_CODE_ALIASES[st.code];
                const resolved = resolveState(st.code);
                const fillColor = getStateFillColor(st.code);

                return (
                  <path
                    key={st.code}
                    d={st.path}
                    id={`state-${st.code}`}
                    className={`eci-state-area ${isSelected ? "selected" : ""}`}
                    fill={fillColor}
                    onClick={() => setSelectedStateCode(st.code)}
                    onMouseEnter={() => setHoveredState(resolved || { name: st.name, code: st.code, lsSeats: st.lsSeats, vsSeats: st.vsSeats, status: "NO_SCHEDULED_POLLS" })}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                );
              })}
            </g>

            {/* Clean State Code Labels */}
            <g id="labels-group" pointerEvents="none">
              {INDIA_STATE_VECTORS.map((st) => {
                const isSelected = selectedStateCode === st.code || selectedStateCode === STATE_CODE_ALIASES[st.code];
                const fillColor = getStateFillColor(st.code);
                const isDark = fillColor === "#1e3a8a" || fillColor === "#16a34a" || fillColor === "#4f46e5" || fillColor === "#b91c1c";

                return (
                  <text
                    key={`lbl-${st.code}`}
                    x={st.cx}
                    y={st.cy}
                    className="eci-state-code"
                    fill={isSelected ? "#ea580c" : (isDark ? "#ffffff" : "#1e293b")}
                    style={{
                      paintOrder: "stroke fill",
                      stroke: isDark ? "rgba(0,0,0,0.5)" : "#ffffff",
                      strokeWidth: "2px",
                      fontWeight: "700",
                      fontSize: "8.5px",
                      textAnchor: "middle"
                    }}
                  >
                    {st.code}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* Simple Clean Legend */}
          <div className="eci-normal-legend">
            {viewMode === "status" && (
              <>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#16a34a" }}></span>
                  <span>Active Polling</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#ea580c" }}></span>
                  <span>Scheduled Polls</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#1e3a8a" }}></span>
                  <span>Results Declared</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#e2e8f0", border: "1px solid #cbd5e1" }}></span>
                  <span>No Scheduled Polls</span>
                </div>
              </>
            )}

            {viewMode === "party" && (
              <>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#ea580c" }}></span>
                  <span>BJP / NDA</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#2563eb" }}></span>
                  <span>INC / UPA</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#0284c7" }}></span>
                  <span>AAP</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#16a34a" }}></span>
                  <span>AITC</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#d97706" }}></span>
                  <span>DMK</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#64748b" }}></span>
                  <span>Others / Ind</span>
                </div>
              </>
            )}

            {viewMode === "turnout" && (
              <>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#93c5fd" }}></span>
                  <span>&lt; 50%</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#3b82f6" }}></span>
                  <span>50% - 65%</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#1d4ed8" }}></span>
                  <span>65% - 75%</span>
                </div>
                <div className="eci-legend-item">
                  <span className="eci-color-dot" style={{ background: "#1e3a8a" }}></span>
                  <span>&gt; 75%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: NORMAL STATE ELECTORAL DOSSIER CARD */}
        <div className="eci-state-dossier-card">
          {selectedState ? (
            <div className="eci-state-content">
              {/* Header */}
              <div className="eci-state-header">
                <div>
                  <h3>{selectedState.name}</h3>
                  <span>Capital: <strong>{selectedState.capital}</strong> • Region: <strong>{selectedState.region}</strong></span>
                </div>
                <span className={`eci-status-tag ${selectedState.status?.toLowerCase() || "no_scheduled_polls"}`}>
                  {selectedState.status ? selectedState.status.replace(/_/g, " ") : "NO SCHEDULED POLLS"}
                </span>
              </div>

              {/* Key Stats Grid */}
              <div className="eci-stats-grid">
                <div className="eci-stat-box">
                  <small>Lok Sabha Seats</small>
                  <strong>{selectedState.lsSeats} Seats</strong>
                </div>
                <div className="eci-stat-box">
                  <small>Assembly Seats</small>
                  <strong>{selectedState.vsSeats > 0 ? `${selectedState.vsSeats} Seats` : "N/A (UT)"}</strong>
                </div>
                <div className="eci-stat-box">
                  <small>Registered Voters</small>
                  <strong>{selectedState.totalElectors?.toLocaleString() || "0"}</strong>
                </div>
                <div className="eci-stat-box">
                  <small>Votes Cast</small>
                  <strong>{selectedState.votesPolled || "0"}</strong>
                </div>
              </div>

              {/* Turnout Bar */}
              <div className="eci-turnout-section">
                <div className="eci-turnout-labels">
                  <span>Voter Turnout:</span>
                  <strong>{selectedState.turnoutPercentage || 0}%</strong>
                </div>
                <div className="eci-turnout-bg">
                  <div 
                    className="eci-turnout-fill"
                    style={{ width: `${Math.min(100, selectedState.turnoutPercentage || 0)}%` }}
                  ></div>
                </div>
              </div>

              {/* Leading Party info */}
              {selectedState.leadingParty && (
                <div className="eci-leading-party">
                  {selectedState.leadingCandidate?.symbol ? (
                    <ECISymbolIcon symbol={selectedState.leadingCandidate.symbol} size={36} />
                  ) : (
                    <div style={{ width: "36px", height: "36px", borderRadius: "4px", background: PARTY_COLORS[selectedState.leadingParty] || "#1e3a8a", display: "grid", placeItems: "center", color: "white", fontWeight: "bold", fontSize: "11px" }}>
                      {selectedState.leadingParty.substring(0, 3)}
                    </div>
                  )}
                  <div>
                    <small>Leading Party</small>
                    <strong>{selectedState.leadingParty}</strong>
                    {selectedState.leadingCandidate && (
                      <span>Candidate: {selectedState.leadingCandidate.name} ({selectedState.leadingCandidate.votes} votes)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Scheduled Elections */}
              <div className="eci-elections-block">
                <h4>Elections in {selectedState.name} ({selectedState.elections?.length || 0})</h4>
                {selectedState.elections && selectedState.elections.length > 0 ? (
                  <div className="eci-elections-list">
                    {selectedState.elections.map((el) => (
                      <div key={el.id} className="eci-election-row">
                        <div>
                          <strong>{el.title}</strong>
                          <span>{el.code} • {el.status}</span>
                        </div>
                        {onSelectElection && (
                          <button
                            className="eci-view-btn"
                            onClick={() => onSelectElection(el.id)}
                          >
                            View Election →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="eci-no-elections">No active elections currently scheduled in {selectedState.name}.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="eci-state-empty">
              <ECIEmblem size={44} />
              <h4>Select a State or Union Territory</h4>
              <p>Click on any state in the map to see details.</p>
            </div>
          )}
        </div>
      </div>

      {/* SIMPLE FLOATING TOOLTIP */}
      {hoveredState && (
        <div
          className="eci-map-tooltip"
          style={{ top: `${tooltipPos.y}px`, left: `${tooltipPos.x}px` }}
        >
          <strong>{hoveredState.name} ({hoveredState.code})</strong>
          <div className="eci-tooltip-row">
            <span>Status:</span>
            <span style={{ color: hoveredState.status === "ACTIVE" ? "#86efac" : (hoveredState.status === "UPCOMING" ? "#fdba74" : "#ffffff") }}>
              {hoveredState.status?.replace(/_/g, " ") || "No Polls"}
            </span>
          </div>
          <div className="eci-tooltip-row">
            <span>LS Seats:</span>
            <span>{hoveredState.lsSeats || 1}</span>
          </div>
          <div className="eci-tooltip-row">
            <span>Turnout:</span>
            <span>{hoveredState.turnoutPercentage || 0}%</span>
          </div>
          {hoveredState.leadingParty && (
            <div className="eci-tooltip-row">
              <span>Lead:</span>
              <span style={{ color: PARTY_COLORS[hoveredState.leadingParty] || "#ffffff" }}>
                {hoveredState.leadingParty}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
