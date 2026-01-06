import { useState } from "react";
import { createMedicalRecord, uploadFileToIPFS } from "../../services/api";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIpfsHash(null); // Reset IPFS hash when file changes
    }
  };

  const submit = async () => {
    setUploading(true);
    try {
      let fileIpfsHash = null;

      // Upload file to IPFS if file is selected
      if (selectedFile) {
        try {
          console.log("=== MULAI UPLOAD FILE ===");
          console.log("File name:", selectedFile.name);
          console.log("File size:", selectedFile.size, "bytes");
          console.log("File type:", selectedFile.type);
          
          const uploadResult = await uploadFileToIPFS(selectedFile, signer);
          fileIpfsHash = uploadResult.ipfsHash;
          setIpfsHash(fileIpfsHash);
          console.log("=== UPLOAD BERHASIL ===");
          console.log("IPFS Hash:", fileIpfsHash);
        } catch (error: any) {
          console.error("=== UPLOAD GAGAL ===");
          console.error("Full error object:", error);
          console.error("Error response:", error?.response);
          console.error("Error response data:", error?.response?.data);
          
          let errorMsg = "Unknown error";
          if (error?.response?.data?.error) {
            errorMsg = error.response.data.error;
          } else if (error?.response?.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error?.message) {
            errorMsg = error.message;
          }
          
          const fullError = JSON.stringify(error?.response?.data || error, null, 2);
          console.error("Full error details:", fullError);
          
          alert(`Gagal mengupload file ke IPFS:\n\n${errorMsg}\n\nPeriksa console untuk detail lebih lanjut.\n\nApakah Anda ingin melanjutkan tanpa file?`);
          // User can choose to continue without file upload
        }
      }

      // Submit medical record
      console.log("Membuat medical record...");
      const res = await createMedicalRecord(form, signer);
      alert("Record created! " + (fileIpfsHash ? `\nFile IPFS Hash: ${fileIpfsHash}` : ""));
      console.log("Medical record created:", res);
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

      <div>
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
        {uploading ? "Uploading..." : "Submit"}
      </button>
    </div>
  );
}
