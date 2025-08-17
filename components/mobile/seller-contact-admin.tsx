"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Transaction } from "@/lib/types"

interface SellerContactAdminProps {
  transaction: Transaction | null
  onClose: () => void
  onSuccess: () => void
}

export function SellerContactAdmin({ transaction, onClose, onSuccess }: SellerContactAdminProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleContactAdmin = async () => {
    if (!transaction || !message.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/seller/contact-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: transaction.id,
          message: message.trim(),
          type: "payment_received",
        }),
      })

      if (response.ok) {
        toast({
          title: "Message Sent",
          description:
            "Your message has been sent to the admin. They will verify the payment and complete the transaction.",
        })
        onSuccess()
        onClose()
      } else {
        throw new Error("Failed to contact admin")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message to admin. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!transaction) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-700">Contact Admin</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Info */}
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-emerald-800 mb-2">{transaction.land_title}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Buyer:</span>
                  <span className="font-medium">{transaction.buyer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-green-600">{formatCurrency(transaction.transaction_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Contact Admin for Payment Verification</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    If you have received the payment from the buyer, please let the admin know so they can complete the
                    transaction.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <h5 className="font-medium text-gray-900 mb-2">What happens next:</h5>
                    <ol className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Admin will verify your payment confirmation
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Transaction will be completed
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Land ownership will transfer to buyer
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="admin-message" className="text-emerald-700">
              Message to Admin *
            </Label>
            <Textarea
              id="admin-message"
              placeholder="Please confirm that I have received the payment of [amount] from [buyer name] for the land transaction. The payment was received via [payment method] on [date]."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-emerald-200 focus:border-emerald-500"
              rows={4}
            />
            <p className="text-xs text-gray-600">Please provide details about when and how you received the payment.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleContactAdmin}
              disabled={!message.trim() || isSubmitting}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Contact Admin"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
