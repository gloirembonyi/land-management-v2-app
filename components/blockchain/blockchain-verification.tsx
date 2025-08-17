"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, CheckCircle, AlertTriangle, Clock, ExternalLink, Copy } from "lucide-react"
import { useNotifications } from "@/components/notifications/notification-provider"

interface BlockchainVerificationProps {
  transactionHash?: string
  landId?: string
  onVerificationComplete?: (result: VerificationResult) => void
}

interface VerificationResult {
  isValid: boolean
  blockNumber: number
  timestamp: string
  confirmations: number
  gasUsed: string
  status: "verified" | "pending" | "failed"
}

export function BlockchainVerification({
  transactionHash,
  landId,
  onVerificationComplete,
}: BlockchainVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const { showNotification } = useNotifications()

  const handleVerification = async () => {
    setIsVerifying(true)
    setVerificationProgress(0)

    // Simulate blockchain verification process
    const steps = [
      { message: "Connecting to blockchain network...", progress: 20 },
      { message: "Validating transaction hash...", progress: 40 },
      { message: "Checking block confirmations...", progress: 60 },
      { message: "Verifying smart contract...", progress: 80 },
      { message: "Finalizing verification...", progress: 100 },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setVerificationProgress(step.progress)
      showNotification(step.message, "info", 2000)
    }

    // Mock verification result
    const result: VerificationResult = {
      isValid: Math.random() > 0.1, // 90% success rate
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      timestamp: new Date().toISOString(),
      confirmations: Math.floor(Math.random() * 100) + 12,
      gasUsed: (Math.random() * 50000 + 21000).toFixed(0),
      status: Math.random() > 0.1 ? "verified" : "failed",
    }

    setVerificationResult(result)
    setIsVerifying(false)

    if (result.isValid) {
      showNotification("Blockchain verification successful!", "success")
    } else {
      showNotification("Blockchain verification failed", "error")
    }

    onVerificationComplete?.(result)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showNotification("Copied to clipboard", "success")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-[#69d259]" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "failed":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-[#c6ecc5] shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#17412b] flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>Verify land ownership and transactions on the blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Hash Input */}
        {transactionHash && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#17412b]">Transaction Hash</label>
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-[#f2faf4] to-[#e5eee9] rounded-lg border border-[#c6ecc5]">
              <code className="flex-1 text-xs font-mono text-[#17412b] break-all">{transactionHash}</code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(transactionHash)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Land ID */}
        {landId && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#17412b]">Land ID</label>
            <div className="p-3 bg-gradient-to-r from-[#f2faf4] to-[#e5eee9] rounded-lg border border-[#c6ecc5]">
              <code className="text-sm font-mono text-[#17412b]">{landId}</code>
            </div>
          </div>
        )}

        {/* Verification Progress */}
        {isVerifying && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#17412b]">Verifying on blockchain...</span>
              <span className="text-sm text-gray-600">{verificationProgress}%</span>
            </div>
            <Progress value={verificationProgress} className="h-2" />
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f2faf4] to-[#e5eee9] rounded-lg border border-[#c6ecc5]">
              <div className="flex items-center space-x-3">
                {getStatusIcon(verificationResult.status)}
                <div>
                  <p className="font-medium text-[#17412b]">
                    {verificationResult.isValid ? "Verification Successful" : "Verification Failed"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {verificationResult.isValid
                      ? "Transaction is valid and confirmed on blockchain"
                      : "Transaction could not be verified"}
                  </p>
                </div>
              </div>
              <Badge
                className={verificationResult.isValid ? "bg-[#69d259] hover:bg-[#69d259]" : ""}
                variant={verificationResult.isValid ? "default" : "destructive"}
              >
                {verificationResult.status}
              </Badge>
            </div>

            {verificationResult.isValid && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] rounded-lg">
                  <p className="text-xs text-gray-500">Block Number</p>
                  <p className="font-mono text-sm text-[#17412b]">{verificationResult.blockNumber.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] rounded-lg">
                  <p className="text-xs text-gray-500">Confirmations</p>
                  <p className="font-mono text-sm text-[#17412b]">{verificationResult.confirmations}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] rounded-lg">
                  <p className="text-xs text-gray-500">Gas Used</p>
                  <p className="font-mono text-sm text-[#17412b]">{verificationResult.gasUsed}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] rounded-lg">
                  <p className="text-xs text-gray-500">Timestamp</p>
                  <p className="font-mono text-xs text-[#17412b]">
                    {new Date(verificationResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleVerification}
            disabled={isVerifying}
            className="flex-1 bg-gradient-to-r from-[#17412b] to-[#69d259] hover:from-[#69d259] hover:to-[#17412b] text-white"
          >
            {isVerifying ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify on Blockchain
              </>
            )}
          </Button>
          {verificationResult?.isValid && (
            <Button
              variant="outline"
              className="border-[#69d259] text-[#17412b] hover:bg-[#69d259] hover:text-white bg-transparent"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
