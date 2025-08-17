"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapIcon, List, AlertTriangle, Plus, Minus, Navigation2 } from "lucide-react"
import type { User } from "@/types"
import { mockLandParcels } from "@/lib/mock-data"
import { LandDetailSheet } from "./land-detail-sheet"
import { InteractiveMap } from "./interactive-map"

interface MapViewProps {
  user: User
}

export function MapView({ user }: MapViewProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [selectedLand, setSelectedLand] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending" | "disputed">("all")

  const userLandParcels = mockLandParcels.filter((land) => land.owner === user.name)
  const filteredLandParcels = userLandParcels.filter((land) => filterStatus === "all" || land.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-[#69d259] text-white"
      case "pending":
        return "bg-yellow-500 text-white"
      case "disputed":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
              className={`${
                viewMode === "map"
                  ? "bg-[#17412b] hover:bg-[#17412b] text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              } rounded-full px-4`}
            >
              <MapIcon className="w-4 h-4 mr-1" />
              Map
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`${
                viewMode === "list"
                  ? "bg-[#17412b] hover:bg-[#17412b] text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              } rounded-full px-4`}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-gray-200 bg-transparent">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Tags */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <Badge
            variant={filterStatus === "all" ? "default" : "outline"}
            className={`${
              filterStatus === "all"
                ? "bg-[#17412b] hover:bg-[#17412b] text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            } rounded-full px-3 py-1 cursor-pointer whitespace-nowrap`}
            onClick={() => setFilterStatus("all")}
          >
            All Land
          </Badge>
          <Badge
            variant={filterStatus === "verified" ? "default" : "outline"}
            className={`${
              filterStatus === "verified"
                ? "bg-[#69d259] hover:bg-[#69d259] text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            } rounded-full px-3 py-1 cursor-pointer whitespace-nowrap`}
            onClick={() => setFilterStatus("verified")}
          >
            Verified
          </Badge>
          <Badge
            variant={filterStatus === "pending" ? "default" : "outline"}
            className={`${
              filterStatus === "pending"
                ? "bg-yellow-500 hover:bg-yellow-500 text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            } rounded-full px-3 py-1 cursor-pointer whitespace-nowrap`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </Badge>
          <Badge
            variant={filterStatus === "disputed" ? "default" : "outline"}
            className={`${
              filterStatus === "disputed"
                ? "bg-red-500 hover:bg-red-500 text-white"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            } rounded-full px-3 py-1 cursor-pointer whitespace-nowrap`}
            onClick={() => setFilterStatus("disputed")}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Disputed
          </Badge>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        {viewMode === "map" ? (
          <>
            <InteractiveMap
              landParcels={filteredLandParcels}
              selectedLand={selectedLand}
              onLandSelect={setSelectedLand}
            />

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white shadow-lg border border-gray-200 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white shadow-lg border border-gray-200 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white shadow-lg border border-gray-200 rounded-full"
              >
                <Navigation2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Warning Icon (like in reference) */}
            <div className="absolute top-4 left-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 space-y-3">
            {filteredLandParcels.map((land) => (
              <div
                key={land.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedLand(land)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{land.title}</h3>
                  <Badge className={`${getStatusColor(land.status)} rounded-full px-2 py-1 text-xs`}>
                    {land.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{land.location}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{land.area.toLocaleString()} m²</span>
                  <span className="font-semibold text-gray-900">{(land.value / 1000000).toFixed(1)}M RWF</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Land Detail Sheet */}
      {selectedLand && (
        <LandDetailSheet land={selectedLand} isOpen={!!selectedLand} onClose={() => setSelectedLand(null)} />
      )}
    </div>
  )
}
