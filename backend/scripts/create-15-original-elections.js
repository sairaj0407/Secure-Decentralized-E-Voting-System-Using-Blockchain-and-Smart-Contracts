const pool = require("../config/database");
const { votingContract, CONTRACT_ADDRESS } = require("../config/blockchain");
const { 
    createElectionOnBlockchain, 
    registerCandidateOnBlockchain,
    authorizeVoterOnBlockchain
} = require("../services/blockchainService");

const electionsData = [
    {
        title: "Maharashtra Legislative Assembly Election 2026 (Pune Cantonment)",
        description: "General statutory election to the Maharashtra Vidhan Sabha for Assembly Constituency AC-214 Pune Cantonment.",
        election_code: "MAH-LA-2026-214",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Maharashtra",
        district: "Pune",
        constituency: "Pune Cantonment",
        candidates: [
            {
                name: "Dilip Kamble",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Post Graduate (M.A., Pune University)",
                total_assets: "₹ 4,20,00,000",
                total_liabilities: "₹ 12,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 statutory affidavit verified by RO. No pending cases.",
                manifesto: "Upgradation of cantonment civil hospital, modern drainage corridors, and smart municipal schools."
            },
            {
                name: "Ramesh Bagwe",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "Bachelor of Arts (B.A., Savitribai Phule Pune University)",
                total_assets: "₹ 3,85,00,000",
                total_liabilities: "₹ 6,50,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 disclosure verified. Zero criminal convictions.",
                manifesto: "Free urban transit passes for senior citizens, slum redevelopment land titles, and youth vocational hubs."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Delhi Legislative Assembly Election 2026 (New Delhi Constituency)",
        description: "Official statutory election for the NCT of Delhi Legislative Assembly representing New Delhi AC-40.",
        election_code: "DEL-LA-2026-040",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "NCT of Delhi",
        district: "New Delhi",
        constituency: "New Delhi",
        candidates: [
            {
                name: "Sunil Grover",
                party: "Aam Aadmi Party (AAP)",
                symbol: "Broom",
                education: "M.Tech in Urban Planning, IIT Delhi",
                total_assets: "₹ 2,10,00,000",
                total_liabilities: "₹ 3,40,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 affidavit clear. No criminal record.",
                manifesto: "Expansion of clean energy mohalla clinics, 24x7 treated water network, and high-tech public classrooms."
            },
            {
                name: "Meenakshi Lekhi",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Bachelor of Laws (LL.B., Campus Law Centre)",
                total_assets: "₹ 7,50,00,000",
                total_liabilities: "₹ 22,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Verified by Returning Officer. Impeccable constitutional standing.",
                manifesto: "Heritage preservation, digital administrative ease, and rooftop rainwater harvesting mandates."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Karnataka Legislative Assembly Election 2026 (Shanti Nagar)",
        description: "General statutory election to the Karnataka Legislative Assembly for AC-163 Shanti Nagar.",
        election_code: "KAR-LA-2026-163",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Karnataka",
        district: "Bengaluru Urban",
        constituency: "Shanti Nagar",
        candidates: [
            {
                name: "N. A. Haris",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "B.A. Political Science, Bangalore University",
                total_assets: "₹ 9,10,00,000",
                total_liabilities: "₹ 45,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 validated. Zero pending criminal convictions.",
                manifesto: "Smart storm-water drain overhaul, women safety transit corridors, and green park conservation."
            },
            {
                name: "K. Shivakumar",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Chartered Accountant (FCA), ICAI",
                total_assets: "₹ 4,75,00,000",
                total_liabilities: "₹ 14,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 clear. Full disclosure submitted.",
                manifesto: "Fiscal transparency in municipal works, tech-driven garbage management, and citizen grievance portal."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Uttar Pradesh Legislative Assembly Election 2027 (Lucknow Central)",
        description: "Statutory election for the Uttar Pradesh Legislative Assembly AC-174 Lucknow Central.",
        election_code: "UP-LA-2027-174",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Uttar Pradesh",
        district: "Lucknow",
        constituency: "Lucknow Central",
        candidates: [
            {
                name: "Brijesh Pathak",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Master of Laws (LL.M., Lucknow University)",
                total_assets: "₹ 6,40,00,000",
                total_liabilities: "₹ 18,50,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 validated. Clear criminal record.",
                manifesto: "Modernization of district health centers, riverfront ecological zone, and business startup incubators."
            },
            {
                name: "Ravidas Mehrotra",
                party: "Samajwadi Party (SP)",
                symbol: "Bicycle",
                education: "M.A. Sociology, Lucknow University",
                total_assets: "₹ 2,90,00,000",
                total_liabilities: "₹ 5,20,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 cleared by RO.",
                manifesto: "Affordable housing for municipal laborers, urban youth skill centers, and pension security."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Tamil Nadu Legislative Assembly Election 2026 (Mylapore)",
        description: "Official election for the Tamil Nadu Legislative Assembly representing Mylapore AC-25.",
        election_code: "TN-LA-2026-025",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Tamil Nadu",
        district: "Chennai",
        constituency: "Mylapore",
        candidates: [
            {
                name: "T. Velu",
                party: "Dravida Munnetra Kazhagam (DMK)",
                symbol: "Rising Sun",
                education: "Doctorate in Public Administration (Madras University)",
                total_assets: "₹ 5,10,00,000",
                total_liabilities: "₹ 16,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Full disclosure Form 26 verified. Zero cases.",
                manifesto: "Desalination water grid expansion, cultural heritage protection, and coastal youth technology fellowships."
            },
            {
                name: "R. Nataraj",
                party: "All India Anna Dravida Munnetra Kazhagam (AIADMK)",
                symbol: "Two Leaves",
                education: "M.Sc., Former Director General of Police",
                total_assets: "₹ 4,30,00,000",
                total_liabilities: "₹ 8,90,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified. Distinguished public service record.",
                manifesto: "Modern community policing, senior citizen healthcare delivery, and civic infrastructure restoration."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "West Bengal Legislative Assembly Election 2026 (Bhabanipur)",
        description: "General statutory election to the West Bengal Legislative Assembly representing Bhabanipur AC-159.",
        election_code: "WB-LA-2026-159",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "West Bengal",
        district: "Kolkata",
        constituency: "Bhabanipur",
        candidates: [
            {
                name: "Sovandeb Chattopadhyay",
                party: "All India Trinamool Congress (AITC)",
                symbol: "Flowers and Grass",
                education: "M.A. & LL.B., University of Calcutta",
                total_assets: "₹ 3,60,00,000",
                total_liabilities: "₹ 9,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified. No pending cases.",
                manifesto: "Social security expansion for informal workers, restoration of heritage water bodies, and public health units."
            },
            {
                name: "Dr. Anirban Ganguly",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Ph.D. in International Relations, Jadavpur University",
                total_assets: "₹ 2,40,00,000",
                total_liabilities: "₹ 4,50,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 clear. Zero pending legal proceedings.",
                manifesto: "Industrial modernization corridors, youth technology grants, and clean municipal administration."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Gujarat Legislative Assembly Election 2027 (Ghatlodia)",
        description: "Statutory election for the Gujarat Vidhan Sabha representing Ghatlodia AC-44 in Ahmedabad district.",
        election_code: "GUJ-LA-2027-044",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Gujarat",
        district: "Ahmedabad",
        constituency: "Ghatlodia",
        candidates: [
            {
                name: "Bhupendrabhai Patel",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Diploma in Civil Engineering, Government Polytechnic",
                total_assets: "₹ 8,20,00,000",
                total_liabilities: "₹ 25,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified by RO. No pending legal cases.",
                manifesto: "Urban transit electrification, AI-driven traffic command centers, and solar industrial incentives."
            },
            {
                name: "Ami Yagnik",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "LL.M., Gujarat University",
                total_assets: "₹ 3,90,00,000",
                total_liabilities: "₹ 11,20,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 cleared. Impeccable legal credentials.",
                manifesto: "Accessible community clinics, public school educational upgrades, and citizen ombudsman offices."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Telangana State Legislative Assembly Election 2028 (Jubilee Hills)",
        description: "General statutory election to the Telangana Legislative Assembly for AC-61 Jubilee Hills.",
        election_code: "TEL-LA-2028-061",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Telangana",
        district: "Hyderabad",
        constituency: "Jubilee Hills",
        candidates: [
            {
                name: "Mohammed Azharuddin",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "Bachelor of Commerce (B.Com, Osmania University)",
                total_assets: "₹ 11,50,00,000",
                total_liabilities: "₹ 60,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 validated by Returning Officer. No pending convictions.",
                manifesto: "Public sports academies, clean Musi riverfront rejuvenation, and youth IT incubation hubs."
            },
            {
                name: "Maganti Gopinath",
                party: "Bharat Rashtra Samithi (BRS)",
                symbol: "Car",
                education: "Graduate, Osmania University",
                total_assets: "₹ 9,80,00,000",
                total_liabilities: "₹ 35,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 verified. Complete statutory asset disclosure.",
                manifesto: "Elevated expressway connectivity, uninterrupted drinking water supply, and municipal digitization."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Brihanmumbai Municipal Corporation (BMC) Civic Election 2026 (Ward 198 - Dadar)",
        description: "Official civic council election for Municipal Ward 198 (Dadar West) under the Mumbai Municipal Corporation Act.",
        election_code: "BMC-CIVIC-2026-198",
        election_type: "MUNICIPAL",
        election_level: "MUNICIPAL",
        state: "Maharashtra",
        district: "Mumbai City",
        constituency: "Ward 198 (Dadar)",
        candidates: [
            {
                name: "Vishakha Raut",
                party: "Shiv Sena (Uddhav Balasaheb Thackeray)",
                symbol: "Flaming Torch",
                education: "Graduate in Arts, University of Mumbai",
                total_assets: "₹ 2,80,00,000",
                total_liabilities: "₹ 5,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified by Civic Returning Officer.",
                manifesto: "Pedestrian-friendly footpaths, modernization of historic Dadar markets, and 24x7 water pressure."
            },
            {
                name: "Sada Sarvankar",
                party: "Shiv Sena",
                symbol: "Bow and Arrow",
                education: "Higher Secondary, Maharashtra State Board",
                total_assets: "₹ 3,40,00,000",
                total_liabilities: "₹ 8,20,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 clear. Zero convictions.",
                manifesto: "Underground flood holding tanks, automated garbage collection compactors, and sports facilities."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Parliamentary Bye-Election 2026 (Wayanad Lok Sabha PC-04)",
        description: "Official statutory bye-election conducted by the Election Commission of India for Parliamentary Constituency PC-04 Wayanad.",
        election_code: "KER-PC-2026-004",
        election_type: "PARLIAMENTARY",
        election_level: "NATIONAL",
        state: "Kerala",
        district: "Wayanad",
        constituency: "Wayanad",
        candidates: [
            {
                name: "Priyanka Gandhi Vadra",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "Post Graduate Diploma in Buddhist Studies",
                total_assets: "₹ 12,00,00,000",
                total_liabilities: "₹ 15,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 validated by District Election Officer. Clean statutory record.",
                manifesto: "Comprehensive landslide early-warning radars, rural healthcare specialty centers, and eco-tourism promotion."
            },
            {
                name: "Sathyan Mokeri",
                party: "Communist Party of India (Marxist)",
                symbol: "Hammer, Sickle and Star",
                education: "Graduate, Calicut University",
                total_assets: "₹ 1,10,00,000",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Full disclosure RPA 1951. No pending criminal cases.",
                manifesto: "Statutory minimum support price for spices, debt waiver for flood-hit farmers, and tribal welfare housing."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Punjab Legislative Assembly Election 2027 (Amritsar East)",
        description: "General election to the Punjab Vidhan Sabha representing AC-18 Amritsar East.",
        election_code: "PUN-LA-2027-018",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Punjab",
        district: "Amritsar",
        constituency: "Amritsar East",
        candidates: [
            {
                name: "Navjot Singh Sidhu",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "Bachelor of Arts, Panjab University",
                total_assets: "₹ 9,50,00,000",
                total_liabilities: "₹ 20,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 validated. Full asset disclosure.",
                manifesto: "Direct agro-processing market access, youth rehabilitation and vocational training centers, and trade corridors."
            },
            {
                name: "Jeevan Jyot Kaur",
                party: "Aam Aadmi Party (AAP)",
                symbol: "Broom",
                education: "Master of Social Work (MSW)",
                total_assets: "₹ 1,75,00,000",
                total_liabilities: "₹ 3,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 clear. Zero criminal convictions.",
                manifesto: "Aam Aadmi Clinics network in east suburbs, 300 units free power delivery, and transparent road construction."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Rajasthan Legislative Assembly Election 2028 (Sardarpura)",
        description: "Official election to the Rajasthan Legislative Assembly representing AC-127 Sardarpura.",
        election_code: "RAJ-LA-2028-127",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Rajasthan",
        district: "Jodhpur",
        constituency: "Sardarpura",
        candidates: [
            {
                name: "Ashok Gehlot",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "Bachelor of Science (B.Sc.) & LL.B., Jai Narain Vyas University",
                total_assets: "₹ 6,80,00,000",
                total_liabilities: "₹ 10,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified. Clean constitutional record.",
                manifesto: "Chiranjeevi universal health insurance strengthening, canal water supply expansion, and old pension scheme guarantee."
            },
            {
                name: "Prof. Mahendra Rathore",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Ph.D. in Commerce, University of Rajasthan",
                total_assets: "₹ 3,20,00,000",
                total_liabilities: "₹ 7,50,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 validated. Zero pending cases.",
                manifesto: "Industrial solar parks, crime prevention taskforce, and digital transparency in recruitment exams."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Andhra Pradesh Legislative Assembly Election 2029 (Kuppam)",
        description: "General statutory election to the Andhra Pradesh Vidhan Sabha representing AC-175 Kuppam.",
        election_code: "AP-LA-2029-175",
        election_type: "ASSEMBLY",
        election_level: "STATE",
        state: "Andhra Pradesh",
        district: "Chittoor",
        constituency: "Kuppam",
        candidates: [
            {
                name: "N. Chandrababu Naidu",
                party: "Telugu Desam Party (TDP)",
                symbol: "Bicycle",
                education: "Master of Arts in Economics (M.A., SV University)",
                total_assets: "₹ 14,00,00,000",
                total_liabilities: "₹ 50,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified. Full compliance with RPA 1951.",
                manifesto: "Micro-irrigation network, electronic manufacturing cluster, and youth skill capital formation."
            },
            {
                name: "K. R. J. Bharath",
                party: "YSR Congress Party (YSRCP)",
                symbol: "Ceiling Fan",
                education: "Graduate in Business Administration",
                total_assets: "₹ 4,50,00,000",
                total_liabilities: "₹ 12,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 verified. Clear legal standing.",
                manifesto: "Village secretariat decentralized governance, direct welfare benefit credit, and dairy subsidies."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "Greater Hyderabad Municipal Corporation (GHMC) Ward Election 2026 (Banjara Hills Ward 93)",
        description: "Statutory civic poll for Banjara Hills Ward 93 under GHMC Act, 1955.",
        election_code: "GHMC-CIVIC-2026-093",
        election_type: "MUNICIPAL",
        election_level: "MUNICIPAL",
        state: "Telangana",
        district: "Hyderabad",
        constituency: "Ward 93 (Banjara Hills)",
        candidates: [
            {
                name: "Kavitha Reddy",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "Post Graduate in Mass Communication",
                total_assets: "₹ 5,30,00,000",
                total_liabilities: "₹ 15,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified by Municipal RO.",
                manifesto: "Rainwater harvesting enforcement, road resurfacing with polymer concrete, and stray animal shelter network."
            },
            {
                name: "Vijaya Lakshmi Gadwal",
                party: "Bharat Rashtra Samithi (BRS)",
                symbol: "Car",
                education: "Bachelor of Arts & Journalism, US University",
                total_assets: "₹ 6,10,00,000",
                total_liabilities: "₹ 20,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Form 26 validated. Zero pending cases.",
                manifesto: "Smart underground cabling, lake rejuvenation, and modern community welfare centers."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    },
    {
        title: "National Parliamentary Biennial Council of States (Rajya Sabha Election 2026)",
        description: "Official statutory biennial election conducted under Article 80 of the Constitution of India for the Council of States.",
        election_code: "RS-NAT-2026-001",
        election_type: "PARLIAMENTARY",
        election_level: "NATIONAL",
        state: "National Capital Territory of Delhi",
        district: "New Delhi",
        constituency: "Council of States",
        candidates: [
            {
                name: "Dr. S. Jaishankar",
                party: "Bharatiya Janata Party (BJP)",
                symbol: "Lotus",
                education: "Ph.D. in International Relations, Jawaharlal Nehru University",
                total_assets: "₹ 16,50,00,000",
                total_liabilities: "₹ 30,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 validated by Returning Officer. Outstanding diplomatic and public record.",
                manifesto: "National strategic sovereignty, digital public infrastructure diplomacy, and international educational exchanges."
            },
            {
                name: "P. Chidambaram",
                party: "Indian National Congress (INC)",
                symbol: "Hand",
                education: "MBA, Harvard Business School & LL.M., Madras University",
                total_assets: "₹ 18,20,00,000",
                total_liabilities: "₹ 40,00,000",
                criminal_cases_count: 0,
                affidavit_summary: "Statutory Form 26 verified. Full compliance with parliamentary disclosure guidelines.",
                manifesto: "Federal fiscal equity, protection of state financial autonomy, and statutory employment guarantees."
            },
            {
                name: "None of the Above (NOTA)",
                party: "Statutory ECI Option",
                symbol: "Ballot Cross",
                education: "Statutory Constitutional Right",
                total_assets: "₹ 0",
                total_liabilities: "₹ 0",
                criminal_cases_count: 0,
                affidavit_summary: "Supreme Court mandate PUCL v. UOI (2013).",
                manifesto: "Democratic rejection of all contesting candidates."
            }
        ]
    }
];

async function create15Elections() {
    console.log("==================================================");
    console.log("SDEMS - CREATING 15 ORIGINAL ELECTIONS (STATUS: UPCOMING)");
    console.log("==================================================");

    try {
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
        const adminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : 1;

        const votersRes = await pool.query("SELECT id, name, voter_id, wallet_address FROM users WHERE role = 'VOTER'");

        let createdCount = 0;

        for (const elData of electionsData) {
            console.log(`\n--- [${createdCount + 1}/15] Processing: ${elData.title} ---`);

            const startTime = new Date(Date.now() + 2 * 3600000); // 2 hours from now
            const endTime = new Date(Date.now() + 30 * 24 * 3600000); // 30 days in future

            const startUnix = Math.floor(startTime.getTime() / 1000);
            const endUnix = Math.floor(endTime.getTime() / 1000);

            // 1. Create on Blockchain
            const blockchainResult = await createElectionOnBlockchain(
                elData.title,
                elData.description,
                startUnix,
                endUnix
            );

            let blockchainElectionId = null;
            for (const log of blockchainResult.receipt.logs) {
                try {
                    const parsed = votingContract.interface.parseLog({
                        topics: log.topics,
                        data: log.data
                    });
                    if (parsed && parsed.name === "ElectionCreated") {
                        blockchainElectionId = parsed.args.electionId.toString();
                        break;
                    }
                } catch (_) {}
            }

            if (!blockchainElectionId) {
                throw new Error(`Failed to extract blockchain election ID for ${elData.title}`);
            }
            console.log(`   On-chain Blockchain Election ID: ${blockchainElectionId}`);

            // 2. Insert into PostgreSQL
            const insertElectionQuery = `
                INSERT INTO elections (
                    title, description, start_time, end_time, status, created_by,
                    contract_address, blockchain_election_id, election_type, election_code,
                    election_level, state, district, constituency
                ) VALUES (
                    $1, $2, $3, $4, 'UPCOMING', $5,
                    $6, $7, $8, $9,
                    $10, $11, $12, $13
                ) RETURNING id;
            `;

            const elRes = await pool.query(insertElectionQuery, [
                elData.title,
                elData.description,
                startTime,
                endTime,
                adminId,
                CONTRACT_ADDRESS || votingContract.target,
                blockchainElectionId,
                elData.election_type,
                elData.election_code,
                elData.election_level,
                elData.state,
                elData.district,
                elData.constituency
            ]);

            const dbElectionId = elRes.rows[0].id;
            console.log(`   PostgreSQL Election ID: ${dbElectionId} (Status: UPCOMING)`);

            // 3. Register Candidates
            let candidateIdx = 1;
            for (const cand of elData.candidates) {
                const candBcResult = await registerCandidateOnBlockchain(
                    blockchainElectionId,
                    cand.name,
                    cand.party,
                    cand.symbol,
                    cand.manifesto
                );

                const partyCheck = await pool.query("SELECT id FROM parties WHERE name ILIKE $1 OR abbreviation ILIKE $1 LIMIT 1", [cand.party.split("(")[0].trim()]);
                const partyId = partyCheck.rows.length > 0 ? partyCheck.rows[0].id : null;

                const insertCandQuery = `
                    INSERT INTO candidates (
                        election_id, name, party, symbol, manifesto,
                        education, total_assets, total_liabilities, criminal_cases_count,
                        affidavit_summary, status, party_id, blockchain_candidate_id
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9,
                        $10, 'FINAL', $11, $12
                    ) RETURNING id;
                `;

                const candRes = await pool.query(insertCandQuery, [
                    dbElectionId,
                    cand.name,
                    cand.party,
                    cand.symbol,
                    cand.manifesto,
                    cand.education,
                    cand.total_assets,
                    cand.total_liabilities,
                    cand.criminal_cases_count,
                    cand.affidavit_summary,
                    partyId,
                    candidateIdx
                ]);

                if (candBcResult && candBcResult.receipt) {
                    await pool.query(`
                        INSERT INTO blockchain_transactions (
                            election_id, tx_hash, block_number, wallet_address, gas_used, transaction_status, confirmed_at
                        ) VALUES ($1, $2, $3, $4, $5, 'CONFIRMED', CURRENT_TIMESTAMP)
                    `, [
                        dbElectionId,
                        candBcResult.receipt.hash,
                        candBcResult.receipt.blockNumber ? Number(candBcResult.receipt.blockNumber) : null,
                        candBcResult.receipt.from,
                        candBcResult.receipt.gasUsed ? candBcResult.receipt.gasUsed.toString() : null
                    ]);
                }

                console.log(`     Candidate registered: ${cand.name} (${cand.party}) - DB ID: ${candRes.rows[0].id}, BC ID: ${candidateIdx}`);
                candidateIdx++;
            }

            // 4. Pre-Authorize Electors for this election
            for (const voter of votersRes.rows) {
                try {
                    if (voter.wallet_address) {
                        await authorizeVoterOnBlockchain(blockchainElectionId, voter.wallet_address);
                    }
                } catch (authErr) {
                    console.warn(`     Auth notice for ${voter.name}:`, authErr.message);
                }

                await pool.query(`
                    INSERT INTO voter_election_authorizations (user_id, election_id, is_authorized, has_voted)
                    VALUES ($1, $2, TRUE, FALSE)
                    ON CONFLICT (user_id, election_id) DO UPDATE SET is_authorized = TRUE, has_voted = FALSE;
                `, [voter.id, dbElectionId]);
            }

            createdCount++;
        }

        console.log("\n==================================================");
        console.log(`SUCCESSFULLY CREATED ALL ${createdCount} ORIGINAL ELECTIONS!`);
        console.log("All 15 elections are stored with status: UPCOMING.");
        console.log("None of them have been started, ready for you to start on-demand.");
        console.log("==================================================");

        process.exit(0);
    } catch (err) {
        console.error("FATAL ERROR creating 15 elections:", err);
        process.exit(1);
    }
}

create15Elections();
