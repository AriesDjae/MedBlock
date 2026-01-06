import { getSigner } from './web3';

export async function uploadJsonToIpfs(data: any) {
  // Get signer for authentication
  const signer = await getSigner();
  const address = await signer.getAddress();

  // Create signature for authentication
  const message = "Medblock IPFS Upload";
  console.log('Creating signature for IPFS upload:', { address, message });
  const signature = await signer.signMessage(message);
  console.log('Signature created:', signature);

  // Call backend IPFS endpoint
  const res = await fetch('http://localhost:8080/api/ipfs/upload-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Message': message,
      'X-Signature': signature,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
    console.error('IPFS Upload failed:', {
      status: res.status,
      statusText: res.statusText,
      error: errorData
    });
    throw new Error(`Backend IPFS upload failed: ${errorData.error || res.statusText}`);
  }

  const result = await res.json();
  return result.ipfsHash as string;
}


