import { BrowserProvider, JsonRpcSigner } from "ethers";

export interface WalletContext {
  signer: JsonRpcSigner;
  address: string;
}

export async function connectWallet(): Promise<WalletContext> {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  // Request account access first to ensure MetaMask prompt appears
  try {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
  } catch (err) {
    throw new Error("User denied account access");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { signer, address };
}
