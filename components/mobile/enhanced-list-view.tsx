"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  ShoppingCart,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
} from "lucide-react"
import { LandDetail } from "@/components/land/land-detail"
import { SellLandModal } from "@/components/selling/sell-land-modal"
import { BuyLandModal } from "@/components/selling/buy-land-modal"
import { LandRegistrationView } from "./land-registration-view"
import type { User, LandParcel } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface EnhancedListViewProps {
  user: User
}

interface UserStats {
  ownedLands: number
  activeSales: number
  totalValue: number
  completedTransactions: number
}

export function EnhancedListView({ user }: EnhancedListViewProps) {
  const [lands, setLands] = useState<LandParcel[]>([])
  const [myLands, setMyLands] = useState<LandParcel[]>([])
  const [selectedLand, setSelectedLand] = useState<LandParcel | null>(null)
  const [showSellModal, setShowSellModal] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("marketplace")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    ownedLands: 0,
    activeSales: 0,
    totalValue: 0,
    completedTransactions: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchLands()
    fetchMyLands()
  }, [user.id])

  const fetchLands = async () => {
    try {
      const response = await fetch("/api/land/all")
      if (response.ok) {
        const data = await response.json()
        setLands(data.filter((land: LandParcel) => land.owner_id !== user.id))
      }
    } catch (error) {
      console.error("Error fetching lands:", error)
    }
  }

  const fetchMyLands = async () => {
    try {
      const response = await fetch(`/api/lands/user`, {
        headers: {
          "x-user-id": user.id,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMyLands(data.lands || [])

        const totalValue = (data.lands || []).reduce((sum: number, land: any) => sum + (land.price || 0), 0)
        const activeSales = (data.lands || []).filter((land: any) => land.is_for_sale).length

        setStats({
          ownedLands: (data.lands || []).length,
          activeSales,
          totalValue,
          completedTransactions: 12, // Mock data
        })
      }
    } catch (error) {
      console.error("Error fetching my lands:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSellLand = (land: LandParcel) => {
    setSelectedLand(land)
    setShowSellModal(true)
  }

  const handleBuyLand = (land: LandParcel) => {
    setSelectedLand(land)
    setShowBuyModal(true)
  }

  const handleAddLand = () => {
    setShowRegistration(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredLands = lands.filter(
    (land) =>
      land.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredMyLands = myLands.filter(
    (land) =>
      land.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (showRegistration) {
    return (
      <LandRegistrationView
        user={user}
        onBack={() => {
          setShowRegistration(false)
          fetchMyLands() // Refresh lands after registration
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-6 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-emerald-500 text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Welcome, {user.name}</h1>
              <p className="text-sm text-slate-600">
                {user.is_verified ? (
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-1" />
                    Verified User
                  </span>
                ) : (
                  <span className="text-orange-600">Pending Verification</span>
                )}
              </p>
            </div>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Wallet className="w-4 h-4 mr-2" />
            Portfolio
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search lands by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/50 border-slate-200"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">My Lands</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.ownedLands}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Active Sales</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeSales}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Portfolio Value</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalValue).slice(0, -3)}M</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Transactions</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completedTransactions}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-xl">
            <TabsTrigger
              value="marketplace"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="my-lands" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <MapPin className="w-4 h-4 mr-2" />
              My Lands
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Available Lands</h2>
              <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {filteredLands.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600">No lands available for purchase</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredLands.map((land) => (
                  <div key={land.id} className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{land.title}</h3>
                        <p className="text-slate-600 text-sm">{land.location}</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        {land.status === "for_sale" ? "For Sale" : "Available"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-slate-600">Size</p>
                        <p className="font-medium">{land.size_hectares} hectares</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Price</p>
                        <p className="font-medium text-emerald-600">{formatCurrency(land.estimated_value || 0)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBuyLand(land)}
                        className="bg-emerald-500 hover:bg-emerald-600 flex-1"
                        disabled={!user.is_verified}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {user.is_verified ? "Buy Land" : "Verification Required"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLand(land)}
                        className="border-slate-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-lands" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">My Land Portfolio</h2>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleAddLand}>
                <Plus className="w-4 h-4 mr-2" />
                Register Land
              </Button>
            </div>

            {filteredMyLands.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-xl border-slate-200/50">
                <CardContent className="p-12 text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 mb-4">You don't own any lands yet</p>
                  <Button onClick={handleAddLand} className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Register Your First Land
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredMyLands.map((land) => (
                  <div key={land.id} className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{land.title}</h3>
                        <p className="text-slate-600 text-sm">{land.location_address || land.location}</p>
                      </div>
                      <Badge
                        className={
                          land.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : land.status === "approved" && land.is_for_sale
                              ? "bg-orange-100 text-orange-800"
                              : land.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }
                      >
                        {land.status === "pending"
                          ? "Pending Approval"
                          : land.status === "approved" && land.is_for_sale
                            ? "For Sale"
                            : land.status === "approved"
                              ? "Approved"
                              : "Rejected"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-slate-600">Size</p>
                        <p className="font-medium">
                          {land.area_size || land.size_hectares} {land.area_size ? "m²" : "hectares"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Value</p>
                        <p className="font-medium text-emerald-600">
                          {formatCurrency(land.price || land.estimated_value || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {land.status === "approved" && !land.is_for_sale && (
                        <Button
                          size="sm"
                          onClick={() => handleSellLand(land)}
                          className="bg-emerald-500 hover:bg-emerald-600 flex-1"
                          disabled={!user.is_verified}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {user.is_verified ? "Sell Land" : "Verification Required"}
                        </Button>
                      )}
                      {land.status === "approved" && land.is_for_sale && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-600 flex-1 bg-transparent"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Sale Pending
                        </Button>
                      )}
                      {land.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-300 text-yellow-600 flex-1 bg-transparent"
                          disabled
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Awaiting Approval
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLand(land)}
                        className="border-slate-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedLand && !showSellModal && !showBuyModal && (
        <LandDetail
          land={selectedLand}
          onClose={() => setSelectedLand(null)}
          onSell={user.id === selectedLand.owner_id ? () => handleSellLand(selectedLand) : undefined}
          onBuy={user.id !== selectedLand.owner_id ? () => handleBuyLand(selectedLand) : undefined}
          user={user}
        />
      )}

      {showSellModal && selectedLand && (
        <SellLandModal
          land={selectedLand}
          user={user}
          onClose={() => {
            setShowSellModal(false)
            setSelectedLand(null)
          }}
          onSuccess={() => {
            setShowSellModal(false)
            setSelectedLand(null)
            fetchMyLands()
            toast({
              title: "Land Listed for Sale",
              description: "Your land has been successfully listed for sale.",
            })
          }}
        />
      )}

      {showBuyModal && selectedLand && (
        <BuyLandModal
          land={selectedLand}
          user={user}
          onClose={() => {
            setShowBuyModal(false)
            setSelectedLand(null)
          }}
          onSuccess={() => {
            setShowBuyModal(false)
            setSelectedLand(null)
            fetchLands()
            toast({
              title: "Purchase Request Sent",
              description: "Your purchase request has been sent to the admin for approval.",
            })
          }}
        />
      )}
    </div>
  )
}
