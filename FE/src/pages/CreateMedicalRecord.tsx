import { useState } from "react";
import { connectWallet } from "../utils/wallet";
import { createMedicalRecord, uploadFileToIPFS } from "../services/api";
import { JsonRpcSigner } from "ethers";

export default function CreateMedicalRecord() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  const connect = async () => {
    const { signer, address } = await connectWallet();
    setSigner(signer);
    setWallet(address);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIpfsHash(null); // Reset IPFS hash when file changes
    }
  };

  const submit = async () => {
    if (!signer || !wallet) {
      alert("Wallet belum terhubung");
      return;
    }

    setUploading(true);
    try {
      let fileIpfsHash = null;

      // Upload file to IPFS if file is selected
      if (selectedFile) {
        try {
          console.log("Mengupload file ke IPFS:", selectedFile.name);
          const uploadResult = await uploadFileToIPFS(selectedFile, signer);
          fileIpfsHash = uploadResult.ipfsHash;
          setIpfsHash(fileIpfsHash);
          console.log("File berhasil diupload ke IPFS:", fileIpfsHash);
        } catch (error: any) {
          console.error("Error uploading file to IPFS:", error);
          const errorMsg = error?.response?.data?.error || error?.message || "Unknown error";
          alert(`Gagal mengupload file ke IPFS: ${errorMsg}\n\nApakah Anda ingin melanjutkan tanpa file?`);
          // User can choose to continue without file upload
        }
      }

      const payload = {
        patient_address: "0xPatientAddress",
        doctor_address: wallet,
        diagnosis: "Flu",
        treatment: "Rest and medication",
      };

      console.log("Membuat medical record...");
      const res = await createMedicalRecord(payload, signer);
      alert("Success! Hash: " + res.hash + (fileIpfsHash ? `\nFile IPFS Hash: ${fileIpfsHash}` : ""));
    } catch (error: any) {
      console.error("Error creating record:", error);
      const errorMsg = error?.response?.data?.error || error?.message || "Unknown error";
      alert(`Gagal membuat record medis: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Create Medical Record</h2>

      {!wallet ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {wallet}</p>
          
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <label>
              Upload File (opsional):
              <input
                type="file"
                onChange={handleFileChange}
                style={{ marginLeft: "10px" }}
              />
            </label>
            {selectedFile && (
              <p style={{ fontSize: "0.9em", color: "#666" }}>
                File dipilih: {selectedFile.name}
              </p>
            )}
            {ipfsHash && (
              <p style={{ fontSize: "0.9em", color: "#4CAF50" }}>
                File berhasil diupload ke IPFS: {ipfsHash}
              </p>
            )}
          </div>

          <button onClick={submit} disabled={uploading}>
            {uploading ? "Uploading..." : "Submit Medical Record"}
          </button>
        </>
      )}
    </div>
  );
}
