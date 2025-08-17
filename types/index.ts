export interface User {
  id: string
  name: string
  email: string
  nidaId: string
  role: "citizen" | "abunzi" | "admin"
  biometricData?: string
  isVerified?: boolean
  verifiedBy?: string
  verifiedAt?: Date
}

export interface LandParcel {
  id: string
  title: string
  location: string
  coordinates: [number, number]
  area: number
  owner: string
  status: "verified" | "pending" | "disputed"
  blockchainHash: string
  value: number
  documents: Document[]
}

export interface Transaction {
  id: string
  type: "sale" | "purchase" | "inheritance" | "mortgage"
  landId: string
  buyer: string
  seller: string
  amount: number
  status: "pending" | "completed" | "failed"
  smartContractAddress: string
  signatures: DigitalSignature[]
  blockchainTxHash: string
}

export interface DigitalSignature {
  signer: string
  signature: string
  timestamp: string
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
}
