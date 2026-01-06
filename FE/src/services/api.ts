import axios from "axios";
import { JsonRpcSigner } from "ethers";
import { MedicalRecordPayload } from "../types/medical";

const API_URL = "http://localhost:8080/api";

export async function createMedicalRecord(
  payload: MedicalRecordPayload,
  signer: JsonRpcSigner
) {
  const message = "Medblock Authentication";
  const signature = await signer.signMessage(message);

  const res = await axios.post(`${API_URL}/medical-record`, payload, {
    headers: {
      "X-Message": message,
      "X-Signature": signature,
    },
  });

  return res.data;
}

export async function getMedicalRecords(signer: JsonRpcSigner) {
  const message = "Medblock Authentication";
  const signature = await signer.signMessage(message);

  const res = await axios.get(`${API_URL}/medical-record`, {
    headers: {
      "X-Message": message,
      "X-Signature": signature,
    },
  });

  return res.data;
}

export async function getServices() {
  const res = await axios.get(`${API_URL.replace('/api','')}/api/services`);
  return res.data;
}

export async function registerUser(signer: JsonRpcSigner, name?: string) {
  const message = "Medblock Authentication";
  const signature = await signer.signMessage(message);

  const res = await axios.post(`${API_URL.replace('/api','')}/api/register`, { name }, {
    headers: {
      "X-Message": message,
      "X-Signature": signature,
    },
  });

  return res.data;
}

export async function requestNonce(wallet: string) {
  const res = await axios.post(`${API_URL.replace('/api','')}/api/nonce`, { wallet });
  return res.data;
}

export async function loginUser(signer: JsonRpcSigner) {
  const address = await signer.getAddress();
  const { nonce } = await requestNonce(address);
  const signature = await signer.signMessage(nonce);

  const res = await axios.post(`${API_URL.replace('/api','')}/api/login`, {}, {
    headers: {
      "X-Message": nonce,
      "X-Signature": signature,
    },
  });

  return res.data;
}

/**
 * Upload file to IPFS via backend Pinata
 * 
 * IMPORTANT: Semua IPFS upload HARUS melalui backend ini.
 * Backend akan mengupload ke Pinata dan mengembalikan IPFS hash.
 * JANGAN gunakan service IPFS lain seperti Web3 Storage.
 * 
 * @param file - File to upload
 * @param signer - Ethers signer for authentication
 * @returns Object dengan ipfsHash
 */
export async function uploadFileToIPFS(
  file: File,
  signer: JsonRpcSigner
): Promise<{ ipfsHash: string }> {
  try {
    const message = "Medblock Authentication";
    console.log("Signing message for IPFS upload...");
    const signature = await signer.signMessage(message);
    console.log("Signature created, preparing FormData...");

    const formData = new FormData();
    formData.append("file", file);
    console.log("FormData created with file:", file.name, "size:", file.size);

    // Jangan set Content-Type secara manual, biarkan axios handle boundary untuk multipart/form-data
    // Backend endpoint: POST /api/ipfs/upload (akan upload ke Pinata)
    console.log("Sending request to backend:", `${API_URL}/ipfs/upload`);
    const res = await axios.post(`${API_URL}/ipfs/upload`, formData, {
      headers: {
        "X-Message": message,
        "X-Signature": signature,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log("Upload response received:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Upload error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      headers: error?.response?.headers,
    });
    throw error;
  }
}
