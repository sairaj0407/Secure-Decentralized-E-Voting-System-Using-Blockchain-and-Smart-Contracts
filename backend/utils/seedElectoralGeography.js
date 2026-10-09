const pool = require('d:/Secure Decentralized E-Voting System Using Blockchain and Smart Contracts/backend/config/database');

const NATIONAL_GEOGRAPHY = [
  {
    code: "MH",
    name: "Maharashtra",
    type: "STATE",
    pcs: [
      { name: "Mumbai South", number: 31, code: "MH-PC-31" },
      { name: "Mumbai North", number: 29, code: "MH-PC-29" },
      { name: "Pune", number: 34, code: "MH-PC-34" },
      { name: "Nagpur", number: 10, code: "MH-PC-10" }
    ],
    districts: [
      {
        name: "Mumbai City",
        code: "MH_MUM",
        acs: [
          { name: "Colaba", number: 187, code: "MH-AC-187", landmark: "Fort & Colaba Pier", pincode: "400005" },
          { name: "Malabar Hill", number: 185, code: "MH-AC-185", landmark: "Walkeshwar & Ridge Road", pincode: "400006" },
          { name: "Byculla", number: 184, code: "MH-AC-184", landmark: "Dr. B.A. Road & Byculla East", pincode: "400027" }
        ]
      },
      {
        name: "Mumbai Suburban",
        code: "MH_MSU",
        acs: [
          { name: "Bandra West", number: 177, code: "MH-AC-177", landmark: "Hill Road & Bandstand", pincode: "400050" },
          { name: "Andheri West", number: 165, code: "MH-AC-165", landmark: "Lokhandwala Complex", pincode: "400053" }
        ]
      },
      {
        name: "Pune",
        code: "MH_PUN",
        acs: [
          { name: "Shivajinagar", number: 209, code: "MH-AC-209", landmark: "FC Road & Model Colony", pincode: "411005" },
          { name: "Kothrud", number: 210, code: "MH-AC-210", landmark: "Paud Road & Karve Nagar", pincode: "411038" }
        ]
      },
      {
        name: "Nagpur",
        code: "MH_NAG",
        acs: [
          { name: "Nagpur South West", number: 52, code: "MH-AC-052", landmark: "Pratap Nagar & Khamla", pincode: "440022" },
          { name: "Nagpur West", number: 56, code: "MH-AC-056", landmark: "Dharampeth & Civil Lines", pincode: "440010" }
        ]
      }
    ]
  },
  {
    code: "DL",
    name: "Delhi",
    type: "UT",
    pcs: [
      { name: "New Delhi", number: 4, code: "DL-PC-04" },
      { name: "Chandni Chowk", number: 1, code: "DL-PC-01" },
      { name: "South Delhi", number: 7, code: "DL-PC-07" }
    ],
    districts: [
      {
        name: "New Delhi",
        code: "DL_NDL",
        acs: [
          { name: "New Delhi AC", number: 40, code: "DL-AC-040", landmark: "Connaught Place & Gole Market", pincode: "110001" },
          { name: "RK Puram", number: 44, code: "DL-AC-044", landmark: "Sector 4 & Ring Road", pincode: "110022" }
        ]
      },
      {
        name: "Central Delhi",
        code: "DL_CDL",
        acs: [
          { name: "Chandni Chowk AC", number: 20, code: "DL-AC-020", landmark: "Red Fort & Town Hall", pincode: "110006" },
          { name: "Matia Mahal", number: 21, code: "DL-AC-021", landmark: "Jama Masjid Outer", pincode: "110006" }
        ]
      },
      {
        name: "South Delhi",
        code: "DL_SDL",
        acs: [
          { name: "Greater Kailash", number: 50, code: "DL-AC-050", landmark: "GK-1 M Block Market", pincode: "110048" },
          { name: "Malviya Nagar", number: 43, code: "DL-AC-043", landmark: "Saket Metro Corridor", pincode: "110017" }
        ]
      }
    ]
  },
  {
    code: "KA",
    name: "Karnataka",
    type: "STATE",
    pcs: [
      { name: "Bengaluru South", number: 26, code: "KA-PC-26" },
      { name: "Bengaluru Central", number: 25, code: "KA-PC-25" },
      { name: "Mysuru", number: 21, code: "KA-PC-21" }
    ],
    districts: [
      {
        name: "Bengaluru Urban",
        code: "KA_BLR",
        acs: [
          { name: "Shantinagar", number: 163, code: "KA-AC-163", landmark: "Richmond Town & Langford", pincode: "560027" },
          { name: "Malleshwaram", number: 150, code: "KA-AC-150", landmark: "Margosa Road & Sampige", pincode: "560003" },
          { name: "Jayanagar", number: 173, code: "KA-AC-173", landmark: "4th Block Complex", pincode: "560011" }
        ]
      },
      {
        name: "Mysuru",
        code: "KA_MYS",
        acs: [
          { name: "Krishnaraja", number: 216, code: "KA-AC-216", landmark: "Palace South & Agrahara", pincode: "570004" },
          { name: "Chamaraja", number: 217, code: "KA-AC-217", landmark: "KRS Road & Vontikoppal", pincode: "570020" }
        ]
      },
      {
        name: "Dakshina Kannada",
        code: "KA_DKA",
        acs: [
          { name: "Mangaluru City South", number: 201, code: "KA-AC-201", landmark: "Hampankatta & Kadri", pincode: "575001" }
        ]
      }
    ]
  },
  {
    code: "UP",
    name: "Uttar Pradesh",
    type: "STATE",
    pcs: [
      { name: "Lucknow", number: 35, code: "UP-PC-35" },
      { name: "Varanasi", number: 77, code: "UP-PC-77" },
      { name: "Kanpur", number: 43, code: "UP-PC-43" },
      { name: "Gautam Buddha Nagar", number: 13, code: "UP-PC-13" }
    ],
    districts: [
      {
        name: "Lucknow",
        code: "UP_LKO",
        acs: [
          { name: "Lucknow Cantt", number: 175, code: "UP-AC-175", landmark: "Dilkusha & Sadar", pincode: "226002" },
          { name: "Lucknow Central", number: 174, code: "UP-AC-174", landmark: "Hazratganj & Aminabad", pincode: "226001" }
        ]
      },
      {
        name: "Varanasi",
        code: "UP_VNS",
        acs: [
          { name: "Varanasi Cantt", number: 390, code: "UP-AC-390", landmark: "Nadesar & Orderly Bazar", pincode: "221002" },
          { name: "Varanasi South", number: 389, code: "UP-AC-389", landmark: "Dashashwamedh & Godowlia", pincode: "221001" }
        ]
      },
      {
        name: "Kanpur Nagar",
        code: "UP_KNP",
        acs: [
          { name: "Govind Nagar", number: 212, code: "UP-AC-212", landmark: "Dada Nagar & Ratan Lal Nagar", pincode: "208006" },
          { name: "Arya Nagar", number: 214, code: "UP-AC-214", landmark: "Swaroop Nagar & Civil Lines", pincode: "208002" }
        ]
      },
      {
        name: "Gautam Buddha Nagar",
        code: "UP_GBN",
        acs: [
          { name: "Noida", number: 61, code: "UP-AC-061", landmark: "Sector 18 & Atta Market", pincode: "201301" },
          { name: "Dadri", number: 62, code: "UP-AC-062", landmark: "Greater Noida Alpha 1", pincode: "201310" }
        ]
      }
    ]
  },
  {
    code: "AP",
    name: "Andhra Pradesh",
    type: "STATE",
    pcs: [
      { name: "Visakhapatnam", number: 4, code: "AP-PC-04" },
      { name: "Vijayawada", number: 12, code: "AP-PC-12" }
    ],
    districts: [
      {
        name: "Visakhapatnam",
        code: "AP_VIS",
        acs: [
          { name: "Visakhapatnam East", number: 20, code: "AP-AC-020", landmark: "MVP Colony & Beach Road", pincode: "530017" },
          { name: "Visakhapatnam South", number: 21, code: "AP-AC-021", landmark: "Old Post Office Road", pincode: "530001" }
        ]
      },
      {
        name: "NTR District (Vijayawada)",
        code: "AP_NTR",
        acs: [
          { name: "Vijayawada Central", number: 80, code: "AP-AC-080", landmark: "Besant Road & Governorpet", pincode: "520002" }
        ]
      }
    ]
  },
  {
    code: "AR",
    name: "Arunachal Pradesh",
    type: "STATE",
    pcs: [
      { name: "Arunachal West", number: 1, code: "AR-PC-01" },
      { name: "Arunachal East", number: 2, code: "AR-PC-02" }
    ],
    districts: [
      {
        name: "Papum Pare",
        code: "AR_PAP",
        acs: [
          { name: "Itanagar AC", number: 13, code: "AR-AC-013", landmark: "Ganga Market & Secretariat", pincode: "791111" },
          { name: "Doimukh", number: 14, code: "AR-AC-014", landmark: "RGU Campus Corridor", pincode: "791112" }
        ]
      }
    ]
  },
  {
    code: "AS",
    name: "Assam",
    type: "STATE",
    pcs: [
      { name: "Guwahati", number: 7, code: "AS-PC-07" },
      { name: "Dibrugarh", number: 13, code: "AS-PC-13" }
    ],
    districts: [
      {
        name: "Kamrup Metropolitan",
        code: "AS_KAM",
        acs: [
          { name: "Guwahati East", number: 53, code: "AS-AC-053", landmark: "Zoo Road & Chandmari", pincode: "781003" },
          { name: "Dispur", number: 52, code: "AS-AC-052", landmark: "Capital Complex & Ganeshguri", pincode: "781006" }
        ]
      },
      {
        name: "Dibrugarh",
        code: "AS_DIB",
        acs: [
          { name: "Dibrugarh AC", number: 116, code: "AS-AC-116", landmark: "Thana Chariali", pincode: "786001" }
        ]
      }
    ]
  },
  {
    code: "BR",
    name: "Bihar",
    type: "STATE",
    pcs: [
      { name: "Patna Sahib", number: 30, code: "BR-PC-30" },
      { name: "Gaya", number: 38, code: "BR-PC-38" }
    ],
    districts: [
      {
        name: "Patna",
        code: "BR_PAT",
        acs: [
          { name: "Bankipur", number: 182, code: "BR-AC-182", landmark: "Gandhi Maidan & Ashok Rajpath", pincode: "800004" },
          { name: "Kumhrar", number: 183, code: "BR-AC-183", landmark: "Kankarbagh Colony", pincode: "800020" }
        ]
      },
      {
        name: "Gaya",
        code: "BR_GAY",
        acs: [
          { name: "Gaya Town", number: 230, code: "BR-AC-230", landmark: "Vishnupad Road & Civil Lines", pincode: "823001" }
        ]
      }
    ]
  },
  {
    code: "CG",
    name: "Chhattisgarh",
    type: "STATE",
    pcs: [
      { name: "Raipur", number: 8, code: "CG-PC-08" },
      { name: "Bilaspur", number: 5, code: "CG-PC-05" }
    ],
    districts: [
      {
        name: "Raipur",
        code: "CG_RAI",
        acs: [
          { name: "Raipur City North", number: 49, code: "CG-AC-049", landmark: "Devendra Nagar & Pandri", pincode: "492004" },
          { name: "Raipur City South", number: 51, code: "CG-AC-051", landmark: "Civil Lines & Byron Bazar", pincode: "492001" }
        ]
      },
      {
        name: "Bilaspur",
        code: "CG_BIL",
        acs: [
          { name: "Bilaspur AC", number: 30, code: "CG-AC-030", landmark: "Vyapar Vihar & Gol Bazar", pincode: "495001" }
        ]
      }
    ]
  },
  {
    code: "GA",
    name: "Goa",
    type: "STATE",
    pcs: [
      { name: "North Goa", number: 1, code: "GA-PC-01" },
      { name: "South Goa", number: 2, code: "GA-PC-02" }
    ],
    districts: [
      {
        name: "North Goa",
        code: "GA_NOR",
        acs: [
          { name: "Panaji", number: 11, code: "GA-AC-011", landmark: "Fontainhas & Miramar Beach", pincode: "403001" },
          { name: "Calangute", number: 8, code: "GA-AC-008", landmark: "Candolim Main Road", pincode: "403516" }
        ]
      },
      {
        name: "South Goa",
        code: "GA_SOU",
        acs: [
          { name: "Margao", number: 31, code: "GA-AC-031", landmark: "Municipal Square & Pajifond", pincode: "403601" }
        ]
      }
    ]
  },
  {
    code: "GJ",
    name: "Gujarat",
    type: "STATE",
    pcs: [
      { name: "Gandhinagar", number: 6, code: "GJ-PC-06" },
      { name: "Ahmedabad East", number: 7, code: "GJ-PC-07" },
      { name: "Surat", number: 24, code: "GJ-PC-24" }
    ],
    districts: [
      {
        name: "Ahmedabad",
        code: "GJ_AHM",
        acs: [
          { name: "Ghatlodia", number: 44, code: "GJ-AC-044", landmark: "Sola Road & Science City", pincode: "380061" },
          { name: "Ellis Bridge", number: 45, code: "GJ-AC-045", landmark: "Paldi & Ashram Road", pincode: "380006" }
        ]
      },
      {
        name: "Surat",
        code: "GJ_SUR",
        acs: [
          { name: "Majura", number: 165, code: "GJ-AC-165", landmark: "Ghod Dod Road & Ring Road", pincode: "395007" }
        ]
      },
      {
        name: "Gandhinagar",
        code: "GJ_GAN",
        acs: [
          { name: "Gandhinagar North", number: 36, code: "GJ-AC-036", landmark: "Sector 21 & Infocity", pincode: "382021" }
        ]
      }
    ]
  },
  {
    code: "HR",
    name: "Haryana",
    type: "STATE",
    pcs: [
      { name: "Gurgaon", number: 9, code: "HR-PC-09" },
      { name: "Faridabad", number: 10, code: "HR-PC-10" }
    ],
    districts: [
      {
        name: "Gurugram",
        code: "HR_GUR",
        acs: [
          { name: "Badshahpur", number: 76, code: "HR-AC-076", landmark: "Sohna Road & Golf Course Extension", pincode: "122001" },
          { name: "Gurgaon AC", number: 77, code: "HR-AC-077", landmark: "Civil Lines & Sector 14", pincode: "122001" }
        ]
      },
      {
        name: "Faridabad",
        code: "HR_FAR",
        acs: [
          { name: "Faridabad AC", number: 89, code: "HR-AC-089", landmark: "Sector 15 & NIT", pincode: "121007" }
        ]
      }
    ]
  },
  {
    code: "HP",
    name: "Himachal Pradesh",
    type: "STATE",
    pcs: [
      { name: "Shimla", number: 4, code: "HP-PC-04" },
      { name: "Kangra", number: 1, code: "HP-PC-01" }
    ],
    districts: [
      {
        name: "Shimla",
        code: "HP_SHI",
        acs: [
          { name: "Shimla Urban", number: 63, code: "HP-AC-063", landmark: "The Mall & Chotta Shimla", pincode: "171001" },
          { name: "Shimla Rural", number: 64, code: "HP-AC-064", landmark: "Totu & Tara Devi", pincode: "171011" }
        ]
      },
      {
        name: "Kangra",
        code: "HP_KAN",
        acs: [
          { name: "Dharamshala", number: 18, code: "HP-AC-018", landmark: "Kotwali Bazar & McLeodGanj", pincode: "176215" }
        ]
      }
    ]
  },
  {
    code: "JH",
    name: "Jharkhand",
    type: "STATE",
    pcs: [
      { name: "Ranchi", number: 8, code: "JH-PC-08" },
      { name: "Jamshedpur", number: 9, code: "JH-PC-09" }
    ],
    districts: [
      {
        name: "Ranchi",
        code: "JH_RAN",
        acs: [
          { name: "Ranchi AC", number: 63, code: "JH-AC-063", landmark: "Main Road & Albert Ekka Chowk", pincode: "834001" },
          { name: "Hatia", number: 64, code: "JH-AC-064", landmark: "Doranda & HEC Colony", pincode: "834002" }
        ]
      },
      {
        name: "East Singhbhum",
        code: "JH_ESB",
        acs: [
          { name: "Jamshedpur East", number: 48, code: "JH-AC-048", landmark: "Bistupur & Sakchi", pincode: "831001" }
        ]
      }
    ]
  },
  {
    code: "KL",
    name: "Kerala",
    type: "STATE",
    pcs: [
      { name: "Thiruvananthapuram", number: 20, code: "KL-PC-20" },
      { name: "Ernakulam", number: 12, code: "KL-PC-12" }
    ],
    districts: [
      {
        name: "Thiruvananthapuram",
        code: "KL_TVM",
        acs: [
          { name: "Thiruvananthapuram Central", number: 134, code: "KL-AC-134", landmark: "Palayam & Statue Junction", pincode: "695001" },
          { name: "Nemom", number: 135, code: "KL-AC-135", landmark: "Karamana & Pravachambalam", pincode: "695020" }
        ]
      },
      {
        name: "Ernakulam",
        code: "KL_EKM",
        acs: [
          { name: "Ernakulam AC", number: 82, code: "KL-AC-082", landmark: "MG Road & Marine Drive", pincode: "682011" }
        ]
      }
    ]
  },
  {
    code: "MP",
    name: "Madhya Pradesh",
    type: "STATE",
    pcs: [
      { name: "Bhopal", number: 19, code: "MP-PC-19" },
      { name: "Indore", number: 26, code: "MP-PC-26" }
    ],
    districts: [
      {
        name: "Bhopal",
        code: "MP_BHO",
        acs: [
          { name: "Bhopal Madhya", number: 153, code: "MP-AC-153", landmark: "MP Nagar & New Market", pincode: "462011" },
          { name: "Govindpura", number: 154, code: "MP-AC-154", landmark: "BHEL Township & Habibganj", pincode: "462023" }
        ]
      },
      {
        name: "Indore",
        code: "MP_IND",
        acs: [
          { name: "Indore-1", number: 204, code: "MP-AC-204", landmark: "Rajwada & Sarafa Bazar", pincode: "452002" },
          { name: "Indore-2", number: 205, code: "MP-AC-205", landmark: "Vijay Nagar & Palasia", pincode: "452010" }
        ]
      }
    ]
  },
  {
    code: "MN",
    name: "Manipur",
    type: "STATE",
    pcs: [
      { name: "Inner Manipur", number: 1, code: "MN-PC-01" },
      { name: "Outer Manipur", number: 2, code: "MN-PC-02" }
    ],
    districts: [
      {
        name: "Imphal West",
        code: "MN_IMW",
        acs: [
          { name: "Uripok", number: 10, code: "MN-AC-010", landmark: "Kangla Fort Outer & Market", pincode: "795001" },
          { name: "Sagolband", number: 11, code: "MN-AC-011", landmark: "Airport Road Junction", pincode: "795001" }
        ]
      }
    ]
  },
  {
    code: "ML",
    name: "Meghalaya",
    type: "STATE",
    pcs: [
      { name: "Shillong", number: 1, code: "ML-PC-01" },
      { name: "Tura", number: 2, code: "ML-PC-02" }
    ],
    districts: [
      {
        name: "East Khasi Hills",
        code: "ML_EKH",
        acs: [
          { name: "North Shillong", number: 17, code: "ML-AC-017", landmark: "Police Bazar & Jail Road", pincode: "793001" },
          { name: "East Shillong", number: 19, code: "ML-AC-019", landmark: "Laitumkhrah & Don Bosco", pincode: "793003" }
        ]
      }
    ]
  },
  {
    code: "MZ",
    name: "Mizoram",
    type: "STATE",
    pcs: [
      { name: "Mizoram", number: 1, code: "MZ-PC-01" }
    ],
    districts: [
      {
        name: "Aizawl",
        code: "MZ_AIZ",
        acs: [
          { name: "Aizawl North I", number: 10, code: "MZ-AC-010", landmark: "Bara Bazar & Chanmari", pincode: "796001" },
          { name: "Aizawl South I", number: 18, code: "MZ-AC-018", landmark: "Kulikawn & Mission Veng", pincode: "796005" }
        ]
      }
    ]
  },
  {
    code: "NL",
    name: "Nagaland",
    type: "STATE",
    pcs: [
      { name: "Nagaland", number: 1, code: "NL-PC-01" }
    ],
    districts: [
      {
        name: "Kohima",
        code: "NL_KOH",
        acs: [
          { name: "Northern Angami I", number: 9, code: "NL-AC-009", landmark: "High School Junction & Secretariat", pincode: "797001" }
        ]
      },
      {
        name: "Dimapur",
        code: "NL_DIM",
        acs: [
          { name: "Dimapur I", number: 1, code: "NL-AC-001", landmark: "City Tower & Circular Road", pincode: "797112" }
        ]
      }
    ]
  },
  {
    code: "OD",
    name: "Odisha",
    type: "STATE",
    pcs: [
      { name: "Bhubaneswar", number: 18, code: "OD-PC-18" },
      { name: "Cuttack", number: 14, code: "OD-PC-14" }
    ],
    districts: [
      {
        name: "Khordha",
        code: "OD_KHO",
        acs: [
          { name: "Bhubaneswar Central", number: 112, code: "OD-AC-112", landmark: "Saheed Nagar & Master Canteen", pincode: "751007" },
          { name: "Bhubaneswar North", number: 113, code: "OD-AC-113", landmark: "Patia & Chandrasekharpur", pincode: "751024" }
        ]
      },
      {
        name: "Cuttack",
        code: "OD_CUT",
        acs: [
          { name: "Cuttack Barabati", number: 90, code: "OD-AC-090", landmark: "Badambadi & Buxi Bazar", pincode: "753001" }
        ]
      }
    ]
  },
  {
    code: "PB",
    name: "Punjab",
    type: "STATE",
    pcs: [
      { name: "Amritsar", number: 2, code: "PB-PC-02" },
      { name: "Ludhiana", number: 7, code: "PB-PC-07" }
    ],
    districts: [
      {
        name: "Amritsar",
        code: "PB_ASR",
        acs: [
          { name: "Amritsar Central", number: 17, code: "PB-AC-017", landmark: "Hall Gate & Lawrence Road", pincode: "143001" }
        ]
      },
      {
        name: "Ludhiana",
        code: "PB_LDH",
        acs: [
          { name: "Ludhiana West", number: 64, code: "PB-AC-064", landmark: "Sarabha Nagar & Mall Road", pincode: "141001" }
        ]
      }
    ]
  },
  {
    code: "RJ",
    name: "Rajasthan",
    type: "STATE",
    pcs: [
      { name: "Jaipur", number: 7, code: "RJ-PC-07" },
      { name: "Jodhpur", number: 13, code: "RJ-PC-13" }
    ],
    districts: [
      {
        name: "Jaipur",
        code: "RJ_JAI",
        acs: [
          { name: "Civil Lines Jaipur", number: 51, code: "RJ-AC-051", landmark: "Ajmer Road & Jacob Road", pincode: "302006" },
          { name: "Hawa Mahal", number: 49, code: "RJ-AC-049", landmark: "Badi Chaupar & Johari Bazar", pincode: "302002" }
        ]
      },
      {
        name: "Jodhpur",
        code: "RJ_JOD",
        acs: [
          { name: "Sardarpura", number: 127, code: "RJ-AC-127", landmark: "C Road Sardarpura", pincode: "342003" }
        ]
      }
    ]
  },
  {
    code: "SK",
    name: "Sikkim",
    type: "STATE",
    pcs: [
      { name: "Sikkim", number: 1, code: "SK-PC-01" }
    ],
    districts: [
      {
        name: "Gangtok",
        code: "SK_GAN",
        acs: [
          { name: "Gangtok AC", number: 26, code: "SK-AC-026", landmark: "MG Marg & Deorali", pincode: "737101" },
          { name: "Upper Tadong", number: 25, code: "SK-AC-025", landmark: "Tadong Bazar & Manipal Campus", pincode: "737102" }
        ]
      }
    ]
  },
  {
    code: "TN",
    name: "Tamil Nadu",
    type: "STATE",
    pcs: [
      { name: "Chennai Central", number: 4, code: "TN-PC-04" },
      { name: "Chennai South", number: 3, code: "TN-PC-03" },
      { name: "Coimbatore", number: 20, code: "TN-PC-20" }
    ],
    districts: [
      {
        name: "Chennai",
        code: "TN_CHE",
        acs: [
          { name: "Mylapore", number: 25, code: "TN-AC-025", landmark: "Luz Church Road & San Thome", pincode: "600004" },
          { name: "T. Nagar", number: 23, code: "TN-AC-023", landmark: "Pondy Bazaar & Panagal Park", pincode: "600017" },
          { name: "Anna Nagar", number: 21, code: "TN-AC-021", landmark: "Roundtana & Shanthi Colony", pincode: "600040" }
        ]
      },
      {
        name: "Coimbatore",
        code: "TN_CBE",
        acs: [
          { name: "Coimbatore South", number: 120, code: "TN-AC-120", landmark: "RS Puram & Town Hall", pincode: "641002" }
        ]
      }
    ]
  },
  {
    code: "TS",
    name: "Telangana",
    type: "STATE",
    pcs: [
      { name: "Hyderabad", number: 9, code: "TS-PC-09" },
      { name: "Secunderabad", number: 8, code: "TS-PC-08" }
    ],
    districts: [
      {
        name: "Hyderabad",
        code: "TS_HYD",
        acs: [
          { name: "Jubilee Hills", number: 61, code: "TS-AC-061", landmark: "Road No 36 & Film Nagar", pincode: "500033" },
          { name: "Khairatabad", number: 60, code: "TS-AC-060", landmark: "Somajiguda & Raj Bhavan Road", pincode: "500004" }
        ]
      },
      {
        name: "Rangareddy",
        code: "TS_RAN",
        acs: [
          { name: "Serilingampally", number: 52, code: "TS-AC-052", landmark: "Gachibowli & Hitec City", pincode: "500032" }
        ]
      }
    ]
  },
  {
    code: "TR",
    name: "Tripura",
    type: "STATE",
    pcs: [
      { name: "Tripura West", number: 1, code: "TR-PC-01" },
      { name: "Tripura East", number: 2, code: "TR-PC-02" }
    ],
    districts: [
      {
        name: "West Tripura",
        code: "TR_WTR",
        acs: [
          { name: "Agartala AC", number: 6, code: "TR-AC-006", landmark: "City Centre & Banamalipur", pincode: "799001" },
          { name: "Town Bordowali", number: 8, code: "TR-AC-008", landmark: "Battala & Bordowali Junction", pincode: "799003" }
        ]
      }
    ]
  },
  {
    code: "UK",
    name: "Uttarakhand",
    type: "STATE",
    pcs: [
      { name: "Tehri Garhwal", number: 1, code: "UK-PC-01" },
      { name: "Haridwar", number: 5, code: "UK-PC-05" }
    ],
    districts: [
      {
        name: "Dehradun",
        code: "UK_DDN",
        acs: [
          { name: "Dehradun Cantt", number: 21, code: "UK-AC-021", landmark: "Chakrata Road & Bindal", pincode: "248001" },
          { name: "Mussoorie AC", number: 22, code: "UK-AC-022", landmark: "Rajpur Road & Jakhan", pincode: "248009" }
        ]
      },
      {
        name: "Haridwar",
        code: "UK_HAR",
        acs: [
          { name: "Haridwar City", number: 25, code: "UK-AC-025", landmark: "Har Ki Pauri & Ranipur", pincode: "249401" }
        ]
      }
    ]
  },
  {
    code: "WB",
    name: "West Bengal",
    type: "STATE",
    pcs: [
      { name: "Kolkata South", number: 23, code: "WB-PC-23" },
      { name: "Kolkata North", number: 24, code: "WB-PC-24" }
    ],
    districts: [
      {
        name: "Kolkata",
        code: "WB_KOL",
        acs: [
          { name: "Bhabanipur", number: 159, code: "WB-AC-159", landmark: "Ashutosh Mukherjee Road & Hazra", pincode: "700025" },
          { name: "Ballygunge", number: 161, code: "WB-AC-161", landmark: "Gariahat & Park Circus", pincode: "700019" },
          { name: "Jorasanko", number: 165, code: "WB-AC-165", landmark: "Girish Park & Central Avenue", pincode: "700007" }
        ]
      },
      {
        name: "North 24 Parganas",
        code: "WB_N24",
        acs: [
          { name: "Bidhannagar", number: 116, code: "WB-AC-116", landmark: "Salt Lake Sector 1 & Karunamoyee", pincode: "700091" }
        ]
      }
    ]
  },
  {
    code: "AN",
    name: "Andaman and Nicobar Islands",
    type: "UT",
    pcs: [
      { name: "Andaman and Nicobar Islands", number: 1, code: "AN-PC-01" }
    ],
    districts: [
      {
        name: "South Andaman",
        code: "AN_SAN",
        acs: [
          { name: "Port Blair Urban", number: 1, code: "AN-AC-001", landmark: "Aberdeen Bazaar & Marina Park", pincode: "744101" },
          { name: "Ferrargunj Rural", number: 2, code: "AN-AC-002", landmark: "Bamboo Flat & Stewartgunj", pincode: "744107" }
        ]
      }
    ]
  },
  {
    code: "CH",
    name: "Chandigarh",
    type: "UT",
    pcs: [
      { name: "Chandigarh", number: 1, code: "CH-PC-01" }
    ],
    districts: [
      {
        name: "Chandigarh",
        code: "CH_CHD",
        acs: [
          { name: "Chandigarh Central", number: 1, code: "CH-AC-001", landmark: "Sector 17 Plaza & Sector 22", pincode: "160017" },
          { name: "Chandigarh South", number: 2, code: "CH-AC-002", landmark: "Sector 34 & Sector 35", pincode: "160022" }
        ]
      }
    ]
  },
  {
    code: "DN",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "UT",
    pcs: [
      { name: "Daman and Diu", number: 1, code: "DN-PC-01" },
      { name: "Dadra and Nagar Haveli", number: 2, code: "DN-PC-02" }
    ],
    districts: [
      {
        name: "Daman",
        code: "DN_DAM",
        acs: [
          { name: "Daman Municipal", number: 1, code: "DN-AC-001", landmark: "Nani Daman Fort Area", pincode: "396210" }
        ]
      },
      {
        name: "Dadra and Nagar Haveli",
        code: "DN_DNH",
        acs: [
          { name: "Silvassa Central", number: 2, code: "DN-AC-002", landmark: "Naroli Road & Kilvani Naka", pincode: "396230" }
        ]
      }
    ]
  },
  {
    code: "JK",
    name: "Jammu and Kashmir",
    type: "UT",
    pcs: [
      { name: "Srinagar", number: 2, code: "JK-PC-02" },
      { name: "Jammu", number: 5, code: "JK-PC-05" }
    ],
    districts: [
      {
        name: "Srinagar",
        code: "JK_SRI",
        acs: [
          { name: "Lal Chowk", number: 22, code: "JK-AC-022", landmark: "Ghanta Ghar & Residency Road", pincode: "190001" },
          { name: "Hazratbal", number: 20, code: "JK-AC-020", landmark: "Dargah Outer Corridor", pincode: "190006" }
        ]
      },
      {
        name: "Jammu",
        code: "JK_JAM",
        acs: [
          { name: "Jammu East", number: 76, code: "JK-AC-076", landmark: "Raghunath Bazar & City Chowk", pincode: "180001" },
          { name: "Jammu West", number: 77, code: "JK-AC-077", landmark: "Gandhi Nagar & Bakshi Nagar", pincode: "180004" }
        ]
      }
    ]
  },
  {
    code: "LA",
    name: "Ladakh",
    type: "UT",
    pcs: [
      { name: "Ladakh", number: 1, code: "LA-PC-01" }
    ],
    districts: [
      {
        name: "Leh",
        code: "LA_LEH",
        acs: [
          { name: "Leh Urban", number: 1, code: "LA-AC-001", landmark: "Main Bazaar & Fort Road", pincode: "194101" }
        ]
      },
      {
        name: "Kargil",
        code: "LA_KAR",
        acs: [
          { name: "Kargil Central", number: 2, code: "LA-AC-002", landmark: "Baroo & Main Market", pincode: "194103" }
        ]
      }
    ]
  },
  {
    code: "LD",
    name: "Lakshadweep",
    type: "UT",
    pcs: [
      { name: "Lakshadweep", number: 1, code: "LD-PC-01" }
    ],
    districts: [
      {
        name: "Lakshadweep",
        code: "LD_LAK",
        acs: [
          { name: "Kavaratti Island", number: 1, code: "LD-AC-001", landmark: "Secretariat Complex", pincode: "682555" },
          { name: "Agatti Island", number: 2, code: "LD-AC-002", landmark: "Airport Road Terminal", pincode: "682553" }
        ]
      }
    ]
  },
  {
    code: "PY",
    name: "Puducherry",
    type: "UT",
    pcs: [
      { name: "Puducherry", number: 1, code: "PY-PC-01" }
    ],
    districts: [
      {
        name: "Puducherry",
        code: "PY_PUD",
        acs: [
          { name: "Raj Bhavan", number: 8, code: "PY-AC-008", landmark: "White Town Promenade & Goubert Avenue", pincode: "605001" },
          { name: "Oupalam", number: 9, code: "PY-AC-009", landmark: "Colas Nagar & Port Road", pincode: "605001" }
        ]
      }
    ]
  }
];

async function runSeed() {
  console.log("[GeoSeeder] Beginning database synchronization for all 36 States/UTs...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Column additions
    console.log("[GeoSeeder] Adding reference columns if missing...");
    await client.query(`
      ALTER TABLE polling_stations 
      ADD COLUMN IF NOT EXISTS state_id BIGINT REFERENCES states(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS assembly_constituency_id BIGINT REFERENCES assembly_constituencies(id) ON DELETE SET NULL
    `);

    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
      ADD COLUMN IF NOT EXISTS relative_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS relative_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
      ADD COLUMN IF NOT EXISTS state_id BIGINT REFERENCES states(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS assembly_constituency_id BIGINT REFERENCES assembly_constituencies(id) ON DELETE SET NULL
    `);

    // 2. Iterate each State / UT
    let statesCount = 0;
    let distCount = 0;
    let acCount = 0;
    let pcCount = 0;
    let stationCount = 0;

    for (const stateItem of NATIONAL_GEOGRAPHY) {
      const stateRes = await client.query(`
        INSERT INTO states (name, code, type, status, data_source, source_url, source_date, data_status)
        VALUES ($1, $2, $3, 'ACTIVE', 'Election Commission of India', 'https://eci.gov.in', CURRENT_DATE, 'OFFICIAL_REFERENCE')
        ON CONFLICT (code) DO UPDATE SET 
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          status = 'ACTIVE'
        RETURNING id, code, name
      `, [stateItem.name, stateItem.code, stateItem.type]);

      const stateId = stateRes.rows[0].id;
      statesCount++;

      // Parliamentary Constituencies
      for (const pc of (stateItem.pcs || [])) {
        await client.query(`
          INSERT INTO parliamentary_constituencies (state_id, name, constituency_number, code, status, data_source, data_status)
          VALUES ($1, $2, $3, $4, 'ACTIVE', 'Election Commission of India', 'OFFICIAL_REFERENCE')
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            constituency_number = EXCLUDED.constituency_number,
            state_id = EXCLUDED.state_id
        `, [stateId, pc.name, pc.number, pc.code]);
        pcCount++;
      }

      // Districts, ACs, Polling Stations
      for (const dist of stateItem.districts) {
        const distRes = await client.query(`
          INSERT INTO districts (state_id, name, code, status, data_source, data_status)
          VALUES ($1, $2, $3, 'ACTIVE', 'Election Commission of India', 'OFFICIAL_REFERENCE')
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            state_id = EXCLUDED.state_id
          RETURNING id, code, name
        `, [stateId, dist.name, dist.code]);

        const districtId = distRes.rows[0].id;
        distCount++;

        for (const ac of dist.acs) {
          const acRes = await client.query(`
            INSERT INTO assembly_constituencies (state_id, district_id, name, constituency_number, code, status, data_source, data_status)
            VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'Election Commission of India', 'OFFICIAL_REFERENCE')
            ON CONFLICT (code) DO UPDATE SET
              name = EXCLUDED.name,
              constituency_number = EXCLUDED.constituency_number,
              district_id = EXCLUDED.district_id,
              state_id = EXCLUDED.state_id
            RETURNING id, code, name
          `, [stateId, districtId, ac.name, ac.number, ac.code]);

          const acId = acRes.rows[0].id;
          acCount++;

          const stations = [
            {
              name: `Booth 01 - Govt Sr. Secondary School, Main Hall, ${ac.name}`,
              code: `PS-${ac.code}-01`,
              address: `Building A, Ground Floor, Near ${ac.landmark}, ${dist.name}, ${stateItem.name} - ${ac.pincode}`,
              capacity: 1200
            },
            {
              name: `Booth 02 - Municipal Community Center, ${ac.name}`,
              code: `PS-${ac.code}-02`,
              address: `Ward Office Hall, North Wing, Near ${ac.landmark}, ${dist.name}, ${stateItem.name} - ${ac.pincode}`,
              capacity: 1000
            }
          ];

          for (const st of stations) {
            await client.query(`
              INSERT INTO polling_stations (name, code, address, capacity, status, state_id, district_id, assembly_constituency_id, created_at)
              VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, CURRENT_TIMESTAMP)
              ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                address = EXCLUDED.address,
                capacity = EXCLUDED.capacity,
                state_id = EXCLUDED.state_id,
                district_id = EXCLUDED.district_id,
                assembly_constituency_id = EXCLUDED.assembly_constituency_id
            `, [st.name, st.code, st.address, st.capacity, stateId, districtId, acId]);
            stationCount++;
          }
        }
      }
    }

    await client.query("COMMIT");
    console.log(`[GeoSeeder] Success! Synchronized:`);
    console.log(`  - States/UTs: ${statesCount}`);
    console.log(`  - Districts: ${distCount}`);
    console.log(`  - Parliamentary Constituencies: ${pcCount}`);
    console.log(`  - Assembly Constituencies: ${acCount}`);
    console.log(`  - Polling Stations: ${stationCount}`);
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[GeoSeeder] Failed:", err);
    throw err;
  } finally {
    client.release();
    if (require.main === module) {
      pool.end();
    }
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed, NATIONAL_GEOGRAPHY };
