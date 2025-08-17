"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Square, DollarSign, Calendar, Hash, User, ShoppingCart } from "lucide-react"

interface LandParcel {
  id: string
  title: string
  location: string
  coordinates: number[]
  area: number
  value: number
  status: "verified" | "pending" | "disputed"
  blockchain_hash: string
  owner_name: string
  created_at: string
  updated_at: string
}

interface LandDetailProps {
  landId: string
  onBack: () => void
  onSell?: (landId: string) => void
  showSellButton?: boolean
}

export function LandDetail({ landId, onBack, onSell, showSellButton = false }: LandDetailProps) {
  const [land, setLand] = useState<LandParcel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLandDetails = async () => {
      try {
        const response = await fetch(`/api/land/${landId}`)
        if (response.ok) {
          const landData = await response.json()
          setLand(landData)
        }
      } catch (error) {
        console.error("Error fetching land details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLandDetails()
  }, [landId])

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!land) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Land parcel not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "disputed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-[#17412b]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge className={getStatusColor(land.status)}>
            {land.status.charAt(0).toUpperCase() + land.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#17412b]">{land.title}</CardTitle>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {land.location}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Square className="w-5 h-5 mr-3 text-[#69d259]" />
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="font-semibold">{land.area.toLocaleString()} m²</p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-3 text-[#69d259]" />
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="font-semibold">{formatCurrency(land.value)}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center">
              <User className="w-5 h-5 mr-3 text-[#69d259]" />
              <div>
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-semibold">{land.owner_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#17412b] text-lg">Blockchain Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start">
              <Hash className="w-5 h-5 mr-3 text-[#69d259] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Blockchain Hash</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{land.blockchain_hash}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#17412b] text-lg">Registration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-[#69d259]" />
              <div>
                <p className="text-sm text-gray-600">Registered</p>
                <p className="font-semibold">{formatDate(land.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-[#69d259]" />
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-semibold">{formatDate(land.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        {showSellButton && land.status === "verified" && onSell && (
          <Card className="border-[#69d259]">
            <CardContent className="p-4">
              <Button
                onClick={() => onSell(land.id)}
                className="w-full bg-[#69d259] hover:bg-[#17412b] text-white"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Sell This Land
              </Button>
              <p className="text-xs text-gray-600 text-center mt-2">
                Generate QR code and blockchain transaction for sale
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
