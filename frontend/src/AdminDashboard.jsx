import { useEffect, useState, useRef } from "react";
import ECISymbolIcon from "./ECISymbolIcon";
import ECIEmblem from "./ECIEmblem";
import IndiaElectionMap from "./IndiaElectionMap";
import { IconShield, IconReceipt, IconRefresh, IconCheck, IconAlert, IconCopy, IconPrint, IconDownload, IconBallot, IconLock } from "./GovIcons";
import { format12HourDateTime, format12HourDate, format12HourTime } from "./utils/dateUtils";

const ALL_INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

function AdminDashboard() {

    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [electionStatusFilter, setElectionStatusFilter] = useState("ALL");
    const [electionSearchFilter, setElectionSearchFilter] = useState("");
    const resultsRef = useRef(null);

    // ============================================================
    // ELECTRON TABS & SYSTEM HEALTH STATE
    // ============================================================
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem("adminActiveTab") || "dashboard");
    const [healthData, setHealthData] = useState(null);
    const [healthLoading, setHealthLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditSearch, setAuditSearch] = useState("");
    const [auditActionFilter, setAuditActionFilter] = useState("ALL");
    const [allReceipts, setAllReceipts] = useState([]);
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [receiptSearch, setReceiptSearch] = useState("");
    const [auditSubTab, setAuditSubTab] = useState("logs");
    const [receiptModalData, setReceiptModalData] = useState(null);
    const [blockchainStatus, setBlockchainStatus] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);

    // ============================================================
    // CANDIDATE MANAGEMENT STATE
    // ============================================================

    const [selectedElection, setSelectedElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [candidateName, setCandidateName] = useState("");
    const [candidateParty, setCandidateParty] = useState("");
    const [candidateSymbol, setCandidateSymbol] = useState("");
    const [candidateManifesto, setCandidateManifesto] = useState("");
    const [parties, setParties] = useState([]);
    const [partiesLoading, setPartiesLoading] = useState(false);
    const [partySearchFilter, setPartySearchFilter] = useState("");

    // Dedicated Candidate Scrutiny Portal State
    const [allCandidates, setAllCandidates] = useState([]);
    const [candidateElectionFilter, setCandidateElectionFilter] = useState("ALL");
    const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
    const [candidatePartyFilter, setCandidatePartyFilter] = useState("ALL");
    const [candidateLoading, setCandidateLoading] = useState(false);
    const [showCandidateNominateModal, setShowCandidateNominateModal] = useState(false);
    const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);
    const [newCandElectionId, setNewCandElectionId] = useState("");
    const [newCandName, setNewCandName] = useState("");
    const [newCandParty, setNewCandParty] = useState("");
    const [newCandSymbol, setNewCandSymbol] = useState("");
    const [newCandManifesto, setNewCandManifesto] = useState("");
    const [newCandEducation, setNewCandEducation] = useState("Graduate");
    const [newCandAssets, setNewCandAssets] = useState("");
    const [newCandLiabilities, setNewCandLiabilities] = useState("");
    const [newCandCriminalCases, setNewCandCriminalCases] = useState("0");
    const [newCandAffidavit, setNewCandAffidavit] = useState("");
    const [candidateSubmitting, setCandidateSubmitting] = useState(false);

    // Dedicated Voter Services & Form 8 Portal State
    const [voterServices, setVoterServices] = useState([]);
    const [voterServiceFilter, setVoterServiceFilter] = useState("ALL");
    const [voterServiceStatusFilter, setVoterServiceStatusFilter] = useState("ALL");
    const [voterServiceLoading, setVoterServiceLoading] = useState(false);
    const [voterServiceSearchQuery, setVoterServiceSearchQuery] = useState("");

    // ============================================================
    // VOTER MANAGEMENT STATE
    // ============================================================

    const [voters, setVoters] = useState([]);
    const [showVoters, setShowVoters] = useState(false);

    // Dedicated Voter Authorization Console State
    const [authElectionId, setAuthElectionId] = useState("");
    const [authVoters, setAuthVoters] = useState([]);
    const [authLoading, setAuthLoading] = useState(false);
    const [authSearchQuery, setAuthSearchQuery] = useState("");
    const [authStatusFilter, setAuthStatusFilter] = useState("ALL"); // ALL, AUTHORIZED, PENDING, VOTED
    const [authorizingVoterId, setAuthorizingVoterId] = useState(null);
    const [batchAuthLoading, setBatchAuthLoading] = useState(false);
    const [authPage, setAuthPage] = useState(1);
    const [authPageSize, setAuthPageSize] = useState(25);
    const [copiedWallet, setCopiedWallet] = useState(null);

    // ============================================================
    // RESULTS STATE
    // ============================================================

    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // ============================================================
    // ELECTION MANAGEMENT UPGRADE STATE
    // ============================================================
    const [constituencies, setConstituencies] = useState([]);
    const [constStateFilter, setConstStateFilter] = useState("ALL");
    const [constSearch, setConstSearch] = useState("");
    const [constTypeFilter, setConstTypeFilter] = useState("PC");
    const [newConstState, setNewConstState] = useState("Maharashtra");
    const [newConstNumber, setNewConstNumber] = useState(1);
    const [reconciliation, setReconciliation] = useState([]);
    const [analyticsOutput, setAnalyticsOutput] = useState("");
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [reportStatus, setReportStatus] = useState("");
    const [pollingStations, setPollingStations] = useState([]);
    const [voterList, setVoterList] = useState([]);
    const [voterSearch, setVoterSearch] = useState("");
    const [voterStateFilter, setVoterStateFilter] = useState("ALL");
    const [voterStatusFilter, setVoterStatusFilter] = useState("ALL");
    const [showStateSummary, setShowStateSummary] = useState(false);
    const [voterPage, setVoterPage] = useState(1);
    const [voterPageSize, setVoterPageSize] = useState(50);
    const [duplicates, setDuplicates] = useState(null);
    const [backupStatus, setBackupStatus] = useState("");
    const [newElectionTitle, setNewElectionTitle] = useState("");
    const [newElectionDesc, setNewElectionDesc] = useState("");
    const [newElectionStart, setNewElectionStart] = useState("");
    const [newElectionEnd, setNewElectionEnd] = useState("");
    const [creatingElection, setCreatingElection] = useState(false);

    // Form parameter states
    const [newConstName, setNewConstName] = useState("");
    const [newConstCode, setNewConstCode] = useState("");
    const [newConstLevel, setNewConstLevel] = useState("CONSTITUENCY");
    const [newConstParent, setNewConstParent] = useState("");
    const [newStationName, setNewStationName] = useState("");
    const [newStationCode, setNewStationCode] = useState("");
    const [newStationAddress, setNewStationAddress] = useState("");
    const [newStationConstId, setNewStationConstId] = useState("");
    const [newPartyName, setNewPartyName] = useState("");
    const [newPartyAbbr, setNewPartyAbbr] = useState("");
    const [newPartyLeader, setNewPartyLeader] = useState("");
    const [newPartySymbol, setNewPartySymbol] = useState("");
    const [newPartyContact, setNewPartyContact] = useState("");

    // Inline Edit States for admin management
    const [editingElectionId, setEditingElectionId] = useState(null);
    const [editElectionTitle, setEditElectionTitle] = useState("");
    const [editElectionDesc, setEditElectionDesc] = useState("");
    const [editElectionStart, setEditElectionStart] = useState("");
    const [editElectionEnd, setEditElectionEnd] = useState("");

    const [editingConstId, setEditingConstId] = useState(null);
    const [editConstName, setEditConstName] = useState("");
    const [editConstCode, setEditConstCode] = useState("");
    const [editConstLevel, setEditConstLevel] = useState("CONSTITUENCY");

    const [editingStationId, setEditingStationId] = useState(null);
    const [editStationName, setEditStationName] = useState("");
    const [editStationCode, setEditStationCode] = useState("");
    const [editStationAddress, setEditStationAddress] = useState("");
    const [editStationConstId, setEditStationConstId] = useState("");
    const [editStationCapacity, setEditStationCapacity] = useState(1000);

    const [editingPartyId, setEditingPartyId] = useState(null);
    const [editPartyName, setEditPartyName] = useState("");
    const [editPartyAbbr, setEditPartyAbbr] = useState("");
    const [editPartyLeader, setEditPartyLeader] = useState("");
    const [editPartySymbol, setEditPartySymbol] = useState("");
    const [editPartyContact, setEditPartyContact] = useState("");

    const [editingCandidateId, setEditingCandidateId] = useState(null);
    const [editCandidateName, setEditCandidateName] = useState("");
    const [editCandidateParty, setEditCandidateParty] = useState("");
    const [editCandidateSymbol, setEditCandidateSymbol] = useState("");
    const [editCandidateBiography, setEditCandidateBiography] = useState("");

    const [editingVoterId, setEditingVoterId] = useState(null);
    const [editVoterName, setEditVoterName] = useState("");
    const [editVoterEmail, setEditVoterEmail] = useState("");
    const [editVoterPhone, setEditVoterPhone] = useState("");
    const [editVoterAddress, setEditVoterAddress] = useState("");
    const [editVoterVerified, setEditVoterVerified] = useState(false);
    const [editVoterActive, setEditVoterActive] = useState(false);

    // ============================================================
    // ECI GOVERNANCE MODULES STATE
    // ============================================================
    const [officers, setOfficers] = useState([]);
    const [newOfficerEmail, setNewOfficerEmail] = useState("");
    const [newOfficerRole, setNewOfficerRole] = useState("RETURNING_OFFICER");
    const [newOfficerJurisdiction, setNewOfficerJurisdiction] = useState("CONSTITUENCY");
    const [newOfficerState, setNewOfficerState] = useState("");
    const [newOfficerDistrict, setNewOfficerDistrict] = useState("");
    const [newOfficerConstId, setNewOfficerConstId] = useState("");

    const [symbols, setSymbols] = useState([]);
    const [newSymbolName, setNewSymbolName] = useState("");
    const [newSymbolUrl, setNewSymbolUrl] = useState("");

    const [grievances, setGrievances] = useState([]);
    const [complianceViolations, setComplianceViolations] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [repolls, setRepolls] = useState([]);
    const [phases, setPhases] = useState([]);
    const [versionHistory, setVersionHistory] = useState([]);
    const [auditReplayTimeline, setAuditReplayTimeline] = useState([]);
    const [auditReplayElectionId, setAuditReplayElectionId] = useState("");

    // Form inputs for phases & repolls
    const [newPhaseNumber, setNewPhaseNumber] = useState(1);
    const [newPhaseDate, setNewPhaseDate] = useState("");
    const [newPhaseConsts, setNewPhaseConsts] = useState("");
    const [newPhaseElectionId, setNewPhaseElectionId] = useState("");

    const [newRepollElectionId, setNewRepollElectionId] = useState("");
    const [newRepollConstId, setNewRepollConstId] = useState("");
    const [newRepollStationId, setNewRepollStationId] = useState("");
    const [newRepollReason, setNewRepollReason] = useState("");
    const [newRepollDate, setNewRepollDate] = useState("");

    const [connStatus, setConnStatus] = useState("Live"); // "Live" | "Updating" | "Offline"

    // ============================================================
    // OFFICIAL ECI REFERENCE DATA STATE
    // ============================================================
    const [refSubTab, setRefSubTab] = useState("states");
    const [refStates, setRefStates] = useState([]);
    const [refDistricts, setRefDistricts] = useState([]);
    const [refPCs, setRefPCs] = useState([]);
    const [refACs, setRefACs] = useState([]);
    const [refParties, setRefParties] = useState([]);
    const [refSymbols, setRefSymbols] = useState([]);
    const [refElections, setRefElections] = useState([]);
    const [refStats, setRefStats] = useState(null);
    const [selectedRefElectionId, setSelectedRefElectionId] = useState("");

    const [refSearch, setRefSearch] = useState("");
    const [refFilter, setRefFilter] = useState("ALL");
    const [refSort, setRefSort] = useState("");

    // CSV Import Form States
    const [importTableType, setImportTableType] = useState("states");
    const [csvText, setCsvText] = useState("");
    const [importDataSource, setImportDataSource] = useState("Election Commission of India");
    const [importSourceUrl, setImportSourceUrl] = useState("https://eci.gov.in");
    const [importSourceDate, setImportSourceDate] = useState("");
    const [validationReport, setValidationReport] = useState(null);
    const [previewRecords, setPreviewRecords] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Edit form states
    const [editingRefId, setEditingRefId] = useState(null);
    const [editingRefName, setEditingRefName] = useState("");
    const [editingRefCode, setEditingRefCode] = useState("");
    const [editingRefType, setEditingRefType] = useState("");
    const [editingRefStatus, setEditingRefStatus] = useState("ACTIVE");
    const [editingRefSource, setEditingRefSource] = useState("");
    const [editingRefUrl, setEditingRefUrl] = useState("");
    const [editingRefDate, setEditingRefDate] = useState("");

    // Add form states
    const [addRefName, setAddRefName] = useState("");
    const [addRefCode, setAddRefCode] = useState("");
    const [addRefType, setAddRefType] = useState("");
    const [addRefState, setAddRefState] = useState("");
    const [addRefSymbol, setAddRefSymbol] = useState("");
    const [addRefSource, setAddRefSource] = useState("");
    const [addRefUrl, setAddRefUrl] = useState("");
    const [addRefDate, setAddRefDate] = useState("");
    const [sidebarSearch, setSidebarSearch] = useState("");

    // ============================================================
    // DATABASE MANAGEMENT & EXPLORER STATE
    // ============================================================
    const [dbOverview, setDbOverview] = useState(null);
    const [dbLoading, setDbLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState("users");
    const [tableData, setTableData] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [tableSearch, setTableSearch] = useState("");
    const [tableFilterSearch, setTableFilterSearch] = useState("");
    const [tablePage, setTablePage] = useState(1);
    const [tableLimit, setTableLimit] = useState(25);
    const [tableSortBy, setTableSortBy] = useState("id");
    const [tableSortDir, setTableSortDir] = useState("ASC");
    const [dbViewMode, setDbViewMode] = useState("data"); // "data" | "schema" | "backup"
    const [dbBackupMsg, setDbBackupMsg] = useState("");

    // Loaders
    const loadRefData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };
            
            let query = `?search=${encodeURIComponent(refSearch)}&sort=${refSort}`;
            if (refFilter && refFilter !== "ALL") query += `&status=${refFilter}&type=${refFilter}`;

            if (refSubTab === "states") {
                const res = await fetch(`http://localhost:5000/api/ref-data/states${query}`, { headers });
                const data = await res.json();
                if (data.success) setRefStates(data.states);
            } else if (refSubTab === "districts") {
                const res = await fetch(`http://localhost:5000/api/ref-data/districts${query}`, { headers });
                const data = await res.json();
                if (data.success) setRefDistricts(data.districts);
            } else if (refSubTab === "pcs") {
                const res = await fetch(`http://localhost:5000/api/ref-data/parliamentary-constituencies${query}`, { headers });
                const data = await res.json();
                if (data.success) setRefPCs(data.constituencies);
            } else if (refSubTab === "acs") {
                const res = await fetch(`http://localhost:5000/api/ref-data/assembly-constituencies${query}`, { headers });
                const data = await res.json();
                if (data.success) setRefACs(data.constituencies);
            } else if (refSubTab === "parties") {
                const res = await fetch(`http://localhost:5000/api/ref-data/parties${query}`, { headers });
                const data = await res.json();
                if (data.success) setRefParties(data.parties);
            } else if (refSubTab === "symbols") {
                const res = await fetch(`http://localhost:5000/api/ref-data/symbols?search=${encodeURIComponent(refSearch)}`, { headers });
                const data = await res.json();
                if (data.success) setRefSymbols(data.symbols);
            } else if (refSubTab === "elections") {
                const res = await fetch(`http://localhost:5000/api/ref-data/elections${query}`, { headers });
                const data = await res.json();
                if (data.success) setRefElections(data.elections);
            } else if (refSubTab === "stats") {
                if (selectedRefElectionId) {
                    const res = await fetch(`http://localhost:5000/api/ref-data/statistics/${selectedRefElectionId}`, { headers });
                    const data = await res.json();
                    if (data.success) setRefStats(data.statistics);
                } else {
                    setRefStats(null);
                }
            } else if (refSubTab === "data_sources") {
                const res1 = await fetch("http://localhost:5000/api/ref-data/states", { headers });
                const d1 = await res1.json();
                if (d1.success) setRefStates(d1.states);
                const res2 = await fetch("http://localhost:5000/api/ref-data/parties", { headers });
                const d2 = await res2.json();
                if (d2.success) setRefParties(d2.parties);
            } else if (refSubTab === "verification") {
                const res1 = await fetch("http://localhost:5000/api/ref-data/states", { headers });
                const d1 = await res1.json();
                if (d1.success) setRefStates(d1.states.filter(s => s.data_status === "IMPORTED" || s.data_status === "REFERENCE_PENDING"));
                const res2 = await fetch("http://localhost:5000/api/ref-data/parties", { headers });
                const d2 = await res2.json();
                if (d2.success) setRefParties(d2.parties.filter(p => p.data_status === "IMPORTED" || p.data_status === "REFERENCE_PENDING"));
            } else if (refSubTab === "archived_data") {
                const res1 = await fetch("http://localhost:5000/api/ref-data/states?status=ARCHIVED", { headers });
                const d1 = await res1.json();
                if (d1.success) setRefStates(d1.states);
                const res2 = await fetch("http://localhost:5000/api/ref-data/parties?status=ARCHIVED", { headers });
                const d2 = await res2.json();
                if (d2.success) setRefParties(d2.parties);
            }
        } catch (err) {
            console.error("Ref data error:", err);
        }
    };

    const handleAddRef = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            let endpoint = "";
            let body = {};
            if (refSubTab === "states") {
                endpoint = "states";
                body = { name: addRefName, code: addRefCode, type: addRefType, data_source: addRefSource, source_url: addRefUrl, source_date: addRefDate };
            } else if (refSubTab === "parties") {
                endpoint = "parties";
                body = { name: addRefName, abbreviation: addRefCode, party_type: addRefType, state: addRefState, symbol_name: addRefSymbol, data_source: addRefSource, source_url: addRefUrl, source_date: addRefDate };
            } else {
                return;
            }

            const res = await fetch(`http://localhost:5000/api/ref-data/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                alert("Reference data added successfully.");
                setAddRefName("");
                setAddRefCode("");
                setAddRefType("");
                setAddRefState("");
                setAddRefSymbol("");
                setAddRefSource("");
                setAddRefUrl("");
                setAddRefDate("");
                loadRefData();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleUpdateRef = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            let endpoint = refSubTab === "states" ? "states" : "parties";
            const body = {
                name: editingRefName,
                code: editingRefCode,
                abbreviation: editingRefCode,
                type: editingRefType,
                party_type: editingRefType,
                status: editingRefStatus,
                data_source: editingRefSource,
                source_url: editingRefUrl,
                source_date: editingRefDate
            };
            const res = await fetch(`http://localhost:5000/api/ref-data/${endpoint}/${editingRefId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                alert("Reference data updated successfully.");
                setEditingRefId(null);
                loadRefData();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleVerifyRef = async (id, type) => {
        try {
            const token = localStorage.getItem("token");
            let endpoint = type === "state" ? "states" : "parties";
            const res = await fetch(`http://localhost:5000/api/ref-data/${endpoint}/${id}/verify`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Data record verified successfully.");
                loadRefData();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleArchiveRef = async (id, type) => {
        if (!confirm("Are you sure you want to archive this reference data?")) return;
        try {
            const token = localStorage.getItem("token");
            let endpoint = type === "state" ? "states" : "parties";
            const res = await fetch(`http://localhost:5000/api/ref-data/${endpoint}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Data record archived.");
                loadRefData();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleValidateImport = async (e) => {
        e.preventDefault();
        if (!csvText.trim()) {
            alert("Please paste CSV data first.");
            return;
        }
        try {
            setIsValidating(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/ref-data/import/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    tableType: importTableType,
                    csvText,
                    data_source: importDataSource,
                    source_url: importSourceUrl,
                    source_date: importSourceDate
                })
            });
            const data = await res.json();
            if (data.success) {
                setValidationReport(data.validationReport);
                setPreviewRecords(data.previewRecords);
            } else {
                alert("Validation error: " + data.message);
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsValidating(false);
        }
    };

    const handleApproveImport = async () => {
        if (previewRecords.length === 0) {
            alert("No valid records to import.");
            return;
        }
        try {
            setIsImporting(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/ref-data/import/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    tableType: importTableType,
                    records: previewRecords
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setCsvText("");
                setValidationReport(null);
                setPreviewRecords([]);
                loadRefData();
            } else {
                alert("Import failed: " + data.message);
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setIsImporting(false);
        }
    };
    const loadOfficers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/officers", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setOfficers(data.officers);
        } catch (err) { console.error("Error loading officers:", err); }
    };

    const createOfficer = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/gov/officers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    user_email: newOfficerEmail,
                    role: newOfficerRole,
                    jurisdiction_level: newOfficerJurisdiction,
                    state: newOfficerState,
                    district: newOfficerDistrict,
                    constituency_id: newOfficerConstId || null
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Election Officer assigned successfully!");
                setNewOfficerEmail("");
                loadOfficers();
            } else { alert(`Error: ${data.message}`); }
        } catch (err) { alert(err.message); }
    };

    const deleteOfficer = async (id) => {
        if (!confirm("Are you sure you want to remove this officer assignment?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/gov/officers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Officer assignment removed.");
                loadOfficers();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const loadSymbols = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/symbols", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setSymbols(data.symbols);
        } catch (err) { console.error("Error loading symbols:", err); }
    };

    const createSymbol = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/gov/symbols", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ name: newSymbolName, image_url: newSymbolUrl })
            });
            const data = await res.json();
            if (data.success) {
                alert("Symbol registered successfully!");
                setNewSymbolName("");
                setNewSymbolUrl("");
                loadSymbols();
            } else { alert(`Error: ${data.message}`); }
        } catch (err) { alert(err.message); }
    };

    const loadVoterServices = async (silent = false) => {
        try {
            if (!silent) setVoterServiceLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/voter-services/admin/all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setVoterServices(data.requests || []);
            }
        } catch (err) {
            console.error("Error loading voter services:", err);
        } finally {
            if (!silent) setVoterServiceLoading(false);
        }
    };

    const updateVoterService = async (id, status, autoApply = false) => {
        const adminNotes = prompt(`Enter official Electoral Registration Officer notes for status "${status}":`);
        if (adminNotes === null) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/voter-services/admin/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status, admin_notes: adminNotes, auto_apply: autoApply })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Application #${id} status updated to ${status}.`);
                loadVoterServices();
                if (autoApply) loadVotersList();
            } else {
                alert(data.message || "Failed to update status.");
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const loadGrievances = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/grievances", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setGrievances(data.grievances);
        } catch (err) { console.error("Error loading grievances:", err); }
    };

    const updateGrievanceStatus = async (id, status, resolution) => {
        try {
            const res = await fetch(`http://localhost:5000/api/gov/grievances/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ status, resolution })
            });
            const data = await res.json();
            if (data.success) {
                alert("Grievance updated successfully!");
                loadGrievances();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const loadCompliance = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/compliance", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setComplianceViolations(data.violations);
        } catch (err) { console.error("Error loading compliance:", err); }
    };

    const updateComplianceStatus = async (id, status, notes) => {
        try {
            const res = await fetch(`http://localhost:5000/api/gov/compliance/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ status, investigation_notes: notes })
            });
            const data = await res.json();
            if (data.success) {
                alert("Compliance violation status updated!");
                loadCompliance();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const loadIncidents = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/incidents", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setIncidents(data.incidents);
        } catch (err) { console.error("Error loading incidents:", err); }
    };

    const createIncidentReport = async (category, description, severity) => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/incidents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ category, description, severity })
            });
            const data = await res.json();
            if (data.success) {
                alert("Security incident logged in Security Operations Center!");
                loadIncidents();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const updateIncidentStatus = async (id, status, resolution) => {
        try {
            const res = await fetch(`http://localhost:5000/api/gov/incidents/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ status, resolution })
            });
            const data = await res.json();
            if (data.success) {
                alert("Incident status updated!");
                loadIncidents();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const loadRepolls = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/repolls", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setRepolls(data.repolls);
        } catch (err) { console.error("Error loading repolls:", err); }
    };

    const createRepoll = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/gov/repolls", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    election_id: newRepollElectionId,
                    constituency_id: newRepollConstId,
                    polling_station_id: newRepollStationId,
                    reason: newRepollReason,
                    scheduled_date: newRepollDate
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Re-poll scheduled successfully and recorded in audit log.");
                setNewRepollReason("");
                loadRepolls();
                createIncidentReport("RE_POLL", `Re-poll scheduled for election ID ${newRepollElectionId} due to technical disruption.`, "HIGH");
            } else { alert(`Error: ${data.message}`); }
        } catch (err) { alert(err.message); }
    };

    const loadPhases = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/phases", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setPhases(data.phases);
        } catch (err) { console.error("Error loading phases:", err); }
    };

    const createPhase = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/gov/phases", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    election_id: newPhaseElectionId,
                    phase_number: newPhaseNumber,
                    polling_date: newPhaseDate,
                    status: "UPCOMING",
                    constituencies: newPhaseConsts
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Multi-phase scheduled successfully!");
                setNewPhaseConsts("");
                loadPhases();
            } else { alert(`Error: ${data.message}`); }
        } catch (err) { alert(err.message); }
    };

    const loadVersionHistory = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/gov/version-history", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setVersionHistory(data.history);
        } catch (err) { console.error("Error loading version history:", err); }
    };

    const loadAuditReplayTimeline = async (electionId) => {
        if (!electionId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/gov/audit-replay/${electionId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setAuditReplayTimeline(data.timeline);
        } catch (err) { console.error("Error loading audit replay timeline:", err); }
    };

    // Setup fetch endpoints
    const loadConstituencies = async (type = constTypeFilter) => {
        try {
            const res = await fetch(`http://localhost:5000/api/constituencies?type=${type}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setConstituencies(data.constituencies);
        } catch (err) { console.error("Error loading constituencies:", err); }
    };

    const createConstituency = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/constituencies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ 
                    name: newConstName, 
                    code: newConstCode, 
                    level: "PARLIAMENTARY", 
                    constituency_number: newConstNumber,
                    state_id: 1
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Constituency added successfully!");
                setNewConstName("");
                setNewConstCode("");
                loadConstituencies(constTypeFilter);
            } else { alert(`Error: ${data.message}`); }
        } catch (err) { alert(err.message); }
    };

    const loadPollingStations = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/polling-stations", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setPollingStations(data.pollingStations);
        } catch (err) { console.error("Error loading polling stations:", err); }
    };

    const createPollingStation = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/polling-stations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ name: newStationName, code: newStationCode, address: newStationAddress, constituency_id: newStationConstId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Polling station registered!");
                setNewStationName("");
                setNewStationCode("");
                setNewStationAddress("");
                loadPollingStations();
            } else { alert(`Error: ${data.message}`); }
        } catch (err) { alert(err.message); }
    };

    const loadParties = async (silent = false) => {
        try {
            if (!silent) setPartiesLoading(true);
            const res = await fetch("http://localhost:5000/api/parties", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                setParties(Array.isArray(data.parties) ? data.parties : []);
            } else {
                setParties([]);
            }
        } catch (err) {
            console.error("Error loading parties:", err);
            setParties([]);
        } finally {
            if (!silent) setPartiesLoading(false);
        }
    };

    const createParty = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5000/api/parties", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ 
                    name: newPartyName, 
                    abbreviation: newPartyAbbr, 
                    leader: newPartyLeader, 
                    symbol: newPartySymbol, 
                    contact_info: newPartyContact 
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Party registered successfully!");
                setNewPartyName("");
                setNewPartyAbbr("");
                setNewPartyLeader("");
                setNewPartySymbol("");
                setNewPartyContact("");
                loadParties();
            } else { alert(`Error: ${data.message}`); }
        } catch (err) { alert(err.message); }
    };

    const loadVotersList = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/voters", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setVoterList(data.voters);
        } catch (err) { console.error("Error loading voters:", err); }
    };

    const updateVoterRecord = async (id, payload) => {
        try {
            const res = await fetch(`http://localhost:5000/api/voters/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert("Voter record updated!");
                loadVotersList();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const filteredVoters = voterList.filter(v => {
        if (voterStateFilter !== "ALL") {
            const matchesState = (v.address && v.address.toLowerCase().includes(voterStateFilter.toLowerCase())) ||
                                 (v.constituency_name && v.constituency_name.toLowerCase().includes(voterStateFilter.toLowerCase())) ||
                                 (v.state_name && v.state_name.toLowerCase().includes(voterStateFilter.toLowerCase()));
            if (!matchesState) return false;
        }
        if (voterStatusFilter === "VERIFIED" && !v.is_verified) return false;
        if (voterStatusFilter === "PENDING" && v.is_verified) return false;
        if (voterStatusFilter === "ACTIVE" && !v.is_active) return false;
        if (voterStatusFilter === "LOCKED" && v.is_active) return false;
        if (voterSearch.trim()) {
            const q = voterSearch.toLowerCase();
            const matches = (v.name && v.name.toLowerCase().includes(q)) ||
                            (v.email && v.email.toLowerCase().includes(q)) ||
                            (v.voter_id && v.voter_id.toLowerCase().includes(q)) ||
                            (v.phone && v.phone.toLowerCase().includes(q)) ||
                            (v.address && v.address.toLowerCase().includes(q)) ||
                            (v.constituency_name && v.constituency_name.toLowerCase().includes(q)) ||
                            (v.state_name && v.state_name.toLowerCase().includes(q)) ||
                            (v.wallet_address && v.wallet_address.toLowerCase().includes(q));
            if (!matches) return false;
        }
        return true;
    });

    const totalVoterPages = Math.ceil(filteredVoters.length / voterPageSize) || 1;
    const paginatedVoters = filteredVoters.slice((voterPage - 1) * voterPageSize, voterPage * voterPageSize);

    // ============================================================
    // EDIT & DELETE ACTIONS (ADMIN FULL CONTROL CAPABILITIES)
    // ============================================================
    const updateElection = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/elections/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    title: editElectionTitle,
                    description: editElectionDesc,
                    start_time: editElectionStart,
                    end_time: editElectionEnd
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Election details updated!");
                setEditingElectionId(null);
                loadElections();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const deleteElection = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this election? All associated receipts and candidates will be affected.")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/elections/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Election deleted successfully!");
                loadElections();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const updateConstituency = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/constituencies/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name: editConstName,
                    code: editConstCode,
                    level: editConstLevel
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Constituency details updated!");
                setEditingConstId(null);
                loadConstituencies();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const deleteConstituency = async (id) => {
        if (!window.confirm("Are you sure you want to delete this constituency? All referencing polling stations may be affected.")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/constituencies/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Constituency deleted successfully!");
                loadConstituencies();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const updatePollingStation = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/polling-stations/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name: editStationName,
                    code: editStationCode,
                    address: editStationAddress,
                    constituency_id: editStationConstId,
                    capacity: editStationCapacity
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Polling station details updated!");
                setEditingStationId(null);
                loadPollingStations();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const deletePollingStation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this polling booth?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/polling-stations/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Polling station deleted successfully!");
                loadPollingStations();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const updateParty = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/parties/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name: editPartyName,
                    abbreviation: editPartyAbbr,
                    leader: editPartyLeader,
                    symbol: editPartySymbol,
                    contact_info: editPartyContact
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Political party details updated!");
                setEditingPartyId(null);
                loadParties();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const deleteParty = async (id) => {
        if (!window.confirm("Are you sure you want to delete this political party? All referencing candidates will have party association cleared.")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/parties/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Political party deleted successfully!");
                loadParties();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const updateCandidate = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/candidates/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name: editCandidateName,
                    party: editCandidateParty,
                    symbol: editCandidateSymbol,
                    biography: editCandidateBiography
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Candidate profile updated!");
                setEditingCandidateId(null);
                if (selectedElection) loadCandidates(selectedElection.id);
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const deleteCandidate = async (id) => {
        if (!window.confirm("Are you sure you want to delete this candidate?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/candidates/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Candidate deleted successfully!");
                if (selectedElection) loadCandidates(selectedElection.id);
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const updateVoterDetails = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/voters/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    name: editVoterName,
                    email: editVoterEmail,
                    phone: editVoterPhone,
                    address: editVoterAddress,
                    is_verified: editVoterVerified,
                    is_active: editVoterActive
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Voter account updated successfully!");
                setEditingVoterId(null);
                loadVotersList();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const deleteVoter = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this voter account?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/voters/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Voter deleted successfully!");
                loadVotersList();
            } else { alert(data.message); }
        } catch (err) { alert(err.message); }
    };

    const checkDuplicateVoters = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/voters/duplicates", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setDuplicates(data.duplicates);
        } catch (err) { console.error(err); }
    };

    const backupDatabase = async () => {
        setBackupStatus("Generating PostgreSQL database backup file...");
        try {
            const res = await fetch("http://localhost:5000/api/settings/backup", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                setBackupStatus(`Backup completed successfully! Dump file generated at: ${data.path}`);
            } else {
                setBackupStatus(`Backup failed: ${data.message}`);
            }
        } catch (err) { setBackupStatus(`Error: ${err.message}`); }
    };

    const restoreDatabase = async () => {
        if (!confirm("Are you sure you want to restore the database from the last dump? This will overwrite the current database tables!")) return;
        setBackupStatus("Restoring database from file...");
        try {
            const res = await fetch("http://localhost:5000/api/settings/restore", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) {
                setBackupStatus("PostgreSQL Database restored successfully! Reloading data...");
                loadElections();
            } else {
                setBackupStatus(`Restore failed: ${data.message}`);
            }
        } catch (err) { setBackupStatus(`Error: ${err.message}`); }
    };

    // ============================================================
    // CREATE ELECTION
    // ============================================================
    const createElection = async (e) => {
        e.preventDefault();
        if (!newElectionTitle.trim() || !newElectionStart || !newElectionEnd) {
            alert("Title, Start Time, and End Time are required.");
            return;
        }
        try {
            setCreatingElection(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/elections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newElectionTitle,
                    description: newElectionDesc,
                    startTime: newElectionStart,
                    endTime: newElectionEnd
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Election created and deployed on blockchain successfully!");
                setNewElectionTitle("");
                setNewElectionDesc("");
                setNewElectionStart("");
                setNewElectionEnd("");
                loadElections();
            } else {
                alert(`Error: ${data.message || data.error || "Failed to create election"}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setCreatingElection(false);
        }
    };

    // ============================================================
    // LOAD ELECTIONS
    // ============================================================

    const loadElections = async () => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {

                console.error(
                    "Admin token not found."
                );

                setLoading(false);

                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/elections",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                console.error(
                    "Failed to load elections:",
                    data.message
                );

                setElections([]);

                return;
            }

            setElections(
                data.elections || []
            );

        } catch (error) {

            console.error(
                "Failed to load elections:",
                error
            );

            setElections([]);

        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // LOAD CANDIDATES
    // ============================================================

    const loadCandidates = async (electionId) => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Admin authentication token not found."
                );

                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/candidates/election/${electionId}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (response.ok) {

                setCandidates(
                    data.candidates || []
                );

            } else {

                console.error(
                    "Failed to load candidates:",
                    data.message
                );

                setCandidates([]);

            }

        } catch (error) {

            console.error(
                "Candidate loading error:",
                error
            );

            setCandidates([]);

        }

    };


    // ============================================================
    // DEDICATED CANDIDATES SCRUTINY PORTAL HANDLERS
    // ============================================================

    const loadAllCandidates = async (silent = false) => {
        try {
            if (!silent) setCandidateLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await fetch("http://localhost:5000/api/candidates", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.candidates) {
                setAllCandidates(data.candidates);
            }
        } catch (err) {
            console.error("Error loading all candidates:", err);
        } finally {
            if (!silent) setCandidateLoading(false);
        }
    };

    const handleCreateCandidateNomination = async (e) => {
        if (e) e.preventDefault();
        if (!newCandElectionId || !newCandName.trim()) {
            alert("Please select an election and enter candidate name.");
            return;
        }
        try {
            setCandidateSubmitting(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/candidates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    electionId: Number(newCandElectionId),
                    name: newCandName.trim(),
                    party: newCandParty || "Independent",
                    symbol: newCandSymbol || "DEFAULT",
                    manifesto: newCandManifesto || "",
                    education: newCandEducation || "Graduate",
                    totalAssets: newCandAssets || "Disclosed in Form 26",
                    totalLiabilities: newCandLiabilities || "Nil",
                    criminalCasesCount: parseInt(newCandCriminalCases) || 0,
                    affidavitSummary: newCandAffidavit || "Statutory Form 26 affidavit verified by Returning Officer."
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Candidate nomination registered on blockchain ledger successfully.");
                setShowCandidateNominateModal(false);
                setNewCandName("");
                setNewCandParty("");
                setNewCandSymbol("");
                setNewCandManifesto("");
                setNewCandEducation("Graduate");
                setNewCandAssets("");
                setNewCandLiabilities("");
                setNewCandCriminalCases("0");
                setNewCandAffidavit("");
                loadAllCandidates();
            } else {
                alert(data.message || "Failed to submit candidate nomination.");
            }
        } catch (err) {
            console.error("Error submitting candidate nomination:", err);
            alert("Error submitting candidate nomination: " + err.message);
        } finally {
            setCandidateSubmitting(false);
        }
    };

    const handleDeleteCandidateNomination = async (candidateId, candidateName) => {
        if (!window.confirm(`Are you sure you want to withdraw/delete nomination for candidate "${candidateName}"?`)) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/candidates/${candidateId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Candidate nomination successfully removed.");
                loadAllCandidates();
            } else {
                alert(data.message || "Failed to delete candidate.");
            }
        } catch (err) {
            console.error("Error deleting candidate:", err);
            alert("Error deleting candidate: " + err.message);
        }
    };

    // ============================================================
    // DEDICATED VOTER AUTHORIZATION CONSOLE HANDLERS
    // ============================================================

    const loadVoterAuthList = async (eId) => {
        if (!eId) return;
        try {
            setAuthLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await fetch(`http://localhost:5000/api/authorizations/election/${eId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.voters) {
                setAuthVoters(data.voters);
            } else {
                setAuthVoters([]);
            }
        } catch (err) {
            console.error("Error loading voter authorization list:", err);
            setAuthVoters([]);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleAuthorizeSingleVoter = async (voterId, eId) => {
        try {
            setAuthorizingVoterId(voterId);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/authorizations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ voterId, electionId: eId })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAuthVoters(prev => prev.map(v => 
                    v.user_id === voterId ? { ...v, is_authorized: true, authorized_at: new Date().toISOString() } : v
                ));
            } else {
                alert(data.message || "Failed to authorize voter on blockchain.");
            }
        } catch (err) {
            console.error("Error authorizing voter:", err);
            alert("Error authorizing voter on blockchain: " + err.message);
        } finally {
            setAuthorizingVoterId(null);
        }
    };

    const handleBatchAuthorizeVoters = async (eId) => {
        if (!window.confirm("Authorize all pending eligible electors on the blockchain smart contract register?")) return;
        try {
            setBatchAuthLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/authorizations/batch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ electionId: eId })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert(data.message);
                await loadVoterAuthList(eId);
            } else {
                alert(data.message || "Batch authorization failed.");
            }
        } catch (err) {
            console.error("Error in batch authorization:", err);
            alert("Batch authorization error: " + err.message);
        } finally {
            setBatchAuthLoading(false);
        }
    };


    // ============================================================
    // LOAD VOTERS
    // ============================================================

    const loadVoters = async (electionId) => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Admin authentication token not found."
                );

                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/authorizations/election/${electionId}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (response.ok) {

                setVoters(
                    data.voters || []
                );

                setShowVoters(true);

            } else {

                console.error(
                    "Failed to load voters:",
                    data.message
                );

                setVoters([]);

                setShowVoters(true);

            }

        } catch (error) {

            console.error(
                "Failed to load voters:",
                error
            );

            setVoters([]);

        }

    };


    // ============================================================
    // LOAD RESULTS
    // ============================================================

    const loadResults = async (electionId) => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {

                alert(
                    "Admin authentication token not found."
                );

                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/results/election/${electionId}`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to load results"
                );

                return;
            }

            setResults(data);

            setShowResults(true);

            // Hide other management sections

            setShowVoters(false);

            setSelectedElection(null);

            setCandidates([]);

            setVoters([]);

            setTimeout(() => {
                if (resultsRef.current) {
                    resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 100);

        } catch (error) {

            console.error(
                "Results error:",
                error
            );

            alert(
                "Failed to fetch results"
            );

        }

    };


    // ============================================================
    // FETCH HEALTH STATUS, AUDIT LOGS, BLOCKCHAIN DETAILS
    // ============================================================

    const fetchHealth = async (silent = false) => {
        try {
            if (!silent) setHealthLoading(true);
            const response = await fetch("http://localhost:5000/api/health");
            const data = await response.json();
            if (response.ok) {
                setHealthData(data);
            }
        } catch (err) {
            console.error("Health check error:", err);
        } finally {
            if (!silent) setHealthLoading(false);
        }
    };

    const fetchAuditLogs = async (overrideAction, overrideSearch, silent = false) => {
        try {
            if (!silent) setAuditLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;
            const act = overrideAction !== undefined ? overrideAction : auditActionFilter;
            const srch = overrideSearch !== undefined ? overrideSearch : auditSearch;
            let url = "http://localhost:5000/api/auth/audit-logs?limit=300";
            if (act && act !== "ALL") {
                url += `&action=${encodeURIComponent(act)}`;
            }
            if (srch) {
                url += `&search=${encodeURIComponent(srch)}`;
            }
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setAuditLogs(data.logs || []);
            }
        } catch (err) {
            console.error("Audit loading error:", err);
        } finally {
            if (!silent) setAuditLoading(false);
        }
    };

    const fetchReceipts = async (silent = false) => {
        try {
            if (!silent) setReceiptLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await fetch("http://localhost:5000/api/gov/receipts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAllReceipts(data.receipts || []);
            }
        } catch (err) {
            console.error("Receipts loading error:", err);
        } finally {
            if (!silent) setReceiptLoading(false);
        }
    };

    const verifySingleReceipt = async (code) => {
        try {
            const res = await fetch(`http://localhost:5000/api/gov/verify-receipt/${code}`);
            const data = await res.json();
            if (data.success) {
                setReceiptModalData(data.receipt);
            } else {
                alert(data.message || "Failed to verify receipt.");
            }
        } catch (err) {
            alert("Verification error: " + err.message);
        }
    };

    const fetchBlockchainInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            
            // 1. Get status details
            const statusRes = await fetch("http://localhost:5000/api/blockchain/status", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const statusData = await statusRes.json();
            if (statusRes.ok && statusData.success) {
                setBlockchainStatus(statusData.blockchain);
            }

            // 2. Get transaction history list
            const txRes = await fetch("http://localhost:5000/api/blockchain/transactions", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const txData = await txRes.json();
            if (txRes.ok && txData.success) {
                setRecentTransactions(txData.transactions || []);
            }
        } catch (err) {
            console.error("Blockchain info loading error:", err);
        }
    };

    const loadReconciliation = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/settings/reconciliation", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReconciliation(data.reports);
            }
        } catch (err) {
            console.error("Reconciliation error:", err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadElections();
        fetchHealth();
        fetchAuditLogs();
        fetchBlockchainInfo();
    }, []);

    useEffect(() => {
        if (activeTab === "health" || activeTab === "dashboard") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchHealth();
        }
        if (activeTab === "audit" || activeTab === "dashboard") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchAuditLogs();
            fetchReceipts();
        }
        if (activeTab === "blockchain" || activeTab === "dashboard") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchBlockchainInfo();
        }
        if (activeTab === "constituencies") {
            loadConstituencies();
        }
        if (activeTab === "polling_stations") {
            loadPollingStations();
            loadConstituencies();
        }
        if (activeTab === "candidates") {
            loadAllCandidates();
            loadParties();
            loadElections();
        }
        if (activeTab === "parties" || activeTab === "elections") {
            loadParties();
            loadElections();
        }
        if (activeTab === "voter_authorization") {
            loadElections();
        }
        if (activeTab === "voters") {
            loadVotersList();
            checkDuplicateVoters();
            loadConstituencies();
            loadPollingStations();
        }
        if (activeTab === "voter_services") {
            loadVoterServices();
        }
        if (activeTab === "results" || activeTab === "reports") {
            loadReconciliation();
        }
        if (activeTab === "officers") {
            loadOfficers();
            loadConstituencies();
        }
        if (activeTab === "phases") {
            loadPhases();
            loadElections();
            loadConstituencies();
        }
        if (activeTab === "repolls") {
            loadRepolls();
            loadElections();
            loadConstituencies();
            loadPollingStations();
        }
        if (activeTab === "grievances") {
            loadGrievances();
            loadConstituencies();
            loadOfficers();
        }
        if (activeTab === "compliance") {
            loadCompliance();
        }
        if (activeTab === "incidents") {
            loadIncidents();
            loadOfficers();
        }
        if (activeTab === "version_history") {
            loadVersionHistory();
        }
        if (activeTab === "audit_replay") {
            loadElections();
        }
        if (activeTab === "calendar") {
            loadElections();
            loadPhases();
        }
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem("adminActiveTab", activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "voter_authorization") {
            if (authElectionId) {
                loadVoterAuthList(authElectionId);
            } else if (elections && elections.length > 0) {
                setAuthElectionId(elections[0].id);
                loadVoterAuthList(elections[0].id);
            }
        }
    }, [activeTab, authElectionId, elections]);

    const isPollingRef = useRef(false);

    // Background polling interval to keep active tab's tables smoothly synchronized in the background without blinking
    useEffect(() => {
        const interval = setInterval(async () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
            if (isPollingRef.current) return;
            isPollingRef.current = true;
            try {
                if (activeTab === "health" || activeTab === "dashboard") {
                    await fetchHealth(true);
                }
                if (activeTab === "audit" || activeTab === "dashboard") {
                    await fetchAuditLogs(undefined, undefined, true);
                }
                if (activeTab === "blockchain" || activeTab === "dashboard") {
                    await fetchBlockchainInfo();
                }
                if (activeTab === "constituencies") {
                    await loadConstituencies();
                }
                if (activeTab === "polling_stations") {
                    await loadPollingStations();
                }
                if (activeTab === "parties" || activeTab === "elections" || activeTab === "candidates") {
                    await loadParties(true);
                    await loadElections();
                    if (activeTab === "candidates") {
                        await loadAllCandidates(true);
                    }
                }
                if (activeTab === "voters" || activeTab === "voter_authorization") {
                    await loadVotersList();
                }
                if (activeTab === "voter_services") {
                    await loadVoterServices(true);
                }
                if (activeTab === "officers") {
                    await loadOfficers();
                }
                if (activeTab === "phases") {
                    await loadPhases();
                }
                if (activeTab === "repolls") {
                    await loadRepolls();
                }
                if (activeTab === "grievances") {
                    await loadGrievances();
                }
                if (activeTab === "compliance") {
                    await loadCompliance();
                }
                if (activeTab === "incidents") {
                    await loadIncidents();
                }
            } catch (err) {
                // Background poll non-blocking
            } finally {
                isPollingRef.current = false;
            }
        }, 12000); // Poll database lists smoothly every 12 seconds in silent background mode
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "ref_data") {
            loadRefData();
        }
    }, [activeTab, refSubTab, refSearch, refFilter, refSort, selectedRefElectionId]);

    // ============================================================
    // DATABASE MANAGEMENT & EXPLORER HANDLERS
    // ============================================================
    const loadDatabaseOverview = async () => {
        try {
            setDbLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/database/overview", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDbOverview(data);
                if (data.tables && data.tables.length > 0 && !selectedTable) {
                    setSelectedTable(data.tables[0].table_name);
                }
            }
        } catch (err) {
            console.error("Database overview error:", err);
        } finally {
            setDbLoading(false);
        }
    };

    const loadTableData = async (tName = selectedTable, page = tablePage, limit = tableLimit, search = tableSearch, sortBy = tableSortBy, sortDir = tableSortDir) => {
        if (!tName) return;
        try {
            setTableLoading(true);
            const token = localStorage.getItem("token");
            const q = new URLSearchParams({
                page,
                limit,
                search,
                sortBy,
                sortDir
            });
            const res = await fetch(`http://localhost:5000/api/database/table/${tName}?${q.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTableData(data);
            }
        } catch (err) {
            console.error("Table data error:", err);
        } finally {
            setTableLoading(false);
        }
    };

    const handleExportTableCsv = () => {
        if (!tableData || !tableData.rows || tableData.rows.length === 0) {
            alert("No table records available to export.");
            return;
        }
        const cols = tableData.columns.map(c => c.column_name);
        const csvRows = [cols.join(",")];
        tableData.rows.forEach(r => {
            const rowValues = cols.map(c => {
                const val = r[c];
                if (val === null || val === undefined) return '""';
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            });
            csvRows.push(rowValues.join(","));
        });
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${selectedTable}_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleTriggerDbBackup = async () => {
        try {
            setDbBackupMsg("Initiating automated database snapshot...");
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/settings/backup", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDbBackupMsg(`Backup successfully generated: ${data.path}`);
                alert(`Database backup successfully created!\nArchive: ${data.path}`);
            } else {
                setDbBackupMsg(`Backup failed: ${data.message}`);
                alert(`Backup failed: ${data.message}`);
            }
        } catch (err) {
            setDbBackupMsg(`Backup error: ${err.message}`);
            alert(`Error triggering backup: ${err.message}`);
        }
    };

    useEffect(() => {
        if (activeTab === "database" || activeTab === "backup") {
            loadDatabaseOverview();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "database" || activeTab === "backup") {
            loadTableData(selectedTable, tablePage, tableLimit, tableSearch, tableSortBy, tableSortDir);
        }
    }, [activeTab, selectedTable, tablePage, tableLimit, tableSearch, tableSortBy, tableSortDir]);

    const triggerAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            setAnalyticsOutput("Initializing Python Analytics Engine process...\n");
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/settings/analytics", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAnalyticsOutput(data.output || "Python analytics completed successfully.");
            } else {
                setAnalyticsOutput("Error: " + data.message);
            }
        } catch (err) {
            setAnalyticsOutput("Failed to invoke Python script: " + err.message);
        } finally {
            setAnalyticsLoading(false);
        }
    };


    // ============================================================
    // LOADING SCREEN
    // ============================================================

    if (loading) {

        return (

            <div className="admin-page">

                <h2>
                    Loading Admin Dashboard...
                </h2>

            </div>

        );

    }


    // ============================================================
    // ADMIN DASHBOARD
    // ============================================================

    return (
        <div className="admin-container">
            {/* SIDEBAR NAVIGATION */}
            <aside className="admin-sidebar" style={{ overflowY: "auto", maxHeight: "100vh" }}>
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #1e3a8a", marginBottom: "15px", background: "rgba(15, 41, 74, 0.85)" }}>
                    <ECIEmblem size={36} />
                    <div>
                        <h2 style={{ fontSize: "11.5px", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "0.4px", lineHeight: "1.2" }}>भारत निर्वाचन आयोग</h2>
                        <div style={{ fontSize: "9.5px", fontWeight: "700", color: "#cbd5e1", letterSpacing: "0.5px", textTransform: "uppercase" }}>ELECTION COMMISSION OF INDIA</div>
                        <span style={{ fontSize: "8.5px", color: "#38bdf8", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginTop: "2px", fontWeight: "600" }}>Admin Console • SDEMS</span>
                    </div>
                </div>
                <div style={{ padding: "0 14px 10px" }}>
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={sidebarSearch}
                        onChange={(e) => setSidebarSearch(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "7px 10px",
                            fontSize: "11px",
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "6px",
                            color: "#f8fafc",
                            outline: "none",
                            boxSizing: "border-box"
                        }}
                    />
                </div>

                {[
                    {
                        category: "Core Operations",
                        items: [
                            { id: "dashboard", label: "Dashboard", onClick: () => { setActiveTab("dashboard"); setSelectedElection(null); setShowVoters(false); setShowResults(false); } },
                            { id: "atlas", label: "Electoral Atlas & India Map", onClick: () => { setActiveTab("atlas"); setSelectedElection(null); setShowVoters(false); setShowResults(false); } },
                            { id: "elections", label: "Elections", onClick: () => { setActiveTab("elections"); setSelectedElection(null); setShowVoters(false); setShowResults(false); } },
                            { id: "parties", label: "Political Parties", onClick: () => { setActiveTab("parties"); setSelectedElection(null); loadParties(); } },
                            { id: "candidates", label: "Candidates", onClick: () => { setActiveTab("candidates"); setSelectedElection(null); loadAllCandidates(); loadParties(); loadElections(); } },
                            { id: "results", label: "Results & Tallies", onClick: () => { setActiveTab("results"); setSelectedElection(null); setShowResults(false); } }
                        ]
                    },
                    {
                        category: "Electoral Geography",
                        items: [
                            { id: "constituencies", label: "Constituencies", onClick: () => { setActiveTab("constituencies"); setSelectedElection(null); } },
                            { id: "polling_stations", label: "Polling Stations", onClick: () => { setActiveTab("polling_stations"); setSelectedElection(null); } },
                            { id: "ref_data", label: "Official Reference Data", onClick: () => { setActiveTab("ref_data"); setSelectedElection(null); } },
                            { id: "phases", label: "Multi-Phase Schedules", onClick: () => { setActiveTab("phases"); setSelectedElection(null); } },
                            { id: "repolls", label: "Re-Poll Support", onClick: () => { setActiveTab("repolls"); setSelectedElection(null); } }
                        ]
                    },
                    {
                        category: "Electorate & Roll",
                        items: [
                            { id: "voters", label: "National Electoral Roll", onClick: () => { setActiveTab("voters"); setSelectedElection(null); } },
                            { id: "voter_services", label: "Electoral Services & Form 8", onClick: () => { setActiveTab("voter_services"); setSelectedElection(null); loadVoterServices(); } },
                            { id: "voter_authorization", label: "Voter Authorization", onClick: () => { setActiveTab("voter_authorization"); setSelectedElection(null); loadElections(); } }
                        ]
                    },
                    {
                        category: "Governance & Compliance",
                        items: [
                            { id: "officers", label: "Election Officers", onClick: () => { setActiveTab("officers"); setSelectedElection(null); } },
                            { id: "compliance", label: "Compliance Center (cVIGIL)", onClick: () => { setActiveTab("compliance"); setSelectedElection(null); } },
                            { id: "grievances", label: "Grievance Portal (NGRS)", onClick: () => { setActiveTab("grievances"); setSelectedElection(null); } },
                            { id: "calendar", label: "Election Calendar", onClick: () => { setActiveTab("calendar"); setSelectedElection(null); } }
                        ]
                    },
                    {
                        category: "Security & Auditing",
                        items: [
                            { id: "blockchain", label: "Blockchain Monitor", onClick: () => { setActiveTab("blockchain"); setSelectedElection(null); setShowVoters(false); setShowResults(false); } },
                            { id: "audit", label: "Audit Logs", onClick: () => { setActiveTab("audit"); setSelectedElection(null); setShowVoters(false); setShowResults(false); } },
                            { id: "incidents", label: "Incident Log (SOC)", onClick: () => { setActiveTab("incidents"); setSelectedElection(null); } },
                            { id: "version_history", label: "Version History", onClick: () => { setActiveTab("version_history"); setSelectedElection(null); } },
                            { id: "audit_replay", label: "Audit Replay Timeline", onClick: () => { setActiveTab("audit_replay"); setSelectedElection(null); } },
                            { id: "analytics", label: "Analytics Engine", onClick: () => { setActiveTab("analytics"); setSelectedElection(null); } },
                            { id: "reports", label: "Reports & Certificates", onClick: () => { setActiveTab("reports"); setSelectedElection(null); } }
                        ]
                    },
                    {
                        category: "System Maintenance",
                        items: [
                            { id: "archive", label: "Election Archive", onClick: () => { setActiveTab("archive"); setSelectedElection(null); } },
                            { id: "database", label: "Database Management", onClick: () => { setActiveTab("database"); setSelectedElection(null); loadDatabaseOverview(); } },
                            { id: "health", label: "System Diagnostics", onClick: () => { setActiveTab("health"); setSelectedElection(null); setShowVoters(false); setShowResults(false); } },
                            { id: "settings", label: "System Settings", onClick: () => { setActiveTab("settings"); setSelectedElection(null); } }
                        ]
                    }
                ].map((sec) => {
                    const filteredItems = sec.items.filter(it => 
                        !sidebarSearch.trim() || 
                        it.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                        sec.category.toLowerCase().includes(sidebarSearch.toLowerCase())
                    );
                    if (filteredItems.length === 0) return null;
                    return (
                        <div key={sec.category} style={{ marginBottom: "10px" }}>
                            <div style={{
                                fontSize: "9.5px",
                                fontWeight: "800",
                                letterSpacing: "0.8px",
                                color: "#94a3b8",
                                padding: "4px 14px",
                                textTransform: "uppercase"
                            }}>
                                {sec.category}
                            </div>
                            {filteredItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`sidebar-nav-btn ${activeTab === item.id ? "active" : ""}`}
                                    onClick={item.onClick}
                                    style={{
                                        margin: "2px 0",
                                        width: "100%",
                                        textAlign: "left",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "7px 14px",
                                        borderRadius: "6px",
                                        border: activeTab === item.id ? "1px solid #3b82f6" : "1px solid transparent",
                                        background: activeTab === item.id ? "rgba(30, 58, 138, 0.7)" : "transparent",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    <span style={{
                                        fontWeight: activeTab === item.id ? "700" : "500",
                                        fontSize: "12.5px",
                                        color: activeTab === item.id ? "#ffffff" : "#e2e8f0"
                                    }}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    );
                })}
                <button 
                    className="sidebar-nav-btn"
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.reload();
                    }}
                    style={{ color: "#ef4444", borderTop: "1px solid #334155", marginTop: "10px", paddingTop: "15px" }}
                >
                    Logout
                </button>

            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="admin-main-content">
                
                {/* 1. DASHBOARD OVERVIEW */}
                {activeTab === "dashboard" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", color: "#ea580c", textTransform: "uppercase" }}>भारत निर्वाचन आयोग • Election Commission of India</span>
                                <h1>Electoral Operations & Administrative Overview</h1>
                                <p>Official Government Command Console for Secure Decentralized Electoral Management & Audit Monitoring.</p>
                            </div>
                        </div>

                        {/* STATS CARDS */}
                        <div className="admin-stats" style={{ margin: "25px 0" }}>
                            <div className="admin-stat">
                                <span>Total Elections</span>
                                <strong>{elections.length}</strong>
                            </div>
                            <div className="admin-stat">
                                <span>Active Elections</span>
                                <strong>{elections.filter(e => e.status === "ACTIVE").length}</strong>
                            </div>
                            <div className="admin-stat">
                                <span>Authorized Voters</span>
                                <strong>{auditLogs.filter(log => log.action === "VOTER_AUTHORIZED").length || 1}</strong>
                            </div>
                        </div>

                        {/* HEALTH WIDGET */}
                        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", margin: "20px 0" }}>
                            <h3 style={{ margin: "0 0 15px", fontSize: "16px", color: "#1e293b" }}>System Status & Service Health</h3>
                            {healthData ? (
                                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "6px 12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                        Backend API: <span className="health-badge online">ONLINE</span>
                                    </span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "6px 12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                        Database: <span className={`health-badge ${healthData.services?.database?.status === "ONLINE" ? "online" : "offline"}`}>{healthData.services?.database?.status}</span>
                                    </span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "6px 12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                        Blockchain: <span className={`health-badge ${healthData.services?.blockchain?.status === "ONLINE" ? "online" : "offline"}`}>{healthData.services?.blockchain?.status}</span>
                                    </span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "6px 12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                        Solidity Contract: <span className={`health-badge ${healthData.services?.contract?.status === "VERIFIED" ? "verified" : "offline"}`}>{healthData.services?.contract?.status}</span>
                                    </span>
                                </div>
                            ) : (
                                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Checking system nodes...</p>
                            )}
                        </div>

                        {/* NATIONAL ELECTORAL ATLAS PREVIEW WIDGET */}
                        <div style={{ margin: "25px 0" }}>
                            <IndiaElectionMap 
                                onSelectElection={(elecId) => {
                                    const el = elections.find(e => e.id === elecId);
                                    if (el) {
                                        setSelectedElection(el);
                                        setActiveTab("elections");
                                    }
                                }}
                            />
                        </div>

                        {/* RECENT AUDIT LOGS */}
                        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ margin: "0 0 15px", fontSize: "16px", color: "#1e293b" }}>Recent Admin Audit Logs</h3>
                            {auditLogs.length > 0 ? (
                                <div style={{ overflowX: "auto" }}>
                                    <table className="audit-table" style={{ margin: 0, boxShadow: "none", border: "none" }}>
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>Details</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.slice(0, 5).map(log => (
                                                <tr key={log.id}>
                                                    <td><strong>{log.action}</strong></td>
                                                    <td>{log.description}</td>
                                                    <td>{format12HourDateTime(log.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>No audit trails recorded yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ELECTORAL ATLAS & INDIA MAP TAB */}
                {activeTab === "atlas" && (
                    <div className="admin-page">
                        <IndiaElectionMap 
                            onSelectElection={(elecId) => {
                                const el = elections.find(e => e.id === elecId);
                                if (el) {
                                    setSelectedElection(el);
                                    setActiveTab("elections");
                                }
                            }}
                        />
                    </div>
                )}

                {/* 2. ELECTIONS & CANDIDATES VIEW */}
                {activeTab === "elections" && (
                    <div className="admin-page">


            {/* ====================================================
                ADMIN HEADER
            ==================================================== */}

            <div className="admin-header">

                <div>

                    <span>
                        ADMIN PANEL
                    </span>

                    <h1>
                        Election Management
                    </h1>

                    <p>
                        Manage elections,
                        candidates and voting activity.
                    </p>

                </div>

            </div>


            {/* ====================================================
                ADMIN STATISTICS
            ==================================================== */}

            <div className="admin-stats">

                {/* TOTAL ELECTIONS */}

                <div className="admin-stat">

                    <span>
                        Total Elections
                    </span>

                    <strong>
                        {elections.length}
                    </strong>

                </div>


                {/* ACTIVE ELECTIONS */}

                <div className="admin-stat">

                    <span>
                        Active Elections
                    </span>

                    <strong>

                        {
                            elections.filter(
                                election =>
                                    election.status ===
                                    "ACTIVE"
                            ).length
                        }

                    </strong>

                </div>


                {/* COMPLETED ELECTIONS */}

                <div className="admin-stat">

                    <span>
                        Completed
                    </span>

                    <strong>

                        {
                            elections.filter(
                                election =>
                                    election.status ===
                                    "COMPLETED" ||
                                    election.status ===
                                    "RESULTS_PUBLISHED"
                            ).length
                        }

                    </strong>

                </div>

            </div>


            {/* ====================================================
                ELEVATED STATUTORY RESULTS DECLARATION
                Positioned at the top for instant visibility
            ==================================================== */}
            {showResults && results && (
                <div 
                    ref={resultsRef} 
                    style={{ 
                        background: "#ffffff", 
                        border: "2px solid #2563eb", 
                        borderRadius: "12px", 
                        padding: "24px 28px", 
                        marginBottom: "30px", 
                        boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.15)",
                        borderLeft: "6px solid #2563eb"
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
                        <div>
                            <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.8px", color: "#2563eb", textTransform: "uppercase" }}>
                                OFFICIAL STATUTORY RESULTS DECLARATION
                            </span>
                            <h2 style={{ fontSize: "22px", margin: "4px 0 2px", color: "#0f172a" }}>
                                {results.election?.title || "Election Results"}
                            </h2>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                                Blockchain Election ID: <strong>#{results.election?.blockchain_election_id || "1"}</strong> • Status: <span style={{ color: "#16a34a", fontWeight: "700" }}>RESULTS PUBLISHED & VERIFIED</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setShowResults(false); setResults(null); }}
                            style={{ 
                                background: "#f1f5f9", 
                                border: "1px solid #cbd5e1", 
                                borderRadius: "6px", 
                                padding: "8px 16px", 
                                fontSize: "12.5px", 
                                fontWeight: "600", 
                                color: "#334155", 
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                            }}
                        >
                            Close Results View
                        </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
                        <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Total Recorded Votes</span>
                            <h3 style={{ fontSize: "26px", margin: "4px 0 0", color: "#1e3a8a" }}>{results.databaseResults?.totalVotes ?? 0}</h3>
                        </div>
                        <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Contesting Candidates</span>
                            <h3 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0284c7" }}>{results.databaseResults?.candidates?.length ?? 0}</h3>
                        </div>
                        <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Ledger Integrity Status</span>
                            <h3 style={{ fontSize: "20px", margin: "8px 0 0", color: results.blockchainVerified ? "#16a34a" : "#1e3a8a", fontWeight: "800" }}>
                                {results.blockchainVerified ? "BLOCKCHAIN VERIFIED" : "IMMUTABLY RECORDED"}
                            </h3>
                        </div>
                    </div>

                    {/* Winner Banner */}
                    {results.databaseResults?.candidates?.length > 0 && (
                        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ background: "#16a34a", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px" }}>WINNER</span>
                                <div>
                                    <strong style={{ fontSize: "16px", color: "#14532d" }}>{results.databaseResults.candidates[0].name}</strong>
                                    <div style={{ fontSize: "12px", color: "#166534" }}>Political Party: <strong>{results.databaseResults.candidates[0].party || "Independent"}</strong></div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "22px", fontWeight: "800", color: "#14532d" }}>{results.databaseResults.candidates[0].votes}</span>
                                <span style={{ fontSize: "12px", color: "#166534", marginLeft: "4px" }}>
                                    votes ({results.databaseResults.totalVotes > 0 ? ((results.databaseResults.candidates[0].votes / results.databaseResults.totalVotes) * 100).toFixed(1) : 0}%)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Candidate Vote Tallies */}
                    <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
                        Candidate Vote Tallies
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "25px" }}>
                        {results.databaseResults?.candidates?.length > 0 ? (
                            results.databaseResults.candidates.map((candidate, idx) => {
                                const total = results.databaseResults?.totalVotes || 0;
                                const pct = total > 0 ? ((candidate.votes / total) * 100).toFixed(1) : 0;
                                return (
                                    <div key={candidate.id || idx} style={{ background: "#f8fafc", padding: "14px 18px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                            <div>
                                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{candidate.name}</strong>
                                                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "10px" }}>{candidate.party || "Independent"}</span>
                                            </div>
                                            <strong style={{ fontSize: "14px", color: "#1e3a8a" }}>{candidate.votes} votes ({pct}%)</strong>
                                        </div>
                                        <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                                            <div style={{ width: `${pct}%`, height: "100%", background: idx === 0 ? "#16a34a" : "#2563eb", borderRadius: "4px", transition: "width 0.4s ease" }} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ color: "#64748b", fontSize: "13px" }}>No candidate tallies recorded for this election.</p>
                        )}
                    </div>

                    {/* Blockchain Hash Card */}
                    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "14px 18px", fontSize: "12px", color: "#0369a1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <strong>Decentralized Smart Contract Ledger:</strong> Verified on Hardhat Node
                            <div style={{ fontFamily: "monospace", fontSize: "11px", marginTop: "3px" }}>
                                Contract: {results.election?.contract_address || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"}
                            </div>
                        </div>
                        <span style={{ padding: "4px 8px", background: "#e0f2fe", borderRadius: "4px", fontWeight: "700", fontSize: "11px" }}>
                            SECTION 128 RPA 1951 COMPLIANT
                        </span>
                    </div>
                </div>
            )}

            {/* ====================================================
                ELECTION MANAGEMENT
            ==================================================== */}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", alignItems: "start" }}>
                <div className="admin-elections">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                        <h2 style={{ margin: 0 }}>Your Elections</h2>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                            Showing {elections.filter(e => {
                                const matchesStatus = electionStatusFilter === "ALL" || 
                                    (electionStatusFilter === "RESULTS_PUBLISHED" ? (e.status === "RESULTS_PUBLISHED" || e.status === "COMPLETED") : e.status === electionStatusFilter);
                                const q = electionSearchFilter.trim().toLowerCase();
                                return matchesStatus && (!q || (e.title && e.title.toLowerCase().includes(q)) || String(e.id).includes(q));
                            }).length} of {elections.length} Total
                        </div>
                    </div>

                    {/* ELECTION FILTER & SEARCH TOOLBAR */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", justifyContent: "space-between", background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {[
                                { id: "ALL", label: `All (${elections.length})` },
                                { id: "ACTIVE", label: `Active (${elections.filter(e => e.status === "ACTIVE").length})` },
                                { id: "UPCOMING", label: `Upcoming (${elections.filter(e => e.status === "UPCOMING").length})` },
                                { id: "RESULTS_PUBLISHED", label: `Published (${elections.filter(e => e.status === "RESULTS_PUBLISHED" || e.status === "COMPLETED").length})` },
                                { id: "ENDED", label: `Ended (${elections.filter(e => e.status === "ENDED").length})` },
                                { id: "DRAFT", label: `Draft (${elections.filter(e => e.status === "DRAFT").length})` }
                            ].map(flt => (
                                <button
                                    key={flt.id}
                                    onClick={() => setElectionStatusFilter(flt.id)}
                                    style={{
                                        padding: "5px 11px",
                                        borderRadius: "6px",
                                        fontSize: "11.5px",
                                        fontWeight: electionStatusFilter === flt.id ? "700" : "500",
                                        background: electionStatusFilter === flt.id ? "#1e3a8a" : "#ffffff",
                                        color: electionStatusFilter === flt.id ? "#ffffff" : "#475569",
                                        border: electionStatusFilter === flt.id ? "1px solid #1e3a8a" : "1px solid #cbd5e1",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    {flt.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ minWidth: "220px", flex: "1 1 200px" }}>
                            <input
                                type="text"
                                placeholder="Search elections by title or ID..."
                                value={electionSearchFilter}
                                onChange={e => setElectionSearchFilter(e.target.value)}
                                style={{ width: "100%", padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", background: "white", boxSizing: "border-box" }}
                            />
                        </div>
                    </div>


                {(() => {
                    const displayedElections = elections.filter(e => {
                        const matchesStatus = electionStatusFilter === "ALL" || 
                            (electionStatusFilter === "RESULTS_PUBLISHED" ? (e.status === "RESULTS_PUBLISHED" || e.status === "COMPLETED") : e.status === electionStatusFilter);
                        const q = electionSearchFilter.trim().toLowerCase();
                        const matchesSearch = !q || (e.title && e.title.toLowerCase().includes(q)) || String(e.id).includes(q);
                        return matchesStatus && matchesSearch;
                    });

                    if (displayedElections.length === 0) {
                        return (
                            <div style={{ padding: "30px", textAlign: "center", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
                                <p style={{ margin: "0 0 10px" }}>No elections found matching the selected filter criteria.</p>
                                <button 
                                    className="secondary-btn-sm" 
                                    onClick={() => { setElectionStatusFilter("ALL"); setElectionSearchFilter(""); }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        );
                    }

                    return displayedElections.map(election => (

                        <div
                            className="admin-election"
                            key={election.id}
                        >


                            {/* =================================================
                                ELECTION INFORMATION
                            ================================================= */}

                            {editingElectionId === election.id ? (
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <input 
                                        type="text" 
                                        value={editElectionTitle} 
                                        onChange={e => setEditElectionTitle(e.target.value)} 
                                        style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                    />
                                    <textarea 
                                        value={editElectionDesc} 
                                        onChange={e => setEditElectionDesc(e.target.value)} 
                                        style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", minHeight: "60px", fontFamily: "inherit" }}
                                    />
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <input 
                                            type="datetime-local" 
                                            value={editElectionStart} 
                                            onChange={e => setEditElectionStart(e.target.value)} 
                                            style={{ padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: 1 }}
                                        />
                                        <input 
                                            type="datetime-local" 
                                            value={editElectionEnd} 
                                            onChange={e => setEditElectionEnd(e.target.value)} 
                                            style={{ padding: "6px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: 1 }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button onClick={() => updateElection(election.id)} className="primary-btn" style={{ background: "#22c55e", padding: "6px 12px", width: "auto" }}>Save</button>
                                        <button onClick={() => setEditingElectionId(null)} className="primary-btn" style={{ background: "#64748b", padding: "6px 12px", width: "auto" }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3>{election.title}</h3>
                                    <p>{election.description}</p>
                                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "11.5px", color: "#475569", marginTop: "5px" }}>
                                        <span><strong>Starts:</strong> {format12HourDateTime(election.start_time)}</span>
                                        <span><strong>Ends:</strong> {format12HourDateTime(election.end_time)}</span>
                                        <span><strong>Chain ID:</strong> {election.blockchain_election_id || "Pending"}</span>
                                    </div>
                                </div>
                            )}


                            {/* =================================================
                                ELECTION CONTROLS
                            ================================================= */}

                            <div className="admin-election-right">


                                {/* STATUS */}

                                <span
                                    className={
                                        `status ${election.status
                                            ?.toLowerCase()}`
                                    }
                                >
                                    {election.status}
                                </span>


                                {/* =================================================
                                    START ELECTION
                                ================================================= */}

                                {(election.status === "DRAFT" || election.status === "UPCOMING") && (

                                    <button
                                        onClick={async () => {

                                            if (
                                                !window.confirm(
                                                    "Start this election?"
                                                )
                                            ) {

                                                return;

                                            }

                                            try {

                                                const token =
                                                    localStorage.getItem(
                                                        "token"
                                                    );

                                                if (!token) {

                                                    alert(
                                                        "Admin authentication token not found."
                                                    );

                                                    return;

                                                }

                                                const response =
                                                    await fetch(
                                                        `http://localhost:5000/api/elections/${election.id}/start`,
                                                        {
                                                            method: "PATCH",

                                                            headers: {
                                                                Authorization:
                                                                    `Bearer ${token}`
                                                            }
                                                        }
                                                    );

                                                const data =
                                                    await response.json();

                                                if (!response.ok) {

                                                    alert(
                                                        data.message ||
                                                        "Failed to start election"
                                                    );

                                                    return;
                                                }

                                                alert(
                                                    "Election started successfully!"
                                                );

                                                await loadElections();

                                            } catch (error) {

                                                console.error(
                                                    "Start election error:",
                                                    error
                                                );

                                                alert(
                                                    "Failed to connect to backend."
                                                );

                                            }

                                        }}
                                    >
                                        Start Election
                                    </button>

                                )}


                                {/* =================================================
                                    END ELECTION
                                ================================================= */}

                                {election.status === "ACTIVE" && (

                                    <button
                                        onClick={async () => {

                                            if (
                                                !window.confirm(
                                                    "End this election?"
                                                )
                                            ) {

                                                return;

                                            }

                                            try {

                                                const token =
                                                    localStorage.getItem(
                                                        "token"
                                                    );

                                                if (!token) {

                                                    alert(
                                                        "Admin authentication token not found."
                                                    );

                                                    return;

                                                }

                                                const response =
                                                    await fetch(
                                                        `http://localhost:5000/api/elections/${election.id}/end`,
                                                        {
                                                            method: "PATCH",

                                                            headers: {
                                                                Authorization:
                                                                    `Bearer ${token}`
                                                            }
                                                        }
                                                    );

                                                const data =
                                                    await response.json();

                                                if (!response.ok) {

                                                    alert(
                                                        data.message ||
                                                        "Failed to end election"
                                                    );

                                                    return;
                                                }

                                                alert(
                                                    "Election ended successfully!"
                                                );

                                                await loadElections();

                                            } catch (error) {

                                                console.error(
                                                    "End election error:",
                                                    error
                                                );

                                                alert(
                                                    "Failed to connect to backend."
                                                );

                                            }

                                        }}
                                    >
                                        End Election
                                    </button>

                                )}


                                {/* =================================================
                                    CALCULATE & PUBLISH RESULTS
                                ================================================= */}

                                {election.status === "ENDED" && (

                                    <button
                                        onClick={async () => {

                                            if (
                                                !window.confirm(
                                                    "Calculate results and publish them on blockchain?"
                                                )
                                            ) {

                                                return;

                                            }

                                            try {

                                                const token =
                                                    localStorage.getItem(
                                                        "token"
                                                    );

                                                if (!token) {

                                                    alert(
                                                        "Admin authentication token not found."
                                                    );

                                                    return;

                                                }

                                                const response =
                                                    await fetch(
                                                        `http://localhost:5000/api/elections/${election.id}/publish-results`,
                                                        {
                                                            method: "PATCH",

                                                            headers: {
                                                                Authorization:
                                                                    `Bearer ${token}`
                                                            }
                                                        }
                                                    );

                                                const data =
                                                    await response.json();

                                                if (!response.ok) {

                                                    alert(
                                                        data.message ||
                                                        "Failed to publish results"
                                                    );

                                                    return;

                                                }

                                                alert(
                                                    "Results published on-chain successfully!"
                                                );

                                                await loadElections();
                                                await loadResults(election.id);

                                            } catch (error) {

                                                console.error(
                                                    "Publish results error:",
                                                    error
                                                );

                                                alert(
                                                    "Failed to connect to backend."
                                                );

                                            }

                                        }}
                                    >
                                        Publish Results
                                    </button>

                                )}


                                {/* =================================================
                                    VIEW RESULTS
                                ================================================= */}

                                {election.status ===
                                    "RESULTS_PUBLISHED" && (

                                    <button
                                        onClick={() =>
                                            loadResults(
                                                election.id
                                            )
                                        }
                                    >
                                        View Results
                                    </button>

                                )}


                                {/* =================================================
                                    MANAGE CANDIDATES
                                ================================================= */}

                                {(election.status === "DRAFT" || election.status === "UPCOMING") && (
                                    <button
                                        onClick={() => {
                                            setSelectedElection(election);
                                            setShowVoters(false);
                                            setShowResults(false);
                                            loadCandidates(election.id);
                                        }}
                                        style={{ background: "#0284c7", color: "white" }}
                                    >
                                        Candidates
                                    </button>
                                )}


                                {/* =================================================
                                    MANAGE VOTERS
                                ================================================= */}

                                <button
                                    onClick={() => {
                                        setSelectedElection(election);
                                        setShowVoters(true);
                                        setShowResults(false);
                                        loadVoters(election.id);
                                    }}
                                    style={{ background: "#475569", color: "white" }}
                                >
                                    Manage Voters
                                </button>

                                <button
                                    onClick={() => {
                                        setEditingElectionId(election.id);
                                        setEditElectionTitle(election.title || "");
                                        setEditElectionDesc(election.description || "");
                                        setEditElectionStart(election.start_time ? election.start_time.substring(0, 16) : "");
                                        setEditElectionEnd(election.end_time ? election.end_time.substring(0, 16) : "");
                                    }}
                                    style={{ background: "#1e3a8a", color: "white" }}
                                >
                                    Edit Details
                                </button>

                                {(election.status === "DRAFT" || election.status === "UPCOMING") ? (
                                    <button
                                        onClick={() => deleteElection(election.id)}
                                        style={{ background: "#dc2626", color: "white" }}
                                    >
                                        Delete
                                    </button>
                                ) : (election.status === "RESULTS_PUBLISHED" || election.status === "ENDED") ? (
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm(`Are you sure you want to archive election "${election.title}"? This moves it to the official Election Archive.`)) return;
                                            try {
                                                const res = await fetch(`http://localhost:5000/api/elections/${election.id}/status`, {
                                                    method: "PUT",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${localStorage.getItem("token")}`
                                                    },
                                                    body: JSON.stringify({ status: "ARCHIVED" })
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    alert("Election successfully archived!");
                                                    loadElections();
                                                } else {
                                                    alert(data.message || "Failed to archive election");
                                                }
                                            } catch (err) {
                                                alert(err.message);
                                            }
                                        }}
                                        style={{ background: "#475569", color: "white" }}
                                    >
                                        Archive
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        title="Active polling elections cannot be deleted or archived until ended."
                                        style={{ background: "#94a3b8", color: "white", cursor: "not-allowed", opacity: 0.6 }}
                                    >
                                        Active Poll
                                    </button>
                                )}

                            </div>
                        </div>
                    ));
                })()}
                </div>

                <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", position: "sticky", top: "20px" }}>
                    <h3 style={{ margin: "0 0 15px", fontSize: "16px" }}>Create New Election</h3>
                    <form onSubmit={createElection}>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Election Title</label>
                        <input type="text" value={newElectionTitle} onChange={e => setNewElectionTitle(e.target.value)} required placeholder="e.g. Lok Sabha General Election 2026" style={{ width: "100%", padding: "10px", margin: "0 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Description / Scope</label>
                        <textarea value={newElectionDesc} onChange={e => setNewElectionDesc(e.target.value)} placeholder="Enter details about electoral bounds, constituency groupings, etc." style={{ width: "100%", padding: "10px", margin: "0 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px", fontFamily: "inherit" }} />
                        
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>Start Date & Time</label>
                        <input type="datetime-local" value={newElectionStart} onChange={e => setNewElectionStart(e.target.value)} required min={new Date(Date.now() - 60000).toISOString().slice(0, 16)} style={{ width: "100%", padding: "10px", margin: "0 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "bold" }}>End Date & Time</label>
                        <input type="datetime-local" value={newElectionEnd} onChange={e => setNewElectionEnd(e.target.value)} required min={newElectionStart || new Date().toISOString().slice(0, 16)} style={{ width: "100%", padding: "10px", margin: "0 0 20px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        
                        <button type="submit" className="primary-btn" style={{ width: "100%" }} disabled={creatingElection}>
                            {creatingElection ? "Creating & Deploying on Chain..." : "Deploy Election"}
                        </button>
                    </form>
                </div>
            </div>


            {/* ====================================================
                CANDIDATE MANAGEMENT
            ==================================================== */}

            {selectedElection &&
                !showVoters &&
                !showResults && (

                    <div className="gov-modal-overlay" onClick={() => { setSelectedElection(null); setCandidates([]); setCandidateName(""); setCandidateParty(""); }}>
                        <div className="gov-modal-dialog" style={{ maxWidth: "860px", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
                            <div className="gov-modal-header">
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "17px", color: "var(--primary)" }}>
                                        Candidates — {selectedElection.title}
                                    </h2>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                        Election ID: {selectedElection.id} | Status: {selectedElection.status} | Total Registered: {candidates.length}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedElection(null); setCandidates([]); setCandidateName(""); setCandidateParty(""); }}
                                    style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b", fontWeight: "700" }}
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="gov-modal-body">


                        {/* =================================================
                            ADD CANDIDATE FORM
                        ================================================= */}

                        <div className="candidate-form">


                            {/* CANDIDATE NAME */}

                            <input
                                type="text"
                                placeholder="Candidate name"
                                value={candidateName}
                                onChange={(e) =>
                                    setCandidateName(
                                        e.target.value
                                    )
                                }
                            />


                            {/* PARTY */}
                            <select
                                value={candidateParty}
                                onChange={(e) => {
                                    setCandidateParty(e.target.value);
                                    const selected = parties.find(p => p.name === e.target.value);
                                    if (selected) {
                                        setCandidateSymbol(selected.symbol);
                                    }
                                }}
                                style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white" }}
                            >
                                <option value="">Select Political Party</option>
                                {parties.map(p => (
                                    <option key={p.id} value={p.name}>{p.name} ({p.abbreviation})</option>
                                ))}
                            </select>

                            {/* SYMBOL */}
                            <input
                                type="text"
                                placeholder="Ballot Symbol (auto-filled)"
                                value={candidateSymbol}
                                onChange={(e) => setCandidateSymbol(e.target.value)}
                                style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                            />

                            {/* MANIFESTO */}
                            <textarea
                                placeholder="Manifesto credentials / agenda"
                                value={candidateManifesto}
                                onChange={(e) => setCandidateManifesto(e.target.value)}
                                style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "60px", fontFamily: "inherit" }}
                            />

                            {/* ADD CANDIDATE */}

                            <button
                                onClick={async () => {

                                    if (
                                        !candidateName.trim()
                                    ) {

                                        alert(
                                            "Enter candidate name"
                                        );

                                        return;

                                    }

                                    const token =
                                        localStorage.getItem(
                                            "token"
                                        );

                                    if (!token) {

                                        alert(
                                            "Admin authentication token not found."
                                        );

                                        return;

                                    }

                                    try {

                                        const response =
                                            await fetch(
                                                "http://localhost:5000/api/candidates",
                                                {
                                                    method: "POST",

                                                    headers: {

                                                        "Content-Type":
                                                            "application/json",

                                                        Authorization:
                                                            `Bearer ${token}`

                                                    },

                                                    body:
                                                        JSON.stringify({

                                                            electionId:
                                                                selectedElection.id,

                                                            name:
                                                                candidateName,

                                                            party:
                                                                candidateParty,

                                                            symbol:
                                                                candidateSymbol,

                                                            manifesto:
                                                                candidateManifesto

                                                        })

                                                }
                                            );

                                        const data =
                                            await response.json();

                                        if (!response.ok) {

                                            alert(
                                                data.message ||
                                                "Failed to add candidate."
                                            );

                                            return;

                                        }

                                        alert(
                                            "Candidate added successfully."
                                        );

                                        setCandidateName(
                                            ""
                                        );

                                        setCandidateParty(
                                            ""
                                        );

                                        setCandidateSymbol(
                                            ""
                                        );

                                        setCandidateManifesto(
                                            ""
                                        );

                                        await loadCandidates(
                                            selectedElection.id
                                        );

                                    } catch (error) {

                                        console.error(
                                            "Add candidate error:",
                                            error
                                        );

                                        alert(
                                            "Failed to connect to backend."
                                        );

                                    }

                                }}
                            >
                                Add Candidate
                            </button>

                        </div>


                        {/* =================================================
                            EXISTING CANDIDATES
                        ================================================= */}

                        <div className="candidate-list">

                            <h3>
                                Existing Candidates
                            </h3>

                            {candidates.length > 0 ? (


                                candidates.map(
                                    candidate => (
                                        <div
                                            className="admin-candidate"
                                            key={candidate.id}
                                            style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "15px", border: "1px solid #cbd5e1", borderRadius: "8px", margin: "10px 0", background: "white" }}
                                        >
                                            {editingCandidateId === candidate.id ? (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <input 
                                                        type="text" 
                                                        value={editCandidateName} 
                                                        onChange={e => setEditCandidateName(e.target.value)} 
                                                        placeholder="Name"
                                                        style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={editCandidateParty} 
                                                        onChange={e => setEditCandidateParty(e.target.value)} 
                                                        placeholder="Party Name"
                                                        style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={editCandidateSymbol} 
                                                        onChange={e => setEditCandidateSymbol(e.target.value)} 
                                                        placeholder="Party Symbol"
                                                        style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
                                                    />
                                                    <textarea 
                                                        value={editCandidateBiography} 
                                                        onChange={e => setEditCandidateBiography(e.target.value)} 
                                                        placeholder="Biography"
                                                        style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", minHeight: "50px", fontFamily: "inherit" }}
                                                    />
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button onClick={() => updateCandidate(candidate.id)} className="primary-btn" style={{ background: "#22c55e", padding: "6px 12px", width: "auto" }}>Save</button>
                                                        <button onClick={() => setEditingCandidateId(null)} className="primary-btn" style={{ background: "#64748b", padding: "6px 12px", width: "auto" }}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        {candidate.symbol && <ECISymbolIcon symbol={candidate.symbol} size={30} />}
                                                        <div>
                                                            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{candidate.name}</strong>
                                                            <span style={{ marginLeft: "10px", color: "#64748b", fontSize: "13px" }}>{candidate.party || "Independent"}</span>
                                                            {candidate.symbol && <span style={{ marginLeft: "10px", fontSize: "12px", color: "#ea580c", fontWeight: "600" }}>({candidate.symbol})</span>}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                        <button 
                                                            onClick={() => {
                                                                setEditingCandidateId(candidate.id);
                                                                setEditCandidateName(candidate.name || "");
                                                                setEditCandidateParty(candidate.party || "");
                                                                setEditCandidateSymbol(candidate.symbol || "");
                                                                setEditCandidateBiography(candidate.biography || "");
                                                            }}
                                                            className="primary-btn" 
                                                            style={{ background: "#1e3a8a", padding: "6px 12px", width: "auto" }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteCandidate(candidate.id)}
                                                            className="primary-btn" 
                                                            style={{ background: "#dc2626", padding: "6px 12px", width: "auto" }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )

                            ) : (

                                <p>
                                    No candidates found for
                                    this election.
                                </p>

                            )}

                        </div>


                        {/* =================================================
                            CLOSE CANDIDATE MANAGEMENT
                        ================================================= */}

                        <div className="gov-modal-footer" style={{ marginTop: "20px" }}>
                            <button
                                type="button"
                                className="primary-btn"
                                style={{ background: "#64748b", padding: "8px 18px", width: "auto" }}
                                onClick={() => {
                                    setSelectedElection(null);
                                    setCandidates([]);
                                    setCandidateName("");
                                    setCandidateParty("");
                                }}
                            >
                                Close Candidate Management
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        )}


        {/* ====================================================
            VOTER MANAGEMENT
        ==================================================== */}

        {showVoters &&
            selectedElection &&
            !showResults && (

                <div className="gov-modal-overlay" onClick={() => { setShowVoters(false); setSelectedElection(null); setVoters([]); }}>
                    <div className="gov-modal-dialog" style={{ maxWidth: "860px", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
                        <div className="gov-modal-header">
                            <div>
                                <h2 style={{ margin: 0, fontSize: "17px", color: "var(--primary)" }}>
                                    Voters — {selectedElection.title}
                                </h2>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    Election ID: {selectedElection.id} | Total Voters in Roll: {voters.length}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowVoters(false); setSelectedElection(null); setVoters([]); }}
                                style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b", fontWeight: "700" }}
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="gov-modal-body">


                        {/* =================================================
                            VOTER LIST
                        ================================================= */}

                        {voters.length === 0 ? (

                            <p>
                                No voters found for this election.
                            </p>

                        ) : (

                            <div className="candidate-list">

                                {voters.map(
                                    voter => (

                                        <div
                                            className="candidate-admin-card"
                                            key={
                                                voter.id
                                            }
                                        >


                                            {/* VOTER INFORMATION */}

                                            <div>

                                                <strong>
                                                    {
                                                        voter.name
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        voter.email
                                                    }
                                                </span>

                                            </div>


                                            {/* VOTER STATUS */}

                                            <div>


                                                {/* AUTHORIZATION STATUS */}

                                                <span
                                                    className={
                                                        voter.is_authorized
                                                            ? "status active"
                                                            : "status draft"
                                                    }
                                                >
                                                    {
                                                        voter.is_authorized
                                                            ? "AUTHORIZED"
                                                            : "NOT AUTHORIZED"
                                                    }
                                                </span>


                                                {/* VOTING STATUS */}

                                                <span
                                                    className={
                                                        voter.has_voted
                                                            ? "status completed"
                                                            : "status draft"
                                                    }
                                                >
                                                    {
                                                        voter.has_voted
                                                            ? "VOTED"
                                                            : "NOT VOTED"
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}


                        {/* =================================================
                            CLOSE VOTER MANAGEMENT
                        ================================================= */}

                        <div className="gov-modal-footer" style={{ marginTop: "20px" }}>
                            <button
                                type="button"
                                className="primary-btn"
                                style={{ background: "#64748b", padding: "8px 18px", width: "auto" }}
                                onClick={() => {
                                    setShowVoters(false);
                                    setSelectedElection(null);
                                    setVoters([]);
                                }}
                            >
                                Close Voter Management
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        )}



                    </div>
                )}

                {/* 3. BLOCKCHAIN MONITOR */}
                {activeTab === "blockchain" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>SYSTEM SERVICE</span>
                                <h1>Blockchain RPC Monitor</h1>
                                <p>Live integration node data from the Ethereum-compatible Hardhat network.</p>
                            </div>
                        </div>

                        {blockchainStatus && (
                            <div style={{ background: "white", padding: "25px", borderRadius: "12px", border: "1px solid #e2e8f0", margin: "20px 0", lineHeight: "1.8" }}>
                                <h3 style={{ margin: "0 0 15px", color: "#1e293b" }}>Network Settings</h3>
                                <p><strong>RPC Provider URL:</strong> <code>{blockchainStatus.rpcUrl || "http://127.0.0.1:8545"}</code> (LOCAL DEVELOPMENT NETWORK)</p>
                                <p><strong>Chain Identifier (ID):</strong> <code>{blockchainStatus.chainId}</code></p>
                                <p><strong>Current Block Height:</strong> <code>#{blockchainStatus.blockNumber}</code></p>
                                <p><strong>Smart Contract Address:</strong> <code>{blockchainStatus.contractAddress}</code></p>
                                <p><strong>Contract Owner (Admin):</strong> <code>{blockchainStatus.contractAdmin}</code></p>
                            </div>
                        )}

                        <h3 style={{ margin: "25px 0 15px", color: "#1e293b" }}>On-Chain Transaction Log</h3>
                        {recentTransactions.length > 0 ? (
                            <table className="audit-table">
                                <thead>
                                    <tr>
                                        <th>Hash</th>
                                        <th>Sender</th>
                                        <th>Gas Used</th>
                                        <th>Block</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{tx.tx_hash}</td>
                                            <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{tx.wallet_address || "0xf39Fd...266"}</td>
                                            <td>{tx.gas_used || "N/A"}</td>
                                            <td>#{tx.block_number}</td>
                                            <td>{format12HourDateTime(tx.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{ color: "#64748b" }}>No voting/registration transactions recorded in database yet.</p>
                        )}
                    </div>
                )}

                {/* 4. SYSTEM HEALTH DETAIL SCREEN */}
                {activeTab === "health" && (
                    <div className="admin-page">
                        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <span>DIAGNOSTICS</span>
                                <h1>System Health Screen</h1>
                                <p>Real-time status indicators of the secure decentralised voting services stack.</p>
                            </div>
                            {window.electronAPI && window.electronAPI.openLogFolder && (
                                <button 
                                    onClick={() => window.electronAPI.openLogFolder()}
                                    className="admin-btn"
                                    style={{ background: "#475569", color: "white", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                                >
                                    Open Audit Logs Directory
                                </button>
                            )}
                        </div>

                        {healthLoading ? (
                            <p>Loading system health status...</p>
                        ) : (
                            <div className="health-grid">
                                <div className="health-card">
                                    <h3>Express Backend API <span className="health-badge online">ONLINE</span></h3>
                                    <p style={{ fontSize: "13px", color: "#64748b" }}>Node Express API server is active on port 5000 and responding correctly.</p>
                                </div>
                                <div className="health-card">
                                    <h3>PostgreSQL Database 
                                        <span className={`health-badge ${healthData?.services?.database?.status === "ONLINE" ? "online" : "offline"}`}>
                                            {healthData?.services?.database?.status || "OFFLINE"}
                                        </span>
                                    </h3>
                                    <p style={{ fontSize: "13px", color: "#64748b" }}>{healthData?.services?.database?.message || "Database connection offline."}</p>
                                    {healthData?.services?.database?.time && <small style={{ color: "#94a3b8" }}>Last sync time: {healthData.services.database.time}</small>}
                                </div>
                                <div className="health-card">
                                    <h3>Hardhat Blockchain RPC 
                                        <span className={`health-badge ${healthData?.services?.blockchain?.status === "ONLINE" ? "online" : "offline"}`}>
                                            {healthData?.services?.blockchain?.status || "OFFLINE"}
                                        </span>
                                    </h3>
                                    <p style={{ fontSize: "13px", color: "#64748b" }}>{healthData?.services?.blockchain?.message || "Hardhat RPC endpoint offline."}</p>
                                    {healthData?.services?.blockchain?.blockNumber && <small style={{ color: "#94a3b8" }}>Current Block: #{healthData.services.blockchain.blockNumber}</small>}
                                </div>
                                <div className="health-card">
                                    <h3>EVoting Smart Contract 
                                        <span className={`health-badge ${healthData?.services?.contract?.status === "VERIFIED" ? "verified" : "offline"}`}>
                                            {healthData?.services?.contract?.status || "OFFLINE"}
                                        </span>
                                    </h3>
                                    <p style={{ fontSize: "13px", color: "#64748b" }}>{healthData?.services?.contract?.message || "Smart contract validation failed."}</p>
                                    {healthData?.services?.contract?.address && <small style={{ color: "#94a3b8" }}>Address: {healthData.services.contract.address}</small>}
                                </div>
                                <div className="health-card">
                                    <h3>Python Analytics Engine 
                                        <span className={`health-badge ${healthData?.services?.analytics?.status === "ONLINE" ? "online" : "offline"}`}>
                                            {healthData?.services?.analytics?.status || "OFFLINE"}
                                        </span>
                                    </h3>
                                    <p style={{ fontSize: "13px", color: "#64748b" }}>{healthData?.services?.analytics?.message || "Python script not found."}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. AUDIT LOGS TRAIL & VOTER RECEIPTS LEDGER */}
                {activeTab === "audit" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>COMPLIANCE & AUDIT</span>
                                <h1>Security Audit Trail & Cryptographic Voter Receipts</h1>
                                <p>Tamper-proof logs of administrative operations and decentralized ballot receipts recorded on the blockchain ledger.</p>
                            </div>
                        </div>

                        {/* SUBTAB SWITCHER */}
                        <div style={{ display: "flex", gap: "10px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>
                            <button 
                                onClick={() => setAuditSubTab("logs")}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: auditSubTab === "logs" ? "#1e3a8a" : "#f1f5f9",
                                    color: auditSubTab === "logs" ? "white" : "#475569",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    fontSize: "12.5px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}
                            >
                                <IconShield size={14} /> System Audit Trail ({auditLogs.length})
                            </button>
                            <button 
                                onClick={() => { setAuditSubTab("receipts"); fetchReceipts(); }}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: auditSubTab === "receipts" ? "#1e3a8a" : "#f1f5f9",
                                    color: auditSubTab === "receipts" ? "white" : "#475569",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    fontSize: "12.5px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}
                            >
                                <IconReceipt size={14} /> Cryptographic Voter Receipts & Ledger ({allReceipts.length})
                            </button>
                        </div>

                        {/* SUBTAB 1: SYSTEM ACTION LOGS */}
                        {auditSubTab === "logs" && (
                            <div>
                                <div style={{
                                    marginBottom: "16px",
                                    padding: "12px 16px",
                                    background: "#f8fafc",
                                    border: "1px solid #cbd5e1",
                                    borderLeft: "4px solid #1e3a8a",
                                    borderRadius: "6px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "10px"
                                }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                            <span style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                Tamper-Proof & Non-Editable
                                            </span>
                                            <strong style={{ fontSize: "13px", color: "#1e3a8a" }}>Official Administrative Activity Audit Trail</strong>
                                        </div>
                                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                            All administrative changes, master data additions, elector registrations, and election actions are recorded into an append-only, tamper-proof database log protected by PostgreSQL engine triggers. Direct UPDATE and DELETE operations are permanently prohibited.
                                        </span>
                                    </div>
                                    <span style={{ fontSize: "11px", color: "#0f172a", fontWeight: "700", background: "#e2e8f0", padding: "4px 10px", borderRadius: "4px" }}>
                                        Total Records: {auditLogs.length}
                                    </span>
                                </div>

                                <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
                                    <input
                                        type="text"
                                        placeholder="Search audit logs by keyword, email, or description..."
                                        value={auditSearch}
                                        onChange={(e) => {
                                            setAuditSearch(e.target.value);
                                            fetchAuditLogs(auditActionFilter, e.target.value);
                                        }}
                                        style={{ flex: "1 1 250px", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px" }}
                                    />
                                    <select
                                        value={auditActionFilter}
                                        onChange={(e) => {
                                            setAuditActionFilter(e.target.value);
                                            fetchAuditLogs(e.target.value, auditSearch);
                                        }}
                                        style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "#ffffff" }}
                                    >
                                        <option value="ALL">All Recorded Actions</option>
                                        <option value="ADMIN_ADD_STATE">ADMIN_ADD_STATE</option>
                                        <option value="ADMIN_UPDATE_STATE">ADMIN_UPDATE_STATE</option>
                                        <option value="ADMIN_VERIFY_STATE">ADMIN_VERIFY_STATE</option>
                                        <option value="ADMIN_ARCHIVE_STATE">ADMIN_ARCHIVE_STATE</option>
                                        <option value="ADMIN_ADD_PARTY">ADMIN_ADD_PARTY</option>
                                        <option value="ADMIN_UPDATE_PARTY">ADMIN_UPDATE_PARTY</option>
                                        <option value="ADMIN_VERIFY_PARTY">ADMIN_VERIFY_PARTY</option>
                                        <option value="ADMIN_APPROVE_DATA_IMPORT">ADMIN_APPROVE_DATA_IMPORT</option>
                                        <option value="ADMIN_CREATE_POLLING_STATION">ADMIN_CREATE_POLLING_STATION</option>
                                        <option value="ADMIN_ASSIGN_POLLING_OFFICER">ADMIN_ASSIGN_POLLING_OFFICER</option>
                                        <option value="ADMIN_CREATE_ELECTION_OFFICER">ADMIN_CREATE_ELECTION_OFFICER</option>
                                        <option value="ADMIN_CREATE_SYMBOL">ADMIN_CREATE_SYMBOL</option>
                                        <option value="CANDIDATE_ADDED">CANDIDATE_ADDED</option>
                                        <option value="USER_REGISTERED_FORM6">USER_REGISTERED_FORM6</option>
                                        <option value="USER_LOGIN">USER_LOGIN</option>
                                    </select>
                                    <button
                                        onClick={() => fetchAuditLogs()}
                                        className="secondary-btn btn-sm"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 12px", background: "#ffffff", borderColor: "#cbd5e1", fontSize: "12px" }}
                                    >
                                        <IconRefresh size={13} /> Refresh Log
                                    </button>
                                </div>

                                {auditLoading ? (
                                    <p>Loading security audit logs...</p>
                                ) : auditLogs.length > 0 ? (
                                    <table className="audit-table">
                                        <thead>
                                            <tr>
                                                <th>User / Actor</th>
                                                <th>Action Type</th>
                                                <th>Activity Description</th>
                                                <th>Client IP</th>
                                                <th>Timestamp</th>
                                                <th>Immutability</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td>
                                                        <code>{log.user_email || "System/Public"}</code>{" "}
                                                        <small style={{ background: "#f1f5f9", padding: "2px 4px", borderRadius: "4px" }}>
                                                            {log.user_role || "VOTER"}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            background: log.action.startsWith("ADMIN") ? "#eff6ff" : "#f0fdf4",
                                                            color: log.action.startsWith("ADMIN") ? "#1d4ed8" : "#15803d",
                                                            border: log.action.startsWith("ADMIN") ? "1px solid #bfdbfe" : "1px solid #bbf7d0",
                                                            fontSize: "10.5px",
                                                            fontWeight: "700",
                                                            padding: "2px 6px",
                                                            borderRadius: "4px"
                                                        }}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: "12px" }}>{log.description}</td>
                                                    <td>
                                                        <code style={{ fontSize: "11px", color: "#64748b" }}>
                                                            {log.ip_address ? String(log.ip_address) : "127.0.0.1"}
                                                        </code>
                                                    </td>
                                                    <td style={{ fontSize: "11px", color: "#475569" }}>
                                                        {format12HourDateTime(log.created_at)}
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            fontSize: "9.5px",
                                                            fontWeight: "800",
                                                            color: "#166534",
                                                            background: "#dcfce7",
                                                            padding: "1px 5px",
                                                            borderRadius: "3px"
                                                        }}>
                                                            NON-EDITABLE
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: "#64748b" }}>No audit trails recorded matching the current filter.</p>
                                )}
                            </div>
                        )}

                        {/* SUBTAB 2: VOTER CRYPTOGRAPHIC RECEIPTS LEDGER */}
                        {auditSubTab === "receipts" && (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", gap: "15px", flexWrap: "wrap" }}>
                                    <div style={{ flex: "1 1 300px" }}>
                                        <input 
                                            type="text"
                                            placeholder="Search by receipt code (e.g. REC-...), elector name, or EPIC voter ID..."
                                            value={receiptSearch}
                                            onChange={(e) => setReceiptSearch(e.target.value)}
                                            style={{ width: "100%", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                                        />
                                    </div>
                                    <button 
                                        onClick={fetchReceipts}
                                        className="primary-btn"
                                        style={{ background: "#0284c7", padding: "9px 16px", fontSize: "12px", width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <IconRefresh size={14} /> Refresh Ledger
                                    </button>
                                </div>

                                {receiptLoading ? (
                                    <p>Querying immutable blockchain receipts...</p>
                                ) : (
                                    <table className="audit-table">
                                        <thead>
                                            <tr>
                                                <th>Receipt Code</th>
                                                <th>Elector & Voter ID</th>
                                                <th>Election</th>
                                                <th>Candidate / Party</th>
                                                <th>Block / Tx Hash</th>
                                                <th>Timestamp</th>
                                                <th>Verification</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allReceipts
                                                .filter(r => {
                                                    if (!receiptSearch.trim()) return true;
                                                    const s = receiptSearch.toLowerCase();
                                                    return (r.receipt_code && r.receipt_code.toLowerCase().includes(s)) ||
                                                           (r.elector_name && r.elector_name.toLowerCase().includes(s)) ||
                                                           (r.elector_epic_id && r.elector_epic_id.toLowerCase().includes(s));
                                                })
                                                .map(r => (
                                                    <tr key={r.id}>
                                                        <td>
                                                            <strong style={{ fontFamily: "monospace", color: "#1e3a8a", background: "#e0f2fe", padding: "2px 6px", borderRadius: "4px" }}>
                                                                {r.receipt_code}
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            <strong>{r.elector_name || "Verified Citizen"}</strong>
                                                            <div style={{ fontSize: "11px", color: "#64748b" }}>EPIC: <code>{r.elector_epic_id || "N/A"}</code></div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#0f172a" }}>{r.election_title}</div>
                                                            <div style={{ fontSize: "11px", color: "#64748b" }}>{r.election_code || "ECI"}</div>
                                                        </td>
                                                        <td>
                                                            <strong>{r.candidate_name || "Sealed Ballot"}</strong>
                                                            <div style={{ fontSize: "11px", color: "#64748b" }}>{r.candidate_party || "ECI Recognized"} • <em>{r.candidate_symbol}</em></div>
                                                        </td>
                                                        <td>
                                                            <div><strong>Block #{r.block_number}</strong></div>
                                                            <code style={{ fontSize: "10px", color: "#475569" }} title={r.tx_hash}>
                                                                {r.tx_hash ? `${r.tx_hash.slice(0, 10)}...${r.tx_hash.slice(-8)}` : "Pending"}
                                                            </code>
                                                        </td>
                                                        <td>{format12HourDateTime(r.created_at)}</td>
                                                        <td>
                                                            <button 
                                                                onClick={() => verifySingleReceipt(r.receipt_code)}
                                                                style={{
                                                                    background: "#16a34a",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "4px",
                                                                    padding: "5px 10px",
                                                                    fontSize: "11.5px",
                                                                    fontWeight: "600",
                                                                    cursor: "pointer"
                                                                }}
                                                            >
                                                                Verify On-Chain
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* RECEIPT VERIFICATION MODAL FOR HIGHER AUTHORITY */}
                        {receiptModalData && (
                            <div style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "rgba(15, 23, 42, 0.75)",
                                backdropFilter: "blur(4px)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 99999,
                                padding: "20px"
                            }}>
                                <div style={{
                                    background: "#ffffff",
                                    borderRadius: "8px",
                                    padding: "25px",
                                    maxWidth: "600px",
                                    width: "100%",
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                    border: "2px solid #1e3a8a"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
                                        <div>
                                            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <IconCheck size={13} color="#16a34a" /> ECI LEDGER AUDIT VERIFIED
                                            </span>
                                            <h3 style={{ margin: "2px 0 0", color: "#1e3a8a", fontSize: "16px" }}>Authentic Cryptographic Ballot Receipt</h3>
                                        </div>
                                        <button 
                                            onClick={() => setReceiptModalData(null)}
                                            style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    <div style={{ fontSize: "12.5px", display: "grid", gap: "10px", color: "#1e293b" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Receipt Code:</span>
                                            <strong style={{ fontFamily: "monospace", color: "#1e3a8a", fontSize: "14px" }}>{receiptModalData.receipt_code}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Elector Name & EPIC:</span>
                                            <strong>{receiptModalData.elector_name} ({receiptModalData.elector_epic_id})</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Election Title:</span>
                                            <strong>{receiptModalData.election_title}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Choice Voted:</span>
                                            <strong>{receiptModalData.candidate_name} ({receiptModalData.candidate_party}) - {receiptModalData.candidate_symbol}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Block Height:</span>
                                            <strong>Block #{receiptModalData.block_number}</strong>
                                        </div>
                                        <div>
                                            <span style={{ color: "#64748b", display: "block", marginBottom: "2px" }}>Blockchain Transaction Hash:</span>
                                            <code style={{ fontSize: "11px", wordBreak: "break-all", background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", display: "block" }}>
                                                {receiptModalData.tx_hash}
                                            </code>
                                        </div>
                                        <div>
                                            <span style={{ color: "#64748b", display: "block", marginBottom: "2px" }}>SHA-256 Digital Verification Signature:</span>
                                            <code style={{ fontSize: "10.5px", wordBreak: "break-all", background: "#f0fdf4", color: "#166534", padding: "4px 8px", borderRadius: "4px", display: "block" }}>
                                                {receiptModalData.digital_signature}
                                            </code>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                                        <button 
                                            onClick={() => setReceiptModalData(null)}
                                            className="primary-btn"
                                            style={{ background: "#1e3a8a", padding: "8px 20px" }}
                                        >
                                            Close Audit Inspector
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* 6. CONSTITUENCIES */}
                {activeTab === "constituencies" && (() => {
                    const filteredConsts = constituencies.filter(c => {
                        const matchesState = constStateFilter === "ALL" || c.state_name === constStateFilter;
                        const q = constSearch.trim().toLowerCase();
                        const matchesSearch = !q || (c.name && c.name.toLowerCase().includes(q)) || (c.code && c.code.toLowerCase().includes(q));
                        return matchesState && matchesSearch;
                    });

                    return (
                        <div className="admin-page">
                            <div className="admin-header">
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.8px", color: "#0284c7", textTransform: "uppercase" }}>
                                        OFFICIAL ECI ELECTORAL GEOGRAPHY
                                    </span>
                                    <h1>Parliamentary & Assembly Constituencies Directory</h1>
                                    <p>Official statutory delimitation boundaries verified against the gazette of the Election Commission of India. Contains authentic Lok Sabha and Vidhan Sabha seats.</p>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button 
                                        onClick={() => loadConstituencies(constTypeFilter)}
                                        className="primary-btn"
                                        style={{ background: "#0284c7", padding: "8px 16px", fontSize: "12px", width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <IconRefresh size={14} /> Refresh Directory
                                    </button>
                                </div>
                            </div>

                            {/* TELEMETRY STATS */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #1e3a8a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>Parliamentary Seats</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0f172a" }}>543</h2>
                                    <span style={{ fontSize: "11px", color: "#1e3a8a" }}>Lok Sabha Constituencies</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #0284c7" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>Assembly Seats</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0284c7" }}>4,551</h2>
                                    <span style={{ fontSize: "11px", color: "#0284c7" }}>Vidhan Sabha Constituencies</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #16a34a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>States & UTs</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#16a34a" }}>36</h2>
                                    <span style={{ fontSize: "11px", color: "#16a34a" }}>All National Jurisdictions</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700", letterSpacing: "0.5px" }}>Filtered Count</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#f59e0b" }}>{filteredConsts.length}</h2>
                                    <span style={{ fontSize: "11px", color: "#f59e0b" }}>Currently displayed</span>
                                </div>
                            </div>

                            {/* FILTER & TYPE TOGGLE TOOLBAR */}
                            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px", background: "white", padding: "16px 20px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    <button
                                        onClick={() => { setConstTypeFilter("PC"); loadConstituencies("PC"); }}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            fontSize: "12.5px",
                                            fontWeight: constTypeFilter === "PC" ? "700" : "500",
                                            background: constTypeFilter === "PC" ? "#1e3a8a" : "#f1f5f9",
                                            color: constTypeFilter === "PC" ? "#ffffff" : "#475569",
                                            border: constTypeFilter === "PC" ? "1px solid #1e3a8a" : "1px solid #cbd5e1",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Parliamentary (Lok Sabha - 543 PCs)
                                    </button>
                                    <button
                                        onClick={() => { setConstTypeFilter("AC"); loadConstituencies("AC"); }}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            fontSize: "12.5px",
                                            fontWeight: constTypeFilter === "AC" ? "700" : "500",
                                            background: constTypeFilter === "AC" ? "#1e3a8a" : "#f1f5f9",
                                            color: constTypeFilter === "AC" ? "#ffffff" : "#475569",
                                            border: constTypeFilter === "AC" ? "1px solid #1e3a8a" : "1px solid #cbd5e1",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Assembly (Vidhan Sabha - 4,551 ACs)
                                    </button>
                                </div>

                                <div style={{ flex: "1 1 200px" }}>
                                    <select
                                        value={constStateFilter}
                                        onChange={e => setConstStateFilter(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", background: "white" }}
                                    >
                                        <option value="ALL">All States & Union Territories (36 Total)</option>
                                        {ALL_INDIAN_STATES.map((s, idx) => (
                                            <option key={idx} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ flex: "2 1 250px" }}>
                                    <input
                                        type="text"
                                        placeholder={`Search ${constTypeFilter === "PC" ? "parliamentary" : "assembly"} constituency by name or code...`}
                                        value={constSearch}
                                        onChange={e => setConstSearch(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "25px", alignItems: "start" }}>
                                <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                        <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
                                            {constTypeFilter === "PC" ? "Lok Sabha Parliamentary Constituencies" : "Vidhan Sabha Legislative Constituencies"}
                                        </h3>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Showing {filteredConsts.length} Seats</span>
                                    </div>

                                    {filteredConsts.length === 0 ? (
                                        <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                                            No official constituencies found matching the filter criteria.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: "auto", maxHeight: "650px", overflowY: "auto" }}>
                                            <table className="audit-table">
                                                <thead>
                                                    <tr>
                                                        <th>Seat #</th>
                                                        <th>Constituency Name</th>
                                                        <th>Official Code</th>
                                                        <th>State / UT</th>
                                                        <th>Type / Category</th>
                                                        <th>Gazette Verification</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredConsts.slice(0, 150).map(c => (
                                                        <tr key={c.id}>
                                                            <td><strong>#{c.constituency_number || c.id}</strong></td>
                                                            <td>
                                                                <strong style={{ color: "#0f172a", fontSize: "13.5px" }}>{c.name}</strong>
                                                                {c.district_name && <div style={{ fontSize: "11px", color: "#64748b" }}>District: {c.district_name}</div>}
                                                            </td>
                                                            <td><code>{c.code}</code></td>
                                                            <td><span style={{ color: "#1e3a8a", fontWeight: "600" }}>{c.state_name || "National"}</span></td>
                                                            <td>
                                                                <span className="status-tag upcoming" style={{ fontSize: "10.5px" }}>
                                                                    {c.category || (constTypeFilter === "PC" ? "LOK SABHA" : "VIDHAN SABHA")}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "4px", fontSize: "10.5px", fontWeight: "700", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                                                                    <IconCheck size={11} /> OFFICIAL REFERENCE
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredConsts.length > 150 && (
                                                <div style={{ padding: "10px", textAlign: "center", fontSize: "12px", color: "#64748b", background: "#f8fafc" }}>
                                                    Displaying first 150 seats of {filteredConsts.length}. Use state filter or search to refine.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                    <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: "#0f172a" }}>Official Seat Gazette Form</h3>
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px" }}>Register a verified parliamentary constituency with statutory gazette credentials.</p>
                                    
                                    <form onSubmit={createConstituency}>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>State / UT</label>
                                        <select 
                                            value={newConstState} 
                                            onChange={e => setNewConstState(e.target.value)}
                                            style={{ width: "100%", padding: "8px 10px", margin: "0 0 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", background: "white" }}
                                        >
                                            {ALL_INDIAN_STATES.map((s, idx) => (
                                                <option key={idx} value={s}>{s}</option>
                                            ))}
                                        </select>

                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Seat Number</label>
                                        <input 
                                            type="number" 
                                            value={newConstNumber} 
                                            onChange={e => setNewConstNumber(Number(e.target.value))} 
                                            min="1" 
                                            max="543" 
                                            required 
                                            style={{ width: "100%", padding: "8px 10px", margin: "0 0 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }} 
                                        />

                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Constituency Name</label>
                                        <input 
                                            type="text" 
                                            value={newConstName} 
                                            onChange={e => setNewConstName(e.target.value)} 
                                            required 
                                            placeholder="e.g. Pune Parliamentary" 
                                            style={{ width: "100%", padding: "8px 10px", margin: "0 0 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }} 
                                        />
                                        
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Official Gazette Code</label>
                                        <input 
                                            type="text" 
                                            value={newConstCode} 
                                            onChange={e => setNewConstCode(e.target.value)} 
                                            required 
                                            placeholder="e.g. MH-PC-34" 
                                            style={{ width: "100%", padding: "8px 10px", margin: "0 0 16px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px", boxSizing: "border-box" }} 
                                        />
                                        
                                        <button type="submit" className="primary-btn" style={{ width: "100%", padding: "10px", fontSize: "13px" }}>
                                            Record Official Seat
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* 7. POLLING STATIONS */}
                {activeTab === "polling_stations" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>BOOTHS</span>
                                <h1>Polling Stations Management</h1>
                                <p>Configure location addresses, registered voter limits, and assigned officers for local polling booths.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", alignItems: "start" }}>
                            <div>
                                <h3>Registered Stations</h3>
                                <table className="audit-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Station Name</th>
                                            <th>Address</th>
                                            <th>Constituency</th>
                                            <th>Capacity</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pollingStations.map(ps => (
                                            <tr key={ps.id}>
                                                {editingStationId === ps.id ? (
                                                    <>
                                                        <td>
                                                            <input 
                                                                type="text" 
                                                                value={editStationCode} 
                                                                onChange={e => setEditStationCode(e.target.value)} 
                                                                style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px", width: "100px" }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="text" 
                                                                value={editStationName} 
                                                                onChange={e => setEditStationName(e.target.value)} 
                                                                style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px" }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="text" 
                                                                value={editStationAddress} 
                                                                onChange={e => setEditStationAddress(e.target.value)} 
                                                                style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px" }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select 
                                                                value={editStationConstId} 
                                                                onChange={e => setEditStationConstId(e.target.value)}
                                                                style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px", background: "white" }}
                                                            >
                                                                <option value="">Select Constituency</option>
                                                                {constituencies.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="number" 
                                                                value={editStationCapacity} 
                                                                onChange={e => setEditStationCapacity(Number(e.target.value))} 
                                                                style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px", width: "80px" }}
                                                            />
                                                        </td>
                                                        <td>{ps.status}</td>
                                                        <td>
                                                            <div style={{ display: "flex", gap: "6px" }}>
                                                                <button onClick={() => updatePollingStation(ps.id)} className="primary-btn" style={{ background: "#22c55e", padding: "4px 8px", fontSize: "11px", width: "auto" }}>Save</button>
                                                                <button onClick={() => setEditingStationId(null)} className="primary-btn" style={{ background: "#64748b", padding: "4px 8px", fontSize: "11px", width: "auto" }}>Cancel</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td><code>{ps.code}</code></td>
                                                        <td><strong>{ps.name}</strong></td>
                                                        <td>{ps.address}</td>
                                                        <td>{ps.constituency_name || "Unmapped"}</td>
                                                        <td>{ps.capacity} voters</td>
                                                        <td><span className={`status-tag ${ps.status === "ACTIVE" ? "active" : "ended"}`}>{ps.status}</span></td>
                                                        <td>
                                                            <div style={{ display: "flex", gap: "6px" }}>
                                                                <button 
                                                                    onClick={() => {
                                                                        setEditingStationId(ps.id);
                                                                        setEditStationCode(ps.code || "");
                                                                        setEditStationName(ps.name || "");
                                                                        setEditStationAddress(ps.address || "");
                                                                        setEditStationConstId(ps.constituency_id || "");
                                                                        setEditStationCapacity(ps.capacity || 1000);
                                                                    }}
                                                                    className="primary-btn" 
                                                                    style={{ background: "#1e3a8a", padding: "4px 8px", fontSize: "11px", width: "auto" }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => deletePollingStation(ps.id)}
                                                                    className="primary-btn" 
                                                                    style={{ background: "#dc2626", padding: "4px 8px", fontSize: "11px", width: "auto" }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h3>Register Polling Station</h3>
                                <form onSubmit={createPollingStation}>
                                    <label>Station Name</label>
                                    <input type="text" value={newStationName} onChange={e => setNewStationName(e.target.value)} required placeholder="e.g. Pune Central Booth A" style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                    
                                    <label>Station Code</label>
                                    <input type="text" value={newStationCode} onChange={e => setNewStationCode(e.target.value)} required placeholder="e.g. BOOTH-051" style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                                    
                                    <label>Booth Address</label>
                                    <input type="text" value={newStationAddress} onChange={e => setNewStationAddress(e.target.value)} required placeholder="e.g. Street 42, PMC Building" style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />

                                    <label>Electoral Constituency</label>
                                    <select value={newStationConstId} onChange={e => setNewStationConstId(e.target.value)} required style={{ width: "100%", padding: "10px", margin: "8px 0 20px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white" }}>
                                        <option value="">Select Constituency</option>
                                        {constituencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <button type="submit" className="primary-btn" style={{ width: "100%" }}>Register Station</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* 8. POLITICAL PARTIES */}
                {activeTab === "parties" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>STATUTORY ORGANIZATIONS & SYMBOLS</span>
                                <h1>Recognized Political Parties & Election Symbols</h1>
                                <p>Statutory register of National and State recognized political parties and reserved election symbols under The Election Symbols (Reservation and Allotment) Order, 1968.</p>
                            </div>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <button 
                                    onClick={loadParties}
                                    className="primary-btn"
                                    style={{ background: "#0284c7", padding: "8px 16px", fontSize: "12px", width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                >
                                    <IconRefresh size={14} /> Refresh Register
                                </button>
                            </div>
                        </div>

                        {/* SEARCH & TELEMETRY BAR */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "15px", flexWrap: "wrap", background: "white", padding: "14px 20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                            <div style={{ flex: "1 1 320px" }}>
                                <input 
                                    type="text"
                                    placeholder="Search political party by name, abbreviation (e.g. BJP, INC, AAP), or symbol..."
                                    value={partySearchFilter}
                                    onChange={(e) => setPartySearchFilter(e.target.value)}
                                    style={{ width: "100%", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "15px", alignItems: "center", fontSize: "13px" }}>
                                <span style={{ background: "#eff6ff", color: "#1e40af", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", border: "1px solid #bfdbfe" }}>
                                    Total Recognized Parties: {(parties || []).length}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px", alignItems: "start" }}>
                            <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #cbd5e1", overflowX: "auto" }}>
                                <h3 style={{ color: "#1e3a8a", margin: "0 0 15px", fontSize: "15px" }}>Official Parties Register</h3>

                                {partiesLoading ? (
                                    <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Loading political parties register...</p>
                                    </div>
                                ) : (parties || []).length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>No political parties registered yet.</p>
                                    </div>
                                ) : (
                                    <table className="audit-table">
                                        <thead>
                                            <tr>
                                                <th>Party Name</th>
                                                <th>Abbr</th>
                                                <th>Party Leader</th>
                                                <th>Reserved Symbol</th>
                                                <th>Headquarters / Contact</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(parties || [])
                                                .filter(p => {
                                                    if (!partySearchFilter.trim()) return true;
                                                    const q = partySearchFilter.toLowerCase();
                                                    return (p.name && p.name.toLowerCase().includes(q)) ||
                                                           (p.abbreviation && p.abbreviation.toLowerCase().includes(q)) ||
                                                           (p.leader && p.leader.toLowerCase().includes(q)) ||
                                                           (p.symbol && p.symbol.toLowerCase().includes(q));
                                                })
                                                .map(p => (
                                                    <tr key={p.id}>
                                                        {editingPartyId === p.id ? (
                                                             <>
                                                                <td>
                                                                    <input 
                                                                        type="text" 
                                                                        value={editPartyName} 
                                                                        onChange={e => setEditPartyName(e.target.value)} 
                                                                        style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12.5px", width: "100%" }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input 
                                                                        type="text" 
                                                                        value={editPartyAbbr} 
                                                                        onChange={e => setEditPartyAbbr(e.target.value)} 
                                                                        style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12.5px", width: "70px" }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input 
                                                                        type="text" 
                                                                        value={editPartyLeader} 
                                                                        onChange={e => setEditPartyLeader(e.target.value)} 
                                                                        placeholder="Party President / Chief"
                                                                        style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12.5px", width: "100%" }}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                        <ECISymbolIcon symbol={editPartySymbol} size={28} />
                                                                        <input 
                                                                            type="text" 
                                                                            value={editPartySymbol} 
                                                                            onChange={e => setEditPartySymbol(e.target.value)} 
                                                                            style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12.5px", width: "100%" }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <input 
                                                                        type="text" 
                                                                        value={editPartyContact} 
                                                                        onChange={e => setEditPartyContact(e.target.value)} 
                                                                        style={{ padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12.5px", width: "100%" }}
                                                                    />
                                                                </td>
                                                                <td>{p.status}</td>
                                                                <td>
                                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                                        <button onClick={() => updateParty(p.id)} className="primary-btn" style={{ background: "#16a34a", padding: "4px 8px", fontSize: "11px", width: "auto" }}>Save</button>
                                                                        <button onClick={() => setEditingPartyId(null)} className="primary-btn" style={{ background: "#64748b", padding: "4px 8px", fontSize: "11px", width: "auto" }}>Cancel</button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td>
                                                                    <strong style={{ color: "#0f172a", fontSize: "13px", display: "block" }}>{p.name}</strong>
                                                                </td>
                                                                <td>
                                                                    <code style={{ background: "#e0f2fe", color: "#1e3a8a", padding: "3px 7px", borderRadius: "4px", fontWeight: "bold", fontSize: "12px" }}>
                                                                        {p.abbreviation}
                                                                    </code>
                                                                </td>
                                                                <td>
                                                                    <strong style={{ color: "#0f172a", fontSize: "13px", display: "block" }}>{p.leader || "Official Appointee"}</strong>
                                                                    <span style={{ fontSize: "10.5px", color: "#64748b" }}>National President / Chief</span>
                                                                </td>
                                                                <td>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                        <ECISymbolIcon symbol={p.symbol} size={36} />
                                                                        <div>
                                                                            <strong style={{ color: "#0f172a", fontSize: "13px", display: "block" }}>{p.symbol}</strong>
                                                                            <span style={{ fontSize: "9.5px", color: "#ea580c", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.3px" }}>ECI Reserved</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ fontSize: "12px", color: "#475569", maxWidth: "200px" }}>
                                                                    {p.contact_info || "Nirvachan Sadan Recognized"}
                                                                </td>
                                                                <td>
                                                                    <span className="status-tag active" style={{ fontSize: "10.5px" }}>{p.status || "ACTIVE"}</span>
                                                                </td>
                                                                <td>
                                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                                        <button 
                                                                            onClick={() => {
                                                                                setEditingPartyId(p.id);
                                                                                setEditPartyName(p.name || "");
                                                                                setEditPartyAbbr(p.abbreviation || "");
                                                                                setEditPartyLeader(p.leader || "");
                                                                                setEditPartySymbol(p.symbol || "");
                                                                                setEditPartyContact(p.contact_info || "");
                                                                            }}
                                                                            className="primary-btn" 
                                                                            style={{ background: "#1e3a8a", padding: "4px 8px", fontSize: "11px", width: "auto" }}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => deleteParty(p.id)}
                                                                            className="primary-btn" 
                                                                            style={{ background: "#dc2626", padding: "4px 8px", fontSize: "11px", width: "auto" }}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* REGISTRATION FORM */}
                            <div style={{ background: "white", padding: "22px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                <h3 style={{ color: "#1e3a8a", margin: "0 0 4px", fontSize: "15px" }}>Form ECI-PP: Register Party</h3>
                                <p style={{ fontSize: "11.5px", color: "#64748b", margin: "0 0 16px" }}>Register a political organization and reserve candidate ballot symbol.</p>
                                
                                <form onSubmit={createParty}>
                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Official Party Name</label>
                                    <input 
                                        type="text" 
                                        value={newPartyName} 
                                        onChange={e => setNewPartyName(e.target.value)} 
                                        required 
                                        placeholder="e.g. Rashtriya Janata Dal" 
                                        style={{ width: "100%", padding: "9px 12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }} 
                                    />
                                    
                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Party Abbreviation</label>
                                    <input 
                                        type="text" 
                                        value={newPartyAbbr} 
                                        onChange={e => setNewPartyAbbr(e.target.value)} 
                                        required 
                                        placeholder="e.g. RJD" 
                                        style={{ width: "100%", padding: "9px 12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }} 
                                    />

                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Party Leader / President</label>
                                    <input 
                                        type="text" 
                                        value={newPartyLeader} 
                                        onChange={e => setNewPartyLeader(e.target.value)} 
                                        placeholder="e.g. Lalu Prasad Yadav, J.P. Nadda, Mallikarjun Kharge" 
                                        style={{ width: "100%", padding: "9px 12px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }} 
                                    />
                                    
                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Reserved Election Symbol</label>
                                    <input 
                                        type="text" 
                                        value={newPartySymbol} 
                                        onChange={e => setNewPartySymbol(e.target.value)} 
                                        required 
                                        placeholder="e.g. Lotus, Hand, Broom, Elephant, Bicycle" 
                                        style={{ width: "100%", padding: "9px 12px", marginBottom: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }} 
                                    />
                                    {newPartySymbol && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "#f8fafc", borderRadius: "6px", border: "1px dashed #cbd5e1", marginBottom: "12px" }}>
                                            <ECISymbolIcon symbol={newPartySymbol} size={32} />
                                            <div>
                                                <span style={{ fontSize: "11px", fontWeight: "600", color: "#1e3a8a", display: "block" }}>Graphic Preview</span>
                                                <span style={{ fontSize: "10px", color: "#64748b" }}>Official ECI Allotment Vector</span>
                                            </div>
                                        </div>
                                    )}

                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Central Office / Contact Information</label>
                                    <input 
                                        type="text" 
                                        value={newPartyContact} 
                                        onChange={e => setNewPartyContact(e.target.value)} 
                                        placeholder="Address, Phone, or Official Email" 
                                        style={{ width: "100%", padding: "9px 12px", marginBottom: "18px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12.5px" }} 
                                    />
                                    
                                    <button 
                                        type="submit" 
                                        className="primary-btn" 
                                        style={{ width: "100%", background: "#1e3a8a", padding: "10px", fontSize: "13px" }}
                                    >
                                        Register Political Party
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. ELECTORAL ROLL APPROVALS */}
                {activeTab === "voters" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>OFFICIAL ELECTORAL REGISTRY</span>
                                <h1>National Electoral Roll of India</h1>
                                <p>Statutory pan-India electoral roll repository encompassing registered electors across all 28 States and 8 Union Territories with verified EPIC credentials and blockchain cryptographic authorization.</p>
                            </div>
                        </div>

                        {duplicates && (duplicates.emails.length > 0 || duplicates.wallets.length > 0) && (
                            <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "20px", borderRadius: "16px", margin: "0 0 25px" }}>
                                <h3 style={{ color: "#b45309", margin: "0 0 10px" }}>Duplicate Registration Warning</h3>
                                <p style={{ fontSize: "14px", color: "#b45309" }}>The automated detection check identified duplicate records:</p>
                                <ul style={{ fontSize: "13px", color: "#b45309" }}>
                                    {duplicates.emails.map((e, idx) => <li key={idx}>Duplicate Email: <code>{e.email}</code> ({e.count} occurrences)</li>)}
                                    {duplicates.wallets.map((w, idx) => <li key={idx}>Duplicate Wallet: <code>{w.wallet_address}</code> ({w.count} occurrences)</li>)}
                                </ul>
                            </div>
                        )}

                        {/* NATIONAL COVERAGE STATS TILES */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
                            <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #1e3a8a" }}>
                                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>National Electors</span>
                                <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0f172a" }}>{voterList.length}</h2>
                                <span style={{ fontSize: "11px", color: "#1e3a8a" }}>All 36 States & UTs</span>
                            </div>
                            <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #16a34a" }}>
                                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Verified Electors</span>
                                <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#16a34a" }}>{voterList.filter(v => v.is_verified).length}</h2>
                                <span style={{ fontSize: "11px", color: "#16a34a" }}>Scrutiny Approved</span>
                            </div>
                            <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b" }}>
                                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Pending Scrutiny</span>
                                <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#f59e0b" }}>{voterList.filter(v => !v.is_verified).length}</h2>
                                <span style={{ fontSize: "11px", color: "#f59e0b" }}>Awaiting RO Verification</span>
                            </div>
                            <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #6366f1" }}>
                                <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Jurisdictions Covered</span>
                                <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#6366f1" }}>36</h2>
                                <span style={{ fontSize: "11px", color: "#6366f1" }}>28 States • 8 UTs</span>
                            </div>
                        </div>

                        {/* SEARCH & FILTER CONTROLS */}
                        <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr auto", gap: "12px", alignItems: "center" }}>
                                <input 
                                    type="text" 
                                    placeholder="Search by elector name, EPIC Voter ID, phone, email, state, or address..." 
                                    value={voterSearch} 
                                    onChange={e => { setVoterSearch(e.target.value); setVoterPage(1); }} 
                                    style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                                />
                                <select 
                                    value={voterStateFilter} 
                                    onChange={e => { setVoterStateFilter(e.target.value); setVoterPage(1); }} 
                                    style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", background: "white" }}
                                >
                                    <option value="ALL">All States & UTs (Complete Nation)</option>
                                    {ALL_INDIAN_STATES.map((st, idx) => (
                                        <option key={idx} value={st}>{st}</option>
                                    ))}
                                </select>
                                <select 
                                    value={voterStatusFilter} 
                                    onChange={e => { setVoterStatusFilter(e.target.value); setVoterPage(1); }} 
                                    style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", background: "white" }}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="VERIFIED">Verified Only</option>
                                    <option value="PENDING">Pending Scrutiny Only</option>
                                    <option value="ACTIVE">Active Accounts</option>
                                    <option value="LOCKED">Suspended / Locked</option>
                                </select>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button 
                                        type="button"
                                        onClick={() => setShowStateSummary(!showStateSummary)} 
                                        className="secondary-btn-sm" 
                                        style={{ whiteSpace: "nowrap", padding: "9px 12px", fontSize: "12px" }}
                                    >
                                        {showStateSummary ? "Hide State Summary" : "State Summary"}
                                    </button>
                                    <a 
                                        href={`http://localhost:5000/api/voters/export?token=${localStorage.getItem("token") || ""}`} 
                                        download 
                                        className="primary-btn-sm" 
                                        style={{ textDecoration: "none", whiteSpace: "nowrap", padding: "9px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center" }}
                                    >
                                        Export CSV
                                    </a>
                                </div>
                            </div>

                            {/* STATE DISTRIBUTION SUMMARY (COLLAPSIBLE) */}
                            {showStateSummary && (
                                <div style={{ marginTop: "18px", paddingTop: "15px", borderTop: "1px solid #f1f5f9" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155", textTransform: "uppercase" }}>Voter Distribution by State / UT (Click to Filter)</span>
                                        {voterStateFilter !== "ALL" && (
                                            <button 
                                                onClick={() => setVoterStateFilter("ALL")} 
                                                style={{ fontSize: "11px", color: "#1e3a8a", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                                            >
                                                Reset to All States
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
                                        {ALL_INDIAN_STATES.map((st, idx) => {
                                            const count = voterList.filter(v => 
                                                (v.address && v.address.toLowerCase().includes(st.toLowerCase())) ||
                                                (v.constituency_name && v.constituency_name.toLowerCase().includes(st.toLowerCase())) ||
                                                (v.state_name && v.state_name.toLowerCase().includes(st.toLowerCase()))
                                            ).length;
                                            const isSelected = voterStateFilter === st;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => { setVoterStateFilter(isSelected ? "ALL" : st); setVoterPage(1); }}
                                                    style={{
                                                        padding: "6px 8px",
                                                        borderRadius: "6px",
                                                        border: isSelected ? "1px solid #1e3a8a" : "1px solid #e2e8f0",
                                                        background: isSelected ? "#1e3a8a" : count > 0 ? "#f8fafc" : "#fafafa",
                                                        color: isSelected ? "white" : count > 0 ? "#0f172a" : "#94a3b8",
                                                        fontSize: "11px",
                                                        textAlign: "left",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{st}</span>
                                                    <span style={{ 
                                                        background: isSelected ? "rgba(255,255,255,0.2)" : count > 0 ? "#e2e8f0" : "#f1f5f9", 
                                                        padding: "1px 5px", 
                                                        borderRadius: "4px", 
                                                        fontSize: "10px", 
                                                        fontWeight: "700" 
                                                    }}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* FILTER ACTIVE STATUS BANNER */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", fontSize: "12px", color: "#64748b" }}>
                                <span>
                                    Displaying <strong>{filteredVoters.length}</strong> of <strong>{voterList.length}</strong> electors across the nation
                                    {voterStateFilter !== "ALL" && ` in ${voterStateFilter}`}
                                    {voterStatusFilter !== "ALL" && ` (${voterStatusFilter})`}
                                    {voterSearch && ` matching "${voterSearch}"`}
                                </span>
                                {(voterSearch || voterStateFilter !== "ALL" || voterStatusFilter !== "ALL") && (
                                    <button 
                                        onClick={() => { setVoterSearch(""); setVoterStateFilter("ALL"); setVoterStatusFilter("ALL"); setVoterPage(1); }}
                                        style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ELECTORAL ROLL TABLE */}
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>Elector Details</th>
                                    <th>EPIC Voter ID</th>
                                    <th>Jurisdiction & State Address</th>
                                    <th>Blockchain Wallet</th>
                                    <th>Scrutiny Status</th>
                                    <th>Account</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVoters.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                            No electors match the selected state, filter, or search query.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedVoters.map(v => (
                                        <tr key={v.id}>
                                            {editingVoterId === v.id ? (
                                                <>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            value={editVoterName} 
                                                            onChange={e => setEditVoterName(e.target.value)} 
                                                            style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                                                        />
                                                        <input 
                                                            type="email" 
                                                            value={editVoterEmail} 
                                                            onChange={e => setEditVoterEmail(e.target.value)} 
                                                            style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px", margin: "4px 0", width: "100%" }}
                                                        />
                                                        <input 
                                                            type="text" 
                                                            value={editVoterPhone} 
                                                            onChange={e => setEditVoterPhone(e.target.value)} 
                                                            placeholder="Phone"
                                                            style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <code style={{ fontSize: "12px" }}>{v.voter_id || "Unassigned"}</code>
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            value={editVoterAddress} 
                                                            onChange={e => setEditVoterAddress(e.target.value)} 
                                                            placeholder="Address & State"
                                                            style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <code style={{ fontSize: "11px", color: "#64748b" }}>
                                                            {v.wallet_address ? `${v.wallet_address.slice(0, 8)}...${v.wallet_address.slice(-6)}` : "None"}
                                                        </code>
                                                    </td>
                                                    <td>
                                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={editVoterVerified} 
                                                                onChange={e => setEditVoterVerified(e.target.checked)} 
                                                            />
                                                            Verified
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={editVoterActive} 
                                                                onChange={e => setEditVoterActive(e.target.checked)} 
                                                            />
                                                            Active
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: "6px" }}>
                                                            <button onClick={() => updateVoterDetails(v.id)} className="primary-btn" style={{ background: "#22c55e", padding: "4px 8px", fontSize: "11px", width: "auto" }}>Save</button>
                                                            <button onClick={() => setEditingVoterId(null)} className="primary-btn" style={{ background: "#64748b", padding: "4px 8px", fontSize: "11px", width: "auto" }}>Cancel</button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <strong>{v.name}</strong>
                                                        <div style={{ fontSize: "12px", color: "#475569" }}>{v.email}</div>
                                                        {v.phone && <div style={{ fontSize: "11px", color: "#64748b" }}>Phone: {v.phone}</div>}
                                                        {v.dob && <div style={{ fontSize: "11px", color: "#64748b" }}>DOB: {format12HourDate(v.dob)}</div>}
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            fontFamily: "monospace", 
                                                            fontWeight: "700", 
                                                            background: "#f1f5f9", 
                                                            padding: "3px 7px", 
                                                            borderRadius: "4px", 
                                                            color: "#1e3a8a",
                                                            fontSize: "12px",
                                                            border: "1px solid #cbd5e1"
                                                        }}>
                                                            {v.voter_id || "PENDING"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>
                                                            {v.constituency_name || "National General"}
                                                        </div>
                                                        <div style={{ fontSize: "12px", color: "#475569", marginTop: "2px" }}>
                                                            {v.address || "State unassigned"}{v.state_name && !(v.address || "").toLowerCase().includes(v.state_name.toLowerCase()) ? ` • ${v.state_name}` : ""}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <code style={{ fontSize: "11px", background: "#f8fafc", padding: "2px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }} title={v.wallet_address}>
                                                            {v.wallet_address ? `${v.wallet_address.slice(0, 6)}...${v.wallet_address.slice(-4)}` : "Not Linked"}
                                                        </code>
                                                    </td>
                                                    <td>
                                                        <span className={`status-tag ${v.is_verified ? "active" : "ended"}`}>
                                                            {v.is_verified ? "VERIFIED" : "PENDING"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-tag ${v.is_active ? "active" : "ended"}`}>
                                                            {v.is_active ? "Active" : "Locked"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                            {!v.is_verified && (
                                                                <button className="primary-btn" style={{ padding: "4px 8px", fontSize: "11px", width: "auto" }} onClick={() => updateVoterRecord(v.id, { is_verified: true, status: "VERIFIED" })}>
                                                                    Verify
                                                                </button>
                                                            )}
                                                            {v.is_active ? (
                                                                <button className="primary-btn" style={{ padding: "4px 8px", fontSize: "11px", background: "#ef4444", width: "auto" }} onClick={() => updateVoterRecord(v.id, { is_active: false })}>
                                                                    Lock
                                                                </button>
                                                            ) : (
                                                                <button className="primary-btn" style={{ padding: "4px 8px", fontSize: "11px", background: "#10b981", width: "auto" }} onClick={() => updateVoterRecord(v.id, { is_active: true })}>
                                                                    Unlock
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingVoterId(v.id);
                                                                    setEditVoterName(v.name || "");
                                                                    setEditVoterEmail(v.email || "");
                                                                    setEditVoterPhone(v.phone || "");
                                                                    setEditVoterAddress(v.address || "");
                                                                    setEditVoterVerified(v.is_verified || false);
                                                                    setEditVoterActive(v.is_active || false);
                                                                }}
                                                                className="primary-btn" 
                                                                style={{ background: "#1e3a8a", padding: "4px 8px", fontSize: "11px", width: "auto" }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteVoter(v.id)}
                                                                className="primary-btn" 
                                                                style={{ background: "#dc2626", padding: "4px 8px", fontSize: "11px", width: "auto" }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* PAGINATION CONTROLS */}
                        {filteredVoters.length > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", padding: "15px 20px", background: "white", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>
                                    Showing <strong>{(voterPage - 1) * voterPageSize + 1}</strong> to <strong>{Math.min(voterPage * voterPageSize, filteredVoters.length)}</strong> of <strong>{filteredVoters.length}</strong> electors
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                                        <span>Per page:</span>
                                        <select 
                                            value={voterPageSize} 
                                            onChange={e => { setVoterPageSize(Number(e.target.value)); setVoterPage(1); }}
                                            style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "white" }}
                                        >
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                            <option value={200}>200</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button 
                                            disabled={voterPage <= 1}
                                            onClick={() => setVoterPage(1)}
                                            className="secondary-btn-sm"
                                            style={{ opacity: voterPage <= 1 ? 0.5 : 1, cursor: voterPage <= 1 ? "not-allowed" : "pointer" }}
                                        >
                                            First
                                        </button>
                                        <button 
                                            disabled={voterPage <= 1}
                                            onClick={() => setVoterPage(p => Math.max(1, p - 1))}
                                            className="secondary-btn-sm"
                                            style={{ opacity: voterPage <= 1 ? 0.5 : 1, cursor: voterPage <= 1 ? "not-allowed" : "pointer" }}
                                        >
                                            Previous
                                        </button>
                                        <span style={{ display: "flex", alignItems: "center", padding: "0 10px", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                                            Page {voterPage} of {totalVoterPages}
                                        </span>
                                        <button 
                                            disabled={voterPage >= totalVoterPages}
                                            onClick={() => setVoterPage(p => Math.min(totalVoterPages, p + 1))}
                                            className="secondary-btn-sm"
                                            style={{ opacity: voterPage >= totalVoterPages ? 0.5 : 1, cursor: voterPage >= totalVoterPages ? "not-allowed" : "pointer" }}
                                        >
                                            Next
                                        </button>
                                        <button 
                                            disabled={voterPage >= totalVoterPages}
                                            onClick={() => setVoterPage(totalVoterPages)}
                                            className="secondary-btn-sm"
                                            style={{ opacity: voterPage >= totalVoterPages ? 0.5 : 1, cursor: voterPage >= totalVoterPages ? "not-allowed" : "pointer" }}
                                        >
                                            Last
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 9.5. VOTER ELECTORAL SERVICES & FORM 8 */}
                {activeTab === "voter_services" && (() => {
                    const filteredServices = voterServices.filter(s => {
                        const matchesType = voterServiceFilter === "ALL" || s.request_type === voterServiceFilter;
                        const matchesStatus = voterServiceStatusFilter === "ALL" || s.status === voterServiceStatusFilter;
                        const q = (voterServiceSearchQuery || "").trim().toLowerCase();
                        const matchesSearch = !q || 
                            (s.elector_name && s.elector_name.toLowerCase().includes(q)) || 
                            (s.elector_epic && s.elector_epic.toLowerCase().includes(q)) || 
                            (s.category && s.category.toLowerCase().includes(q));
                        return matchesType && matchesStatus && matchesSearch;
                    });

                    return (
                        <div className="admin-page">
                            <div className="admin-header">
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", color: "#0284c7", textTransform: "uppercase" }}>ELECTORAL REGISTRATION CONSOLE</span>
                                    <h1>Electoral Services, Form 8 & Saksham Requests</h1>
                                    <p>Statutory review and approval portal for voter roll modifications, address shifts, replacement e-EPIC cards, and polling booth assistance.</p>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button 
                                        onClick={loadVoterServices}
                                        className="primary-btn"
                                        style={{ background: "#0284c7", padding: "8px 16px", fontSize: "12px", width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <IconRefresh size={14} /> Refresh Applications
                                    </button>
                                </div>
                            </div>

                            {/* TELEMETRY METRICS */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #1e3a8a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600" }}>Total Requests</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0f172a" }}>{voterServices.length}</h2>
                                    <span style={{ fontSize: "11px", color: "#1e3a8a" }}>All categories logged</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600" }}>Pending Action</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#f59e0b" }}>{voterServices.filter(s => s.status === "SUBMITTED").length}</h2>
                                    <span style={{ fontSize: "11px", color: "#f59e0b" }}>Awaiting ERO review</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #0284c7" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600" }}>Under Scrutiny</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0284c7" }}>{voterServices.filter(s => s.status === "UNDER_REVIEW").length}</h2>
                                    <span style={{ fontSize: "11px", color: "#0284c7" }}>Assigned to BLO</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #16a34a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600" }}>Approved & Applied</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#16a34a" }}>{voterServices.filter(s => s.status === "APPROVED").length}</h2>
                                    <span style={{ fontSize: "11px", color: "#16a34a" }}>Integrated into roll</span>
                                </div>
                            </div>

                            {/* FILTERS */}
                            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px", background: "white", padding: "16px 20px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <div style={{ flex: "1 1 200px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Filter by Type</label>
                                    <select
                                        value={voterServiceFilter}
                                        onChange={e => setVoterServiceFilter(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                                    >
                                        <option value="ALL">All Application Types</option>
                                        <option value="FORM_8_CORRECTION">Form 8 (Roll Correction)</option>
                                        <option value="FORM_8_SHIFT">Form 8 (Address Relocation)</option>
                                        <option value="SAKSHAM_ASSISTANCE">Saksham (PwD / Senior Assistance)</option>
                                        <option value="EPIC_REPLACEMENT">EPIC Card Replacement</option>
                                    </select>
                                </div>
                                <div style={{ flex: "1 1 180px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Filter by Status</label>
                                    <select
                                        value={voterServiceStatusFilter}
                                        onChange={e => setVoterServiceStatusFilter(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="SUBMITTED">SUBMITTED</option>
                                        <option value="UNDER_REVIEW">UNDER REVIEW</option>
                                        <option value="APPROVED">APPROVED</option>
                                        <option value="REJECTED">REJECTED</option>
                                    </select>
                                </div>
                                <div style={{ flex: "2 1 260px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Search Elector / EPIC</label>
                                    <input 
                                        type="text"
                                        placeholder="Search by elector name, EPIC number, or category..."
                                        value={voterServiceSearchQuery}
                                        onChange={e => setVoterServiceSearchQuery(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                    />
                                </div>
                            </div>

                            {/* TABLE */}
                            <div className="card">
                                <h3>Received E-Services & Form 8 Applications ({filteredServices.length})</h3>
                                <div style={{ overflowX: "auto", marginTop: "15px" }}>
                                    <table className="audit-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Elector Details</th>
                                                <th>Type & Category</th>
                                                <th>Submitted Modification Data</th>
                                                <th>Status</th>
                                                <th>Date Logged</th>
                                                <th>Statutory Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredServices.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b", fontStyle: "italic" }}>
                                                        No applications match the current criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredServices.map(s => {
                                                    const d = typeof s.details === "string" ? JSON.parse(s.details) : s.details;
                                                    return (
                                                        <tr key={s.id}>
                                                            <td><code>#{s.id}</code></td>
                                                            <td>
                                                                <div style={{ fontWeight: "700", color: "#0f172a" }}>{s.elector_name}</div>
                                                                <div style={{ fontSize: "11px", color: "#64748b" }}>EPIC: <strong>{s.elector_epic || "Pending"}</strong></div>
                                                                <div style={{ fontSize: "11px", color: "#64748b" }}>Phone: {s.elector_phone || "N/A"}</div>
                                                            </td>
                                                            <td>
                                                                <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", display: "inline-block", marginBottom: "3px" }}>
                                                                    {s.request_type}
                                                                </span>
                                                                <div style={{ fontSize: "12px", color: "#334155" }}>{s.category}</div>
                                                            </td>
                                                            <td>
                                                                <div style={{ fontSize: "11.5px", color: "#475569", maxWidth: "260px", background: "#f8fafc", padding: "6px 8px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                                                                    {d.name && <div><strong>Name:</strong> {d.name}</div>}
                                                                    {d.address && <div><strong>Address:</strong> {d.address} ({d.pincode})</div>}
                                                                    {d.phone && <div><strong>Phone:</strong> {d.phone}</div>}
                                                                    {d.disability_type && <div><strong>Assistance:</strong> {d.disability_type}</div>}
                                                                    {d.reason && <div><strong>Reason:</strong> {d.reason}</div>}
                                                                    {s.admin_notes && <div style={{ color: "#166534", marginTop: "4px" }}><strong>Notes:</strong> {s.admin_notes}</div>}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span>
                                                            </td>
                                                            <td style={{ fontSize: "11.5px", color: "#64748b" }}>
                                                                {format12HourDateTime(s.created_at)}
                                                            </td>
                                                            <td>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                                    {s.status !== "APPROVED" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateVoterService(s.id, "APPROVED", true)}
                                                                            style={{ background: "#16a34a", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                                                                        >
                                                                            Approve & Apply to DB
                                                                        </button>
                                                                    )}
                                                                    {s.status === "SUBMITTED" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateVoterService(s.id, "UNDER_REVIEW", false)}
                                                                            style={{ background: "#0284c7", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                                                                        >
                                                                            Mark Under Review
                                                                        </button>
                                                                    )}
                                                                    {s.status !== "REJECTED" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateVoterService(s.id, "REJECTED", false)}
                                                                            style={{ background: "transparent", border: "1px solid #fca5a5", color: "#dc2626", padding: "3px 6px", borderRadius: "4px", cursor: "pointer", fontSize: "10.5px" }}
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* 10. CANDIDATES NOMINATION */}
                {activeTab === "candidates" && (() => {
                    const filteredCandidates = allCandidates.filter(c => {
                        const matchesElection = candidateElectionFilter === "ALL" || String(c.election_id) === String(candidateElectionFilter);
                        const matchesParty = candidatePartyFilter === "ALL" || c.party === candidatePartyFilter;
                        const q = candidateSearchQuery.trim().toLowerCase();
                        const matchesSearch = !q || (c.name && c.name.toLowerCase().includes(q)) || (c.party && c.party.toLowerCase().includes(q)) || (c.symbol && c.symbol.toLowerCase().includes(q)) || (c.election_title && c.election_title.toLowerCase().includes(q));
                        return matchesElection && matchesParty && matchesSearch;
                    });

                    const uniqueParties = Array.from(new Set(allCandidates.map(c => c.party).filter(Boolean)));
                    const uniqueElectionsCount = new Set(allCandidates.map(c => c.election_id).filter(Boolean)).size;

                    return (
                        <div className="admin-page">
                            <div className="admin-header">
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", color: "#0284c7", textTransform: "uppercase" }}>STATUTORY NOMINATIONS & SCRUTINY</span>
                                    <h1>Electoral Candidates Directory & Scrutiny Portal</h1>
                                    <p>Statutory register of certified contesting candidates, reserved election symbols, and blockchain nomination credentials across all parliamentary constituencies.</p>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button 
                                        onClick={loadAllCandidates}
                                        className="primary-btn"
                                        style={{ background: "#0284c7", padding: "8px 16px", fontSize: "12px", width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <IconRefresh size={14} /> Refresh Directory
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (elections.length > 0 && !newCandElectionId) {
                                                setNewCandElectionId(elections[0].id);
                                            }
                                            setShowCandidateNominateModal(true);
                                        }}
                                        className="primary-btn"
                                        style={{ background: "#16a34a", padding: "8px 16px", fontSize: "12px", width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                    >
                                        Nominate New Candidate
                                    </button>
                                </div>
                            </div>

                            {/* TELEMETRY CARDS */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #1e3a8a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Total Nominated</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0f172a" }}>{allCandidates.length}</h2>
                                    <span style={{ fontSize: "11px", color: "#1e3a8a" }}>Across all registered polls</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #0284c7" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Contesting Parties</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0284c7" }}>{uniqueParties.length}</h2>
                                    <span style={{ fontSize: "11px", color: "#0284c7" }}>Recognized national & state</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #16a34a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Active Elections</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#16a34a" }}>{uniqueElectionsCount}</h2>
                                    <span style={{ fontSize: "11px", color: "#16a34a" }}>Elections with candidates</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Filtered View</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#f59e0b" }}>{filteredCandidates.length}</h2>
                                    <span style={{ fontSize: "11px", color: "#f59e0b" }}>Matches current criteria</span>
                                </div>
                            </div>

                            {/* FILTER AND SEARCH BAR */}
                            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px", background: "white", padding: "16px 20px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <div style={{ flex: "1 1 250px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Filter by Election</label>
                                    <select
                                        value={candidateElectionFilter}
                                        onChange={e => setCandidateElectionFilter(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                                    >
                                        <option value="ALL">All Elections ({elections.length} Total)</option>
                                        {elections.map(el => (
                                            <option key={el.id} value={el.id}>
                                                #{el.id} - {el.title} [{el.status}]
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: "1 1 200px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Filter by Political Party</label>
                                    <select
                                        value={candidatePartyFilter}
                                        onChange={e => setCandidatePartyFilter(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                                    >
                                        <option value="ALL">All Parties</option>
                                        {uniqueParties.map((p, idx) => (
                                            <option key={idx} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: "2 1 300px" }}>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", textTransform: "uppercase" }}>Search Candidates</label>
                                    <input
                                        type="text"
                                        placeholder="Search candidate by name, party, symbol, or election..."
                                        value={candidateSearchQuery}
                                        onChange={e => setCandidateSearchQuery(e.target.value)}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                    />
                                </div>
                            </div>

                            {/* CANDIDATES TABLE / LIST */}
                            <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                {candidateLoading ? (
                                    <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading candidate register from smart contracts...</div>
                                ) : filteredCandidates.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>No candidates found matching the selected filters.</div>
                                        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 15px" }}>Try selecting another election or nominating a new candidate.</p>
                                        <button 
                                            onClick={() => { setCandidateElectionFilter("ALL"); setCandidatePartyFilter("ALL"); setCandidateSearchQuery(""); }}
                                            className="secondary-btn-sm"
                                        >
                                            Reset Search Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: "auto" }}>
                                        <table className="audit-table">
                                            <thead>
                                                <tr>
                                                    <th>Candidate</th>
                                                    <th>Party & Symbol</th>
                                                    <th>Contesting Election</th>
                                                    <th>Manifesto / Declaration</th>
                                                    <th>Scrutiny Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCandidates.map(c => (
                                                    <tr key={c.id}>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #cbd5e1", flexShrink: 0 }}>
                                                                    {c.symbol ? <ECISymbolIcon symbol={c.symbol} size={24} /> : <div style={{ fontWeight: "700", color: "#1e3a8a", fontSize: "14px" }}>{c.name ? c.name.charAt(0) : "C"}</div>}
                                                                </div>
                                                                <div>
                                                                    <strong style={{ fontSize: "14px", color: "#0f172a" }}>{c.name}</strong>
                                                                    <div style={{ fontSize: "11px", color: "#64748b" }}>Candidate ID: #{c.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "13px" }}>{c.party || "Independent"}</div>
                                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#0284c7", background: "#f0f9ff", padding: "2px 6px", borderRadius: "4px", marginTop: "2px" }}>
                                                                Symbol: {c.symbol || "Unreserved"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>{c.election_title || `Election #${c.election_id}`}</div>
                                                            <span className={`status-badge ${(c.election_status || "upcoming").toLowerCase()}`} style={{ fontSize: "10px", marginTop: "3px", display: "inline-block" }}>
                                                                {c.election_status || "UPCOMING"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: "12px", color: "#475569", maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                {c.manifesto || "Official manifesto submitted to Returning Officer."}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                                                                <IconCheck size={12} /> SCRUTINY PASSED
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: "flex", gap: "6px" }}>
                                                                <button 
                                                                    className="secondary-btn-sm"
                                                                    onClick={() => setSelectedCandidateDetail(c)}
                                                                    style={{ padding: "4px 8px", fontSize: "11px" }}
                                                                >
                                                                    View Details
                                                                </button>
                                                                <button 
                                                                    className="secondary-btn-sm"
                                                                    onClick={() => handleDeleteCandidateNomination(c.id, c.name)}
                                                                    style={{ padding: "4px 8px", fontSize: "11px", color: "#dc2626", borderColor: "#fecaca" }}
                                                                >
                                                                    Withdraw
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* CANDIDATE DETAIL MODAL */}
                            {selectedCandidateDetail && (
                                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                                    <div style={{ background: "white", borderRadius: "12px", padding: "28px", maxWidth: "560px", width: "100%", border: "1px solid #cbd5e1", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0284c7" }}>
                                                    {selectedCandidateDetail.symbol ? <ECISymbolIcon symbol={selectedCandidateDetail.symbol} size={32} /> : <div style={{ fontWeight: "700", fontSize: "18px", color: "#1e3a8a" }}>{selectedCandidateDetail.name.charAt(0)}</div>}
                                                </div>
                                                <div>
                                                    <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{selectedCandidateDetail.name}</h2>
                                                    <div style={{ fontSize: "12px", color: "#64748b" }}>Party: <strong>{selectedCandidateDetail.party}</strong> • Symbol: <strong>{selectedCandidateDetail.symbol}</strong></div>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedCandidateDetail(null)} style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>&times;</button>
                                        </div>
                                        <div style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px", fontSize: "12px" }}>
                                            <div><strong>Election:</strong> {selectedCandidateDetail.election_title} (ID #{selectedCandidateDetail.election_id})</div>
                                            <div style={{ marginTop: "4px" }}><strong>Status:</strong> {selectedCandidateDetail.election_status}</div>
                                            <div style={{ marginTop: "4px" }}><strong>Education:</strong> {selectedCandidateDetail.education || "Graduate"}</div>
                                            <div style={{ marginTop: "4px" }}><strong>Declared Assets:</strong> {selectedCandidateDetail.total_assets || "Disclosed in Form 26"}</div>
                                            <div style={{ marginTop: "4px" }}><strong>Declared Liabilities:</strong> {selectedCandidateDetail.total_liabilities || "Nil"}</div>
                                            <div style={{ marginTop: "4px" }}><strong>Criminal Cases:</strong> {Number(selectedCandidateDetail.criminal_cases_count) > 0 ? `${selectedCandidateDetail.criminal_cases_count} Case(s)` : "None (Clean Record)"}</div>
                                            <div style={{ marginTop: "4px" }}><strong>Blockchain Verification:</strong> Cryptographically logged on Hardhat node</div>
                                        </div>
                                        <div style={{ marginBottom: "20px" }}>
                                            <h4 style={{ margin: "0 0 6px", fontSize: "13px", color: "#334155" }}>Official Manifesto & Declarations:</h4>
                                            <div style={{ padding: "12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", color: "#475569", lineHeight: "1.5", maxHeight: "180px", overflowY: "auto" }}>
                                                {selectedCandidateDetail.manifesto || "No manifesto declaration submitted."}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                            <button className="primary-btn-sm" onClick={() => setSelectedCandidateDetail(null)}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* NOMINATE CANDIDATE MODAL */}
                            {showCandidateNominateModal && (
                                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                                    <div style={{ background: "white", borderRadius: "12px", padding: "28px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid #cbd5e1", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                                            <h2 style={{ margin: 0, fontSize: "17px", color: "#0f172a" }}>Nominate New Candidate (Form 26 KYC)</h2>
                                            <button onClick={() => setShowCandidateNominateModal(false)} style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>&times;</button>
                                        </div>
                                        <form onSubmit={handleCreateCandidateNomination}>
                                            <div style={{ marginBottom: "14px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Contesting Election *</label>
                                                <select 
                                                    value={newCandElectionId} 
                                                    onChange={e => setNewCandElectionId(e.target.value)}
                                                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                                                    required
                                                >
                                                    <option value="">Select Election</option>
                                                    {elections.map(el => (
                                                        <option key={el.id} value={el.id}>
                                                             #{el.id} - {el.title} [{el.status}]
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ marginBottom: "14px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Candidate Full Name *</label>
                                                <input 
                                                    type="text"
                                                    placeholder="Enter full legal name of candidate"
                                                    value={newCandName}
                                                    onChange={e => setNewCandName(e.target.value)}
                                                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                                    required
                                                />
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Political Party</label>
                                                    <select 
                                                        value={newCandParty} 
                                                        onChange={e => {
                                                            setNewCandParty(e.target.value);
                                                            const p = parties.find(party => party.name === e.target.value);
                                                            if (p) setNewCandSymbol(p.symbol);
                                                        }}
                                                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                                                    >
                                                        <option value="">Select Party or Independent</option>
                                                        <option value="Independent">Independent (IND)</option>
                                                        {parties.map(p => (
                                                            <option key={p.id} value={p.name}>{p.name} ({p.abbreviation || "Party"})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Election Symbol</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="e.g. LOTUS, HAND, ELEPHANT"
                                                        value={newCandSymbol}
                                                        onChange={e => setNewCandSymbol(e.target.value)}
                                                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Highest Education</label>
                                                    <select 
                                                        value={newCandEducation} 
                                                        onChange={e => setNewCandEducation(e.target.value)}
                                                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "white" }}
                                                    >
                                                        <option value="Doctorate (Ph.D.)">Doctorate (Ph.D.)</option>
                                                        <option value="Post Graduate">Post Graduate</option>
                                                        <option value="Graduate (Professional)">Graduate (Professional)</option>
                                                        <option value="Graduate">Graduate</option>
                                                        <option value="12th Pass">12th Pass</option>
                                                        <option value="10th Pass">10th Pass</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Declared Total Assets</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="e.g. ₹2.45 Crore"
                                                        value={newCandAssets}
                                                        onChange={e => setNewCandAssets(e.target.value)}
                                                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Declared Total Liabilities</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="e.g. ₹15 Lakhs or Nil"
                                                        value={newCandLiabilities}
                                                        onChange={e => setNewCandLiabilities(e.target.value)}
                                                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Criminal Cases Count</label>
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        placeholder="0 if clean record"
                                                        value={newCandCriminalCases}
                                                        onChange={e => setNewCandCriminalCases(e.target.value)}
                                                        style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: "14px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Affidavit Summary / Remarks</label>
                                                <input 
                                                    type="text"
                                                    placeholder="e.g. Form 26 sworn before Oath Commissioner, verified by RO"
                                                    value={newCandAffidavit}
                                                    onChange={e => setNewCandAffidavit(e.target.value)}
                                                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: "20px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>Manifesto / Policy Declarations</label>
                                                <textarea 
                                                    rows="3"
                                                    placeholder="Enter candidate's manifesto summary and commitments..."
                                                    value={newCandManifesto}
                                                    onChange={e => setNewCandManifesto(e.target.value)}
                                                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "vertical" }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                                <button type="button" className="secondary-btn-sm" onClick={() => setShowCandidateNominateModal(false)}>Cancel</button>
                                                <button type="submit" disabled={candidateSubmitting} className="primary-btn" style={{ width: "auto", padding: "8px 18px", fontSize: "13px" }}>
                                                    {candidateSubmitting ? "Registering on Blockchain..." : "Submit Nomination"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* 11. VOTER AUTHORIZATION SHORTCUT */}
                {activeTab === "voter_authorization" && (() => {
                    const selectedElectionObj = elections.find(e => String(e.id) === String(authElectionId)) || elections[0];

                    const filteredAuthVoters = authVoters.filter(v => {
                        let matchesStatus = true;
                        if (authStatusFilter === "AUTHORIZED") matchesStatus = v.is_authorized;
                        else if (authStatusFilter === "PENDING") matchesStatus = !v.is_authorized;
                        else if (authStatusFilter === "VOTED") matchesStatus = v.has_voted;

                        const q = authSearchQuery.trim().toLowerCase();
                        let matchesSearch = true;
                        if (q) {
                            matchesSearch = 
                                (v.name && v.name.toLowerCase().includes(q)) ||
                                (v.email && v.email.toLowerCase().includes(q)) ||
                                (v.voter_number && v.voter_number.toLowerCase().includes(q)) ||
                                (v.wallet_address && v.wallet_address.toLowerCase().includes(q));
                        }
                        return matchesStatus && matchesSearch;
                    });

                    const totalAuthPages = Math.ceil(filteredAuthVoters.length / authPageSize) || 1;
                    const paginatedAuthVoters = filteredAuthVoters.slice((authPage - 1) * authPageSize, authPage * authPageSize);

                    const authorizedCount = authVoters.filter(v => v.is_authorized).length;
                    const pendingCount = authVoters.filter(v => !v.is_authorized).length;
                    const votedCount = authVoters.filter(v => v.has_voted).length;

                    const isPollActiveOrEnded = selectedElectionObj && (selectedElectionObj.status === "ACTIVE" || selectedElectionObj.status === "ENDED" || selectedElectionObj.status === "RESULTS_PUBLISHED");

                    return (
                        <div className="admin-page">
                            <div className="admin-header">
                                <div>
                                    <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px", color: "#16a34a", textTransform: "uppercase" }}>ELECTORAL ROLL & SMART CONTRACT LEDGER</span>
                                    <h1>Electoral Roll Blockchain Authorization Portal</h1>
                                    <p>Cryptographically authorize eligible electors on the decentralized blockchain voting contract. Only authorized electors can cast a verified on-chain ballot.</p>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button 
                                        onClick={() => loadVoterAuthList(authElectionId)}
                                        className="primary-btn"
                                        style={{ background: "#0284c7", padding: "8px 16px", fontSize: "12px", width: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <IconRefresh size={14} /> Refresh Roll State
                                    </button>
                                    <button 
                                        onClick={() => handleBatchAuthorizeVoters(authElectionId)}
                                        disabled={batchAuthLoading || pendingCount === 0 || isPollActiveOrEnded}
                                        className="primary-btn"
                                        style={{ 
                                            background: isPollActiveOrEnded ? "#94a3b8" : "#16a34a", 
                                            padding: "8px 16px", 
                                            fontSize: "12px", 
                                            width: "auto",
                                            opacity: (isPollActiveOrEnded || pendingCount === 0) ? 0.6 : 1,
                                            cursor: (isPollActiveOrEnded || pendingCount === 0) ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {batchAuthLoading ? "Authorizing on Blockchain..." : `Batch Authorize All Pending (${pendingCount})`}
                                    </button>
                                </div>
                            </div>

                            {/* ELECTION SELECTION AND CONTEXT CARD */}
                            <div style={{ background: "white", padding: "18px 24px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "22px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                                    <div style={{ flex: "1 1 340px" }}>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "5px", textTransform: "uppercase" }}>
                                            Select Election for Blockchain Roll Authorization
                                        </label>
                                        <select
                                            value={authElectionId}
                                            onChange={e => {
                                                setAuthElectionId(e.target.value);
                                                setAuthPage(1);
                                                loadVoterAuthList(e.target.value);
                                            }}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #94a3b8", fontSize: "14px", fontWeight: "600", background: "#f8fafc" }}
                                        >
                                            {elections.map(el => (
                                                <option key={el.id} value={el.id}>
                                                    Election #{el.id}: {el.title} [{el.status}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedElectionObj && (
                                        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
                                            <div style={{ padding: "8px 14px", background: "#f1f5f9", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Polling Status</div>
                                                <span className={`status-badge ${(selectedElectionObj.status || "").toLowerCase()}`} style={{ marginTop: "2px", display: "inline-block" }}>
                                                    {selectedElectionObj.status}
                                                </span>
                                            </div>
                                            <div style={{ padding: "8px 14px", background: "#f1f5f9", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Smart Contract</div>
                                                <code style={{ fontSize: "11px", color: "#0f172a" }}>
                                                    {selectedElectionObj.contract_address ? `${selectedElectionObj.contract_address.slice(0, 8)}...${selectedElectionObj.contract_address.slice(-6)}` : "Localhost EVoting"}
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isPollActiveOrEnded ? (
                                    <div style={{ marginTop: "12px", padding: "8px 14px", background: "#eff6ff", borderRadius: "6px", border: "1px solid #bfdbfe", fontSize: "12px", color: "#1e40af" }}>
                                        <strong>Electoral Roll Sealed:</strong> This election is currently {selectedElectionObj.status}. Per Election Commission security rules, voter authorization is finalized and frozen on the blockchain ledger during and after active polling.
                                    </div>
                                ) : (
                                    <div style={{ marginTop: "12px", padding: "8px 14px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0", fontSize: "12px", color: "#166534" }}>
                                        <strong>Authorization Active:</strong> Electors in this roll can be authorized on the smart contract before polling begins. Click "Authorize on Blockchain" for any pending elector or use "Batch Authorize All".
                                    </div>
                                )}
                            </div>

                            {/* TELEMETRY TILES */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #1e3a8a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>National Electors in Registry</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#0f172a" }}>{authVoters.length}</h2>
                                    <span style={{ fontSize: "11px", color: "#1e3a8a" }}>Registered voter accounts</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #16a34a" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Authorized on Blockchain</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#16a34a" }}>{authorizedCount}</h2>
                                    <span style={{ fontSize: "11px", color: "#16a34a" }}>Permitted on smart contract</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Pending Authorization</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#f59e0b" }}>{pendingCount}</h2>
                                    <span style={{ fontSize: "11px", color: "#f59e0b" }}>Awaiting ledger synchronization</span>
                                </div>
                                <div style={{ background: "white", padding: "18px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6" }}>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Ballots Cast (Turnout)</span>
                                    <h2 style={{ fontSize: "26px", margin: "4px 0 0", color: "#3b82f6" }}>{votedCount}</h2>
                                    <span style={{ fontSize: "11px", color: "#3b82f6" }}>Cryptographic votes sealed</span>
                                </div>
                            </div>

                            {/* SEARCH AND STATUS FILTER PILLS */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap", marginBottom: "20px", background: "white", padding: "14px 20px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <button
                                        onClick={() => { setAuthStatusFilter("ALL"); setAuthPage(1); }}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            border: "1px solid",
                                            borderColor: authStatusFilter === "ALL" ? "#1e3a8a" : "#cbd5e1",
                                            background: authStatusFilter === "ALL" ? "#1e3a8a" : "white",
                                            color: authStatusFilter === "ALL" ? "white" : "#475569",
                                            cursor: "pointer"
                                        }}
                                    >
                                        All Electors ({authVoters.length})
                                    </button>
                                    <button
                                        onClick={() => { setAuthStatusFilter("AUTHORIZED"); setAuthPage(1); }}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            border: "1px solid",
                                            borderColor: authStatusFilter === "AUTHORIZED" ? "#16a34a" : "#cbd5e1",
                                            background: authStatusFilter === "AUTHORIZED" ? "#16a34a" : "white",
                                            color: authStatusFilter === "AUTHORIZED" ? "white" : "#475569",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Authorized on Ledger ({authorizedCount})
                                    </button>
                                    <button
                                        onClick={() => { setAuthStatusFilter("PENDING"); setAuthPage(1); }}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            border: "1px solid",
                                            borderColor: authStatusFilter === "PENDING" ? "#f59e0b" : "#cbd5e1",
                                            background: authStatusFilter === "PENDING" ? "#f59e0b" : "white",
                                            color: authStatusFilter === "PENDING" ? "white" : "#475569",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Pending Authorization ({pendingCount})
                                    </button>
                                    <button
                                        onClick={() => { setAuthStatusFilter("VOTED"); setAuthPage(1); }}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            border: "1px solid",
                                            borderColor: authStatusFilter === "VOTED" ? "#3b82f6" : "#cbd5e1",
                                            background: authStatusFilter === "VOTED" ? "#3b82f6" : "white",
                                            color: authStatusFilter === "VOTED" ? "white" : "#475569",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Ballots Cast ({votedCount})
                                    </button>
                                </div>
                                <div style={{ flex: "1 1 300px", maxWidth: "420px" }}>
                                    <input
                                        type="text"
                                        placeholder="Search elector by name, EPIC / Voter ID, email, or wallet..."
                                        value={authSearchQuery}
                                        onChange={e => { setAuthSearchQuery(e.target.value); setAuthPage(1); }}
                                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                                    />
                                </div>
                            </div>

                            {/* COMPLETE ELECTOR DETAILS TABLE */}
                            <div style={{ background: "white", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                {authLoading ? (
                                    <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading complete elector details and blockchain status...</div>
                                ) : filteredAuthVoters.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "40px" }}>
                                        <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 10px" }}>No electors found matching current criteria.</p>
                                        <button 
                                            onClick={() => { setAuthStatusFilter("ALL"); setAuthSearchQuery(""); }}
                                            className="secondary-btn-sm"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: "auto" }}>
                                        <table className="audit-table">
                                            <thead>
                                                <tr>
                                                    <th>Voter ID (EPIC)</th>
                                                    <th>Elector Profile</th>
                                                    <th>Cryptographic Wallet</th>
                                                    <th>Roll Verification</th>
                                                    <th>Blockchain Ledger Status</th>
                                                    <th>Polling Status</th>
                                                    <th>Ledger Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedAuthVoters.map(v => (
                                                    <tr key={v.user_id}>
                                                        <td>
                                                            <span style={{ 
                                                                fontFamily: "monospace", 
                                                                fontWeight: "700", 
                                                                background: "#f1f5f9", 
                                                                padding: "3px 8px", 
                                                                borderRadius: "4px", 
                                                                color: "#1e3a8a", 
                                                                fontSize: "12px", 
                                                                border: "1px solid #cbd5e1" 
                                                            }}>
                                                                {v.voter_number || `ID-${v.user_id}`}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{v.name}</strong>
                                                            <div style={{ fontSize: "12px", color: "#475569" }}>{v.email}</div>
                                                            <div style={{ fontSize: "11px", color: "#64748b" }}>Registered: {v.registered_at ? format12HourDate(v.registered_at) : "Active"}</div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <code style={{ fontSize: "11px", background: "#f8fafc", padding: "3px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }} title={v.wallet_address}>
                                                                    {v.wallet_address ? `${v.wallet_address.slice(0, 6)}...${v.wallet_address.slice(-4)}` : "Wallet Not Linked"}
                                                                </code>
                                                                {v.wallet_address && (
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(v.wallet_address);
                                                                            setCopiedWallet(v.user_id);
                                                                            setTimeout(() => setCopiedWallet(null), 2000);
                                                                        }}
                                                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px", color: copiedWallet === v.user_id ? "#16a34a" : "#64748b" }}
                                                                        title="Copy full cryptographic wallet address"
                                                                    >
                                                                        {copiedWallet === v.user_id ? <IconCheck size={12} /> : <IconCopy size={12} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-tag ${v.is_verified ? "active" : "ended"}`} style={{ fontSize: "10px" }}>
                                                                {v.is_verified ? "VERIFIED" : "UNVERIFIED"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {v.is_authorized ? (
                                                                <div>
                                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                                                                        <IconCheck size={12} /> AUTHORIZED ON CHAIN
                                                                    </span>
                                                                    {v.authorized_at && (
                                                                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>
                                                                            {format12HourDateTime(v.authorized_at)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", background: "#fffbeb", color: "#b45309", border: "1px solid #fef3c7" }}>
                                                                    <IconAlert size={12} /> PENDING AUTHORIZATION
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {v.has_voted ? (
                                                                <div>
                                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                                                                        <IconBallot size={12} /> BALLOT CAST
                                                                    </span>
                                                                    {v.voted_at && (
                                                                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>
                                                                            {format12HourDateTime(v.voted_at)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>
                                                                    Awaiting Polling
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {v.is_authorized ? (
                                                                <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                                    <IconCheck size={12} /> Ledger Synced
                                                                </span>
                                                            ) : isPollActiveOrEnded ? (
                                                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                                                    Roll Locked
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAuthorizeSingleVoter(v.user_id, authElectionId)}
                                                                    disabled={authorizingVoterId === v.user_id}
                                                                    className="primary-btn-sm"
                                                                    style={{ 
                                                                        background: "#16a34a", 
                                                                        padding: "4px 10px", 
                                                                        fontSize: "11px", 
                                                                        width: "auto",
                                                                        whiteSpace: "nowrap"
                                                                    }}
                                                                >
                                                                    {authorizingVoterId === v.user_id ? "Authorizing..." : "Authorize on Blockchain"}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* PAGINATION CONTROLS */}
                                {filteredAuthVoters.length > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", padding: "14px 18px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                        <div style={{ fontSize: "13px", color: "#64748b" }}>
                                            Showing <strong>{(authPage - 1) * authPageSize + 1}</strong> to <strong>{Math.min(authPage * authPageSize, filteredAuthVoters.length)}</strong> of <strong>{filteredAuthVoters.length}</strong> electors
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                                                <span>Per page:</span>
                                                <select 
                                                    value={authPageSize} 
                                                    onChange={e => { setAuthPageSize(Number(e.target.value)); setAuthPage(1); }}
                                                    style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "12px", background: "white" }}
                                                >
                                                    <option value={25}>25</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </select>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button 
                                                    disabled={authPage <= 1}
                                                    onClick={() => setAuthPage(1)}
                                                    className="secondary-btn-sm"
                                                    style={{ opacity: authPage <= 1 ? 0.5 : 1, cursor: authPage <= 1 ? "not-allowed" : "pointer" }}
                                                >
                                                    First
                                                </button>
                                                <button 
                                                    disabled={authPage <= 1}
                                                    onClick={() => setAuthPage(p => Math.max(1, p - 1))}
                                                    className="secondary-btn-sm"
                                                    style={{ opacity: authPage <= 1 ? 0.5 : 1, cursor: authPage <= 1 ? "not-allowed" : "pointer" }}
                                                >
                                                    Previous
                                                </button>
                                                <span style={{ display: "flex", alignItems: "center", padding: "0 10px", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                                                    Page {authPage} of {totalAuthPages}
                                                </span>
                                                <button 
                                                    disabled={authPage >= totalAuthPages}
                                                    onClick={() => setAuthPage(p => Math.min(totalAuthPages, p + 1))}
                                                    className="secondary-btn-sm"
                                                    style={{ opacity: authPage >= totalAuthPages ? 0.5 : 1, cursor: authPage >= totalAuthPages ? "not-allowed" : "pointer" }}
                                                >
                                                    Next
                                                </button>
                                                <button 
                                                    disabled={authPage >= totalAuthPages}
                                                    onClick={() => setAuthPage(totalAuthPages)}
                                                    className="secondary-btn-sm"
                                                    style={{ opacity: authPage >= totalAuthPages ? 0.5 : 1, cursor: authPage >= totalAuthPages ? "not-allowed" : "pointer" }}
                                                >
                                                    Last
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* 12. RECONCILIATION & RESULTS */}
                {activeTab === "results" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>RECONCILIATION & RESULTS</span>
                                <h1>Blockchain Audit & Results Verification</h1>
                                <p>Perform database versus ledger alignment audits and inspect published results.</p>
                            </div>
                        </div>

                        {/* RECONCILIATION BOARD */}
                        <div className="reconciliation-board" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #cbd5e1", marginBottom: "30px" }}>
                            <h2 style={{ margin: "0 0 15px", fontSize: "18px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
                                Blockchain Reconciliation Audit
                                <button className="secondary-btn-sm" onClick={loadReconciliation}>Refresh Reconciliation</button>
                            </h2>
                            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
                                Directly queries active smart contract states on the blockchain node to cross-verify voter tallies against PostgreSQL rows.
                            </p>
                            <table className="audit-table">
                                <thead>
                                    <tr>
                                        <th>Election ID</th>
                                        <th>Election Title</th>
                                        <th>DB State</th>
                                        <th>Blockchain State</th>
                                        <th>PostgreSQL Votes</th>
                                        <th>Blockchain Votes</th>
                                        <th>Audit Mappings</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reconciliation.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: "center", color: "#64748b" }}>No active elections mapped.</td></tr>
                                    ) : (
                                        reconciliation.map(report => (
                                            <tr key={report.id}>
                                                <td>#{report.id}</td>
                                                <td><strong>{report.title}</strong></td>
                                                <td><span className={`status-badge ${report.databaseStatus.toLowerCase()}`}>{report.databaseStatus}</span></td>
                                                <td><span className={`status-badge ${report.blockchainStatus.toLowerCase()}`}>{report.blockchainStatus}</span></td>
                                                <td>{report.databaseVoteCount}</td>
                                                <td>{report.blockchainVoteCount}</td>
                                                <td>
                                                    <span className={`health-badge ${report.matchStatus === "MATCH" ? "online" : "offline"}`} style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                        {report.matchStatus === "MATCH" ? (
                                                            <>
                                                                <IconCheck size={11} color="#16a34a" /> MATCH
                                                            </>
                                                        ) : (
                                                            <>
                                                                <IconAlert size={11} color="#dc2626" /> {report.matchStatus}
                                                            </>
                                                        )}
                                                    </span>
                                                    {report.details && <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>{report.details}</span>}
                                                </td>
                                                <td>
                                                    {report.databaseStatus === "RESULTS_PUBLISHED" ? (
                                                        <button className="primary-btn-sm" onClick={() => {
                                                            const elec = elections.find(e => e.id === report.id);
                                                            if (elec) {
                                                                setSelectedElection(elec);
                                                                loadResults(elec.id);
                                                                setActiveTab("elections");
                                                            }
                                                        }}>View Results</button>
                                                    ) : report.databaseStatus === "ENDED" ? (
                                                        <button className="secondary-btn-sm" onClick={() => {
                                                            const elec = elections.find(e => e.id === report.id);
                                                            if (elec) {
                                                                setSelectedElection(elec);
                                                                setActiveTab("elections");
                                                            }
                                                        }}>Verify & Publish</button>
                                                    ) : (
                                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Election Active</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 13. ANALYTICS ENGINE */}
                {activeTab === "analytics" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>ANALYTICS ENGINE</span>
                                <h1>Python Data Processing Center</h1>
                                <p>Deploy pipelines to generate turnout timelines, peak hours graphs, and candidate distribution sheets.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px", alignItems: "start" }}>
                            <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                                <h3 style={{ margin: "0 0 10px", fontSize: "16px" }}>Analytics Controller</h3>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
                                    Invokes the Python analytics engine script to extract voter metrics from PostgreSQL and compile demographic visual reports.
                                </p>
                                <button 
                                    className="primary-btn" 
                                    onClick={triggerAnalytics} 
                                    disabled={analyticsLoading}
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    {analyticsLoading ? "Processing Analytics..." : "Execute Analytics Engine"}
                                </button>
                                
                                {analyticsOutput && (
                                    <div style={{ marginTop: "20px" }}>
                                        <strong style={{ fontSize: "12px", color: "#475569" }}>System Log Output:</strong>
                                        <pre style={{ 
                                            background: "#0f172a", 
                                            color: "#38bdf8", 
                                            padding: "15px", 
                                            borderRadius: "8px", 
                                            fontSize: "11px", 
                                            fontFamily: "monospace",
                                            maxHeight: "200px",
                                            overflowY: "auto",
                                            marginTop: "5px",
                                            whiteSpace: "pre-wrap"
                                        }}>
                                            {analyticsOutput}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "grid", gap: "25px" }}>
                                <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                                    <h3 style={{ margin: "0 0 15px", fontSize: "16px" }}>Compiled Charts Visualizer</h3>
                                    
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                            <strong style={{ display: "block", fontSize: "13px", marginBottom: "10px" }}>Hourly Voter Turnout</strong>
                                            <img 
                                                src="http://localhost:5000/analytics/voting_peak_hours.png" 
                                                alt="Peak hours graph" 
                                                style={{ width: "100%", borderRadius: "4px" }}
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                    e.target.nextSibling.style.display = "block";
                                                }}
                                            />
                                            <div style={{ display: "block", padding: "30px 10px", color: "#94a3b8", fontSize: "12px" }}>
                                                Chart not generated. Run analytics engine.
                                            </div>
                                        </div>

                                        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                            <strong style={{ display: "block", fontSize: "13px", marginBottom: "10px" }}>Voter Demographics</strong>
                                            <img 
                                                src="http://localhost:5000/analytics/voter_demographics.png" 
                                                alt="Voter Demographics graph" 
                                                style={{ width: "100%", borderRadius: "4px" }}
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                    e.target.nextSibling.style.display = "block";
                                                }}
                                            />
                                            <div style={{ display: "block", padding: "30px 10px", color: "#94a3b8", fontSize: "12px" }}>
                                                Chart not generated. Run analytics engine.
                                            </div>
                                        </div>

                                        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                            <strong style={{ display: "block", fontSize: "13px", marginBottom: "10px" }}>Voting Timeline</strong>
                                            <img 
                                                src="http://localhost:5000/analytics/voting_timeline.png" 
                                                alt="Timeline graph" 
                                                style={{ width: "100%", borderRadius: "4px" }}
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                    e.target.nextSibling.style.display = "block";
                                                }}
                                            />
                                            <div style={{ display: "block", padding: "30px 10px", color: "#94a3b8", fontSize: "12px" }}>
                                                Chart not generated. Run analytics engine.
                                            </div>
                                        </div>

                                        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                            <strong style={{ display: "block", fontSize: "13px", marginBottom: "10px" }}>Candidate Votes Distribution</strong>
                                            <img 
                                                src="http://localhost:5000/analytics/candidate_votes.png" 
                                                alt="Candidate votes graph" 
                                                style={{ width: "100%", borderRadius: "4px" }}
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                    e.target.nextSibling.style.display = "block";
                                                }}
                                            />
                                            <div style={{ display: "block", padding: "30px 10px", color: "#94a3b8", fontSize: "12px" }}>
                                                Chart not generated. Run analytics engine.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 14. REPORTS & EXPORTS */}
                {activeTab === "reports" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>COMPLIANCE & REPORTS</span>
                                <h1>Election Commission Executive Reports</h1>
                                <p>Download official PDF/CSV data exports and check compliance verification audits.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                            <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                                <h3 style={{ margin: "0 0 15px", fontSize: "16px" }}>Electoral Data CSV Exports</h3>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
                                    Export voter registration indexes, constituencies boundaries config, and active candidate ledger lists.
                                </p>
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <a 
                                        href={`http://localhost:5000/api/voters/export?token=${localStorage.getItem("token") || ""}`} 
                                        className="primary-btn-sm" 
                                        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                                        download
                                    >
                                        Export Electoral Roll (CSV)
                                    </a>
                                    <button className="secondary-btn-sm" onClick={() => {
                                        const headers = "ID,User,Role,Action,Details,Timestamp\n";
                                        const rows = auditLogs.map(log => 
                                            `"${log.id}","${log.user_email || "System"}","${log.user_role || "ADMIN"}","${log.action}","${log.details.replace(/"/g, '""')}","${log.created_at}"`
                                        ).join("\n");
                                        const blob = new Blob([headers + rows], { type: "text/csv" });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.setAttribute("href", url);
                                        a.setAttribute("download", `SDEMS_Audit_Logs_${Date.now()}.csv`);
                                        a.click();
                                    }}>
                                        Export Compliance Audit (CSV)
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                                <h3 style={{ margin: "0 0 15px", fontSize: "16px" }}>Printable Verification Reports</h3>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
                                    Print official results sheets or blockchain transaction audit chains directly to paper or PDF files.
                                </p>
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <button className="primary-btn-sm" onClick={() => {
                                        window.print();
                                    }}>
                                        Print Audit Record
                                    </button>
                                    <button className="secondary-btn-sm" onClick={() => {
                                        const headers = "Block,TxHash,GasUsed,Event,Timestamp\n";
                                        const rows = recentTransactions.map(tx => 
                                            `"${tx.blockNumber}","${tx.hash}","${tx.gasUsed || "N/A"}","${tx.event || "TxSync"}","${format12HourDateTime(tx.timestamp * 1000)}"`
                                        ).join("\n");
                                        const blob = new Blob([headers + rows], { type: "text/csv" });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.setAttribute("href", url);
                                        a.setAttribute("download", `SDEMS_Blockchain_Monitor_${Date.now()}.csv`);
                                        a.click();
                                    }}>
                                        Export Blockchain Ledger (JSON)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* OFFICIAL ECI REFERENCE DATA PANEL */}
                {activeTab === "ref_data" && (
                    <div className="admin-page" style={{ maxWidth: "100%", width: "100%" }}>
                        <div className="admin-header">
                            <div>
                                <span>ECI REGISTRY</span>
                                <h1>Official Reference Data</h1>
                                <p>Manage official geographical structures, registered political parties, historical results, and dataset verification metadata.</p>
                            </div>
                        </div>

                        {/* Reference Data Navigation Menu */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "25px", borderBottom: "2px solid #cbd5e1", paddingBottom: "15px" }}>
                            {[
                                { key: "states", label: "States & UTs" },
                                { key: "districts", label: "Districts" },
                                { key: "pcs", label: "Parliamentary PCs" },
                                { key: "acs", label: "Assembly ACs" },
                                { key: "parties", label: "Political Parties" },
                                { key: "symbols", label: "Election Symbols" },
                                { key: "elections", label: "Historical Elections" },
                                { key: "stats", label: "Election Stats" },
                                { key: "data_sources", label: "Data Sources" },
                                { key: "import_data", label: "Import Data (CSV)" },
                                { key: "verification", label: "Verification" },
                                { key: "archived_data", label: "Archived Data" }
                            ].map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => {
                                        setRefSubTab(item.key);
                                        setRefSearch("");
                                        setRefFilter("ALL");
                                        setRefSort("");
                                        setValidationReport(null);
                                        setPreviewRecords([]);
                                        setEditingRefId(null);
                                    }}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        border: "1px solid #cbd5e1",
                                        background: refSubTab === item.key ? "#0f294a" : "white",
                                        color: refSubTab === item.key ? "white" : "#475569",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontSize: "12px"
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Search, Filter, Sort Controls for lists */}
                        {refSubTab !== "import_data" && refSubTab !== "stats" && refSubTab !== "data_sources" && refSubTab !== "verification" && refSubTab !== "archived_data" && (
                            <div style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "center", background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                <input
                                    type="text"
                                    placeholder="Search registry records..."
                                    value={refSearch}
                                    onChange={(e) => setRefSearch(e.target.value)}
                                    style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "250px", fontSize: "13px" }}
                                />
                                {refSubTab === "states" || refSubTab === "parties" || refSubTab === "elections" ? (
                                    <>
                                        <select
                                            value={refFilter}
                                            onChange={(e) => setRefFilter(e.target.value)}
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                                        >
                                            <option value="ALL">All Statuses</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="IMPORTED">Imported</option>
                                            <option value="ADMIN_VERIFIED">Admin Verified</option>
                                        </select>
                                    </>
                                ) : null}
                                <select
                                    value={refSort}
                                    onChange={(e) => setRefSort(e.target.value)}
                                    style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                                >
                                    <option value="">Sort: Name (Asc)</option>
                                    <option value="name_desc">Sort: Name (Desc)</option>
                                    {refSubTab === "states" && <option value="code">Sort: Code</option>}
                                    {(refSubTab === "pcs" || refSubTab === "acs") && <option value="number">Sort: Constituency No.</option>}
                                </select>
                            </div>
                        )}

                        {/* SUBTAB 1: STATES */}
                        {refSubTab === "states" && (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
                                    <div>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                            <thead>
                                                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                                    <th style={{ padding: "10px" }}>State/UT Name</th>
                                                    <th style={{ padding: "10px" }}>Code</th>
                                                    <th style={{ padding: "10px" }}>Type</th>
                                                    <th style={{ padding: "10px" }}>Metadata Sources</th>
                                                    <th style={{ padding: "10px" }}>Data Status</th>
                                                    <th style={{ padding: "10px" }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {refStates.length === 0 ? (
                                                    <tr><td colSpan="6" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No states matching criteria.</td></tr>
                                                ) : (
                                                    refStates.map(s => (
                                                        <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                            <td style={{ padding: "10px", fontWeight: "bold" }}>{s.name}</td>
                                                            <td style={{ padding: "10px" }}><code>{s.code}</code></td>
                                                            <td style={{ padding: "10px" }}>{s.type}</td>
                                                            <td style={{ padding: "10px", fontSize: "11px" }}>
                                                                <div><strong>Source:</strong> {s.data_source || "Unverified"}</div>
                                                                <div><strong>Verified:</strong> {s.last_verified_at ? format12HourDate(s.last_verified_at) : "Pending"}</div>
                                                            </td>
                                                            <td style={{ padding: "10px" }}>
                                                                <span className={`status-badge ${s.data_status.toLowerCase()}`}>{s.data_status}</span>
                                                            </td>
                                                            <td style={{ padding: "10px" }}>
                                                                <div style={{ display: "flex", gap: "5px" }}>
                                                                    <button onClick={() => {
                                                                        setEditingRefId(s.id);
                                                                        setEditingRefName(s.name);
                                                                        setEditingRefCode(s.code);
                                                                        setEditingRefType(s.type);
                                                                        setEditingRefStatus(s.status);
                                                                        setEditingRefSource(s.data_source);
                                                                        setEditingRefUrl(s.source_url || "");
                                                                        setEditingRefDate(s.source_date || "");
                                                                    }} style={{ background: "#f59e0b", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Edit</button>
                                                                    <button onClick={() => handleVerifyRef(s.id, "state")} style={{ background: "#10b981", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Verify</button>
                                                                    <button onClick={() => handleArchiveRef(s.id, "state")} style={{ background: "#ef4444", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Archive</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        {/* Add / Edit State Form */}
                                        <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                            <h3>{editingRefId ? "Edit State Reference" : "Add State/UT Reference"}</h3>
                                            <form onSubmit={editingRefId ? handleUpdateRef : handleAddRef}>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>State Name</label>
                                                    <input type="text" required value={editingRefId ? editingRefName : addRefName} onChange={(e) => editingRefId ? setEditingRefName(e.target.value) : setAddRefName(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>State ISO Code</label>
                                                    <input type="text" required placeholder="e.g. MH, DL, KA" value={editingRefId ? editingRefCode : addRefCode} onChange={(e) => editingRefId ? setEditingRefCode(e.target.value) : setAddRefCode(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Territory Type</label>
                                                    <select value={editingRefId ? editingRefType : addRefType} onChange={(e) => editingRefId ? setEditingRefType(e.target.value) : setAddRefType(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                                                        <option value="STATE">State</option>
                                                        <option value="UT">Union Territory</option>
                                                    </select>
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Data Source Title</label>
                                                    <input type="text" placeholder="e.g. ECI Handbook 2024" value={editingRefId ? editingRefSource : addRefSource} onChange={(e) => editingRefId ? setEditingRefSource(e.target.value) : setAddRefSource(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Source Verification URL</label>
                                                    <input type="url" placeholder="https://..." value={editingRefId ? editingRefUrl : addRefUrl} onChange={(e) => editingRefId ? setEditingRefUrl(e.target.value) : setAddRefUrl(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ marginBottom: "15px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Source Verification Date</label>
                                                    <input type="date" value={editingRefId ? editingRefDate : addRefDate} onChange={(e) => editingRefId ? setEditingRefDate(e.target.value) : setAddRefDate(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button type="submit" className="admin-btn" style={{ flex: 1 }}>{editingRefId ? "Save Changes" : "Create Reference"}</button>
                                                    {editingRefId && <button type="button" onClick={() => setEditingRefId(null)} className="admin-btn-secondary">Cancel</button>}
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 2: DISTRICTS */}
                        {refSubTab === "districts" && (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                        <th style={{ padding: "10px" }}>District ID</th>
                                        <th style={{ padding: "10px" }}>District Name</th>
                                        <th style={{ padding: "10px" }}>Code</th>
                                        <th style={{ padding: "10px" }}>Belongs to State</th>
                                        <th style={{ padding: "10px" }}>Data Source</th>
                                        <th style={{ padding: "10px" }}>Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refDistricts.length === 0 ? (
                                        <tr><td colSpan="6" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No districts matching criteria.</td></tr>
                                    ) : (
                                        refDistricts.map(d => (
                                            <tr key={d.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <td style={{ padding: "10px" }}>#{d.id}</td>
                                                <td style={{ padding: "10px", fontWeight: "bold" }}>{d.name}</td>
                                                <td style={{ padding: "10px" }}><code>{d.code}</code></td>
                                                <td style={{ padding: "10px" }}>{d.state_name}</td>
                                                <td style={{ padding: "10px" }}>{d.data_source}</td>
                                                <td style={{ padding: "10px" }}><span className="status-badge official">{d.data_status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* SUBTAB 3: PARLIAMENTARY PCs */}
                        {refSubTab === "pcs" && (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                        <th style={{ padding: "10px" }}>Constituency No.</th>
                                        <th style={{ padding: "10px" }}>PC Name</th>
                                        <th style={{ padding: "10px" }}>Code</th>
                                        <th style={{ padding: "10px" }}>Belongs to State</th>
                                        <th style={{ padding: "10px" }}>Data Source</th>
                                        <th style={{ padding: "10px" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refPCs.length === 0 ? (
                                        <tr><td colSpan="6" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No parliamentary constituencies matching criteria.</td></tr>
                                    ) : (
                                        refPCs.map(p => (
                                            <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <td style={{ padding: "10px" }}><strong>{p.constituency_number}</strong></td>
                                                <td style={{ padding: "10px", fontWeight: "bold" }}>{p.name}</td>
                                                <td style={{ padding: "10px" }}><code>{p.code}</code></td>
                                                <td style={{ padding: "10px" }}>{p.state_name}</td>
                                                <td style={{ padding: "10px" }}>{p.data_source}</td>
                                                <td style={{ padding: "10px" }}><span className="status-badge official">{p.data_status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* SUBTAB 4: ASSEMBLY ACs */}
                        {refSubTab === "acs" && (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                        <th style={{ padding: "10px" }}>AC No.</th>
                                        <th style={{ padding: "10px" }}>Assembly AC Name</th>
                                        <th style={{ padding: "10px" }}>Code</th>
                                        <th style={{ padding: "10px" }}>District</th>
                                        <th style={{ padding: "10px" }}>State</th>
                                        <th style={{ padding: "10px" }}>Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refACs.length === 0 ? (
                                        <tr><td colSpan="6" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No assembly constituencies matching criteria.</td></tr>
                                    ) : (
                                        refACs.map(a => (
                                            <tr key={a.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <td style={{ padding: "10px" }}><strong>{a.constituency_number}</strong></td>
                                                <td style={{ padding: "10px", fontWeight: "bold" }}>{a.name}</td>
                                                <td style={{ padding: "10px" }}><code>{a.code}</code></td>
                                                <td style={{ padding: "10px" }}>{a.district_name}</td>
                                                <td style={{ padding: "10px" }}>{a.state_name}</td>
                                                <td style={{ padding: "10px" }}><span className="status-badge official">{a.data_status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* SUBTAB 5: POLITICAL PARTIES */}
                        {refSubTab === "parties" && (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
                                    <div>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                            <thead>
                                                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                                    <th style={{ padding: "10px" }}>Party Name</th>
                                                    <th style={{ padding: "10px" }}>Abbreviation</th>
                                                    <th style={{ padding: "10px" }}>Recognition Type</th>
                                                    <th style={{ padding: "10px" }}>ECI Symbol</th>
                                                    <th style={{ padding: "10px" }}>Status</th>
                                                    <th style={{ padding: "10px" }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {refParties.length === 0 ? (
                                                    <tr><td colSpan="6" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No registered political parties matching criteria.</td></tr>
                                                ) : (
                                                    refParties.map(p => (
                                                        <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                            <td style={{ padding: "10px", fontWeight: "bold" }}>{p.name}</td>
                                                            <td style={{ padding: "10px" }}><code>{p.abbreviation}</code></td>
                                                            <td style={{ padding: "10px" }}>{p.party_type}</td>
                                                            <td style={{ padding: "10px" }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                    <ECISymbolIcon symbol={p.symbol_name} size={26} />
                                                                    <span style={{ fontWeight: "600", color: "#0f172a" }}>{p.symbol_name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: "10px" }}><span className={`status-badge ${p.data_status.toLowerCase()}`}>{p.data_status}</span></td>
                                                            <td style={{ padding: "10px" }}>
                                                                <div style={{ display: "flex", gap: "5px" }}>
                                                                    <button onClick={() => {
                                                                        setEditingRefId(p.id);
                                                                        setEditingRefName(p.name);
                                                                        setEditingRefCode(p.abbreviation);
                                                                        setEditingRefType(p.party_type);
                                                                        setEditingRefStatus(p.status);
                                                                        setEditingRefSource(p.data_source);
                                                                        setEditingRefUrl(p.source_url || "");
                                                                        setEditingRefDate(p.source_date || "");
                                                                    }} style={{ background: "#f59e0b", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Edit</button>
                                                                    <button onClick={() => handleVerifyRef(p.id, "party")} style={{ background: "#10b981", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Verify</button>
                                                                    <button onClick={() => handleArchiveRef(p.id, "party")} style={{ background: "#ef4444", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Archive</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                            <h3>{editingRefId ? "Edit Party Reference" : "Add Party Reference"}</h3>
                                            <form onSubmit={editingRefId ? handleUpdateRef : handleAddRef}>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Party Name</label>
                                                    <input type="text" required value={editingRefId ? editingRefName : addRefName} onChange={(e) => editingRefId ? setEditingRefName(e.target.value) : setAddRefName(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Abbreviation</label>
                                                    <input type="text" required placeholder="e.g. BJP, INC, AAP" value={editingRefId ? editingRefCode : addRefCode} onChange={(e) => editingRefId ? setEditingRefCode(e.target.value) : setAddRefCode(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Party Recognition Type</label>
                                                    <select value={editingRefId ? editingRefType : addRefType} onChange={(e) => editingRefId ? setEditingRefType(e.target.value) : setAddRefType(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                                                        <option value="NATIONAL">National Party</option>
                                                        <option value="STATE">State Party</option>
                                                        <option value="REGISTERED">Registered Party</option>
                                                        <option value="UNRECOGNIZED">Unrecognized Party</option>
                                                    </select>
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Assigned Election Symbol</label>
                                                    <input type="text" placeholder="e.g. Lotus, Hand, Broom" value={editingRefId ? "" : addRefSymbol} onChange={(e) => setAddRefSymbol(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ marginBottom: "12px" }}>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Data Source</label>
                                                    <input type="text" value={editingRefId ? editingRefSource : addRefSource} onChange={(e) => editingRefId ? setEditingRefSource(e.target.value) : setAddRefSource(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button type="submit" className="admin-btn" style={{ flex: 1 }}>{editingRefId ? "Save Changes" : "Create Reference"}</button>
                                                    {editingRefId && <button type="button" onClick={() => setEditingRefId(null)} className="admin-btn-secondary">Cancel</button>}
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 6: ELECTION SYMBOLS */}
                        {refSubTab === "symbols" && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
                                {refSymbols.map(sym => (
                                    <div key={sym.id} style={{ background: "white", padding: "20px", border: "1px solid #cbd5e1", borderRadius: "8px", textAlign: "center" }}>
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                                            <ECISymbolIcon symbol={sym.symbol_name} size={56} />
                                        </div>
                                        <h4 style={{ margin: "5px 0" }}>{sym.symbol_name}</h4>
                                        <code style={{ fontSize: "11px", color: "#64748b" }}>{sym.symbol_code}</code>
                                        <div style={{ marginTop: "8px" }}>
                                            <span style={{ fontSize: "11px", background: sym.is_available ? "#d1fae5" : "#fee2e2", color: sym.is_available ? "#065f46" : "#991b1b", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                                                {sym.is_available ? "AVAILABLE" : "ALLOCATED"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SUBTAB 7: HISTORICAL ELECTIONS */}
                        {refSubTab === "elections" && (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                        <th style={{ padding: "10px" }}>Election Year</th>
                                        <th style={{ padding: "10px" }}>Election Name</th>
                                        <th style={{ padding: "10px" }}>Type</th>
                                        <th style={{ padding: "10px" }}>Jurisdiction/State</th>
                                        <th style={{ padding: "10px" }}>Election Date</th>
                                        <th style={{ padding: "10px" }}>Data Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refElections.length === 0 ? (
                                        <tr><td colSpan="6" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No historical elections recorded.</td></tr>
                                    ) : (
                                        refElections.map(e => (
                                            <tr key={e.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <td style={{ padding: "10px", fontWeight: "bold" }}>{e.year}</td>
                                                <td style={{ padding: "10px" }}>{e.election_name}</td>
                                                <td style={{ padding: "10px" }}>{e.election_type}</td>
                                                <td style={{ padding: "10px" }}>{e.state}</td>
                                                <td style={{ padding: "10px" }}>{e.election_date ? format12HourDate(e.election_date) : "N/A"}</td>
                                                <td style={{ padding: "10px", fontSize: "11px", color: "#64748b" }}>{e.data_status}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* SUBTAB 8: ELECTION STATISTICS */}
                        {refSubTab === "stats" && (
                            <div style={{ maxWidth: "600px" }}>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "5px" }}>Select Historical Election</label>
                                    <select
                                        value={selectedRefElectionId}
                                        onChange={(e) => setSelectedRefElectionId(e.target.value)}
                                        style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                                    >
                                        <option value="">-- Choose Election --</option>
                                        {refElections.map(e => (
                                            <option key={e.id} value={e.id}>{e.year} - {e.election_name}</option>
                                        ))}
                                    </select>
                                </div>
                                {refStats ? (
                                    <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
                                        <h3 style={{ color: "#0f294a", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>Official ECI Electoral Summary</h3>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "14px" }}>
                                            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px" }}>
                                                <span style={{ color: "#64748b", fontSize: "11px" }}>TOTAL ELECTORS</span>
                                                <strong style={{ display: "block", fontSize: "16px" }}>{parseInt(refStats.total_electors).toLocaleString()}</strong>
                                            </div>
                                            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px" }}>
                                                <span style={{ color: "#64748b", fontSize: "11px" }}>TURNOUT PERCENTAGE</span>
                                                <strong style={{ display: "block", fontSize: "16px", color: "#059669" }}>{refStats.turnout_percentage}%</strong>
                                            </div>
                                            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px" }}>
                                                <span style={{ color: "#64748b", fontSize: "11px" }}>VOTES POLLED</span>
                                                <strong style={{ display: "block", fontSize: "16px" }}>{parseInt(refStats.votes_polled).toLocaleString()}</strong>
                                            </div>
                                            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px" }}>
                                                <span style={{ color: "#64748b", fontSize: "11px" }}>POLLING STATIONS</span>
                                                <strong style={{ display: "block", fontSize: "16px" }}>{parseInt(refStats.polling_stations).toLocaleString()}</strong>
                                            </div>
                                            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px" }}>
                                                <span style={{ color: "#64748b", fontSize: "11px" }}>CANDIDATES PARTICIPATED</span>
                                                <strong style={{ display: "block", fontSize: "16px" }}>{refStats.candidates_count} Candidates</strong>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ fontStyle: "italic", color: "#64748b" }}>Please select an election from the list to view statistical breakdowns.</p>
                                )}
                            </div>
                        )}

                        {/* SUBTAB 9: DATA SOURCES */}
                        {refSubTab === "data_sources" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                                <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                    <h3>Geographical Metadata Sources</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                                        {refStates.map(s => (
                                            <div key={s.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                                                <strong>{s.name} ({s.code})</strong>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>Source: {s.data_source || "Unverified"}</div>
                                                <div style={{ fontSize: "11px", color: "#2563eb" }}>Verification URL: <a href={s.source_url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>{s.source_url || "N/A"}</a></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                    <h3>Political Party Metadata Sources</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                                        {refParties.map(p => (
                                            <div key={p.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                                                <strong>{p.name} ({p.abbreviation})</strong>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>Source: {p.data_source || "Unverified"}</div>
                                                <div style={{ fontSize: "11px", color: "#2563eb" }}>Verification URL: <a href={p.source_url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>{p.source_url || "N/A"}</a></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 10: IMPORT DATA (CSV) */}
                        {refSubTab === "import_data" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "30px" }}>
                                <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
                                    <h3>ECI CSV Import Channel</h3>
                                    <form onSubmit={handleValidateImport} style={{ marginTop: "15px" }}>
                                        <div style={{ marginBottom: "12px" }}>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Target Table</label>
                                            <select
                                                value={importTableType}
                                                onChange={(e) => {
                                                    setImportTableType(e.target.value);
                                                    setValidationReport(null);
                                                    setPreviewRecords([]);
                                                }}
                                                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                                            >
                                                <option value="states">States Registry</option>
                                                <option value="districts">Districts Registry</option>
                                                <option value="parliamentary_constituencies">Parliamentary PCs</option>
                                                <option value="reference_parties">Political Parties</option>
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: "12px" }}>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Data Source Label</label>
                                            <input type="text" required value={importDataSource} onChange={(e) => setImportDataSource(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                        </div>
                                        <div style={{ marginBottom: "12px" }}>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Reference URL Source</label>
                                            <input type="url" required value={importSourceUrl} onChange={(e) => setImportSourceUrl(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                        </div>
                                        <div style={{ marginBottom: "12px" }}>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Verification Date</label>
                                            <input type="date" value={importSourceDate} onChange={(e) => setImportSourceDate(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                                        </div>
                                        <div style={{ marginBottom: "15px" }}>
                                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Paste Raw CSV Data</label>
                                            <textarea
                                                required
                                                rows="8"
                                                value={csvText}
                                                onChange={(e) => setCsvText(e.target.value)}
                                                placeholder={
                                                    importTableType === "states" ? "name,code,type\nMaharashtra,MH,STATE\nDelhi,DL,UT" :
                                                    importTableType === "districts" ? "name,code,state_code\nColaba,COL,MH" :
                                                    importTableType === "parliamentary_constituencies" ? "name,constituency_number,code,state_code\nMumbai South,31,MUMS,MH" :
                                                    "name,abbreviation,party_type,symbol_name\nBharatiya Janata Party,BJP,NATIONAL,Lotus"
                                                }
                                                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", resize: "none" }}
                                            />
                                        </div>
                                        <button type="submit" disabled={isValidating} className="admin-btn" style={{ width: "100%" }}>
                                            {isValidating ? "Validating Formats..." : "Validate CSV Data"}
                                        </button>
                                    </form>
                                </div>
                                <div style={{ background: "white", padding: "25px", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
                                    <h3>Import Validation Report</h3>
                                    {validationReport ? (
                                        <div style={{ marginTop: "15px" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                                                <div style={{ padding: "10px", background: "#eff6ff", borderRadius: "6px" }}>
                                                    <span style={{ fontSize: "11px", color: "#1e40af" }}>TOTAL CSV RECORDS</span>
                                                    <strong style={{ display: "block", fontSize: "16px" }}>{validationReport.totalRecords}</strong>
                                                </div>
                                                <div style={{ padding: "10px", background: "#ecfdf5", borderRadius: "6px" }}>
                                                    <span style={{ fontSize: "11px", color: "#065f46" }}>NEW VALID RECORDS</span>
                                                    <strong style={{ display: "block", fontSize: "16px", color: "#059669" }}>{validationReport.newRecords}</strong>
                                                </div>
                                                <div style={{ padding: "10px", background: "#fffbeb", borderRadius: "6px" }}>
                                                    <span style={{ fontSize: "11px", color: "#92400e" }}>DUPLICATE ENTRIES</span>
                                                    <strong style={{ display: "block", fontSize: "16px", color: "#d97706" }}>{validationReport.duplicateRecords}</strong>
                                                </div>
                                                <div style={{ padding: "10px", background: "#fef2f2", borderRadius: "6px" }}>
                                                    <span style={{ fontSize: "11px", color: "#991b1b" }}>INVALID RECORDS</span>
                                                    <strong style={{ display: "block", fontSize: "16px", color: "#dc2626" }}>{validationReport.invalidRecords}</strong>
                                                </div>
                                            </div>

                                            {validationReport.errors.length > 0 && (
                                                <div style={{ background: "#fef2f2", borderLeft: "4px solid #ef4444", padding: "10px", borderRadius: "4px", marginBottom: "15px", maxHeight: "120px", overflowY: "auto" }}>
                                                    <strong style={{ color: "#991b1b", fontSize: "12px" }}>Validation Warnings:</strong>
                                                    <ul style={{ margin: "5px 0 0", paddingLeft: "15px", fontSize: "11px", color: "#b91c1c" }}>
                                                        {validationReport.errors.map((err, i) => <li key={i}>{err}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "15px" }}>
                                                <button
                                                    onClick={handleApproveImport}
                                                    disabled={isImporting || previewRecords.length === 0}
                                                    className="admin-btn"
                                                    style={{ width: "100%", background: "#059669" }}
                                                >
                                                    {isImporting ? "Storing Records..." : `Approve & Store ${previewRecords.length} Records`}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ fontStyle: "italic", color: "#64748b", marginTop: "15px" }}>No validation report compiled. Fill the CSV form and validate.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 11: VERIFICATION WORKFLOW */}
                        {refSubTab === "verification" && (
                            <div>
                                <h3>Pending ECI Verification Scrutiny</h3>
                                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "15px" }}>The following imported or pending reference entries require verification scrutiny before publication status is cleared.</p>
                                
                                <h4 style={{ color: "#0f294a", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>States & UTs Pending Verification</h4>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "25px" }}>
                                    <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                            <th style={{ padding: "10px" }}>State Name</th>
                                            <th style={{ padding: "10px" }}>Code</th>
                                            <th style={{ padding: "10px" }}>Data Source</th>
                                            <th style={{ padding: "10px" }}>Status</th>
                                            <th style={{ padding: "10px" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refStates.length === 0 ? (
                                            <tr><td colSpan="5" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No states pending verification.</td></tr>
                                        ) : (
                                            refStates.map(s => (
                                                <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "10px", fontWeight: "bold" }}>{s.name}</td>
                                                    <td style={{ padding: "10px" }}><code>{s.code}</code></td>
                                                    <td style={{ padding: "10px" }}>{s.data_source}</td>
                                                    <td style={{ padding: "10px" }}><span className="status-badge pending">{s.data_status}</span></td>
                                                    <td style={{ padding: "10px" }}>
                                                        <button onClick={() => handleVerifyRef(s.id, "state")} style={{ background: "#10b981", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Approve Verification</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                <h4 style={{ color: "#0f294a", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Political Parties Pending Verification</h4>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                    <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                            <th style={{ padding: "10px" }}>Party Name</th>
                                            <th style={{ padding: "10px" }}>Abbreviation</th>
                                            <th style={{ padding: "10px" }}>Data Source</th>
                                            <th style={{ padding: "10px" }}>Status</th>
                                            <th style={{ padding: "10px" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refParties.length === 0 ? (
                                            <tr><td colSpan="5" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No political parties pending verification.</td></tr>
                                        ) : (
                                            refParties.map(p => (
                                                <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "10px", fontWeight: "bold" }}>{p.name}</td>
                                                    <td style={{ padding: "10px" }}><code>{p.abbreviation}</code></td>
                                                    <td style={{ padding: "10px" }}>{p.data_source}</td>
                                                    <td style={{ padding: "10px" }}><span className="status-badge pending">{p.data_status}</span></td>
                                                    <td style={{ padding: "10px" }}>
                                                        <button onClick={() => handleVerifyRef(p.id, "party")} style={{ background: "#10b981", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Approve Verification</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* SUBTAB 12: ARCHIVED DATA */}
                        {refSubTab === "archived_data" && (
                            <div>
                                <h3>Archived Reference Data Logs</h3>
                                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "15px" }}>Geographical or administrative structures that have been formally decommissioned and archived.</p>
                                
                                <h4 style={{ color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Archived States</h4>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "25px" }}>
                                    <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                            <th style={{ padding: "10px" }}>State Name</th>
                                            <th style={{ padding: "10px" }}>Code</th>
                                            <th style={{ padding: "10px" }}>Data Source</th>
                                            <th style={{ padding: "10px" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refStates.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No archived states recorded.</td></tr>
                                        ) : (
                                            refStates.map(s => (
                                                <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "10px", textDecoration: "line-through" }}>{s.name}</td>
                                                    <td style={{ padding: "10px" }}><code>{s.code}</code></td>
                                                    <td style={{ padding: "10px" }}>{s.data_source}</td>
                                                    <td style={{ padding: "10px" }}><span className="status-badge archived">{s.status}</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                <h4 style={{ color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Archived Parties</h4>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                    <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
                                            <th style={{ padding: "10px" }}>Party Name</th>
                                            <th style={{ padding: "10px" }}>Abbreviation</th>
                                            <th style={{ padding: "10px" }}>Data Source</th>
                                            <th style={{ padding: "10px" }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refParties.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: "15px", textAlign: "center", color: "#64748b" }}>No archived political parties.</td></tr>
                                        ) : (
                                            refParties.map(p => (
                                                <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                    <td style={{ padding: "10px", textDecoration: "line-through" }}>{p.name}</td>
                                                    <td style={{ padding: "10px" }}><code>{p.abbreviation}</code></td>
                                                    <td style={{ padding: "10px" }}>{p.data_source}</td>
                                                    <td style={{ padding: "10px" }}><span className="status-badge archived">{p.status}</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 15. BACKUP & RESTORE */}
                {activeTab === "backup" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>DATABASE ARCHIVE</span>
                                <h1>System Backups & Recovery</h1>
                                <p>Generate PostgreSQL database dumps and restore audit trails.</p>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                            <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h3>PostgreSQL Database Backup</h3>
                                <p style={{ fontSize: "14px", color: "#64748b", margin: "10px 0 20px" }}>
                                    Generate a binary schema and row dump copy of the e-voting database inside the project workspace directory.
                                </p>
                                <button className="primary-btn" style={{ width: "100%" }} onClick={backupDatabase}>
                                    Generate Database Snapshot (SQL/JSON)
                                </button>
                            </div>
                            <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h3>PostgreSQL Database Restore</h3>
                                <p style={{ fontSize: "14px", color: "#64748b", margin: "10px 0 20px" }}>
                                    Restore tables, constraints, and audit rows from the last generated database dump file.
                                </p>
                                <button className="primary-btn" style={{ width: "100%", background: "#f59e0b" }} onClick={restoreDatabase}>
                                    Restore Database from Snapshot
                                </button>
                            </div>
                        </div>
                        {backupStatus && (
                            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "20px", borderRadius: "12px", margin: "25px 0 0" }}>
                                <strong>Log Console:</strong>
                                <pre style={{ margin: "10px 0 0", whiteSpace: "pre-wrap", fontSize: "13px" }}>{backupStatus}</pre>
                            </div>
                        )}
                    </div>
                )}

                {/* 16. SETTINGS VIEW */}
                {activeTab === "settings" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>SETTINGS & INFO</span>
                                <h1>System Parameters & Credentials Config</h1>
                                <p>Manage active network endpoints, local host bindings, and system identifiers.</p>
                            </div>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px" }}>
                            <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                <h3>Operational Parameters</h3>
                                <table className="audit-table" style={{ marginTop: "15px" }}>
                                    <tbody>
                                        <tr>
                                            <td><strong>Backend REST API Host</strong></td>
                                            <td><code>http://localhost:5000</code></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Blockchain EVM Client URL</strong></td>
                                            <td><code>http://127.0.0.1:8545</code></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Smart Contract Address</strong></td>
                                            <td><code>0x5FbDB2315678afecb367f032d93F642f64180aa3</code></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Default Port PostgreSQL</strong></td>
                                            <td><code>5432</code></td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h3 style={{ marginTop: "25px", fontSize: "16px" }}>SDEMS Architecture</h3>
                                <pre style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px", fontFamily: "monospace", marginTop: "10px" }}>
{`[Electron Container] ── (IPC Bridge) ── [Vite React Renderer]
        │
(Child Process Spawn)
        ├─► [Express REST APIs] ──► [PostgreSQL Database]
        │         │
        │         ├─► [ethers.js RPC] ──► [Hardhat Node (EVM)]
        │         └─► [Python Scripts] ─► [Matplotlib Output]
        └─► [System Diagnostics]` }
                                </pre>
                            </div>

                            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "24px", borderRadius: "12px" }}>
                                <strong style={{ color: "#1e3a8a", display: "block", marginBottom: "10px", fontSize: "16px" }}>System Security & Statutory Standards</strong>
                                <p style={{ fontSize: "13px", color: "#1e3a8a", margin: 0, lineHeight: "1.6" }}>
                                    <strong>Official Standard:</strong> Developed according to Election Commission of India guidelines, combining tamper-proof blockchain storage with automated voter roll audits and statutory grievance redressal.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 11. ABOUT PAGE */}
                {activeTab === "about" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>SYSTEM DOCUMENTATION</span>
                                <h1>SDEMS Information & Architecture Overview</h1>
                                <p>Review system components, runtime status, data integrity configurations, and documentation.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", alignItems: "start" }}>
                            <div style={{ background: "white", padding: "30px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                <h2 style={{ fontSize: "20px", color: "#2563eb", margin: "0 0 10px" }}>SDEMS v1.0.0</h2>
                                <strong style={{ color: "#475569" }}>Secure Decentralized Election Management System</strong>
                                <p style={{ fontSize: "14px", color: "#64748b", margin: "10px 0 20px", lineHeight: "1.6" }}>
                                    This official administrative application provides end-to-end electoral management, voter registration rolls, candidate nominations, polling station jurisdictions, automated duplicate detection, and secure vote synchronization.
                                </p>

                                <h3 style={{ fontSize: "16px", margin: "20px 0 10px", color: "#1e293b" }}>Core Specifications</h3>
                                <table className="audit-table">
                                    <tbody>
                                        <tr>
                                            <td><strong>Component Role</strong></td>
                                            <td>ECI Official Administrative Portal</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Relational Database</strong></td>
                                            <td>PostgreSQL v15+ relational bounds constraints</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Smart Contract & Consensus Layer</strong></td>
                                            <td>Hardhat Local Node EVM Solidity Compilation</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Process Pipeline</strong></td>
                                            <td>Electron runtime wrapper with sandbox preload bridge</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h3 style={{ fontSize: "16px", margin: "25px 0 10px", color: "#1e293b" }}>System Architecture Map</h3>
                                <pre style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", fontFamily: "monospace" }}>
{`[Electron Container] ── (IPC Bridge) ── [Vite React Renderer]
        │
(Child Process Spawn)
        ├─► [Express REST APIs] ──► [PostgreSQL Database]
        │         │
        │         ├─► [ethers.js RPC] ──► [Hardhat Node (EVM)]
        │         └─► [Python Scripts] ─► [Matplotlib Output]
        └─► [System Diagnostics]` }
                                </pre>
                            </div>

                            <div style={{ display: "grid", gap: "20px" }}>
                                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "20px", borderRadius: "16px" }}>
                                    <strong style={{ color: "#1e3a8a", display: "block", marginBottom: "5px" }}>ECI System Security Notice</strong>
                                    <p style={{ fontSize: "12px", color: "#1e3a8a", margin: 0, lineHeight: "1.5" }}>
                                        All system processes strictly follow official election protocols with zero-knowledge voter privacy and deterministic smart contract vote counting.
                                    </p>
                                </div>

                                <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                    <h4 style={{ margin: "0 0 10px", fontSize: "14px" }}>System Documentation Guides</h4>
                                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#475569" }}>
                                        <li style={{ marginBottom: "6px" }}><a href="#" onClick={(e) => { e.preventDefault(); alert("Refer to /docs/architecture.md"); }}>architecture.md</a></li>
                                        <li style={{ marginBottom: "6px" }}><a href="#" onClick={(e) => { e.preventDefault(); alert("Refer to /docs/database.md"); }}>database.md</a></li>
                                        <li style={{ marginBottom: "6px" }}><a href="#" onClick={(e) => { e.preventDefault(); alert("Refer to /docs/blockchain.md"); }}>blockchain.md</a></li>
                                        <li style={{ marginBottom: "6px" }}><a href="#" onClick={(e) => { e.preventDefault(); alert("Refer to /docs/security.md"); }}>security.md</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 12. ELECTION CALENDAR */}
                {activeTab === "calendar" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>ECI CALENDAR</span>
                                <h1>Election Scheduling & Calendar Overview</h1>
                                <p>Track upcoming timelines, nomination cycles, and counting schedules.</p>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>Active Timelines</h3>
                            {elections.length === 0 ? (
                                <p style={{ color: "#64748b", fontStyle: "italic" }}>No elections scheduled yet.</p>
                            ) : (
                                <table className="audit-table">
                                    <thead>
                                        <tr>
                                            <th>Election Code</th>
                                            <th>Title</th>
                                            <th>Nomination Start / End</th>
                                            <th>Scrutiny Date</th>
                                            <th>Withdrawal Date</th>
                                            <th>Polling Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {elections.map((ele) => (
                                            <tr key={ele.id}>
                                                <td><code>{ele.election_code || `EL-${ele.id}`}</code></td>
                                                <td><strong>{ele.title}</strong></td>
                                                <td>{ele.nomination_start ? `${format12HourDate(ele.nomination_start)} - ${format12HourDate(ele.nomination_end)}` : "N/A"}</td>
                                                <td>{ele.scrutiny_date ? format12HourDate(ele.scrutiny_date) : "N/A"}</td>
                                                <td>{ele.withdrawal_date ? format12HourDate(ele.withdrawal_date) : "N/A"}</td>
                                                <td>{format12HourDate(ele.start_time)}</td>
                                                <td><span className={`status-badge ${ele.status.toLowerCase()}`}>{ele.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* 13. ELECTION OFFICERS */}
                {activeTab === "officers" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>STAFF MANAGEMENT</span>
                                <h1>Election Officer Assignments & Jurisdictions</h1>
                                <p>Assign Returning Officers, Observers, and Presiding Officers to specific constituencies.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "24px" }}>
                            <div className="card">
                                <h3>Assign New Officer</h3>
                                <form onSubmit={createOfficer} style={{ marginTop: "15px" }}>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Officer User Email</label>
                                        <input 
                                            type="email" 
                                            required 
                                            value={newOfficerEmail} 
                                            onChange={(e) => setNewOfficerEmail(e.target.value)} 
                                            placeholder="e.g. officer@gmail.com"
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Officer Designation</label>
                                        <select 
                                            value={newOfficerRole} 
                                            onChange={(e) => setNewOfficerRole(e.target.value)}
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        >
                                            <option value="RETURNING_OFFICER">Returning Officer (RO)</option>
                                            <option value="PRESIDING_OFFICER">Presiding Officer</option>
                                            <option value="STATE_ELECTION_OFFICER">State Election Officer</option>
                                            <option value="DISTRICT_ELECTION_OFFICER">District Election Officer</option>
                                            <option value="OBSERVER">ECI Observer</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Jurisdiction Level</label>
                                        <select 
                                            value={newOfficerJurisdiction} 
                                            onChange={(e) => setNewOfficerJurisdiction(e.target.value)}
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        >
                                            <option value="NATIONAL">National</option>
                                            <option value="STATE">State Level</option>
                                            <option value="DISTRICT">District Level</option>
                                            <option value="CONSTITUENCY">Constituency Level</option>
                                        </select>
                                    </div>
                                    {newOfficerJurisdiction === "STATE" && (
                                        <div style={{ marginBottom: "12px" }}>
                                            <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>State Name</label>
                                            <input type="text" value={newOfficerState} onChange={(e) => setNewOfficerState(e.target.value)} placeholder="e.g. Maharashtra" style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }} />
                                        </div>
                                    )}
                                    {newOfficerJurisdiction === "DISTRICT" && (
                                        <>
                                            <div style={{ marginBottom: "12px" }}>
                                                <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>State Name</label>
                                                <input type="text" value={newOfficerState} onChange={(e) => setNewOfficerState(e.target.value)} placeholder="e.g. Maharashtra" style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }} />
                                            </div>
                                            <div style={{ marginBottom: "12px" }}>
                                                <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>District Name</label>
                                                <input type="text" value={newOfficerDistrict} onChange={(e) => setNewOfficerDistrict(e.target.value)} placeholder="e.g. Pune" style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }} />
                                            </div>
                                        </>
                                    )}
                                    {newOfficerJurisdiction === "CONSTITUENCY" && (
                                        <div style={{ marginBottom: "12px" }}>
                                            <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Select Constituency</label>
                                            <select 
                                                value={newOfficerConstId} 
                                                onChange={(e) => setNewOfficerConstId(e.target.value)}
                                                style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                            >
                                                <option value="">-- Choose Constituency --</option>
                                                {constituencies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <button className="primary-btn" type="submit" style={{ width: "100%", background: "#1e3a8a", padding: "10px", marginTop: "10px" }}>Assign Officer</button>
                                </form>
                            </div>

                            <div className="card">
                                <h3>Assigned Election Officers</h3>
                                <table className="audit-table" style={{ marginTop: "15px" }}>
                                    <thead>
                                        <tr>
                                            <th>Officer Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Jurisdiction</th>
                                            <th>Bounds</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {officers.length === 0 ? (
                                            <tr><td colSpan="6" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No officers assigned yet.</td></tr>
                                        ) : (
                                            officers.map(o => (
                                                <tr key={o.id}>
                                                    <td><strong>{o.user_name}</strong></td>
                                                    <td><code>{o.user_email}</code></td>
                                                    <td><span className="status-badge" style={{ background: "#f1f5f9", color: "#0f172a" }}>{o.role}</span></td>
                                                    <td><code>{o.jurisdiction_level}</code></td>
                                                    <td>{o.jurisdiction_level === "CONSTITUENCY" ? o.constituency_name : (o.district || o.state || "National")}</td>
                                                    <td>
                                                        <button onClick={() => deleteOfficer(o.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Remove</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 14. MULTI-PHASE SCHEDULES */}
                {activeTab === "phases" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>MULTI-PHASE PLANNER</span>
                                <h1>Multi-Phase Election Scheduling</h1>
                                <p>Manage constituency divisions across polling dates for staggered polling phases.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                            <div className="card">
                                <h3>Add Polling Phase</h3>
                                <form onSubmit={createPhase} style={{ marginTop: "15px" }}>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Select Election</label>
                                        <select 
                                            value={newPhaseElectionId} 
                                            onChange={(e) => setNewPhaseElectionId(e.target.value)}
                                            required
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        >
                                            <option value="">-- Select Election --</option>
                                            {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Phase Number</label>
                                        <input 
                                            type="number" 
                                            value={newPhaseNumber} 
                                            onChange={(e) => setNewPhaseNumber(parseInt(e.target.value))} 
                                            min="1" 
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Polling Date & Time</label>
                                        <input 
                                            type="datetime-local" 
                                            required
                                            value={newPhaseDate} 
                                            onChange={(e) => setNewPhaseDate(e.target.value)} 
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Constituencies (comma separated)</label>
                                        <input 
                                            type="text" 
                                            value={newPhaseConsts} 
                                            onChange={(e) => setNewPhaseConsts(e.target.value)} 
                                            placeholder="e.g. Pune, Mumbai South"
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        />
                                    </div>
                                    <button className="primary-btn" type="submit" style={{ width: "100%", background: "#1e3a8a", padding: "10px" }}>Create Phase</button>
                                </form>
                            </div>

                            <div className="card">
                                <h3>Configured Multi-Phase Plans</h3>
                                <table className="audit-table" style={{ marginTop: "15px" }}>
                                    <thead>
                                        <tr>
                                            <th>Election</th>
                                            <th>Phase #</th>
                                            <th>Polling Date</th>
                                            <th>Assigned Constituencies</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {phases.length === 0 ? (
                                            <tr><td colSpan="5" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No phases configured yet.</td></tr>
                                        ) : (
                                            phases.map(p => (
                                                <tr key={p.id}>
                                                    <td><strong>{p.election_title}</strong></td>
                                                    <td>Phase {p.phase_number}</td>
                                                    <td>{format12HourDateTime(p.polling_date)}</td>
                                                    <td><code>{p.constituencies || "All"}</code></td>
                                                    <td><span className="status-badge upcoming">{p.status}</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 15. RE-POLL SUPPORT */}
                {activeTab === "repolls" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>REPOLL LOGS & WORKFLOW</span>
                                <h1>Emergency Re-Polling Management</h1>
                                <p>Schedule a new re-poll if incidents or disruption occur at specific polling stations.</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                            <div className="card">
                                <h3>Schedule Re-Poll</h3>
                                <form onSubmit={createRepoll} style={{ marginTop: "15px" }}>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Select Election</label>
                                        <select 
                                            value={newRepollElectionId} 
                                            onChange={(e) => setNewRepollElectionId(e.target.value)}
                                            required
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        >
                                            <option value="">-- Choose Election --</option>
                                            {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Constituency</label>
                                        <select 
                                            value={newRepollConstId} 
                                            onChange={(e) => setNewRepollConstId(e.target.value)}
                                            required
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        >
                                            <option value="">-- Select Constituency --</option>
                                            {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Polling Station</label>
                                        <select 
                                            value={newRepollStationId} 
                                            onChange={(e) => setNewRepollStationId(e.target.value)}
                                            required
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        >
                                            <option value="">-- Choose Station --</option>
                                            {pollingStations.map(ps => <option key={ps.id} value={ps.id}>{ps.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>Reason for Re-Poll</label>
                                        <textarea 
                                            required 
                                            value={newRepollReason} 
                                            onChange={(e) => setNewRepollReason(e.target.value)}
                                            placeholder="e.g. Technical network outage during active ballot window."
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%", height: "80px", resize: "none" }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "5px" }}>New Polling Date</label>
                                        <input 
                                            type="datetime-local" 
                                            required 
                                            value={newRepollDate} 
                                            onChange={(e) => setNewRepollDate(e.target.value)} 
                                            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "100%" }}
                                        />
                                    </div>
                                    <button className="primary-btn" type="submit" style={{ width: "100%", background: "#ea580c", padding: "10px" }}>Schedule Re-Poll</button>
                                </form>
                            </div>

                            <div className="card">
                                <h3>Active Re-Poll Schedules</h3>
                                <table className="audit-table" style={{ marginTop: "15px" }}>
                                    <thead>
                                        <tr>
                                            <th>Election</th>
                                            <th>Location</th>
                                            <th>Reason</th>
                                            <th>New Polling Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repolls.length === 0 ? (
                                            <tr><td colSpan="5" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No active re-polls scheduled.</td></tr>
                                        ) : (
                                            repolls.map(r => (
                                                <tr key={r.id}>
                                                    <td><strong>{r.election_title}</strong></td>
                                                    <td>{r.constituency_name} — {r.polling_station_name}</td>
                                                    <td><p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>{r.reason}</p></td>
                                                    <td>{format12HourDateTime(r.scheduled_date)}</td>
                                                    <td><span className="status-badge" style={{ background: "#ffedd5", color: "#c2410c" }}>{r.status}</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 16. GRIEVANCE PORTAL */}
                {activeTab === "grievances" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>CITIZEN PORTAL</span>
                                <h1>Citizen Grievances & Complaint Resolution</h1>
                                <p>Manage, review and resolve voter complaints submitted under electoral guidelines.</p>
                            </div>
                        </div>

                        <div className="card">
                            <h3>Received Complaints</h3>
                            <table className="audit-table" style={{ marginTop: "15px" }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Complainant</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Constituency</th>
                                        <th>Status</th>
                                        <th>Resolution Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grievances.length === 0 ? (
                                        <tr><td colSpan="7" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No complaints logged.</td></tr>
                                    ) : (
                                        grievances.map(g => (
                                            <tr key={g.id}>
                                                <td><code>#{g.id}</code></td>
                                                <td><strong>{g.complainant_name}</strong></td>
                                                <td><code>{g.category}</code></td>
                                                <td><p style={{ margin: 0, fontSize: "12px" }}>{g.description}</p></td>
                                                <td>{g.constituency_name || "N/A"}</td>
                                                <td><span className={`status-badge ${g.status.toLowerCase()}`}>{g.status}</span></td>
                                                <td>
                                                    {g.status !== "RESOLVED" && (
                                                        <div style={{ display: "flex", gap: "5px" }}>
                                                            <button 
                                                                onClick={() => {
                                                                    const res = prompt("Enter resolution notes:");
                                                                    if (res) updateGrievanceStatus(g.id, "RESOLVED", res);
                                                                }}
                                                                style={{ background: "#22c55e", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                                                            >
                                                                Resolve
                                                            </button>
                                                            {g.status === "SUBMITTED" && (
                                                                <button 
                                                                    onClick={() => updateGrievanceStatus(g.id, "INVESTIGATION", null)}
                                                                    style={{ background: "#3b82f6", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                                                                >
                                                                    Investigate
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {g.status === "RESOLVED" && <p style={{ margin: 0, fontSize: "12px", color: "#22c55e" }}><strong>Resolved:</strong> {g.resolution}</p>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 17. COMPLIANCE CENTER */}
                {activeTab === "compliance" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>COMPLIANCE PORTAL</span>
                                <h1>Model Code of Conduct Compliance violations</h1>
                                <p>Review candidates and political parties conduct violation reports.</p>
                            </div>
                        </div>

                        <div className="card">
                            <h3>Violation Reports</h3>
                            <table className="audit-table" style={{ marginTop: "15px" }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Reporter</th>
                                        <th>Category</th>
                                        <th>Suspect</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Investigation / Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complianceViolations.length === 0 ? (
                                        <tr><td colSpan="7" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No compliance violations recorded.</td></tr>
                                    ) : (
                                        complianceViolations.map(c => (
                                            <tr key={c.id}>
                                                <td><code>#{c.id}</code></td>
                                                <td><strong>{c.reporter_name || "Citizen"}</strong></td>
                                                <td><code>{c.category}</code></td>
                                                <td><span style={{ color: "#b91c1c", fontWeight: "600" }}>{c.suspect}</span></td>
                                                <td><p style={{ margin: 0, fontSize: "12px" }}>{c.description}</p></td>
                                                <td><span className="status-badge" style={{ background: c.status === "CLOSED" ? "#f1f5f9" : "#fee2e2", color: c.status === "CLOSED" ? "#475569" : "#b91c1c" }}>{c.status}</span></td>
                                                <td>
                                                    {c.status !== "CLOSED" && (
                                                        <div style={{ display: "flex", gap: "5px" }}>
                                                            <button 
                                                                onClick={() => {
                                                                    const notes = prompt("Enter investigation notes:");
                                                                    if (notes) updateComplianceStatus(c.id, "CLOSED", notes);
                                                                }}
                                                                style={{ background: "#475569", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                                                            >
                                                                Close Violations
                                                            </button>
                                                            {c.status === "REPORTED" && (
                                                                <button 
                                                                    onClick={() => updateComplianceStatus(c.id, "UNDER_REVIEW", "Opened file for scrutiny")}
                                                                    style={{ background: "#ea580c", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                                                                >
                                                                    Under Review
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {c.status === "CLOSED" && <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}><strong>Closed notes:</strong> {c.investigation_notes}</p>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 18. INCIDENT LOG */}
                {activeTab === "incidents" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>SECURITY OPERATIONS CENTER</span>
                                <h1>Security & System Incidents Log</h1>
                                <p>Audit technical failures, unusual turnout deviations, offline stations, and transaction anomalies.</p>
                            </div>
                        </div>

                        <div className="card">
                            <h3>SOC Logs</h3>
                            <table className="audit-table" style={{ marginTop: "15px" }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Incident</th>
                                        <th>Severity</th>
                                        <th>Logged At</th>
                                        <th>Assigned Officer</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incidents.length === 0 ? (
                                        <tr><td colSpan="7" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No active incidents logged. All systems nominal.</td></tr>
                                    ) : (
                                        incidents.map(i => (
                                            <tr key={i.id}>
                                                <td><code>#{i.id}</code></td>
                                                <td>
                                                    <strong>{i.category}</strong>
                                                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>{i.description}</p>
                                                </td>
                                                <td>
                                                    <span className="status-badge" style={{
                                                        background: i.severity === "CRITICAL" ? "#fecaca" : (i.severity === "HIGH" ? "#ffedd5" : "#f1f5f9"),
                                                        color: i.severity === "CRITICAL" ? "#991b1b" : (i.severity === "HIGH" ? "#c2410c" : "#0f172a"),
                                                        fontWeight: "bold"
                                                    }}>
                                                        {i.severity}
                                                    </span>
                                                </td>
                                                <td>{format12HourDateTime(i.created_at)}</td>
                                                <td>{i.assigned_officer_name || "Unassigned"}</td>
                                                <td><span className={`status-badge ${i.status.toLowerCase()}`}>{i.status}</span></td>
                                                <td>
                                                    {i.status !== "RESOLVED" && (
                                                        <button 
                                                            onClick={() => {
                                                                const res = prompt("Enter resolution notes:");
                                                                if (res) updateIncidentStatus(i.id, "RESOLVED", res);
                                                            }}
                                                            style={{ background: "#22c55e", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                                                        >
                                                            Resolve Incident
                                                        </button>
                                                    )}
                                                    {i.status === "RESOLVED" && <p style={{ margin: 0, fontSize: "12px", color: "#22c55e" }}>{i.resolution}</p>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 19. VERSION HISTORY */}
                {activeTab === "version_history" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>VERSION AUDIT</span>
                                <h1>Configuration & Record Version History</h1>
                                <p>Track historical rollbacks, value changes, and modification audit trails.</p>
                            </div>
                        </div>

                        <div className="card">
                            <h3>Change Logs</h3>
                            <table className="audit-table" style={{ marginTop: "15px" }}>
                                <thead>
                                    <tr>
                                        <th>Table</th>
                                        <th>Record ID</th>
                                        <th>Modified By</th>
                                        <th>Reason/Action</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {versionHistory.length === 0 ? (
                                        <tr><td colSpan="5" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No version history recorded.</td></tr>
                                    ) : (
                                        versionHistory.map(v => (
                                            <tr key={v.id}>
                                                <td><code>{v.table_name}</code></td>
                                                <td><code>#{v.record_id}</code></td>
                                                <td><strong>{v.user_name}</strong></td>
                                                <td><p style={{ margin: 0, fontSize: "12px" }}>{v.reason}</p></td>
                                                <td>{format12HourDateTime(v.changed_at)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 20. AUDIT REPLAY */}
                {activeTab === "audit_replay" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>CHRONO TIMELINE</span>
                                <h1>Election Audit Replay Timeline</h1>
                                <p>Select an election to watch the chronological history of configurations, registrations, and transactions.</p>
                            </div>
                        </div>

                        <div className="card">
                            <label style={{ display: "block", color: "#64748b", fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>Choose Election to Replay</label>
                            <select 
                                value={auditReplayElectionId} 
                                onChange={(e) => {
                                    setAuditReplayElectionId(e.target.value);
                                    loadAuditReplayTimeline(e.target.value);
                                }}
                                style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "300px", marginBottom: "20px" }}
                            >
                                <option value="">-- Select Election --</option>
                                {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                            </select>

                            {auditReplayTimeline.length === 0 ? (
                                <p style={{ color: "#64748b", fontStyle: "italic" }}>No timeline events found. Please select an election.</p>
                            ) : (
                                <div style={{ borderLeft: "2px solid #3b82f6", marginLeft: "20px", paddingLeft: "20px", marginTop: "10px" }}>
                                    {auditReplayTimeline.map((item, index) => (
                                        <div key={index} style={{ position: "relative", marginBottom: "20px" }}>
                                            <div style={{
                                                position: "absolute",
                                                left: "-31px",
                                                top: "2px",
                                                background: item.source === "BLOCKCHAIN" ? "#22c55e" : "#3b82f6",
                                                color: "white",
                                                borderRadius: "50%",
                                                width: "20px",
                                                height: "20px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "10px",
                                                fontWeight: "bold"
                                            }}>
                                                {item.source === "BLOCKCHAIN" ? "CHAIN" : "SQL"}
                                            </div>
                                            <span style={{ fontSize: "11px", color: "#64748b" }}>{format12HourDateTime(item.timestamp)}</span>
                                            <h4 style={{ margin: "3px 0", fontSize: "14px", color: "#0f172a" }}>{item.title}</h4>
                                            <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 21. ELECTION ARCHIVE */}
                {activeTab === "archive" && (
                    <div className="admin-page">
                        <div className="admin-header">
                            <div>
                                <span>ARCHIVE FILES</span>
                                <h1>Election Archive Management</h1>
                                <p>Safely archive completed elections, snapshots of voter rolls, and final results data.</p>
                            </div>
                        </div>

                        <div className="card">
                            <h3>Completed Elections Eligible for Archiving</h3>
                            <table className="audit-table" style={{ marginTop: "15px" }}>
                                <thead>
                                    <tr>
                                        <th>Election</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {elections.filter(e => e.status === "RESULTS_PUBLISHED" || e.status === "ENDED").length === 0 ? (
                                        <tr><td colSpan="5" style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>No completed elections available to archive.</td></tr>
                                    ) : (
                                        elections.filter(e => e.status === "RESULTS_PUBLISHED" || e.status === "ENDED").map(e => (
                                            <tr key={e.id}>
                                                <td><strong>{e.title}</strong></td>
                                                <td>{format12HourDateTime(e.start_time)}</td>
                                                <td>{format12HourDateTime(e.end_time)}</td>
                                                <td><span className="status-badge counting">{e.status}</span></td>
                                                <td>
                                                    <button 
                                                        onClick={async () => {
                                                            if (!confirm("Are you sure you want to ARCHIVE this election? This is a permanent audit action.")) return;
                                                            try {
                                                                const res = await fetch(`http://localhost:5000/api/elections/${e.id}/status`, {
                                                                    method: "PUT",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                        Authorization: `Bearer ${localStorage.getItem("token")}`
                                                                    },
                                                                    body: JSON.stringify({ status: "ARCHIVED" })
                                                                });
                                                                const data = await res.json();
                                                                if (data.success) {
                                                                    alert("Election successfully archived!");
                                                                    loadElections();
                                                                } else { alert(data.message); }
                                                            } catch (err) { alert(err.message); }
                                                        }}
                                                        style={{ background: "#475569", border: "none", color: "white", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                                    >
                                                        Archive Election
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 22. DATABASE MANAGEMENT & MASTER TABLES EXPLORER */}
                {(activeTab === "database" || activeTab === "backup") && (
                    <div className="admin-page">
                        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <span style={{ color: "#ea580c", fontWeight: "700", fontSize: "11px", letterSpacing: "0.5px" }}>
                                    भारत निर्वाचन आयोग • RELATIONAL DATABASE REPOSITORY
                                </span>
                                <h1 style={{ margin: "4px 0 6px", fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
                                    PostgreSQL Database Management & Master Tables Explorer
                                </h1>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                                    Direct relational database access to statutory tables, schemas, and live records on PostgreSQL 18.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                <button
                                    onClick={loadDatabaseOverview}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        background: "#ffffff",
                                        border: "1px solid #cbd5e1",
                                        padding: "8px 14px",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: "#334155",
                                        cursor: "pointer"
                                    }}
                                >
                                    Refresh Database
                                </button>
                                <button
                                    onClick={handleTriggerDbBackup}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        background: "#1e3a8a",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        color: "#ffffff",
                                        cursor: "pointer",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    Create SQL Dump / Snapshot
                                </button>
                            </div>
                        </div>

                        {/* Telemetry Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                            <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #1e3a8a" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Database Cluster</span>
                                <h3 style={{ margin: "4px 0 2px", fontSize: "18px", color: "#0f172a" }}>{dbOverview?.database?.name || "evoting_db"}</h3>
                                <small style={{ color: "#059669", fontWeight: "700", fontSize: "11px" }}>Online • {dbOverview?.database?.version || "PostgreSQL 18"}</small>
                            </div>
                            <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #0284c7" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Master Tables</span>
                                <h3 style={{ margin: "4px 0 2px", fontSize: "18px", color: "#0f172a" }}>{dbOverview?.tables?.length || 27} Tables</h3>
                                <small style={{ color: "#64748b", fontSize: "11px" }}>Public Relational Schema</small>
                            </div>
                            <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #16a34a" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Total Records</span>
                                <h3 style={{ margin: "4px 0 2px", fontSize: "18px", color: "#16a34a" }}>{(dbOverview?.database?.totalRecords || 78075).toLocaleString()}</h3>
                                <small style={{ color: "#64748b", fontSize: "11px" }}>Electors, Votes, Geo, Audits</small>
                            </div>
                            <div className="card" style={{ padding: "14px 18px", borderLeft: "4px solid #ea580c" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Storage Footprint</span>
                                <h3 style={{ margin: "4px 0 2px", fontSize: "18px", color: "#ea580c" }}>{dbOverview?.database?.size || "25 MB"}</h3>
                                <small style={{ color: "#64748b", fontSize: "11px" }}>Tables & Indexes on Disk</small>
                            </div>
                        </div>

                        {dbBackupMsg && (
                            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 16px", borderRadius: "6px", marginBottom: "16px", fontSize: "12px", fontWeight: "600" }}>
                                {dbBackupMsg}
                            </div>
                        )}

                        {/* Main Explorer Dual-Pane Layout */}
                        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", alignItems: "start" }}>
                            
                            {/* Left Pane: Table Directory */}
                            <div className="card" style={{ padding: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                                        System Tables ({dbOverview?.tables?.length || 27})
                                    </h3>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter tables..."
                                    value={tableFilterSearch}
                                    onChange={(e) => setTableFilterSearch(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 10px",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        marginBottom: "10px",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <div style={{ maxHeight: "640px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {(dbOverview?.tables || [])
                                        .filter(t => !tableFilterSearch.trim() || t.table_name.toLowerCase().includes(tableFilterSearch.toLowerCase()))
                                        .map(t => {
                                            const isSel = selectedTable === t.table_name;
                                            return (
                                                <div
                                                    key={t.table_name}
                                                    onClick={() => {
                                                        setSelectedTable(t.table_name);
                                                        setTablePage(1);
                                                        setTableSearch("");
                                                    }}
                                                    style={{
                                                        padding: "10px 12px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        background: isSel ? "#eff6ff" : "transparent",
                                                        border: isSel ? "1px solid #3b82f6" : "1px solid transparent",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        transition: "all 0.15s ease"
                                                    }}
                                                >
                                                    <div>
                                                        <strong style={{ display: "block", fontSize: "12.5px", color: isSel ? "#1e3a8a" : "#1e293b", fontFamily: "monospace" }}>
                                                            {t.table_name}
                                                        </strong>
                                                        <small style={{ color: "#64748b", fontSize: "10.5px" }}>
                                                            {t.columns} columns • {t.total_size}
                                                        </small>
                                                    </div>
                                                    <span style={{
                                                        fontSize: "11px",
                                                        fontWeight: "700",
                                                        background: isSel ? "#1e3a8a" : "#f1f5f9",
                                                        color: isSel ? "#ffffff" : "#475569",
                                                        padding: "2px 8px",
                                                        borderRadius: "10px"
                                                    }}>
                                                        {t.rows.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Right Pane: Selected Table Inspector */}
                            <div className="card" style={{ padding: "18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "16px" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <h2 style={{ margin: 0, fontSize: "18px", fontFamily: "monospace", color: "#0f172a" }}>
                                                {selectedTable}
                                            </h2>
                                            <span style={{ background: "#dbeafe", color: "#1e40af", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px" }}>
                                                {tableData?.totalRows?.toLocaleString() || 0} Records
                                            </span>
                                            <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px" }}>
                                                {tableData?.columns?.length || 0} Columns
                                            </span>
                                        </div>
                                    </div>

                                    {/* View Mode Pills & Actions */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <div style={{ display: "flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px" }}>
                                            <button
                                                onClick={() => setDbViewMode("data")}
                                                style={{
                                                    border: "none",
                                                    padding: "5px 12px",
                                                    borderRadius: "4px",
                                                    fontSize: "11.5px",
                                                    fontWeight: "700",
                                                    cursor: "pointer",
                                                    background: dbViewMode === "data" ? "#1e3a8a" : "transparent",
                                                    color: dbViewMode === "data" ? "#ffffff" : "#475569"
                                                }}
                                            >
                                                Live Records
                                            </button>
                                            <button
                                                onClick={() => setDbViewMode("schema")}
                                                style={{
                                                    border: "none",
                                                    padding: "5px 12px",
                                                    borderRadius: "4px",
                                                    fontSize: "11.5px",
                                                    fontWeight: "700",
                                                    cursor: "pointer",
                                                    background: dbViewMode === "schema" ? "#1e3a8a" : "transparent",
                                                    color: dbViewMode === "schema" ? "#ffffff" : "#475569"
                                                }}
                                            >
                                                Table Schema
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleExportTableCsv}
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #cbd5e1",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                fontSize: "11.5px",
                                                fontWeight: "600",
                                                color: "#334155",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Export CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Table Search and Limit Controls */}
                                {dbViewMode === "data" && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1, maxWidth: "400px" }}>
                                            <input
                                                type="text"
                                                placeholder={`Search records in ${selectedTable}...`}
                                                value={tableSearch}
                                                onChange={(e) => {
                                                    setTableSearch(e.target.value);
                                                    setTablePage(1);
                                                }}
                                                style={{
                                                    width: "100%",
                                                    padding: "6px 12px",
                                                    border: "1px solid #cbd5e1",
                                                    borderRadius: "6px",
                                                    fontSize: "12px"
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <label style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600" }}>Rows per page:</label>
                                            <select
                                                value={tableLimit}
                                                onChange={(e) => {
                                                    setTableLimit(parseInt(e.target.value, 10));
                                                    setTablePage(1);
                                                }}
                                                style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12px" }}
                                            >
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* DATA VIEW */}
                                {dbViewMode === "data" && (
                                    <>
                                        {tableLoading ? (
                                            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                                                <div style={{ fontSize: "13px", fontWeight: "600" }}>Querying PostgreSQL database...</div>
                                            </div>
                                        ) : !tableData || !tableData.rows || tableData.rows.length === 0 ? (
                                            <div style={{ padding: "40px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "6px" }}>
                                                <p style={{ margin: 0, fontStyle: "italic", fontSize: "13px" }}>
                                                    {tableSearch ? `No records in '${selectedTable}' matched search '${tableSearch}'.` : `No records found in table '${selectedTable}'.`}
                                                </p>
                                            </div>
                                        ) : (
                                            <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "6px", maxHeight: "560px" }}>
                                                <table className="audit-table" style={{ width: "100%", fontSize: "11.5px", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
                                                    <thead style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 2 }}>
                                                        <tr>
                                                            {tableData.columns.map(col => (
                                                                <th
                                                                    key={col.column_name}
                                                                    onClick={() => {
                                                                        if (tableSortBy === col.column_name) {
                                                                            setTableSortDir(tableSortDir === "ASC" ? "DESC" : "ASC");
                                                                        } else {
                                                                            setTableSortBy(col.column_name);
                                                                            setTableSortDir("ASC");
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        padding: "8px 12px",
                                                                        textAlign: "left",
                                                                        borderBottom: "2px solid #cbd5e1",
                                                                        cursor: "pointer",
                                                                        color: tableSortBy === col.column_name ? "#1e3a8a" : "#334155"
                                                                    }}
                                                                >
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                                        <span>{col.column_name}</span>
                                                                        {tableSortBy === col.column_name && (
                                                                            <span style={{ fontSize: "10px" }}>{tableSortDir === "ASC" ? "▲" : "▼"}</span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ fontSize: "9.5px", fontWeight: "normal", color: "#94a3b8" }}>
                                                                        {col.data_type}
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tableData.rows.map((row, rIdx) => (
                                                            <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                                                                {tableData.columns.map(col => {
                                                                    const val = row[col.column_name];
                                                                    if (val === null || val === undefined) {
                                                                        return <td key={col.column_name} style={{ padding: "7px 12px", color: "#cbd5e1", fontStyle: "italic" }}>null</td>;
                                                                    }
                                                                    if (typeof val === "boolean") {
                                                                        return (
                                                                            <td key={col.column_name} style={{ padding: "7px 12px" }}>
                                                                                <span style={{
                                                                                    background: val ? "#dcfce7" : "#f1f5f9",
                                                                                    color: val ? "#15803d" : "#64748b",
                                                                                    fontSize: "10px",
                                                                                    fontWeight: "700",
                                                                                    padding: "2px 6px",
                                                                                    borderRadius: "4px"
                                                                                }}>
                                                                                    {val ? "TRUE" : "FALSE"}
                                                                                </span>
                                                                            </td>
                                                                        );
                                                                    }
                                                                    const strVal = typeof val === "object" ? JSON.stringify(val) : String(val);
                                                                    const isTruncated = strVal.length > 55;
                                                                    return (
                                                                        <td
                                                                            key={col.column_name}
                                                                            title={isTruncated ? strVal : undefined}
                                                                            style={{
                                                                                padding: "7px 12px",
                                                                                maxWidth: "240px",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis"
                                                                            }}
                                                                        >
                                                                            {isTruncated ? strVal.substring(0, 55) + "..." : strVal}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Pagination Bar */}
                                        {tableData && tableData.totalPages > 1 && (
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", flexWrap: "wrap", gap: "10px" }}>
                                                <small style={{ color: "#64748b", fontSize: "11.5px" }}>
                                                    Showing {((tableData.page - 1) * tableData.limit) + 1} to {Math.min(tableData.page * tableData.limit, tableData.totalRows)} of {tableData.totalRows?.toLocaleString()} records
                                                </small>
                                                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                    <button
                                                        disabled={tableData.page <= 1}
                                                        onClick={() => setTablePage(p => Math.max(1, p - 1))}
                                                        style={{
                                                            padding: "5px 12px",
                                                            border: "1px solid #cbd5e1",
                                                            background: tableData.page <= 1 ? "#f1f5f9" : "#ffffff",
                                                            color: tableData.page <= 1 ? "#94a3b8" : "#334155",
                                                            borderRadius: "4px",
                                                            cursor: tableData.page <= 1 ? "not-allowed" : "pointer",
                                                            fontSize: "12px"
                                                        }}
                                                    >
                                                        ← Previous
                                                    </button>
                                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b", padding: "0 8px" }}>
                                                        Page {tableData.page} of {tableData.totalPages}
                                                    </span>
                                                    <button
                                                        disabled={tableData.page >= tableData.totalPages}
                                                        onClick={() => setTablePage(p => Math.min(tableData.totalPages, p + 1))}
                                                        style={{
                                                            padding: "5px 12px",
                                                            border: "1px solid #cbd5e1",
                                                            background: tableData.page >= tableData.totalPages ? "#f1f5f9" : "#ffffff",
                                                            color: tableData.page >= tableData.totalPages ? "#94a3b8" : "#334155",
                                                            borderRadius: "4px",
                                                            cursor: tableData.page >= tableData.totalPages ? "not-allowed" : "pointer",
                                                            fontSize: "12px"
                                                        }}
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* SCHEMA VIEW */}
                                {dbViewMode === "schema" && (
                                    <div style={{ overflowX: "auto" }}>
                                        <table className="audit-table" style={{ width: "100%", fontSize: "12px" }}>
                                            <thead>
                                                <tr>
                                                    <th>Column Name</th>
                                                    <th>Data Type</th>
                                                    <th>Nullable</th>
                                                    <th>Default Expression</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(tableData?.columns || []).map(col => (
                                                    <tr key={col.column_name}>
                                                        <td><code style={{ fontWeight: "700", color: "#1e3a8a" }}>{col.column_name}</code></td>
                                                        <td><span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>{col.data_type}</span></td>
                                                        <td>
                                                            <span style={{
                                                                background: col.is_nullable === "YES" ? "#f1f5f9" : "#fee2e2",
                                                                color: col.is_nullable === "YES" ? "#64748b" : "#b91c1c",
                                                                fontWeight: "700",
                                                                fontSize: "10.5px",
                                                                padding: "2px 6px",
                                                                borderRadius: "4px"
                                                            }}>
                                                                {col.is_nullable}
                                                            </span>
                                                        </td>
                                                        <td><code style={{ fontSize: "11px", color: "#64748b" }}>{col.column_default || "—"}</code></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );

}

export default AdminDashboard;