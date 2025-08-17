"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Square, DollarSign, Eye } from "lucide-react"

interface LandParcel {
  id: string
  title: string
  location: string
  area: number
  value: number
  status: "verified" | "pending" | "disputed"
  blockchain_hash: string
}

interface LandCardProps {
  land: LandParcel
  onViewDetails: (landId: string) => void
  showSellButton?: boolean
  onSell?: (landId: string) => void
}

export function LandCard({ land, onViewDetails, showSellButton = false, onSell }: LandCardProps) {
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

  return (
    <Card className="mb-4 shadow-sm border-l-4 border-l-[#69d259]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-[#17412b] text-lg">{land.title}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {land.location}
            </div>
          </div>
          <Badge className={getStatusColor(land.status)}>
            {land.status.charAt(0).toUpperCase() + land.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Square className="w-4 h-4 mr-2 text-[#69d259]" />
            <span>{land.area.toLocaleString()} m²</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-[#69d259]" />
            <span>{formatCurrency(land.value)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(land.id)}
            className="flex-1 border-[#69d259] text-[#17412b] hover:bg-[#c6ecc5]"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {showSellButton && land.status === "verified" && onSell && (
            <Button
              size="sm"
              onClick={() => onSell(land.id)}
              className="flex-1 bg-[#69d259] hover:bg-[#17412b] text-white"
            >
              Sell Land
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
