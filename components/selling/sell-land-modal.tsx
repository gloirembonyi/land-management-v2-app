"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { QrCode, Copy, CheckCircle, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LandParcel, User } from "@/types"

interface SellLandModalProps {
  land: LandParcel | null
  user: User
  onClose: () => void
  onSuccess: () => void
}

export function SellLandModal({ land, user, onClose, onSuccess }: SellLandModalProps) {
  const [askingPrice, setAskingPrice] = useState("")
  const [isCreatingSale, setIsCreatingSale] = useState(false)
  const [saleCreated, setSaleCreated] = useState(false)
  const [saleData, setSaleData] = useState<any>(null)
  const { toast } = useToast()

  const handleCreateSale = async () => {
    if (!land || !askingPrice) return

    setIsCreatingSale(true)
    try {
      const response = await fetch(`/api/lands/set-for-sale/${land.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          price: Number.parseFloat(askingPrice),
        }),
      })

      if (response.ok) {
        const updatedLand = await response.json()
        setSaleData({
          ...updatedLand.land,
          asking_price: Number.parseFloat(askingPrice),
        })
        setSaleCreated(true)
        toast({
          title: "Land Listed for Sale",
          description: "Your land is now available for sale with QR code generated.",
        })
      } else {
        throw new Error("Failed to list land for sale")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list land for sale. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingSale(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleClose = () => {
    setSaleCreated(false)
    setSaleData(null)
    setAskingPrice("")
    onClose()
  }

  const handleDone = () => {
    handleClose()
    onSuccess()
  }

  if (!land) return null

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-emerald-700">
            {saleCreated ? "Land Listed Successfully" : "List Land for Sale"}
          </DialogTitle>
        </DialogHeader>

        {!saleCreated ? (
          <div className="space-y-4">
            {/* Land Info */}
            <Card className="border-emerald-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">{land.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{land.location_address || land.location}</p>
                <div className="flex justify-between text-sm">
                  <span>
                    Area: {land.area_size || land.size_hectares} {land.area_size ? "m²" : "hectares"}
                  </span>
                  <span>Current Value: {formatCurrency(land.price || land.estimated_value || 0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Asking Price */}
            <div className="space-y-2">
              <Label htmlFor="asking-price" className="text-emerald-700">
                Asking Price (RWF) *
              </Label>
              <Input
                id="asking-price"
                type="number"
                placeholder="Enter asking price"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
              <p className="text-xs text-gray-600">
                Suggested: {formatCurrency(land.price || land.estimated_value || 0)} (current market value)
              </p>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Your land will be listed with a unique QR code</li>
                  <li>2. Buyers can scan the QR code to view details</li>
                  <li>3. When a buyer is interested, admin will coordinate</li>
                  <li>4. Payment verification and ownership transfer</li>
                </ol>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleCreateSale}
                disabled={!askingPrice || isCreatingSale}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                {isCreatingSale ? "Listing..." : "List for Sale"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">Land Listed Successfully!</h3>
              <p className="text-sm text-gray-600">
                Your land is now available for sale. Share the QR code or sale code with potential buyers.
              </p>
            </div>

            {/* QR Code Display */}
            <Card className="border-emerald-200">
              <CardContent className="p-4 text-center">
                <div className="w-32 h-32 bg-white border-2 border-emerald-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-emerald-800 mb-2">QR Code for Sale</p>
                <Badge className="bg-emerald-100 text-emerald-800 font-mono text-xs">
                  {saleData?.qr_code_data || `LAND_${saleData?.id}_SALE`}
                </Badge>
              </CardContent>
            </Card>

            {/* Sale Details */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Asking Price</span>
                  <span className="font-semibold text-emerald-800">{formatCurrency(saleData?.asking_price || 0)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sale Code</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{saleData?.qr_code_data || `LAND_${saleData?.id}_SALE`}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(saleData?.qr_code_data || `LAND_${saleData?.id}_SALE`, "Sale code")
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blockchain Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">
                      {saleData?.blockchain_hash?.slice(0, 10) || "BLK_" + Date.now().toString().slice(-6)}...
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(saleData?.blockchain_hash || "BLK_" + Date.now(), "Blockchain hash")
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Sale Status: Active</p>
                    <p className="text-sm text-green-700">
                      Buyers can now scan your QR code or use the sale code to purchase this land
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleDone} className="w-full bg-emerald-500 hover:bg-emerald-600">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
