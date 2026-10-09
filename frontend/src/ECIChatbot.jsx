import { useState, useEffect, useRef } from "react";
import "./ECIChatbot.css";
import ECIEmblem from "./ECIEmblem";
import { 
  IconMic, 
  IconSpeaker, 
  IconSend, 
  IconClose, 
  IconMaximize, 
  IconMinimize, 
  IconCopy, 
  IconCheck, 
  IconShield 
} from "./GovIcons";

const API_BASE = "http://localhost:5000/api";

let messageCounter = 0;
function createMessageId(prefix) {
  messageCounter += 1;
  return `${prefix}-${Date.now()}-${messageCounter}`;
}

const LANGUAGES = [
  { code: "en", label: "English", native: "English", speechLang: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", speechLang: "hi-IN" },
  { code: "mr", label: "Marathi", native: "मराठी", speechLang: "mr-IN" },
  { code: "bn", label: "Bengali", native: "বাংলা", speechLang: "bn-IN" },
  { code: "ta", label: "Tamil", native: "தமிழ்", speechLang: "ta-IN" },
  { code: "te", label: "Telugu", native: "తెలుగు", speechLang: "te-IN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", speechLang: "gu-IN" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", speechLang: "kn-IN" }
];

const FORMAL_INITIAL_MESSAGES = {
  en: `### Election Commission of India | भारत निर्वाचन आयोग
**ECI Chunav Mitra — Your Digital Election Assistant**

Namaste! I am Chunav Mitra, your friendly election assistant from the Election Commission of India. How can I help you today?

You can ask me about:
- **How to Vote**: Step-by-step guide to cast your vote easily
- **Download e-EPIC**: How to download your official digital Voter ID card
- **New Voter Registration**: Simple steps to fill Form 6
- **Verify Voting Receipt**: How to check your digital VVPAT slip
- **Active Elections**: Current elections, candidates, and party symbols
- **ECI Voter Helpline**: Call 1950 (Toll-Free 24x7) for any assistance

Click any topic below or type your question in simple words.`,

  hi: `### भारत निर्वाचन आयोग | ELECTION COMMISSION OF INDIA
**ईसीआई चुनाव मित्र — आपका डिजिटल चुनावी सहायक**

नमस्ते! मैं चुनाव मित्र हूँ, भारत निर्वाचन आयोग का आपका डिजिटल सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?

आप मुझसे पूछ सकते हैं:
- **वोट कैसे डालें**: मतदान करने के 3 आसान चरण
- **ई-एपिक डाउनलोड करें**: अपना आधिकारिक डिजिटल वोटर कार्ड प्राप्त करें
- **नया मतदाता पंजीकरण**: Form 6 भरने की आसान प्रक्रिया
- **मतदान रसीद जांचें**: अपनी डिजिटल VVPAT पर्ची का सत्यापन
- **सक्रिय चुनाव**: चालू चुनाव, प्रत्याशी और उनके चुनाव चिन्ह
- **टोल-फ्री हेल्पलाइन**: 1950 पर 24 घंटे किसी भी सहायता के लिए संपर्क करें

नीचे दिए गए किसी भी विकल्प पर क्लिक करें या अपना प्रश्न लिखें।`,

  mr: `### भारत निवडणूक आयोग | ELECTION COMMISSION OF INDIA
**ईसीआय चुनाव मित्र — आपला डिजिटल निवडणूक सहाय्यक**

नमस्कार! मी चुनाव मित्र आहे, भारत निवडणूक आयोगाचा आपला डिजिटल सहाय्यक. मी आपल्याला कशी मदत करू शकतो?

आपण विचारू शकता:
- **मतदान कसे करावे**: मतदानाचे ३ सोपे टप्पे
- **ई-एपिक डाउनलोड करा**: आपले अधिकृत डिजिटल मतदार ओळखपत्र मिळवा
- **नवीन मतदार नोंदणी**: Form 6 द्वारे नाव नोंदणी प्रक्रिया
- **मतदान पावती तपासा**: आपली डिजिटल VVPAT पावती पडताळणी
- **सक्रिय निवडणुका**: चालू निवडणुका, उमेदवार व पक्षचिन्हे
- **हेल्पलाइन १९५०**: २४x७ विनामूल्य मदतीसाठी संपर्क साधा

खालील कोणत्याही पर्यायावर क्लिक करा किंवा आपला प्रश्न लिहा.`,

  bn: `### ভারতের নির্বাচন কমিশন | ELECTION COMMISSION OF INDIA
**চুনাভ মিত্র — আপনার ডিজিটাল নির্বাচনী সহায়ক**

নমস্কার! আমি চুনাভ মিত্র, ভারতের নির্বাচন কমিশনের আপনার সহায়ক। কীভাবে ভোট দেবেন, ভোটার কার্ড (ই-এপিক) ডাউনলোড করবেন, ফর্ম ৬ পূরণ করবেন বা ভিভিপ্যাট যাচাই করবেন—সহজে জানতে প্রশ্ন করুন। টোল-ফ্রি হেল্পলাইন: ১৯৫০।`,

  ta: `### இந்திய தேர்தல் ஆணையம் | ELECTION COMMISSION OF INDIA
**சுனாவ் மித்ரா — உங்கள் டிஜிட்டல் தேர்தல் உதவியாளர்**

வணக்கம்! நான் சுனாவ் மித்ரா. வாக்களிப்பது எப்படி, வாக்காளர் அட்டை (e-EPIC) பதிவிறக்குவது, படிவம் 6 பதிவு மற்றும் வாக்கு ரசீது சரிபார்ப்பு குறித்து எளிய தகவல்களைப் பெறலாம். உதவி எண்: 1950.`,

  te: `### భారత ఎన్నికల సంఘం | ELECTION COMMISSION OF INDIA
**చునావ్ మిత్ర — మీ డిజిటల్ ఎన్నికల సహాయకుడు**

నమస్కారం! నేను చునావ్ మిత్రను. ఓటు వేసే విధానం, e-EPIC ఓటరు కార్డు డౌన్‌లోడ్, ఫారం 6 నమోదు మరియు ఓటు రశీదు ధృవీకరణపై సులభమైన సమాచారం పొందవచ్చు. టోల్ ఫ్రీ హెల్ప్‌లైన్: 1950.`,

  gu: `### ભારતના ચૂંટણી પંચ | ELECTION COMMISSION OF INDIA
**ચુનાવ મિત્ર — આપનો ડિજિટલ ચૂંટણી સહાયક**

નમસ્તે! હું ચુનાવ મિત્ર છું. મતદાન કેવી રીતે કરવું, e-EPIC ડાઉનલોડ, ફોર્મ 6 નવી મતદાર નોંધણી અને મતદાન રસીદ ચકાસણી માટે સરળતાથી પૂછી શકો છો. હેલ્પલાઇન: 1950.`,

  kn: `### ಭಾರತೀಯ ಚುನಾವಣಾ ಆಯೋಗ | ELECTION COMMISSION OF INDIA
**ಚುನಾವ್ ಮಿತ್ರ — ನಿಮ್ಮ ಡಿಜिटल ಚುನಾವಣಾ ಸಹಾಯಕ**

ನಮಸ್ಕಾರ! ನಾನು ಚುನಾವಣಾ ಆಯೋಗದ ಚುನಾವ್ ಮಿತ್ರ. ಮತದಾನ ಮಾಡುವ ವಿಧಾನ, e-EPIC ಡೌನ್‌ಲೋಡ್, ಫಾರ್ಮ್ 6 ನೋಂದಣಿ ಮತ್ತು ಮತ ರಶೀದಿ ಪರಿಶೀಲನೆಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ. ಟೋಲ್-ಫ್ರೀ ಸಹಾಯವಾಣಿ: 1950.`
};

// Elector / Citizen Official Badge Vector SVG
function ElectorBadgeSvg({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.5" />
      <circle cx="8" cy="11" r="3" fill="#ffffff" />
      <path d="M4 17 C4 14.5 6 14.5 8 14.5 C10 14.5 12 14.5 12 17" fill="#ffffff" />
      <line x1="14" y1="9" x2="19" y2="9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="12" x2="19" y2="12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="15" x2="18" y2="15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ECIChatbot({ user, election, voterReceipt, onNavigateTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [language, setLanguage] = useState("en");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const copyMessageText = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const [messages, setMessages] = useState([
    {
      id: "init-gov-1",
      sender: "authority",
      text: FORMAL_INITIAL_MESSAGES.en,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      suggestedActions: [
        { label: "How to Vote", query: "How to vote in 3 easy steps?" },
        { label: "Download e-EPIC", query: "How do I download my e-EPIC voter card?" },
        { label: "New Voter Form 6", query: "How to register as a new voter using Form 6?" },
        { label: "Verify Vote Receipt", query: "How do I verify my voting receipt code?" },
        { label: "Active Elections", query: "Show active elections open for voting" },
        { label: "Helpline 1950", query: "What is Election Helpline 1950?" },
        { label: "Admin Login", query: "How to login as an election official or admin?" },
        { label: "Code of Conduct", query: "What is Model Code of Conduct and Aachar Sanhita?" }
      ]
    }
  ]);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (messages.length === 1 && messages[0].sender === "authority") {
      setMessages([
        {
          ...messages[0],
          text: FORMAL_INITIAL_MESSAGES[newLang] || FORMAL_INITIAL_MESSAGES.en
        }
      ]);
    }
  };

  // Speech Recognition (Speech-to-Text)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech dictation is not supported in this browser. Please input your query via keyboard.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
      recognition.lang = currentLangObj.speechLang;
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
    }
  };

  // Audio Readout (Text-to-Speech)
  const speakMessage = (msgId, text) => {
    if (!window.speechSynthesis) {
      alert("Audio readout service is not supported in this browser environment.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*`|>-]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/सत्यमेव जयते/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
    utterance.lang = currentLangObj.speechLang;
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Dispatch Query
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: createMessageId("elector"),
      sender: "elector",
      text: query,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("voterToken");
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: query,
          language: language,
          electionId: election?.id || null,
          receiptCode: voterReceipt?.receipt_code || null,
          userId: user?.id || null,
          voterId: user?.voter_id || null
        })
      });

      const data = await res.json();

      if (data.success) {
        const botMsg = {
          id: createMessageId("authority"),
          sender: "authority",
          text: data.response,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
          action: data.action || null,
          suggestedActions: data.suggestedActions || null
        };
        setMessages((prev) => [...prev, botMsg]);

        if (isListening) {
          speakMessage(botMsg.id, botMsg.text);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: "authority-err-" + Date.now(),
            sender: "authority",
            text: "[SYSTEM ALERT]: " + (data.message || "An administrative query error occurred."),
            timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
          }
        ]);
      }
    } catch (err) {
      console.error("Administrative Gateway Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "authority-err-" + Date.now(),
          sender: "authority",
          text: "[GATEWAY ALERT]: Unable to connect to the ECI Digital Portal backend service (Port 5000).",
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Structured Markdown to JSX Parser (Supports Government Tables, Headings, Lists, Quotes)
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const lines = content.split("\n");
    const elements = [];
    let tableRows = [];
    let inTable = false;

    const flushTable = (keyIndex) => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => /^-+$/.test(c.trim())));

        elements.push(
          <table key={`tbl-${keyIndex}`} className="eci-gov-table">
            <thead>
              <tr>
                {headerRow.map((col, cIdx) => (
                  <th key={cIdx}>{formatInlineStyles(col.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((col, cIdx) => (
                    <td key={cIdx}>{formatInlineStyles(col.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check for Markdown Table Rows
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        inTable = true;
        const cells = trimmed
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(index);
      }

      if (trimmed.startsWith("### ")) {
        elements.push(<h3 key={index}>{formatInlineStyles(trimmed.replace("### ", ""))}</h3>);
      } else if (trimmed.startsWith("#### ")) {
        elements.push(<h4 key={index}>{formatInlineStyles(trimmed.replace("#### ", ""))}</h4>);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.replace(/^[-•*]\s+/, "");
        elements.push(
          <div key={index} style={{ display: "flex", gap: "8px", margin: "3px 0", paddingLeft: "4px" }}>
            <span style={{ color: "#1e3a8a", fontWeight: "bold", fontSize: "14px", lineHeight: "1.2" }}>•</span>
            <div>{formatInlineStyles(itemText)}</div>
          </div>
        );
      } else if (/^\d+\.\s+/.test(trimmed)) {
        elements.push(
          <div key={index} style={{ margin: "4px 0", paddingLeft: "4px" }}>
            {formatInlineStyles(trimmed)}
          </div>
        );
      } else if (trimmed.startsWith("> ")) {
        elements.push(<blockquote key={index}>{formatInlineStyles(trimmed.replace("> ", ""))}</blockquote>);
      } else if (trimmed === "") {
        elements.push(<div key={index} style={{ height: "4px" }} />);
      } else {
        elements.push(<p key={index}>{formatInlineStyles(trimmed)}</p>);
      }
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  const formatInlineStyles = (text) => {
    const parts = text.split(/(\*{2}.*?\*{2}|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Official Floating Trigger Badge */}
      {!isOpen && (
        <div
          className="eci-gov-launcher"
          onClick={() => setIsOpen(true)}
          title="Open Election Commission of India Statutory AI Helpdesk"
        >
          <div className="eci-gov-emblem-badge">
            <ECIEmblem size={26} />
            <span className="eci-gov-online-dot" />
          </div>
          <div className="eci-gov-launcher-text">
            <span className="eci-gov-launcher-title">ECI Chunav Mitra</span>
            <span className="eci-gov-launcher-subtitle">भारत निर्वाचन आयोग • AI Helpdesk</span>
          </div>
        </div>
      )}

      {/* Official Government Chat Interface */}
      {isOpen && (
        <div className={`eci-gov-window ${isMaximized ? "maximized" : ""}`}>
          {/* Official Government Header */}
          <div className="eci-gov-header">
            <div className="eci-gov-header-top">
              <div className="eci-gov-brand">
                <div className="eci-gov-emblem-large">
                  <ECIEmblem size={34} />
                </div>
                <div className="eci-gov-brand-details">
                  <h2>
                    ECI Chunav Mitra (चुनाव मित्र)
                    <span className="eci-gov-security-tag">OFFICIAL ASSISTANT</span>
                  </h2>
                  <p>Election Commission of India • Citizen Electoral Helpdesk</p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="eci-gov-header-controls">
                <button
                  type="button"
                  className="eci-gov-btn-tool"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? "Restore Default Dimension" : "Maximize to Professional Widescreen View"}
                >
                  {isMaximized ? <IconMinimize size={14} /> : <IconMaximize size={14} />}
                </button>
                <button
                  type="button"
                  className="eci-gov-btn-tool"
                  onClick={() => setIsOpen(false)}
                  title="Close Chunav Mitra"
                >
                  <IconClose size={14} />
                </button>
              </div>
            </div>

            {/* Language Selection & Statutory Jurisdiction */}
            <div className="eci-gov-subbar">
              <div className="eci-gov-subbar-left">
                <IconShield size={12} color="#ea580c" />
                <span>ELECTION COMMISSION OF INDIA • CITIZEN HELPDESK</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "600" }}>Language / भाषा:</span>
                <select
                  className="eci-gov-lang-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Audit Message Stream */}
          <div className="eci-gov-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`eci-gov-msg ${msg.sender}`}>
                <div className="eci-gov-avatar">
                  {msg.sender === "authority" ? <ECIEmblem size={22} /> : <ElectorBadgeSvg size={20} />}
                </div>
                <div className="eci-gov-content">
                  {renderFormattedContent(msg.text)}

                  {/* Official Navigation Triggers */}
                  {msg.action === "NAVIGATE_LOGIN_VOTER" && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        className="eci-gov-action-btn"
                        onClick={() => onNavigateTab && onNavigateTab("login-voter")}
                      >
                        Open National Elector Portal (Voter Login)
                      </button>
                    </div>
                  )}

                  {msg.action === "NAVIGATE_LOGIN_ADMIN" && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        className="eci-gov-action-btn"
                        onClick={() => onNavigateTab && onNavigateTab("login-admin")}
                      >
                        Open Statutory Authority Console (Admin Login)
                      </button>
                    </div>
                  )}

                  {msg.action === "NAVIGATE_ELECTIONS" && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        className="eci-gov-action-btn"
                        onClick={() => onNavigateTab && onNavigateTab("current")}
                      >
                        View Active Elections Gazette
                      </button>
                    </div>
                  )}

                  {msg.action === "VERIFY_RECEIPT" && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        className="eci-gov-action-btn"
                        onClick={() => onNavigateTab && onNavigateTab("receipt")}
                      >
                        View Form 49MA VVPAT Audit Slip
                      </button>
                    </div>
                  )}

                  {/* Inline Suggested Questions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="eci-gov-inline-suggestions">
                      {msg.suggestedActions.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          className="eci-gov-inline-suggestion-btn"
                          onClick={() => handleSendMessage(s.query)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="eci-gov-msg-footer">
                    <span>
                      {msg.sender === "authority" ? "ECI OFFICIAL RECORD" : "ELECTOR QUERY"} • {msg.timestamp}
                    </span>
                    {msg.sender === "authority" && (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="eci-gov-copy-btn"
                          onClick={() => copyMessageText(msg.id, msg.text)}
                          title="Copy Statutory Response"
                        >
                          {copiedMsgId === msg.id ? <IconCheck size={11} color="#15803d" /> : <IconCopy size={11} />}
                          <span>{copiedMsgId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          className={`eci-gov-readout-btn ${speakingMsgId === msg.id ? "speaking" : ""}`}
                          onClick={() => speakMessage(msg.id, msg.text)}
                          title="Official Voice Readout Service"
                        >
                          <IconSpeaker size={11} />
                          <span>{speakingMsgId === msg.id ? "Stop Readout" : "Audio Readout"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="eci-gov-msg authority">
                <div className="eci-gov-avatar">
                  <ECIEmblem size={22} />
                </div>
                <div className="eci-gov-content" style={{ padding: "8px 14px", fontStyle: "italic", color: "#64748b" }}>
                  Thinking and checking official records...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Listening State Banner */}
          {isListening && (
            <div
              style={{
                background: "#fef2f2",
                borderTop: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "11.5px",
                fontWeight: "700",
                padding: "6px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>DICTATION ACTIVE: Speak in your designated language...</span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
                onClick={() => setIsListening(false)}
              >
                Abort
              </button>
            </div>
          )}

          {/* Friendly Quick-Action Chips */}
          <div className="eci-gov-directives-bar">
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("How to vote in 3 easy steps?")}
            >
              How to Vote
            </button>
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("How do I download my e-EPIC voter card?")}
            >
              Download e-EPIC
            </button>
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("How to register as a new voter using Form 6?")}
            >
              New Voter Form 6
            </button>
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("How do I verify my voting receipt code?")}
            >
              Verify Vote Receipt
            </button>
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("Show active elections open for voting")}
            >
              Active Elections
            </button>
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("What is Election Helpline 1950?")}
            >
              Helpline 1950
            </button>
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("How to login as an election official or admin?")}
            >
              Admin Login
            </button>
            <button
              type="button"
              className="eci-gov-directive-btn"
              onClick={() => handleSendMessage("What is Model Code of Conduct and Aachar Sanhita?")}
            >
              Code of Conduct
            </button>
          </div>

          {/* Input Console */}
          <div className="eci-gov-footer">
            <button
              type="button"
              className={`eci-gov-mic-btn ${isListening ? "listening" : ""}`}
              onClick={toggleSpeechRecognition}
              title={isListening ? "Dictating... Click to abort" : "Speak via Audio Dictation"}
            >
              <IconMic size={18} color={isListening ? "#dc2626" : "#475569"} />
            </button>
            <div className="eci-gov-input-wrap">
              <input
                type="text"
                className="eci-gov-input"
                placeholder="Ask a question (e.g., How to vote, download ID)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="eci-gov-send-btn"
              disabled={!input.trim() || isLoading}
              onClick={() => handleSendMessage()}
              title="Send Inquiry"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <IconSend size={14} />
              <span>Send</span>
            </button>
          </div>

          {/* Institutional Citizen Notice */}
          <div className="eci-gov-notice-strip">
            ECI National Voter Helpline: 1950 (Toll-Free 24x7) • Secrecy of Vote is Guaranteed • voters.eci.gov.in
          </div>
        </div>
      )}
    </>
  );
}
