"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { QrCode, Search, MapPin, Square, DollarSign, ShoppingCart, Shield, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LandParcel } from "@/types"

interface BuyLandModalProps {
  land?: LandParcel | null
  user: any
  onClose: () => void
  onSuccess: () => void
}

export function BuyLandModal({ land: initialLand, user, onClose, onSuccess }: BuyLandModalProps) {
  const [qrCode, setQrCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [landData, setLandData] = useState<any>(initialLand || null)
  const [message, setMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleSearchLand = async () => {
    if (!qrCode.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/lands/search-by-qr?qr_code=${encodeURIComponent(qrCode)}`)
      if (response.ok) {
        const data = await response.json()
        setLandData(data.land)
        toast({
          title: "Land Found",
          description: "Land details loaded successfully.",
        })
      } else {
        toast({
          title: "Land Not Found",
          description: "Invalid QR code or the land is not available for sale.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for land. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleBuyLand = async () => {
    if (!landData) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          land_id: landData.id,
          seller_id: landData.owner_id,
          buyer_id: user.id,
          transaction_amount: landData.price,
          message: message,
        }),
      })

      if (response.ok) {
        const transaction = await response.json()

        toast({
          title: "Purchase Request Sent",
          description:
            "Your purchase request has been sent to the admin for approval. You will be contacted about payment.",
        })

        handleClose()
        onSuccess()
      } else {
        throw new Error("Failed to create transaction")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process purchase request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleClose = () => {
    setQrCode("")
    setLandData(initialLand || null)
    setMessage("")
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-700">Buy Land</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!landData ? (
            <>
              {/* Search Section */}
              <div className="space-y-4">
                <div className="text-center py-4">
                  <QrCode className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-emerald-800 mb-2">Find Land for Sale</h3>
                  <p className="text-sm text-gray-600">Enter the QR code or sale code from the seller</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-code" className="text-emerald-700">
                    QR Code / Sale Code
                  </Label>
                  <Input
                    id="qr-code"
                    placeholder="Enter QR code (e.g., LAND_123_BLK_456)"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <Button
                  onClick={handleSearchLand}
                  disabled={!qrCode.trim() || isSearching}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Searching..." : "Search Land"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Land Details */}
              <Card className="border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-800 text-lg">{landData.title}</h3>
                      <p className="text-sm text-gray-600">{landData.location_address || landData.location}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">For Sale</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs text-gray-600">Area</p>
                        <p className="font-semibold">
                          {landData.area_size || landData.size_hectares} {landData.area_size ? "m²" : "hectares"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="font-semibold">{formatCurrency(landData.price || 0)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-600">Seller</p>
                      <p className="font-semibold">{landData.owner_name || "Land Owner"}</p>
                    </div>
                  </div>

                  {landData.blockchain_hash && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-gray-600">Blockchain Verified</p>
                          <p className="font-mono text-xs">{landData.blockchain_hash.slice(0, 16)}...</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Message to Seller */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-emerald-700">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Add a message about your purchase..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500"
                  rows={3}
                />
              </div>

              {/* Next Steps Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Purchase Process:</h4>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Submit purchase request</li>
                        <li>2. Admin will contact you about payment</li>
                        <li>3. Make payment as instructed</li>
                        <li>4. Admin verifies payment with seller</li>
                        <li>5. Land ownership transfers to you</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleBuyLand}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Buy This Land"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
