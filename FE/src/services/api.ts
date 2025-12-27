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

export async function loginUser(signer: JsonRpcSigner) {
  const message = "Medblock Authentication";
  const signature = await signer.signMessage(message);

  const res = await axios.post(`${API_URL.replace('/api','')}/api/login`, {}, {
    headers: {
      "X-Message": message,
      "X-Signature": signature,
    },
  });

  return res.data;
}
