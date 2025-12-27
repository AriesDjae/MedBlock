import { useState } from "react";
import { connectWallet } from "../utils/wallet";
import { createMedicalRecord } from "../services/api";

export default function CreateMedicalRecord() {
  const [wallet, setWallet] = useState(null);
  const [signer, setSigner] = useState(null);

  const connect = async () => {
    const { signer, address } = await connectWallet();
    setSigner(signer);
    setWallet(address);
  };

  const submit = async () => {
    const payload = {
      patient_address: "0xPatientAddress",
      doctor_address: wallet,
      diagnosis: "Flu",
      treatment: "Rest and medication",
    };

    const res = await createMedicalRecord(payload, signer);
    alert("Success! Hash: " + res.hash);
  };

  return (
    <div>
      <h2>Create Medical Record</h2>

      {!wallet ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {wallet}</p>
          <button onClick={submit}>Submit Medical Record</button>
        </>
      )}
    </div>
  );
}
