import { BrowserProvider } from "ethers";
import { MEDBLOC_CONTRACT } from "../contracts/medbloc";

export async function connectWallet() {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("MetaMask belum terpasang");

  // request connect
  await eth.request({ method: "eth_requestAccounts" });

  // pastikan chain sepolia
  const provider = new BrowserProvider(eth);
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== MEDBLOC_CONTRACT.chainId) {
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + MEDBLOC_CONTRACT.chainId.toString(16) }],
      });
    } catch (e: any) {
      if (e?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x" + MEDBLOC_CONTRACT.chainId.toString(16),
              chainName: "Sepolia",
              nativeCurrency: { name: "SepoliaETH", symbol: "SEP", decimals: 18 },
              rpcUrls: ["https://sepolia.infura.io/v3/84ef37913efc49d6b74737dfe3e6a485"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw e;
      }
    }
  }

  // balik lagi setelah switch
  return new BrowserProvider(eth);
}

export async function getSigner() {
  const provider = await connectWallet();
  return provider.getSigner();
}
