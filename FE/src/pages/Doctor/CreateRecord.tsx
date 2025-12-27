import { useState } from "react";
import { createMedicalRecord } from "../../services/api";
import { MedicalRecordPayload } from "../../types/medical";
import { JsonRpcSigner } from "ethers";

interface Props {
  signer: JsonRpcSigner;
  doctorAddress: string;
}

export default function CreateRecord({ signer, doctorAddress }: Props) {
  const [form, setForm] = useState<MedicalRecordPayload>({
    patient_address: "",
    doctor_address: doctorAddress,
    diagnosis: "",
    treatment: "",
  });

  const submit = async () => {
    const res = await createMedicalRecord(form, signer);
    alert("Record created!");
    console.log(res);
  };

  return (
    <div>
      <h2>Create Medical Record</h2>

      <input
        placeholder="Patient Address"
        onChange={(e) =>
          setForm({ ...form, patient_address: e.target.value })
        }
      />

      <input
        placeholder="Diagnosis"
        onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
      />

      <input
        placeholder="Treatment"
        onChange={(e) => setForm({ ...form, treatment: e.target.value })}
      />

      <button onClick={submit}>Submit</button>
    </div>
  );
}
