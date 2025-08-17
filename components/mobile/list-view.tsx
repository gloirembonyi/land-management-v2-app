"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MapPin, Plus } from "lucide-react"
import type { User } from "@/types"
import { LandCard } from "@/components/land/land-card"
import { LandDetail } from "@/components/land/land-detail"
import { SellLandModal } from "@/components/selling/sell-land-modal"
import { BuyLandModal } from "@/components/selling/buy-land-modal"

interface ListViewProps {
  user: User
}

interface LandParcel {
  id: string
  title: string
  location: string
  area: number
  value: number
  status: "verified" | "pending" | "disputed"
  blockchain_hash: string
  owner_name: string
}

export function ListView({ user }: ListViewProps) {
  const [lands, setLands] = useState<LandParcel[]>([])
  const [filteredLands, setFilteredLands] = useState<LandParcel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null)
  const [showSellModal, setShowSellModal] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [selectedLandForSale, setSelectedLandForSale] = useState<LandParcel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserLands()
  }, [user.id])

  useEffect(() => {
    const filtered = lands.filter(
      (land) =>
        land.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        land.location.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredLands(filtered)
  }, [searchQuery, lands])

  const fetchUserLands = async () => {
    try {
      const response = await fetch(`/api/land/user/${user.id}`)
      if (response.ok) {
        const landsData = await response.json()
        setLands(landsData)
      }
    } catch (error) {
      console.error("Error fetching user lands:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (landId: string) => {
    setSelectedLandId(landId)
  }

  const handleSellLand = (landId: string) => {
    const land = lands.find((l) => l.id === landId)
    if (land) {
      setSelectedLandForSale(land)
      setShowSellModal(true)
    }
  }

  const handleBackFromDetail = () => {
    setSelectedLandId(null)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#69d259]"></div>
      </div>
    )
  }

  if (selectedLandId) {
    return (
      <LandDetail landId={selectedLandId} onBack={handleBackFromDetail} onSell={handleSellLand} showSellButton={true} />
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">My Lands</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBuyModal(true)}
              className="border-[#69d259] text-[#17412b] hover:bg-[#69d259] hover:text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Buy Land
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-gray-200 bg-transparent">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your lands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 rounded-xl bg-gray-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Land List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredLands.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Land Parcels Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "No lands match your search criteria." : "You don't have any registered land parcels yet."}
            </p>
            <Button onClick={() => setShowBuyModal(true)} className="bg-[#69d259] hover:bg-[#17412b] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Buy Your First Land
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLands.map((land) => (
              <LandCard
                key={land.id}
                land={land}
                onViewDetails={handleViewDetails}
                showSellButton={true}
                onSell={handleSellLand}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SellLandModal
        isOpen={showSellModal}
        onClose={() => {
          setShowSellModal(false)
          setSelectedLandForSale(null)
        }}
        land={selectedLandForSale}
        userId={user.id}
      />

      <BuyLandModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} userId={user.id} />
    </div>
  )
}
