import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ethers } from "ethers";
import ECIChatbot from "./ECIChatbot";
import ECISymbolIcon from "./ECISymbolIcon";
import ECIEmblem from "./ECIEmblem";
import GovFooter from "./GovFooter";
import { IconPrint, IconDownload, IconRefresh, IconShield, IconCheck, IconReceipt, IconBallot, IconCopy, IconAlert, IconLock } from "./GovIcons";
import MobileSmsSimulator from "./MobileSmsSimulator";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const IndiaElectionMap = lazy(() => import("./IndiaElectionMap"));
const BiometricLivenessCapture = lazy(() => import("./BiometricLivenessCapture"));
import "./App.css";
import { exportToPdf } from "./utils/pdfExport";
import { format12HourDateTime, format12HourDate, formatReceiptLedgerTime } from "./utils/dateUtils";
import contractConfig from "./contractAddress.json";

const API = "http://localhost:5000/api";
const CONTRACT_ADDRESS = contractConfig?.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = [
  "function castVote(uint256 electionId, uint256 candidateId) public"
];

function safeGetStoredUser() {
  try {
    const val = localStorage.getItem("user") || localStorage.getItem("voterUser");
    if (!val || val === "undefined" || val === "null") return null;
    return JSON.parse(val);
  } catch (e) {
    console.warn("Invalid user in localStorage, clearing corrupted item:", e);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("voterUser");
    } catch (_) {}
    return null;
  }
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginType, setLoginType] = useState("VOTER"); // 'ADMIN' or 'VOTER'
  const [voterTab, setVoterTab] = useState("login"); // 'login' or 'register'
  const [voterActiveTab, setVoterActiveTab] = useState(() => {
    try {
      return localStorage.getItem("voterActiveTab") || "profile";
    } catch (_) {
      return "profile";
    }
  });
  
  // Registration form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regVoterId, setRegVoterId] = useState("");
  const [regWalletAddress, setRegWalletAddress] = useState("");
  const [regPhone, setRegPhone] = useState("");
  // Mobile OTP States
  const [regOtp, setRegOtp] = useState("123456");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [virtualSmsToast, setVirtualSmsToast] = useState(null);
  const [virtualSmsData, setVirtualSmsData] = useState(null);
  const [regLivePhoto, setRegLivePhoto] = useState(null);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [livenessScore, setLivenessScore] = useState(0);
  const [regBiometricChallengeToken, setRegBiometricChallengeToken] = useState("");
  const [aadhaarMismatchWarning, setAadhaarMismatchWarning] = useState("");
  const [regFormStep, setRegFormStep] = useState(1); // 1: Jurisdiction, 2: Personal, 3: Contact & OTP
  const [regDob, setRegDob] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regGender, setRegGender] = useState("Male");
  const [regRelativeType, setRegRelativeType] = useState("Father");
  const [regRelativeName, setRegRelativeName] = useState("");
  const [regAadhaar, setRegAadhaar] = useState("");
  const [regHouseNo, setRegHouseNo] = useState("");
  const [regStreet, setRegStreet] = useState("");
  const [regVillage, setRegVillage] = useState("");
  const [regPincode, setRegPincode] = useState("");
  const [regCitizenDeclaration, setRegCitizenDeclaration] = useState(false);
  const [regConstituencyId, setRegConstituencyId] = useState("");
  const [constituencyList, setConstituencyList] = useState([]);
  // Hierarchical constituency selector states
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [pcsList, setPcsList] = useState([]);
  const [acsList, setAcsList] = useState([]);
  const [stationsList, setStationsList] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedPCId, setSelectedPCId] = useState("");
  const [selectedACId, setSelectedACId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");

  // Profile Edit states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editRelativeName, setEditRelativeName] = useState("");
  const [editRelativeType, setEditRelativeType] = useState("Father");
  const [editGender, setEditGender] = useState("Male");
  const [editLivePhoto, setEditLivePhoto] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isExportingParchiPdf, setIsExportingParchiPdf] = useState(false);
  const isRefreshingRef = useRef(false);
  const [electionsList, setElectionsList] = useState([]);

  const [showAdmin, setShowAdmin] = useState(() => {
    const savedUser = safeGetStoredUser();
    if (savedUser) {
      const adminRoles = [
        "ADMIN", "SUPER_ADMIN", "ELECTION_COMMISSIONER", "STATE_ELECTION_OFFICER",
        "DISTRICT_ELECTION_OFFICER", "RETURNING_OFFICER", "PRESIDING_OFFICER",
        "POLLING_OFFICER", "OBSERVER", "AUDITOR"
      ];
      return adminRoles.includes(savedUser.role);
    }
    return false;
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token") || localStorage.getItem("voterToken") || "";
    } catch (_) {
      return "";
    }
  });

  const [user, setUser] = useState(() => safeGetStoredUser());

  const [election, setElection] = useState(null);
  const [countdownText, setCountdownText] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [bypassMetaMask, setBypassMetaMask] = useState(true);
  const [health, setHealth] = useState(null);
  const [initChecked, setInitChecked] = useState(false);
  const [bypassInit, setBypassInit] = useState(false);
  const [voterReceipt, setVoterReceipt] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingEpicPdf, setIsExportingEpicPdf] = useState(false);
  const [secretBallotMode, setSecretBallotMode] = useState(true);
  const [showLedgerExplorer, setShowLedgerExplorer] = useState(false);
  const [ledgerQuery, setLedgerQuery] = useState("");
  const [ledgerAuditResult, setLedgerAuditResult] = useState(null);
  const [ledgerAuditLoading, setLedgerAuditLoading] = useState(false);
  const [ledgerAuditError, setLedgerAuditError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  const auditLedgerTransaction = async (targetQuery) => {
    const q = (targetQuery !== undefined ? targetQuery : ledgerQuery || "").trim();
    if (!q) {
      setLedgerAuditError("Please enter a valid Transaction Hash (0x...) or Official Receipt Code (REC-...).");
      return;
    }
    try {
      setLedgerAuditLoading(true);
      setLedgerAuditError("");
      setLedgerAuditResult(null);
      const res = await fetch(`http://localhost:5000/api/blockchain/verify/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to verify query on blockchain ledger.");
      }
      setLedgerAuditResult(data);
    } catch (err) {
      setLedgerAuditError(err.message);
    } finally {
      setLedgerAuditLoading(false);
    }
  };

  const downloadReceiptAsPdf = async (receipt) => {
    if (!receipt || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      const element = document.getElementById(`eci-receipt-slip-${receipt.receipt_code || "active"}`);
      if (element) {
        await exportToPdf(element, `ECI_Voting_Receipt_${receipt.receipt_code || "SLIP"}.pdf`, {
          orientation: "portrait",
          scale: 2.5
        });
      } else {
        downloadReceiptAsText(receipt);
      }
    } catch (err) {
      console.error("PDF generation error:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const downloadEpicAsPdf = async () => {
    if (isExportingEpicPdf) return;
    try {
      setIsExportingEpicPdf(true);
      const epicElement = document.getElementById("eci-official-epic-sheet");
      if (epicElement) {
        await exportToPdf(epicElement, `ECI_e-EPIC_${user?.voterId || user?.voter_id || "CARD"}.pdf`, {
          orientation: "portrait",
          scale: 2.5
        });
      } else {
        window.print();
      }
    } catch (err) {
      console.error("e-EPIC PDF generation error:", err);
      window.print();
    } finally {
      setIsExportingEpicPdf(false);
    }
  };

  const [receiptCopied, setReceiptCopied] = useState(false);
  const [textSize, setTextSize] = useState("normal");
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState("normal");

  const changeFontSize = (size) => {
    setTextSize(size);
    setFontSizeLevel(size);
    if (size === "small") document.documentElement.style.fontSize = "14px";
    else if (size === "large") document.documentElement.style.fontSize = "18px";
    else document.documentElement.style.fontSize = "16px";
  };

  const handleFontSizeChange = (size) => {
    changeFontSize(size);
  };

  const fetchConstituencies = async () => {
    try {
      const res = await fetch(`${API}/constituencies`);
      const data = await res.json();
      if (data.success) setConstituencyList(data.constituencies || []);
    } catch (err) {
      console.error("Failed to fetch constituencies:", err);
    }
  };

  const loadReceipt = async (authToken = token, electionId = election?.id) => {
    if (!electionId) return null;
    const effectiveToken = authToken || localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
    try {
      const headers = effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};
      const res = await fetch(`${API}/votes/receipt/${electionId}`, {
        headers
      });
      const data = await res.json();
      if (data.success && data.receipt) {
        setVoterReceipt(data.receipt);
        return data.receipt;
      } else {
        setVoterReceipt(null);
        return null;
      }
    } catch (err) {
      console.error("Error loading receipt:", err);
      setVoterReceipt(null);
      return null;
    }
  };

  const loadElection = async (authToken = token, specificElectionId = null) => {
    try {
      setLoading(true);
      setMessage("");
      const effectiveToken = authToken || localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const headers = effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};

      const listResponse = await fetch(`${API}/elections`, {
        headers
      });
      const listData = await listResponse.json();
      if (!listResponse.ok || !listData.success) {
        throw new Error(listData.message || "Unable to list elections");
      }

      if (!listData.elections || listData.elections.length === 0) {
        setElectionsList([]);
        setElection(null);
        setCandidates([]);
        setVoterReceipt(null);
        return;
      }

      setElectionsList(listData.elections || []);

      let targetElectionId = specificElectionId;
      if (!targetElectionId) {
        const activeElection = listData.elections.find(e => e.status === "ACTIVE") ||
                               listData.elections.find(e => e.status === "UPCOMING") ||
                               listData.elections[0];
        targetElectionId = activeElection ? activeElection.id : listData.elections[0].id;
      }

      const electionResponse = await fetch(
        `${API}/elections/${targetElectionId}`,
        { headers }
      );

      const electionData = await electionResponse.json();
      if (!electionResponse.ok || !electionData.success) {
        throw new Error(electionData.message || "Unable to load election");
      }

      setElection(electionData.election);

      const candidateResponse = await fetch(
        `${API}/candidates/election/${targetElectionId}`,
        { headers }
      );

      const candidateData = await candidateResponse.json();
      if (!candidateResponse.ok || !candidateData.success) {
        throw new Error(candidateData.message || "Unable to load candidates");
      }

      setCandidates(candidateData.candidates || []);
      
      const adminRoles = [
        "ADMIN", "SUPER_ADMIN", "ELECTION_COMMISSIONER", "STATE_ELECTION_OFFICER",
        "DISTRICT_ELECTION_OFFICER", "RETURNING_OFFICER", "PRESIDING_OFFICER",
        "POLLING_OFFICER", "OBSERVER", "AUDITOR"
      ];
      const currentUser = user || safeGetStoredUser();
      const isUserAdmin = currentUser && adminRoles.includes(currentUser.role);
      
      if (!isUserAdmin) {
        await loadReceipt(effectiveToken, targetElectionId);
      }

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setConnectedWallet(accounts[0].toLowerCase());
          setMessage("Wallet connected: " + accounts[0]);
        }
      } catch (err) {
        console.error("Wallet connection failed:", err);
        setMessage("Wallet connection failed: " + err.message);
      }
    } else {
      alert("MetaMask or Web3 wallet extension is not installed.");
    }
  };

  const login = async () => {
    if (!email || !password) {
      alert("Email/Voter ID and password are required.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }
      const loggedUser = data.user;
      const authToken = data.token;
      
      const adminRoles = [
        "ADMIN", "SUPER_ADMIN", "ELECTION_COMMISSIONER", "STATE_ELECTION_OFFICER",
        "DISTRICT_ELECTION_OFFICER", "RETURNING_OFFICER", "PRESIDING_OFFICER",
        "POLLING_OFFICER", "OBSERVER", "AUDITOR"
      ];
      const isRoleAdmin = loggedUser && adminRoles.includes(loggedUser.role);

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      if (!isRoleAdmin) {
        localStorage.setItem("voterToken", authToken);
        localStorage.setItem("voterUser", JSON.stringify(loggedUser));
      }

      setToken(authToken);
      setUser(loggedUser);
      setShowAdmin(isRoleAdmin);
      setShowLogin(false);
      setMessage(`Welcome, ${loggedUser.name}! Authentication successful.`);
      loadElection(authToken);
    } catch (err) {
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = showAdmin || (user && [
    "ADMIN", "SUPER_ADMIN", "ELECTION_COMMISSIONER", "STATE_ELECTION_OFFICER",
    "DISTRICT_ELECTION_OFFICER", "RETURNING_OFFICER", "PRESIDING_OFFICER",
    "POLLING_OFFICER", "OBSERVER", "AUDITOR"
  ].includes(user.role));

  const downloadReceiptAsText = (receipt) => {
    if (!receipt) return;
    const text = `================================================================================
भारत निर्वाचन आयोग | ELECTION COMMISSION OF INDIA
OFFICIAL DIGITAL VOTING RECEIPT
Secure Decentralized E-Voting System (SDEMS)
================================================================================

ELECTOR PARTICULARS:
--------------------------------------------------------------------------------
Elector Full Name    : ${receipt.elector_name || user?.name || "Verified Citizen"}
EPIC Voter ID        : ${receipt.elector_epic_id || user?.voterId || user?.voter_id || "N/A"}
State / UT           : ${receipt.elector_address || user?.stateName || user?.address || "Republic of India"}
Constituency         : ${receipt.constituency_name ? `${receipt.constituency_name} (${receipt.constituency_code || "PC"})` : user?.constituency_name || "Assigned Parliamentary Segment"}
Polling Station      : ${receipt.polling_station_name ? `${receipt.polling_station_name} (${receipt.polling_station_code || "PS"})` : "Main Polling Booth #01"}

BALLOT RECORDING:
--------------------------------------------------------------------------------
Election Title       : ${receipt.election_title || election?.title || "Statutory General Election"}
Election Code        : ${receipt.election_code || election?.election_code || "N/A"}
Election Level       : ${receipt.election_level || election?.election_level || "National / Statutory"}
Candidate Voted For  : ${receipt.candidate_name || "Certified E-Ballot Recorded"}
Political Party      : ${receipt.candidate_party || "ECI Recognized Party"}
Allotted Symbol      : ${receipt.candidate_symbol || "Statutory Symbol"}
Ballot Recording Time: ${formatReceiptLedgerTime(receipt.created_at || Date.now())}

IMMUTABLE BLOCKCHAIN PROOF:
--------------------------------------------------------------------------------
Official Receipt Code: ${receipt.receipt_code}
Transaction Hash     : ${receipt.tx_hash}
Block Height         : #${receipt.block_number || "Confirmed"}
Gas Consumed         : ${receipt.gas_used || "80,646"} Units
Elector Wallet       : ${receipt.elector_wallet || user?.wallet_address || "On-Chain Authorized"}
Consensus Network    : Hardhat Local EVM Node (Chain ID: 31337)
Digital Signature    : ${receipt.digital_signature || "SHA256-VERIFIED"}

STATUTORY VERIFICATION URL:
--------------------------------------------------------------------------------
http://localhost:5000/api/gov/verify-receipt/${receipt.receipt_code}

LEGAL NOTICE:
This digitally signed receipt constitutes statutory proof of ballot recording on the
secure blockchain ledger pursuant to Section 128 of the Representation of
the People Act, 1951. Ballot secrecy is preserved while enabling mathematical auditability.
================================================================================
Generated by SDEMS v1.0.0 — Government of India E-Voting Authority
`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ECI-Voter-Receipt-${receipt.receipt_code || "SLIP"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyReceiptCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setReceiptCopied(true);
    setTimeout(() => setReceiptCopied(false), 2500);
  };

  const [voterGrievances, setVoterGrievances] = useState([]);
  const [grievanceCategory, setGrievanceCategory] = useState("VOTER_REGISTRATION");
  const [grievanceDesc, setGrievanceDesc] = useState("");
  const [mccCategory, setMccCategory] = useState("BRIBERY");
  const [mccSuspect, setMccSuspect] = useState("");
  const [mccDesc, setMccDesc] = useState("");
  const [electionPhases, setElectionPhases] = useState([]);

  const loadVoterGrievances = async () => {
    try {
      const activeToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const headers = (activeToken && activeToken !== "undefined" && activeToken !== "null")
        ? { Authorization: `Bearer ${activeToken}` }
        : {};
      const res = await fetch(`${API}/gov/grievances`, { headers });
      const data = await res.json();
      if (data.success && data.grievances) {
        const currentUser = user || safeGetStoredUser();
        setVoterGrievances(data.grievances.filter(g => g.complainant_id === currentUser?.id || g.user_id === currentUser?.id));
      }
    } catch (err) {
      console.error("Error loading grievances:", err);
    }
  };

  // KYC & Candidate Manifesto Comparator
  const [kycSelectedElectionId, setKycSelectedElectionId] = useState("");
  const [kycCandidates, setKycCandidates] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [compareCandidateA, setCompareCandidateA] = useState("");
  const [compareCandidateB, setCompareCandidateB] = useState("");
  const [showCompareModal, setShowCompareModal] = useState(false);

  const loadKycData = async (targetElectionId) => {
    let elId = targetElectionId || kycSelectedElectionId || election?.id || (electionsList[0] ? electionsList[0].id : null);
    const authToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
    const headers = { "Content-Type": "application/json" };
    if (authToken && authToken !== "undefined" && authToken !== "null") {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    if (!elId) {
      try {
        const elRes = await fetch(`${API}/elections`, { headers });
        const elData = await elRes.json();
        if (elData.success && elData.elections && elData.elections.length > 0) {
          setElectionsList(elData.elections);
          const defaultElection = elData.elections.find(e => e.status === "ACTIVE") || elData.elections[0];
          elId = defaultElection ? defaultElection.id : null;
          if (elId) setKycSelectedElectionId(elId);
        }
      } catch (_) {}
    }

    if (!elId) return;
    try {
      setKycLoading(true);
      const res = await fetch(`${API}/candidates/election/${elId}`, { headers });
      const data = await res.json();
      if (data.success) {
        const cands = data.candidates || [];
        setKycCandidates(cands);
        if (cands.length >= 2) {
          setCompareCandidateA(prev => prev || cands[0].id);
          setCompareCandidateB(prev => prev || cands[1].id);
        }
      }
    } catch (err) {
      console.error("Error loading KYC candidates:", err);
    } finally {
      setKycLoading(false);
    }
  };

  // Ballot Cryptographic Audit Verifier
  const [myVotedElections, setMyVotedElections] = useState([]);
  const [myVotesLoading, setMyVotesLoading] = useState(false);
  const [verifyAuditQuery, setVerifyAuditQuery] = useState("");
  const [verifyAuditLoading, setVerifyAuditLoading] = useState(false);
  const [verifyAuditResult, setVerifyAuditResult] = useState(null);
  const [verifyAuditError, setVerifyAuditError] = useState("");

  const loadMyVotedBallots = async () => {
    try {
      setMyVotesLoading(true);
      const authToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch(`${API}/votes/my-votes`, {
        headers
      });
      const data = await res.json();
      if (data.success) {
        setMyVotedElections(data.votedElections || []);
      }
    } catch (err) {
      console.error("Error loading my voted ballots:", err);
    } finally {
      setMyVotesLoading(false);
    }
  };

  const handleAuditBallot = async (query) => {
    const q = (query || verifyAuditQuery).trim();
    if (!q) {
      alert("Please enter a valid Receipt Code (e.g. REC-...) or Blockchain Transaction Hash (0x...)");
      return;
    }
    try {
      setVerifyAuditLoading(true);
      setVerifyAuditError("");
      setVerifyAuditResult(null);
      const res = await fetch(`${API}/blockchain/verify/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.ledgerProof) {
        setVerifyAuditResult(data.ledgerProof);
      } else {
        setVerifyAuditError(data.message || "Ballot record not found on blockchain ledger.");
      }
    } catch (err) {
      setVerifyAuditError(err.message || "Failed to query cryptographic ledger.");
    } finally {
      setVerifyAuditLoading(false);
    }
  };

  // Electoral Services & Form 8 Portal
  const [servicesSubTab, setServicesSubTab] = useState("form8");
  const [myServiceRequests, setMyServiceRequests] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [form8Type, setForm8Type] = useState("FORM_8_CORRECTION");
  const [form8Name, setForm8Name] = useState("");
  const [form8Phone, setForm8Phone] = useState("");
  const [form8Address, setForm8Address] = useState("");
  const [form8Pincode, setForm8Pincode] = useState("");
  const [form8RelativeName, setForm8RelativeName] = useState("");
  const [form8RelativeType, setForm8RelativeType] = useState("Father");
  const [form8Gender, setForm8Gender] = useState("Male");
  const [form8Reason, setForm8Reason] = useState("");

  const [sakshamCategory, setSakshamCategory] = useState("WHEELCHAIR");
  const [sakshamDisabilityType, setSakshamDisabilityType] = useState("Locomotor Disability");
  const [sakshamDisabilityPercent, setSakshamDisabilityPercent] = useState("40%");
  const [sakshamNotes, setSakshamNotes] = useState("");

  const loadMyServiceRequests = async () => {
    try {
      setServicesLoading(true);
      const authToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch(`${API}/voter-services/my-requests`, {
        headers
      });
      const data = await res.json();
      if (data.success) {
        setMyServiceRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Error loading voter service requests:", err);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleForm8Submit = async (e) => {
    if (e) e.preventDefault();
    try {
      setServiceSubmitting(true);
      const authToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const details = {
        name: form8Name || user?.name,
        phone: form8Phone || user?.phone,
        address: form8Address || user?.address,
        pincode: form8Pincode || user?.pincode,
        relative_name: form8RelativeName || user?.relativeName,
        relative_type: form8RelativeType || user?.relativeType,
        gender: form8Gender || user?.gender,
        reason: form8Reason || "Voter requested formal correction of electoral roll entry."
      };
      const res = await fetch(`${API}/voter-services/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          request_type: form8Type,
          category: form8Type === "FORM_8_SHIFT" ? "Constituency / Address Relocation" : "Electoral Roll Correction",
          details
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Form 8 application submitted successfully to Electoral Registration Officer (ERO).");
        setForm8Reason("");
        setServicesSubTab("track");
        loadMyServiceRequests();
      } else {
        alert(data.message || "Failed to submit Form 8.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleSakshamSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setServiceSubmitting(true);
      const authToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const details = {
        disability_type: sakshamDisabilityType,
        disability_percent: sakshamDisabilityPercent,
        booth_code: user?.pollingStationCode || user?.polling_station_code,
        special_assistance_notes: sakshamNotes || "Wheelchair / Ramp assistance requested at booth."
      };
      const categoryLabels = {
        WHEELCHAIR: "Wheelchair Assistance at Polling Booth",
        RAMP_ESCORT: "Ramp Access & Volunteer Escort",
        HOME_VOTING: "Senior Citizen (85+) / PwD Home Voting Facility"
      };
      const res = await fetch(`${API}/voter-services/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          request_type: "SAKSHAM_ASSISTANCE",
          category: categoryLabels[sakshamCategory] || "Assistance at Polling Booth",
          details
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Assistance request registered and forwarded to Booth Level Officer (BLO).");
        setSakshamNotes("");
        setServicesSubTab("track");
        loadMyServiceRequests();
      } else {
        alert(data.message || "Failed to submit request.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleCreateGrievance = async (e) => {
    e.preventDefault();
    try {
      const activeToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const headers = { "Content-Type": "application/json" };
      if (activeToken && activeToken !== "undefined" && activeToken !== "null") {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }
      const res = await fetch(`${API}/gov/grievances`, {
        method: "POST",
        headers,
        body: JSON.stringify({ category: grievanceCategory, description: grievanceDesc })
      });
      const data = await res.json();
      if (data.success) {
        alert("Grievance logged successfully and mapped to audit trail.");
        setGrievanceDesc("");
        loadVoterGrievances();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReportMCC = async (e) => {
    e.preventDefault();
    try {
      const activeToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const headers = { "Content-Type": "application/json" };
      if (activeToken && activeToken !== "undefined" && activeToken !== "null") {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }
      const res = await fetch(`${API}/gov/compliance`, {
        method: "POST",
        headers,
        body: JSON.stringify({ category: mccCategory, suspect: mccSuspect, description: mccDesc })
      });
      const data = await res.json();
      if (data.success) {
        alert("MCC violation report logged and queued for officer investigation.");
        setMccSuspect("");
        setMccDesc("");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const createVoterGrievance = handleCreateGrievance;
  const newGrievanceCategory = grievanceCategory;
  const setNewGrievanceCategory = setGrievanceCategory;
  const newGrievanceDesc = grievanceDesc;
  const setNewGrievanceDesc = setGrievanceDesc;
  const submitMCCViolation = handleReportMCC;
  const newViolationCategory = mccCategory;
  const setNewViolationCategory = setMccCategory;
  const newViolationSuspect = mccSuspect;
  const setNewViolationSuspect = setMccSuspect;
  const newViolationDesc = mccDesc;
  const setNewViolationDesc = setMccDesc;
  const voterPhases = electionPhases;

  const loadElectionPhases = async () => {
    try {
      const activeToken = localStorage.getItem("voterToken") || localStorage.getItem("token") || token;
      const headers = (activeToken && activeToken !== "undefined" && activeToken !== "null")
        ? { Authorization: `Bearer ${activeToken}` }
        : {};
      const res = await fetch(`${API}/gov/phases`, { headers });
      const data = await res.json();
      if (data.success) setElectionPhases(data.phases);
    } catch (err) {
      console.error("Error loading phases:", err);
    }
  };

  const fetchVoterHealth = () => {
    fetch(`${API}/health`)
      .then(res => res.json())
      .then(data => {
        setHealth(prevHealth => {
          if (prevHealth && 
              prevHealth.overallStatus === data.overallStatus && 
              JSON.stringify(prevHealth.services) === JSON.stringify(data.services)) {
            return prevHealth;
          }
          return data;
        });
        setInitChecked(true);
      })
      .catch(err => {
        console.error("Health check error, fetching Electron main diagnostics:", err);
        if (window.electronAPI && window.electronAPI.getDiagnostics) {
          window.electronAPI.getDiagnostics().then(diag => {
            const mappedHealth = {
              overallStatus: (diag.backend.status === "ONLINE" && diag.postgres.status === "ONLINE" && diag.blockchain.status === "ONLINE" && diag.contract.status === "VERIFIED") ? "ONLINE" : "OFFLINE",
              services: {
                database: { status: diag.postgres.status, message: diag.postgres.message },
                blockchain: { status: diag.blockchain.status, message: diag.blockchain.message },
                contract: { status: diag.contract.status, message: diag.contract.message },
                backend: { status: diag.backend.status, message: diag.backend.message },
                analytics: { status: diag.analytics.status, message: diag.analytics.message }
              }
            };
            setHealth(prevHealth => {
              if (prevHealth && 
                  prevHealth.overallStatus === mappedHealth.overallStatus && 
                  JSON.stringify(prevHealth.services) === JSON.stringify(mappedHealth.services)) {
                return prevHealth;
              }
              return mappedHealth;
            });
            setInitChecked(true);
          }).catch(diagErr => {
            console.error("Failed to fetch diagnostics:", diagErr);
            setInitChecked(true);
          });
        } else {
          setInitChecked(true);
        }
      });
  };

  useEffect(() => {
    fetchVoterHealth();
    fetchConstituencies();
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "hidden") {
        fetchVoterHealth();
      }
    }, 15000);

    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      clearInterval(interval);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    if (!election || election.status !== "ACTIVE") {
      setCountdownText("");
      return;
    }
    const updateCountdown = () => {
      const remaining = new Date(election.end_time).getTime() - Date.now();
      if (remaining <= 0) {
        setCountdownText("Voting has ended");
        return;
      }
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      let text = "";
      if (days > 0) text += `${days}d `;
      text += `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
      setCountdownText(text);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [election]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/ref-data/states");
        const data = await res.json();
        if (data.success) setStatesList(data.states || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistrictsAndPCs = async () => {
      if (!selectedStateId) {
        setDistrictsList([]);
        setPcsList([]);
        return;
      }
      try {
        const res1 = await fetch(`http://localhost:5000/api/ref-data/districts?state_id=${selectedStateId}`);
        const data1 = await res1.json();
        if (data1.success) setDistrictsList(data1.districts || []);

        const res2 = await fetch(`http://localhost:5000/api/ref-data/parliamentary-constituencies?state_id=${selectedStateId}`);
        const data2 = await res2.json();
        if (data2.success) setPcsList(data2.constituencies || []);
      } catch (err) {
        console.error("Failed to fetch districts/pcs:", err);
      }
    };
    fetchDistrictsAndPCs();
  }, [selectedStateId]);

  useEffect(() => {
    const fetchACs = async () => {
      if (!selectedStateId || !selectedDistrictId) {
        setAcsList([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/ref-data/assembly-constituencies?state_id=${selectedStateId}&district_id=${selectedDistrictId}`);
        const data = await res.json();
        if (data.success) setAcsList(data.constituencies || []);
      } catch (err) {
        console.error("Failed to fetch ACs:", err);
      }
    };
    fetchACs();
  }, [selectedStateId, selectedDistrictId]);

  useEffect(() => {
    const fetchStations = async () => {
      const targetConstituencyId = selectedACId || selectedPCId;
      if (!targetConstituencyId) {
        setStationsList([]);
        setRegConstituencyId("");
        return;
      }
      setRegConstituencyId(targetConstituencyId);
      try {
        const queryParam = selectedACId 
          ? `assembly_constituency_id=${selectedACId}` 
          : `constituency_id=${selectedPCId}`;
        const res = await fetch(`http://localhost:5000/api/polling-stations?${queryParam}`);
        const data = await res.json();
        if (data.success) setStationsList(data.pollingStations || data.stations || []);
      } catch (err) {
        console.error("Failed to fetch stations:", err);
      }
    };
    fetchStations();
  }, [selectedACId, selectedPCId]);

  useEffect(() => {
    localStorage.setItem("voterActiveTab", voterActiveTab);
    if (voterActiveTab === "grievances") loadVoterGrievances();
    if (voterActiveTab === "calendar") loadElectionPhases();
    if (voterActiveTab === "kyc") loadKycData();
    if (voterActiveTab === "verify_ballot") loadMyVotedBallots();
    if (voterActiveTab === "services") loadMyServiceRequests();
  }, [voterActiveTab]);

  useEffect(() => {
    const activeAuthToken = token || localStorage.getItem("voterToken") || localStorage.getItem("token");
    if (!activeAuthToken) return;
    loadElection(activeAuthToken);

    const interval = setInterval(async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      try {
        const curToken = token || localStorage.getItem("voterToken") || localStorage.getItem("token");
        if (!curToken || curToken === "undefined" || curToken === "null") return;
        const authHeader = { 
          Authorization: `Bearer ${curToken}`,
          "X-Background-Sync": "true"
        };

        const userRes = await fetch(`${API}/auth/me`, {
          headers: authHeader
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success && userData.user) {
            setUser(prevUser => {
              if (prevUser && prevUser.id === userData.user.id && 
                  prevUser.status === userData.user.status && 
                  prevUser.constituency_id === userData.user.constituency_id &&
                  prevUser.has_voted === userData.user.has_voted) {
                return prevUser;
              }
              return userData.user;
            });
            localStorage.setItem("user", JSON.stringify(userData.user));
            localStorage.setItem("voterUser", JSON.stringify(userData.user));
          }
        }
        const electionsRes = await fetch(`${API}/elections`, {
          headers: authHeader
        });
        if (electionsRes.ok) {
          const electionsData = await electionsRes.json();
          if (electionsData.success && electionsData.elections && electionsData.elections.length > 0) {
            setElectionsList(prevList => {
              if (prevList && prevList.length === electionsData.elections.length && 
                  JSON.stringify(prevList.map(e => ({ id: e.id, status: e.status, has_voted: e.has_voted }))) === 
                  JSON.stringify(electionsData.elections.map(e => ({ id: e.id, status: e.status, has_voted: e.has_voted })))) {
                return prevList;
              }
              return electionsData.elections;
            });
            const activeOrUpcoming = electionsData.elections.find(e => e.status === "ACTIVE") ||
                                     electionsData.elections.find(e => e.status === "UPCOMING") ||
                                     electionsData.elections[0];
            if (activeOrUpcoming) {
              const electionResponse = await fetch(`${API}/elections/${activeOrUpcoming.id}`, {
                headers: authHeader
              });
              if (electionResponse.ok) {
                const electionData = await electionResponse.json();
                if (electionData.success && electionData.election) {
                  setElection(prevElection => {
                    if (prevElection && prevElection.id === electionData.election.id && 
                        prevElection.status === electionData.election.status &&
                        prevElection.total_votes === electionData.election.total_votes) {
                      return prevElection;
                    }
                    return electionData.election;
                  });
                }
              }

              // Also ensure candidates are synchronized so cast vote ballot is never empty
              const candsRes = await fetch(`${API}/candidates/election/${activeOrUpcoming.id}`, {
                headers: authHeader
              });
              if (candsRes.ok) {
                const candsData = await candsRes.json();
                if (candsData.success && candsData.candidates && candsData.candidates.length > 0) {
                  setCandidates(prevCands => {
                    if (prevCands && prevCands.length === candsData.candidates.length && 
                        JSON.stringify(prevCands.map(c => ({ id: c.id, vote_count: c.vote_count }))) === 
                        JSON.stringify(candsData.candidates.map(c => ({ id: c.id, vote_count: c.vote_count })))) {
                      return prevCands;
                    }
                    return candsData.candidates;
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Background auto-refresh error:", err);
      } finally {
        isRefreshingRef.current = false;
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
      const options = args[1] || (typeof args[0] === "object" ? args[0] : {});
      const headers = options.headers || {};
      const isBackground = headers["X-Background-Sync"] === "true" || (typeof headers.get === "function" && headers.get("X-Background-Sync") === "true");

      // Only trigger session expiration when authoritative auth/me token verification fails on user-initiated action
      if (url.includes("/auth/me") && response.status === 401 && !isBackground) {
        const storedToken = localStorage.getItem("token") || localStorage.getItem("voterToken");
        if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
          console.warn("[Auth Interceptor] Authoritative session token expired (401):", url);
          localStorage.removeItem("voterToken");
          localStorage.removeItem("voterUser");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken("");
          setUser(null);
          setElection(null);
          setCandidates([]);
          setResults(null);
          setVoterReceipt(null);
          setShowResults(false);
          setShowAdmin(false);
          setMessage("Your session has expired. Please log in again.");
          setShowLogin(true);
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" })
        .then(accounts => {
          if (accounts && accounts.length > 0) {
            setConnectedWallet(accounts[0].toLowerCase());
          }
        })
        .catch(err => console.error("Error getting accounts:", err));

      const handleAccountsChanged = (accounts) => {
        if (accounts && accounts.length > 0) {
          setConnectedWallet(accounts[0].toLowerCase());
        } else {
          setConnectedWallet("");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, [token]);

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // OTP Cooldown Timer Effect
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    const clean = regPhone.replace(/\D/g, "");
    if (!clean || clean.length !== 10 || !/^[6-9]\d{9}$/.test(clean)) {
      alert("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    const cleanAadhaar = regAadhaar.replace(/\D/g, "");
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      alert("Please enter your valid 12-digit Aadhaar number before requesting mobile OTP.");
      return;
    }
    try {
      setOtpSending(true);
      setAadhaarMismatchWarning("");
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean, aadhaarNumber: cleanAadhaar })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.mismatch) {
          setAadhaarMismatchWarning(data.message);
        }
        throw new Error(data.message || "Failed to dispatch verification OTP.");
      }
      setOtpSent(true);
      setOtpCooldown(60);
      if (data.virtualSms) {
        setVirtualSmsData(data.virtualSms);
      }
      setMessage(data.message || "Official Aadhaar OTP dispatched to your mobile.");
    } catch (err) {
      alert(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (customCode) => {
    const clean = regPhone.replace(/\D/g, "");
    const cleanAadhaar = regAadhaar.replace(/\D/g, "");
    const code = (typeof customCode === "string" ? customCode : regOtp).trim();
    if (!clean || clean.length !== 10) {
      alert("Please enter a valid 10-digit Indian mobile number first.");
      return;
    }
    if (!code || code.length !== 6) {
      alert("Please enter the 6-digit OTP code received on your mobile.");
      return;
    }
    try {
      setOtpVerifying(true);
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean, otp: code, aadhaarNumber: cleanAadhaar })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed. Please check the code sent to your phone.");
      }
      setPhoneVerified(true);
      setAadhaarMismatchWarning("");
      setMessage("Aadhaar e-KYC and Mobile OTP verified successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regName.trim() || !regEmail || !regEmail.trim() || !regPassword) {
      alert("Full Name, Email Address, and Password are required.");
      return;
    }
    if (regPassword.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (regDob) {
      const age = calculateAge(regDob);
      if (age !== null && age < 18) {
        alert("Applicant must be at least 18 years of age on the qualifying date to apply under Form 6 (Section 19 of RPA 1950).");
        return;
      }
    }
    if (!selectedStateId || !selectedDistrictId || !selectedACId || !selectedStationId) {
      alert("Please select State, District, Assembly Constituency and Polling Station mapping.");
      return;
    }
    const cleanPhone = regPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      alert("A valid 10-digit mobile number is mandatory for elector registration.");
      return;
    }
    const cleanAadhaar = regAadhaar.replace(/\D/g, "");
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      alert("A valid 12-digit Aadhaar number is mandatory for Form 6 e-KYC registration.");
      return;
    }
    if (!phoneVerified) {
      alert("Aadhaar and Mobile OTP verification is required before Form 6 submission.");
      return;
    }
    if (!biometricVerified) {
      alert("Live Biometric Facial Verification is required before Form 6 submission to prevent unauthorized voter registration.");
      return;
    }
    if (!regCitizenDeclaration) {
      alert("Please certify the statutory citizenship and age declaration before submitting Form 6.");
      return;
    }

    const fullAddress = [regHouseNo, regStreet, regVillage, regPincode ? `PIN: ${regPincode}` : ""].filter(Boolean).join(", ") || regAddress;

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          voterId: regVoterId.trim() || undefined,
          walletAddress: regWalletAddress.trim() || undefined,
          gender: regGender,
          relativeName: regRelativeName.trim() || undefined,
          relativeType: regRelativeType,
          aadhaarNumber: cleanAadhaar,
          phone: cleanPhone,
          otp: regOtp.trim(),
          dob: regDob || undefined,
          address: fullAddress,
          pincode: regPincode.trim() || undefined,
          stateId: selectedStateId,
          districtId: selectedDistrictId,
          assemblyConstituencyId: selectedACId,
          constituencyId: regConstituencyId || selectedACId,
          pollingStationId: selectedStationId,
          biometricVerified: true,
          livePhoto: regLivePhoto,
          challengeToken: regBiometricChallengeToken || undefined,
          livenessScore: livenessScore || 0.98
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Registration failed.");

      const assignedEpic = data.user && data.user.voter_id ? data.user.voter_id : "Assigned";
      alert(`Form 6 Application Successful!\n\nAssigned EPIC Voter ID: ${assignedEpic}\nAssigned Polling Station ID: ${selectedStationId}\nBiometric & Aadhaar Verification: Verified\n\nYou may now sign in using your Email Address or your new EPIC Voter ID.`);
      
      // Reset registration & OTP state
      setPhoneVerified(false);
      setBiometricVerified(false);
      setRegLivePhoto(null);
      setRegBiometricChallengeToken("");
      setVirtualSmsData(null);
      setOtpSent(false);
      setRegOtp("");
      setVirtualSmsToast(null);
      setRegFormStep(1);

      setVoterTab("login");
      setEmail(assignedEpic || regEmail);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!editName || editName.trim() === "") {
      alert("Name cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone ? editPhone.trim() : null,
          address: editAddress ? editAddress.trim() : null,
          pincode: editPincode ? editPincode.trim() : null,
          relative_name: editRelativeName ? editRelativeName.trim() : null,
          relative_type: editRelativeType || "Father",
          gender: editGender || "Male",
          live_photo: editLivePhoto || user?.live_photo || user?.livePhoto || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update profile.");

      const updated = { 
        ...user, 
        ...data.user,
        name: data.user.name, 
        phone: data.user.phone, 
        address: data.user.address,
        pincode: data.user.pincode,
        relative_name: data.user.relative_name,
        relative_type: data.user.relative_type,
        gender: data.user.gender,
        live_photo: data.user.live_photo || editLivePhoto || user?.live_photo,
        livePhoto: data.user.live_photo || editLivePhoto || user?.live_photo,
        photo_url: data.user.live_photo || editLivePhoto || user?.live_photo
      };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("voterUser", JSON.stringify(updated));
      if (editLivePhoto) {
        localStorage.setItem("elector_captured_photo", editLivePhoto);
      }
      setIsEditingProfile(false);
      alert("Elector profile updated successfully.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadParchiAsPdf = async () => {
    if (isExportingParchiPdf) return;
    try {
      setIsExportingParchiPdf(true);
      const parchiElement = document.getElementById("eci-official-parchi-sheet");
      if (parchiElement) {
        await exportToPdf(parchiElement, `ECI_Voter_Slip_${user?.voterId || user?.voter_id || "PARCHI"}.pdf`, {
          orientation: "portrait",
          scale: 2.5
        });
      } else {
        window.print();
      }
    } catch (err) {
      console.error("Voter Parchi PDF generation error:", err);
      window.print();
    } finally {
      setIsExportingParchiPdf(false);
    }
  };

  const loadResults = async (electionId = election?.id) => {
    if (!electionId) {
      alert("No election selected.");
      return;
    }
    try {
      setResultsLoading(true);
      setMessage("");

      const authToken = localStorage.getItem("token") || localStorage.getItem("voterToken");
      if (!authToken) {
        alert("Please login first.");
        return;
      }

      const response = await fetch(
        `${API}/results/election/${electionId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Failed to load results.");
        return;
      }

      setResults(data);
      setShowResults(true);

    } catch (error) {
      console.error("Results loading error:", error);
      alert("Failed to connect to backend.");
    } finally {
      setResultsLoading(false);
    }
  };

  const renderOfficialReceiptSlip = (receipt, isModal = false) => {
    if (!receipt) return null;
    return (
      <div 
        id={`eci-receipt-slip-${receipt.receipt_code || "active"}`}
        className="printable-receipt" 
        style={{
          background: "#ffffff",
          border: "2px solid #cbd5e1",
          borderRadius: "8px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          position: "relative",
          color: "#0f172a",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}
      >
        {/* Tricolor Ribbon Header */}
        <div style={{ height: "6px", background: "linear-gradient(90deg, #ea580c 33.3%, #ffffff 33.3%, #ffffff 66.6%, #15803d 66.6%)", borderBottom: "1px solid #e2e8f0" }}></div>

        {/* Official Header */}
        <div style={{ padding: "20px 24px 16px", textAlign: "center", borderBottom: "2px dashed #cbd5e1", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginBottom: "6px" }}>
            <ECIEmblem size={44} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a", letterSpacing: "1px" }}>भारत निर्वाचन आयोग</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", letterSpacing: "0.5px" }}>ELECTION COMMISSION OF INDIA</div>
            </div>
          </div>
          <div style={{ display: "inline-block", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: "11.5px", fontWeight: "700", padding: "3px 14px", borderRadius: "12px", letterSpacing: "0.5px", marginTop: "4px" }}>
            डिजिटल मतदान पावती | OFFICIAL DIGITAL VOTING RECEIPT
          </div>
          <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "4px" }}>
            Official Blockchain Voting Slip • Election Commission of India
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "20px 24px" }}>
          {/* Verification Status Banner */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 16px", borderRadius: "6px", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#dcfce7", display: "grid", placeItems: "center" }}>
                <IconCheck size={16} color="#16a34a" />
              </div>
              <div>
                <strong style={{ color: "#166534", fontSize: "13px", display: "block" }}>VOTE SUCCESSFULLY RECORDED ON BLOCKCHAIN</strong>
                <span style={{ color: "#15803d", fontSize: "11px" }}>Cryptographically Verified and Tamper-Proof</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>POLL TIMESTAMP (IST)</span>
              <strong style={{ fontSize: "12px", color: "#0f172a" }}>{receipt.created_at ? formatReceiptLedgerTime(receipt.created_at) : "Recorded on Ledger"}</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Left Column: Elector & Booth Details */}
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  1. Elector Identity & Jurisdiction
                </span>
                {(user?.live_photo || user?.livePhoto || user?.photo_url || receipt.elector_photo || localStorage.getItem("elector_captured_photo")) && (
                  <img 
                    src={user?.live_photo || user?.livePhoto || user?.photo_url || receipt.elector_photo || localStorage.getItem("elector_captured_photo")}
                    alt="Elector Biometric Photo"
                    style={{ width: "42px", height: "52px", objectFit: "cover", borderRadius: "3px", border: "1.5px solid #1e3a8a" }}
                  />
                )}
              </div>
              <div style={{ display: "grid", gap: "8px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Elector Full Name:</span>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{receipt.elector_name || user?.name || "Aadhaar Verified Citizen"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>EPIC Voter ID:</span>
                  <strong style={{ background: "#1e3a8a", color: "#ffffff", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontFamily: "monospace", display: "inline-block" }}>
                    {receipt.elector_epic_id || user?.voterId || user?.voter_id || "N/A"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Constituency:</span>
                  <strong>{receipt.constituency_name ? `${receipt.constituency_name} (${receipt.constituency_code || 'PC'})` : (user?.constituency_name || "Assigned Constituency")}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Polling Station / Booth:</span>
                  <span>{receipt.polling_station_name ? `${receipt.polling_station_name} (${receipt.polling_station_code || 'PS'})` : "Main Polling Booth #01"}</span>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>State / UT:</span>
                  <span>{receipt.elector_address || user?.stateName || user?.address || "Republic of India"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Ballot Details */}
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                2. Recorded Ballot Particulars
              </div>
              <div style={{ display: "grid", gap: "8px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Election Title:</span>
                  <strong style={{ color: "#0f172a" }}>{receipt.election_title || election?.title}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Election Code / Scope:</span>
                  <code>{receipt.election_code || election?.election_code || "ECI-ELECTION"}</code> • <span style={{ color: "#475569" }}>{receipt.election_level || election?.election_level || "National"}</span>
                </div>
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 14px", borderRadius: "6px", marginTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ color: "#1e40af", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Statutory Recorded Choice:
                    </span>
                    <button
                      type="button"
                      className="no-print"
                      onClick={() => setSecretBallotMode(!secretBallotMode)}
                      style={{
                        background: secretBallotMode ? "#dbeafe" : "#fef3c7",
                        border: `1px solid ${secretBallotMode ? "#93c5fd" : "#fcd34d"}`,
                        borderRadius: "4px",
                        padding: "3px 8px",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        color: secretBallotMode ? "#1e40af" : "#92400e",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <IconLock size={11} color={secretBallotMode ? "#1e40af" : "#92400e"} />
                      <span>{secretBallotMode ? "Reveal Choice (Private Peek)" : "Conceal (Secret Ballot Mode)"}</span>
                    </button>
                  </div>

                  {secretBallotMode ? (
                    <div style={{ padding: "8px 10px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1e3a8a", fontWeight: "700", fontSize: "12px" }}>
                        <IconShield size={14} color="#1e3a8a" />
                        <span>BALLOT CHOICE CONCEALED (SECTION 128 RPA 1951)</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                        Anti-Coercion Secret Ballot Protection Active. Candidate selection is concealed to prevent vote buying or coercion.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                      <div>
                        <strong style={{ color: "#1e3a8a", fontSize: "13px" }}>{receipt.candidate_name || "Choice Recorded & Sealed"}</strong>
                        <span style={{ display: "block", fontSize: "11px", color: "#475569" }}>{receipt.candidate_party || "ECI Recognized Party"}</span>
                        <span style={{ display: "block", fontSize: "10px", color: "#b45309", fontWeight: "600", marginTop: "2px" }}>
                          (Private Elector View - Do Not Share with Third Parties)
                        </span>
                      </div>
                      <div style={{ textAlign: "right", background: "#ffffff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>
                        <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>SYMBOL</span>
                        <strong style={{ fontSize: "12px", color: "#ea580c" }}>{receipt.candidate_symbol || "Lotus"}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Blockchain Proof & Audit Trails */}
          <div style={{ marginTop: "18px", background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              3. Cryptographic Blockchain Proof & Audit Trails
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Official Receipt Verification Code:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <strong style={{ fontSize: "14px", color: "#1e3a8a", fontFamily: "monospace", background: "#e0f2fe", padding: "2px 8px", borderRadius: "4px", border: "1px solid #bae6fd" }}>
                    {receipt.receipt_code}
                  </strong>
                  <button 
                    className="no-print" 
                    type="button" 
                    onClick={() => copyReceiptCode(receipt.receipt_code)} 
                    style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "3px 8px", fontSize: "11px", cursor: "pointer", color: "#334155", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    {receiptCopied ? <IconCheck size={12} color="#15803d" /> : <IconCopy size={12} />}
                    <span>{receiptCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Block Height & Gas Used:</span>
                <div style={{ marginTop: "2px" }}>
                  <strong style={{ color: "#0f172a" }}>Block #{receipt.block_number || "Confirmed"}</strong> • <span style={{ color: "#64748b" }}>{receipt.gas_used || "80,646"} gas</span>
                </div>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Blockchain Transaction Hash:</span>
                <code style={{ fontSize: "11px", wordBreak: "break-all", color: "#0f172a", background: "#ffffff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", display: "block", marginTop: "2px" }}>
                  {receipt.tx_hash}
                </code>
              </div>
              {receipt.digital_signature && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>SHA-256 Digital Verification Signature:</span>
                  <code style={{ fontSize: "10px", wordBreak: "break-all", color: "#166534", background: "#f0fdf4", padding: "4px 8px", borderRadius: "4px", border: "1px solid #bbf7d0", display: "block", marginTop: "2px" }}>
                    {receipt.digital_signature}
                  </code>
                </div>
              )}
              {receipt.ballot_inclusion_hash && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>Section 128 RPA 1951 Cryptographic Ballot Inclusion Proof Hash:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <code style={{ fontSize: "10px", wordBreak: "break-all", color: "#1e40af", background: "#eff6ff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #bfdbfe", flex: 1 }}>
                      {receipt.ballot_inclusion_hash}
                    </code>
                    <button
                      className="no-print"
                      type="button"
                      onClick={() => copyReceiptCode(receipt.ballot_inclusion_hash)}
                      style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", cursor: "pointer", color: "#334155" }}
                      title="Copy Ballot Inclusion Proof Hash"
                    >
                      <IconCopy size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code and National Voter Helpline Section */}
          <div style={{ marginTop: "18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "14px 18px", borderRadius: "6px", border: "1px dashed #cbd5e1", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`http://localhost:5000/api/gov/verify-receipt/${receipt.receipt_code}`)}`} 
                alt="ECI Verification QR" 
                crossOrigin="anonymous"
                style={{ width: "90px", height: "90px", border: "1px solid #cbd5e1", padding: "4px", background: "#ffffff", borderRadius: "4px" }} 
              />
              <div>
                <strong style={{ fontSize: "12px", color: "#1e3a8a", display: "block" }}>ECI VERIFICATION QR CODE</strong>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "3px 0 6px", maxWidth: "340px", lineHeight: "1.4" }}>
                  Scan with any smartphone camera to verify this voting slip online.
                </p>
                <a 
                  href={`http://localhost:5000/api/gov/verify-receipt/${receipt.receipt_code}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ fontSize: "11.5px", color: "#2563eb", fontWeight: "600", textDecoration: "underline" }}
                >
                  Verify Slip Online →
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ padding: "8px 12px", background: "#f8fafc", border: "1.5px solid #1e3a8a", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "9px", color: "#1e3a8a", display: "block", fontWeight: "800", textTransform: "uppercase" }}>PRESIDING OFFICER</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#1e3a8a", fontFamily: "serif" }}>VERIFIED & SEALED</span>
                <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>SDEMS On-Chain Node</span>
              </div>
              <div style={{ padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", textAlign: "center" }}>
                <span style={{ fontSize: "10px", color: "#64748b", display: "block", fontWeight: "bold" }}>NATIONAL VOTER HELPLINE</span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#ea580c" }}>1950</span>
                <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>Toll-Free Statutory 24x7</span>
              </div>
            </div>
          </div>

          {/* Digital Receipt Note */}
          <div style={{ marginTop: "14px", textAlign: "center", fontSize: "10.5px", color: "#64748b", lineHeight: "1.5" }}>
            This digital receipt confirms that your ballot was recorded and securely sealed on the blockchain ledger.
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="no-print" style={{ padding: "14px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button 
              type="button"
              onClick={() => downloadReceiptAsPdf(receipt)} 
              disabled={isExportingPdf}
              className="primary-btn" 
              style={{ background: "#1e3a8a", padding: "9px 18px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px", cursor: isExportingPdf ? "wait" : "pointer" }}
              title="Download official high-resolution statutory voting receipt as PDF"
            >
              <IconDownload size={15} /> {isExportingPdf ? "Generating Official PDF..." : "Download Official Receipt (PDF)"}
            </button>
            <button 
              type="button"
              onClick={() => window.print()} 
              className="primary-btn" 
              style={{ background: "#0284c7", padding: "9px 18px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px" }}
              title="Print official receipt or save as PDF via system dialog"
            >
              <IconPrint size={15} /> Print / Save as PDF
            </button>
            <button 
              type="button"
              onClick={() => copyReceiptCode(receipt.receipt_code)} 
              className="primary-btn" 
              style={{ background: "#475569", padding: "9px 14px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}
              title="Copy official cryptographic receipt verification code"
            >
              <IconCopy size={14} />
              <span>{receiptCopied ? "Code Copied" : "Copy Code"}</span>
            </button>
            <button 
              type="button"
              onClick={() => downloadReceiptAsText(receipt)} 
              className="secondary-btn" 
              style={{ background: "#ffffff", borderColor: "#cbd5e1", padding: "9px 14px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}
              title="Download raw plain-text cryptographic audit record"
            >
              <span>Audit (.txt)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLedgerQuery(receipt.receipt_code);
                setShowLedgerExplorer(true);
                auditLedgerTransaction(receipt.receipt_code);
              }}
              className="primary-btn"
              style={{ background: "#059669", padding: "9px 14px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}
              title="Audit this ballot on Ethereum blockchain node RPC"
            >
              <IconShield size={14} color="#ffffff" />
              <span>Audit On Ledger</span>
            </button>
          </div>

          {isModal && (
            <button 
              type="button"
              onClick={() => setShowReceiptModal(false)} 
              className="primary-btn" 
              style={{ background: "#64748b", padding: "9px 18px", fontSize: "12.5px" }}
            >
              Close & Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  };

  const castVote = async (candidateId, candidateName) => {
    const confirmed = window.confirm(
      `Are you sure you want to vote for ${candidateName}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage("Preparing vote...");

      // Compute on-chain indices for client-side casting
      const sortedCandidates = [...candidates].sort((a, b) => Number(a.id) - Number(b.id));
      const candidateIndex = sortedCandidates.findIndex(c => String(c.id) === String(candidateId));
      if (candidateIndex === -1) {
        throw new Error("Candidate mapping not found.");
      }
      const blockchainCandidateId = candidateIndex + 1;
      const blockchainElectionId = election.blockchain_election_id;

      let transactionHash = "";

      // Try casting vote using MetaMask client-side first if connected and enabled
      if (window.ethereum && connectedWallet && !bypassMetaMask) {
        try {
          setMessage("Please confirm transaction in MetaMask...");
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const signer = await browserProvider.getSigner();
          const contractAddressToUse = health?.services?.contract?.address || election?.contract_address || health?.services?.blockchain?.address || CONTRACT_ADDRESS;
          const votingContractInstance = new ethers.Contract(contractAddressToUse, CONTRACT_ABI, signer);
          
          const tx = await votingContractInstance.castVote(blockchainElectionId, blockchainCandidateId);
          setMessage("Submitting transaction to blockchain network...");
          const receipt = await tx.wait();
          transactionHash = receipt.hash;
          console.log("Client-side vote casted: txHash =", transactionHash);
        } catch (contractErr) {
          if (contractErr.code === "ACTION_REJECTED" || (contractErr.message && contractErr.message.includes("rejected"))) {
            throw new Error("Transaction rejected in MetaMask.", { cause: contractErr });
          }
          // Otherwise, proceed to fallback backend voting
        }
      }

      setMessage("Computing elector cryptographic vote signature...");
      const clientVoteTimestamp = Date.now();
      const voteNonce = Math.floor(Math.random() * 1e9).toString();
      const rawSignaturePayload = `BALLOT_SIGNATURE:${user?.id || user?.voter_id || "ELECTOR"}:${election.id}:${candidateId}:${clientVoteTimestamp}:${voteNonce}`;
      let clientVoteSignature = "";
      try {
        if (window.crypto && window.crypto.subtle) {
          const msgUint8 = new TextEncoder().encode(rawSignaturePayload);
          const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
          clientVoteSignature = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
        }
      } catch (subtleErr) {
        console.warn("[Vote Signing] SubtleCrypto signature fallback:", subtleErr);
      }

      setMessage("Finalizing and synchronizing vote with database...");
      
      const payload = {
        electionId: election.id,
        candidateId,
        clientVoteSignature,
        voteNonce,
        clientVoteTimestamp
      };
      if (transactionHash) {
        payload.transactionHash = transactionHash;
      }

      const effectiveToken = token || localStorage.getItem("voterToken") || localStorage.getItem("token") || "";

      const response = await fetch(`${API}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Vote failed.");
      }

      setMessage(
        `Vote successfully recorded. Transaction: ${
          data.blockchain?.transactionHash || transactionHash || "confirmed"
        }`
      );

      const currentElectionId = election.id;

      // Immediately display the official receipt modal with the newly generated receipt
      if (data.receipt) {
        setVoterReceipt(data.receipt);
        setShowReceiptModal(true);
      } else {
        const rcpt = await loadReceipt(effectiveToken, currentElectionId);
        if (rcpt) setVoterReceipt(rcpt);
        setShowReceiptModal(true);
      }

      // Mark this election as voted in local state immediately so candidate buttons vanish instantly
      setElection(prev => prev ? { ...prev, has_voted: true } : prev);
      setElectionsList(prevList => prevList.map(e => e.id === currentElectionId ? { ...e, has_voted: true } : e));

      // Reload that specific election so backend confirmation and receipt remain synced
      await loadElection(effectiveToken, currentElectionId);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem("voterToken");
    localStorage.removeItem("voterUser");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setElection(null);
    setCandidates([]);
    setResults(null);
    setVoterReceipt(null);
    setShowResults(false);
    setShowAdmin(false);
    setMessage("");
  };

  // ============================================================
  // SYSTEM INITIALIZATION SCREEN
  // ============================================================

  const isHealthy = health && health.overallStatus === "ONLINE";

  const getFailedService = () => {
    if (!health) {
      return { name: "Backend API Server", status: "OFFLINE", reason: "Unable to connect to Express backend on port 5000." };
    }
    if (health.services.database.status !== "ONLINE") {
      return { name: "PostgreSQL Database Server", status: "OFFLINE", reason: health.services.database.message || "PostgreSQL database connection refused." };
    }
    if (health.services.blockchain.status !== "ONLINE") {
      return { name: "Blockchain Local RPC", status: "OFFLINE", reason: health.services.blockchain.message || "Hardhat blockchain node on port 8545 is offline." };
    }
    if (health.services.contract.status !== "VERIFIED") {
      return { name: "Solidity Smart Contract", status: "OFFLINE", reason: health.services.contract.message || "Smart contract is not compiled or deployed to local node." };
    }
    if (health.services.analytics.status !== "ONLINE") {
      return { name: "Python Analytics Engine", status: "OFFLINE", reason: health.services.analytics.message || "Voter analytics script not detected." };
    }
    return null;
  };

  const failedService = getFailedService();

  if (!bypassInit && (!initChecked || failedService)) {
    // Custom labels for the diagnostic screens
    let serviceHeader = "Database Service";
    let serviceDot = "● PostgreSQL";
    let requiredAction = "Please start the PostgreSQL Windows service.";

    if (failedService) {
      if (failedService.name.includes("PostgreSQL") || failedService.name.includes("Database")) {
        serviceHeader = "Database Service";
        serviceDot = "● PostgreSQL";
        requiredAction = "Please start the PostgreSQL Windows service.";
      } else if (failedService.name.includes("Blockchain")) {
        serviceHeader = "Blockchain Service";
        serviceDot = "● Hardhat RPC Node";
        requiredAction = "Verify local port 8545 is available and not in use by another program.";
      } else if (failedService.name.includes("Smart Contract") || failedService.name.includes("Solidity")) {
        serviceHeader = "Electoral Smart Contract";
        serviceDot = "● EVoting Solidity Contract";
        requiredAction = "Recompile and deploy smart contracts on local hardhat network.";
      } else if (failedService.name.includes("Backend")) {
        serviceHeader = "Express Backend Service";
        serviceDot = "● API Server";
        requiredAction = "Ensure backend directory, server scripts, and dependencies are intact.";
      } else {
        serviceHeader = "Analytics Engine";
        serviceDot = "● Python Service";
        requiredAction = "Check that Python analytics scripts are available.";
      }
    }

    return (
      <div className="init-screen" style={{
        background: "#0f172a",
        color: "#f8fafc",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {failedService && initChecked ? (
          /* SYSTEM INITIALIZATION SCREEN (OFFLINE STATE) */
          <div style={{
            background: "#1e293b",
            border: "2px solid #ef4444",
            borderRadius: "16px",
            padding: "40px",
            width: "500px",
            textAlign: "left",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#f8fafc", borderBottom: "2px solid #ef4444", paddingBottom: "10px", margin: "0 0 20px" }}>
              SDEMS SYSTEM INITIALIZATION
            </h2>
            
            <div style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
              <span style={{ color: "#94a3b8", display: "block", textTransform: "uppercase", fontSize: "12px", fontWeight: "bold" }}>
                {serviceHeader}
              </span>
              <strong style={{ color: "#f87171", fontSize: "16px" }}>{serviceDot}</strong>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", background: "#0f172a", padding: "10px 15px", borderRadius: "6px" }}>
                <span>Status:</span>
                <strong style={{ color: "#ef4444" }}>OFFLINE</strong>
              </div>
            </div>

            <div style={{ background: "#334155", padding: "15px", borderRadius: "6px", fontSize: "13px", color: "#cbd5e1", marginBottom: "25px" }}>
              <strong style={{ display: "block", color: "#f8fafc", marginBottom: "5px" }}>Required Action:</strong>
              {requiredAction}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => {
                  setInitChecked(false);
                  if (window.electronAPI && window.electronAPI.restartServices) {
                    window.electronAPI.restartServices().then(() => {
                      fetchVoterHealth();
                    });
                  } else {
                    fetchVoterHealth();
                  }
                }}
                style={{
                  flex: 1,
                  background: "#ea580c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px"
                }}>
                Retry
              </button>
              
              <button 
                onClick={() => {
                  if (window.electronAPI && window.electronAPI.openLogFolder) {
                    window.electronAPI.openLogFolder();
                  } else {
                    alert("Diagnostics are only available inside the desktop application container.");
                  }
                }}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "#cbd5e1",
                  border: "1px solid #475569",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px"
                }}>
                View Diagnostics
              </button>

              <button 
                onClick={() => {
                  if (window.electronAPI && window.electronAPI.exitApp) {
                    window.electronAPI.exitApp();
                  } else {
                    window.close();
                  }
                }}
                style={{
                  flex: 1,
                  background: "#be123c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px"
                }}>
                Exit
              </button>
            </div>
          </div>
        ) : (
          /* INITIALIZATION CHECKLIST SCREEN */
          <div style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "40px",
            width: "480px",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", margin: "0 0 5px", color: "white" }}>
              SDEMS
            </h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 25px" }}>
              Secure Decentralized Election Management System
            </p>

            <h3 style={{ fontSize: "14px", textAlign: "left", margin: "0 0 15px", color: "#e2e8f0", borderBottom: "1px solid #334155", paddingBottom: "8px" }}>
              System Initialization
            </h3>

            <div style={{ textAlign: "left", marginBottom: "25px", fontSize: "13px", fontFamily: "monospace", color: "#cbd5e1", display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>PostgreSQL ........</span>
                <strong style={{ color: health?.services?.database?.status === "ONLINE" ? "#22c55e" : "#ea580c" }}>
                  {health?.services?.database?.status === "ONLINE" ? "ONLINE" : "PENDING..."}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Blockchain ........</span>
                <strong style={{ color: health?.services?.blockchain?.status === "ONLINE" ? "#22c55e" : "#ea580c" }}>
                  {health?.services?.blockchain?.status === "ONLINE" ? "ONLINE" : "PENDING..."}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Smart Contract ....</span>
                <strong style={{ color: health?.services?.contract?.status === "VERIFIED" ? "#22c55e" : "#ea580c" }}>
                  {health?.services?.contract?.status === "VERIFIED" ? "VERIFIED" : "PENDING..."}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Backend API .......</span>
                <strong style={{ color: health?.services?.backend?.status === "ONLINE" ? "#22c55e" : "#ea580c" }}>
                  {health?.services?.backend?.status === "ONLINE" ? "ONLINE" : "PENDING..."}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Analytics .........</span>
                <strong style={{ color: health?.services?.analytics?.status === "ONLINE" ? "#22c55e" : "#ea580c" }}>
                  {health?.services?.analytics?.status === "ONLINE" ? "ONLINE" : "PENDING..."}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => {
                  setInitChecked(false);
                  fetchVoterHealth();
                }}
                style={{
                  flex: 1,
                  background: "#ea580c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px"
                }}>
                Verify System Status
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // LOGGED-IN DASHBOARD
  // ============================================================
  if (token && user) {
    const adminRoles = [
      "ADMIN", "SUPER_ADMIN", "ELECTION_COMMISSIONER", "STATE_ELECTION_OFFICER",
      "DISTRICT_ELECTION_OFFICER", "RETURNING_OFFICER", "PRESIDING_OFFICER",
      "POLLING_OFFICER", "OBSERVER", "AUDITOR"
    ];
    const isAdmin = adminRoles.includes(user.role);

    return (
      <div className="app">
        {/* Official GOV/ECI Top Accessibility Bar */}
        <div className="gov-top-bar" style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "5px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10.5px",
          color: "#475569",
          fontWeight: "600",
          letterSpacing: "0.5px",
          borderTop: "3px solid #ea580c" /* Saffron Top border */
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span>भारत सरकार | GOVERNMENT OF INDIA</span>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <span>ELECTION COMMISSION OF INDIA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setScreenReaderActive(!screenReaderActive);
                setMessage(screenReaderActive ? "Screen reader optimization deactivated." : "Screen reader mode activated: High-contrast indicators and live ARIA announcements enabled.");
              }}
              title="Toggle Screen Reader Accessibility Mode"
            >
              Screen Reader {screenReaderActive ? "(Active)" : ""}
            </button>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <div style={{ display: "flex", gap: "2px" }}>
              <button
                type="button"
                onClick={() => handleFontSizeChange("small")}
                style={{ background: fontSizeLevel === "small" ? "#cbd5e1" : "transparent", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "11px", padding: "1px 5px", borderRadius: "3px", color: "#1e293b" }}
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange("normal")}
                style={{ background: fontSizeLevel === "normal" ? "#cbd5e1" : "transparent", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "11px", padding: "1px 5px", borderRadius: "3px", color: "#1e293b" }}
                title="Standard Font Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange("large")}
                style={{ background: fontSizeLevel === "large" ? "#cbd5e1" : "transparent", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "11px", padding: "1px 5px", borderRadius: "3px", color: "#1e293b" }}
                title="Increase Font Size"
              >
                A+
              </button>
            </div>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <span style={{ color: "#1e3a8a", fontWeight: "700" }}>ENGLISH</span>
          </div>
        </div>

        {/* ======================================================
            NAVBAR
        ====================================================== */}

        <nav className="navbar" style={{ height: "66px", padding: "0 24px", background: "#ffffff", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div className="brand" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <ECIEmblem size={44} />
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#1e3a8a" }}>भारत निर्वाचन आयोग</span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <h2 style={{ fontSize: "14.5px", fontWeight: "800", color: "#1e3a8a", margin: 0, letterSpacing: "0.3px" }}>ELECTION COMMISSION OF INDIA</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <span style={{ fontSize: "11px", color: "#ea580c", fontWeight: "700" }}>National E-Voting Portal (SDEMS)</span>
                <span style={{ background: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", padding: "0 6px", borderRadius: "3px", fontSize: "9.5px", fontWeight: "bold" }}>
                  {isAdmin ? "OFFICIAL CONSOLE" : "VOTER PORTAL"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* User Profile Chip */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "5px 12px", borderRadius: "6px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#ea580c", color: "white", display: "grid", placeItems: "center", fontWeight: "bold", fontSize: "11px" }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ textAlign: "left" }}>
                <strong style={{ display: "block", fontSize: "12px", color: "#0f172a", lineHeight: "1.2" }}>{user.name}</strong>
                <span style={{ fontSize: "10px", color: "#64748b" }}>{user.voterId || user.voter_id || user.email} • {user.role || "VOTER"}</span>
              </div>
            </div>

            {/* Node Status Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "5px 10px", borderRadius: "6px", fontSize: "11px", color: "#166534", fontWeight: "600" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
              Node 8545: Online
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="secondary-btn"
                style={{ padding: "6px 14px", fontSize: "12px", background: showAdmin ? "#ea580c" : "#1e3a8a", color: "white", border: "none" }}
              >
                {showAdmin ? "Switch to Elector View" : "Official Administrative Console"}
              </button>
            )}

            <button
              onClick={() => {
                setShowLedgerExplorer(true);
                if (voterReceipt?.receipt_code) {
                  setLedgerQuery(voterReceipt.receipt_code);
                  auditLedgerTransaction(voterReceipt.receipt_code);
                }
              }}
              className="secondary-btn"
              style={{ padding: "6px 12px", fontSize: "12px", background: "#f0fdf4", color: "#166534", borderColor: "#86efac", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}
              title="Audit blockchain transactions, receipts, and blocks directly on Ethereum ledger"
            >
              <IconShield size={13} color="#16a34a" />
              <span>Ledger Explorer</span>
            </button>

            <button
              onClick={() => setShowAboutModal(true)}
              className="secondary-btn"
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              System Specifications
            </button>

            <button 
              onClick={logout}
              className="secondary-btn"
              style={{ padding: "6px 14px", fontSize: "12px", color: "#b91c1c", borderColor: "#fecaca" }}
            >
              Sign Out
            </button>
          </div>
        </nav>


        {/* ======================================================
            DASHBOARD
        ====================================================== */}

        <main className="dashboard" style={{ padding: 0, background: "#f1f5f9", minHeight: "calc(100vh - 90px)" }}>

          {/* ====================================================
              ADMIN DASHBOARD
          ==================================================== */}

          {showAdmin && isAdmin && (
            <Suspense fallback={
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", border: "3px solid #cbd5e1", borderTopColor: "#1e3a8a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                <div style={{ fontSize: "14px", color: "#1e3a8a", fontWeight: "600" }}>Initializing Official Administrative Console...</div>
              </div>
            }>
              <AdminDashboard />
            </Suspense>
          )}


          {/* ====================================================
              VOTER DASHBOARD
          ==================================================== */}

          {(!showAdmin || !isAdmin) && (
            <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "20px 24px", width: "100%" }}>
              {/* VOTER NAVIGATION RIBBON */}
              <div style={{
                display: "flex",
                background: "white",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "5px",
                gap: "6px",
                marginBottom: "20px",
                overflowX: "auto"
              }}>
                {[
                  { id: "profile", label: "My Voter ID" },
                  { id: "booth", label: "Polling Booth & Slip" },
                  { id: "kyc", label: "Know Your Candidate (KYC)" },
                  { id: "current", label: "Cast Vote" },
                  { id: "verify_ballot", label: "Verify Ballot On-Chain" },
                  { id: "receipt", label: "Voting Receipt" },
                  { id: "services", label: "Electoral Services & Form 8" },
                  { id: "results", label: "Election Results" },
                  { id: "atlas", label: "Election Map" },
                  { id: "grievances", label: "Help & Grievances" },
                  { id: "compliance", label: "Report MCC Violation" },
                  { id: "calendar", label: "Election Schedule" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setVoterActiveTab(tab.id); setMessage(""); }}
                    style={{
                      flex: "1 1 auto",
                      padding: "9px 14px",
                      border: "none",
                      borderRadius: "6px",
                      background: voterActiveTab === tab.id ? "#1e3a8a" : "transparent",
                      color: voterActiveTab === tab.id ? "white" : "#475569",
                      fontWeight: voterActiveTab === tab.id ? "700" : "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* MESSAGES & LOGGING */}
              {message && (
                <div className="message" style={{ margin: "10px 0 20px", padding: "10px", borderRadius: "4px" }}>
                  {message}
                </div>
              )}

              {loading && (
                <div className="loading" style={{ margin: "10px 0 20px", padding: "10px" }}>
                  Processing operation...
                </div>
              )}

              {/* TABS 1: MY PROFILE */}
              {voterActiveTab === "profile" && (
                <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left" }}>
                  {/* OFFICIAL ECI PVC ELECTORS PHOTO IDENTITY CARD (EPIC) */}
                  <div className="eci-epic-wrapper">
                    <div className="eci-epic-toolbar no-print">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <ECIEmblem size={34} />
                        <div>
                          <strong style={{ fontSize: "13.5px", color: "#1e3a8a", display: "block" }}>Official Digital e-EPIC (Electors Photo Identity Card)</strong>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>Digital Elector Photo Identity Card • Election Commission of India</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={downloadEpicAsPdf}
                          disabled={isExportingEpicPdf}
                          className="primary-btn btn-sm"
                          style={{ background: "#1e3a8a", cursor: isExportingEpicPdf ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                          title="Download High-Resolution Official Digital E-EPIC as PDF"
                        >
                          <IconDownload size={14} />
                          <span>{isExportingEpicPdf ? "Generating e-EPIC PDF..." : "Download e-EPIC Card (PDF)"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="secondary-btn btn-sm"
                          style={{ background: "#ffffff", borderColor: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}
                          title="Print official e-EPIC or save as PDF via print dialog"
                        >
                          <IconPrint size={14} />
                          <span>Print / Save as PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Official Printable & PDF Capturable e-EPIC Sheet */}
                    <div id="eci-official-epic-sheet" className="eci-epic-sheet">
                      {/* Document Banner */}
                      <div className="eci-epic-sheet-header">
                        <div className="eci-epic-sheet-header-top">
                          <ECIEmblem size={44} />
                          <div className="eci-epic-sheet-header-title">
                            <h3>भारत निर्वाचन आयोग | ELECTION COMMISSION OF INDIA</h3>
                            <h4>राष्ट्रीय मतदाता सेवा पोर्टल • ई-मतदाता फोटो पहचान पत्र (e-EPIC)</h4>
                          </div>
                        </div>
                        <div className="eci-epic-sheet-banner">
                          FORM 6 COMPLIANT • STATUTORY ELECTORAL ROLL IDENTIFICATION • CONSTITUTION OF INDIA (ART. 324)
                        </div>
                      </div>

                      {/* PVC Card Duplex Presentation (Front & Back) */}
                      <div className="eci-epic-cards-grid">
                        {/* CARD FRONT: ELECTOR IDENTITY */}
                        <div className="eci-epic-card">
                          <div className="eci-epic-tricolor-bar"></div>
                          <div className="eci-epic-header">
                            <ECIEmblem size={32} />
                            <div className="eci-epic-header-text">
                              <h4>भारत निर्वाचन आयोग</h4>
                              <span>ELECTION COMMISSION OF INDIA</span>
                              <div className="eci-epic-subtag">मतदाता फोटो पहचान पत्र - E-EPIC</div>
                            </div>
                            <div className="eci-epic-hologram" title="Official 3D Holographic Security Seal">
                              <div className="eci-epic-hologram-inner">
                                <IconShield size={14} color="#1e3a8a" />
                              </div>
                            </div>
                          </div>

                          {/* Alphanumeric EPIC Number Banner */}
                          <div className="eci-epic-serial-strip">
                            <span>ईपिक संख्या / EPIC NO.</span>
                            <code>{user?.voterId || user?.voter_id || "EPIC-PENDING"}</code>
                          </div>

                          {/* Authentic Barcode Graphic */}
                          <div className="eci-epic-barcode" title="Encrypted Machine-Readable Barcode"></div>

                          {/* Card Front Body */}
                          <div className="eci-epic-body">
                            <div className="eci-epic-photo-box">
                              { (user?.live_photo || user?.livePhoto || user?.photo_url || localStorage.getItem("elector_captured_photo")) ? (
                                <img
                                  src={user?.live_photo || user?.livePhoto || user?.photo_url || localStorage.getItem("elector_captured_photo")}
                                  alt="Elector Biometric Portrait"
                                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "3px" }}
                                />
                              ) : (
                                <>
                                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#e2e8f0", display: "grid", placeItems: "center", color: "#1e3a8a", fontWeight: "bold", fontSize: "18px" }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : "E"}
                                  </div>
                                  <span style={{ fontSize: "8.5px", color: "#64748b", marginTop: "4px", fontWeight: "700" }}>ELECTOR PHOTO</span>
                                </>
                              )}
                              <div className="eci-epic-photo-watermark">ECI SECURE</div>
                            </div>
                            <div className="eci-epic-details">
                              <div className="eci-epic-row">
                                <label>नाम / Name:</label>
                                <strong>{user?.name || "Verified Citizen"}</strong>
                              </div>
                              <div className="eci-epic-row">
                                <label>पिता/पति का नाम:</label>
                                <strong>{user?.relativeName || user?.relative_name || "Recorded in Form 6"}</strong>
                              </div>
                              <div className="eci-epic-row">
                                <label>लिंग / Gender:</label>
                                <strong>{user?.gender || "Male"}</strong>
                              </div>
                              <div className="eci-epic-row">
                                <label>जन्म तिथि / DOB:</label>
                                <strong>{user?.dob ? format12HourDate(user.dob) : "Age 18+ Verified"}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="eci-epic-footer">
                            <span>भारत गणराज्य • REPUBLIC OF INDIA</span>
                            <span style={{ color: "#15803d", fontWeight: "700" }}>SECURE DIGITAL PVC</span>
                          </div>
                        </div>

                        {/* CARD BACK: ELECTORAL JURISDICTION */}
                        <div className="eci-epic-card">
                          <div className="eci-epic-tricolor-bar"></div>
                          <div className="eci-epic-header">
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <strong style={{ fontSize: "11px", color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
                                निर्वाचन क्षेत्र विवरण एवं पता / JURISDICTION
                              </strong>
                              <span style={{ fontSize: "9px", color: "#64748b" }}>Election Commission of India</span>
                            </div>
                            <div style={{ padding: "3px 8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px", fontSize: "9px", color: "#166534", fontWeight: "700" }}>
                              STATUS: ON-CHAIN
                            </div>
                          </div>

                          {/* Card Back Body */}
                          <div className="eci-epic-body" style={{ gap: "10px" }}>
                            <div className="eci-epic-details" style={{ flex: "1 1 60%" }}>
                              <div className="eci-epic-row">
                                <label>पता / Address:</label>
                                <span style={{ fontSize: "10.5px", color: "#0f172a", lineHeight: "1.3" }}>
                                  {user?.address || "Address as declared in Form 6 registration"}
                                </span>
                              </div>
                              <div className="eci-epic-row">
                                <label>जिला / District:</label>
                                <strong>{user?.districtName || user?.district_name || "Assigned District"}</strong>
                              </div>
                              <div className="eci-epic-row">
                                <label>राज्य / State:</label>
                                <strong>{user?.stateName || user?.state_name || "Republic of India"}</strong>
                              </div>
                              <div className="eci-epic-row">
                                <label>विधान सभा / AC:</label>
                                <strong>{user?.constituencyName || user?.constituency_name || (constituencyList.find(c => String(c.id) === String(user?.constituencyId || user?.constituency_id))?.name) || "General AC"}</strong>
                              </div>
                              <div className="eci-epic-row">
                                <label>मतदान केंद्र / PS:</label>
                                <strong style={{ color: "#1e3a8a" }}>{user?.pollingStationName || user?.polling_station_name || "Assigned by ERO"}</strong>
                              </div>
                            </div>

                            {/* Back Right: Scannable QR & Facsimile ERO Stamp */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(`ECI-EPIC:${user?.voterId || user?.voter_id || "CARD"}|NAME:${user?.name || "CITIZEN"}|PS:${user?.pollingStationName || "PS01"}`)}`}
                                alt="Official ECI QR Code"
                                crossOrigin="anonymous"
                                style={{ width: "68px", height: "68px", border: "1px solid #cbd5e1", padding: "2px", background: "#ffffff", borderRadius: "3px" }}
                              />
                              <div className="eci-epic-ero-stamp" style={{ marginTop: "4px" }}>
                                <span className="eci-epic-ero-stamp-title">निर्वाचक रजिस्ट्रीकरण अधिकारी</span>
                                <span className="eci-epic-ero-stamp-sign">E.R. Officer</span>
                                <span style={{ fontSize: "7.5px", color: "#64748b" }}>ELECTORAL REGISTRATION</span>
                              </div>
                            </div>
                          </div>

                          <div className="eci-epic-footer" style={{ borderTop: "1px solid #cbd5e1", fontSize: "8px", color: "#64748b", lineHeight: "1.3" }}>
                            <span>1. Mere possession is not proof of enrollment. Check roll before poll.</span>
                            <span style={{ fontWeight: "700", color: "#1e3a8a" }}>FORM 6 VALIDATED</span>
                          </div>
                        </div>
                      </div>

                      {/* Sheet Trimming & Elector Guidelines */}
                      <div className="eci-epic-cutting-guide">
                        <span>Cut along outer solid border for standard CR-80 PVC identity card (85.60 mm × 53.98 mm)</span>
                        <span>ECI Helpline: <strong>1950</strong> (Toll-Free) • Portal: <strong>voters.eci.gov.in</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>
                    <h3 style={{ color: "#1e3a8a", margin: 0 }}>Statutory Electoral Roll Particulars</h3>
                    {!isEditingProfile && (
                      <button 
                        onClick={() => { 
                          setIsEditingProfile(true); 
                          setEditName(user?.name || ""); 
                          setEditPhone(user?.phone || ""); 
                          setEditAddress(user?.address || ""); 
                          setEditPincode(user?.pincode || "");
                          setEditRelativeName(user?.relativeName || user?.relative_name || "");
                          setEditRelativeType(user?.relativeType || user?.relative_type || "Father");
                          setEditGender(user?.gender || "Male");
                          setEditLivePhoto(user?.live_photo || user?.livePhoto || user?.photo_url || null);
                        }} 
                        className="primary-btn" 
                        style={{ background: "#ea580c", padding: "8px 16px", width: "auto" }}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  {isEditingProfile ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "14px", lineHeight: "1.6", color: "#334155" }}>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Full Name *</label>
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Email Address (Statutory / Read-Only)</label>
                        <input 
                          type="email" 
                          value={user?.email} 
                          disabled 
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", background: "#f1f5f9" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>EPIC Voter ID Code (Statutory / Read-Only)</label>
                        <input 
                          type="text" 
                          value={user?.voterId || user?.voter_id || "N/A"} 
                          disabled 
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", background: "#f1f5f9" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Mobile Number *</label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)} 
                          placeholder="e.g. 9876543210"
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Gender *</label>
                        <select 
                          value={editGender} 
                          onChange={(e) => setEditGender(e.target.value)}
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", background: "#ffffff" }}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Third Gender">Third Gender</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Relation Type *</label>
                        <select 
                          value={editRelativeType} 
                          onChange={(e) => setEditRelativeType(e.target.value)}
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", background: "#ffffff" }}
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Husband">Husband</option>
                          <option value="Legal Guardian">Legal Guardian</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Relative's Full Name</label>
                        <input 
                          type="text" 
                          value={editRelativeName} 
                          onChange={(e) => setEditRelativeName(e.target.value)} 
                          placeholder="Father / Spouse Name"
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Pin Code</label>
                        <input 
                          type="text" 
                          value={editPincode} 
                          onChange={(e) => setEditPincode(e.target.value)} 
                          placeholder="6-digit Postal PIN Code"
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                        />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>Residential Address</label>
                        <input 
                          type="text" 
                          value={editAddress} 
                          onChange={(e) => setEditAddress(e.target.value)} 
                          placeholder="House / Flat No., Street, Locality, City, State"
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                        />
                      </div>
                      <div style={{ gridColumn: "span 2", background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <label style={{ display: "block", color: "#1e3a8a", fontWeight: "700", marginBottom: "6px" }}>Biometric Portrait Photo (e-EPIC Photo Update)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                          {editLivePhoto && (
                            <img 
                              src={editLivePhoto} 
                              alt="Updated Portrait Preview" 
                              style={{ width: "64px", height: "78px", objectFit: "cover", borderRadius: "4px", border: "1.5px solid #1e3a8a" }} 
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setEditLivePhoto(reader.result);
                                  reader.readAsDataURL(file);
                                }
                              }}
                              style={{ fontSize: "12px" }}
                            />
                            <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "4px" }}>
                              Upload a clear, front-facing official portrait photo. This photo will be updated on your digital e-EPIC card and Voter Information Slip.
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                        <button onClick={updateProfile} className="primary-btn" style={{ background: "#22c55e", padding: "10px 20px", width: "auto" }}>Save Changes</button>
                        <button onClick={() => setIsEditingProfile(false)} className="primary-btn" style={{ background: "#64748b", padding: "10px 20px", width: "auto" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "14px", lineHeight: "1.6", color: "#334155" }}>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Full Name:</span>
                        <strong>{user?.name}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Email Address:</span>
                        <strong>{user?.email}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>EPIC Voter ID:</span>
                        <strong style={{ background: "#1e3a8a", color: "white", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace" }}>{user?.voterId || user?.voter_id || "N/A"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Mobile Number:</span>
                        <strong>{user?.phone || "N/A"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Date of Birth & Gender:</span>
                        <strong>{user?.dob ? format12HourDate(user.dob) : "Age 18+ Verified"} ({user?.gender || "Not Specified"})</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Relative ({user?.relativeType || user?.relative_type || "Father"}):</span>
                        <strong>{user?.relativeName || user?.relative_name || "Recorded in Form 6"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Residential Address:</span>
                        <strong>{user?.address || "N/A"} {user?.pincode ? `- ${user.pincode}` : ""}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Assembly Constituency (AC):</span>
                        <strong>{user?.constituencyName || user?.constituency_name || "General Assembly Constituency"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Designated Polling Station:</span>
                        <strong style={{ color: "#1e3a8a" }}>{user?.pollingStationName || user?.polling_station_name || "Assigned by ERO"} ({user?.pollingStationCode || user?.polling_station_code || "PS"})</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>District & State:</span>
                        <strong>{user?.districtName || user?.district_name || "District"}, {user?.stateName || user?.state_name || "Republic of India"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Account & E-Roll Status:</span>
                        <strong style={{ color: user?.is_active ? "#166534" : "#b91c1c" }}>{user?.is_active ? "ACTIVE / AUTHORIZED (VERIFIED ON-CHAIN)" : "SUSPENDED / INACTIVE"}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: DESIGNATED POLLING BOOTH & VOTER INFORMATION SLIP */}
              {voterActiveTab === "booth" && (
                <div style={{ textAlign: "left" }}>
                  {/* TOP NAVIGATOR CARD */}
                  <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", marginBottom: "25px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <ECIEmblem size={44} />
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Designated Polling Station • ECI Official Allocation
                          </div>
                          <h3 style={{ color: "#1e3a8a", margin: "2px 0 0", fontSize: "18px" }}>
                            {user?.pollingStationName || user?.polling_station_name || "Designated Polling Station #01"}
                          </h3>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((user?.pollingStationAddress || user?.pollingStationName || "Polling Station") + " " + (user?.districtName || "") + " " + (user?.stateName || ""))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="primary-btn btn-sm"
                          style={{ background: "#1e3a8a", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                          title="Open physical address in Google Maps for turn-by-turn navigation"
                        >
                          <span>Get Directions (Map)</span>
                        </a>
                        <button
                          type="button"
                          onClick={downloadParchiAsPdf}
                          disabled={isExportingParchiPdf}
                          className="primary-btn btn-sm"
                          style={{ background: "#ea580c", display: "flex", alignItems: "center", gap: "6px" }}
                          title="Download Official Voter Information Slip (Parchi) as PDF"
                        >
                          <IconDownload size={14} />
                          <span>{isExportingParchiPdf ? "Generating Slip..." : "Download Voter Slip (PDF)"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="secondary-btn btn-sm"
                          style={{ display: "flex", alignItems: "center", gap: "6px" }}
                          title="Print official voter slip"
                        >
                          <IconPrint size={14} />
                          <span>Print Slip</span>
                        </button>
                      </div>
                    </div>

                    {/* JURISDICTION & FACILITY GRID */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                      <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>BOOTH CODE</span>
                        <strong style={{ fontSize: "13px", color: "#1e3a8a", fontFamily: "monospace" }}>
                          {user?.pollingStationCode || user?.polling_station_code || "PS-ASSIGNED"}
                        </strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>ASSEMBLY CONSTITUENCY</span>
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                          {user?.constituencyName || user?.constituency_name || "General Assembly"}
                        </strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>DISTRICT & STATE</span>
                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                          {user?.districtName || user?.district_name || "District"}, {user?.stateName || user?.state_name || "State"}
                        </strong>
                      </div>
                      <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>POLL DAY TIMINGS</span>
                        <strong style={{ fontSize: "13px", color: "#15803d" }}>07:00 AM – 06:00 PM IST</strong>
                      </div>
                    </div>

                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px 18px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <strong style={{ color: "#1e3a8a", fontSize: "13px", display: "block" }}>Physical Booth Location:</strong>
                        <span style={{ color: "#334155", fontSize: "12.5px" }}>
                          {user?.pollingStationAddress || user?.polling_station_address || "District Election Headquarters Complex, Near Collectorate"}
                        </span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#1e3a8a", background: "#ffffff", padding: "5px 12px", borderRadius: "4px", border: "1px solid #93c5fd", fontWeight: "600" }}>
                        Accessible Ramp & Wheelchair Available
                      </div>
                    </div>
                  </div>

                  {/* OFFICIAL ECI VOTER INFORMATION SLIP (MATDATA PARCHI - RULE 31) */}
                  <div id="eci-official-parchi-sheet" style={{ background: "white", padding: "30px", border: "2px solid #1e3a8a", borderRadius: "8px", maxWidth: "800px", margin: "0 auto", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                    <div style={{ height: "6px", background: "linear-gradient(90deg, #ea580c 33.3%, #ffffff 33.3%, #ffffff 66.6%, #15803d 66.6%)", marginBottom: "16px" }}></div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px dashed #cbd5e1", paddingBottom: "14px", marginBottom: "18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <ECIEmblem size={50} />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a" }}>भारत निर्वाचन आयोग</div>
                          <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>ELECTION COMMISSION OF INDIA</div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>मतदाता सूचना पर्ची • VOTER INFORMATION SLIP (Rule 31)</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                          FORM 6 VERIFIED
                        </div>
                        <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "4px" }}>
                          Electoral Roll 2026
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "20px", marginBottom: "20px" }}>
                      {/* Elector Specifics */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12.5px" }}>
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>मतदाता का नाम / Elector Name:</span>
                          <strong style={{ color: "#0f172a", fontSize: "13.5px" }}>{user?.name || "Verified Citizen"}</strong>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>ईपिक संख्या / EPIC No.:</span>
                          <strong style={{ background: "#1e3a8a", color: "white", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace", display: "inline-block" }}>
                            {user?.voterId || user?.voter_id || "EPIC-PENDING"}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>संबंधी का नाम / Relative Name:</span>
                          <strong>{user?.relativeName || user?.relative_name || "Recorded in Form 6"} ({user?.relativeType || user?.relative_type || "Father"})</strong>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>लिंग / Gender & Age:</span>
                          <strong>{user?.gender || "Male"} • Age 18+</strong>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>विधान सभा क्षेत्र / Assembly Constituency:</span>
                          <strong style={{ color: "#1e3a8a" }}>{user?.constituencyName || user?.constituency_name || "General Assembly"}</strong>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>मतदान केंद्र / Polling Station:</span>
                          <strong>{user?.pollingStationName || user?.polling_station_name || "Main Polling Booth"} ({user?.pollingStationCode || user?.polling_station_code || "PS"})</strong>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ color: "#64748b", display: "block", fontSize: "10.5px" }}>स्थान / Address of Polling Station:</span>
                          <span>{user?.pollingStationAddress || user?.polling_station_address || "District Headquarters Complex"}</span>
                        </div>
                      </div>

                      {/* Photo & Barcode */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: "8px" }}>
                        <div style={{ width: "95px", height: "120px", border: "1.5px solid #1e3a8a", borderRadius: "4px", overflow: "hidden", background: "#f8fafc", display: "grid", placeItems: "center" }}>
                          {(user?.live_photo || user?.livePhoto || user?.photo_url || localStorage.getItem("elector_captured_photo")) ? (
                            <img 
                              src={user?.live_photo || user?.livePhoto || user?.photo_url || localStorage.getItem("elector_captured_photo")}
                              alt="Elector Biometric Photo"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ textAlign: "center", color: "#64748b", fontSize: "11px", fontWeight: "bold" }}>
                              ELECTOR PHOTO
                            </div>
                          )}
                        </div>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(`ECI-SLIP:${user?.voterId || user?.voter_id}|${user?.name}|${user?.pollingStationCode}`)}`}
                          alt="ECI Barcode"
                          crossOrigin="anonymous"
                          style={{ width: "65px", height: "65px", border: "1px solid #cbd5e1", borderRadius: "3px" }}
                        />
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>
                      <strong>Important Notice:</strong> Under Section 61A of the Representation of the People Act, 1951, this slip is issued to facilitate voting. Please carry your original e-EPIC card or any of the 12 approved official photo identity documents (Aadhaar, Passport, Driving License, PAN card) to the Polling Station.
                    </div>

                    {/* DESIGNATED ELECTION OFFICIALS DIRECTORY */}
                    <div style={{ marginTop: "20px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "20px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#166534", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
                        ELECTORAL ADMINISTRATION DIRECTORY • STATUTORY ASSISTANCE
                      </div>
                      <h3 style={{ color: "#1e3a8a", margin: "0 0 14px", fontSize: "16px" }}>
                        Designated Election Officers & 24x7 Help Desk
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Booth Level Officer (BLO)</span>
                          <h4 style={{ margin: "4px 0 2px", color: "#0f172a", fontSize: "14px" }}>Shri Rajesh Kumar</h4>
                          <div style={{ fontSize: "12px", color: "#475569" }}>Contact: <strong>+91 98765 43210</strong></div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Assigned to Booth: {user?.pollingStationCode || "PS-01"}</div>
                        </div>
                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Electoral Registration Officer (ERO)</span>
                          <h4 style={{ margin: "4px 0 2px", color: "#0f172a", fontSize: "14px" }}>Office of Sub-Divisional Magistrate</h4>
                          <div style={{ fontSize: "12px", color: "#475569" }}>Jurisdiction: <strong>{user?.constituencyName || "Assembly Constituency"}</strong></div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Email: ero.constituency@eci.gov.in</div>
                        </div>
                        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>District Election Officer (DEO)</span>
                          <h4 style={{ margin: "4px 0 2px", color: "#0f172a", fontSize: "14px" }}>District Collector & Magistrate</h4>
                          <div style={{ fontSize: "12px", color: "#475569" }}>District: <strong>{user?.districtName || "District HQ"}</strong></div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Toll-Free Helpline: <strong>1950 (24x7 ECI Control Room)</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: KNOW YOUR CANDIDATE (KYC) & MANIFESTO COMPARATOR */}
              {voterActiveTab === "kyc" && (
                <div style={{ textAlign: "left" }}>
                  <div style={{ background: "white", padding: "22px 25px", border: "1px solid #cbd5e1", borderRadius: "8px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "18px" }}>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                          ECI FORM 26 STATUTORY DISCLOSURES & KYC PORTAL
                        </div>
                        <h2 style={{ color: "#1e3a8a", margin: "4px 0 0", fontSize: "20px" }}>
                          Know Your Candidate (KYC) & Manifesto Comparator
                        </h2>
                        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "12.5px" }}>
                          Inspect declared qualifications, movable/immovable assets, criminal background checks, and policy pledges as mandated by the Supreme Court of India.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (kycCandidates.length >= 2) {
                              setCompareCandidateA(kycCandidates[0].id);
                              setCompareCandidateB(kycCandidates[1].id);
                              setShowCompareModal(true);
                            } else {
                              alert("At least 2 candidates are required to compare.");
                            }
                          }}
                          className="primary-btn btn-sm"
                          style={{ background: "#0284c7", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          <span>Compare Candidates Side-by-Side</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => loadKycData()}
                          className="secondary-btn btn-sm"
                        >
                          Refresh KYC
                        </button>
                      </div>
                    </div>

                    {/* ELECTION SELECTOR BAR */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8fafc", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Select Election:</label>
                      <select
                        value={kycSelectedElectionId || (election?.id || "")}
                        onChange={(e) => {
                          setKycSelectedElectionId(e.target.value);
                          loadKycData(e.target.value);
                        }}
                        style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white", minWidth: "260px" }}
                      >
                        {electionsList.map(el => (
                          <option key={el.id} value={el.id}>
                            #{el.id} - {el.title} [{el.status}]
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Contesting Candidates: <strong>{kycCandidates.length}</strong>
                      </span>
                    </div>

                    {/* CANDIDATES GRID */}
                    {kycLoading ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        Loading statutory candidate affidavits and KYC disclosures...
                      </div>
                    ) : kycCandidates.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>No candidates nominated yet for this election.</p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                        {kycCandidates.map((c) => (
                          <div key={c.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                              {/* Header info */}
                              <div style={{ display: "flex", gap: "14px", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "14px" }}>
                                <div style={{ width: "55px", height: "55px", borderRadius: "50%", background: "#f1f5f9", border: "2px solid #0284c7", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
                                  {c.symbol ? <ECISymbolIcon symbol={c.symbol} size={32} /> : <strong style={{ color: "#1e3a8a", fontSize: "18px" }}>{c.name.charAt(0)}</strong>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <h3 style={{ margin: "0 0 2px", fontSize: "16px", color: "#0f172a" }}>{c.name}</h3>
                                  <div style={{ fontSize: "12px", color: "#1e3a8a", fontWeight: "600" }}>
                                    {c.party || "Independent"}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                                    Symbol: <strong>{c.symbol || "Unreserved"}</strong> • ID: <code>#{c.id}</code>
                                  </div>
                                </div>
                              </div>

                              {/* Key Metrics */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px", fontSize: "12px" }}>
                                <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Highest Education</span>
                                  <strong style={{ color: "#0f172a" }}>{c.education || "Graduate"}</strong>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Declared Assets</span>
                                  <strong style={{ color: "#166534" }}>{c.total_assets || "Disclosed in Form 26"}</strong>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                  <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Declared Liabilities</span>
                                  <strong style={{ color: "#b91c1c" }}>{c.total_liabilities || "Nil"}</strong>
                                </div>
                                <div style={{ background: Number(c.criminal_cases_count) > 0 ? "#fef2f2" : "#f0fdf4", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${Number(c.criminal_cases_count) > 0 ? "#fecaca" : "#bbf7d0"}` }}>
                                  <span style={{ color: "#64748b", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Criminal Record</span>
                                  <strong style={{ color: Number(c.criminal_cases_count) > 0 ? "#dc2626" : "#15803d" }}>
                                    {Number(c.criminal_cases_count) > 0 ? `${c.criminal_cases_count} Case(s) Declared` : "No Criminal Cases (Clean)"}
                                  </strong>
                                </div>
                              </div>

                              {/* Manifesto Summary */}
                              <div style={{ marginBottom: "14px" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                                  Manifesto & Policy Agenda:
                                </span>
                                <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.45", margin: 0, maxHeight: "90px", overflowY: "auto", background: "#f8fafc", padding: "8px 10px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                                  {c.manifesto || "Official manifesto registered with the Returning Officer under Section 33 of Representation of the People Act, 1951."}
                                </p>
                              </div>
                            </div>

                            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "10.5px", color: "#16a34a", fontWeight: "700" }}>
                                SCRUTINY CERTIFIED (ECI)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Candidate Affidavit Details:\nName: ${c.name}\nParty: ${c.party}\nEducation: ${c.education || "Graduate"}\nAssets: ${c.total_assets || "Not disclosed"}\nLiabilities: ${c.total_liabilities || "Nil"}\nCriminal Cases: ${c.criminal_cases_count || 0}\nAffidavit: ${c.affidavit_summary || "Affidavit on record under Supreme Court directions."}`);
                                }}
                                className="secondary-btn-sm"
                                style={{ fontSize: "11px", padding: "3px 8px" }}
                              >
                                View Full Form 26
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SIDE-BY-SIDE CANDIDATE COMPARISON MODAL */}
                  {showCompareModal && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                      <div style={{ background: "white", borderRadius: "12px", padding: "26px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid #cbd5e1" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "20px" }}>
                          <div>
                            <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "18px" }}>Side-by-Side Candidate Comparator</h3>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>Direct electoral comparison under ECI statutory guidelines</span>
                          </div>
                          <button onClick={() => setShowCompareModal(false)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>&times;</button>
                        </div>

                        {/* Dropdown Pickers */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                          <div>
                            <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Candidate A</label>
                            <select
                              value={compareCandidateA}
                              onChange={(e) => setCompareCandidateA(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                            >
                              {kycCandidates.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.party || "IND"})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Candidate B</label>
                            <select
                              value={compareCandidateB}
                              onChange={(e) => setCompareCandidateB(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                            >
                              {kycCandidates.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.party || "IND"})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Comparison Table */}
                        {(() => {
                          const candA = kycCandidates.find(c => String(c.id) === String(compareCandidateA));
                          const candB = kycCandidates.find(c => String(c.id) === String(compareCandidateB));
                          if (!candA || !candB) return <div>Please select two candidates.</div>;

                          const rows = [
                            { label: "Party Affiliation", valA: candA.party || "Independent", valB: candB.party || "Independent" },
                            { label: "Official Symbol", valA: candA.symbol || "Unreserved", valB: candB.symbol || "Unreserved" },
                            { label: "Educational Qualification", valA: candA.education || "Graduate", valB: candB.education || "Graduate" },
                            { label: "Total Assets Declared", valA: candA.total_assets || "Form 26 Verified", valB: candB.total_assets || "Form 26 Verified" },
                            { label: "Total Liabilities", valA: candA.total_liabilities || "Nil", valB: candB.total_liabilities || "Nil" },
                            { label: "Criminal Cases Declared", valA: Number(candA.criminal_cases_count) > 0 ? `${candA.criminal_cases_count} Cases` : "0 (Clean Record)", valB: Number(candB.criminal_cases_count) > 0 ? `${candB.criminal_cases_count} Cases` : "0 (Clean Record)" },
                            { label: "Manifesto Core Priorities", valA: candA.manifesto || "Registered manifesto", valB: candB.manifesto || "Registered manifesto" }
                          ];

                          return (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                              <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                                  <th style={{ padding: "10px", width: "28%" }}>Metric</th>
                                  <th style={{ padding: "10px", width: "36%", color: "#1e3a8a" }}>{candA.name}</th>
                                  <th style={{ padding: "10px", width: "36%", color: "#0284c7" }}>{candB.name}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((r, i) => (
                                  <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                    <td style={{ padding: "10px", fontWeight: "600", color: "#475569", background: "#f8fafc" }}>{r.label}</td>
                                    <td style={{ padding: "10px", color: "#0f172a" }}>{r.valA}</td>
                                    <td style={{ padding: "10px", color: "#0f172a" }}>{r.valB}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        })()}

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                          <button className="primary-btn-sm" onClick={() => setShowCompareModal(false)}>Close Comparison</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: VERIFY BALLOT ON-CHAIN (CRYPTOGRAPHIC PROOF OF INCLUSION) */}
              {voterActiveTab === "verify_ballot" && (
                <div style={{ textAlign: "left" }}>
                  <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", marginBottom: "25px" }}>
                    <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "20px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#166534", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                        MATHEMATICAL ZERO-KNOWLEDGE AUDIT & DISTRIBUTED LEDGER PROOF
                      </div>
                      <h2 style={{ color: "#1e3a8a", margin: "4px 0 0", fontSize: "20px" }}>
                        Ballot Inclusion & Cryptographic On-Chain Verifier
                      </h2>
                      <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                        Verify that your cast vote is cryptographically included in the Ethereum smart-contract ledger without violating ballot secrecy (Section 128 RPA 1951).
                      </p>
                    </div>

                    {/* SEARCH INPUT BAR */}
                    <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Enter Receipt Code or Transaction Hash:
                      </label>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          placeholder="e.g. REC-5FA82C9E4B17 or 0x6f91f3a2..."
                          value={verifyAuditQuery}
                          onChange={(e) => setVerifyAuditQuery(e.target.value)}
                          style={{ flex: "1 1 350px", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", fontFamily: "monospace" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAuditBallot()}
                          disabled={verifyAuditLoading}
                          className="primary-btn"
                          style={{ background: "#166534", width: "auto", padding: "10px 22px", fontSize: "13px" }}
                        >
                          {verifyAuditLoading ? "Querying Ledger..." : "Verify On-Chain"}
                        </button>
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                        Receipt codes are automatically issued upon ballot casting and cryptographically anchored to the block height.
                      </div>
                    </div>

                    {/* ERROR ALERT */}
                    {verifyAuditError && (
                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px" }}>
                        <strong>Verification Note:</strong> {verifyAuditError}
                      </div>
                    )}

                    {/* VERIFIED LEDGER PROOF DISPLAY */}
                    {verifyAuditResult && (
                      <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "8px", padding: "20px", marginBottom: "25px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #bbf7d0", paddingBottom: "12px", marginBottom: "16px" }}>
                          <div>
                            <span style={{ background: "#15803d", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                              COMMITTED & IMMUTABLE (ON-CHAIN)
                            </span>
                            <h3 style={{ margin: "6px 0 0", color: "#14532d", fontSize: "17px" }}>
                              Cryptographic Inclusion Verified Successfully
                            </h3>
                          </div>
                          <span style={{ fontSize: "12px", color: "#15803d" }}>
                            Confirmations: <strong>{verifyAuditResult.confirmations} Blocks</strong>
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", fontSize: "12.5px", marginBottom: "16px" }}>
                          <div>
                            <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>TRANSACTION HASH</span>
                            <code style={{ fontSize: "11px", wordBreak: "break-all", color: "#1e3a8a" }}>{verifyAuditResult.txHash}</code>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>BLOCK HEIGHT</span>
                            <strong>Block #{verifyAuditResult.blockNumber}</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>GAS CONSUMED</span>
                            <span>{verifyAuditResult.gasUsed} Wei</span>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>SMART CONTRACT AUDIT</span>
                            <code style={{ fontSize: "11px", color: "#0f172a" }}>{verifyAuditResult.contractAddress}</code>
                          </div>
                          {verifyAuditResult.receiptCode && (
                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>RECEIPT SERIAL</span>
                              <strong style={{ color: "#166534" }}>{verifyAuditResult.receiptCode}</strong>
                            </div>
                          )}
                          {verifyAuditResult.electionTitle && (
                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "11px" }}>ELECTION JURISDICTION</span>
                              <strong>{verifyAuditResult.electionTitle}</strong>
                            </div>
                          )}
                        </div>

                        <div style={{ background: "white", padding: "10px 14px", borderRadius: "6px", border: "1px solid #bbf7d0", fontSize: "11.5px", color: "#166534", lineHeight: "1.5" }}>
                          <strong>ECI Legal Certification:</strong> This ballot transaction is cryptographically confirmed in Hardhat blockchain storage. Pursuant to Rule 49MA of Conduct of Elections Rules, 1961, the secret ballot hash guarantees your vote has been tallied in the constituency tally while your candidate selection remains 100% confidential.
                        </div>
                      </div>
                    )}

                    {/* RECENT VOTES CARDS */}
                    <div>
                      <h4 style={{ color: "#1e3a8a", margin: "0 0 12px", fontSize: "15px" }}>My Cast Ballots in Registered Elections</h4>
                      {myVotesLoading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Loading voter history...</div>
                      ) : myVotedElections.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "25px", color: "#64748b", background: "#f8fafc", borderRadius: "6px", border: "1px dashed #cbd5e1" }}>
                          No ballots cast by your account yet. Cast your vote in the "Cast Vote" tab to receive an immutable cryptographic receipt.
                        </div>
                      ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                              <th style={{ padding: "10px" }}>Election</th>
                              <th style={{ padding: "10px" }}>Receipt Code</th>
                              <th style={{ padding: "10px" }}>Block #</th>
                              <th style={{ padding: "10px" }}>Voted Timestamp</th>
                              <th style={{ padding: "10px" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {myVotedElections.map((v, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td style={{ padding: "10px", fontWeight: "600", color: "#0f172a" }}>{v.election_title}</td>
                                <td style={{ padding: "10px" }}>
                                  <code style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px" }}>
                                    {v.receipt_code || "REC-PENDING"}
                                  </code>
                                </td>
                                <td style={{ padding: "10px" }}>#{v.block_number || "LATEST"}</td>
                                <td style={{ padding: "10px", color: "#64748b" }}>
                                  {v.voted_at ? format12HourDateTime(v.voted_at) : "Recorded"}
                                </td>
                                <td style={{ padding: "10px" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVerifyAuditQuery(v.receipt_code || v.tx_hash);
                                      handleAuditBallot(v.receipt_code || v.tx_hash);
                                    }}
                                    className="primary-btn btn-sm"
                                    style={{ background: "#166534", padding: "4px 10px", fontSize: "11px" }}
                                  >
                                    Audit On-Chain
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ELECTORAL SERVICES & FORM 8 PORTAL */}
              {voterActiveTab === "services" && (
                <div style={{ textAlign: "left" }}>
                  <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", marginBottom: "25px" }}>
                    <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "20px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                        NATIONAL VOTER SERVICES PORTAL • STATUTORY SELF-SERVICE
                      </div>
                      <h2 style={{ color: "#1e3a8a", margin: "4px 0 0", fontSize: "20px" }}>
                        Electoral Services, Form 8 & Saksham Assistance
                      </h2>
                      <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                        Submit requests for electoral roll correction, constituency address relocation, replacement e-EPIC card, or book special assistance at your polling station.
                      </p>
                    </div>

                    {/* SUB-TABS */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setServicesSubTab("form8")}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          background: servicesSubTab === "form8" ? "#1e3a8a" : "#f1f5f9",
                          color: servicesSubTab === "form8" ? "white" : "#475569",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        Form 8 (Correction & Shifting)
                      </button>
                      <button
                        type="button"
                        onClick={() => setServicesSubTab("saksham")}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          background: servicesSubTab === "saksham" ? "#1e3a8a" : "#f1f5f9",
                          color: servicesSubTab === "saksham" ? "white" : "#475569",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        Saksham (PwD & Senior Citizen Assistance)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setServicesSubTab("track");
                          loadMyServiceRequests();
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: "none",
                          background: servicesSubTab === "track" ? "#1e3a8a" : "#f1f5f9",
                          color: servicesSubTab === "track" ? "white" : "#475569",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: "pointer"
                        }}
                      >
                        Track My Applications ({myServiceRequests.length})
                      </button>
                    </div>

                    {/* SUB-TAB 1: FORM 8 */}
                    {servicesSubTab === "form8" && (
                      <form onSubmit={handleForm8Submit} style={{ maxWidth: "700px" }}>
                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>
                            Select Application Category *
                          </label>
                          <select
                            value={form8Type}
                            onChange={(e) => setForm8Type(e.target.value)}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                          >
                            <option value="FORM_8_CORRECTION">Correction of Entries in Electoral Roll (Name, Relative, Phone)</option>
                            <option value="FORM_8_SHIFT">Shifting of Residence / Relocation of Address</option>
                            <option value="EPIC_REPLACEMENT">Issue of Replacement e-EPIC Card (Lost / Damaged)</option>
                          </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Correct Full Name</label>
                            <input
                              type="text"
                              placeholder={user?.name || "Full Name"}
                              value={form8Name}
                              onChange={(e) => setForm8Name(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Mobile Number</label>
                            <input
                              type="text"
                              placeholder={user?.phone || "10-digit mobile"}
                              value={form8Phone}
                              onChange={(e) => setForm8Phone(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Relative Name</label>
                            <input
                              type="text"
                              placeholder={user?.relativeName || "Father / Mother / Spouse"}
                              value={form8RelativeName}
                              onChange={(e) => setForm8RelativeName(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Relative Relationship</label>
                            <select
                              value={form8RelativeType}
                              onChange={(e) => setForm8RelativeType(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                            >
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Husband">Husband</option>
                              <option value="Wife">Wife</option>
                              <option value="Legal Guardian">Legal Guardian</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Updated Residential Address</label>
                          <textarea
                            placeholder={user?.address || "House No, Street, Landmark, Area"}
                            value={form8Address}
                            onChange={(e) => setForm8Address(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", minHeight: "65px", fontFamily: "inherit" }}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Pincode</label>
                            <input
                              type="text"
                              placeholder={user?.pincode || "6-digit Postal Pincode"}
                              value={form8Pincode}
                              onChange={(e) => setForm8Pincode(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Gender</label>
                            <select
                              value={form8Gender}
                              onChange={(e) => setForm8Gender(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Third Gender">Third Gender</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Reason for Request / Remarks *</label>
                          <input
                            type="text"
                            placeholder="e.g. Change of residence due to marriage / employment, spelling mistake in father's name"
                            value={form8Reason}
                            onChange={(e) => setForm8Reason(e.target.value)}
                            required
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={serviceSubmitting}
                          className="primary-btn"
                          style={{ background: "#1e3a8a", width: "auto", padding: "10px 24px", fontSize: "13px" }}
                        >
                          {serviceSubmitting ? "Submitting to ERO..." : "Submit Form 8 Application"}
                        </button>
                      </form>
                    )}

                    {/* SUB-TAB 2: SAKSHAM */}
                    {servicesSubTab === "saksham" && (
                      <form onSubmit={handleSakshamSubmit} style={{ maxWidth: "700px" }}>
                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px 18px", borderRadius: "6px", marginBottom: "18px", fontSize: "12.5px", color: "#1e40af" }}>
                          <strong>ECI Saksham Initiative:</strong> Ensuring accessible elections for Persons with Disabilities (PwD) and Senior Citizens (85+). Dedicated assistance and volunteer support will be provisioned at your assigned booth.
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Assistance Facility Requested *</label>
                          <select
                            value={sakshamCategory}
                            onChange={(e) => setSakshamCategory(e.target.value)}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                          >
                            <option value="WHEELCHAIR">Wheelchair Assistance at Polling Station</option>
                            <option value="RAMP_ESCORT">Ramp Access & Assigned Volunteer Escort</option>
                            <option value="HOME_VOTING">Application for Home Voting Facility (Senior 85+ / 40%+ Benchmark Disability)</option>
                          </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Disability / Eligibility Category</label>
                            <select
                              value={sakshamDisabilityType}
                              onChange={(e) => setSakshamDisabilityType(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                            >
                              <option value="Locomotor Disability">Locomotor Disability</option>
                              <option value="Visual Impairment">Visual Impairment</option>
                              <option value="Hearing / Speech Impairment">Hearing / Speech Impairment</option>
                              <option value="Senior Citizen (85+ Years)">Senior Citizen (85+ Years)</option>
                              <option value="Other Benchmark Condition">Other Benchmark Condition</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Percentage / Certificate (if applicable)</label>
                            <input
                              type="text"
                              placeholder="e.g. 40% Benchmark / UDID Card No."
                              value={sakshamDisabilityPercent}
                              onChange={(e) => setSakshamDisabilityPercent(e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Special Requirements / Pick-up Instructions</label>
                          <textarea
                            placeholder="Provide any specific accessibility requirements or contact instructions for the Booth Level Volunteer."
                            value={sakshamNotes}
                            onChange={(e) => setSakshamNotes(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", minHeight: "65px", fontFamily: "inherit" }}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={serviceSubmitting}
                          className="primary-btn"
                          style={{ background: "#166534", width: "auto", padding: "10px 24px", fontSize: "13px" }}
                        >
                          {serviceSubmitting ? "Submitting Request..." : "Register Accessibility Request"}
                        </button>
                      </form>
                    )}

                    {/* SUB-TAB 3: TRACK APPLICATIONS */}
                    {servicesSubTab === "track" && (
                      <div>
                        {servicesLoading ? (
                          <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Loading your applications...</div>
                        ) : myServiceRequests.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "30px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                            You have not submitted any Form 8 or accessibility assistance requests yet.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {myServiceRequests.map((req) => {
                              const d = typeof req.details === "string" ? JSON.parse(req.details) : req.details;
                              const statusColors = {
                                SUBMITTED: { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
                                UNDER_REVIEW: { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" },
                                APPROVED: { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
                                REJECTED: { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5" }
                              };
                              const sc = statusColors[req.status] || statusColors.SUBMITTED;

                              return (
                                <div key={req.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px 20px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                                    <div>
                                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>APPLICATION ID #{req.id}</span>
                                      <h4 style={{ margin: "2px 0 0", color: "#0f172a", fontSize: "15px" }}>{req.category}</h4>
                                      <span style={{ fontSize: "11px", color: "#0284c7" }}>Type: <strong>{req.request_type}</strong></span>
                                    </div>
                                    <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                                      {req.status}
                                    </span>
                                  </div>

                                  <div style={{ fontSize: "12px", color: "#475569", background: "#f8fafc", padding: "10px 14px", borderRadius: "6px", marginBottom: "10px" }}>
                                    {d.reason && <div><strong>Reason:</strong> {d.reason}</div>}
                                    {d.address && <div><strong>Requested Address:</strong> {d.address} (PIN: {d.pincode || "N/A"})</div>}
                                    {d.name && <div><strong>Requested Name:</strong> {d.name}</div>}
                                    {d.disability_type && <div><strong>Facility:</strong> {d.disability_type} ({d.disability_percent || "Standard"})</div>}
                                    {d.special_assistance_notes && <div><strong>Notes:</strong> {d.special_assistance_notes}</div>}
                                  </div>

                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                                    <span>Submitted: <strong>{format12HourDateTime(req.created_at)}</strong></span>
                                    {req.admin_notes && (
                                      <span style={{ color: "#166534" }}>
                                        <strong>ERO Remark:</strong> {req.admin_notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: UPCOMING ELECTIONS */}
              {voterActiveTab === "upcoming" && (
                <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left" }}>
                  <h3 style={{ color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>Scheduled & Future Elections</h3>
                  {electionsList.filter(e => e.status === "UPCOMING").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>No upcoming elections are currently scheduled.</p>
                    </div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                          <th style={{ padding: "10px" }}>Election Name</th>
                          <th style={{ padding: "10px" }}>Code</th>
                          <th style={{ padding: "10px" }}>Type</th>
                          <th style={{ padding: "10px" }}>Starts At</th>
                          <th style={{ padding: "10px" }}>Ends At</th>
                          <th style={{ padding: "10px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {electionsList
                          .filter(e => e.status === "UPCOMING")
                          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                          .map(e => (
                            <tr key={e.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "10px", fontWeight: "bold" }}>{e.title}</td>
                              <td style={{ padding: "10px" }}><code>{e.election_code || e.code || "N/A"}</code></td>
                              <td style={{ padding: "10px" }}>{e.election_type || e.type || "General"}</td>
                              <td style={{ padding: "10px" }}>{format12HourDateTime(e.start_time)}</td>
                              <td style={{ padding: "10px" }}>{format12HourDateTime(e.end_time)}</td>
                              <td style={{ padding: "10px" }}><span style={{ color: "#ea580c", fontWeight: "bold" }}>UPCOMING</span></td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {(voterActiveTab === "current" || voterActiveTab === "elections") && (
                <div>
                  {/* METAMASK INTEGRATION */}
                  <div className="metamask-panel" style={{
                    background: "white",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "20px",
                    margin: "0 0 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                    textAlign: "left"
                  }}>
                    <div style={{ flex: "1", minWidth: "280px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "8px" }}>
                        Cryptographic Signer & Hardware Gateway
                      </h3>
                      <div style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                        <span style={{ color: "#16a34a", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <IconCheck size={14} color="#16a34a" /> Official ECI On-Chain Relayer Active (Gasless & Cryptographically Verified)
                        </span>
                        {connectedWallet && (
                          <div style={{ marginTop: "4px" }}>
                            <span>Connected Web3 Wallet: </span>
                            <code style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{connectedWallet}</code>
                          </div>
                        )}
                      </div>
                      {window.ethereum && (
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", fontSize: "12px", color: "#64748b", cursor: "pointer" }}>
                          <input 
                            type="checkbox" 
                            checked={!bypassMetaMask} 
                            onChange={(e) => setBypassMetaMask(!e.target.checked)}
                            style={{ width: "auto", cursor: "pointer" }}
                          />
                          Require direct MetaMask transaction confirmation for ballot casting
                        </label>
                      )}
                    </div>
                    {window.ethereum && !connectedWallet && (
                      <button onClick={connectWallet} className="primary-btn" style={{ background: "#ea580c", padding: "10px 18px", fontSize: "13px", height: "auto", width: "auto" }}>
                        Connect Wallet
                      </button>
                    )}
                  </div>

                  {/* ACTIVE ELECTIONS SELECTION */}
                  <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left", marginBottom: "20px" }}>
                    <h3 style={{ color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>Active Elections Open for Voting</h3>
                    {electionsList.filter(e => e.status === "ACTIVE").length === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>No elections are currently open for voting.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {electionsList.filter(e => e.status === "ACTIVE").map(e => {
                          const isVoted = Boolean(e.has_voted || (election?.id === e.id && (election?.has_voted || !!voterReceipt)));
                          return (
                            <div 
                              key={e.id} 
                              style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center", 
                                padding: "15px 20px", 
                                border: isVoted ? "1.5px solid #86efac" : (election?.id === e.id ? "1.5px solid #3b82f6" : "1px solid #e2e8f0"), 
                                background: isVoted ? "#f0fdf4" : "white", 
                                borderRadius: "8px" 
                              }}
                            >
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <strong style={{ fontSize: "15px", color: "#1e3a8a" }}>{e.title}</strong>
                                  {isVoted ? (
                                    <span style={{ background: "#16a34a", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                      <IconCheck size={11} color="white" /> BALLOT RECORDED
                                    </span>
                                  ) : (
                                    <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                                      POLLING OPEN
                                    </span>
                                  )}
                                </div>
                                <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                                  Code: {e.election_code || `ELEC-${e.id}`} | Constituency: {e.constituency || "General"}
                                </span>
                              </div>
                              <button 
                                onClick={async () => {
                                  await loadElection(token, e.id);
                                  if (isVoted) {
                                    const r = await loadReceipt(token, e.id);
                                    if (r) setShowReceiptModal(true);
                                  }
                                }} 
                                className="primary-btn" 
                                style={{ 
                                  width: "auto", 
                                  padding: "8px 16px", 
                                  background: isVoted ? "#15803d" : "#ea580c",
                                  fontSize: "12.5px"
                                }}
                              >
                                {isVoted ? "View Official VVPAT Slip" : "Open Electronic Ballot"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* BALLOT WORKFLOW PANEL */}
                  {election && election.status === "ACTIVE" && (
                    <section className="election-panel" style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left" }}>
                      <div className="election-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                          <div>
                            <span className="live-badge" style={{ background: "#15803d", color: "white", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px" }}>OFFICIAL BALLOTING ACTIVE</span>
                            <h2 style={{ color: "#1e3a8a", margin: "8px 0 4px", fontSize: "18px" }}>{election.title}</h2>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "13px" }}>{election.description}</p>
                          </div>
                          {countdownText && (
                            <div style={{ textAlign: "right", padding: "8px 14px", background: "#fef2f2", borderRadius: "6px", border: "1px solid #fecaca" }}>
                              <span style={{ display: "block", fontSize: "9.5px", color: "#b91c1c", fontWeight: "bold", letterSpacing: "0.5px" }}>STATUTORY CLOSING IN</span>
                              <strong style={{ fontSize: "15px", color: "#b91c1c", fontFamily: "monospace" }}>{countdownText}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {(voterReceipt || election.has_voted) ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderLeft: "5px solid #16a34a", padding: "16px 20px", borderRadius: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                              <div>
                                <h4 style={{ color: "#15803d", margin: "0 0 4px", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                                  <IconCheck size={18} color="#15803d" />
                                  <span>Your Vote Has Been Recorded</span>
                                </h4>
                                <p style={{ color: "#166534", margin: 0, fontSize: "13px" }}>
                                  You have successfully cast your vote for <strong>{election.title}</strong>. Your vote is recorded securely on the blockchain ledger.
                                </p>
                              </div>
                              <button
                                onClick={() => setShowReceiptModal(true)}
                                className="primary-btn"
                                style={{ width: "auto", padding: "8px 16px", background: "#15803d", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                                title="Open full printable Form 49MA statutory VVPAT slip modal"
                              >
                                <IconPrint size={14} />
                                <span>Print / Export Official Slip</span>
                              </button>
                            </div>
                          </div>

                          {voterReceipt ? (
                            renderOfficialReceiptSlip(voterReceipt, false)
                          ) : (
                            <div style={{ background: "white", padding: "25px", textAlign: "center", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                              <p style={{ color: "#64748b", margin: "0 0 12px", fontSize: "13.5px" }}>Loading your official cryptographic receipt from blockchain ledger...</p>
                              <button 
                                onClick={() => loadReceipt(token, election.id)}
                                className="primary-btn" 
                                style={{ width: "auto", background: "#1e3a8a", padding: "8px 18px" }}
                              >
                                Load Digital Slip
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="eci-evm-ballot-unit">
                          {/* EVM BALLOT UNIT MASTHEAD */}
                          <div className="eci-evm-ballot-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <ECIEmblem size={34} />
                              <div>
                                <div style={{ fontSize: "11px", fontWeight: "800", color: "#1e3a8a", letterSpacing: "0.5px" }}>
                                  ELECTION COMMISSION OF INDIA • भारत निर्वाचन आयोग
                                </div>
                                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                                  BALLOT UNIT (मतपत्र इकाई) — FORM 7A
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                              <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "10px", color: "#64748b", display: "block", textTransform: "uppercase" }}>Electoral Jurisdiction</span>
                                <strong style={{ fontSize: "12px", color: "#1e3a8a" }}>{election.title}</strong>
                              </div>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#f0fdf4",
                                border: "1px solid #86efac",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#166534"
                              }}>
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }}></span>
                                <span>READY / तैयार</span>
                              </div>
                            </div>
                          </div>

                          {user && !user.is_verified && (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fef2f2", borderLeft: "4px solid #dc2626", padding: "12px 16px", borderRadius: "4px", color: "#991b1b", margin: "14px", fontSize: "13px" }}>
                              <IconAlert size={20} color="#dc2626" />
                              <div>
                                <strong style={{ display: "block" }}>Voter Verification Pending</strong>
                                <span style={{ fontSize: "12px", color: "#b91c1c" }}>Your voter registration is being verified by the Electoral Registration Officer. Voting will be available once your profile is verified.</span>
                              </div>
                            </div>
                          )}

                          {/* INSTRUCTION BAR */}
                          <div style={{ background: "#f1f5f9", padding: "8px 18px", borderBottom: "1px solid #cbd5e1", fontSize: "11.5px", color: "#475569", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Press the blue button to cast your vote. A verified VVPAT receipt slip will be generated automatically.</span>
                            <span style={{ fontWeight: "700", color: "#1e3a8a" }}>Candidates: {candidates.length}</span>
                          </div>

                          {/* EVM BALLOT CANDIDATE ROWS */}
                          <div className="eci-evm-candidates-list">
                            {candidates.map((candidate, idx) => {
                              const isVoteDisabled = loading || (user && !user.is_verified) || election.has_voted || !!voterReceipt;
                              const serialNo = idx + 1;
                              return (
                                <div key={candidate.id} className="eci-evm-row">
                                  {/* 1. SERIAL NUMBER */}
                                  <div className="eci-evm-serial">
                                    <span>{serialNo}</span>
                                  </div>

                                  {/* 2. CANDIDATE & PARTY DETAILS */}
                                  <div className="eci-evm-details">
                                    <strong className="eci-evm-cand-name">{candidate.name}</strong>
                                    <div className="eci-evm-party-badge">
                                      <span>Party: <strong>{candidate.party || "Independent"}</strong></span>
                                    </div>
                                  </div>

                                  {/* 3. OFFICIAL ELECTION SYMBOL */}
                                  <div className="eci-evm-symbol-box">
                                    {candidate.symbol ? (
                                      <ECISymbolIcon symbol={candidate.symbol} size={42} />
                                    ) : (
                                      <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold" }}>Symbol</span>
                                    )}
                                  </div>

                                  {/* 4. RED LED INDICATOR */}
                                  <div className="eci-evm-lamp-col">
                                    <div className="eci-evm-lamp" title="Candidate Selection Indicator"></div>
                                  </div>

                                  {/* 5. BLUE EVM VOTING KEY */}
                                  <div className="eci-evm-button-col">
                                    <button
                                      className="eci-evm-vote-key"
                                      disabled={isVoteDisabled}
                                      onClick={() => castVote(candidate.id, candidate.name)}
                                      title={`Vote for ${candidate.name}`}
                                    >
                                      <span className="eci-evm-key-arrow">▶</span>
                                      <span>VOTE / मतदान</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}

              {/* TAB: OFFICIAL VOTING RECEIPT (VVPAT SLIP) */}
              {voterActiveTab === "receipt" && (
                <div>
                  {electionsList.some(e => e.has_voted) && (
                    <div style={{ background: "white", padding: "14px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e3a8a" }}>Select Election Slip:</span>
                        <select
                          value={election?.id || ""}
                          onChange={async (e) => {
                            const selId = e.target.value;
                            await loadElection(token, selId);
                            await loadReceipt(token, selId);
                          }}
                          style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                        >
                          {electionsList.filter(e => e.has_voted).map(e => (
                            <option key={e.id} value={e.id}>
                              {e.title} (Code: {e.election_code || e.code || e.id})
                            </option>
                          ))}
                        </select>
                      </div>
                      <span style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #86efac", padding: "4px 10px", borderRadius: "4px", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                        <IconCheck size={14} color="#166534" /> Verified On-Chain Ledger
                      </span>
                    </div>
                  )}

                  {voterReceipt ? (
                    renderOfficialReceiptSlip(voterReceipt, false)
                  ) : (
                    <div style={{ background: "white", padding: "40px 25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                        <ECIEmblem size={56} />
                      </div>
                      <h3 style={{ color: "#1e3a8a", margin: "0 0 8px" }}>No Digital Voting Receipt Available</h3>
                      <p style={{ color: "#64748b", maxWidth: "520px", margin: "0 auto 20px", fontSize: "13px", lineHeight: "1.5" }}>
                        You have not cast an encrypted ballot in the current active election session yet. Once you submit your vote on the Electronic Ballot Paper, your official statutory ECI cryptographic receipt slip will be automatically generated and accessible here.
                      </p>
                      <button 
                        onClick={() => setVoterActiveTab("current")} 
                        className="primary-btn" 
                        style={{ background: "#1e3a8a", padding: "10px 24px" }}
                      >
                        Go to Electronic Ballot Paper →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ELECTION RESULTS */}
              {voterActiveTab === "results" && (
                <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left" }}>
                  <h3 style={{ color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>Published Election Results</h3>
                  {electionsList.filter(e => e.status === "RESULTS_PUBLISHED").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>No published election results available.</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {electionsList.filter(e => e.status === "RESULTS_PUBLISHED").map(e => (
                          <div key={e.id} style={{ padding: "15px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <strong style={{ fontSize: "15px", color: "#1e3a8a" }}>{e.title}</strong>
                                <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Code: {e.election_code || e.code || "N/A"} | Type: {e.election_type || e.type}</span>
                              </div>
                              <button 
                                onClick={async () => {
                                  await loadResults(e.id);
                                }} 
                                className="primary-btn" 
                                style={{ width: "auto", background: "#1e3a8a", padding: "8px 16px" }}
                              >
                                View Results
                              </button>
                            </div>

                            {/* RESULTS CONTENT RENDERED INLINE FOR THE ELECTION */}
                            {showResults && results && results.databaseResults && String(results.databaseResults.electionId) === String(e.id) && (
                              <div style={{ marginTop: "20px", background: "#f8fafc", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                                <h4 style={{ color: "#ea580c", margin: "0 0 10px" }}>Official ECI Tabulation Sheet</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px", fontSize: "13px" }}>
                                  <div style={{ background: "white", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "4px" }}>
                                    <span style={{ color: "#64748b" }}>Total Turnout:</span>
                                    <strong style={{ display: "block", fontSize: "16px" }}>{results.databaseResults.totalVotes} Votes</strong>
                                  </div>
                                  <div style={{ background: "white", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "4px" }}>
                                    <span style={{ color: "#64748b" }}>Turnout Percentage:</span>
                                    <strong style={{ display: "block", fontSize: "16px" }}>{results.databaseResults.turnoutPercentage}%</strong>
                                  </div>
                                  <div style={{ background: "white", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "4px" }}>
                                    <span style={{ color: "#64748b" }}>Winner:</span>
                                    <strong style={{ display: "block", fontSize: "16px", color: "#166534" }}>{results.databaseResults.winner || "N/A"}</strong>
                                  </div>
                                </div>

                                <h5 style={{ margin: "15px 0 5px", color: "#1e3a8a" }}>Candidate Standings</h5>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {results.databaseResults.candidates.map(c => (
                                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", background: "white", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "13px" }}>
                                      <span><strong>{c.name}</strong> ({c.party})</span>
                                      <span><strong>{c.votes} votes</strong> ({c.percentage}%)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ALL-INDIA ELECTORAL MAP & ATLAS */}
              {voterActiveTab === "atlas" && (
                <div style={{ textAlign: "left" }}>
                  <Suspense fallback={
                    <div style={{ padding: "60px 20px", textAlign: "center", background: "white", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                      <div style={{ width: "36px", height: "36px", border: "3px solid #cbd5e1", borderTopColor: "#1e3a8a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }}></div>
                      <div style={{ fontSize: "14px", color: "#1e3a8a", fontWeight: "600" }}>Rendering National Election Atlas...</div>
                    </div>
                  }>
                    <IndiaElectionMap 
                      onSelectElection={async (elecId) => {
                        await loadElection(token, elecId);
                        setVoterActiveTab("current");
                      }}
                    />
                  </Suspense>
                </div>
              )}

              {/* TAB 5: CITIZEN GRIEVANCES */}
              {voterActiveTab === "grievances" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "25px" }}>
                  <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left" }}>
                    <h3 style={{ color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>Submit Electoral Grievance</h3>
                    <form onSubmit={createVoterGrievance}>
                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Grievance Category</label>
                        <select 
                          value={newGrievanceCategory} 
                          onChange={(e) => setNewGrievanceCategory(e.target.value)}
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                        >
                          <option value="VOTER_REGISTRATION">Voter Roll & Registration</option>
                          <option value="POLLING_STATION">Polling Station Accessibility</option>
                          <option value="EVM_BLOCKCHAIN">EVM or Blockchain sync query</option>
                          <option value="IDENTITY_THEFT">Identity impersonation query</option>
                          <option value="OTHER">Other electoral grievances</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Complaint Description</label>
                        <textarea 
                          required 
                          value={newGrievanceDesc} 
                          onChange={(e) => setNewGrievanceDesc(e.target.value)}
                          placeholder="Provide detailed description of the incident/problem..."
                          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", height: "120px", resize: "none" }}
                        />
                      </div>
                      <button className="primary-btn" type="submit" style={{ width: "100%", background: "#1e3a8a", padding: "10px" }}>File Grievance</button>
                    </form>
                  </div>

                  <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left" }}>
                    <h3 style={{ color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>My Grievance Logs</h3>
                    <div style={{ overflowY: "auto", maxHeight: "400px" }}>
                      {voterGrievances.length === 0 ? (
                        <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No grievances submitted yet.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {voterGrievances.map(g => (
                            <div key={g.id} style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "6px", background: "#f8fafc" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <span style={{ fontSize: "11px", fontWeight: "600", color: "#1e3a8a", background: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>{g.category}</span>
                                <span className={`status-badge ${g.status.toLowerCase()}`}>{g.status}</span>
                              </div>
                              <p style={{ fontSize: "13px", margin: "0 0 10px", color: "#0f172a" }}>{g.description}</p>
                              {g.resolution && (
                                <div style={{ fontSize: "12px", background: "#f0fdf4", borderLeft: "3px solid #22c55e", padding: "8px", borderRadius: "4px" }}>
                                  <strong style={{ color: "#166534" }}>ECI Resolution:</strong> {g.resolution}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: COMPLIANCE VIOLATIONS */}
              {voterActiveTab === "compliance" && (
                <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
                  <h3 style={{ color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>Report Model Code of Conduct (MCC) Violation</h3>
                  <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "15px" }}>Report direct bribery, hate speech, or visual media code of conduct violations by political party campaigns or candidate members.</p>
                  
                  <form onSubmit={submitMCCViolation}>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Violation Category</label>
                      <select 
                        value={newViolationCategory} 
                        onChange={(e) => setNewViolationCategory(e.target.value)}
                        style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                      >
                        <option value="BRIBERY">Bribery / Distribution of goods</option>
                        <option value="HATE_SPEECH">Hate Speech / Polarizing Campaign</option>
                        <option value="BOOTH_CAPTURING">Booth Capturing / Threatening</option>
                        <option value="IMPERSONATION">Impersonation of electors</option>
                        <option value="OTHER">Other violation</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Suspect Name / Party Name</label>
                      <input 
                        type="text" 
                        required
                        value={newViolationSuspect} 
                        onChange={(e) => setNewViolationSuspect(e.target.value)} 
                        placeholder="e.g. Candidate John Doe / ABC Party"
                        style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                      />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Violation Details</label>
                      <textarea 
                        required 
                        value={newViolationDesc} 
                        onChange={(e) => setNewViolationDesc(e.target.value)}
                        placeholder="Describe precisely what violation took place and where..."
                        style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", height: "120px", resize: "none" }}
                      />
                    </div>
                    <button className="primary-btn" type="submit" style={{ width: "100%", background: "#dc2626", padding: "10px" }}>Submit Violation Report</button>
                  </form>
                </div>
              )}

              {/* TAB 7: STAGGERED CALENDARS */}
              {voterActiveTab === "calendar" && (
                <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "left" }}>
                  <h3 style={{ color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>ECI Staggered Polling Calendars</h3>
                  {voterPhases.length === 0 ? (
                    <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No multi-phase calendars configured yet.</p>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                          <th style={{ padding: "10px" }}>Election Name</th>
                          <th style={{ padding: "10px" }}>Phase Number</th>
                          <th style={{ padding: "10px" }}>Polling Date & Time</th>
                          <th style={{ padding: "10px" }}>Assigned Constituencies</th>
                          <th style={{ padding: "10px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voterPhases.map(p => (
                          <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "10px", fontWeight: "bold" }}>{p.election_title}</td>
                            <td style={{ padding: "10px" }}>Phase {p.phase_number}</td>
                            <td style={{ padding: "10px" }}>{format12HourDateTime(p.polling_date)}</td>
                            <td style={{ padding: "10px" }}><code>{p.constituencies || "All"}</code></td>
                            <td style={{ padding: "10px" }}><span className="status-badge upcoming">{p.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

        </main>

        {/* ======================================================
            MODAL: OFFICIAL DIGITAL VOTING RECEIPT MODAL
        ====================================================== */}
        {showReceiptModal && voterReceipt && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "20px",
            overflowY: "auto"
          }}>
            <div style={{ maxWidth: "800px", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
              {renderOfficialReceiptSlip(voterReceipt, true)}
            </div>
          </div>
        )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <GovFooter />

      </div>
    );
  }


  // ============================================================
  // PUBLIC LANDING PAGE
  // ============================================================

  return (
    <div className="app" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9" }}>
      {/* National Tricolor Top Ribbon */}
      <div style={{ height: "4px", width: "100%", background: "linear-gradient(to right, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)" }} />

      {/* Official GOV/ECI Top Accessibility Bar */}
      <div className="gov-top-bar" style={{
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        padding: "5px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px",
        color: "#334155",
        fontWeight: "600",
        letterSpacing: "0.4px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span>भारत सरकार | GOVERNMENT OF INDIA</span>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <span>भारत निर्वाचन आयोग | ELECTION COMMISSION OF INDIA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ea580c", fontWeight: "700" }}>
            <span>Helpline:</span>
            <span style={{ background: "#ffedd5", border: "1px solid #fed7aa", padding: "1px 6px", borderRadius: "3px" }}>1950</span>
          </div>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <button
            type="button"
            onClick={() => {
              setScreenReaderActive(!screenReaderActive);
              setMessage(screenReaderActive ? "Screen reader optimization deactivated." : "Screen reader mode activated: High-contrast indicators and live ARIA announcements enabled.");
            }}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: screenReaderActive ? "#ea580c" : "#475569", fontWeight: "600", fontSize: "11px", padding: "2px 4px" }}
            title="Toggle Screen Reader Accessibility Mode"
          >
            Screen Reader {screenReaderActive ? "(Active)" : ""}
          </button>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <div style={{ display: "flex", gap: "2px" }}>
            <button
              type="button"
              onClick={() => handleFontSizeChange("small")}
              style={{ background: fontSizeLevel === "small" ? "#cbd5e1" : "transparent", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "11px", padding: "1px 5px", borderRadius: "3px", color: "#1e293b" }}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange("normal")}
              style={{ background: fontSizeLevel === "normal" ? "#cbd5e1" : "transparent", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "11px", padding: "1px 5px", borderRadius: "3px", color: "#1e293b" }}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange("large")}
              style={{ background: fontSizeLevel === "large" ? "#cbd5e1" : "transparent", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "11px", padding: "1px 5px", borderRadius: "3px", color: "#1e293b" }}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <span style={{ color: "#ea580c", fontWeight: "700" }}>ENGLISH</span>
        </div>
      </div>

      {/* ========================================================
          DESKTOP APPLICATION TOP BAR
      ======================================================== */}
      <nav className="navbar" style={{ height: "62px", padding: "0 24px", background: "#ffffff", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="brand" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ECIEmblem size={44} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#1e3a8a", margin: 0, letterSpacing: "-0.3px" }}>
                E-VOTING SYSTEM
              </h2>
              <span style={{ background: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.4px" }}>
                OFFICIAL DESKTOP TERMINAL
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "#475569", fontWeight: "600", display: "block" }}>
              Election Commission of India • National E-Voting Portal
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Real-Time Microservice Status Tag */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: isHealthy ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${isHealthy ? "#bbf7d0" : "#fecaca"}`,
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "700",
            color: isHealthy ? "#166534" : "#b91c1c"
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isHealthy ? "#22c55e" : "#ef4444",
              display: "inline-block"
            }}></span>
            {isHealthy ? "All Systems Operational" : "System Initializing..."}
          </div>

          <button
            onClick={() => setShowLedgerExplorer(true)}
            className="secondary-btn"
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
            title="Audit blockchain transactions, receipts, and blocks directly on Ethereum ledger"
          >
            <IconShield size={13} color="#16a34a" />
            <span>Ledger Explorer</span>
          </button>

          <button
            onClick={() => setShowAboutModal(true)}
            className="secondary-btn"
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              background: "white",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              color: "#1e3a8a"
            }}
          >
            About System & Help
          </button>

          <button
            onClick={() => {
              if (window.electronAPI && window.electronAPI.exitApp) {
                window.electronAPI.exitApp();
              } else {
                window.close();
              }
            }}
            className="secondary-btn"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              color: "#b91c1c"
            }}
          >
            Exit Terminal
          </button>
        </div>
      </nav>

      {/* ========================================================
          DESKTOP MAIN WORKSPACE (DUAL-PANE LAYOUT)
      ======================================================== */}
      <main style={{ flex: 1, padding: "24px", maxWidth: "1550px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        
        {/* MESSAGE / STATUS BANNER */}
        {message && (
          <div style={{
            marginBottom: "20px",
            padding: "12px 16px",
            background: message.toLowerCase().includes("success") ? "#f0fdf4" : "#fef2f2",
            borderLeft: `4px solid ${message.toLowerCase().includes("success") ? "#22c55e" : "#ef4444"}`,
            color: message.toLowerCase().includes("success") ? "#166534" : "#b91c1c",
            borderRadius: "4px",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{message}</span>
            <button onClick={() => setMessage("")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", color: "inherit" }}>&times;</button>
          </div>
        )}

        <div className="desktop-dual-pane" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", gap: "24px", alignItems: "start" }}>
          
          {/* ====================================================
              LEFT COLUMN: ACCESS PORTAL (VOTER / ECI OFFICIAL)
          ==================================================== */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            overflow: "hidden"
          }}>
            
            {/* PORTAL SWITCHER HEADER */}
            <div style={{
              display: "flex",
              background: "#f8fafc",
              borderBottom: "1px solid #cbd5e1"
            }}>
              <button
                onClick={() => {
                  setLoginType("VOTER");
                  setVoterTab("login");
                  setMessage("");
                }}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  border: "none",
                  background: loginType === "VOTER" ? "#ffffff" : "transparent",
                  borderBottom: loginType === "VOTER" ? "3px solid #ea580c" : "3px solid transparent",
                  fontWeight: loginType === "VOTER" ? "800" : "600",
                  color: loginType === "VOTER" ? "#ea580c" : "#64748b",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.15s ease"
                }}
              >
                <IconBallot size={16} color={loginType === "VOTER" ? "#ea580c" : "#64748b"} />
                <span>Voter Portal</span>
              </button>

              <button
                onClick={() => {
                  setLoginType("ADMIN");
                  setMessage("");
                }}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  border: "none",
                  background: loginType === "ADMIN" ? "#ffffff" : "transparent",
                  borderBottom: loginType === "ADMIN" ? "3px solid #1e3a8a" : "3px solid transparent",
                  fontWeight: loginType === "ADMIN" ? "800" : "600",
                  color: loginType === "ADMIN" ? "#1e3a8a" : "#64748b",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.15s ease"
                }}
              >
                <IconShield size={16} color={loginType === "ADMIN" ? "#1e3a8a" : "#64748b"} />
                <span>ECI Officer Portal</span>
              </button>
            </div>

            {/* PANE CONTENT */}
            <div style={{ padding: "24px 28px" }}>
              
              {/* ================================================
                  PANE 1: VOTER CONSOLE (LOGIN / REGISTER)
              ================================================ */}
              {loginType === "VOTER" && (
                <div>
                  {/* SUB-TABS: SIGN IN VS REGISTER */}
                  <div style={{
                    display: "flex",
                    background: "#f1f5f9",
                    padding: "3px",
                    borderRadius: "6px",
                    marginBottom: "20px"
                  }}>
                    <button
                      onClick={() => { setVoterTab("login"); setMessage(""); }}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "5px",
                        background: voterTab === "login" ? "#ffffff" : "transparent",
                        color: voterTab === "login" ? "#0f172a" : "#64748b",
                        fontWeight: voterTab === "login" ? "700" : "500",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        boxShadow: voterTab === "login" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setVoterTab("register"); setMessage(""); }}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "5px",
                        background: voterTab === "register" ? "#ffffff" : "transparent",
                        color: voterTab === "register" ? "#0f172a" : "#64748b",
                        fontWeight: voterTab === "register" ? "700" : "500",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        boxShadow: voterTab === "register" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                      }}
                    >
                      New Voter Registration (Form 6)
                    </button>
                  </div>

                  {voterTab === "login" ? (
                    /* VOTER SIGN IN FORM */
                    <div>
                      {/* ECI OFFICIAL EMBLEM & PORTAL HEADER */}
                      <div style={{ textAlign: "center", marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
                        <ECIEmblem size={52} />
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a", marginTop: "10px", letterSpacing: "0.4px" }}>
                          भारत निर्वाचन आयोग
                        </div>
                        <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#475569", letterSpacing: "0.5px" }}>
                          ELECTION COMMISSION OF INDIA
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px", fontWeight: "600" }}>
                          National E-Voting Portal
                        </div>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                          Voter ID (EPIC) or Email Address
                        </label>
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. voter@test.com or VOTER12345"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "13px",
                            outline: "none"
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") login();
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "13px",
                            outline: "none"
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button
                          onClick={login}
                          disabled={loading}
                          style={{
                            flex: 1,
                            padding: "11px 16px",
                            background: "#ea580c",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontWeight: "700",
                            fontSize: "13.5px",
                            cursor: loading ? "not-allowed" : "pointer"
                          }}
                        >
                          {loading ? "Signing In..." : "Sign In"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VOTER REGISTRATION FORM - STREAMLINED ECI FORM 6 */
                    <div style={{ maxHeight: "78vh", overflowY: "auto", paddingRight: "4px" }}>
                      
                      {/* CLEAN HEADER */}
                      <div style={{
                        padding: "10px 14px",
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderLeft: "4px solid #ea580c",
                        borderRadius: "6px",
                        marginBottom: "14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <ECIEmblem size={36} />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                              New Voter Registration (Form 6)
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                              भारत निर्वाचन आयोग • Election Commission of India
                            </div>
                          </div>
                        </div>
                        <span style={{
                          padding: "3px 8px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#1e40af"
                        }}>
                          New Voter
                        </span>
                      </div>

                      {/* SECTION 1: ELECTORAL JURISDICTION */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{
                          fontSize: "11.5px",
                          fontWeight: "800",
                          color: "#1e3a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          paddingBottom: "4px",
                          borderBottom: "1px solid #e2e8f0",
                          marginBottom: "8px"
                        }}>
                          1. State, District & Polling Station
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              State / Union Territory *
                            </label>
                            <select
                              value={selectedStateId}
                              onChange={(e) => {
                                setSelectedStateId(e.target.value);
                                setSelectedDistrictId("");
                                setSelectedPCId("");
                                setSelectedACId("");
                                setSelectedStationId("");
                              }}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#ffffff" }}
                            >
                              <option value="">Select State / UT (36 Available)</option>
                              {statesList.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              District *
                            </label>
                            <select
                              value={selectedDistrictId}
                              disabled={!selectedStateId}
                              onChange={(e) => {
                                setSelectedDistrictId(e.target.value);
                                setSelectedACId("");
                                setSelectedStationId("");
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "5px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12px",
                                background: !selectedStateId ? "#f1f5f9" : "#ffffff"
                              }}
                            >
                              <option value="">{selectedStateId ? `Select District (${districtsList.length} Available)` : "Select State First"}</option>
                              {districtsList.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Assembly Constituency (AC) *
                            </label>
                            <select
                              value={selectedACId}
                              disabled={!selectedDistrictId}
                              onChange={(e) => {
                                setSelectedACId(e.target.value);
                                setSelectedStationId("");
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "5px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12px",
                                background: !selectedDistrictId ? "#f1f5f9" : "#ffffff"
                              }}
                            >
                              <option value="">{selectedDistrictId ? `Select Assembly Constituency (${acsList.length} Available)` : "Select District First"}</option>
                              {acsList.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.constituency_number ? `${c.constituency_number} - ` : ""}{c.name} ({c.code})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Designated Polling Station *
                            </label>
                            <select
                              value={selectedStationId}
                              disabled={!selectedACId}
                              onChange={(e) => setSelectedStationId(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "5px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12px",
                                background: !selectedACId ? "#f1f5f9" : "#ffffff"
                              }}
                            >
                              <option value="">{selectedACId ? `Select Designated Polling Booth (${stationsList.length} Available)` : "Select Assembly Constituency First"}</option>
                              {stationsList.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Selected Station ECI Verification Card */}
                        {selectedStationId && (() => {
                          const stationObj = stationsList.find(st => String(st.id) === String(selectedStationId));
                          if (!stationObj) return null;
                          return (
                            <div style={{
                              marginTop: "10px",
                              padding: "10px 14px",
                              background: "#f0fdf4",
                              border: "1px solid #86efac",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              color: "#166534"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <span style={{ fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  Verified ECI Polling Booth: {stationObj.code}
                                </span>
                                <span style={{ background: "#dcfce7", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>
                                  Capacity: {stationObj.capacity || 1200} Electors
                                </span>
                              </div>
                              <div style={{ fontWeight: "700", color: "#14532d", marginBottom: "2px" }}>
                                {stationObj.name}
                              </div>
                              <div style={{ color: "#166534", fontSize: "11px" }}>
                                Building & Address: {stationObj.address || "Official Designated ECI Polling Station"}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* SECTION 2: PERSONAL PARTICULARS */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{
                          fontSize: "11.5px",
                          fontWeight: "800",
                          color: "#1e3a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          paddingBottom: "4px",
                          borderBottom: "1px solid #e2e8f0",
                          marginBottom: "8px"
                        }}>
                          2. Personal Particulars
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Full Name"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Gender *
                            </label>
                            <select
                              value={regGender}
                              onChange={(e) => setRegGender(e.target.value)}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#ffffff" }}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Third Gender">Third Gender</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Date of Birth *
                            </label>
                            <input
                              type="date"
                              value={regDob}
                              onChange={(e) => setRegDob(e.target.value)}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>
                        </div>

                        {/* Compact Age Badge */}
                        {regDob && (() => {
                          const age = calculateAge(regDob);
                          if (age === null) return null;
                          return (
                            <div style={{
                              marginTop: "5px",
                              padding: "4px 8px",
                              background: age >= 18 ? "#f0fdf4" : "#fef2f2",
                              border: `1px solid ${age >= 18 ? "#86efac" : "#fca5a5"}`,
                              borderRadius: "4px",
                              color: age >= 18 ? "#166534" : "#991b1b",
                              fontSize: "11px",
                              fontWeight: "600"
                            }}>
                              Age: {age} years ({age >= 18 ? "Eligible" : "Must be at least 18 years old to register"})
                            </div>
                          );
                        })()}
                      </div>

                      {/* SECTION 3: PARTICULARS OF RELATIVE */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{
                          fontSize: "11.5px",
                          fontWeight: "800",
                          color: "#1e3a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          paddingBottom: "4px",
                          borderBottom: "1px solid #e2e8f0",
                          marginBottom: "8px"
                        }}>
                          3. Particulars of Relative
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Relationship Type *
                            </label>
                            <select
                              value={regRelativeType}
                              onChange={(e) => setRegRelativeType(e.target.value)}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px", background: "#ffffff" }}
                            >
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Husband">Husband</option>
                              <option value="Legal Guardian">Legal Guardian</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Name of Relative
                            </label>
                            <input
                              type="text"
                              value={regRelativeName}
                              onChange={(e) => setRegRelativeName(e.target.value)}
                              placeholder="Relative's Name"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION 4: CONTACT & AADHAAR MOBILE OTP AUTHENTICATION */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{
                          fontSize: "11.5px",
                          fontWeight: "800",
                          color: "#1e3a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          paddingBottom: "4px",
                          borderBottom: "1px solid #e2e8f0",
                          marginBottom: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <span>3. Contact Details & Aadhaar Mobile OTP (UIDAI e-KYC)</span>
                          <span style={{ fontSize: "10.5px", color: phoneVerified ? "#15803d" : "#0284c7", fontWeight: "700" }}>
                            {phoneVerified ? "Aadhaar e-KYC Verified" : "OTP Verification Required"}
                          </span>
                        </div>

                        {/* Mismatch Alert Banner */}
                        {aadhaarMismatchWarning && (
                          <div style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            padding: "10px 12px",
                            marginBottom: "12px",
                            fontSize: "12px",
                            color: "#991b1b",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px"
                          }}>
                            <IconAlert size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <div>
                              <strong>Security Alert:</strong> {aadhaarMismatchWarning}
                            </div>
                          </div>
                        )}

                        {/* ROW 1: EMAIL & PHONE */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Email Address *
                            </label>
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="email@example.com"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Mobile Phone Number (India +91) *
                            </label>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                borderRadius: "5px",
                                padding: "0 8px",
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "#475569"
                              }}>
                                +91
                              </div>
                              <input
                                type="tel"
                                value={regPhone}
                                disabled={phoneVerified}
                                onChange={(e) => {
                                  setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                                  if (phoneVerified) setPhoneVerified(false);
                                }}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                style={{
                                  flex: 1,
                                  padding: "8px 10px",
                                  borderRadius: "5px",
                                  border: "1px solid #cbd5e1",
                                  background: phoneVerified ? "#f8fafc" : "#ffffff",
                                  fontSize: "12.5px",
                                  fontWeight: "600",
                                  letterSpacing: "0.5px"
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ROW 2: AADHAAR NUMBER & SEND OTP ACTION */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "10px", marginBottom: "10px", alignItems: "end" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                12-Digit Aadhaar Number *
                              </label>
                              <span style={{ fontSize: "10px", color: "#64748b" }}>UIDAI Linked Identity</span>
                            </div>
                            <input
                              type="text"
                              value={regAadhaar}
                              disabled={phoneVerified}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                                setRegAadhaar(digits);
                                if (phoneVerified) setPhoneVerified(false);
                              }}
                              placeholder="12-digit Aadhaar number"
                              maxLength={12}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "5px",
                                border: "1px solid #cbd5e1",
                                background: phoneVerified ? "#f8fafc" : "#ffffff",
                                fontSize: "12.5px",
                                fontWeight: "600",
                                letterSpacing: "1px"
                              }}
                            />
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={otpSending || otpCooldown > 0 || phoneVerified}
                              style={{
                                width: "100%",
                                padding: "9px 12px",
                                background: phoneVerified ? "#15803d" : (otpSending || otpCooldown > 0 ? "#94a3b8" : "#ea580c"),
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "5px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: (otpSending || otpCooldown > 0 || phoneVerified) ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px"
                              }}
                            >
                              {phoneVerified ? (
                                <>
                                  <IconCheck size={14} color="#ffffff" />
                                  <span>e-KYC Linked</span>
                                </>
                              ) : otpSending ? (
                                <span>Dispatching SMS...</span>
                              ) : otpCooldown > 0 ? (
                                <span>Resend in {otpCooldown}s</span>
                              ) : otpSent ? (
                                <span>Resend Aadhaar OTP</span>
                              ) : (
                                <span>Send Aadhaar OTP</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* ROW 3: OTP VERIFICATION BOX (APPEARS ON SEND OTP) */}
                        {(otpSent || phoneVerified) && (
                          <div style={{
                            background: phoneVerified ? "#f0fdf4" : "#eff6ff",
                            border: `1px solid ${phoneVerified ? "#bbf7d0" : "#bfdbfe"}`,
                            borderRadius: "6px",
                            padding: "12px 14px",
                            marginTop: "8px"
                          }}>
                            {phoneVerified ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534" }}>
                                <IconCheck size={16} color="#16a34a" />
                                <div>
                                  <strong style={{ fontSize: "12.5px", display: "block" }}>Aadhaar e-KYC & Mobile Phone Verified</strong>
                                  <span style={{ fontSize: "11px", color: "#15803d" }}>Identity cryptographically confirmed with UIDAI master registry.</span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                  <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#1e3a8a" }}>
                                    Enter 6-Digit Mobile Verification OTP *
                                  </label>
                                  <span style={{ fontSize: "10.5px", color: "#0369a1", fontWeight: "600" }}>
                                    OTP dispatched to +91-{regPhone.slice(0, 2)}******{regPhone.slice(-2)}
                                  </span>
                                </div>

                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <input
                                    type="text"
                                    value={regOtp}
                                    onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    style={{
                                      flex: 1,
                                      padding: "8px 12px",
                                      borderRadius: "5px",
                                      border: "1px solid #93c5fd",
                                      background: "#ffffff",
                                      fontSize: "14px",
                                      fontWeight: "800",
                                      letterSpacing: "3px",
                                      textAlign: "center"
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyOtp()}
                                    disabled={otpVerifying || !regOtp || regOtp.length !== 6}
                                    style={{
                                      padding: "8px 18px",
                                      background: otpVerifying || !regOtp || regOtp.length !== 6 ? "#94a3b8" : "#1e3a8a",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "5px",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      cursor: otpVerifying || !regOtp || regOtp.length !== 6 ? "not-allowed" : "pointer"
                                    }}
                                  >
                                    {otpVerifying ? "Verifying..." : "Verify OTP"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* SECTION 5: RESIDENTIAL ADDRESS */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{
                          fontSize: "11.5px",
                          fontWeight: "800",
                          color: "#1e3a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          paddingBottom: "4px",
                          borderBottom: "1px solid #e2e8f0",
                          marginBottom: "8px"
                        }}>
                          5. Residential Address
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginBottom: "8px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              House / Door No.
                            </label>
                            <input
                              type="text"
                              value={regHouseNo}
                              onChange={(e) => setRegHouseNo(e.target.value)}
                              placeholder="e.g. Flat 302, Block B"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Street / Locality
                            </label>
                            <input
                              type="text"
                              value={regStreet}
                              onChange={(e) => setRegStreet(e.target.value)}
                              placeholder="Street / Area / Locality"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              City / Town / Village
                            </label>
                            <input
                              type="text"
                              value={regVillage}
                              onChange={(e) => setRegVillage(e.target.value)}
                              placeholder="City / Town"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              PIN Code
                            </label>
                            <input
                              type="text"
                              value={regPincode}
                              onChange={(e) => setRegPincode(e.target.value)}
                              placeholder="6-digit PIN"
                              maxLength={6}
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION 6: PASSWORD & SECURITY */}
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{
                          fontSize: "11.5px",
                          fontWeight: "800",
                          color: "#1e3a8a",
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                          paddingBottom: "4px",
                          borderBottom: "1px solid #e2e8f0",
                          marginBottom: "8px"
                        }}>
                          6. Password & Security
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Password *
                            </label>
                            <input
                              type="password"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min 8 characters"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                              Confirm Password *
                            </label>
                            <input
                              type="password"
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                            Web3 Wallet Address (Optional)
                          </label>
                          <input
                            type="text"
                            value={regWalletAddress}
                            onChange={(e) => setRegWalletAddress(e.target.value)}
                            placeholder="0x... (Auto-allocated if left blank)"
                            style={{ width: "100%", padding: "8px 10px", borderRadius: "5px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                          />
                        </div>
                      </div>

                      {/* SECTION 7: BIOMETRIC FACIAL LIVENESS VERIFICATION */}
                      <Suspense fallback={
                        <div style={{ padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                          <div style={{ fontSize: "13px", color: "#1e3a8a", fontWeight: "600" }}>Initializing Secure Camera & Facial Liveness Engine...</div>
                        </div>
                      }>
                        <BiometricLivenessCapture
                          initialPhoto={regLivePhoto}
                          onVerified={({ photo, livenessScore: score, biometricVerified: verified, challengeToken: token }) => {
                            setRegLivePhoto(photo);
                            setBiometricVerified(verified);
                            setLivenessScore(score);
                            if (token) setRegBiometricChallengeToken(token);
                          }}
                        />
                      </Suspense>

                      {/* SECTION 8: DECLARATION */}
                      <div style={{
                        padding: "10px 12px",
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: "6px",
                        marginBottom: "14px"
                      }}>
                        <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", cursor: "pointer", fontSize: "11.5px", color: "#78350f", lineHeight: "1.45" }}>
                          <input
                            type="checkbox"
                            checked={regCitizenDeclaration}
                            onChange={(e) => setRegCitizenDeclaration(e.target.checked)}
                            style={{ marginTop: "3px" }}
                          />
                          <span>
                            I hereby solemnly declare that to the best of my knowledge and belief: I am a citizen of India, I am of the age of 18 years or above on the qualifying date, and I have not applied for or been included in the electoral roll for any other constituency. I am aware that making a statement or declaration which is false and which I either know or believe to be false or do not believe to be true, is punishable under <strong>Section 31 of the Representation of the People Act, 1950</strong>.
                          </span>
                        </label>
                      </div>

                      {/* PREREQUISITES CHECKLIST */}
                      {(!phoneVerified || !biometricVerified || !regCitizenDeclaration) && (
                        <div style={{
                          marginBottom: "12px",
                          padding: "8px 12px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: "5px",
                          fontSize: "11px",
                          color: "#1e40af",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}>
                          <span style={{ fontWeight: "700" }}>Mandatory Security & Identity Prerequisites:</span>
                          <span style={{ color: phoneVerified ? "#15803d" : "#b91c1c", fontWeight: "600" }}>
                            {phoneVerified ? "[Verified] Section 4: Aadhaar & Mobile OTP Authentication Completed" : "[Required] Section 4: Verify Aadhaar Linked Mobile OTP"}
                          </span>
                          <span style={{ color: biometricVerified ? "#15803d" : "#b91c1c", fontWeight: "600" }}>
                            {biometricVerified ? "[Verified] Section 7: Live Biometric Facial Liveness Confirmed" : "[Required] Section 7: Complete Live Webcam Facial Liveness Verification"}
                          </span>
                          <span style={{ color: regCitizenDeclaration ? "#15803d" : "#b91c1c", fontWeight: "600" }}>
                            {regCitizenDeclaration ? "[Confirmed] Section 8: Statutory Citizenship Declaration Accepted" : "[Required] Section 8: Accept Statutory Elector Declaration"}
                          </span>
                        </div>
                      )}

                      {/* SUBMIT BUTTON */}
                      <button
                        onClick={handleRegister}
                        disabled={loading || !regCitizenDeclaration || !phoneVerified || !biometricVerified}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          background: !regCitizenDeclaration || !phoneVerified || !biometricVerified || loading ? "#94a3b8" : "#ea580c",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "700",
                          fontSize: "13.5px",
                          cursor: !regCitizenDeclaration || !phoneVerified || !biometricVerified || loading ? "not-allowed" : "pointer",
                          transition: "background 0.15s ease"
                        }}
                      >
                        {loading ? "Submitting Form 6 to Electoral Registration Officer..." : "Submit Form 6 — Apply for Electoral Roll Inclusion"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================================================
                  PANE 2: ECI AUTHORITY / ADMIN CONSOLE
              ================================================ */}
              {loginType === "ADMIN" && (
                <div>
                  {/* ECI OFFICIAL EMBLEM & ADMIN HEADER */}
                  <div style={{ textAlign: "center", marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
                    <ECIEmblem size={52} />
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e3a8a", marginTop: "10px", letterSpacing: "0.4px" }}>
                      भारत निर्वाचन आयोग
                    </div>
                    <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#475569", letterSpacing: "0.5px" }}>
                      ELECTION COMMISSION OF INDIA
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px", fontWeight: "600" }}>
                      ECI Officer Console
                    </div>
                  </div>

                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 14px", borderRadius: "6px", marginBottom: "18px", fontSize: "12px", color: "#1e3a8a" }}>
                    Authorized access for Election Commission officers and administrators.
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="official.email@eci.gov.in"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") login();
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                  </div>

                  <button
                    onClick={login}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      background: "#1e3a8a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "13.5px",
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    {loading ? "Signing In..." : "Sign In as Officer"}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* ====================================================
              RIGHT COLUMN: CITIZEN GUIDE & SYSTEM STATUS
          ==================================================== */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* CARD 1: HOW TO VOTE (3 STEPS) */}
            <div style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                <strong style={{ fontSize: "13.5px", color: "#1e3a8a", display: "flex", alignItems: "center", gap: "6px" }}>
                  How to Cast Your Vote
                </strong>
                <span style={{ fontSize: "11px", background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                  3 Simple Steps
                </span>
              </div>

              <div style={{ display: "grid", gap: "12px", fontSize: "12.5px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#ea580c", color: "#fff", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "800", flexShrink: 0 }}>1</span>
                  <div>
                    <strong style={{ color: "#0f172a", display: "block" }}>Sign In or Register</strong>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>Sign in with your Voter ID (EPIC) or email. New voters can register using Form 6.</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#1e3a8a", color: "#fff", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "800", flexShrink: 0 }}>2</span>
                  <div>
                    <strong style={{ color: "#0f172a", display: "block" }}>Select Election & Candidate</strong>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>View active elections for your constituency and examine candidate details.</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#16a34a", color: "#fff", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "800", flexShrink: 0 }}>3</span>
                  <div>
                    <strong style={{ color: "#0f172a", display: "block" }}>Cast Vote & Get Receipt</strong>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>Submit your vote securely and download your official digital receipt slip.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: SYSTEM & SECURITY STATUS */}
            <div style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                <strong style={{ fontSize: "13.5px", color: "#1e3a8a" }}>
                  System Security & Readiness
                </strong>
                <button
                  type="button"
                  onClick={() => setShowAboutModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "11.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Technical Details
                </button>
              </div>

              <div style={{ display: "grid", gap: "8px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span style={{ color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                    <IconShield size={14} color="#16a34a" />
                    Blockchain Consensus
                  </span>
                  <span style={{ fontWeight: "700", color: "#16a34a", fontSize: "11px" }}>
                    Operational
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span style={{ color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                    <IconCheck size={14} color="#16a34a" />
                    Voter Roll Database
                  </span>
                  <span style={{ fontWeight: "700", color: "#16a34a", fontSize: "11px" }}>
                    Connected
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px" }}>
                  <span style={{ color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                    <IconLock size={14} color="#16a34a" />
                    Ballot Privacy & Encryption
                  </span>
                  <span style={{ fontWeight: "700", color: "#16a34a", fontSize: "11px" }}>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: VOTER HELPLINE */}
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", display: "block" }}>
                  National Voter Helpline
                </span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#ea580c" }}>
                  Toll-Free 1950
                </span>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                  24x7 Citizen Assistance
                </span>
              </div>
              <div style={{ textAlign: "right", fontSize: "11.5px", color: "#475569" }}>
                <span style={{ display: "block", fontWeight: "600" }}>Official ECI Portal</span>
                <span style={{ color: "#2563eb" }}>voters.eci.gov.in</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* OFFICIAL ECI MASTER GOV FOOTER */}
      <GovFooter />

      {/* SYSTEM INFO MODAL */}
      {showAboutModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "30px",
            width: "550px",
            color: "#f8fafc",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ECIEmblem size={34} />
                <h3 style={{ margin: 0, fontSize: "15px", color: "white" }}>SDEMS System Overview & Technical Specifications</h3>
              </div>
              <button onClick={() => setShowAboutModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#38bdf8", margin: "0 0 4px" }}>SDEMS</h2>
              <strong style={{ display: "block", color: "#cbd5e1", margin: "0 0 12px" }}>Secure Decentralized Election Management System v1.0.0</strong>
              
              <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "14px" }}>
                National Secure Electronic Voting System developed in accordance with Election Commission of India standards.
              </p>

              <div>
                <strong style={{ color: "white", fontSize: "12.5px" }}>Architecture & Components:</strong>
                <ul style={{ margin: "5px 0 0", paddingLeft: "20px", color: "#cbd5e1", fontSize: "12px", display: "grid", gap: "3px" }}>
                  <li><strong>Desktop App:</strong> React, Vite, Electron Native Container</li>
                  <li><strong>Backend Services:</strong> Node.js, Express REST API, JWT Authentication</li>
                  <li><strong>Database:</strong> PostgreSQL Relational Database with Integrity Constraints</li>
                  <li><strong>Blockchain Ledger:</strong> Hardhat Local EVM Node, Solidity Smart Contracts, ethers.js</li>
                  <li><strong>Analytics Engine:</strong> Python Turnout & Demographic Analytics</li>
                </ul>
              </div>

              <div style={{ marginTop: "16px", background: "#0f172a", padding: "12px", borderRadius: "8px", border: "1px solid #334155" }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px", fontSize: "12px" }}>ECI Technical Compliance:</strong>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>
                  Complies with Election Commission of India electoral integrity and voter privacy standards, featuring end-to-end cryptographic verification and immutable ballot records.
                </span>
              </div>
            </div>

            <button onClick={() => setShowAboutModal(false)} className="primary-btn" style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#1e3a8a" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ON-CHAIN BLOCKCHAIN LEDGER EXPLORER & AUDIT MODAL */}
      {showLedgerExplorer && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
            padding: "26px",
            width: "680px",
            maxWidth: "95vw",
            maxHeight: "90vh",
            overflowY: "auto",
            color: "#0f172a",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ECIEmblem size={34} />
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", color: "#1e3a8a", fontWeight: "800" }}>
                    ON-CHAIN LEDGER EXPLORER & BALLOT AUDIT
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Direct Ethereum JSON-RPC Consensus & Inclusion Proof Tool
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLedgerExplorer(false);
                  setLedgerAuditResult(null);
                  setLedgerAuditError("");
                }}
                style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "22px", cursor: "pointer", fontWeight: "bold" }}
              >
                &times;
              </button>
            </div>

            {/* Query Search Bar */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#1e3a8a", marginBottom: "6px" }}>
                Query Blockchain Ledger by Transaction Hash or Receipt Code:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={ledgerQuery}
                  onChange={(e) => setLedgerQuery(e.target.value)}
                  placeholder="e.g. 0x20ec39... or REC-..."
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontFamily: "monospace"
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") auditLedgerTransaction(ledgerQuery);
                  }}
                />
                <button
                  type="button"
                  onClick={() => auditLedgerTransaction(ledgerQuery)}
                  disabled={ledgerAuditLoading || !ledgerQuery.trim()}
                  className="primary-btn"
                  style={{
                    padding: "9px 18px",
                    background: ledgerAuditLoading || !ledgerQuery.trim() ? "#94a3b8" : "#1e3a8a",
                    fontSize: "12.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <IconShield size={14} color="#ffffff" />
                  <span>{ledgerAuditLoading ? "Auditing..." : "Audit Ledger"}</span>
                </button>
              </div>

              {/* Quick load recent tx */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Quick audit:</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("http://localhost:5000/api/blockchain/transactions");
                      const d = await res.json();
                      if (d.success && d.transactions && d.transactions.length > 0) {
                        const hash = d.transactions[0].tx_hash;
                        setLedgerQuery(hash);
                        auditLedgerTransaction(hash);
                      } else {
                        alert("No recent transactions on ledger yet.");
                      }
                    } catch (e) {
                      alert("Unable to fetch transactions: " + e.message);
                    }
                  }}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    color: "#1e3a8a",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Load Latest Block Transaction
                </button>
                {voterReceipt?.receipt_code && (
                  <button
                    type="button"
                    onClick={() => {
                      setLedgerQuery(voterReceipt.receipt_code);
                      auditLedgerTransaction(voterReceipt.receipt_code);
                    }}
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "4px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      color: "#1e40af",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Audit My Elector Receipt
                  </button>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {ledgerAuditError && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                padding: "10px 14px",
                color: "#991b1b",
                fontSize: "12px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <IconAlert size={16} color="#dc2626" />
                <span>{ledgerAuditError}</span>
              </div>
            )}

            {/* Audit Results */}
            {ledgerAuditResult?.ledgerProof && (
              <div style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534" }}>
                    <IconCheck size={18} color="#16a34a" />
                    <strong style={{ fontSize: "13px" }}>Consensus Verified on Local Ethereum Node (Port 8545)</strong>
                  </div>
                  <span style={{
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    color: "#15803d",
                    padding: "3px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "0.4px"
                  }}>
                    {ledgerAuditResult.ledgerProof.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11.5px" }}>
                  <div>
                    <span style={{ color: "#64748b", display: "block" }}>Block Height:</span>
                    <strong style={{ color: "#0f172a", fontSize: "13px" }}>Block #{ledgerAuditResult.ledgerProof.blockNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block" }}>Confirmations:</span>
                    <strong style={{ color: "#166534", fontSize: "13px" }}>{ledgerAuditResult.ledgerProof.confirmations} Block Confirmations</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block" }}>Gas Consumed:</span>
                    <strong style={{ color: "#0f172a" }}>{ledgerAuditResult.ledgerProof.gasUsed} gas units</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", display: "block" }}>Smart Contract Address:</span>
                    <code style={{ fontSize: "10.5px", color: "#1e3a8a", wordBreak: "break-all" }}>{ledgerAuditResult.ledgerProof.contractAddress}</code>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ color: "#64748b", display: "block" }}>Transaction Hash:</span>
                    <code style={{ fontSize: "11px", color: "#0f172a", wordBreak: "break-all", background: "#ffffff", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", display: "block", marginTop: "2px" }}>
                      {ledgerAuditResult.ledgerProof.txHash}
                    </code>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ color: "#64748b", display: "block" }}>Transacting Account (From):</span>
                    <code style={{ fontSize: "10.5px", color: "#475569", wordBreak: "break-all" }}>{ledgerAuditResult.ledgerProof.from}</code>
                  </div>
                  {ledgerAuditResult.ledgerProof.receiptCode && (
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Linked Receipt Code:</span>
                      <strong style={{ color: "#1e3a8a", fontFamily: "monospace" }}>{ledgerAuditResult.ledgerProof.receiptCode}</strong>
                    </div>
                  )}
                  {ledgerAuditResult.ledgerProof.electionTitle && (
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Election Jurisdiction:</span>
                      <strong style={{ color: "#0f172a" }}>{ledgerAuditResult.ledgerProof.electionTitle}</strong>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "12px", padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "11px", color: "#166534" }}>
                  <strong>Statutory Inclusion Guarantee:</strong> This transaction is permanently immured inside the cryptographic ledger state. Under Section 128 of the Representation of the People Act 1951, receipt verification proves voter participation without revealing candidate choice.
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowLedgerExplorer(false);
                setLedgerAuditResult(null);
                setLedgerAuditError("");
              }}
              className="primary-btn"
              style={{ width: "100%", padding: "10px", background: "#1e3a8a", fontSize: "13px" }}
            >
              Close Ledger Explorer
            </button>
          </div>
        </div>
      )}

      {/* ECI Chunav Mitra AI Assistant Widget */}
      <ECIChatbot
        user={user}
        election={election}
        voterReceipt={voterReceipt}
        onNavigateTab={(tab) => {
          if (tab === "login-voter") {
            setShowLogin(true);
            setLoginType("VOTER");
            setVoterTab("login");
          } else if (tab === "register-voter") {
            setShowLogin(true);
            setLoginType("VOTER");
            setVoterTab("register");
          } else if (tab === "login-admin") {
            setShowLogin(true);
            setLoginType("ADMIN");
          } else if (tab === "admin-dashboard") {
            if (isAdmin) {
              setShowAdmin(true);
            } else {
              setShowLogin(true);
              setLoginType("ADMIN");
            }
          } else if (tab === "current" || tab === "elections") {
            setVoterActiveTab("current");
          } else if (tab === "receipt") {
            setVoterActiveTab("receipt");
          } else if (tab === "profile") {
            setVoterActiveTab("profile");
          } else if (tab === "upcoming") {
            setVoterActiveTab("upcoming");
          } else if (tab === "results") {
            setVoterActiveTab("results");
          } else if (tab === "grievances") {
            setVoterActiveTab("grievances");
          } else if (tab === "compliance") {
            setVoterActiveTab("compliance");
          } else if (tab === "calendar") {
            setVoterActiveTab("calendar");
          } else if (tab === "atlas" || tab === "map") {
            setVoterActiveTab("atlas");
          }
        }}
      />

      {/* Official ECI Mobile SMS Gateway Dispatch Notification & Smartphone Simulator */}
      <MobileSmsSimulator
        virtualSms={virtualSmsData}
        onAutoFill={(code) => {
          setRegOtp(code);
          handleVerifyOtp(code);
        }}
        onDismiss={() => setVirtualSmsData(null)}
      />

    </div>
  );
}

export default App;