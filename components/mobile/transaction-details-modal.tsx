"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calendar, User, CreditCard, Hash, QrCode, Copy, CheckCircle } from "lucide-react"

interface Transaction {
  id: string
  land_id: string
  buyer_id: string
  seller_id: string
  amount: number
  status: "pending" | "payment_verification" | "completed" | "rejected"
  created_at: string
  updated_at: string
  land_title?: string
  buyer_name?: string
  seller_name?: string
  qr_code?: string
  blockchain_hash?: string
}

interface TransactionDetailsModalProps {
  transaction: Transaction
  onClose: () => void
  currentUserId: string
}

export function TransactionDetailsModal({ transaction, onClose, currentUserId }: TransactionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const isBuyer = transaction.buyer_id === currentUserId
  const isSeller = transaction.seller_id === currentUserId

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#69d259] text-white"
      case "pending":
        return "bg-blue-500 text-white"
      case "payment_verification":
        return "bg-yellow-500 text-white"
      case "rejected":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "payment_verification":
        return "Payment Verification"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Transaction Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Badge className={`${getStatusColor(transaction.status)} rounded-full px-3 py-1 text-sm w-fit`}>
            {getStatusText(transaction.status)}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Transaction Type */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#17412b] rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{isBuyer ? "Land Purchase" : "Land Sale"}</h3>
              <p className="text-sm text-gray-600">{transaction.land_title || `Land ID: ${transaction.land_id}`}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Transaction Amount</p>
            <p className="text-2xl font-bold text-[#17412b]">{(transaction.amount / 1000000).toFixed(1)}M RWF</p>
          </div>

          {/* Parties */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Seller</p>
                <p className="font-medium text-gray-900">{transaction.seller_name || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Buyer</p>
                <p className="font-medium text-gray-900">{transaction.buyer_name || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">{new Date(transaction.created_at).toLocaleString()}</p>
              </div>
            </div>
            {transaction.updated_at !== transaction.created_at && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">{new Date(transaction.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* QR Code */}
          {transaction.qr_code && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-600">QR Code</p>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                <code className="flex-1 text-xs text-gray-700 break-all">{transaction.qr_code}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transaction.qr_code!, "qr")}
                  className="flex-shrink-0"
                >
                  {copiedField === "qr" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Blockchain Hash */}
          {transaction.blockchain_hash && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-600">Blockchain Hash</p>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                <code className="flex-1 text-xs text-gray-700 break-all">{transaction.blockchain_hash}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transaction.blockchain_hash!, "hash")}
                  className="flex-shrink-0"
                >
                  {copiedField === "hash" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Transaction ID */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <code className="flex-1 text-xs text-gray-700 break-all">{transaction.id}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.id, "id")}
                className="flex-shrink-0"
              >
                {copiedField === "id" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
