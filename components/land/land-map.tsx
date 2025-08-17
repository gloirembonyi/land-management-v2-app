"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, MapPin, AlertTriangle, CheckCircle, Clock, Layers, Satellite } from "lucide-react"
import type { User, LandParcel } from "@/types"
import { mockLandParcels } from "@/lib/mock-data"
import { MapContainer } from "@/components/map/map-container"
import { useNotifications } from "@/components/notifications/notification-provider"

interface LandMapProps {
  user: User
  onNavigate: (view: "dashboard" | "map" | "transactions" | "disputes" | "payments") => void
}

export function LandMap({ user, onNavigate }: LandMapProps) {
  const [selectedLand, setSelectedLand] = useState<LandParcel | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending" | "disputed">("all")
  const [mapView, setMapView] = useState<"satellite" | "terrain">("satellite")
  const { showNotification } = useNotifications()

  const filteredLandParcels = mockLandParcels.filter((land) => {
    const matchesSearch =
      land.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || land.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-[#69d259]"
      case "pending":
        return "bg-yellow-500"
      case "disputed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "disputed":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleLandSelect = (land: LandParcel) => {
    setSelectedLand(land)
    showNotification(`Selected ${land.title}`, "info")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2faf4] to-[#e5eee9]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#17412b] to-[#69d259] text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">Land Map</h1>
              <p className="text-sm text-white/80">Interactive land visualization</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setMapView(mapView === "satellite" ? "terrain" : "satellite")}
            >
              <Satellite className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Layers className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search land parcels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#c6ecc5] focus:border-[#69d259] focus:ring-[#69d259] bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className={
              filterStatus === "all"
                ? "bg-[#69d259] hover:bg-[#69d259]"
                : "border-[#c6ecc5] hover:bg-[#69d259] hover:text-white"
            }
          >
            All ({filteredLandParcels.length})
          </Button>
          <Button
            variant={filterStatus === "verified" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("verified")}
            className={
              filterStatus === "verified"
                ? "bg-[#69d259] hover:bg-[#69d259]"
                : "border-[#c6ecc5] hover:bg-[#69d259] hover:text-white"
            }
          >
            Verified
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
            className={
              filterStatus === "pending"
                ? "bg-[#69d259] hover:bg-[#69d259]"
                : "border-[#c6ecc5] hover:bg-[#69d259] hover:text-white"
            }
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "disputed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("disputed")}
            className={
              filterStatus === "disputed"
                ? "bg-[#69d259] hover:bg-[#69d259]"
                : "border-[#c6ecc5] hover:bg-[#69d259] hover:text-white"
            }
          >
            Disputed
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="px-4 pb-4">
        <MapContainer
          landParcels={filteredLandParcels}
          selectedLand={selectedLand}
          onLandSelect={handleLandSelect}
          mapView={mapView}
        />
      </div>

      {/* Land Details */}
      {selectedLand && (
        <div className="p-4">
          <Card className="bg-white/90 backdrop-blur-sm border-[#c6ecc5] shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl text-[#17412b] mb-1">{selectedLand.title}</h3>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedLand.location}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedLand.status === "verified"
                      ? "default"
                      : selectedLand.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                  className={`${selectedLand.status === "verified" ? "bg-[#69d259] hover:bg-[#69d259]" : ""} flex items-center space-x-1`}
                >
                  {getStatusIcon(selectedLand.status)}
                  <span className="capitalize">{selectedLand.status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Area</p>
                  <p className="font-bold text-[#17412b]">{selectedLand.area.toLocaleString()} m²</p>
                </div>
                <div className="bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-bold text-[#17412b]">{(selectedLand.value / 1000000).toFixed(1)}M RWF</p>
                </div>
                <div className="bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-bold text-[#17412b] text-sm">{selectedLand.owner}</p>
                </div>
                <div className="bg-gradient-to-br from-[#f2faf4] to-[#e5eee9] p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Coordinates</p>
                  <p className="font-bold text-[#17412b] text-xs">{selectedLand.coordinates.join(", ")}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Blockchain Hash</p>
                <div className="bg-gradient-to-r from-[#f2faf4] to-[#e5eee9] p-3 rounded-lg border border-[#c6ecc5]">
                  <p className="text-xs font-mono text-[#17412b] break-all">{selectedLand.blockchainHash}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1 bg-gradient-to-r from-[#17412b] to-[#69d259] hover:from-[#69d259] hover:to-[#17412b] text-white shadow-lg">
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-[#69d259] text-[#17412b] hover:bg-[#69d259] hover:text-white bg-transparent"
                >
                  Verify on Blockchain
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
