export const revalidate = 0;
export const dynamic = "force-dynamic";

import { SecretVaultWrapper } from "secretvaults";

export const orgConfig = {
  orgCredentials: {
    secretKey:
      "fa29329c7c37e2f3e2a2c0f3ec0cd51d2219993333b49a77d3a5a10a28faa428",
    orgDid: "did:nil:testnet:nillion1nmc3ledde2f3fn6g3v3j3uevyucwjlwea5wmha",
  },
  // demo node config
  nodes: [
    {
      url: "https://nildb-a50d.nillion.network",
      did: "did:nil:testnet:nillion15lcjxgafgvs40rypvqu73gfvx6pkx7ugdja50d",
    },
    {
      url: "https://nildb-dvml.nillion.network",
      did: "did:nil:testnet:nillion1dfh44cs4h2zek5vhzxkfvd9w28s5q5cdepdvml",
    },
    {
      url: "https://nildb-guue.nillion.network",
      did: "did:nil:testnet:nillion19t0gefm7pr6xjkq2sj40f0rs7wznldgfg4guue",
    },
  ],
};

export async function getHealthData(schemaId) {
  const svWrapper = new SecretVaultWrapper(
    orgConfig.nodes,
    orgConfig.orgCredentials,
    schemaId
  );

  console.log("[SVWRAPPER]", svWrapper);

  await svWrapper.init();

  // const tokens = await svWrapper.generateTokensForAllNodes();
  // console.log("TOKENS", tokens);

  return svWrapper;
}

export async function writeHealthData(schemaId, data) {
  const collection = await getHealthData(schemaId);

  // console.log("[COLLECTION]", JSON.stringify(collection.nodesJwt));

  return collection.writeToNodes(data);
}

export async function readHealthData(schemaId, query = {}) {
  const collection = await getHealthData(schemaId);

  return collection.readFromNodes(query);
}
