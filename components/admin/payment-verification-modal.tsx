"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, DollarSign, User, MapPin, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Transaction } from "@/lib/types"

interface PaymentVerificationModalProps {
  transaction: Transaction | null
  onClose: () => void
  onSuccess: () => void
}

export function PaymentVerificationModal({ transaction, onClose, onSuccess }: PaymentVerificationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [actionType, setActionType] = useState<"confirm" | "reject" | null>(null)
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePaymentConfirmation = async (confirmed: boolean) => {
    if (!transaction) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/verify-payment/${transaction.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_confirmed: confirmed,
          verification_notes: verificationNotes,
        }),
      })

      if (response.ok) {
        toast({
          title: confirmed ? "Payment Confirmed" : "Payment Rejected",
          description: confirmed
            ? "The transaction has been approved and will be completed."
            : "The payment has been marked as not received.",
        })
        onSuccess()
        onClose()
      } else {
        throw new Error("Failed to verify payment")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setShowConfirmation(false)
      setActionType(null)
    }
  }

  const handleAction = (action: "confirm" | "reject") => {
    setActionType(action)
    setShowConfirmation(true)
  }

  if (!transaction) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-700">Payment Verification</DialogTitle>
        </DialogHeader>

        {!showConfirmation ? (
          <div className="space-y-6">
            {/* Transaction Overview */}
            <Card className="border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-2">{transaction.land_title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-emerald-500" />
                          <span className="text-gray-600">Seller:</span>
                          <span className="font-medium">{transaction.seller_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600">Buyer:</span>
                          <span className="font-medium">{transaction.buyer_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{transaction.location_address}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(transaction.transaction_amount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-gray-600">Initiated:</span>
                          <span className="font-medium">{new Date(transaction.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`${transaction.payment_confirmed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} ml-4`}
                  >
                    {transaction.payment_confirmed ? "Payment Confirmed" : "Awaiting Verification"}
                  </Badge>
                </div>

                {transaction.blockchain_hash && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Blockchain Hash:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {transaction.blockchain_hash.slice(0, 16)}...
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Verification Section */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-2">Payment Verification Required</h4>
                    <p className="text-orange-800 text-sm mb-4">
                      Please confirm with the seller ({transaction.seller_name}) whether they have received the payment
                      of {formatCurrency(transaction.transaction_amount)} from the buyer ({transaction.buyer_name}).
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <h5 className="font-medium text-gray-900 mb-3">Verification Steps:</h5>
                  <ol className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>Contact the seller to confirm payment receipt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>Verify payment method and amount</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span>Confirm or reject the payment verification</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Verification Notes */}
            <div className="space-y-2">
              <Label htmlFor="verification-notes" className="text-gray-700">
                Verification Notes (Optional)
              </Label>
              <Textarea
                id="verification-notes"
                placeholder="Add any notes about the payment verification process..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="border-gray-300 focus:border-emerald-500"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction("reject")}
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Payment Not Received
              </Button>
              <Button onClick={() => handleAction("confirm")} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Payment Confirmed
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Confirmation Dialog */}
            <Card
              className={`${actionType === "confirm" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              <CardContent className="p-6 text-center">
                {actionType === "confirm" ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-semibold mb-2">
                  {actionType === "confirm" ? "Confirm Payment Received?" : "Confirm Payment Not Received?"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {actionType === "confirm"
                    ? "This will complete the transaction and transfer land ownership to the buyer."
                    : "This will mark the payment as not received and keep the transaction pending."}
                </p>

                <div className="bg-white rounded-lg p-4 border border-gray-200 text-left">
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Transaction:</strong> {transaction.land_title}
                    </div>
                    <div>
                      <strong>Amount:</strong> {formatCurrency(transaction.transaction_amount)}
                    </div>
                    <div>
                      <strong>Seller:</strong> {transaction.seller_name}
                    </div>
                    <div>
                      <strong>Buyer:</strong> {transaction.buyer_name}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmation Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-transparent"
                disabled={isProcessing}
              >
                Go Back
              </Button>
              <Button
                onClick={() => handlePaymentConfirmation(actionType === "confirm")}
                disabled={isProcessing}
                className={`flex-1 ${actionType === "confirm" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                {isProcessing ? "Processing..." : actionType === "confirm" ? "Confirm Payment" : "Mark as Not Received"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
