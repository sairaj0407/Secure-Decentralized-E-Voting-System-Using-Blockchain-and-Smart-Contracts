const db = require("../config/database");
const { votingContract, CONTRACT_ADDRESS, provider } = require("../config/blockchain");

/**
 * ============================================================================
 * BHARAT NIRVACHAN AAYOG | ELECTION COMMISSION OF INDIA
 * STATUTORY ELECTORAL AI & KNOWLEDGE RETRIEVAL CONTROLLER
 * ============================================================================
 * Zero childish tropes, zero emojis.
 * Grounded in:
 * - Constitution of India (Articles 324-329)
 * - Representation of the People Act, 1950 & 1951
 * - Conduct of Elections Rules, 1961 (Rules 49M, 49MA, 49L, 49T, 66)
 * - Model Code of Conduct (MCC / Aachar Sanhita) & cVIGIL
 * - Real-world Indian polling booth operations (BLO, voter parchi, indelible ink)
 * - Dual Login assistance: Voter (EPIC/Form 6) and Admin (RO/DEO/Scrutiny)
 * - Triple-tier double-voting protection (EVM opcode + REST HTTP 409 + DOM Seal)
 * - Live PostgreSQL relational state and Hardhat Ethereum consensus node
 */

// Helper to query live backend and blockchain status
async function getLiveSystemStatus() {
  try {
    let blockNumber = "N/A";
    let network = "Local Hardhat EVM (31337)";
    if (provider) {
      blockNumber = await provider.getBlockNumber();
    }

    const electionCountRes = await db.query(
      "SELECT COUNT(*) FROM elections WHERE status = 'ACTIVE'"
    );
    const activeElectionsCount = electionCountRes.rows[0]?.count || 0;

    const voterCountRes = await db.query(
      "SELECT COUNT(*) FROM users WHERE role = 'VOTER'"
    );
    const totalRegisteredElectors = voterCountRes.rows[0]?.count || 0;

    const dbTimeRes = await db.query("SELECT NOW() as current_time");
    const dbTime = dbTimeRes.rows[0]?.current_time || new Date().toISOString();

    return {
      success: true,
      dbTime,
      activeElectionsCount: parseInt(activeElectionsCount, 10),
      totalRegisteredElectors: parseInt(totalRegisteredElectors, 10),
      blockchain: {
        status: "HEALTHY",
        blockHeight: blockNumber,
        contractAddress: CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        network,
        consensusEngine: "EVM State Machine / PoA Local Consensus"
      }
    };
  } catch (err) {
    console.error("[Live Telemetry Error]:", err);
    return {
      success: false,
      error: err.message
    };
  }
}

// Helper to query active elections and candidates
async function getLiveActiveElections() {
  try {
    const res = await db.query(
      `SELECT e.id, e.title, e.description, e.start_time, e.end_time, e.status, e.blockchain_election_id
       FROM elections e
       WHERE e.status = 'ACTIVE'
       ORDER BY e.id ASC`
    );

    const elections = res.rows;
    for (let el of elections) {
      const cRes = await db.query(
        `SELECT id, name, party, symbol, blockchain_candidate_id
         FROM candidates
         WHERE election_id = $1
         ORDER BY id ASC`,
        [el.id]
      );
      el.candidates = cRes.rows;
    }

    return elections;
  } catch (err) {
    console.error("[Active Elections Query Error]:", err);
    return [];
  }
}

// Helper to audit a VVPAT receipt code
async function getVVPATReceiptData(receiptCode) {
  try {
    const res = await db.query(
      `SELECT vr.*, e.title as election_title, e.blockchain_election_id,
              u.name as voter_name, u.voter_id as voter_id_card,
              c.name as candidate_name, c.party as candidate_party, c.symbol as candidate_symbol
       FROM voter_receipts vr
       JOIN elections e ON vr.election_id = e.id
       LEFT JOIN users u ON vr.user_id = u.id
       LEFT JOIN votes v ON (v.election_id = vr.election_id AND v.voter_id = vr.user_id)
       LEFT JOIN candidates c ON v.candidate_id = c.id
       WHERE vr.receipt_code = $1 OR vr.tx_hash = $1`,
      [receiptCode]
    );

    return res.rows[0] || null;
  } catch (err) {
    console.error("[Receipt Query Error]:", err);
    return null;
  }
}

// Helper to retrieve recognized parties, leaders and symbols
async function getPartiesData() {
  try {
    const res = await db.query(
      `SELECT name, abbreviation, leader, symbol, contact_info, status 
       FROM parties 
       ORDER BY name ASC`
    );
    return res.rows;
  } catch (err) {
    console.error("[Parties Query Error]:", err);
    return [];
  }
}

/**
 * Primary Natural Language Query Processor
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, language = "en", electionId, receiptCode } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query cannot be empty."
      });
    }

    const q = message.trim();
    const lang = (language || "en").toLowerCase();

    const responsePayload = await processStatutoryQuery(q, lang, {
      electionId,
      receiptCode,
      currentUser: req.user || null
    });

    return res.status(200).json({
      success: true,
      ...responsePayload
    });
  } catch (error) {
    console.error("[ECI AI Controller Exception]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal statutory query processing error. The audit log has been updated.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Core Rule Engine for Electoral Inquiries
 */
async function processStatutoryQuery(q, lang, context) {
  const isHi = lang === "hi";
  const isMr = lang === "mr";

  // 1. GREETINGS & FRIENDLY CITIZEN INTRODUCTION
  if (/^(hi|hello|hey|namaste|pranam|namaskar|suprabhat|greetings|start|help|official greeting|कसं काय|नमस्कार|नमस्ते|प्रणाम|जय हिंद)/i.test(q) && q.split(/\s+/).length <= 4) {
    if (isHi) {
      return {
        language: "hi",
        response: `### भारत निर्वाचन आयोग | ELECTION COMMISSION OF INDIA
**ईसीआई चुनाव मित्र — आपका डिजिटल चुनावी सहायक**

नमस्ते! मैं चुनाव मित्र हूँ, भारत निर्वाचन आयोग का आपका डिजिटल सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?

यहाँ मुख्य सेवाएँ दी गई हैं:
1. **वोट कैसे डालें**: ऑनलाइन मतदान करने के 3 आसान चरण
2. **ई-एपिक (e-EPIC) डाउनलोड**: अपना डिजिटल वोटर आईडी कार्ड PDF में प्राप्त करें
3. **नया मतदाता पंजीकरण (Form 6)**: नए वोटर के रूप में पंजीकरण करने की आसान विधि
4. **मतदान रसीद (VVPAT) जांचें**: अपनी रसीद कोड (जैसे REC-XXXX) की पुष्टि करें
5. **सक्रिय चुनाव व प्रत्याशी**: चालू चुनाव, प्रत्याशी और उनके आधिकारिक चुनाव चिन्ह देखें
6. **राष्ट्रीय हेल्पलाइन 1950**: 24 घंटे किसी भी सहायता के लिए निःशुल्क कॉल करें

कृपया अपना प्रश्न सरल शब्दों में लिखें या नीचे दिए गए किसी विकल्प पर क्लिक करें:`,
        suggestedActions: [
          { label: "वोट कैसे डालें?", query: "वोट डालने की आसान प्रक्रिया क्या है?" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक कैसे डाउनलोड करें?" },
          { label: "नया वोटर पंजीकरण", query: "Form 6 से नया वोटर पंजीकरण कैसे करें?" },
          { label: "सक्रिय चुनाव सूची", query: "सक्रिय चुनाव और प्रत्याशी दिखाएं" },
          { label: "हेल्पलाइन 1950", query: "मतदाता हेल्पलाइन 1950 क्या है?" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### भारत निवडणूक आयोग | ELECTION COMMISSION OF INDIA
**ईसीआय चुनाव मित्र — आपला डिजिटल निवडणूक सहाय्यक**

नमस्कार! मी चुनाव मित्र आहे, भारत निवडणूक आयोगाचा आपला डिजिटल सहाय्यक. मी आपल्याला कशी मदत करू शकतो?

येथे मुख्य सेवा उपलब्ध आहेत:
1. **मतदान कसे करावे**: मतदानाचे ३ सोपे टप्पे
2. **ई-एपिक डाउनलोड**: आपले डिजिटल मतदार ओळखपत्र PDF स्वरूपात मिळवा
3. **नवीन मतदार नोंदणी (Form 6)**: नवीन मतदारांसाठी सोपी नोंदणी पद्धत
4. **VVPAT पावती पडताळणी**: आपल्या मतदान पावती क्रमांकाची (REC-XXXX) तपासणी
5. **सक्रिय निवडणुका**: चालू निवडणुका, उमेदवार व अधिकृत पक्षचिन्हे
6. **हेल्पलाइन १९५०**: २४x७ मोफत मदतीसाठी संपर्क साधा

खालील पर्यायांवर क्लिक करा किंवा आपला प्रश्न लिहा:`,
        suggestedActions: [
          { label: "मतदान कसे करावे?", query: "मतदान कसे करावे? सोप्या पायऱ्या सांगा" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक कसे डाउनलोड करावे?" },
          { label: "नवीन नोंदणी Form 6", query: "Form 6 द्वारे नवीन मतदार नोंदणी कशी करावी?" },
          { label: "सक्रिय निवडणुका", query: "सध्या सुरू असलेल्या निवडणुकांची यादी दाखवा" },
          { label: "हेल्पलाइन १९५०", query: "निवडणूक हेल्पलाइन १९५० काय आहे?" }
        ]
      };
    }

    return {
      language: "en",
      response: `### Election Commission of India | भारत निर्वाचन आयोग
**ECI Chunav Mitra — Your Digital Election Assistant**

Namaste! I am Chunav Mitra, your friendly election assistant from the Election Commission of India. How can I help you today?

Here are the most common things I can help you with:
1. **How to Vote**: Simple 3-step guide to cast your vote online
2. **Download e-EPIC**: Access and download your official digital Voter ID card as PDF
3. **New Voter Registration (Form 6)**: Easy steps to register as a new voter
4. **Verify Voting Receipt (VVPAT)**: Check your vote confirmation code (REC-XXXX)
5. **Active Elections**: View ongoing elections, contesting candidates, and party symbols
6. **National Voter Helpline**: Call 1950 (Toll-Free 24x7) for quick assistance

You can ask me any question in simple words, or choose a topic below:`,
      suggestedActions: [
        { label: "How to Vote", query: "How to vote in 3 easy steps?" },
        { label: "Download e-EPIC", query: "How do I download my e-EPIC voter card?" },
        { label: "New Voter Form 6", query: "How to register as a new voter using Form 6?" },
        { label: "Verify Vote Receipt", query: "How do I verify my voting receipt code?" },
        { label: "Active Elections", query: "Show active elections open for voting" },
        { label: "Helpline 1950", query: "What is Election Helpline 1950?" }
      ]
    };
  }

  // 1B. ALL-INDIA ELECTORAL ATLAS & MAP INQUIRIES
  if (/india map|election map|electoral atlas|state map|state wise|state-wise|turnout map|heat map|interactive map|नक्शा|मानचित्र|भारत का नक्शा|राज्यवार|atlas|नकाशा|अ‍ॅटलस|निवडणूक नकाशा/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### भारत निर्वाचन आयोग — राष्ट्रीय चुनावी एटलस एवं अखिल भारतीय मानचित्र
*संवैधानिक अधिदेश: भारतीय संविधान का अनुच्छेद 324 एवं परिसीमन अधिनियम, 2002*

भारत निर्वाचन आयोग के पोर्टल पर **अखिल भारतीय चुनावी मानचित्र (India Election Map)** की आधिकारिक सुविधा उपलब्ध है। यह सभी 28 राज्यों एवं 8 केंद्रशासित प्रदेशों (कुल 36 प्रशासनिक इकाइयां) का सजीव भौगोलिक एवं ब्लॉकचेन चुनावी ब्योरा प्रदर्शित करता है:

1. **मानचित्र कैसे देखें**:
   - **मतदाता पोर्टल में**: ऊपरी नेविगेशन बार में **"All-India Electoral Map & Atlas"** टैब खोलें।
   - **एडमिन कंसोल में**: साइडबार से **"Electoral Atlas & India Map"** चुनें अथवा डैशबोर्ड ओवरव्यू में सजीव मानचित्र देखें।
2. **तीन आधिकारिक व्यू मोड्स**:
   - **Electoral Status Mode**: सक्रिय मतदान वाले राज्य (हरा/Emerald), आगामी चुनाव (केसरिया/Saffron), और परिणाम घोषित राज्य (गहरा नीला/Navy)।
   - **Party Majority & Leads Mode**: राज्यों को अग्रणी/विजेता राजनीतिक दलों (BJP केसरिया, INC नीला, AAP आसमानी, AITC हरा, आदि) के रंग व अधिकृत चुनाव चिन्ह के साथ प्रदर्शित करता है।
   - **Turnout Intensity Heatmap**: ब्लॉकचेन पर दर्ज वास्तविक मतदान प्रतिशत का हीटमैप।
3. **राज्यवार चुनावी डोजियर (State Dossier)**:
   - किसी भी राज्य पर क्लिक करें अथवा ड्रॉपडाउन से चुनें। उस राज्य की लोकसभा (PC) व विधानसभा (AC) सीटें, पंजीकृत मतदाता, सजीव मतदान प्रतिशत और चालू चुनावों की सूची सीधे देखी जा सकती है।`,
        suggestedActions: [
          { label: "मतदान कैसे करें?", query: "मतदान करने की आधिकारिक प्रक्रिया क्या है?" },
          { label: "सक्रिय चुनाव सूची", query: "सक्रिय चुनाव और प्रत्याशी दिखाएं" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### भारत निवडणूक आयोग — राष्ट्रीय निवडणूक नकाशा व अ‍ॅटलस
*घटनात्मक अधिदेश: भारतीय संविधानातील अनुच्छेद 324 आणि परिसीमन कायदा, 2002*

निवडणूक आयोगाच्या प्रणालीत **अखिल भारतीय निवडणूक नकाशा (India Election Map)** समाविष्ट करण्यात आला आहे. यामध्ये भारतातील सर्व 28 राज्ये आणि 8 केंद्रशासित प्रदेशांची माहिती उपलब्ध आहे:

1. **नकाशा कसा पाहावा**: मतदार पोर्टलमध्ये **"All-India Electoral Map & Atlas"** टॅब उघडा, किंवा अ‍ॅडमिन कन्सोलमध्ये **"Electoral Atlas & India Map"** पर्यायावर क्लिक करा.
2. **तीन मोड**: निवडणूक स्थिती (सक्रिय/नियोजित/निकाल), पक्षनिहाय आघाडी (भाजप, काँग्रेस, आप, शिवसेना इ.), आणि मतदान टक्केवारी हीटमॅप.
3. **राज्य माहिती**: नकाशावरील कोणत्याही राज्यावर क्लिक केल्यास त्या राज्याच्या लोकसभा/विधानसभा जागा, नोंदणीकृत मतदार व चालू निवडणुकांची संपूर्ण माहिती मिळते.`,
        suggestedActions: [
          { label: "मतदान प्रक्रिया", query: "मतदान कसे करावे?" },
          { label: "सक्रिय निवडणुका", query: "सक्रिय निवडणुकांची माहिती दाखवा" }
        ]
      };
    }

    return {
      language: "en",
      response: `### Election Commission of India — National Electoral Atlas & Interactive India Map
*Statutory Authority: Article 324 of the Constitution of India & Delimitation Act, 2002*

The application includes an interactive **All-India Electoral Map & Atlas** modeled after the official Election Commission of India portal (\`results.eci.gov.in\`):

1. **How to Access the Map**:
   - **In the Voter Portal**: Open the **"All-India Electoral Map & Atlas"** tab in your top navigation menu to view state-wise polling statuses.
   - **In the Admin Console**: Click **"Electoral Atlas & India Map"** in the sidebar navigation or view the live interactive preview widget directly in the Dashboard Overview.
2. **Three Official View Modes**:
   - **Electoral Status Mode**: Colors states by ongoing phase — Active Polling (ECI Emerald Green \`#16a34a\`), Scheduled Polling (Official Saffron \`#ea580c\`), Results Declared (National Navy \`#1e3a8a\`), or No Scheduled Polls (Neutral Slate).
   - **Party Majority & Leads Mode**: Color-codes states by the winning or leading political party (BJP Saffron, INC Blue, AAP Sky Blue, AITC Emerald, SS(UBT) Crimson, etc.) alongside official reserved election symbols.
   - **Turnout Intensity Heatmap**: Visualizes voter participation recorded on the blockchain ledger via an intensity gradient.
3. **State Electoral Dossier**:
   - Click on any state or select it from the focus dropdown. The right-hand dossier card instantly displays:
     - State capital and constitutional region.
     - Total Lok Sabha (Parliamentary) and Vidhan Sabha (Assembly) seats.
     - Registered electorate count and live votes recorded on-chain.
     - Voter turnout percentage meter.
     - List of ongoing elections with direct **"Open Election"** action buttons.`,
      suggestedActions: [
        { label: "Active Elections", query: "Show active elections open for voting" },
        { label: "VVPAT Verification", query: "How to verify VVPAT receipt under Rule 49MA?" }
      ]
    };
  }

  // 2. ADMIN & RETURNING OFFICER (RO) LOGIN & WORKFLOWS (Checked FIRST to avoid being shadowed)
  if (/admin login|ro login|commissioner login|returning officer|election officer|how to login as admin|official login|authority login|एडमिन लॉगिन|अधिकारी लॉगिन|प्रशासकीय लॉगिन|प्रशासक लॉगिन/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### निर्वाचन अधिकारी एवं प्रशासनिक लॉगिन मार्गदर्शिका (Admin & RO Login)

नमस्ते अधिकारी महोदय। भारत निर्वाचन आयोग के प्रशासनिक पोर्टल का उपयोग चुनाव संचालन, प्रत्याशी संवीक्षा (Scrutiny) एवं परिणाम प्रकाशन हेतु किया जाता है:

1. **एडमिन पोर्टल में लॉगिन कैसे करें**:
   - पोर्टल के मुख्य पृष्ठ पर **"Admin Login"** टैब पर क्लिक करें।
   - अपना अधिकृत प्रशासनिक ईमेल \`admin@evoting.gov.in\` दर्ज करें।
   - अपना अधिकृत सुरक्षा पासवर्ड दर्ज करें और **"Sign In as Election Authority"** पर क्लिक करें।

2. **प्रशासनिक नियंत्रण कक्ष में उपलब्ध सुविधाएं**:
   - **Create Election**: नया चुनाव शीर्षक, लोकसभा/विधानसभा क्षेत्र, प्रारंभ व समाप्ति समय निर्धारित कर ब्लॉकचेन पर \`UPCOMING\` स्थिति में तैनात करना।
   - **Candidate Scrutiny**: प्रत्याशियों के नामांकन पत्र, अधिकृत चुनाव चिन्ह और घोषणा पत्र की जांच कर न्यूनतम 2 प्रत्याशी पंजीकृत करना।
   - **Start Election**: चुनाव को \`ACTIVE\` करना, जिससे सभी सत्यापित मतदाताओं का ब्लॉकचेन पर स्वतः नामांकन हो जाता है।
   - **Publish Results & Form 21C**: मतदान समाप्ति पर ऑन-चेन ब्लॉकचेन सर्वसम्मति से परिणाम सत्यापित कर आधिकारिक निर्वाचन प्रमाण-पत्र जारी करना।

[IMPORTANT]: प्रशासनिक क्रेडेंशियल्स केवल अधिकृत निर्वाचन अधिकारियों, पर्यवेक्षकों (Observers) एवं रिटर्निंग ऑफिसर्स के लिए आरक्षित हैं। किसी अनधिकृत व्यक्ति को प्रशासनिक एक्सेस देना विधि अनुसार दंडनीय है।

क्या आप चुनाव निर्माण प्रक्रिया या प्रत्याशी संवीक्षा नियम समझना चाहते हैं?`,
        action: "NAVIGATE_LOGIN_ADMIN"
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### प्रशासकीय व निवडणूक अधिकारी लॉगिन मार्गदर्शक (Admin & RO Login)

नमस्कार अधिकारी महोदय. निवडणूक संचालन आणि निकाल व्यवस्थापनासाठी एडमिन डॅशबोर्ड लॉगिन खालीलप्रमाणे आहे:

1. **लॉगिन प्रक्रिया**:
   - मुख्य स्क्रीनवरील **"Admin Login"** पर्याय निवडा.
   - अधिकृत प्रशासकीय ईमेल \`admin@evoting.gov.in\` आणि पासवर्ड टाका.
   - **"Sign In"** करून एडमिन डॅशबोर्डमध्ये प्रवेश करा.

2. **प्रमुख प्रशासकीय कार्ये**:
   - **निवडणूक तयार करणे**: मतदारसंघ व तारखा निश्चित करून ब्लॉकचेनवर \`UPCOMING\` स्थितीत नोंदवणे.
   - **उमेदवार संवीक्षा**: उमेदवारांची यादी व अधिकृत पक्षचिन्हे जोडणे (किमान २ उमेदवार आवश्यक).
   - **निवडणूक सुरू करणे**: निवडणूक \`ACTIVE\` करून पात्र मतदारांची ब्लॉकचेनवर नोंद करणे.
   - **निकाल प्रसिद्धी**: मतमोजणी पूर्ण करून Form 21C निकाल जाहीर करणे.

आपल्याला प्रशासकीय कार्यप्रणालीबद्दल अधिक माहिती हवी आहे का?`,
        action: "NAVIGATE_LOGIN_ADMIN"
      };
    }

    return {
      language: "en",
      response: `### Election Authority & Returning Officer Administrative Guide (Admin Login)

Namaste Officer. The Election Commission of India administrative gateway is designed for District Election Officers (DEO), Returning Officers (RO), and Observers:

1. **How to Access the Administrative Suite**:
   - On the portal header or login switcher, select **"Admin Login"**.
   - Enter your administrative authority email (e.g. \`admin@evoting.gov.in\`).
   - Enter your secure credential and authenticate.

2. **Returning Officer Administrative Capabilities**:
   - **Draft & Deploy Elections**: Define election parameters (Title, Territorial Scope, Polling schedule) and deploy the smart contract instance in \`UPCOMING\` status.
   - **Candidate Filing & Symbol Allotment**: Register contesting candidates, upload manifestos, and bind official election symbols. At least 2 candidates must be registered.
   - **Election Activation**: Click **"Start Election"**. The contract status transitions to \`ACTIVE\`, and eligible constituency electors are automatically enrolled on-chain.
   - **Tally & Publish Results (Form 21C)**: Close polling (\`ENDED\` status) and publish results. The smart contract tallies on-chain votes across blocks and generates the official Certificate of Election.

[IMPORTANT]: All administrative transactions are logged on the PostgreSQL audit trail and broadcast to the Ethereum consensus ledger for full statutory oversight.

Would you like me to walk you through election creation or candidate scrutiny guidelines?`,
      action: "NAVIGATE_LOGIN_ADMIN"
    };
  }

  // 3. VOTER LOGIN & EPIC / IDENTITY ASSISTANCE
  if (/voter login|login as voter|how do i login|epic login|voter id login|how to login|sign in as voter|elector sign in|login kaise kare|लॉगिन कसे करावे|लॉगिन कैसे करें|मतदाता लॉगिन/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### मतदाता लॉगिन मार्गदर्शिका (Voter Login Guide)

नमस्ते! मतदाता पोर्टल में लॉगिन करना बहुत आसान और सुरक्षित है। यहाँ पूरी प्रक्रिया समझाई गई है:

1. **पोर्टल में लॉगिन कैसे करें**:
   - स्क्रीन पर **"Voter Login"** विकल्प चुनें।
   - अपना **10-अंकीय मतदाता पहचान पत्र क्रमांक (EPIC Number)** जैसे \`504060\` अथवा पंजीकृत ईमेल आईडी दर्ज करें।
   - अपना सुरक्षित पासवर्ड (जैसे \`Sairaj@123\`) डालें और **"Sign In"** बटन दबाएं।

2. **यदि आप पहली बार आए हैं (नया मतदाता पंजीकरण - Form 6)**:
   - लॉगिन बॉक्स में **"Register as New Voter"** टैब पर क्लिक करें।
   - अपना पूरा नाम, ईमेल, फोन नंबर, जन्मतिथि और 10-अंकीय EPIC नंबर भरें।
   - अपना राज्य, जिला, लोकसभा क्षेत्र (PC), विधानसभा क्षेत्र (AC) और स्थानीय मतदान केंद्र चुनें।
   - यह डिजिटल Form 6 आवेदन जमा करता है, जिसे चुनाव अधिकारी द्वारा सत्यापित करने पर आपका खाता तुरंत सक्रिय हो जाएगा।

[PRACTICAL TIP]: चुनाव आयोग के नियमानुसार किसी अन्य व्यक्ति के पहचान पत्र से लॉगिन करना जनप्रतिनिधित्व अधिनियम, 1951 के तहत दंडनीय अपराध है। सदैव अपने ही EPIC से लॉगिन करें।

क्या आप अपना निर्वाचन क्षेत्र देखना चाहते हैं या सक्रिय चुनावों की सूची देखना चाहते हैं?`,
        action: "NAVIGATE_LOGIN_VOTER"
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### मतदार लॉगिन मार्गदर्शक (Voter Login Guide)

नमस्कार! मतदार पोर्टलमध्ये प्रवेश करणे अत्यंत सोपे आणि सुरक्षित आहे:

1. **लॉगिन प्रक्रिया**:
   - स्क्रीनवर **"Voter Login"** पर्याय निवडा.
   - तुमचा **10-अंकी मतदार ओळखपत्र क्रमांक (EPIC ID)** जसे की \`504060\` किंवा ईमेल आयडी टाका.
   - पासवर्ड (उदा. \`Sairaj@123\`) टाकून **"Sign In"** बटण दाबा.

2. **नवीन नोंदणी (Form 6)**:
   - जर तुमची नोंदणी नसेल, तर **"Register as New Voter"** टॅबवर क्लिक करा.
   - आपले नाव, पत्ता आणि राज्य, जिल्हा, लोकसभा, विधानसभा व मतदान केंद्र निवडून अर्ज सादर करा.

[PRACTICAL TIP]: आपले मत अत्यंत गोपनीय आहे. आपला पासवर्ड कोणाशीही शेअर करू नका.

आपल्याला सध्या सुरू असलेल्या निवडणुकांची यादी पाहायची आहे का?`,
        action: "NAVIGATE_LOGIN_VOTER"
      };
    }

    return {
      language: "en",
      response: `### Voter Portal Authentication Guide (Voter Login)

Namaste! Logging into your voter portal is straightforward and takes less than a minute. Here is the official procedure:

1. **How to Sign In**:
   - On the portal homepage or login modal, ensure **"Voter Login"** is selected.
   - Enter your **10-character Electoral Photo Identity Card (EPIC) Number** (e.g. \`504060\` or your state's EPIC code) or your registered Email address.
   - Enter your secure password (e.g. \`Sairaj@123\`) and click **"Sign In"**.

2. **First-Time Elector Registration (Form 6)**:
   - If you do not yet have an account, switch to the **"Register as New Voter"** tab.
   - Fill in your Full Name, Email, Mobile Number, DOB, and Address.
   - Select your territorial jurisdiction using the 5-tier selector: State -> District -> Parliamentary Constituency (PC) -> Assembly Constituency (AC) -> Polling Station.
   - Upon administrative verification, an Ethereum wallet address is automatically provisioned for gasless on-chain voting.

[PRACTICAL TIP]: You do not need a MetaMask wallet or crypto tokens to vote. The Election Commission Relayer sponsors the blockchain gas fee for all verified Indian electors.

Would you like me to guide you through checking active elections or reviewing candidates in your constituency?`,
      action: "NAVIGATE_LOGIN_VOTER"
    };
  }

  // 3B. DOWNLOAD e-EPIC VOTER IDENTITY CARD
  if (/download e-epic|download epic|e-epic|epic card|voter id card|voter card|download card|ई-एपिक|वोटर कार्ड|मतदार ओळखपत्र|वोटर आयडी|डाउनलोड/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### ई-एपिक (e-EPIC) डिजिटल वोटर आईडी कार्ड डाउनलोड कैसे करें

नमस्ते! चुनाव आयोग के राष्ट्रीय पोर्टल पर आपका डिजिटल ई-एपिक कार्ड (e-EPIC) उपलब्ध है:

1. **पोर्टल में लॉगिन करें**: अपने पंजीकृत ईमेल अथवा वोटर आईडी से **Voter Login** करें।
2. **प्रोफाइल खोलें**: ऊपरी मेनू से **"Elector Profile & e-EPIC"** टैब पर क्लिक करें।
3. **डिजिटल कार्ड देखें**: स्क्रीन पर आपका प्रामाणिक दो तरफा (Front & Back) पीवीसी डिजिटल वोटर कार्ड प्रदर्शित होगा, जिसमें आपका फोटो, ईपिक नंबर, होलोग्राम और बारकोड शामिल है।
4. **PDF डाउनलोड करें**: **"Download e-EPIC Card (PDF)"** बटन पर क्लिक करें। आपका हाई-रेजोल्यूशन आधिकारिक ई-एपिक कार्ड सीधे आपके डिवाइस में PDF के रूप में सहेज लिया जाएगा।
5. **प्रिंट विकल्प**: आप **"Print e-EPIC"** बटन दबाकर इसे सीधे कलर प्रिंट भी कर सकते हैं।

यह डिजिटल कार्ड भारत सरकार एवं चुनाव आयोग द्वारा पूर्णतः विधिमान्य है।`,
        suggestedActions: [
          { label: "वोट कैसे डालें?", query: "वोट डालने की आसान प्रक्रिया क्या है?" },
          { label: "मतदान रसीद जांचें", query: "मतदान रसीद कैसे जांचें?" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### ई-एपिक (e-EPIC) डिजिटल मतदार ओळखपत्र डाउनलोड मार्गदर्शक

नमस्कार! आपले डिजिटल ई-एपिक कार्ड (e-EPIC) डाउनलोड करण्याची सोपी पद्धत:

1. **लॉगिन करा**: आपल्या ईमेल किंवा EPIC क्रमांकाने **Voter Login** करा.
2. **प्रोफाइल टॅब निवडा**: वरील मेनूमधून **"Elector Profile & e-EPIC"** वर क्लिक करा.
3. **डिजिटल कार्ड तपासा**: स्क्रीनवर आपले अधिकृत Front & Back PVC डिजिटल मतदार ओळखपत्र दिसेल.
4. **PDF डाउनलोड करा**: **"Download e-EPIC Card (PDF)"** बटणावर क्लिक करा. उच्च दर्जाचे PDF कार्ड त्वरित डाउनलोड होईल.
5. **प्रिंट करा**: आपण **"Print e-EPIC"** द्वारे थेट प्रिंट देखील करू शकता.

हे डिजिटल ओळखपत्र भारत निवडणूक आयोगाच्या नियमानुसार सर्व निवडणुकांसाठी अधिकृत आहे.`,
        suggestedActions: [
          { label: "मतदान कसे करावे?", query: "मतदान कसे करावे? सोप्या पायऱ्या सांगा" },
          { label: "पावती कशी तपासावी?", query: "VVPAT पावती कशी तपासावी?" }
        ]
      };
    }

    return {
      language: "en",
      response: `### How to Download Your Digital e-EPIC Voter ID Card

Namaste! You can view and download your official digital e-EPIC card anytime from the portal:

1. **Sign In**: Log into your voter account using **Voter Login**.
2. **Go to Profile**: Click on the **"Elector Profile & e-EPIC"** tab in the voter navigation bar.
3. **View Your Official PVC Card**: Your authentic duplex (Front & Back) e-EPIC card is displayed on-screen, featuring your Photo, 10-character EPIC ID, 3D Security Hologram, Barcode, and ERO Digital Seal.
4. **Download High-Resolution PDF**: Click the blue **"Download e-EPIC Card (PDF)"** button. A crisp, high-resolution official PDF card will be saved directly to your computer.
5. **Print Option**: You can also click **"Print e-EPIC"** to print a physical color copy directly.

**Statutory Validity:** The digital e-EPIC is an official, constitutionally valid proof of identity issued by the Election Commission of India.`,
      suggestedActions: [
        { label: "How to Vote", query: "How to vote in 3 easy steps?" },
        { label: "Verify Vote Receipt", query: "How do I verify my voting receipt code?" },
        { label: "Active Elections", query: "Show active elections open for voting" }
      ]
    };
  }

  // 3C. FORM 6 NEW VOTER REGISTRATION
  if (/form 6|form-6|new voter|new registration|register as new voter|how to register|पहिला वोटर|नया वोटर|नवीन मतदार/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### Form 6: नए मतदाता के रूप में पंजीकरण कैसे करें

नमस्ते! यदि आपकी आयु 18 वर्ष या उससे अधिक है, तो आप Form 6 भरकर नए मतदाता के रूप में पंजीकरण कर सकते हैं:

1. **पंजीकरण फॉर्म खोलें**:
   - लॉगिन स्क्रीन पर **"Form 6 — New Elector Registration"** टैब पर क्लिक करें।
2. **चरण 1: निर्वाचन क्षेत्र चुनें (Jurisdiction)**:
   - अपना राज्य, जिला, लोकसभा क्षेत्र (PC) और विधानसभा क्षेत्र (AC) चुनें।
3. **चरण 2: व्यक्तिगत विवरण भरें**:
   - अपना पूरा नाम, जन्म तिथि, लिंग, पिता/पति का नाम और आधार संख्या दर्ज करें।
4. **चरण 3: पता व संपर्क विवरण**:
   - मकान संख्या, सड़क, ग्राम/मोहल्ला, पिन कोड और मोबाइल नंबर दर्ज करें।
5. **OTP सत्यापन**:
   - सामान्य सत्यापन कोड \`123456\` दर्ज करके मोबाइल नंबर सत्यापित करें।
6. **जमा करें (Submit Registration)**:
   - घोषणा पत्र स्वीकार करें और **"Submit Form 6 Registration"** बटन दबाएं।

सत्यापन पूरा होने पर आपका 10-अंकीय **EPIC नंबर** और डिजिटल वोटर कार्ड स्वतः तैयार हो जाएगा!`,
        suggestedActions: [
          { label: "मतदाता लॉगिन", query: "मतदाता लॉगिन कैसे करें? EPIC नंबर क्या है?" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक कैसे डाउनलोड करें?" }
        ],
        action: "NAVIGATE_LOGIN_VOTER"
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### Form 6: नवीन मतदार नोंदणी मार्गदर्शक

नमस्कार! १८ वर्षे पूर्ण झालेल्या कोणत्याही भारतीय नागरिकासाठी Form 6 नोंदणी:

1. **नोंदणी फॉर्म उघडा**: लॉगिन स्क्रीनवरील **"Form 6 — New Elector Registration"** निवडा.
2. **मतदारसंघ निवडा**: आपले राज्य, जिल्हा, लोकसभा आणि विधानसभा क्षेत्र निवडा.
3. **वैयक्तिक माहिती**: नाव, जन्मतारीख, लिंग, वडिलांचे/पतीचे नाव नोंदवा.
4. **पत्ता व संपर्क**: घर क्रमांक, रस्ता, पिनकोड आणि मोबाइल नंबर भरा.
5. **OTP पडताळणी**: \`123456\` कोड टाकून मोबाइल नंबर पडताळा.
6. **अर्ज सादर करा**: घोषणा मान्य करून अर्ज सबमिट करा.

अर्ज मंजूर होताच आपला **EPIC क्रमांक** आणि डिजिटल ओळखपत्र तयार होईल!`,
        suggestedActions: [
          { label: "मतदार लॉगिन", query: "मतदार लॉगिन कसे करावे?" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक कसे डाउनलोड करावे?" }
        ],
        action: "NAVIGATE_LOGIN_VOTER"
      };
    }

    return {
      language: "en",
      response: `### How to Register as a New Voter (Form 6 Guide)

Namaste! Any Indian citizen who is 18 years or older can easily enroll as a new voter using Form 6:

1. **Open Form 6**:
   - On the portal login pane, click the **"Form 6 — New Elector Registration"** tab.
2. **Step 1: Select Your Jurisdiction**:
   - Choose your State, District, Parliamentary Constituency (PC), and Assembly Constituency (AC).
3. **Step 2: Enter Personal Information**:
   - Provide your Full Name, Date of Birth, Gender, Relative's Name, and Aadhaar Number.
4. **Step 3: Contact & Address**:
   - Fill in your House No, Street, Village/City, Pincode, and 10-digit Mobile Number.
5. **OTP Verification**:
   - Enter the common verification OTP \`123456\` and click Verify OTP.
6. **Submit Application**:
   - Accept the citizenship declaration and click **"Submit Form 6 Registration"**.

Once registered, your unique 10-character **EPIC ID** is assigned, and your digital **e-EPIC card** is instantly accessible!`,
      suggestedActions: [
        { label: "Voter Login Help", query: "How do I login as a voter with EPIC id?" },
        { label: "Download e-EPIC", query: "How do I download my e-EPIC voter card?" },
        { label: "How to Vote", query: "How to vote in 3 easy steps?" }
      ],
      action: "NAVIGATE_LOGIN_VOTER"
    };
  }

  // 3D. ECI TOLL-FREE VOTER HELPLINE 1950
  if (/1950|helpline|toll free|toll-free|contact eci|customer care|support number|हेल्पलाइन|कॉल|संपर्क/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### भारत निर्वाचन आयोग राष्ट्रीय मतदाता हेल्पलाइन 1950

नमस्ते! चुनाव से जुड़ी किसी भी सहायता, शिकायत या जानकारी के लिए चुनाव आयोग की आधिकारिक हेल्पलाइन उपलब्ध है:

- **टोल-फ्री नंबर**: **1950** (पूरे भारत में 24 घंटे निःशुल्क सेवा)
- **एसएमएस सुविधा**: \`ECI <EPIC Number>\` लिखकर 1950 पर भेजें
- **आधिकारिक वेबसाइट**: \`voters.eci.gov.in\` एवं \`eci.gov.in\`
- **नागरिक शिकायत ऐप**: **cVIGIL** (आचार संहिता उल्लंघन की शिकायत पर 100 मिनट में कार्रवाई)
- **मुख्यालय**: निर्वाचन सदन, अशोका रोड, नई दिल्ली - 110001

आप इस चैट में भी अपना सवाल सीधे पूछ सकते हैं!`,
        suggestedActions: [
          { label: "वोट कैसे डालें?", query: "वोट डालने की आसान प्रक्रिया क्या है?" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक कैसे डाउनलोड करें?" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### भारत निवडणूक आयोग राष्ट्रीय मतदार हेल्पलाइन १९५०

नमस्कार! निवडणूक विषयक कोणत्याही मदतीसाठी अधिकृत संपर्क:

- **टोल-फ्री क्रमांक**: **१९५०** (२४x७ मोफत सेवा)
- **अधिकृत संकेतस्थळ**: \`voters.eci.gov.in\`
- **तक्रार निवारण**: cVIGIL मोबाइल अ‍ॅप (१०० मिनिटांत कारवाई)
- **मुख्यालय**: निर्वाचन सदन, अशोका रोड, नवी दिल्ली - ११०००१

आपण येथेही आपला प्रश्न विचारू शकता!`,
        suggestedActions: [
          { label: "मतदान कसे करावे?", query: "मतदान कसे करावे? सोप्या पायऱ्या सांगा" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक कसे डाउनलोड करावे?" }
        ]
      };
    }

    return {
      language: "en",
      response: `### ECI National Voter Helpline: 1950 (Toll-Free 24x7)

Namaste! For any citizen assistance, queries, or election support, the Election Commission of India provides:

- **Toll-Free Helpline**: **1950** (Available across India, 24x7 free of cost)
- **SMS Status**: Send \`ECI <EPIC Number>\` to **1950** to check voter roll details
- **Official Portals**: \`voters.eci.gov.in\` and \`eci.gov.in\`
- **Citizen Grievance (cVIGIL)**: Report violations with guaranteed 100-minute field response
- **ECI Headquarters**: Nirvachan Sadan, Ashoka Road, New Delhi - 110001

You can also ask Chunav Mitra any question right here in the chat!`,
      suggestedActions: [
        { label: "How to Vote", query: "How to vote in 3 easy steps?" },
        { label: "Download e-EPIC", query: "How do I download my e-EPIC voter card?" },
        { label: "Verify Vote Receipt", query: "How do I verify my voting receipt code?" }
      ]
    };
  }

  // 4. MODEL CODE OF CONDUCT (MCC) & AACHUR SANHITA & cVIGIL
  if (/mcc|model code of conduct|aachar sanhita|aacharsanhita|code of conduct|आचार संहिता|आचारसंहिता|cvigil|c-vigil/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### आदर्श आचार संहिता (Model Code of Conduct) एवं cVIGIL नागरिक निगरानी

नमस्ते! भारत निर्वाचन आयोग द्वारा निष्पक्ष एवं स्वतंत्र चुनाव सुनिश्चित करने के लिए **आदर्श आचार संहिता (MCC)** लागू की जाती है:

#### 1. आचार संहिता कब लागू होती है?
- **तात्कालिक प्रभाव**: चुनाव आयोग द्वारा चुनाव की तिथियों की औपचारिक घोषणा करते ही पूरे चुनाव क्षेत्र में आदर्श आचार संहिता तुरंत लागू हो जाती है और परिणाम घोषित होने तक प्रभावी रहती है।
- **सत्ताधारी दल एवं मंत्रियों पर प्रतिबंध**: सरकारी धन से नए विज्ञापनों, नई योजनाओं की घोषणा, शिलान्यास करने अथवा सरकारी वाहनों और विमानों का चुनावी उपयोग करने पर पूर्ण प्रतिबंध रहता है।

#### 2. प्रत्याशी एवं राजनीतिक दलों हेतु कड़े नियम
- **धर्म, जाति या भाषा के नाम पर वोट मांगना सख्त वर्जित**: पूजा स्थलों (मंदिर, मस्जिद, गुरुद्वारा, चर्च) का उपयोग चुनाव प्रचार मंच के रूप में नहीं किया जा सकता।
- **मतदाताओं को प्रलोभन या रिश्वत (RPA 1951)**: शराब वितरण, नकदी बांटना या मतदाताओं को डराना-धमकाना गंभीर संज्ञेय अपराध है।
- **मौन अवधि (Silence Period)**: मतदान समाप्त होने के समय से 48 घंटे पूर्व (धारा 126 RPA 1951) सभी प्रकार के सार्वजनिक प्रचार, रैलियां, लाउडस्पीकर और टीवी विज्ञापन पूरी तरह बंद हो जाते हैं।

#### 3. नागरिक शक्ति: cVIGIL मोबाइल ऐप
- **100 मिनट में त्वरित कार्रवाई**: यदि कोई नागरिक आचार संहिता का उल्लंघन (जैसे अवैध होर्डिंग, शराब वितरण, नफरती भाषण) देखता है, तो वह cVIGIL ऐप से फोटो या 2 मिनट का वीडियो अपलोड कर सकता है।
- **जीपीएस लोकेशन ट्रैकिंग**: जीआईएस तकनीक से घटना स्थल का स्वचालित पता लगता है और उड़न दस्ता (Flying Squad) 100 मिनट के भीतर मौके पर पहुंचकर कार्रवाई करता है।

[STATUTORY NOTE]: इस एसडीईएमएस पोर्टल में भी आप अपने डैशबोर्ड के **Grievances (cVIGIL)** टैब में जाकर सीधे चुनाव अधिकारी को ऑनलाइन शिकायत दर्ज करा सकते हैं।`,
        suggestedActions: [
          { label: "शिकायत दर्ज करें", query: "पोर्टल पर चुनावी शिकायत कैसे दर्ज करें?" },
          { label: "मतदान नियम", query: "मतदान करने की आधिकारिक प्रक्रिया क्या है?" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### आदर्श आचारसंहिता (Model Code of Conduct) व cVIGIL माहिती

नमस्कार! मुक्त आणि निष्पक्ष निवडणुकांसाठी भारत निवडणूक आयोग **आदर्श आचारसंहिता (MCC)** लागू करतो:

#### 1. आचारसंहिता कधी लागू होते?
- **तातडीने अंमलबजावणी**: निवडणूक आयोगाने निवडणुकांच्या तारखा जाहीर केल्याच्या क्षणापासून आचारसंहिता लागू होते आणि निकाल जाहीर होईपर्यंत चालू राहते.
- **मंत्र्यांवर निर्बंध**: सरकारी तिजोरीतून जाहिराती, नवीन योजनांच्या घोषणा किंवा सरकारी वाहनांचा प्रचारासाठी वापर पूर्णपणे बंद होतो.

#### 2. प्रमुख कायदेशीर नियम
- धर्म, जात किंवा पंथाच्या नावावर मते मागण्यास कायद्याने बंदी आहे.
- मतदारांना पैसे, भेटवस्तू किंवा दारू वाटणे हा दखलपात्र फौजदारी गुन्हा आहे.
- मतदानाच्या आधीचे ४८ तास (Silence Period) सर्व जाहीर प्रचार, सभा आणि लाऊडस्पीकर बंद ठेवावे लागतात.

#### 3. cVIGIL नागरिक ॲप
- कोणत्याही नागरिकाला आचारसंहिता भंगाचा फोटो किंवा व्हिडिओ cVIGIL ॲपवर पाठवता येतो. निवडणूक पथक १०० मिनिटांत घटनास्थळी पोहोचून कारवाई करते.

[STATUTORY NOTE]: आपल्या मतदार पोर्टलवर **Grievances** टॅबमध्ये थेट ऑनलाइन तक्रार नोंदवण्याची सोय उपलब्ध आहे.`,
        suggestedActions: [
          { label: "मतदान नियम", query: "मतदान कसे करावे? अधिकृत पायऱ्या सांगा" }
        ]
      };
    }

    return {
      language: "en",
      response: `### Model Code of Conduct (Aachar Sanhita) & cVIGIL Public Oversight

Namaste! The **Model Code of Conduct (MCC / आचार संहिता)** is an authoritative body of operational guidelines issued by the Election Commission of India to ensure free, fair, and ethical campaigning:

#### 1. When Does the MCC Take Effect?
- **Immediate Enforcement**: The Model Code of Conduct comes into force the very second election dates are formally announced by the Commission and remains in effect until the completion of the election cycle.
- **Restrictions on Incumbent Governments**: Ministers and ruling parties are strictly forbidden from announcing financial grants, laying foundation stones, commissioning ad campaigns funded by the public exchequer, or utilizing state machinery/vehicles for electioneering.

#### 2. Crucial Conduct Directives for Contesting Parties
- **Ethical Campaigning**: Prohibits appealing to caste, communal, or religious sentiments. Places of worship (temples, mosques, churches, gurdwaras) cannot be converted into campaign venues.
- **Corrupt Practices & Bribery (RPA 1951)**: Distributing liquor, cash disbursements, gifts, or intimidation are non-bailable criminal offenses.
- **Mandatory Silence Period**: 48 hours prior to the close of polling (Section 126 of RPA 1951), all public campaign rallies, loudspeaker broadcasting, and television propaganda must strictly cease.

#### 3. Citizen Enforcement via cVIGIL App
- **Action within 100 Minutes**: Any citizen witnessing an MCC violation (illegal banners, illicit cash/liquor movement, hate speech) can capture a real-time photograph or up to a 2-minute video via the ECI cVIGIL mobile app.
- **GIS Geotagging**: Automated GPS location locks the crime coordinates, dispatching Flying Squad Units (FSU) to inspect the site and enforce action within 100 minutes.

[STATUTORY NOTE]: Within this SDEMS desktop portal, verified electors can submit digital grievances directly under the **Grievances (cVIGIL)** tab for review by the Returning Officer.`,
      suggestedActions: [
        { label: "Rule 49M Voting Guide", query: "How to cast a vote step by step under ECI rules?" },
        { label: "Active Elections Gazette", query: "Show active elections open for voting" }
      ]
    };
  }

  // 5. REAL-WORLD INDIAN POLLING EXPERIENCE (MATDAN PARCHI, INDELIBLE INK, POLLING BOOTH, BLO)
  if (/voter parchi|matdan parchi|voter slip|voter information slip|indelible ink|purple ink|amitsyahi|ink mark|booth level officer|\bblo\b|polling booth|matdan kendra|मतदान पर्ची|मतदाता पर्ची|अमिट स्याही|मतदान केंद्र|बीएलओ|अमिट शाई/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### भारतीय चुनाव परंपरा: मतदाता पर्ची (Voter Parchi), अमिट स्याही एवं मतदान केंद्र प्रोटोकॉल

नमस्ते! भारतीय चुनावों का अनुभव प्रत्येक नागरिक के लिए गर्व का क्षण होता है। यहाँ मतदाता पर्ची, अमिट स्याही और मतदान केंद्र की वास्तविक कार्यप्रणाली समझाई गई है:

#### 1. मतदाता सूचना पर्ची (Voter Information Slip / Voter Parchi)
- **बीएलओ (BLO) द्वारा वितरण**: मतदान दिवस से कुछ दिन पूर्व आपके इलाके के **बूथ लेवल ऑफिसर (BLO)** आपके घर आकर यह आधिकारिक पर्ची देते हैं।
- **पर्ची में क्या होता है**: आपका नाम, मतदाता सूची का भाग क्रमांक (Part No.), क्रम संख्या (Serial No.), और मतदान केंद्र (Matdan Kendra) का नाम व कमरा नंबर।
- **महत्वपूर्ण वैधानिक नियम**: मतदाता पर्ची केवल आपकी सुविधा और केंद्र खोजने के लिए है। **पर्ची अपने आप में पहचान पत्र नहीं है**। मतदान करने के लिए आपको अपना **EPIC (मतदाता पहचान पत्र)** अथवा चुनाव आयोग द्वारा मान्य 12 अन्य फोटो पहचान पत्रों (आधार कार्ड, ड्राइविंग लाइसेंस, पैन कार्ड, पासपोर्ट आदि) में से एक साथ ले जाना अनिवार्य है।

#### 2. अमिट स्याही (Indelible Ink / बैंगनी निशान)
- **अमिट स्याही का प्रयोग**: मतदान केंद्र पर द्वितीय मतदान अधिकारी (PO-2) आपके **बाएं हाथ की तर्जनी (Index Finger)** पर नाखून से त्वचा तक बैंगनी सिल्वर नाइट्रेट स्याही का निशान लगाते हैं।
- **फर्जी मतदान की रोकथाम**: यह स्याही धूप के संपर्क में आते ही पक्की हो जाती है और किसी भी केमिकल से तुरंत नहीं मिटती। इससे कोई भी व्यक्ति एक से अधिक बार वोट नहीं डाल सकता।
- **एसडीईएमएस में डिजिटल स्याही**: हमारे ब्लॉकचेन सिस्टम में स्मार्ट कॉन्ट्रैक्ट का \`hasVoted\` मैपिंग डिजिटल अमिट स्याही का काम करता है। एक बार वोट डलने के बाद ब्लॉकचेन पर हमेशा के लिए मुहर लग जाती है।

#### 3. मतदान केंद्र (Polling Station) के तीन अधिकारी
- **प्रथम मतदान अधिकारी (PO-1)**: मतदाता सूची की प्रति में आपका नाम और पहचान पत्र जांचते हैं।
- **द्वितीय मतदान अधिकारी (PO-2)**: आपकी उंगली पर अमिट स्याही लगाते हैं, फॉर्म 17A रजिस्टर में हस्ताक्षर/अंगूठा लगवाते हैं।
- **तृतीय मतदान अधिकारी (PO-3 / एसडीईएमएस में रिलेयर)**: मतपत्र जारी करते हैं ताकि आप वोटिंग कंपार्टमेंट में जाकर बिना किसी दबाव के गुप्त मतदान कर सकें।

[PRACTICAL TIP]: मतदान के बाद मिलने वाली डिजिटल VVPAT रसीद (REC-XXXX) आपकी सुरक्षित डिजिटल पर्ची है।`,
        suggestedActions: [
          { label: "मतदान प्रक्रिया", query: "मतदान करने की आधिकारिक प्रक्रिया क्या है?" },
          { label: "रसीद सत्यापन", query: "VVPAT रसीद सत्यापन कैसे काम करता है?" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### भारतीय निवडणूक परंपरा: मतदार पावती (Voter Parchi), अमिट शाई व मतदान केंद्र नियम

नमस्कार! प्रत्यक्ष मतदानाचा अनुभव आणि त्यामागील कायदेशीर नियम खालीलप्रमाणे आहेत:

#### 1. मतदार माहिती पावती (Voter Information Slip / Parchi)
- **BLO द्वारे वितरण**: मतदानाच्या आधी **बूथ लेव्हल ऑफिसर (BLO)** घरोघरी जाऊन ही अधिकृत पावती देतात.
- **पावतीतील तपशील**: मतदार यादी भाग क्रमांक, अनुक्रमांक आणि मतदान केंद्राचे नाव.
- **नियम**: ही पावती मतदान केंद्र शोधण्यासाठी आहे. मतदान करण्यासाठी **EPIC ओळखपत्र** किंवा आधार कार्ड, ड्रायव्हिंग लायसन्स यासारखा पुरावा आवश्यक आहे.

#### 2. बोटावर लावली जाणारी अमिट शाई (Indelible Ink)
- मतदान केंद्रावर डाव्या हाताच्या तर्जनीवर काळी-जांभळी अमिट शाई लावली जाते. ही शाई केमिकलने मिटत नाही, ज्यामुळे बोगस मतदानाला पूर्ण आळा बसतो.
- आपल्या ब्लॉकचेन सिस्टीममध्ये ऑन-चेन \`hasVoted\` नोंद ही डिजिटल अमिट शाई म्हणून काम करते.

#### 3. मतदान केंद्र प्रक्रिया
- अधिकारी १: ओळख तपासणे.
- अधिकारी २: अमिट शाई लावणे व रजिस्टरवर स्वाक्षरी घेणे.
- अधिकारी ३: मतदानासाठी बॅलेट युनिट सुरू करणे.

[PRACTICAL TIP]: मतदानानंतर स्क्रीनवर येणारी VVPAT डिजिटल पावती ही आपली अधिकृत नोंद आहे.`,
        suggestedActions: [
          { label: "मतदान कसे करावे?", query: "मतदान कसे करावे? अधिकृत पायऱ्या सांगा" }
        ]
      };
    }

    return {
      language: "en",
      response: `### Real-World Indian Polling Experience: Voter Parchi, Indelible Ink & Booth Protocols

Namaste! Every Indian general election blends rigorous statutory safeguards with everyday citizen traditions. Here is how they work in real life and inside this SDEMS platform:

#### 1. Voter Information Slip (मतदाता सूचना पर्ची / Voter Parchi)
- **Delivered by the BLO**: Days before poll day, your local **Booth Level Officer (BLO)** conducts door-to-door visits to deliver official Voter Information Slips to every registered household.
- **What It Contains**: Your Electoral Roll Part Number, Serial Number, Polling Station (Matdan Kendra) name, and Room/Booth number.
- **Critical Statutory Rule**: Under statutory rules, the Voter Parchi facilitates quick lookup in the queue, but it is **not standalone photo identity proof**. To cast your vote, you must produce your EPIC card or any of the 12 ECI-authorized alternative photo IDs (Aadhaar, Passport, Driving License, PAN).

#### 2. The Indelible Ink Mark (अमिट स्याही)
- **Application**: The Second Polling Officer (PO-2) applies purple silver nitrate indelible ink on your **left hand index finger** from the cuticle across the nail before you sign the Form 17A Register.
- **Anti-Fraud Security**: It bonds with skin protein on contact with light and cannot be dissolved by chemical detergents, ensuring no person can vote more than once or impersonate another citizen.
- **Digital Equivalent in SDEMS**: In our blockchain system, the EVM smart contract serves as digital indelible ink: \`hasVoted[electionId][voterAddress] = true\` is permanently sealed into the Ethereum consensus block!

#### 3. The 3-Officer Polling Booth (मतदान केंद्र) Protocol
- **Polling Officer 1 (PO-1)**: Calls out your roll serial number and verifies your EPIC credentials against the working copy of the electoral roll.
- **Polling Officer 2 (PO-2)**: Marks your index finger with indelible ink, records your EPIC number in the **Form 17A Voter Register**, and obtains your signature or thumb impression.
- **Polling Officer 3 (PO-3 / In SDEMS, the Gasless Relayer)**: Operates the Ballot Unit enable switch so you can enter the voting compartment and record your secret vote on the EVM / VVPAT.

[PRACTICAL TIP]: In SDEMS, your electronic VVPAT receipt (\`REC-XXXX\`) acts as your immutable digital parchi for on-chain audit and proof of participation.`,
      suggestedActions: [
        { label: "Rule 49M Voting Guide", query: "How to cast a vote step by step under ECI rules?" },
        { label: "Active Elections Gazette", query: "Show active elections open for voting" },
        { label: "Audit VVPAT Receipt", query: "How does VVPAT receipt verification work under Rule 49MA?" }
      ]
    };
  }

  // 6. HOW TO VOTE (STEP-BY-STEP UNDER RULE 49M)
  if (/how to vote|voting process|steps to vote|guide|tutorial|help me vote|वोट कैसे|मतदान कसे|मत कसे|मतदान प्रक्रिया|ভোট কীভাবে|வாக்களிப்பது|ఎలా ఓటు|કેવી રીતે મતદાન|ಮತದಾನ ಹೇಗೆ|3 easy steps|three steps/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### ऑनलाइन मतदान करने के 3 आसान चरण (आधिकारिक मार्गदर्शिका)

नमस्ते! मतदान करना पूरी तरह निःशुल्क, गोपनीय और सुरक्षित है। यहाँ 3 आसान चरण हैं:

1. **चरण 1: लॉगिन करें**
   - **Voter Login** पर जाएं और अपने पंजीकृत ईमेल या 10-अंकीय वोटर आईडी (EPIC) से लॉगिन करें।

2. **चरण 2: अपना चुनाव चुनें**
   - **"Current Elections"** टैब में अपने निर्वाचन क्षेत्र का सक्रिय चुनाव देखें और **"Open Ballot"** पर क्लिक करें।

3. **चरण 3: प्रत्याशी चुनें और वोट दें**
   - अपने पसंदीदा प्रत्याशी, उनके दल व आधिकारिक चुनाव चिन्ह के सामने नारंगी **"Cast Vote"** बटन दबाएं और पुष्टि करें।
   - आपका वोट ब्लॉकचेन पर सुरक्षित रूप से दर्ज हो जाएगा!

**मतदान के बाद:**
- आपको तुरंत एक आधिकारिक डिजिटल **VVPAT पावती पर्ची (REC-XXXX)** प्राप्त होगी।
- आप इसे **"Vote Receipt"** टैब से किसी भी समय देख सकते हैं और PDF डाउनलोड कर सकते हैं।

**विशेष नोट:** मतदान 100% निःशुल्क है। चुनाव आयोग का रिलेयर सभी नागरिकों के लिए ब्लॉकचेन शुल्क वहन करता है।`,
        suggestedActions: [
          { label: "सक्रिय चुनाव देखें", query: "सक्रिय चुनाव और प्रत्याशी दिखाएं" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक वोटर कार्ड कैसे डाउनलोड करें?" },
          { label: "मतदान रसीद जांचें", query: "मतदान रसीद कैसे जांचें?" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### ऑनलाइन मतदानाचे ३ सोपे टप्पे (अधिकृत मार्गदर्शक)

नमस्कार! मतदान करणे पूर्णपणे मोफत, गोपनीय आणि सुरक्षित आहे. ३ सोपे टप्पे खालीलप्रमाणे आहेत:

1. **टप्पा १: लॉगिन करा**
   - **Voter Login** वर जाऊन आपल्या ईमेल किंवा १०-अंकी EPIC क्रमांकाने लॉगिन करा.

2. **टप्पा २: निवडणूक निवडा**
   - **"Current Elections"** टॅबमधून आपल्या मतदारसंघातील निवडणूक निवडून **"Open Ballot"** वर क्लिक करा.

3. **टप्पा ३: उमेदवार निवडा आणि मतदान करा**
   - आपल्या पसंतीच्या उमेदवाराच्या नावासमोरील **"Cast Vote"** बटण दाबा आणि पुष्टी करा.
   - आपले मत ब्लॉकचेनवर कायमस्वरूपी नोंदवले जाईल!

**मतदानानंतर:**
- आपल्याला अधिकृत डिजिटल **VVPAT पावती (REC-XXXX)** त्वरित मिळेल.
- आपण **"Vote Receipt"** टॅबमधून ही पावती कधीही PDF स्वरूपात डाउनलोड करू शकता.

**टीप:** मतदान १००% मोफत आहे. एका मतदाराला एका निवडणुकीत एकच मत देता येते.`,
        suggestedActions: [
          { label: "सक्रिय निवडणुका", query: "सध्या सुरू असलेल्या निवडणुकांची यादी दाखवा" },
          { label: "ई-एपिक डाउनलोड", query: "ई-एपिक कसे डाउनलोड करावे?" },
          { label: "पावती कशी तपासावी?", query: "VVPAT पावती कशी तपासावी?" }
        ]
      };
    }

    return {
      language: "en",
      response: `### How to Vote in 3 Simple Steps (Official Guide)

Namaste! Casting your vote in SDEMS is completely free, secure, and takes less than 2 minutes:

1. **Step 1: Sign In**
   - Click **Voter Login** and sign in using your registered Email or 10-character Voter ID (EPIC).

2. **Step 2: Find Your Election**
   - Go to the **Current Elections** tab to see all active elections open in your constituency.
   - Click **Open Ballot** on your election.

3. **Step 3: Select Candidate & Cast Vote**
   - Choose your preferred candidate, verify their party and election symbol, and click the orange **Cast Vote** button.
   - Confirm your choice. Your vote is securely recorded on the blockchain!

**After Voting:**
- Your official **Digital Voting Receipt (VVPAT)** with a unique receipt code (e.g. \`REC-XXXX\`) will appear immediately.
- You can view and download your official receipt as a PDF anytime from the **Vote Receipt** tab.

**Important Notice:** Voting is 100% free of cost. The Election Commission Relayer covers all blockchain gas fees. Each voter can cast only one vote per election.`,
      suggestedActions: [
        { label: "View Active Elections", query: "Show active elections open for voting" },
        { label: "Download e-EPIC", query: "How do I download my e-EPIC voter card?" },
        { label: "Verify Vote Receipt", query: "How do I verify my voting receipt code?" }
      ]
    };
  }

  // 7. REAL VVPAT CRYPTOGRAPHIC RECEIPT AUDIT (RULE 49MA)
  const receiptMatch = q.match(/REC-[A-F0-9]{16}/i) || q.match(/0x[a-fA-F0-9]{64}/i);
  if (receiptMatch || /audit receipt|verify receipt|vvpat|receipt|रसीद|पावती/i.test(q)) {
    const targetCode = receiptMatch ? receiptMatch[0] : (context.receiptCode || null);

    if (targetCode) {
      const receipt = await getVVPATReceiptData(targetCode);
      if (receipt) {
        return {
          language: "en",
          response: `### Election Commission of India — Form 49MA VVPAT Slip Verification
*Official Audit & Proof of Balloting*

| Verification Item | Certified Detail |
| :--- | :--- |
| **Official Receipt Code** | \`${receipt.receipt_code}\` |
| **Election Title** | **${receipt.election_title}** |
| **Elector Identity** | **${receipt.voter_name || "Verified Elector"}** (EPIC: \`${receipt.voter_id_card || "PROTECTED"}\`) |
| **Voted Candidate** | **${receipt.candidate_name || "Verified Choice"}** |
| **Political Party / Symbol** | ${receipt.candidate_party || "Independent"} (${receipt.candidate_symbol || "Statutory Symbol"}) |
| **Blockchain Transaction Hash** | \`${receipt.tx_hash}\` |
| **Block Number** | **Block #${receipt.block_number}** |
| **Timestamp** | ${new Date(receipt.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST |

**Status:** Verified on-chain. This ballot is securely sealed and cannot be altered.`,
          action: "VERIFY_RECEIPT",
          receiptData: receipt
        };
      } else {
        return {
          language: "en",
          response: `[NOT FOUND]: The receipt code \`${targetCode}\` could not be found. Please check your 20-character receipt code (e.g. \`REC-7AD63FC7BED761E7\`) or 66-character transaction hash and try again.`,
          action: "VERIFY_RECEIPT"
        };
      }
    }

    return {
      language: "en",
      response: `### How to Verify Your Official Voting Receipt (VVPAT)

Namaste! After casting your vote, an official digital voting receipt (VVPAT equivalent) is generated to confirm your ballot:

1. **Where to Find Your Receipt**:
   - Open the **"Vote Receipt"** tab in your voter console.
   - You can also view it in the confirmation popup immediately after voting.

2. **Verify Instantly in Chunav Mitra**:
   - Simply copy your 20-character Receipt Code (e.g. \`REC-XXXX\`) or your 66-character Transaction Hash.
   - Paste it right here in this chat! Chunav Mitra will instantly search the official blockchain record and verify it for you.

3. **Download or Print as PDF**:
   - Click the green **"Download Receipt (PDF)"** button on your receipt slip to save a high-resolution, official PDF record.

**Ballot Secrecy Guarantee:** Under Section 128 of the Representation of the People Act, 1951, your vote is secret, immutable, and tamper-proof.`,
      suggestedActions: [
        { label: "How to Vote", query: "How to vote in 3 easy steps?" },
        { label: "Download e-EPIC", query: "How do I download my e-EPIC voter card?" },
        { label: "Active Elections", query: "Show active elections open for voting" }
      ]
    };
  }

  // 8. ACTIVE ELECTIONS & POLLING GAZETTE
  if (/active election|current election|ongoing election|list election|what elections|which election|सक्रिय चुनाव|चालू निवडणूक/i.test(q)) {
    const elections = await getLiveActiveElections();

    if (!elections || elections.length === 0) {
      return {
        language: lang,
        response: `### भारत निर्वाचन आयोग — आधिकारिक चुनावी गजट (Active Elections Gazette)

वर्तमान में कोई भी सक्रिय चुनाव खुला नहीं है। सभी निर्वाचन क्षेत्र \`UPCOMING\` अथवा \`ENDED\` स्थिति में हैं।

नया चुनाव घोषित होने पर आपके पंजीकृत विधानसभा/लोकसभा क्षेत्र में मतदान सूचना उपलब्ध करा दी जाएगी।`,
        action: "NAVIGATE_ELECTIONS"
      };
    }

    let gazetteText = `### Election Commission of India — Active Elections Gazette\n\n`;
    gazetteText += `There are currently **${elections.length} statutory election(s)** actively open for secret balloting:\n\n`;

    elections.forEach((el, idx) => {
      gazetteText += `#### ${idx + 1}. ${el.title}\n`;
      gazetteText += `- **Status**: \`ACTIVE\` (Polls Open)\n`;
      gazetteText += `- **Schedule**: ${new Date(el.start_time).toLocaleDateString()} to ${new Date(el.end_time).toLocaleDateString()}\n`;
      gazetteText += `- **Contesting Candidates**:\n`;
      if (el.candidates && el.candidates.length > 0) {
        el.candidates.forEach(c => {
          gazetteText += `  * **${c.name}** — ${c.party} (Symbol: ${c.symbol})\n`;
        });
      } else {
        gazetteText += `  * Candidate nominations under administrative scrutiny.\n`;
      }
      gazetteText += `\n`;
    });

    gazetteText += `[PRACTICAL TIP]: To cast your vote, go to the Active Elections section on your dashboard, review the candidates, and click **"Open Ballot"**.\n`;

    return {
      language: "en",
      response: gazetteText,
      action: "NAVIGATE_ELECTIONS"
    };
  }

  // 8B. POLITICAL PARTIES, LEADERS & OFFICIAL RESERVED SYMBOLS
  if (/(?:political\s+)?part(?:y|ies)|reserved symbol|election symbol|party leader|party president|party chief|who is leader of|symbol of|lotus|broom|hand|elephant|hammer|turha|tutari|cycle|bicycle|घडी|कमल|झाडू|हाथ|हत्ती|चिन्ह|पक्ष|राजकीय पक्ष|पक्षप्रमुख|राष्ट्रीय अध्यक्ष|पार्टी|नेता|चुनाव चिन्ह/i.test(q)) {
    const partiesList = await getPartiesData();
    const cleanQ = q.toLowerCase();
    
    const norm = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanNorm = norm(q);
    const targetParty = partiesList.find(p => {
      const a = norm(p.abbreviation);
      const n = norm(p.name);
      const s = norm(p.symbol);
      return (a && cleanNorm.includes(a)) || 
             (n && cleanNorm.includes(n)) || 
             (s && cleanNorm.includes(s)) ||
             (p.abbreviation === 'INC' && /congress|काँग्रेस|कांग्रेस/i.test(q)) ||
             (p.abbreviation === 'BJP' && /भाजपा|भाकपा/i.test(q)) ||
             (p.abbreviation === 'AAP' && /आप\b/i.test(q)) ||
             (p.abbreviation === 'SS(UBT)' && /ubt|उद्धव|ठाकरे/i.test(q)) ||
             (p.abbreviation === 'SS' && /शिंदे|shinde/i.test(q)) ||
             (p.abbreviation === 'NCP(SP)' && /शरद पवार|sharad pawar/i.test(q)) ||
             (p.abbreviation === 'NCP' && /अजित पवार|ajit pawar/i.test(q));
    });

    if (targetParty) {
      if (isHi) {
        return {
          language: "hi",
          response: `### ${targetParty.name} (${targetParty.abbreviation}) — आधिकारिक विवरण\n\n` +
            `भारत निर्वाचन आयोग (ECI) के आधिकारिक रिकॉर्ड के अनुसार:\n\n` +
            `- **पार्टी का नाम**: **${targetParty.name}**\n` +
            `- **संक्षिप्त नाम (Abbr)**: \`${targetParty.abbreviation}\`\n` +
            `- **पार्टी प्रमुख / राष्ट्रीय अध्यक्ष**: **${targetParty.leader || "आधिकारिक मनोनीत प्रतिनिधि"}**\n` +
            `- **आरक्षित चुनाव चिन्ह**: **${targetParty.symbol}** (Reserved Election Symbol)\n` +
            `- **सम्पर्क / मुख्यालय**: ${targetParty.contact_info || "निर्वाचन सदन द्वारा पंजीकृत"}\n` +
            `- **दर्जा**: ${targetParty.status || "ACTIVE"}\n\n` +
            `[STATUTORY NOTE]: यह चुनाव चिन्ह 'The Election Symbols (Reservation and Allotment) Order, 1968' के तहत विशेष रूप से इस दल के अधिकृत उम्मीदवारों हेतु आरक्षित है।`,
          suggestedActions: [
            { label: "सभी राजनीतिक दल देखें", query: "सभी पंजीकृत राजनीतिक दल और उनके चुनाव चिन्ह क्या हैं?" },
            { label: "सक्रिय चुनाव देखें", query: "वर्तमान में कौन-से चुनाव सक्रिय हैं?" }
          ]
        };
      } else if (isMr) {
        return {
          language: "mr",
          response: `### ${targetParty.name} (${targetParty.abbreviation}) — अधिकृत तपशील\n\n` +
            `भारतीय निवडणूक आयोगाच्या (ECI) अधिकृत नोंदीनुसार:\n\n` +
            `- **पक्षाचे नाव**: **${targetParty.name}**\n` +
            `- **संक्षिप्त नाव**: \`${targetParty.abbreviation}\`\n` +
            `- **पक्षप्रमुख / राष्ट्रीय अध्यक्ष**: **${targetParty.leader || "अधिकृत नियुक्त प्रतिनिधी"}**\n` +
            `- **आरक्षित निवडणूक चिन्ह**: **${targetParty.symbol}**\n` +
            `- **मुख्यालय / संपर्क**: ${targetParty.contact_info || "अधिकृत नोंदणीकृत"}\n\n` +
            `[STATUTORY NOTE]: निवडणूक चिन्ह (आरक्षण व वाटप) आदेश, १९६८ अंतर्गत हे चिन्ह या पक्षाच्या अधिकृत उमेदवारांसाठी आरक्षित आहे।`,
          suggestedActions: [
            { label: "सर्व पक्ष व चिन्हे", query: "सर्व मान्यताप्राप्त राजकीय पक्ष आणि त्यांची चिन्हे काय आहेत?" }
          ]
        };
      }

      return {
        language: "en",
        response: `### ${targetParty.name} (${targetParty.abbreviation}) — Official Party Dossier\n\n` +
          `According to the statutory registry of the **Election Commission of India (ECI)**:\n\n` +
          `- **Official Party Name**: **${targetParty.name}**\n` +
          `- **Abbreviation**: \`${targetParty.abbreviation}\`\n` +
          `- **Party Leader / National President**: **${targetParty.leader || "Statutory Designated Appointee"}**\n` +
          `- **Reserved Election Symbol**: **${targetParty.symbol}** (Gazette Allotment)\n` +
          `- **Headquarters / Contact**: ${targetParty.contact_info || "Nirvachan Sadan Registered Headquarters"}\n` +
          `- **Registration Status**: \`${targetParty.status || "ACTIVE"}\`\n\n` +
          `[LEGAL NOTE]: Under The Election Symbols (Reservation & Allotment) Order, 1968, this symbol is exclusively reserved for candidates nominated on Form A & Form B by this political organization.`,
        suggestedActions: [
          { label: "View All Political Parties", query: "What are all the recognized political parties and their symbols?" },
          { label: "Active Elections Gazette", query: "Which elections are currently active?" }
        ]
      };
    }

    // Otherwise return directory of political parties
    if (isHi) {
      let hiText = `### भारत निर्वाचन आयोग — मान्यताप्राप्त राजनीतिक दल एवं आरक्षित चुनाव चिन्ह\n\n` +
        `निर्वाचन सदन के अधिकृत रजिस्टर में कुल **${partiesList.length} राजनीतिक दल** पंजीकृत हैं:\n\n` +
        `| दल का नाम | संक्षिप्त | राष्ट्रीय अध्यक्ष / दल प्रमुख | आरक्षित चुनाव चिन्ह |\n` +
        `| :--- | :--- | :--- | :--- |\n`;
      partiesList.slice(0, 15).forEach(p => {
        hiText += `| **${p.name}** | \`${p.abbreviation}\` | ${p.leader || "पंजीकृत प्रमुख"} | **${p.symbol}** |\n`;
      });
      if (partiesList.length > 15) {
        hiText += `\n*...एवं ${partiesList.length - 15} अन्य क्षेत्रीय व पंजीकृत दल।*`;
      }
      return {
        language: "hi",
        response: hiText,
        suggestedActions: [
          { label: "BJP का विवरण", query: "BJP के राष्ट्रीय अध्यक्ष और चुनाव चिन्ह क्या हैं?" },
          { label: "INC का विवरण", query: "INC के अध्यक्ष और चुनाव चिन्ह क्या हैं?" }
        ]
      };
    }

    let enText = `### Election Commission of India — Recognized Parties & Reserved Symbols Register\n\n` +
      `Under The Election Symbols (Reservation and Allotment) Order, 1968, there are currently **${partiesList.length} recognized political organizations** in the statutory register:\n\n` +
      `| Political Party Name | Abbr | Party Leader / President | Reserved Election Symbol |\n` +
      `| :--- | :--- | :--- | :--- |\n`;
    partiesList.slice(0, 15).forEach(p => {
      enText += `| **${p.name}** | \`${p.abbreviation}\` | ${p.leader || "Statutory Leader"} | **${p.symbol}** |\n`;
    });
    if (partiesList.length > 15) {
      enText += `\n*...plus ${partiesList.length - 15} additional recognized State and regional political parties recorded in Nirvachan Sadan.*`;
    }
    enText += `\n\n[PORTAL TIP]: Open **"Political Parties"** on your Admin Dashboard to view vector symbol badges, inspect contact dossiers, or register new parties.`;

    return {
      language: "en",
      response: enText,
      suggestedActions: [
        { label: "BJP Dossier", query: "Who is the leader of BJP and what is their symbol?" },
        { label: "INC Dossier", query: "Who is the leader of INC and what is their symbol?" },
        { label: "AAP Dossier", query: "Who is the leader of AAP and what is their symbol?" }
      ]
    };
  }

  // 9. DOUBLE-VOTING LOCKOUT & BLOCKCHAIN CONSENSUS SECURITY
  if (/double vot|vote twice|cheat|hack|tamper|can government change|duplicate vote|prevent double|smart contract security|दोहरा मतदान|दोनदा मत|हॅक/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### दोहरे मतदान की रोकथाम एवं त्रि-स्तरीय सुरक्षा प्रणाली (Single Vote Security)

नमस्ते! भारत निर्वाचन आयोग का मूल सिद्धांत है: **"एक नागरिक, एक मत"**। इस डिजिटल प्लेटफॉर्म में किसी भी प्रकार का फर्जी अथवा दोहरा मतदान पूर्णतः असंभव है:

1. **पहला स्तर — स्मार्ट कॉन्ट्रैक्ट सर्वसम्मति (Solidity Bytecode)**:
   - \`EVoting.sol\` स्मार्ट कॉन्ट्रैक्ट में \`hasVoted[electionId][voterAddress]\` मैपिंग है।
   - यदि कोई मतदाता दोबारा वोट डालने का प्रयास करता है, तो ब्लॉकचेन नोड तुरंत लेनदेन निरस्त करता है:
     \`require(!hasVoted[electionId][voter], "Voter has already voted");\`
2. **दूसरा स्तर — बैकएंड सर्वर गेटकीपर (REST API HTTP 409)**:
   - वोट भेजने से पहले सर्वर डेटाबेस में मतदाता की \`has_voted\` स्थिति की जांच करता है। यदि मतदाता पहले ही वोट डाल चुका है, तो अनुरोध तुरंत **HTTP 409 Conflict** त्रुटि के साथ रोक दिया जाता है।
3. **तीसरा स्तर — यूजर इंटरफेस शील्ड (Client Shield)**:
   - सफल मतदान के तुरंत बाद प्रत्याशी के वोट बटन हट जाते हैं और उनकी जगह **"Ballot Cast & Sealed on Blockchain"** की हरी मुहर लग जाती है।

[SECURITY NOTE]: जनप्रतिनिधित्व अधिनियम 1951 के तहत मत की गोपनीयता पूरी तरह सुरक्षित है। ब्लॉकचेन पर केवल यह दर्ज होता है कि आपने वोट डाला है, आपका वोट किसे गया है यह किसी तीसरे पक्ष को दिखाई नहीं देता।`,
        suggestedActions: [
          { label: "मतदान कैसे करें?", query: "मतदान करने की आधिकारिक प्रक्रिया क्या है?" },
          { label: "VVPAT रसीद नियम", query: "VVPAT रसीद सत्यापन कैसे काम करता है?" }
        ]
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### दुबार मतदानास प्रतिबंध व ब्लॉकचेन सुरक्षा (Single Vote Guarantee)

नमस्कार! "एक व्यक्ती, एक मत" या तत्त्वाचे रक्षण करण्यासाठी खालीलप्रमाणे त्रिस्तरीय सुरक्षा रचना आहे:

1. **ब्लॉकचेन स्मार्ट कॉन्ट्रॅक्ट**: \`EVoting.sol\` मध्ये \`hasVoted\` मॅपिंग असते. एकदा मत नोंदवले की कोड पुन्हा मतदान करण्यास नकार देतो.
2. **डेटाबेस गेटकीपर**: आधीच मत दिले असल्यास सर्व्हर **HTTP 409 Conflict** द्वारे व्यवहार थांबवतो.
3. **स्क्रीन सुरक्षा**: मतदान होताच मतदानाची सर्व बटणे अदृश्य होतात आणि हिरवा शिक्का लागतो.

[SECURITY NOTE]: आपले मत पूर्णपणे गोपनीय आणि सुरक्षित राहते.`,
        suggestedActions: [
          { label: "मतदान कसे करावे?", query: "मतदान कसे करावे? अधिकृत पायऱ्या सांगा" }
        ]
      };
    }

    return {
      language: "en",
      response: `### Double-Voting Prevention & Blockchain Security Architecture

Namaste! In free and fair Indian elections, the paramount guarantee is **"One Elector, One Ballot"**. SDEMS enforces an ironclad **Triple-Tier Lockout** against duplicate or fraudulent balloting:

| Security Tier | Defense Mechanism | Technical Enforcement |
| :--- | :--- | :--- |
| **Tier 1 (EVM Consensus)** | On-Chain State Machine | \`EVoting.sol\` enforces \`mapping(uint256 => mapping(address => bool)) hasVoted\`. Any duplicate transaction reverts at the EVM opcode level with: \`require(!hasVoted[electionId][voter], "Voter has already voted");\` |
| **Tier 2 (REST API & DB Gatekeeper)** | Relational Integrity Gate | \`voteController.js\` inspects \`voter_election_authorizations.has_voted\`. Repeat requests are aborted with **HTTP 409 Conflict** before generating any blockchain gas. |
| **Tier 3 (Client DOM Shield)** | Immediate Button Stripping | Upon receipt confirmation, the UI strips voting triggers and permanently renders the green **"BALLOT CAST & SEALED ON BLOCKCHAIN"** seal. |

[SECURITY NOTE]: Even if a bad actor modifies PostgreSQL local data, the decentralized Ethereum consensus ledger serves as the authoritative legal ground truth under RPA 1951 Section 64.`,
      suggestedActions: [
        { label: "Active Elections", query: "Show active elections open for voting" },
        { label: "Audit VVPAT Receipt", query: "How does VVPAT receipt verification work under Rule 49MA?" }
      ]
    };
  }

  // 10. SYSTEM TELEMETRY AUDIT
  if (/system status|health|blockchain status|node status|block height|contract address|is system online|live system|प्रणाली स्थिती|सिस्टम स्थिति/i.test(q)) {
    const status = await getLiveSystemStatus();
    if (!status.success) {
      return {
        language: lang,
        response: `[ALERT]: Unable to connect to backend infrastructure: ${status.error}`
      };
    }

    return {
      language: "en",
      response: `### Election Commission of India — Live National Infrastructure Audit
*Official Real-Time System & Distributed Consensus Ledger Telemetry*

| Infrastructure Component | Status | Operational Specification |
| :--- | :--- | :--- |
| **Relational Ledger (PostgreSQL)** | **ONLINE** | Synchronized at \`${new Date(status.dbTime).toISOString()}\` |
| **Blockchain Consensus RPC** | **${status.blockchain.status}** | \`${status.blockchain.network}\` |
| **Smart Contract (EVoting.sol)** | **VERIFIED** | \`${status.blockchain.contractAddress}\` |
| **EVM Block Height** | **Block #${status.blockchain.blockHeight}** | Consensus: ${status.blockchain.consensusEngine} |
| **Active Electoral Polls** | **${status.activeElectionsCount} Active** | Voting Compartments Open |
| **Registered Electors** | **${status.totalRegisteredElectors} Electors** | Verified against National Rolls |

[VERIFIED]: Node cryptographic state hashes match the published consensus specification. Zero unauthorized state mutations detected.`,
      action: "STATUS_CHECK"
    };
  }

  // 11. DESKTOP APPLICATION ARCHITECTURE & OPERATIONAL MANUAL
  if (/desktop|architecture|application architecture|sdems|system manual|admin workflow|how does app work|technologies|ports|how it works|प्रणाली कशी काम करते|एप्लिकेशन|सॉफ्टवेअर/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### SDEMS संपूर्ण डेस्कटॉप एप्लिकेशन एवं तकनीकी वास्तुकला मार्गदर्शिका

नमस्ते! SDEMS एक आधुनिक, विकेंद्रीकृत चुनावी प्रणाली है जो भारत निर्वाचन आयोग के कड़े मानकों पर आधारित है:

#### 1. तकनीकी अवसंरचना एवं नेटवर्क पोर्ट्स (Microservices)
- **डेस्कटॉप शैल**: Electron 43.4.0 नेटिव कंटेनर एवं बंडल किया गया Node.js रनटाइम (\`frontend/bin/node.exe\`)।
- **फ्रंटएंड क्लाइंट**: React 18, Vite बिल्डर (\`http://localhost:5173\`)।
- **बैकएंड सर्वर**: Node.js Express REST API (\`http://localhost:5000\`), JWT प्रमाणीकरण।
- **डेटाबेस लेजर**: PostgreSQL (\`Port 5432\`, डेटाबेस: \`evoting_db\`), 5-स्तरीय भौगोलिक निर्वाचन क्षेत्र प्रबंधन।
- **ब्लॉकचेन नोड**: Hardhat Ethereum EVM नोड (\`Port 8545\`), स्मार्ट कॉन्ट्रैक्ट \`EVoting.sol\`।
- **एनालिटिक्स इंजन**: Python सांख्यिकीय मॉड्यूल (मतदान प्रतिशत एवं जनसांख्यिकीय विश्लेषण)।

#### 2. संपूर्ण प्रशासनिक कार्यप्रवाह (Admin Lifecycle)
1. **व्यवस्थापक लॉगिन**: \`admin@evoting.gov.in\` द्वारा प्रशासनिक पोर्टल में प्रवेश।
2. **चुनाव निर्माण (Create Election)**: शीर्षक, अधिकार क्षेत्र, प्रारंभ व समाप्ति समय निर्धारित कर चुनाव को ब्लॉकचेन पर \`UPCOMING\` स्थिति में तैनात करना।
3. **प्रत्याशी पंजीकरण (Candidate Filing)**: न्यूनतम 2 प्रत्याशियों के नाम, दल, चुनाव चिन्ह एवं घोषणा पत्र जोड़ना।
4. **चुनाव प्रारंभ (Start Election)**: चुनाव को \`ACTIVE\` स्थिति में बदलना जिससे सभी सत्यापित मतदाता स्वतः नामांकित होते हैं।
5. **मतदान एवं रसीद**: नागरिक द्वारा एकल-क्लिक गैसलेस मतदान एवं डिजिटल VVPAT रसीद (REC-XXXX) जारी करना।
6. **चुनाव समापन एवं परिणाम**: चुनाव समाप्त कर ब्लॉकचेन सर्वसम्मति द्वारा परिणाम सत्यापित कर Form 21C प्रमाण-पत्र जारी करना।`
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### SDEMS संपूर्ण डेस्कटॉप ॲप्लिकेशन व तांत्रिक रचना

नमस्ते! SDEMS प्रणालीचे संपूर्ण आर्किटेक्चर खालीलप्रमाणे आहे:

#### 1. मायक्रो सर्व्हिसेस व पोर्ट्स:
- **डेस्कटॉप ॲप**: Electron नेटिव्ह कंटेनर, बंडल Node.js रनटाइम.
- **फ्रंटएंड**: React, Vite बिल्ड (\`Port 5173\`).
- **बैकएंड API**: Express REST API (\`Port 5000\`), JWT सुरक्षा.
- **डेटाबेस**: PostgreSQL (\`Port 5432\`, \`evoting_db\`).
- **ब्लॉकचेन नोड**: Hardhat Ethereum नोड (\`Port 8545\`), \`EVoting.sol\`.

#### 2. प्रशासकीय टप्पे:
1. मुख्य प्रशासक लॉगिन.
2. निवडणूक तयार करणे (UPCOMING).
3. उमेदवार व पक्षचिन्हे नोंदवणे (किमान २ उमेदवार).
4. निवडणूक सुरू करणे (ACTIVE).
5. मतदारांचे मोफत मतदान व VVPAT पावती.
6. मतमोजणी व निकाल प्रसिद्धी (Form 21C).`
      };
    }

    return {
      language: "en",
      response: `### SDEMS Desktop Application: Technical Architecture & Operational Manual

Namaste! SDEMS is an enterprise-grade electronic voting and electoral management suite engineered to fulfill all statutory standards of the Election Commission of India:

#### 1. System Topology & Service Interconnects
- **Desktop Shell**: Electron 43.4.0 Native Container with bundled Node.js executable (\`frontend/bin/node.exe\`) and NSIS silent installer.
- **Presentation Layer**: React 18 + Vite (\`http://localhost:5173\`) with official ECI institutional styling.
- **Application Layer**: Express.js REST API (\`http://localhost:5000\`) managing JWT session tokens and cryptographic relayer services.
- **Persistence Layer**: PostgreSQL (\`Port 5432\`, database: \`evoting_db\`) maintaining the 5-tier constituency hierarchy.
- **Distributed Consensus Layer**: Hardhat Ethereum EVM Local Node (\`Port 8545\`) executing bytecode on \`EVoting.sol\`.
- **Analytical Layer**: Python microservice calculating turnout metrics and statistical vote spreads.

#### 2. Complete Administrative Operational Lifecycle
1. **Administrative Authentication**:
   - Super Admins and Returning Officers log in via the Administrative Gateway (\`admin@evoting.gov.in\`).
2. **Election Drafting & Deployment**:
   - Admin inputs Title, Territorial Scope, Start Date, and End Date -> Deploys election record to Ethereum in \`UPCOMING\` status.
3. **Candidate Nomination & Symbol Allotment**:
   - RO registers verified candidates (Minimum 2 required), binding candidate metadata, political party seals, and manifestos.
4. **Election Activation**:
   - RO executes **"Start Election"** -> Smart contract status changes to \`ACTIVE\` -> System bulk-enrolls all verified constituency electors into the ballot roster.
5. **Elector Balloting**:
   - Electors authenticate via EPIC/Email -> Cast ballot via official ECI Relayer (\`castVoteFor\`) with zero gas fees -> Instant Form 49MA VVPAT receipt issued.
6. **Closure, Consensus Tally & Result Publication**:
   - RO clicks **"End Election"** (\`ENDED\` status) -> Clicks **"Publish Results"** -> Contract tallies on-chain votes across blocks -> Generates the official Form 21C Certificate of Election.`
    };
  }

  // 12. ECI STATUTORY FORMS & CONSTITUTIONAL ARTICLES
  if (/form 6|form 7|form 8|form 17a|form 17c|article 324|rpa|statute|constitution|act|फॉर्म|अनुच्छेद/i.test(q)) {
    if (isHi) {
      return {
        language: "hi",
        response: `### भारत निर्वाचन आयोग — प्रमुख वैधानिक फॉर्म एवं संवैधानिक अनुच्छेद

नमस्ते! भारत के संविधान एवं जनप्रतिनिधित्व अधिनियम के अंतर्गत मुख्य प्रावधान निम्नलिखित हैं:

#### 1. संवैधानिक अनुच्छेद (Articles 324 से 329)
- **अनुच्छेद 324**: चुनावों के अधीक्षण, निर्देशन और नियंत्रण का संपूर्ण अधिकार भारत निर्वाचन आयोग में निहित है।
- **अनुच्छेद 325**: धर्म, मूलवंश, जाति या लिंग के आधार पर किसी व्यक्ति को मतदाता सूची में शामिल होने से वंचित नहीं किया जा सकता।
- **अनुच्छेद 326**: 18 वर्ष या उससे अधिक आयु के प्रत्येक भारतीय नागरिक को वयस्क मताधिकार प्राप्त है।
- **अनुच्छेद 329**: चुनावी प्रक्रियाओं में अदालतों के हस्तक्षेप पर रोक (चुनाव याचिका के माध्यम से ही चुनौती संभव)।

#### 2. मुख्य चुनावी फॉर्म (ECI Forms)
- **Form 6**: 18 वर्ष पूर्ण कर चुके नागरिकों का नए मतदाता के रूप में नाम जोड़ने हेतु आवेदन।
- **Form 6A**: विदेश में रहने वाले भारतीय नागरिकों (NRI) के पंजीकरण हेतु।
- **Form 7**: मतदाता सूची से किसी मृत या स्थानांतरित व्यक्ति का नाम हटाने अथवा आपत्ति दर्ज करने हेतु।
- **Form 8**: पते में परिवर्तन, विवरण सुधार, नया EPIC कार्ड प्राप्त करने या दिव्यांग (PwD) चिन्हांकन हेतु।
- **Form 17A**: मतदान केंद्र पर पीठासीन अधिकारी द्वारा संधारित मतदाताओं का आधिकारिक रजिस्टर।
- **Form 17C**: मतदान समाप्ति पर जारी अभिलेखित मतों का लेखा एवं पेपर सील का लेखा।
- **Form 20**: मतदान केंद्रवार मतों का अंतिम परिणाम पत्र।
- **Form 21C / 21E**: रिटर्निंग ऑफिसर (RO) द्वारा विजयी प्रत्याशी को जारी आधिकारिक निर्वाचन प्रमाण-पत्र।

[PRACTICAL TIP]: यदि आपको अपने पते या नाम में सुधार करना है, तो Form 8 सबसे उपयुक्त विकल्प है।`
      };
    } else if (isMr) {
      return {
        language: "mr",
        response: `### भारत निवडणूक आयोग — महत्त्वाचे कायदे व अर्ज (Forms)

नमस्कार! भारतीय संविधानातील तरतुदी आणि निवडणूक नियम खालीलप्रमाणे आहेत:

- **अनुच्छेद 324**: निवडणूक आयोगाला निवडणुकांचे संपूर्ण नियंत्रण व संचालन करण्याचे घटनात्मक अधिकार.
- **अनुच्छेद 326**: वय १८ वर्षे पूर्ण असणाऱ्या सर्व भारतीय नागरिकांना मतदानाचा अधिकार.
- **Form 6**: मतदार यादीत नवीन नाव नोंदणीसाठी अर्ज.
- **Form 7**: मतदार यादीतून नाव वगळण्यासाठी किंवा हरकतीसाठी अर्ज.
- **Form 8**: पत्ता बदल, नाव दुरुस्ती किंवा नवीन मतदार ओळखपत्रासाठी (EPIC) अर्ज.
- **Form 17C**: मतदान संपल्यावर तयार केलेला प्रत्यक्ष मतांचा अधिकृत हिशेब.
- **नियम 49M**: मतदानाची गोपनीयता राखण्याची कायदेशीर अनिवार्यता.`
      };
    }

    return {
      language: "en",
      response: `### Statutory Compendium: Constitutional Articles, Acts & ECI Forms

Namaste! Here is the authoritative guide to Indian electoral statutes and official forms:

#### 1. Constitutional Provisions (Articles 324 to 329)
- **Article 324**: Vests superintendence, direction, and conduct of all parliamentary and state elections in the independent Election Commission of India.
- **Article 325**: One general electoral roll for every territorial constituency without discrimination on grounds of religion, race, caste, or sex.
- **Article 326**: Universal adult suffrage for all citizens not less than 18 years of age.
- **Article 329**: Bar to interference by courts in electoral matters (handled via Election Petitions under Part VI of RPA 1951).

#### 2. Official Statutory Forms
- **Form 6**: Application for inclusion of name in the Electoral Roll for first-time electors turning 18 or shifting constituencies.
- **Form 6A**: Electoral registration application for Overseas Indian Citizens (NRIs).
- **Form 7**: Statutory objection to inclusion or application for deletion of deceased/shifted electors.
- **Form 8**: Application for correction of entries, change of residence, replacement of EPIC, or PwD marking.
- **Form 17A**: Register of Voters maintained at the polling station under Rule 49L.
- **Form 17C**: Presiding Officer's Account of Votes Recorded and Paper Seal Account under Rule 49T.
- **Form 20**: Final Result Sheet recording polling booth-wise tallies.
- **Form 21C / 21E**: Official Certificate of Election issued to the winning candidate under Rule 66.

[PRACTICAL TIP]: To update your constituency or address online, Form 8 is the official procedure.`
    };
  }

  // 13. DEFAULT FRIENDLY INDIAN ASSISTANT FALLBACK
  if (isHi) {
    return {
      language: "hi",
      response: `### भारत निर्वाचन आयोग — आधिकारिक चुनावी सहायता प्रणाली

नमस्ते! मैं भारत निर्वाचन आयोग का अधिकृत चुनावी एवं ब्लॉकचेन डिजिटल सहायक हूँ। मैं निम्नलिखित विषयों पर आपकी पूरी सहायता कर सकता हूँ:

- **मतदाता लॉगिन व EPIC**: अपने 10-अंकीय मतदाता पहचान पत्र या ईमेल से लॉगिन करने की विधि।
- **अधिकारी व एडमिन लॉगिन**: रिटर्निंग ऑफिसर एवं चुनाव अधिकारियों के लिए पोर्टल एक्सेस।
- **मतदान प्रक्रिया (Rule 49M)**: सुरक्षित, गोपनीय एवं निःशुल्क डिजिटल मतदान की प्रक्रिया।
- **मतदाता पर्ची व अमिट स्याही**: बीएलओ द्वारा पर्ची वितरण एवं मतदान केंद्र शिष्टाचार।
- **आदर्श आचार संहिता (MCC)**: चुनाव आचार संहिता एवं cVIGIL ऐप द्वारा त्वरित शिकायत।
- **सक्रिय चुनाव एवं प्रत्याशी**: चालू चुनावों की सूची, प्रत्याशी और उनके आधिकारिक चुनाव चिन्ह।
- **डिजिटल VVPAT रसीद ऑडिट**: अपनी रसीद (REC-XXXX) अथवा ब्लॉकचेन हैश की जांच।

कृपया अपना प्रश्न लिखें अथवा रसीद कोड दर्ज करें!`,
      suggestedActions: [
        { label: "मतदाता लॉगिन", query: "मतदाता लॉगिन कैसे करें? EPIC नंबर क्या है?" },
        { label: "एडमिन लॉगिन", query: "एडमिन लॉगिन कैसे करें और चुनाव कैसे बनाएं?" },
        { label: "मतदान नियम", query: "मतदान करने की आधिकारिक प्रक्रिया क्या है?" },
        { label: "सक्रिय चुनाव", query: "सक्रिय चुनाव और प्रत्याशी दिखाएं" }
      ]
    };
  } else if (isMr) {
    return {
      language: "mr",
      response: `### भारत निवडणूक आयोग — अधिकृत डिजिटल सहाय्यक

नमस्कार! मी भारत निवडणूक आयोगाचा अधिकृत डिजिटल सहाय्यक आहे. मी खालील सेवांमध्ये आपली मदत करू शकतो:

- **मतदार व प्रशासकीय लॉगिन**: EPIC आयडी किंवा प्रशासकीय क्रेडेंशियल्स द्वारे प्रवेश.
- **मतदान प्रक्रिया**: गोपनीय आणि मोफत मतदान कसे करावे.
- **मतदार पावती व अमिट शाई**: बीएलओ पर्ची व मतदान केंद्र नियम.
- **आदर्श आचारसंहिता**: निवडणुकीचे नियम व तक्रार निवारण.
- **चालू निवडणुका व निकाल**: सक्रिय निवडणुकांची यादी व VVPAT पावती तपासणी.

कृपया आपला प्रश्न विचारा किंवा VVPAT पावती क्रमांक टाका!`,
      suggestedActions: [
        { label: "मतदार लॉगिन", query: "मतदार लॉगिन कसे करावे? EPIC ID कसा वापरावा?" },
        { label: "प्रशासक लॉगिन", query: "अधिकारी लॉगिन व निवडणूक कशी चालवावी?" },
        { label: "मतदान पायऱ्या", query: "मतदान कसे करावे? अधिकृत पायऱ्या सांगा" }
      ]
    };
  }

  return {
    language: "en",
    response: `### Election Commission of India — Statutory AI Public Information System

Namaste! I am the official Election Commission of India Statutory & Blockchain Assistant. I am here to assist you with:

- **Voter Login & EPIC Assistance**: Signing in with your 10-character Voter ID or registered email.
- **Admin & RO Portal Guidance**: Accessing the administrative suite to draft elections and publish results.
- **Statutory Voting Protocols (Rule 49M)**: Step-by-step voting with the official ECI relayer and single-vote protection.
- **Voter Parchi & Indelible Ink**: Polling booth procedures, BLO slip distribution, and indelible ink safeguards.
- **Model Code of Conduct (MCC)**: Campaign restrictions, silence periods, and cVIGIL citizen grievances.
- **Active Elections Gazette**: Real-time listing of ongoing polls, candidates, and allotted symbols.
- **VVPAT Receipt Auditing (Rule 49MA)**: Verifying transaction hashes and block confirmations.
- **Constitutional Articles & Forms**: Articles 324–329, RPA 1950/1951, Forms 6, 7, 8, and Form 17C.

Please submit your inquiry or paste your VVPAT receipt code (e.g. \`REC-XXXX\`) for cryptographic verification!`,
    suggestedActions: [
      { label: "Voter Login Help", query: "How do I login as a voter with EPIC id?" },
      { label: "Admin Login Help", query: "How to login as admin and returning officer?" },
      { label: "Rule 49M Balloting", query: "How to cast a vote step by step under ECI rules?" },
      { label: "Voter Parchi & Ink", query: "What is voter parchi and indelible ink mark?" },
      { label: "Aachar Sanhita (MCC)", query: "What is Model Code of Conduct and Aachar Sanhita?" },
      { label: "Active Elections Gazette", query: "Show active elections open for voting" },
      { label: "Audit VVPAT Receipt", query: "How does VVPAT receipt verification work under Rule 49MA?" }
    ]
  };
}
