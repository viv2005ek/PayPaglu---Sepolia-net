export interface User {
  username: string;
  phoneNumber: string;
  walletAddress: string;
  exists: boolean;
}

export interface Transaction {
  sender: string;
  receiver: string;
  amount: string;
  gasUsed: string;
  timestamp: string;
  method: string;
}

export interface FamilyVault {
  creator: string;
  members: string[];
  balance: string;
}