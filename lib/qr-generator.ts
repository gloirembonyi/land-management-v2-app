// QR Code generation utilities for land trading

export class QRCodeGenerator {
  static generateLandSaleQR(landId: string, blockchainHash: string): string {
    // Generate a unique QR code for land sale
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `LAND_${landId.slice(0, 8)}_${blockchainHash.slice(0, 8)}_${randomSuffix}`
  }

  static generateTransactionQR(transactionId: string, landId: string): string {
    // Generate a unique QR code for transaction
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `TXN_${transactionId.slice(0, 8)}_${landId.slice(0, 8)}_${randomSuffix}`
  }

  static generateBlockchainHash(type: "land" | "transaction", id: string): string {
    // Generate a blockchain-style hash
    const timestamp = Date.now()
    const randomData = Math.random().toString(36).substr(2, 16)
    const prefix = type === "land" ? "BLK_LAND" : "BLK_TXN"
    return `${prefix}_${timestamp}_${id.slice(0, 8)}_${randomData}`.toUpperCase()
  }

  static validateQRCode(qrCode: string): { isValid: boolean; type: "land" | "transaction" | "unknown" } {
    if (qrCode.startsWith("LAND_")) {
      return { isValid: true, type: "land" }
    }
    if (qrCode.startsWith("TXN_")) {
      return { isValid: true, type: "transaction" }
    }
    return { isValid: false, type: "unknown" }
  }
}
