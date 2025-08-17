"use client"

import { useEffect, useRef } from "react"
import type { LandParcel } from "@/types"

interface InteractiveMapProps {
  landParcels: LandParcel[]
  selectedLand: LandParcel | null
  onLandSelect: (land: LandParcel) => void
}

export function InteractiveMap({ landParcels, selectedLand, onLandSelect }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      import("leaflet").then((L) => {
        // Initialize map
        const map = L.map(mapRef.current!, {
          center: [-1.9441, 30.0619], // Kigali coordinates
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        })

        // Add custom tile layer that looks like the reference
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "",
        })
        tileLayer.addTo(map)

        // Add land parcels as polygons (like fields in the reference)
        landParcels.forEach((land, index) => {
          const color = land.status === "verified" ? "#69d259" : land.status === "pending" ? "#fbbf24" : "#ef4444"

          // Create polygon coordinates (simulating field boundaries)
          const baseCoords = land.coordinates
          const polygonCoords = [
            [baseCoords[0], baseCoords[1]],
            [baseCoords[0] + 0.002, baseCoords[1]],
            [baseCoords[0] + 0.002, baseCoords[1] + 0.003],
            [baseCoords[0], baseCoords[1] + 0.003],
            [baseCoords[0], baseCoords[1]],
          ]

          const polygon = L.polygon(polygonCoords, {
            fillColor: color,
            fillOpacity: 0.3,
            color: color,
            weight: 2,
            dashArray: "5, 5", // Dotted border like in reference
          }).addTo(map)

          // Add label in center of polygon
          const center = polygon.getBounds().getCenter()
          const marker = L.divIcon({
            html: `
              <div class="bg-white rounded-lg px-2 py-1 shadow-sm border text-xs font-medium text-gray-700 whitespace-nowrap">
                <div class="font-semibold">${land.title}</div>
                <div class="text-gray-500">${land.area.toLocaleString()} m²</div>
              </div>
            `,
            className: "custom-div-icon",
            iconSize: [120, 40],
            iconAnchor: [60, 20],
          })

          L.marker(center, { icon: marker }).addTo(map)

          polygon.on("click", () => {
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
  }, [landParcels, onLandSelect])

  // Update selected land highlight
  useEffect(() => {
    if (mapInstanceRef.current && selectedLand) {
      mapInstanceRef.current.setView([selectedLand.coordinates[0], selectedLand.coordinates[1]], 15)
    }
  }, [selectedLand])

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Custom CSS for map styling */}
      <style jsx global>{`
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #f8f9fa !important;
        }
        .leaflet-tile {
          filter: grayscale(20%) brightness(1.1);
        }
      `}</style>
    </div>
  )
}
