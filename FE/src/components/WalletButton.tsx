interface Props {
    address: string | null;
    onConnect: () => void;
  }
  
  export default function WalletButton({ address, onConnect }: Props) {
    return (
      <button onClick={onConnect}>
        {address
          ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connect Wallet"}
      </button>
    );
  }
  