export async function uploadJsonToIpfs(data: any) {
  const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN as string | undefined;

  if (!token) {
    throw new Error(
      'VITE_WEB3_STORAGE_TOKEN is not set. Please add it to your .env file to enable IPFS uploads.'
    );
  }

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

  const res = await fetch('https://api.web3.storage/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: blob,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IPFS upload failed: ${text}`);
  }

  const json = await res.json();
  // web3.storage returns { cid: "..." }
  return json.cid as string;
}


