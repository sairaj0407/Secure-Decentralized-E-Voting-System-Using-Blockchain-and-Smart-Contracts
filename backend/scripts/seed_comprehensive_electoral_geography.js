const pool = require("../config/database");

const COMPREHENSIVE_ELECTORAL_GEOGRAPHY = [
  // 1. ANDHRA PRADESH
  {
    code: "AP",
    name: "Andhra Pradesh",
    type: "STATE",
    districts: [
      {
        name: "Visakhapatnam",
        code: "AP_VIS",
        acs: [
          { name: "Visakhapatnam East", number: 20, code: "AP-AC-020", landmark: "MVP Colony & Beach Road", pincode: "530017" },
          { name: "Visakhapatnam West", number: 22, code: "AP-AC-022", landmark: "Gajuwaka Industrial Zone", pincode: "530026" },
          { name: "Visakhapatnam South", number: 21, code: "AP-AC-021", landmark: "Jagadamba Junction & Port Area", pincode: "530002" }
        ]
      },
      {
        name: "Krishna",
        code: "AP_KRI",
        acs: [
          { name: "Vijayawada Central", number: 80, code: "AP-AC-080", landmark: "Governorpet & Benz Circle", pincode: "520002" },
          { name: "Vijayawada West", number: 79, code: "AP-AC-079", landmark: "One Town & Prakasam Barrage", pincode: "520001" },
          { name: "Machilipatnam", number: 76, code: "AP-AC-076", landmark: "Collectorate & Bandar Port", pincode: "521001" }
        ]
      },
      {
        name: "Guntur",
        code: "AP_GUN",
        acs: [
          { name: "Guntur West", number: 86, code: "AP-AC-086", landmark: "Lodge Center & Gujjanagundla", pincode: "522006" },
          { name: "Guntur East", number: 87, code: "AP-AC-087", landmark: "Old Guntur & Market Road", pincode: "522001" },
          { name: "Mangalagiri", number: 85, code: "AP-AC-085", landmark: "AIIMS Campus Corridor", pincode: "522503" }
        ]
      },
      {
        name: "Tirupati",
        code: "AP_TRP",
        acs: [
          { name: "Tirupati", number: 168, code: "AP-AC-168", landmark: "Alipiri Road & SV University", pincode: "517502" },
          { name: "Chandragiri", number: 166, code: "AP-AC-166", landmark: "Chandragiri Fort Road", pincode: "517101" }
        ]
      },
      {
        name: "Kurnool",
        code: "AP_KUR",
        acs: [
          { name: "Kurnool", number: 137, code: "AP-AC-137", landmark: "Konda Reddy Buruju & Raj Vihar", pincode: "518001" },
          { name: "Nandyal", number: 139, code: "AP-AC-139", landmark: "Srinivasa Center", pincode: "518501" }
        ]
      },
      {
        name: "East Godavari",
        code: "AP_EGD",
        acs: [
          { name: "Rajahmundry City", number: 50, code: "AP-AC-050", landmark: "Godavari River Road & Kotipalli", pincode: "533101" },
          { name: "Rajahmundry Rural", number: 51, code: "AP-AC-051", landmark: "Morampudi Junction", pincode: "533107" }
        ]
      },
      {
        name: "West Godavari",
        code: "AP_WGD",
        acs: [
          { name: "Bhimavaram", number: 58, code: "AP-AC-058", landmark: "Mavullamma Temple Area", pincode: "534201" },
          { name: "Palakollu", number: 60, code: "AP-AC-060", landmark: "Ksheera Ramalingeswara Temple", pincode: "534260" }
        ]
      },
      {
        name: "Nellore",
        code: "AP_NEL",
        acs: [
          { name: "Nellore City", number: 118, code: "AP-AC-118", landmark: "VRC Centre & Trunk Road", pincode: "524001" },
          { name: "Nellore Rural", number: 119, code: "AP-AC-119", landmark: "Podalakur Road Corridor", pincode: "524004" }
        ]
      }
    ]
  },

  // 2. ARUNACHAL PRADESH
  {
    code: "AR",
    name: "Arunachal Pradesh",
    type: "STATE",
    districts: [
      {
        name: "Papum Pare",
        code: "AR_PAP",
        acs: [
          { name: "Itanagar", number: 13, code: "AR-AC-013", landmark: "Civil Secretariat & Ganga Market", pincode: "791111" },
          { name: "Doimukh", number: 14, code: "AR-AC-014", landmark: "Rajiv Gandhi University Campus", pincode: "791112" }
        ]
      },
      {
        name: "East Siang",
        code: "AR_ESI",
        acs: [
          { name: "Pasighat East", number: 38, code: "AR-AC-038", landmark: "Main Bazaar & Siang River Bank", pincode: "791102" },
          { name: "Pasighat West", number: 39, code: "AR-AC-039", landmark: "Ruksin Checkpost", pincode: "791103" }
        ]
      },
      {
        name: "West Kameng",
        code: "AR_WKA",
        acs: [
          { name: "Bomdila", number: 5, code: "AR-AC-005", landmark: "Bomdila Monastery Road", pincode: "790001" },
          { name: "Dirang", number: 4, code: "AR-AC-004", landmark: "National Highway 13 Corridor", pincode: "790101" }
        ]
      },
      {
        name: "Tawang",
        code: "AR_TAW",
        acs: [
          { name: "Tawang AC", number: 2, code: "AR-AC-002", landmark: "Tawang Monastery Ridge", pincode: "790104" },
          { name: "Mukto", number: 3, code: "AR-AC-003", landmark: "Mukto Valley Center", pincode: "790105" }
        ]
      },
      {
        name: "Changlang",
        code: "AR_CHA",
        acs: [
          { name: "Changlang North", number: 52, code: "AR-AC-052", landmark: "District Commissionerate Road", pincode: "792120" },
          { name: "Miao", number: 50, code: "AR-AC-050", landmark: "Namdapha National Park Road", pincode: "792122" }
        ]
      }
    ]
  },

  // 3. ASSAM
  {
    code: "AS",
    name: "Assam",
    type: "STATE",
    districts: [
      {
        name: "Kamrup Metropolitan",
        code: "AS_KMM",
        acs: [
          { name: "Gauhati East", number: 53, code: "AS-AC-053", landmark: "Uzanbazar & Panbazar", pincode: "781001" },
          { name: "Gauhati West", number: 54, code: "AS-AC-054", landmark: "Bharalumukh & Maligaon", pincode: "781009" },
          { name: "Dispur", number: 52, code: "AS-AC-052", landmark: "Assam Secretariat Complex", pincode: "781006" },
          { name: "Jalukbari", number: 51, code: "AS-AC-051", landmark: "Gauhati University Gate", pincode: "781014" }
        ]
      },
      {
        name: "Dibrugarh",
        code: "AS_DIB",
        acs: [
          { name: "Dibrugarh", number: 115, code: "AS-AC-115", landmark: "Graham Bazar & Chowkidinghee", pincode: "786001" },
          { name: "Lahowal", number: 117, code: "AS-AC-117", landmark: "Dibrugarh Airport Highway", pincode: "786010" }
        ]
      },
      {
        name: "Cachar",
        code: "AS_CAC",
        acs: [
          { name: "Silchar", number: 9, code: "AS-AC-009", landmark: "Fatok Bazar & Court Complex", pincode: "788001" },
          { name: "Sonai", number: 10, code: "AS-AC-010", landmark: "Sonai Road Market", pincode: "788119" }
        ]
      },
      {
        name: "Jorhat",
        code: "AS_JOR",
        acs: [
          { name: "Jorhat", number: 98, code: "AS-AC-098", landmark: "Gar-Ali Commercial Square", pincode: "785001" },
          { name: "Titabar", number: 100, code: "AS-AC-100", landmark: "Titabar Chariali", pincode: "785630" }
        ]
      },
      {
        name: "Sonitpur",
        code: "AS_SON",
        acs: [
          { name: "Tezpur", number: 73, code: "AS-AC-073", landmark: "Chitralekha Udyan Road", pincode: "784001" },
          { name: "Dhekiajuli", number: 71, code: "AS-AC-071", landmark: "Dhekiajuli Town Hall", pincode: "784110" }
        ]
      }
    ]
  },

  // 4. BIHAR
  {
    code: "BR",
    name: "Bihar",
    type: "STATE",
    districts: [
      {
        name: "Patna",
        code: "BR_PAT",
        acs: [
          { name: "Bankipur", number: 182, code: "BR-AC-182", landmark: "Gandhi Maidan & Ashok Rajpath", pincode: "800001" },
          { name: "Digha", number: 181, code: "BR-AC-181", landmark: "Patliputra Industrial Colony", pincode: "800013" },
          { name: "Kumhrar", number: 183, code: "BR-AC-183", landmark: "Kankarbagh Main Road", pincode: "800020" },
          { name: "Patna Sahib", number: 184, code: "BR-AC-184", landmark: "Takht Sri Patna Sahib Gate", pincode: "800008" }
        ]
      },
      {
        name: "Gaya",
        code: "BR_GAY",
        acs: [
          { name: "Gaya Town", number: 230, code: "BR-AC-230", landmark: "Vishnupad Temple Corridor", pincode: "823001" },
          { name: "Bodh Gaya", number: 229, code: "BR-AC-229", landmark: "Mahabodhi Temple Complex", pincode: "824231" }
        ]
      },
      {
        name: "Muzaffarpur",
        code: "BR_MUZ",
        acs: [
          { name: "Muzaffarpur Urban", number: 94, code: "BR-AC-094", landmark: "Motijheel Market", pincode: "842001" },
          { name: "Kanti", number: 95, code: "BR-AC-095", landmark: "Thermal Power Station Gate", pincode: "843109" }
        ]
      },
      {
        name: "Bhagalpur",
        code: "BR_BHA",
        acs: [
          { name: "Bhagalpur City", number: 157, code: "BR-AC-157", landmark: "Tilka Manjhi Chowk", pincode: "812001" },
          { name: "Nathnagar", number: 158, code: "BR-AC-158", landmark: "Silk Weavers Colony", pincode: "812006" }
        ]
      },
      {
        name: "Darbhanga",
        code: "BR_DAR",
        acs: [
          { name: "Darbhanga Town", number: 83, code: "BR-AC-083", landmark: "Raj Darbhanga Fort Gate", pincode: "846004" },
          { name: "Darbhanga Rural", number: 82, code: "BR-AC-082", landmark: "Benta Chowk", pincode: "846003" }
        ]
      },
      {
        name: "Nalanda",
        code: "BR_NAL",
        acs: [
          { name: "Biharsharif", number: 172, code: "BR-AC-172", landmark: "Ranchi Road & Hospital More", pincode: "803101" },
          { name: "Rajgir", number: 174, code: "BR-AC-174", landmark: "Vishwa Shanti Stupa Valley", pincode: "803116" }
        ]
      },
      {
        name: "Purnia",
        code: "BR_PUR",
        acs: [
          { name: "Purnia Town", number: 62, code: "BR-AC-062", landmark: "Bhattha Bazar", pincode: "854301" },
          { name: "Kasba", number: 61, code: "BR-AC-061", landmark: "Kasba Railway Station Road", pincode: "854330" }
        ]
      }
    ]
  },

  // 5. CHHATTISGARH
  {
    code: "CG",
    name: "Chhattisgarh",
    type: "STATE",
    districts: [
      {
        name: "Raipur",
        code: "CG_RAI",
        acs: [
          { name: "Raipur City North", number: 50, code: "CG-AC-050", landmark: "Pandri Textile Market", pincode: "492004" },
          { name: "Raipur City South", number: 51, code: "CG-AC-051", landmark: "Budha Talab & Kotwali", pincode: "492001" },
          { name: "Raipur City West", number: 49, code: "CG-AC-049", landmark: "Samta Colony & GE Road", pincode: "492010" }
        ]
      },
      {
        name: "Durg",
        code: "CG_DUR",
        acs: [
          { name: "Durg City", number: 64, code: "CG-AC-064", landmark: "Indira Market & Station Road", pincode: "491001" },
          { name: "Bhilai Nagar", number: 65, code: "CG-AC-065", landmark: "Civic Center & Sector 6", pincode: "490006" },
          { name: "Vaishali Nagar", number: 66, code: "CG-AC-066", landmark: "Kurud Industrial Area", pincode: "490023" }
        ]
      },
      {
        name: "Bilaspur",
        code: "CG_BIL",
        acs: [
          { name: "Bilaspur City", number: 30, code: "CG-AC-030", landmark: "Gol Bazar & High Court Road", pincode: "495001" },
          { name: "Bilha", number: 29, code: "CG-AC-029", landmark: "Bodri Industrial Complex", pincode: "495224" }
        ]
      },
      {
        name: "Bastar",
        code: "CG_BAS",
        acs: [
          { name: "Jagdalpur", number: 86, code: "CG-AC-086", landmark: "Bastar Palace & Danteshwari Road", pincode: "494001" },
          { name: "Bastar AC", number: 85, code: "CG-AC-085", landmark: "Tokapal Market", pincode: "494442" }
        ]
      },
      {
        name: "Korba",
        code: "CG_KOR",
        acs: [
          { name: "Korba AC", number: 21, code: "CG-AC-021", landmark: "NTPC Jamnipali Township", pincode: "495450" },
          { name: "Katghora", number: 22, code: "CG-AC-022", landmark: "Katghora Main Market", pincode: "495445" }
        ]
      }
    ]
  },

  // 6. GOA
  {
    code: "GA",
    name: "Goa",
    type: "STATE",
    districts: [
      {
        name: "North Goa",
        code: "GA_NGO",
        acs: [
          { name: "Panaji", number: 11, code: "GA-AC-011", landmark: "Mandovi Promenade & Secretariat", pincode: "403001" },
          { name: "Taleigao", number: 12, code: "GA-AC-012", landmark: "Dona Paula & Miramar Circle", pincode: "403002" },
          { name: "Mapusa", number: 5, code: "GA-AC-005", landmark: "Mapusa Municipal Market", pincode: "403507" },
          { name: "Calangute", number: 8, code: "GA-AC-008", landmark: "Calangute Beach Promenade", pincode: "403516" }
        ]
      },
      {
        name: "South Goa",
        code: "GA_SGO",
        acs: [
          { name: "Margao", number: 31, code: "GA-AC-031", landmark: "Grace Church & Municipal Garden", pincode: "403601" },
          { name: "Fatorda", number: 30, code: "GA-AC-030", landmark: "Jawaharlal Nehru Stadium Complex", pincode: "403602" },
          { name: "Vasco Da Gama", number: 25, code: "GA-AC-025", landmark: "Swatantra Path & Port Trust", pincode: "403802" },
          { name: "Ponda", number: 19, code: "GA-AC-019", landmark: "Shree Manguesh Temple Highway", pincode: "403401" }
        ]
      }
    ]
  },

  // 7. GUJARAT
  {
    code: "GJ",
    name: "Gujarat",
    type: "STATE",
    districts: [
      {
        name: "Ahmedabad",
        code: "GJ_AHM",
        acs: [
          { name: "Ghatlodia", number: 44, code: "GJ-AC-044", landmark: "SG Highway Corridor", pincode: "380061" },
          { name: "Ellisbridge", number: 49, code: "GJ-AC-049", landmark: "Law Garden & VS Hospital", pincode: "380006" },
          { name: "Maninagar", number: 53, code: "GJ-AC-053", landmark: "Kankaria Lake Gate 1", pincode: "380008" },
          { name: "Vejalpur", number: 45, code: "GJ-AC-045", landmark: "Prahlad Nagar Garden Area", pincode: "380051" }
        ]
      },
      {
        name: "Surat",
        code: "GJ_SUR",
        acs: [
          { name: "Majura", number: 165, code: "GJ-AC-165", landmark: "Athwa Gate & VR Mall Road", pincode: "395007" },
          { name: "Surat City North", number: 160, code: "GJ-AC-160", landmark: "Katargam Diamond Hub", pincode: "395004" },
          { name: "Varachha Road", number: 161, code: "GJ-AC-161", landmark: "Mini Bazar & Poddar Arcade", pincode: "395006" },
          { name: "Choryasi", number: 168, code: "GJ-AC-168", landmark: "Adajan Ring Road", pincode: "395009" }
        ]
      },
      {
        name: "Vadodara",
        code: "GJ_VAD",
        acs: [
          { name: "Akota", number: 143, code: "GJ-AC-143", landmark: "Alkapuri & RC Dutt Road", pincode: "390007" },
          { name: "Sayajigunj", number: 144, code: "GJ-AC-144", landmark: "MS University Campus", pincode: "390002" },
          { name: "Manjalpur", number: 145, code: "GJ-AC-145", landmark: "Manjalpur Sports Complex", pincode: "390011" }
        ]
      },
      {
        name: "Rajkot",
        code: "GJ_RAJ",
        acs: [
          { name: "Rajkot West", number: 69, code: "GJ-AC-069", landmark: "Yagnik Road & Race Course", pincode: "360001" },
          { name: "Rajkot South", number: 70, code: "GJ-AC-070", landmark: "Bhaktinagar Station Road", pincode: "360002" }
        ]
      },
      {
        name: "Gandhinagar",
        code: "GJ_GAN",
        acs: [
          { name: "Gandhinagar North", number: 36, code: "GJ-AC-036", landmark: "Sector 11 Sachivalaya Complex", pincode: "382010" },
          { name: "Gandhinagar South", number: 35, code: "GJ-AC-035", landmark: "Infocity & GIFT City Road", pincode: "382007" }
        ]
      },
      {
        name: "Bhavnagar",
        code: "GJ_BHA",
        acs: [
          { name: "Bhavnagar East", number: 104, code: "GJ-AC-104", landmark: "Ghogha Circle", pincode: "364001" },
          { name: "Bhavnagar West", number: 105, code: "GJ-AC-105", landmark: "Takhteshwar Temple Area", pincode: "364002" }
        ]
      }
    ]
  },

  // 8. HARYANA
  {
    code: "HR",
    name: "Haryana",
    type: "STATE",
    districts: [
      {
        name: "Gurugram",
        code: "HR_GUR",
        acs: [
          { name: "Badshahpur", number: 76, code: "HR-AC-076", landmark: "Sohna Road & Golf Course Ext", pincode: "122018" },
          { name: "Gurgaon AC", number: 77, code: "HR-AC-077", landmark: "Cyber City & MG Road", pincode: "122002" },
          { name: "Pataudi", number: 75, code: "HR-AC-075", landmark: "Pataudi Palace Road", pincode: "122503" }
        ]
      },
      {
        name: "Faridabad",
        code: "HR_FAR",
        acs: [
          { name: "Faridabad NIT", number: 86, code: "HR-AC-086", landmark: "BK Hospital Chowk", pincode: "121001" },
          { name: "Badkhal", number: 87, code: "HR-AC-087", landmark: "Badkhal Lake Enclave", pincode: "121001" },
          { name: "Ballabgarh", number: 88, code: "HR-AC-088", landmark: "Main Mathura Road", pincode: "121004" }
        ]
      },
      {
        name: "Ambala",
        code: "HR_AMB",
        acs: [
          { name: "Ambala Cantt", number: 2, code: "HR-AC-002", landmark: "Railway Station Road", pincode: "133001" },
          { name: "Ambala City", number: 3, code: "HR-AC-003", landmark: "Cloth Market & Polytechnic", pincode: "134003" }
        ]
      },
      {
        name: "Panipat",
        code: "HR_PAN",
        acs: [
          { name: "Panipat City", number: 24, code: "HR-AC-024", landmark: "Insar Market & GT Road", pincode: "132103" },
          { name: "Panipat Rural", number: 25, code: "HR-AC-025", landmark: "Assandh Road Toll Plaza", pincode: "132140" }
        ]
      },
      {
        name: "Karnal",
        code: "HR_KAR",
        acs: [
          { name: "Karnal AC", number: 21, code: "HR-AC-021", landmark: "Karna Lake & Sector 14", pincode: "132001" },
          { name: "Gharaunda", number: 22, code: "HR-AC-022", landmark: "Railway Mandi", pincode: "132114" }
        ]
      },
      {
        name: "Rohtak",
        code: "HR_ROH",
        acs: [
          { name: "Rohtak AC", number: 62, code: "HR-AC-062", landmark: "MD University Campus Gate", pincode: "124001" },
          { name: "Kalanaur", number: 61, code: "HR-AC-061", landmark: "Bhiwani Road", pincode: "124113" }
        ]
      }
    ]
  },

  // 9. HIMACHAL PRADESH
  {
    code: "HP",
    name: "Himachal Pradesh",
    type: "STATE",
    districts: [
      {
        name: "Shimla",
        code: "HP_SHI",
        acs: [
          { name: "Shimla Urban", number: 63, code: "HP-AC-063", landmark: "The Mall & Ridge", pincode: "171001" },
          { name: "Shimla Rural", number: 64, code: "HP-AC-064", landmark: "Totu & Jutogh Corridor", pincode: "171011" },
          { name: "Kasumpti", number: 62, code: "HP-AC-062", landmark: "SDA Complex & Panthaghati", pincode: "171009" }
        ]
      },
      {
        name: "Kangra",
        code: "HP_KAN",
        acs: [
          { name: "Dharamshala", number: 18, code: "HP-AC-018", landmark: "HPCA Stadium & Kotwali Bazar", pincode: "176215" },
          { name: "Kangra AC", number: 17, code: "HP-AC-017", landmark: "Brajeshwari Devi Temple Road", pincode: "176001" },
          { name: "Palampur", number: 19, code: "HP-AC-019", landmark: "Tea Garden Estate & Cinema Road", pincode: "176061" }
        ]
      },
      {
        name: "Mandi",
        code: "HP_MAN",
        acs: [
          { name: "Mandi AC", number: 33, code: "HP-AC-033", landmark: "Seri Manch & Bhootnath Temple", pincode: "175001" },
          { name: "Sundernagar", number: 31, code: "HP-AC-031", landmark: "BBMB Colony", pincode: "175002" }
        ]
      },
      {
        name: "Kullu",
        code: "HP_KUL",
        acs: [
          { name: "Kullu AC", number: 23, code: "HP-AC-023", landmark: "Dhalpur Maidan", pincode: "175101" },
          { name: "Manali", number: 22, code: "HP-AC-022", landmark: "Mall Road & Circuit House", pincode: "175131" }
        ]
      },
      {
        name: "Solan",
        code: "HP_SOL",
        acs: [
          { name: "Solan AC", number: 53, code: "HP-AC-053", landmark: "Old DC Office Road", pincode: "173212" },
          { name: "Kasauli", number: 54, code: "HP-AC-054", landmark: "Heritage Market Kasauli", pincode: "173204" }
        ]
      }
    ]
  },

  // 10. JHARKHAND
  {
    code: "JH",
    name: "Jharkhand",
    type: "STATE",
    districts: [
      {
        name: "Ranchi",
        code: "JH_RAN",
        acs: [
          { name: "Ranchi AC", number: 63, code: "JH-AC-063", landmark: "Albert Ekka Chowk & Main Road", pincode: "834001" },
          { name: "Hatia", number: 64, code: "JH-AC-064", landmark: "HEC Colony & Birsa Chowk", pincode: "834003" },
          { name: "Kanke", number: 65, code: "JH-AC-065", landmark: "Birsa Agricultural University", pincode: "834006" }
        ]
      },
      {
        name: "East Singhbhum",
        code: "JH_ESI",
        acs: [
          { name: "Jamshedpur East", number: 48, code: "JH-AC-048", landmark: "Golmuri & Telco Colony", pincode: "831004" },
          { name: "Jamshedpur West", number: 49, code: "JH-AC-049", landmark: "Bistupur & Kadma", pincode: "831001" }
        ]
      },
      {
        name: "Dhanbad",
        code: "JH_DHA",
        acs: [
          { name: "Dhanbad AC", number: 40, code: "JH-AC-040", landmark: "Bank More & IIT ISM Gate", pincode: "826001" },
          { name: "Jharia", number: 41, code: "JH-AC-041", landmark: "Katras More Coalfield Area", pincode: "828111" }
        ]
      },
      {
        name: "Bokaro",
        code: "JH_BOK",
        acs: [
          { name: "Bokaro AC", number: 36, code: "JH-AC-036", landmark: "City Centre Sector 4", pincode: "827004" },
          { name: "Bermo", number: 35, code: "JH-AC-035", landmark: "Phusro Bazar", pincode: "829144" }
        ]
      },
      {
        name: "Hazaribagh",
        code: "JH_HAZ",
        acs: [
          { name: "Hazaribagh AC", number: 25, code: "JH-AC-025", landmark: "Jhanda Chowk & Lake Road", pincode: "825301" },
          { name: "Barhi", number: 21, code: "JH-AC-021", landmark: "Barhi Chowk GT Road", pincode: "825405" }
        ]
      }
    ]
  },

  // 11. KARNATAKA
  {
    code: "KA",
    name: "Karnataka",
    type: "STATE",
    districts: [
      {
        name: "Bengaluru Urban",
        code: "KA_BLR",
        acs: [
          { name: "Shantinagar", number: 163, code: "KA-AC-163", landmark: "Richmond Town & Langford", pincode: "560027" },
          { name: "Malleshwaram", number: 157, code: "KA-AC-157", landmark: "8th Cross Sampige Road", pincode: "560003" },
          { name: "Jayanagar", number: 173, code: "KA-AC-173", landmark: "4th Block Complex", pincode: "560011" },
          { name: "BTM Layout", number: 172, code: "KA-AC-172", landmark: "Udupi Garden Junction", pincode: "560076" },
          { name: "Gandhinagar", number: 164, code: "KA-AC-164", landmark: "Majestic City Railway Station", pincode: "560009" }
        ]
      },
      {
        name: "Mysuru",
        code: "KA_MYS",
        acs: [
          { name: "Krishnaraja", number: 216, code: "KA-AC-216", landmark: "Mysuru Palace South Gate", pincode: "570004" },
          { name: "Chamaraja", number: 217, code: "KA-AC-217", landmark: "Devaraja Market & Law Courts", pincode: "570001" },
          { name: "Narasimharaja", number: 218, code: "KA-AC-218", landmark: "St. Philomena Cathedral Road", pincode: "570007" }
        ]
      },
      {
        name: "Belagavi",
        code: "KA_BEL",
        acs: [
          { name: "Belagavi North", number: 11, code: "KA-AC-011", landmark: "Fort Lake & College Road", pincode: "590001" },
          { name: "Belagavi South", number: 12, code: "KA-AC-012", landmark: "Tilakwadi Third Railway Gate", pincode: "590006" }
        ]
      },
      {
        name: "Dakshina Kannada",
        code: "KA_DKA",
        acs: [
          { name: "Mangaluru City South", number: 201, code: "KA-AC-201", landmark: "Hampankatta & Lalbagh", pincode: "575001" },
          { name: "Mangaluru City North", number: 200, code: "KA-AC-200", landmark: "Surathkal NITK Junction", pincode: "575025" }
        ]
      },
      {
        name: "Dharwad",
        code: "KA_DHA",
        acs: [
          { name: "Hubballi-Dharwad Central", number: 73, code: "KA-AC-073", landmark: "Chennamma Circle Hubballi", pincode: "580020" },
          { name: "Dharwad AC", number: 71, code: "KA-AC-071", landmark: "Karnatak University Gate", pincode: "580003" }
        ]
      },
      {
        name: "Kalaburagi",
        code: "KA_KAL",
        acs: [
          { name: "Kalaburagi South", number: 45, code: "KA-AC-045", landmark: "Super Market & Sedam Road", pincode: "585101" },
          { name: "Kalaburagi North", number: 44, code: "KA-AC-044", landmark: "Gulbarga Fort & MSK Mill", pincode: "585102" }
        ]
      }
    ]
  },

  // 12. KERALA
  {
    code: "KL",
    name: "Kerala",
    type: "STATE",
    districts: [
      {
        name: "Thiruvananthapuram",
        code: "KL_TVM",
        acs: [
          { name: "Vattiyoorkavu", number: 133, code: "KL-AC-133", landmark: "Sasthamangalam & Kowdiar", pincode: "695010" },
          { name: "Thiruvananthapuram", number: 134, code: "KL-AC-134", landmark: "Secretariat & Statue Junction", pincode: "695001" },
          { name: "Nemom", number: 135, code: "KL-AC-135", landmark: "Kaimanam National Highway", pincode: "695040" }
        ]
      },
      {
        name: "Ernakulam",
        code: "KL_ERN",
        acs: [
          { name: "Ernakulam AC", number: 82, code: "KL-AC-082", landmark: "MG Road & Marine Drive", pincode: "682011" },
          { name: "Thrikkakara", number: 83, code: "KL-AC-083", landmark: "Kakkanad Civil Station & InfoPark", pincode: "682030" },
          { name: "Kochi AC", number: 81, code: "KL-AC-081", landmark: "Fort Kochi & Mattancherry", pincode: "682001" }
        ]
      },
      {
        name: "Kozhikode",
        code: "KL_KOZ",
        acs: [
          { name: "Kozhikode North", number: 27, code: "KL-AC-027", landmark: "Mananchira Square & Beach", pincode: "673001" },
          { name: "Kozhikode South", number: 28, code: "KL-AC-028", landmark: "Palayam & SM Street", pincode: "673002" }
        ]
      },
      {
        name: "Thrissur",
        code: "KL_THR",
        acs: [
          { name: "Thrissur AC", number: 67, code: "KL-AC-067", landmark: "Thekkinkadu Maidan & Swaraj Round", pincode: "680001" },
          { name: "Ollur", number: 66, code: "KL-AC-066", landmark: "Industrial Estate Ollur", pincode: "680306" }
        ]
      },
      {
        name: "Kannur",
        code: "KL_KAN",
        acs: [
          { name: "Kannur AC", number: 11, code: "KL-AC-011", landmark: "Fort Road & Caltex Junction", pincode: "670002" },
          { name: "Thalassery", number: 13, code: "KL-AC-013", landmark: "Overbury Folly & Sea Bridge", pincode: "670101" }
        ]
      },
      {
        name: "Kollam",
        code: "KL_KOL",
        acs: [
          { name: "Kollam AC", number: 124, code: "KL-AC-124", landmark: "Chinnakada Clock Tower", pincode: "691001" },
          { name: "Eravipuram", number: 125, code: "KL-AC-125", landmark: "Coastal Highway Sector", pincode: "691011" }
        ]
      }
    ]
  },

  // 13. MADHYA PRADESH
  {
    code: "MP",
    name: "Madhya Pradesh",
    type: "STATE",
    districts: [
      {
        name: "Bhopal",
        code: "MP_BHO",
        acs: [
          { name: "Bhopal North", number: 150, code: "MP-AC-150", landmark: "Taj-ul-Masajid & Royal Market", pincode: "462001" },
          { name: "Bhopal South-West", number: 152, code: "MP-AC-152", landmark: "New Market & Vallabh Bhawan", pincode: "462003" },
          { name: "Govindpura", number: 154, code: "MP-AC-154", landmark: "BHEL Township & Chetak Bridge", pincode: "462023" },
          { name: "Huzur", number: 155, code: "MP-AC-155", landmark: "Kolar Road & Bairagarh", pincode: "462030" }
        ]
      },
      {
        name: "Indore",
        code: "MP_IND",
        acs: [
          { name: "Indore-1", number: 204, code: "MP-AC-204", landmark: "Bada Ganpati & Aerodrome Road", pincode: "452005" },
          { name: "Indore-2", number: 205, code: "MP-AC-205", landmark: "Vijay Nagar & Sukhlia", pincode: "452010" },
          { name: "Indore-3", number: 206, code: "MP-AC-206", landmark: "Rajwada Palace & Sarafa", pincode: "452002" },
          { name: "Rau", number: 210, code: "MP-AC-210", landmark: "Bypass Corridor & Silicon City", pincode: "453331" }
        ]
      },
      {
        name: "Gwalior",
        code: "MP_GWA",
        acs: [
          { name: "Gwalior East", number: 16, code: "MP-AC-016", landmark: "Morar & City Centre", pincode: "474011" },
          { name: "Gwalior South", number: 17, code: "MP-AC-017", landmark: "Jayendraganj & Lashkar", pincode: "474009" }
        ]
      },
      {
        name: "Jabalpur",
        code: "MP_JAB",
        acs: [
          { name: "Jabalpur Cantt", number: 99, code: "MP-AC-099", landmark: "Sadar Bazar & Mall Road", pincode: "482001" },
          { name: "Jabalpur West", number: 100, code: "MP-AC-100", landmark: "Gorakhpur & Madan Mahal", pincode: "482002" }
        ]
      },
      {
        name: "Ujjain",
        code: "MP_UJJ",
        acs: [
          { name: "Ujjain North", number: 216, code: "MP-AC-216", landmark: "Mahakaleshwar Temple Corridor", pincode: "456001" },
          { name: "Ujjain South", number: 217, code: "MP-AC-217", landmark: "Tower Chowk & Freeganj", pincode: "456010" }
        ]
      }
    ]
  },

  // 14. MAHARASHTRA
  {
    code: "MH",
    name: "Maharashtra",
    type: "STATE",
    districts: [
      {
        name: "Mumbai City",
        code: "MH_MUM",
        acs: [
          { name: "Colaba", number: 187, code: "MH-AC-187", landmark: "Fort & Colaba Pier", pincode: "400005" },
          { name: "Malabar Hill", number: 185, code: "MH-AC-185", landmark: "Walkeshwar & Ridge Road", pincode: "400006" },
          { name: "Byculla", number: 184, code: "MH-AC-184", landmark: "Dr. B.A. Road & Byculla East", pincode: "400027" },
          { name: "Mumbadevi", number: 186, code: "MH-AC-186", landmark: "Kalbadevi & Bhuleshwar", pincode: "400002" }
        ]
      },
      {
        name: "Mumbai Suburban",
        code: "MH_MSU",
        acs: [
          { name: "Bandra West", number: 177, code: "MH-AC-177", landmark: "Hill Road & Bandstand", pincode: "400050" },
          { name: "Andheri West", number: 165, code: "MH-AC-165", landmark: "Lokhandwala Complex", pincode: "400053" },
          { name: "Borivali", number: 152, code: "MH-AC-152", landmark: "Shimpoli & Link Road", pincode: "400092" },
          { name: "Ghatkopar East", number: 170, code: "MH-AC-170", landmark: "Vallabh Baug Lane", pincode: "400077" }
        ]
      },
      {
        name: "Pune",
        code: "MH_PUN",
        acs: [
          { name: "Shivajinagar", number: 209, code: "MH-AC-209", landmark: "FC Road & Model Colony", pincode: "411005" },
          { name: "Kothrud", number: 210, code: "MH-AC-210", landmark: "Paud Road & Karve Nagar", pincode: "411038" },
          { name: "Pune Cantonment", number: 214, code: "MH-AC-214", landmark: "Camp & MG Road", pincode: "411001" },
          { name: "Kasba Peth", number: 215, code: "MH-AC-215", landmark: "Shaniwar Wada & Laxmi Road", pincode: "411002" },
          { name: "Hadapsar", number: 213, code: "MH-AC-213", landmark: "Magarpatta City & Solapur Road", pincode: "411028" }
        ]
      },
      {
        name: "Nagpur",
        code: "MH_NAG",
        acs: [
          { name: "Nagpur South West", number: 52, code: "MH-AC-052", landmark: "Pratap Nagar & Khamla", pincode: "440022" },
          { name: "Nagpur West", number: 56, code: "MH-AC-056", landmark: "Dharampeth & Civil Lines", pincode: "440010" },
          { name: "Nagpur Central", number: 55, code: "MH-AC-055", landmark: "Gandhibagh & Itwari", pincode: "440002" }
        ]
      },
      {
        name: "Thane",
        code: "MH_THA",
        acs: [
          { name: "Thane City", number: 148, code: "MH-AC-148", landmark: "Panchpakhadi & Naupada", pincode: "400602" },
          { name: "Kalyan West", number: 138, code: "MH-AC-138", landmark: "Shivaji Chowk Kalyan", pincode: "421301" },
          { name: "Belapur", number: 151, code: "MH-AC-151", landmark: "CBD Belapur Navi Mumbai", pincode: "400614" }
        ]
      },
      {
        name: "Nashik",
        code: "MH_NAS",
        acs: [
          { name: "Nashik Central", number: 124, code: "MH-AC-124", landmark: "MG Road & Ashok Stambh", pincode: "422001" },
          { name: "Nashik West", number: 125, code: "MH-AC-125", landmark: "College Road & Gangapur", pincode: "422005" }
        ]
      },
      {
        name: "Chhatrapati Sambhaji Nagar",
        code: "MH_CSN",
        acs: [
          { name: "Aurangabad Central", number: 107, code: "MH-AC-107", landmark: "Kranti Chowk & Gulmandi", pincode: "431001" },
          { name: "Aurangabad East", number: 108, code: "MH-AC-108", landmark: "Jalna Road & CIDCO", pincode: "431003" }
        ]
      },
      {
        name: "Kolhapur",
        code: "MH_KOL",
        acs: [
          { name: "Kolhapur South", number: 274, code: "MH-AC-274", landmark: "Rajaram College Campus", pincode: "416004" },
          { name: "Kolhapur North", number: 276, code: "MH-AC-276", landmark: "Mahalaxmi Temple Area", pincode: "416012" }
        ]
      },
      {
        name: "Solapur",
        code: "MH_SOL",
        acs: [
          { name: "Solapur City North", number: 248, code: "MH-AC-248", landmark: "Old Employment Chowk", pincode: "413001" },
          { name: "Solapur City Central", number: 249, code: "MH-AC-249", landmark: "Siddheshwar Mandir Precinct", pincode: "413002" }
        ]
      }
    ]
  },

  // 15. MANIPUR
  {
    code: "MN",
    name: "Manipur",
    type: "STATE",
    districts: [
      {
        name: "Imphal West",
        code: "MN_IMW",
        acs: [
          { name: "Keishamthong", number: 12, code: "MN-AC-012", landmark: "Kangla Fort & Thangal Bazar", pincode: "795001" },
          { name: "Sagolband", number: 11, code: "MN-AC-011", landmark: "Sagolband Tera Road", pincode: "795004" },
          { name: "Uripok", number: 10, code: "MN-AC-010", landmark: "RIMS Hospital Gate", pincode: "795004" }
        ]
      },
      {
        name: "Imphal East",
        code: "MN_IME",
        acs: [
          { name: "Wangkhei", number: 15, code: "MN-AC-015", landmark: "Palace Compound & Porompat", pincode: "795005" },
          { name: "Yaiskul", number: 14, code: "MN-AC-014", landmark: "Police Headquarter More", pincode: "795001" }
        ]
      },
      {
        name: "Churachandpur",
        code: "MN_CHU",
        acs: [
          { name: "Churachandpur AC", number: 58, code: "MN-AC-058", landmark: "Tedim Road & Tuibong", pincode: "795128" },
          { name: "Saikot", number: 59, code: "MN-AC-059", landmark: "Peace Ground Complex", pincode: "795133" }
        ]
      }
    ]
  },

  // 16. MEGHALAYA
  {
    code: "ML",
    name: "Meghalaya",
    type: "STATE",
    districts: [
      {
        name: "East Khasi Hills",
        code: "ML_EKH",
        acs: [
          { name: "East Shillong", number: 16, code: "ML-AC-016", landmark: "Police Bazar & Laitumkhrah", pincode: "793001" },
          { name: "North Shillong", number: 17, code: "ML-AC-017", landmark: "Mawlai & Polo Grounds", pincode: "793008" },
          { name: "West Shillong", number: 18, code: "ML-AC-018", landmark: "Labān & Kench's Trace", pincode: "793004" }
        ]
      },
      {
        name: "West Garo Hills",
        code: "ML_WGH",
        acs: [
          { name: "North Tura", number: 50, code: "ML-AC-050", landmark: "Tura Super Market", pincode: "794001" },
          { name: "South Tura", number: 51, code: "ML-AC-051", landmark: "Dakopgre DC Complex", pincode: "794101" }
        ]
      },
      {
        name: "Ri-Bhoi",
        code: "ML_RIB",
        acs: [
          { name: "Nongpoh", number: 10, code: "ML-AC-010", landmark: "GS Road Highway Hub", pincode: "793102" }
        ]
      }
    ]
  },

  // 17. MIZORAM
  {
    code: "MZ",
    name: "Mizoram",
    type: "STATE",
    districts: [
      {
        name: "Aizawl",
        code: "MZ_AIZ",
        acs: [
          { name: "Aizawl North I", number: 10, code: "MZ-AC-010", landmark: "Bawngkawn & Durtlang", pincode: "796014" },
          { name: "Aizawl East I", number: 13, code: "MZ-AC-013", landmark: "Zarkawt & Chanmari", pincode: "796007" },
          { name: "Aizawl West I", number: 16, code: "MZ-AC-016", landmark: "Khatla Civil Secretariat", pincode: "796001" }
        ]
      },
      {
        name: "Lunglei",
        code: "MZ_LUN",
        acs: [
          { name: "Lunglei South", number: 31, code: "MZ-AC-031", landmark: "Bazar Veng & Venglai", pincode: "796701" },
          { name: "Lunglei North", number: 32, code: "MZ-AC-032", landmark: "Farm Veng", pincode: "796701" }
        ]
      }
    ]
  },

  // 18. NAGALAND
  {
    code: "NL",
    name: "Nagaland",
    type: "STATE",
    districts: [
      {
        name: "Kohima",
        code: "NL_KOH",
        acs: [
          { name: "Kohima Town", number: 9, code: "NL-AC-009", landmark: "War Cemetery & Razhü Point", pincode: "797001" },
          { name: "Northern Angami I", number: 10, code: "NL-AC-010", landmark: "High Court Junction", pincode: "797004" }
        ]
      },
      {
        name: "Dimapur",
        code: "NL_DIM",
        acs: [
          { name: "Dimapur I", number: 1, code: "NL-AC-001", landmark: "Clock Tower & MP Road", pincode: "797112" },
          { name: "Dimapur II", number: 2, code: "NL-AC-002", landmark: "Purana Bazar & Highway 29", pincode: "797116" }
        ]
      },
      {
        name: "Mokokchung",
        code: "NL_MOK",
        acs: [
          { name: "Mokokchung Town", number: 27, code: "NL-AC-027", landmark: "Main Bazaar Mokokchung", pincode: "798601" }
        ]
      }
    ]
  },

  // 19. ODISHA
  {
    code: "OD",
    name: "Odisha",
    type: "STATE",
    districts: [
      {
        name: "Khordha",
        code: "OD_KHO",
        acs: [
          { name: "Bhubaneswar Central", number: 112, code: "OD-AC-112", landmark: "Master Canteen & Ashok Nagar", pincode: "751001" },
          { name: "Bhubaneswar North", number: 113, code: "OD-AC-113", landmark: "Chandrasekharpur & Patia IT Park", pincode: "751024" },
          { name: "Ekamra Bhubaneswar", number: 114, code: "OD-AC-114", landmark: "Lingaraj Temple Precinct", pincode: "751002" }
        ]
      },
      {
        name: "Cuttack",
        code: "OD_CUT",
        acs: [
          { name: "Barabati-Cuttack", number: 90, code: "OD-AC-090", landmark: "Barabati Fort & High Court Road", pincode: "753001" },
          { name: "Choudwar-Cuttack", number: 91, code: "OD-AC-091", landmark: "Mahanadi Vihar", pincode: "753004" }
        ]
      },
      {
        name: "Ganjam",
        code: "OD_GAN",
        acs: [
          { name: "Berhampur", number: 133, code: "OD-AC-133", landmark: "Giri Market & Old Bus Stand", pincode: "760001" },
          { name: "Gopalpur", number: 132, code: "OD-AC-132", landmark: "Port Road & Beach Road", pincode: "761002" }
        ]
      },
      {
        name: "Sundargarh",
        code: "OD_SUN",
        acs: [
          { name: "Rourkela", number: 12, code: "OD-AC-012", landmark: "Steel Plant Township & Bisra Square", pincode: "769001" },
          { name: "Raghunathpali", number: 11, code: "OD-AC-011", landmark: "Panposh Road", pincode: "769004" }
        ]
      },
      {
        name: "Puri",
        code: "OD_PUR",
        acs: [
          { name: "Puri AC", number: 107, code: "OD-AC-107", landmark: "Grand Road & Jagannath Temple", pincode: "752001" },
          { name: "Brahmagiri", number: 108, code: "OD-AC-108", landmark: "Alarnath Temple Road", pincode: "752011" }
        ]
      }
    ]
  },

  // 20. PUNJAB
  {
    code: "PB",
    name: "Punjab",
    type: "STATE",
    districts: [
      {
        name: "Ludhiana",
        code: "PB_LUD",
        acs: [
          { name: "Ludhiana Central", number: 63, code: "PB-AC-063", landmark: "Chaura Bazar & Clock Tower", pincode: "141008" },
          { name: "Ludhiana West", number: 64, code: "PB-AC-064", landmark: "Sarabha Nagar & Ferozepur Road", pincode: "141001" },
          { name: "Ludhiana East", number: 60, code: "PB-AC-060", landmark: "Samrala Chowk", pincode: "141010" }
        ]
      },
      {
        name: "Amritsar",
        code: "PB_AMR",
        acs: [
          { name: "Amritsar Central", number: 17, code: "PB-AC-017", landmark: "Heritage Street & Hall Gate", pincode: "143001" },
          { name: "Amritsar North", number: 15, code: "PB-AC-015", landmark: "Lawrence Road & Mall Road", pincode: "143001" },
          { name: "Amritsar West", number: 16, code: "PB-AC-016", landmark: "Chheharta Industrial Area", pincode: "143105" }
        ]
      },
      {
        name: "Jalandhar",
        code: "PB_JAL",
        acs: [
          { name: "Jalandhar Central", number: 35, code: "PB-AC-035", landmark: "BMC Chowk & Model Town", pincode: "144001" },
          { name: "Jalandhar West", number: 34, code: "PB-AC-034", landmark: "Basti Nau Sports Market", pincode: "144002" }
        ]
      },
      {
        name: "Patiala",
        code: "PB_PAT",
        acs: [
          { name: "Patiala Urban", number: 115, code: "PB-AC-115", landmark: "Leela Bhawan & Qila Mubarak", pincode: "147001" },
          { name: "Patiala Rural", number: 110, code: "PB-AC-110", landmark: "Thapar Institute Campus Road", pincode: "147004" }
        ]
      },
      {
        name: "SAS Nagar",
        code: "PB_SAS",
        acs: [
          { name: "Mohali AC", number: 52, code: "PB-AC-052", landmark: "Phase 7 Market & PCA Stadium", pincode: "160062" },
          { name: "Kharar", number: 53, code: "PB-AC-053", landmark: "Chandigarh-Kharar Highway", pincode: "140301" }
        ]
      }
    ]
  },

  // 21. RAJASTHAN
  {
    code: "RJ",
    name: "Rajasthan",
    type: "STATE",
    districts: [
      {
        name: "Jaipur",
        code: "RJ_JAI",
        acs: [
          { name: "Civil Lines", number: 53, code: "RJ-AC-053", landmark: "Secretariat & Ajmer Road", pincode: "302006" },
          { name: "Hawa Mahal", number: 49, code: "RJ-AC-049", landmark: "Badi Chaupar & Johri Bazar", pincode: "302002" },
          { name: "Malviya Nagar", number: 51, code: "RJ-AC-051", landmark: "Gaurav Tower & JLN Marg", pincode: "302017" },
          { name: "Vidhyadhar Nagar", number: 50, code: "RJ-AC-050", landmark: "Sikar Road & Sector 2", pincode: "302039" }
        ]
      },
      {
        name: "Jodhpur",
        code: "RJ_JOD",
        acs: [
          { name: "Sardarpura", number: 128, code: "RJ-AC-128", landmark: "Jalori Gate & B Road", pincode: "342003" },
          { name: "Jodhpur City", number: 129, code: "RJ-AC-129", landmark: "Clock Tower & Sojati Gate", pincode: "342001" },
          { name: "Soorsagar", number: 127, code: "RJ-AC-127", landmark: "Mandore Heritage Road", pincode: "342007" }
        ]
      },
      {
        name: "Kota",
        code: "RJ_KOT",
        acs: [
          { name: "Kota North", number: 189, code: "RJ-AC-189", landmark: "Rampura Market & Chambal Riverfront", pincode: "324006" },
          { name: "Kota South", number: 190, code: "RJ-AC-190", landmark: "Talwandi Coaching Hub", pincode: "324005" }
        ]
      },
      {
        name: "Udaipur",
        code: "RJ_UDA",
        acs: [
          { name: "Udaipur City", number: 153, code: "RJ-AC-153", landmark: "Surajpole & City Palace Road", pincode: "313001" },
          { name: "Udaipur Rural", number: 152, code: "RJ-AC-152", landmark: "Sukher Industrial Zone", pincode: "313004" }
        ]
      },
      {
        name: "Ajmer",
        code: "RJ_AJM",
        acs: [
          { name: "Ajmer North", number: 100, code: "RJ-AC-100", landmark: "Ana Sagar Lake Road", pincode: "305001" },
          { name: "Ajmer South", number: 101, code: "RJ-AC-101", landmark: "Dargah Sharif Corridor", pincode: "305001" }
        ]
      },
      {
        name: "Bikaner",
        code: "RJ_BIK",
        acs: [
          { name: "Bikaner East", number: 19, code: "RJ-AC-019", landmark: "Kote Gate & Sadul Ganj", pincode: "334001" },
          { name: "Bikaner West", number: 18, code: "RJ-AC-018", landmark: "Junagarh Fort Road", pincode: "334001" }
        ]
      }
    ]
  },

  // 22. SIKKIM
  {
    code: "SK",
    name: "Sikkim",
    type: "STATE",
    districts: [
      {
        name: "Gangtok",
        code: "SK_EAS",
        acs: [
          { name: "Gangtok AC", number: 27, code: "SK-AC-027", landmark: "MG Marg & Ridge Park", pincode: "737101" },
          { name: "Upper Burtuk", number: 28, code: "SK-AC-028", landmark: "Burtuk Helipad Highway", pincode: "737101" }
        ]
      },
      {
        name: "Namchi",
        code: "SK_SOU",
        acs: [
          { name: "Namchi-Singhithang", number: 11, code: "SK-AC-011", landmark: "Char Dham Cultural Complex", pincode: "737126" },
          { name: "Poklok-Kamrang", number: 12, code: "SK-AC-012", landmark: "Namchi Bazar Circle", pincode: "737126" }
        ]
      },
      {
        name: "Geyzing",
        code: "SK_WES",
        acs: [
          { name: "Geyzing-Bermiok", number: 4, code: "SK-AC-004", landmark: "District Administrative Center", pincode: "737111" }
        ]
      }
    ]
  },

  // 23. TAMIL NADU
  {
    code: "TN",
    name: "Tamil Nadu",
    type: "STATE",
    districts: [
      {
        name: "Chennai",
        code: "TN_CHE",
        acs: [
          { name: "Chepauk-Thiruvallikeni", number: 19, code: "TN-AC-019", landmark: "Marina Beach & Triplicane High Road", pincode: "600005" },
          { name: "Thousand Lights", number: 20, code: "TN-AC-020", landmark: "Anna Salai & Greams Road", pincode: "600006" },
          { name: "Mylapore", number: 25, code: "TN-AC-025", landmark: "Kapaleeshwarar Temple Road", pincode: "600004" },
          { name: "Anna Nagar", number: 21, code: "TN-AC-021", landmark: "Roundtana & Tower Park", pincode: "600040" },
          { name: "T. Nagar", number: 23, code: "TN-AC-023", landmark: "Panagal Park & Usman Road", pincode: "600017" }
        ]
      },
      {
        name: "Coimbatore",
        code: "TN_COI",
        acs: [
          { name: "Coimbatore South", number: 120, code: "TN-AC-120", landmark: "Town Hall & Gandhipuram", pincode: "641001" },
          { name: "Coimbatore North", number: 118, code: "TN-AC-118", landmark: "Cross Cut Road & Peelamedu", pincode: "641004" },
          { name: "Singanallur", number: 121, code: "TN-AC-121", landmark: "Trichy Road Industrial Corridor", pincode: "641005" }
        ]
      },
      {
        name: "Madurai",
        code: "TN_MAD",
        acs: [
          { name: "Madurai Central", number: 191, code: "TN-AC-191", landmark: "Meenakshi Amman Temple West Tower", pincode: "625001" },
          { name: "Madurai North", number: 189, code: "TN-AC-189", landmark: "Goripalayam & Tallakulam", pincode: "625002" }
        ]
      },
      {
        name: "Tiruchirappalli",
        code: "TN_TRP",
        acs: [
          { name: "Tiruchirappalli West", number: 140, code: "TN-AC-140", landmark: "Thillai Nagar & Cantonment", pincode: "620018" },
          { name: "Tiruchirappalli East", number: 141, code: "TN-AC-141", landmark: "Rockfort Temple Area", pincode: "620002" }
        ]
      },
      {
        name: "Salem",
        code: "TN_SAL",
        acs: [
          { name: "Salem North", number: 89, code: "TN-AC-089", landmark: "Hasthampatti & Cherry Road", pincode: "636007" },
          { name: "Salem South", number: 90, code: "TN-AC-090", landmark: "Old Bus Stand & Bazaar Street", pincode: "636001" }
        ]
      },
      {
        name: "Tirunelveli",
        code: "TN_TIR",
        acs: [
          { name: "Tirunelveli AC", number: 228, code: "TN-AC-228", landmark: "Nellaiappar Temple Circle", pincode: "627006" },
          { name: "Palayamkottai", number: 226, code: "TN-AC-226", landmark: "St. Xavier College Corridor", pincode: "627002" }
        ]
      }
    ]
  },

  // 24. TELANGANA
  {
    code: "TS",
    name: "Telangana",
    type: "STATE",
    districts: [
      {
        name: "Hyderabad",
        code: "TS_HYD",
        acs: [
          { name: "Jubilee Hills", number: 61, code: "TS-AC-061", landmark: "Road No 36 & Film Nagar", pincode: "500033" },
          { name: "Khairatabad", number: 59, code: "TS-AC-059", landmark: "Somajiguda & Secretariat Road", pincode: "500004" },
          { name: "Charminar", number: 67, code: "TS-AC-067", landmark: "Laad Bazar & Mecca Masjid", pincode: "500002" },
          { name: "Amberpet", number: 58, code: "TS-AC-058", landmark: "Osmania University Road", pincode: "500013" },
          { name: "Goshamahal", number: 65, code: "TS-AC-065", landmark: "MJ Market & Exhibition Grounds", pincode: "500001" }
        ]
      },
      {
        name: "Ranga Reddy",
        code: "TS_RAN",
        acs: [
          { name: "Serilingampally", number: 52, code: "TS-AC-052", landmark: "HITEC City & Gachibowli", pincode: "500081" },
          { name: "Rajendranagar", number: 51, code: "TS-AC-051", landmark: "Agriculture University Gate", pincode: "500030" },
          { name: "L. B. Nagar", number: 49, code: "TS-AC-049", landmark: "Ring Road Junction", pincode: "500074" }
        ]
      },
      {
        name: "Medchal-Malkajgiri",
        code: "TS_MED",
        acs: [
          { name: "Malkajgiri", number: 44, code: "TS-AC-044", landmark: "Safilguda Lake & Anandbagh", pincode: "500047" },
          { name: "Kukatpally", number: 46, code: "TS-AC-046", landmark: "KPHB Colony Main Road", pincode: "500072" },
          { name: "Uppal", number: 47, code: "TS-AC-047", landmark: "Rajiv Gandhi International Cricket Stadium", pincode: "500039" }
        ]
      },
      {
        name: "Warangal",
        code: "TS_WAR",
        acs: [
          { name: "Warangal West", number: 105, code: "TS-AC-105", landmark: "Hanamkonda Public Gardens", pincode: "506001" },
          { name: "Warangal East", number: 106, code: "TS-AC-106", landmark: "Warangal Fort Road", pincode: "506002" }
        ]
      },
      {
        name: "Karimnagar",
        code: "TS_KAR",
        acs: [
          { name: "Karimnagar AC", number: 26, code: "TS-AC-026", landmark: "Tower Circle Karimnagar", pincode: "505001" },
          { name: "Choppadandi", number: 27, code: "TS-AC-027", landmark: "Vemulawada Highway", pincode: "505415" }
        ]
      },
      {
        name: "Nizamabad",
        code: "TS_NIZ",
        acs: [
          { name: "Nizamabad Urban", number: 17, code: "TS-AC-017", landmark: "Khaleelwadi & Gandhi Chowk", pincode: "503001" },
          { name: "Nizamabad Rural", number: 18, code: "TS-AC-018", landmark: "Dichpally Highway", pincode: "503175" }
        ]
      }
    ]
  },

  // 25. TRIPURA
  {
    code: "TR",
    name: "Tripura",
    type: "STATE",
    districts: [
      {
        name: "West Tripura",
        code: "TR_WTR",
        acs: [
          { name: "Agartala AC", number: 6, code: "TR-AC-006", landmark: "Ujjayanta Palace & Paradise Chowmuhani", pincode: "799001" },
          { name: "Banamalipur", number: 7, code: "TR-AC-007", landmark: "Post Office Chowmuhani", pincode: "799001" },
          { name: "Town Bordowali", number: 8, code: "TR-AC-008", landmark: "Battala Commercial Market", pincode: "799001" }
        ]
      },
      {
        name: "Gomati",
        code: "TR_GOM",
        acs: [
          { name: "Radhakishorpur", number: 31, code: "TR-AC-031", landmark: "Tripura Sundari Temple Udaipur", pincode: "799120" },
          { name: "Matarbari", number: 32, code: "TR-AC-032", landmark: "Kalyan Sagar Lake Road", pincode: "799114" }
        ]
      },
      {
        name: "North Tripura",
        code: "TR_NTR",
        acs: [
          { name: "Dharmanagar", number: 56, code: "TR-AC-056", landmark: "Dharmanagar Town Market", pincode: "799250" }
        ]
      }
    ]
  },

  // 26. UTTAR PRADESH
  {
    code: "UP",
    name: "Uttar Pradesh",
    type: "STATE",
    districts: [
      {
        name: "Lucknow",
        code: "UP_LUC",
        acs: [
          { name: "Lucknow Cantt", number: 175, code: "UP-AC-175", landmark: "Sadart Bazar & Dilkusha", pincode: "226002" },
          { name: "Lucknow Central", number: 174, code: "UP-AC-174", landmark: "Hazratganj & Vidhan Sabha Marg", pincode: "226001" },
          { name: "Lucknow North", number: 172, code: "UP-AC-172", landmark: "Aliganj & Kapoorthala", pincode: "226024" },
          { name: "Sarojini Nagar", number: 170, code: "UP-AC-170", landmark: "Kanpur Road & Airport Road", pincode: "226008" }
        ]
      },
      {
        name: "Varanasi",
        code: "UP_VAR",
        acs: [
          { name: "Varanasi Cantt", number: 390, code: "UP-AC-390", landmark: "Varanasi Junction Station Road", pincode: "221002" },
          { name: "Varanasi North", number: 388, code: "UP-AC-388", landmark: "Sarnath & Ashapur", pincode: "221007" },
          { name: "Varanasi South", number: 389, code: "UP-AC-389", landmark: "Kashi Vishwanath Corridor & Dashashwamedh", pincode: "221001" }
        ]
      },
      {
        name: "Kanpur Nagar",
        code: "UP_KAN",
        acs: [
          { name: "Kanpur Cantt", number: 216, code: "UP-AC-216", landmark: "Mall Road & Phool Bagh", pincode: "208001" },
          { name: "Govind Nagar", number: 212, code: "UP-AC-212", landmark: "Govind Nagar Main Market", pincode: "208006" },
          { name: "Kalyanpur", number: 211, code: "UP-AC-211", landmark: "IIT Kanpur Campus Gate", pincode: "208016" }
        ]
      },
      {
        name: "Prayagraj",
        code: "UP_PRA",
        acs: [
          { name: "Allahabad North", number: 262, code: "UP-AC-262", landmark: "Civil Lines & High Court", pincode: "211001" },
          { name: "Allahabad South", number: 263, code: "UP-AC-263", landmark: "Muthiganj & Kydganj", pincode: "211003" },
          { name: "Allahabad West", number: 261, code: "UP-AC-261", landmark: "Dhoomanganj & Subedarganj", pincode: "211011" }
        ]
      },
      {
        name: "Agra",
        code: "UP_AGR",
        acs: [
          { name: "Agra North", number: 89, code: "UP-AC-089", landmark: "Sanjay Place Commercial Hub", pincode: "282002" },
          { name: "Agra South", number: 90, code: "UP-AC-090", landmark: "Taj Ganj & Fatehabad Road", pincode: "282001" },
          { name: "Agra Cantt", number: 87, code: "UP-AC-087", landmark: "Railway Station & Sadar", pincode: "282001" }
        ]
      },
      {
        name: "Meerut",
        code: "UP_MEE",
        acs: [
          { name: "Meerut Cantt", number: 47, code: "UP-AC-047", landmark: "Boundary Road & Mall", pincode: "250001" },
          { name: "Meerut City", number: 48, code: "UP-AC-048", landmark: "Ghanta Ghar & Valley Bazar", pincode: "250002" },
          { name: "Meerut South", number: 49, code: "UP-AC-049", landmark: "Delhi Road & Mohkam Pur", pincode: "250002" }
        ]
      },
      {
        name: "Ghaziabad",
        code: "UP_GHA",
        acs: [
          { name: "Ghaziabad AC", number: 56, code: "UP-AC-056", landmark: "Navyug Market & RDC Raj Nagar", pincode: "201001" },
          { name: "Sahibabad", number: 55, code: "UP-AC-055", landmark: "Vaishali & Kaushambi Metro Hub", pincode: "201010" }
        ]
      },
      {
        name: "Gautam Buddha Nagar",
        code: "UP_GBN",
        acs: [
          { name: "Noida AC", number: 61, code: "UP-AC-061", landmark: "Sector 18 Commercial Hub", pincode: "201301" },
          { name: "Dadri", number: 62, code: "UP-AC-062", landmark: "Greater Noida Alpha 1", pincode: "201308" }
        ]
      },
      {
        name: "Gorakhpur",
        code: "UP_GOR",
        acs: [
          { name: "Gorakhpur Urban", number: 322, code: "UP-AC-322", landmark: "Gorakhnath Temple Precinct & Golghar", pincode: "273001" },
          { name: "Gorakhpur Rural", number: 323, code: "UP-AC-323", landmark: "Mohaddipur & University Road", pincode: "273008" }
        ]
      },
      {
        name: "Ayodhya",
        code: "UP_AYO",
        acs: [
          { name: "Ayodhya AC", number: 275, code: "UP-AC-275", landmark: "Ram Janmabhoomi Path & Hanumangarhi", pincode: "224123" },
          { name: "Rudauli", number: 271, code: "UP-AC-271", landmark: "Rudauli Town Square", pincode: "224120" }
        ]
      }
    ]
  },

  // 27. UTTARAKHAND
  {
    code: "UK",
    name: "Uttarakhand",
    type: "STATE",
    districts: [
      {
        name: "Dehradun",
        code: "UK_DEH",
        acs: [
          { name: "Dehradun Cantt", number: 21, code: "UK-AC-021", landmark: "FRI Gate & Chakrata Road", pincode: "248001" },
          { name: "Rajpur Road", number: 19, code: "UK-AC-019", landmark: "Clock Tower & Dilaram Bazar", pincode: "248001" },
          { name: "Dharampur", number: 22, code: "UK-AC-022", landmark: "ISBT & Haridwar Bypass", pincode: "248001" },
          { name: "Mussoorie", number: 24, code: "UK-AC-024", landmark: "The Mall Mussoorie & Library Chowk", pincode: "248179" }
        ]
      },
      {
        name: "Haridwar",
        code: "UK_HAR",
        acs: [
          { name: "Haridwar Urban", number: 25, code: "UK-AC-025", landmark: "Har Ki Pauri & Upper Road", pincode: "249401" },
          { name: "BHEL Ranipur", number: 26, code: "UK-AC-026", landmark: "BHEL Township Sector 1", pincode: "249403" },
          { name: "Roorkee", number: 31, code: "UK-AC-031", landmark: "IIT Roorkee Gate & Civil Lines", pincode: "247667" }
        ]
      },
      {
        name: "Nainital",
        code: "UK_NAI",
        acs: [
          { name: "Nainital AC", number: 58, code: "UK-AC-058", landmark: "Naini Lake Promenade & Mallital", pincode: "263001" },
          { name: "Haldwani", number: 59, code: "UK-AC-059", landmark: "Nainital Road & Tikonia More", pincode: "263139" }
        ]
      },
      {
        name: "Udham Singh Nagar",
        code: "UK_USN",
        acs: [
          { name: "Rudrapur", number: 66, code: "UK-AC-066", landmark: "SIDCUL Industrial Area", pincode: "263153" },
          { name: "Kashipur", number: 63, code: "UK-AC-063", landmark: "Main Bazaar Kashipur", pincode: "244713" }
        ]
      }
    ]
  },

  // 28. WEST BENGAL
  {
    code: "WB",
    name: "West Bengal",
    type: "STATE",
    districts: [
      {
        name: "Kolkata",
        code: "WB_KOL",
        acs: [
          { name: "Bhabanipur", number: 159, code: "WB-AC-159", landmark: "Hazra More & Ashutosh Mukherjee Road", pincode: "700025" },
          { name: "Chowrangee", number: 162, code: "WB-AC-162", landmark: "Park Street & Esplanade", pincode: "700016" },
          { name: "Shyampukur", number: 166, code: "WB-AC-166", landmark: "Shobhabazar Rajbari Precinct", pincode: "700004" },
          { name: "Ballygunge", number: 161, code: "WB-AC-161", landmark: "Gariahat Crossing & Ballygunge Phari", pincode: "700019" },
          { name: "Jorasanko", number: 165, code: "WB-AC-165", landmark: "Thakur Bari & CR Avenue", pincode: "700007" }
        ]
      },
      {
        name: "North 24 Parganas",
        code: "WB_N24",
        acs: [
          { name: "Bidhannagar", number: 116, code: "WB-AC-116", landmark: "Salt Lake Karunamoyee & Sector V", pincode: "700091" },
          { name: "Dum Dum", number: 114, code: "WB-AC-114", landmark: "Dum Dum Metro Junction", pincode: "700028" },
          { name: "Rajarhat Gopalpur", number: 117, code: "WB-AC-117", landmark: "Chinar Park & VIP Road", pincode: "700136" },
          { name: "Barasat", number: 119, code: "WB-AC-119", landmark: "Barasat Champadali More", pincode: "700124" }
        ]
      },
      {
        name: "South 24 Parganas",
        code: "WB_S24",
        acs: [
          { name: "Jadavpur", number: 150, code: "WB-AC-150", landmark: "Jadavpur University 8B Bus Stand", pincode: "700032" },
          { name: "Tollygunge", number: 152, code: "WB-AC-152", landmark: "Mahanayak Uttam Kumar Metro", pincode: "700033" },
          { name: "Behala Paschim", number: 154, code: "WB-AC-154", landmark: "Diamond Harbour Road", pincode: "700034" }
        ]
      },
      {
        name: "Howrah",
        code: "WB_HOW",
        acs: [
          { name: "Howrah Central", number: 171, code: "WB-AC-171", landmark: "Kadamtala & Grand Trunk Road", pincode: "711101" },
          { name: "Howrah North", number: 170, code: "WB-AC-170", landmark: "Howrah Station Approach", pincode: "711101" },
          { name: "Shibpur", number: 172, code: "WB-AC-172", landmark: "IIEST Shibpur Gate", pincode: "711103" }
        ]
      },
      {
        name: "Darjeeling",
        code: "WB_DAR",
        acs: [
          { name: "Darjeeling AC", number: 23, code: "WB-AC-023", landmark: "Chowrasta & Mall Road", pincode: "734101" },
          { name: "Siliguri", number: 26, code: "WB-AC-026", landmark: "Sevoke Road & Hill Cart Road", pincode: "734001" }
        ]
      }
    ]
  },

  // 29. ANDAMAN AND NICOBAR ISLANDS
  {
    code: "AN",
    name: "Andaman and Nicobar Islands",
    type: "UT",
    districts: [
      {
        name: "South Andaman",
        code: "AN_SAN",
        acs: [
          { name: "Port Blair North", number: 1, code: "AN-AC-001", landmark: "Cellular Jail & Aberdeen Bazaar", pincode: "744101" },
          { name: "Port Blair South", number: 2, code: "AN-AC-002", landmark: "Junglighat & Dollygunj", pincode: "744103" }
        ]
      },
      {
        name: "North and Middle Andaman",
        code: "AN_NMA",
        acs: [
          { name: "Rangat", number: 3, code: "AN-AC-003", landmark: "Rangat Bazar Market", pincode: "744205" },
          { name: "Mayabunder", number: 4, code: "AN-AC-004", landmark: "DC Office Complex", pincode: "744204" }
        ]
      },
      {
        name: "Nicobar",
        code: "AN_NIC",
        acs: [
          { name: "Car Nicobar", number: 5, code: "AN-AC-005", landmark: "Malacca Village Ground", pincode: "744301" }
        ]
      }
    ]
  },

  // 30. CHANDIGARH
  {
    code: "CH",
    name: "Chandigarh",
    type: "UT",
    districts: [
      {
        name: "Chandigarh",
        code: "CH_CHD",
        acs: [
          { name: "Chandigarh North", number: 1, code: "CH-AC-001", landmark: "Sector 17 Plaza & Sector 9 Secretariat", pincode: "160017" },
          { name: "Chandigarh Central", number: 2, code: "CH-AC-002", landmark: "Sector 22 Market & Sector 35", pincode: "160022" },
          { name: "Chandigarh South", number: 3, code: "CH-AC-003", landmark: "Sector 43 ISBT & Sector 44", pincode: "160047" }
        ]
      }
    ]
  },

  // 31. DADRA AND NAGAR HAVELI AND DAMAN AND DIU
  {
    code: "DN",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "UT",
    districts: [
      {
        name: "Dadra and Nagar Haveli",
        code: "DN_DNH",
        acs: [
          { name: "Silvassa Urban", number: 1, code: "DN-AC-001", landmark: "Kilvani Road & Circuit House", pincode: "396230" },
          { name: "Khanvel Rural", number: 2, code: "DN-AC-002", landmark: "Khanvel Main Chowk", pincode: "396230" }
        ]
      },
      {
        name: "Daman",
        code: "DN_DAM",
        acs: [
          { name: "Daman AC", number: 3, code: "DN-AC-003", landmark: "Moti Daman Fort Gate", pincode: "396220" }
        ]
      },
      {
        name: "Diu",
        code: "DN_DIU",
        acs: [
          { name: "Diu AC", number: 4, code: "DN-AC-004", landmark: "Diu Fort & Bunder Road", pincode: "362520" }
        ]
      }
    ]
  },

  // 32. DELHI
  {
    code: "DL",
    name: "Delhi",
    type: "UT",
    districts: [
      {
        name: "New Delhi",
        code: "DL_NDL",
        acs: [
          { name: "New Delhi AC", number: 40, code: "DL-AC-040", landmark: "Connaught Place & Gole Market", pincode: "110001" },
          { name: "RK Puram", number: 44, code: "DL-AC-044", landmark: "Sector 4 & Ring Road", pincode: "110022" },
          { name: "Delhi Cantt", number: 38, code: "DL-AC-038", landmark: "Gopinath Bazar & Kirby Place", pincode: "110010" }
        ]
      },
      {
        name: "Central Delhi",
        code: "DL_CDL",
        acs: [
          { name: "Chandni Chowk AC", number: 20, code: "DL-AC-020", landmark: "Red Fort & Town Hall", pincode: "110006" },
          { name: "Matia Mahal", number: 21, code: "DL-AC-021", landmark: "Jama Masjid Outer Gate", pincode: "110006" },
          { name: "Karol Bagh", number: 23, code: "DL-AC-023", landmark: "Ajmal Khan Road", pincode: "110005" }
        ]
      },
      {
        name: "South Delhi",
        code: "DL_SDL",
        acs: [
          { name: "Greater Kailash", number: 50, code: "DL-AC-050", landmark: "GK-1 M Block Market", pincode: "110048" },
          { name: "Malviya Nagar", number: 43, code: "DL-AC-043", landmark: "Saket Metro Corridor", pincode: "110017" },
          { name: "Hauz Khas", number: 42, code: "DL-AC-042", landmark: "IIT Delhi Gate & Aurobindo Marg", pincode: "110016" }
        ]
      },
      {
        name: "North Delhi",
        code: "DL_NOD",
        acs: [
          { name: "Timarpur", number: 3, code: "DL-AC-003", landmark: "Delhi University North Campus", pincode: "110007" },
          { name: "Adarsh Nagar", number: 4, code: "DL-AC-004", landmark: "GT Karnal Road", pincode: "110033" }
        ]
      },
      {
        name: "West Delhi",
        code: "DL_WDL",
        acs: [
          { name: "Rajouri Garden", number: 27, code: "DL-AC-027", landmark: "Main Market & Ring Road", pincode: "110027" },
          { name: "Janakpuri", number: 30, code: "DL-AC-030", landmark: "District Centre Janakpuri", pincode: "110058" },
          { name: "Tilak Nagar", number: 29, code: "DL-AC-029", landmark: "Jail Road Metro Corridor", pincode: "110018" }
        ]
      },
      {
        name: "South West Delhi",
        code: "DL_SWD",
        acs: [
          { name: "Dwarka AC", number: 33, code: "DL-AC-033", landmark: "Sector 6 Central Market", pincode: "110075" },
          { name: "Najafgarh", number: 35, code: "DL-AC-035", landmark: "Najafgarh Main Market", pincode: "110043" }
        ]
      },
      {
        name: "East Delhi",
        code: "DL_EDL",
        acs: [
          { name: "Patparganj", number: 57, code: "DL-AC-057", landmark: "Mayur Vihar Phase 1 & 2", pincode: "110091" },
          { name: "Laxmi Nagar", number: 58, code: "DL-AC-058", landmark: "Vikas Marg Metro Hub", pincode: "110092" }
        ]
      }
    ]
  },

  // 33. JAMMU AND KASHMIR
  {
    code: "JK",
    name: "Jammu and Kashmir",
    type: "UT",
    districts: [
      {
        name: "Srinagar",
        code: "JK_SRI",
        acs: [
          { name: "Hazratbal", number: 19, code: "JK-AC-019", landmark: "Hazratbal Dargah & Dal Lake Road", pincode: "190006" },
          { name: "Lal Chowk", number: 22, code: "JK-AC-022", landmark: "Ghanta Ghar & Residency Road", pincode: "190001" },
          { name: "Khanyar", number: 20, code: "JK-AC-020", landmark: "Dastgeer Sahib Shrine Area", pincode: "190003" }
        ]
      },
      {
        name: "Jammu",
        code: "JK_JAM",
        acs: [
          { name: "Jammu East", number: 76, code: "JK-AC-076", landmark: "Raghunath Temple & City Chowk", pincode: "180001" },
          { name: "Jammu West", number: 77, code: "JK-AC-077", landmark: "Bakshi Nagar & Canal Road", pincode: "180001" },
          { name: "Gandhi Nagar", number: 78, code: "JK-AC-078", landmark: "Gole Market Gandhi Nagar", pincode: "180004" }
        ]
      },
      {
        name: "Anantnag",
        code: "JK_ANA",
        acs: [
          { name: "Anantnag AC", number: 40, code: "JK-AC-040", landmark: "Lal Chowk Anantnag", pincode: "192101" },
          { name: "Pahalgam", number: 41, code: "JK-AC-041", landmark: "Main Bazaar & Lidder Valley", pincode: "192126" }
        ]
      },
      {
        name: "Baramulla",
        code: "JK_BAR",
        acs: [
          { name: "Baramulla AC", number: 10, code: "JK-AC-010", landmark: "Old Town Bridge Road", pincode: "193101" },
          { name: "Gulmarg", number: 12, code: "JK-AC-012", landmark: "Tangmarg-Gulmarg Highway", pincode: "193403" }
        ]
      }
    ]
  },

  // 34. LADAKH
  {
    code: "LA",
    name: "Ladakh",
    type: "UT",
    districts: [
      {
        name: "Leh",
        code: "LA_LEH",
        acs: [
          { name: "Leh Town AC", number: 1, code: "LA-AC-001", landmark: "Leh Main Bazaar & Palace Road", pincode: "194101" },
          { name: "Nubra Valley AC", number: 2, code: "LA-AC-002", landmark: "Diskit Monastery Complex", pincode: "194401" }
        ]
      },
      {
        name: "Kargil",
        code: "LA_KAR",
        acs: [
          { name: "Kargil Town AC", number: 3, code: "LA-AC-003", landmark: "Main Bazaar & Suru River Bank", pincode: "194103" },
          { name: "Zanskar AC", number: 4, code: "LA-AC-004", landmark: "Padum Main Administrative Square", pincode: "194302" }
        ]
      }
    ]
  },

  // 35. LAKSHADWEEP
  {
    code: "LD",
    name: "Lakshadweep",
    type: "UT",
    districts: [
      {
        name: "Lakshadweep",
        code: "LD_LAK",
        acs: [
          { name: "Kavaratti AC", number: 1, code: "LD-AC-001", landmark: "Secretariat & Jetty Complex", pincode: "682555" },
          { name: "Agatti Island AC", number: 2, code: "LD-AC-002", landmark: "Airport Road & Eastern Jetty", pincode: "682553" },
          { name: "Andrott Island AC", number: 3, code: "LD-AC-003", landmark: "Lighthouse Precinct", pincode: "682551" }
        ]
      }
    ]
  },

  // 36. PUDUCHERRY
  {
    code: "PY",
    name: "Puducherry",
    type: "UT",
    districts: [
      {
        name: "Puducherry",
        code: "PY_PUD",
        acs: [
          { name: "Raj Bhavan", number: 8, code: "PY-AC-008", landmark: "White Town & Promenade Beach", pincode: "605001" },
          { name: "Muthialpet", number: 3, code: "PY-AC-003", landmark: "Clock Tower & Mahatma Gandhi Road", pincode: "605003" },
          { name: "Oupalam", number: 9, code: "PY-AC-009", landmark: "Subbiah Salai & Port Area", pincode: "605001" },
          { name: "Ariankuppam", number: 11, code: "PY-AC-011", landmark: "Veerampattinam Coastal Road", pincode: "605007" }
        ]
      },
      {
        name: "Karaikal",
        code: "PY_KAR",
        acs: [
          { name: "Karaikal North", number: 25, code: "PY-AC-025", landmark: "Kamaraj Salai & Church Road", pincode: "609602" },
          { name: "Karaikal South", number: 26, code: "PY-AC-026", landmark: "Ambagarathur Road", pincode: "609602" }
        ]
      },
      {
        name: "Mahe",
        code: "PY_MAH",
        acs: [
          { name: "Mahe AC", number: 29, code: "PY-AC-029", landmark: "Walkway & Tagore Park", pincode: "673310" }
        ]
      },
      {
        name: "Yanam",
        code: "PY_YAN",
        acs: [
          { name: "Yanam AC", number: 30, code: "PY-AC-030", landmark: "Gowthami Godavari Riverfront", pincode: "533464" }
        ]
      }
    ]
  }
];

async function seedComprehensiveGeography() {
  console.log("[GeoSeeder] Initiating comprehensive electoral geography synchronization...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let statesCount = 0;
    let distCount = 0;
    let acCount = 0;
    let stationCount = 0;

    for (const stateItem of COMPREHENSIVE_ELECTORAL_GEOGRAPHY) {
      // 1. Insert / Update State
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

      // 2. Insert / Update Districts
      for (const dist of stateItem.districts) {
        const distRes = await client.query(`
          INSERT INTO districts (state_id, name, code, status, data_source, data_status)
          VALUES ($1, $2, $3, 'ACTIVE', 'Election Commission of India', 'OFFICIAL_REFERENCE')
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            state_id = EXCLUDED.state_id,
            status = 'ACTIVE'
          RETURNING id, code, name
        `, [stateId, dist.name, dist.code]);

        const districtId = distRes.rows[0].id;
        distCount++;

        // 3. Insert / Update Assembly Constituencies
        for (const ac of dist.acs) {
          const acRes = await client.query(`
            INSERT INTO assembly_constituencies (state_id, district_id, name, constituency_number, code, status, data_source, data_status)
            VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'Election Commission of India', 'OFFICIAL_REFERENCE')
            ON CONFLICT (code) DO UPDATE SET
              name = EXCLUDED.name,
              constituency_number = EXCLUDED.constituency_number,
              district_id = EXCLUDED.district_id,
              state_id = EXCLUDED.state_id,
              status = 'ACTIVE'
            RETURNING id, code, name
          `, [stateId, districtId, ac.name, ac.number, ac.code]);

          const acId = acRes.rows[0].id;
          acCount++;

          // 4. Also mirror/upsert into constituencies table so generic lookups and foreign keys resolve cleanly
          const constRes = await client.query(`
            INSERT INTO constituencies (name, code, level, created_at)
            VALUES ($1, $2, 'CONSTITUENCY', CURRENT_TIMESTAMP)
            ON CONFLICT (code) DO UPDATE SET
              name = EXCLUDED.name
            RETURNING id
          `, [ac.name, ac.code]);
          const legacyConstId = constRes.rows[0].id;

          // 5. Generate 2 official designated Polling Stations for this AC
          const booths = [
            {
              name: `Booth 01 - Govt. Senior Secondary School, Main Hall, ${ac.name}`,
              code: `PS-${ac.code}-01`,
              address: `Room No. 01, Main Wing, Near ${ac.landmark}, ${dist.name}, ${stateItem.name} - ${ac.pincode}`,
              capacity: 1200
            },
            {
              name: `Booth 02 - Municipal Community Center, ${ac.name}`,
              code: `PS-${ac.code}-02`,
              address: `Ward Community Hall, North Wing, Near ${ac.landmark}, ${dist.name}, ${stateItem.name} - ${ac.pincode}`,
              capacity: 1000
            }
          ];

          for (const st of booths) {
            await client.query(`
              INSERT INTO polling_stations (name, code, address, capacity, status, state_id, district_id, assembly_constituency_id, constituency_id, created_at)
              VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, $8, CURRENT_TIMESTAMP)
              ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                address = EXCLUDED.address,
                capacity = EXCLUDED.capacity,
                state_id = EXCLUDED.state_id,
                district_id = EXCLUDED.district_id,
                assembly_constituency_id = EXCLUDED.assembly_constituency_id,
                constituency_id = EXCLUDED.constituency_id
            `, [st.name, st.code, st.address, st.capacity, stateId, districtId, acId, legacyConstId]);
            stationCount++;
          }
        }
      }
    }

    await client.query("COMMIT");
    console.log(`[GeoSeeder] Synchronization complete!`);
    console.log(`  - States/UTs verified: ${statesCount}`);
    console.log(`  - Districts synchronized: ${distCount}`);
    console.log(`  - Assembly Constituencies synchronized: ${acCount}`);
    console.log(`  - Designated Polling Stations synchronized: ${stationCount}`);
    return { statesCount, distCount, acCount, stationCount };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[GeoSeeder] Fatal error during seeding:", err);
    throw err;
  } finally {
    client.release();
    if (require.main === module) {
      pool.end();
    }
  }
}

if (require.main === module) {
  seedComprehensiveGeography().then(() => {
    console.log("[GeoSeeder] Script finished successfully.");
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = { seedComprehensiveGeography, COMPREHENSIVE_ELECTORAL_GEOGRAPHY };
