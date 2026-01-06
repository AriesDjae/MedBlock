/**
 * IPFS Upload Service
 *
 * SEMUA upload IPFS HARUS menggunakan backend Pinata.
 * JANGAN gunakan Web3 Storage atau service IPFS lain.
 *
 * Backend endpoint: POST /api/ipfs/upload
 * Backend akan mengupload ke Pinata dan mengembalikan IPFS hash.
 */

import { uploadFileToIPFS } from "./api";
import { JsonRpcSigner } from "ethers";

/**
 * Upload JSON data to IPFS via backend Pinata
 *
 * NOTE: Ini menggunakan backend Pinata (tidak langsung ke Pinata dari frontend)
 *
 * @param data - JSON data to upload
 * @param signer - Ethers signer for authentication
 * @returns IPFS hash (CID)
 */
export async function uploadJsonToIpfs(
  data: any,
  signer: JsonRpcSigner
): Promise<string> {
  // Convert JSON to Blob, then to File
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: "application/json" });
  const file = new File([blob], "data.json", { type: "application/json" });

  // Use backend Pinata upload service (via api.ts)
  const result = await uploadFileToIPFS(file, signer);
  return result.ipfsHash;
}
