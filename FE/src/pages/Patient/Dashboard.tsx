import { useEffect, useState } from "react";
import { JsonRpcSigner } from "ethers";
import { getMedicalRecords } from "../../services/api";

export interface MedicalRecordPayload {
  patient_address: string;
  doctor_address: string;
  diagnosis: string;
  treatment: string;
  timestamp?: number;
}

interface Props {
  signer: JsonRpcSigner;
}

export default function Dashboard({ signer }: Props) {
  const [records, setRecords] = useState<MedicalRecordPayload[]>([]);

  useEffect(() => {
    if (!signer) return;

    (async () => {
      try {
        const res = await getMedicalRecords(signer);
        // backend returns { data: [...] }
        setRecords(res.data || res);
      } catch (err) {
        console.error("Failed to fetch records", err);
      }
    })();
  }, [signer]);

  return (
    <div>
      <h2>My Medical Records</h2>
      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <ul>
          {records.map((r, i) => (
            <li key={i}>
              <strong>Doctor:</strong> {r.doctor_address} <br />
              <strong>Diagnosis:</strong> {r.diagnosis} <br />
              <strong>Treatment:</strong> {r.treatment} <br />
              <strong>Timestamp:</strong> {r.timestamp || "-"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
  