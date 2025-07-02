// pages/api/hello.js
// This is your API endpoint at /api/hello
import { SecretVaultWrapper } from "secretvaults";

// DID: did:nil:testnet:nillion194klt5w2cqu6ftz3lkkkns7rcss67m7k8eyzea
// Public Key: 02b10d940ffba1ac34ba0d9c84e95931e41c97649f397d4ef506e75da0ecbdc741
// Private Key: e9f2ecea77d9edd325b48c5441a1074487ef7d7e7c9c266ff352dcad23433e6f

const orgConfig = {
  orgCredentials: {
    secretKey: "e9f2ecea77d9edd325b48c5441a1074487ef7d7e7c9c266ff352dcad23433e6f", // process.env.NILLION_ORG_SECRET_KEY,
    orgDid: "did:nil:testnet:nillion194klt5w2cqu6ftz3lkkkns7rcss67m7k8eyzea" // process.env.NILLION_ORG_DID,
  },
  nodes: [
    {
      url: "https://nildb-nx8v.nillion.network",
      did: "did:nil:testnet:nillion1qfrl8nje3nvwh6cryj63mz2y6gsdptvn07nx8v",
    },
    {
      url: "https://nildb-p3mx.nillion.network",
      did: "did:nil:testnet:nillion1uak7fgsp69kzfhdd6lfqv69fnzh3lprg2mp3mx",
    },
    {
      url: "https://nildb-rugk.nillion.network",
      did: "did:nil:testnet:nillion1kfremrp2mryxrynx66etjl8s7wazxc3rssrugk",
    },
  ],
};

const SCHEMA_ID = "839800f5-e79b-456b-a9d5-ccfaeab8a0bf";

const web3ExperienceSurveyData = [
  {
    years_in_web3: { "%allot": 4 },
    responses: [
      { rating: 5, question_number: 1 },
      { rating: 3, question_number: 2 },
    ],
  },
  {
    years_in_web3: { "%allot": 1 },
    responses: [
      { rating: 2, question_number: 1 },
      { rating: 4, question_number: 2 },
    ],
  },
];

export default async function handler(req, res) {

  switch (req.method) {
    case 'GET':
      try {
        const collection = new SecretVaultWrapper(
          orgConfig.nodes,
          orgConfig.orgCredentials,
          SCHEMA_ID,
        );
        await collection.init();

        const dataWritten = await collection.writeToNodes(web3ExperienceSurveyData);
        console.log("dataWritten", dataWritten);

        const newIds = [
          ...new Set(dataWritten.flatMap((item) => item.data.created)),
        ];
        console.log("created ids:", newIds);

        const dataRead = await collection.readFromNodes({});
        console.log("📚 total records:", dataRead.length);
        console.log(
          "📚 Read new records:",
          dataRead.slice(0, web3ExperienceSurveyData.length),
        );

        res.status(201).json({ 
          success: true, 
          message: `${web3ExperienceSurveyData.length} records created successfully`,
        });
      } catch (error) {
        console.error("❌ Failed to use SecretVaultWrapper:", error.message);
        res.status(201).json({ 
          success: false, 
          message: error.message || "An error occurred while processing your request."
        });
      }
      break;
    
    default:
      // Method not allowed
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} not allowed` 
      });
  }
}