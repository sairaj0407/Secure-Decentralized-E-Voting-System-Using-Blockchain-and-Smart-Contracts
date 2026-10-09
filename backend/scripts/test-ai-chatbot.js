const http = require("http");

async function postChat(payload) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(payload), "utf8");
    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/ai/chat",
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": data.length
      }
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        try {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error("JSON Parse Error: " + e.message));
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("========================================================================");
  console.log("ECI STATUTORY AI PUBLIC INFORMATION SYSTEM — FULL TEST SUITE");
  console.log("========================================================================\n");

  const testCases = [
    {
      name: "1. Official English Statutory Greeting & Mandate",
      payload: { message: "Official Greeting", language: "en" },
      validator: res => res.success && res.response.includes("Election Commission of India") && res.response.includes("324")
    },
    {
      name: "2. Official Hindi Statutory Greeting",
      payload: { message: "नमस्ते", language: "hi" },
      validator: res => res.success && res.response.includes("भारत निर्वाचन आयोग") && res.response.includes("अनुच्छेद 324")
    },
    {
      name: "3. Official Marathi Statutory Greeting",
      payload: { message: "नमस्कार", language: "mr" },
      validator: res => res.success && res.response.includes("भारत निवडणूक आयोग") && res.response.includes("अनुच्छेद 324")
    },
    {
      name: "4. Constitutional Mandate (Articles 324-329 & RPA 1951)",
      payload: { message: "Explain Article 324, Article 326, Article 329 and Section 128 of RPA 1951", language: "en" },
      validator: res => res.success && res.response.includes("Article 324") && res.response.includes("Article 326")
    },
    {
      name: "5. Official Statutory Forms (Forms 6, 7, 8, 17A, 17C, 21C)",
      payload: { message: "What are Form 6, Form 7, Form 8, Form 17C, and Form 21C?", language: "en" },
      validator: res => res.success && res.response.includes("Form 6") && res.response.includes("Form 17C")
    },
    {
      name: "6. Blockchain Consensus & Triple-Tier Double-Voting Lockout",
      payload: { message: "How does the blockchain smart contract and database prevent double voting?", language: "en" },
      validator: res => res.success && res.response.includes("Tier 1") && res.response.includes("EVoting.sol") && res.response.includes("hasVoted")
    },
    {
      name: "7. Rule 49M Step-by-Step Balloting Guide in Marathi",
      payload: { message: "मतदान कसे करावे? अधिकृत पायऱ्या सांगा", language: "mr" },
      validator: res => res.success && res.response.includes("मतदान") && res.response.includes("VVPAT")
    },
    {
      name: "8. Live System Infrastructure & Node Telemetry Audit",
      payload: { message: "What is the live system and blockchain status?", language: "en" },
      validator: res => res.success && res.response.includes("Block #") && res.response.includes("PostgreSQL")
    },
    {
      name: "9. Live Active Elections Gazette & Candidates Query",
      payload: { message: "Show active elections open for voting", language: "en" },
      validator: res => res.success && res.response.includes("Gazette") && res.response.includes("Candidate")
    },
    {
      name: "10. Real VVPAT Cryptographic Receipt Audit (Rule 49MA)",
      payload: { message: "Audit receipt REC-7AD63FC7BED761E7", language: "en" },
      validator: res => res.success && res.response.includes("REC-7AD63FC7BED761E7") && res.response.includes("NIKET") && res.response.includes("49MA")
    },
    {
      name: "11. Desktop Application Architecture & Admin Workflows",
      payload: { message: "Explain the desktop application architecture, microservices, and end-to-end admin workflow", language: "en" },
      validator: res => res.success && res.response.includes("Electron") && res.response.includes("Administrative") && res.response.includes("PostgreSQL")
    }
  ];

  let passed = 0;
  for (const tc of testCases) {
    try {
      const res = await postChat(tc.payload);
      const isOk = tc.validator(res);
      if (isOk) {
        console.log(`[PASS] ${tc.name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${tc.name}`);
        console.error("Response:", JSON.stringify(res, null, 2));
      }
    } catch (err) {
      console.error(`[ERROR] ${tc.name}: ${err.message}`);
    }
  }

  console.log(`\n========================================================================`);
  console.log(`VERIFICATION RESULT: ${passed}/${testCases.length} Tests Passed`);
  console.log(`========================================================================\n`);

  if (passed === testCases.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
