import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define what our Global Brain knows
interface WalletContextType {
  walletAddress: string | null;
  userRole: 'patient' | 'doctor' | null;
  connectWallet: () => Promise<void>;
  login: (role: 'patient' | 'doctor') => void;
  logout: () => void;
  isLoading: boolean; // Added this to prevent flickering while checking storage
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

// The Provider wraps your whole app
export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ON LOAD: Check if we remember the user from last time
  useEffect(() => {
    const savedRole = localStorage.getItem('medBlockUserRole');
    const savedAddress = localStorage.getItem('medBlockWallet');

    if (savedRole && savedAddress) {
      setUserRole(savedRole as 'patient' | 'doctor');
      setWalletAddress(savedAddress);
    }
    setIsLoading(false);
  }, []);

  // 2. ROBUST WALLET CONNECTION
  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      alert("MetaMask is not detected! Please install it.");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      // Save address to storage
      localStorage.setItem('medBlockWallet', accounts[0]);
      console.log("Connected:", accounts[0]);
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  // 3. LOGIN: Save the role to storage
  const login = (role: 'patient' | 'doctor') => {
    setUserRole(role);
    localStorage.setItem('medBlockUserRole', role); // <--- SAVES TO DISK
  };

  // 4. LOGOUT: Clear storage
  const logout = () => {
    setWalletAddress(null);
    setUserRole(null);
    localStorage.removeItem('medBlockUserRole'); // <--- WIPES DISK
    localStorage.removeItem('medBlockWallet');
    window.location.href = "/"; // Force redirect to home
  };

  return (
    <WalletContext.Provider value={{ walletAddress, userRole, connectWallet, login, logout, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
}

// Helper hook to use the brain easily
export const useWallet = () => useContext(WalletContext);