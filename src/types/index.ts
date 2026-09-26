export interface User {
  id: string;
  name: string;
  email: string;
  nationalId: string;
  avatar: string | null;
  role: string;
  isVerified: boolean;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  createdAt: Date | string;
}

export interface Parcel {
  upi: string;
  size: string;
  use: string;
  district: string;
  sector: string | null;
  cell: string | null;
  village: string | null;
  location: string;
  status: string;
  ownerName: string;
  imageUrl: string;
  price: string | null;
  isVerified: boolean;
  verifiedAt: Date | string | null;
  certificateId: string | null;
  documents: string | null;
  coordinates: string | null;
  userId: string | null;
  createdAt: Date | string;
}

export interface Transaction {
  id: string;
  title: string;
  upi: string;
  type: string;
  status: string;
  date: string;
  step: string;
  progress: number;
  sellerName?: string | null;
  buyerName?: string | null;
  price?: string | null;
  txHash?: string | null;
  blockNumber?: number | null;
  previousHash?: string | null;
  gasFee?: string | null;
  createdAt: Date | string;
}

export interface Dispute {
  id: string;
  upi: string;
  type: string;
  status: string;
  dateOpened: string;
  parties: string;
  description: string;
  location: string;
  createdAt: Date | string;
}
