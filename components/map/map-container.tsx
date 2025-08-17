"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Navigation } from "lucide-react"
import type { LandParcel } from "@/types"

interface MapContainerProps {
  landParcels: LandParcel[]
  selectedLand: LandParcel | null
  onLandSelect: (land: LandParcel) => void
  mapView: "satellite" | "terrain"
}

export function MapContainer({ landParcels, selectedLand, onLandSelect, mapView }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      // Dynamically import Leaflet to avoid SSR issues
      import("leaflet").then((L) => {
        // Initialize map
        const map = L.map(mapRef.current!, {
          center: [-1.9441, 30.0619], // Kigali coordinates
          zoom: 10,
          zoomControl: false,
        })

        // Add tile layer based on view
        const tileLayer =
          mapView === "satellite"
            ? L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                  attribution:
                    "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                },
              )
            : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
              })

        tileLayer.addTo(map)

        // Add land parcels as markers
        landParcels.forEach((land) => {
          const color = land.status === "verified" ? "#69d259" : land.status === "pending" ? "#fbbf24" : "#ef4444"

          const marker = L.circleMarker([land.coordinates[0], land.coordinates[1]], {
            radius: 8,
            fillColor: color,
            color: "#17412b",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map)

          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${land.title}</h3>
              <p class="text-xs text-gray-600">${land.location}</p>
              <p class="text-xs">Area: ${land.area.toLocaleString()} m²</p>
              <p class="text-xs">Value: ${(land.value / 1000000).toFixed(1)}M RWF</p>
            </div>
          `)

          marker.on("click", () => {
            onLandSelect(land)
          })
        })

        mapInstanceRef.current = map
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [landParcels, mapView, onLandSelect])

  // Update selected land highlight
  useEffect(() => {
    if (mapInstanceRef.current && selectedLand) {
      mapInstanceRef.current.setView([selectedLand.coordinates[0], selectedLand.coordinates[1]], 15)
    }
  }, [selectedLand])

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

  return (
    <Card className="relative h-96 bg-white/90 backdrop-blur-sm border-[#c6ecc5] shadow-xl overflow-hidden">
      <CardContent className="p-0 h-full">
        {/* Map Container */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg">
            <Plus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg">
            <Minus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-[#c6ecc5]">
          <h4 className="text-xs font-bold text-[#17412b] mb-2">Land Status</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#69d259]"></div>
              <span className="text-xs text-gray-700">Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-700">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-700">Disputed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
