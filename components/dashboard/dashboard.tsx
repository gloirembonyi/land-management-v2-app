"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  Map,
  MessageSquare,
  Bell,
  Settings,
  TrendingUp,
  Shield,
  Globe,
} from "lucide-react"
import type { User } from "@/types"
import { mockLandParcels, mockTransactions } from "@/lib/mock-data"
import { useNotifications } from "@/components/notifications/notification-provider"

interface DashboardProps {
  user: User
  onNavigate: (view: "dashboard" | "map" | "transactions" | "disputes" | "payments") => void
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const { showNotification } = useNotifications()
  const userLandParcels = mockLandParcels.filter((land) => land.owner === user.name)
  const userTransactions = mockTransactions.filter((tx) => tx.buyer === user.name || tx.seller === user.name)

  const stats = {
    totalLand: userLandParcels.length,
    verifiedLand: userLandParcels.filter((land) => land.status === "verified").length,
    pendingTransactions: userTransactions.filter((tx) => tx.status === "pending").length,
    totalValue: userLandParcels.reduce((sum, land) => sum + land.value, 0),
  }

  const handleQuickAction = (action: string) => {
    showNotification(`${action} opened`, "info")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2faf4] to-[#e5eee9]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#17412b] to-[#69d259] text-white px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-[#c6ecc5] text-[#17412b] font-bold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">Muraho, {user.name.split(" ")[0]}!</h1>
              <p className="text-sm text-white/80 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                NIDA: {user.nidaId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-[#69d259] to-[#c6ecc5] border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#17412b] mb-2">Welcome to Rwanda Land</h2>
                <p className="text-[#17412b]/80">Your digital land management platform</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-[#17412b]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-[#c6ecc5] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#69d259] to-[#c6ecc5] rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#17412b]">{stats.totalLand}</p>
                  <p className="text-sm text-gray-600">Land Parcels</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-[#c6ecc5] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#69d259] to-[#c6ecc5] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#17412b]">{stats.verifiedLand}</p>
                  <p className="text-sm text-gray-600">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-[#c6ecc5] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#69d259] to-[#c6ecc5] rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#17412b]">{stats.pendingTransactions}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-[#c6ecc5] shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#69d259] to-[#c6ecc5] rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#17412b]">{(stats.totalValue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-gray-600">RWF Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Land Parcels */}
      <div className="px-4 pb-4">
        <Card className="bg-white/80 backdrop-blur-sm border-[#c6ecc5] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#17412b] flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              My Land Parcels
            </CardTitle>
            <CardDescription>Your registered land properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userLandParcels.slice(0, 3).map((land) => (
              <div
                key={land.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f2faf4] to-[#e5eee9] rounded-lg border border-[#c6ecc5] hover:shadow-md transition-all duration-300"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-[#17412b]">{land.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {land.location}
                  </p>
                  <p className="text-sm text-gray-500">{land.area.toLocaleString()} m²</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      land.status === "verified" ? "default" : land.status === "pending" ? "secondary" : "destructive"
                    }
                    className={land.status === "verified" ? "bg-[#69d259] hover:bg-[#69d259]" : ""}
                  >
                    {land.status}
                  </Badge>
                  <p className="text-sm font-medium mt-1 text-[#17412b]">{(land.value / 1000000).toFixed(1)}M RWF</p>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full border-[#69d259] text-[#17412b] hover:bg-[#69d259] hover:text-white transition-all duration-300 bg-transparent"
              onClick={() => onNavigate("map")}
            >
              View All Land
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-[#c6ecc5] hover:bg-[#69d259] hover:text-white hover:border-[#69d259] transition-all duration-300 shadow-lg"
            onClick={() => {
              onNavigate("map")
              handleQuickAction("Land Map")
            }}
          >
            <Map className="w-8 h-8" />
            <span className="font-medium">Land Map</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-[#c6ecc5] hover:bg-[#69d259] hover:text-white hover:border-[#69d259] transition-all duration-300 shadow-lg"
            onClick={() => {
              onNavigate("transactions")
              handleQuickAction("Transactions")
            }}
          >
            <FileText className="w-8 h-8" />
            <span className="font-medium">Transactions</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-[#c6ecc5] hover:bg-[#69d259] hover:text-white hover:border-[#69d259] transition-all duration-300 shadow-lg"
            onClick={() => {
              onNavigate("disputes")
              handleQuickAction("Disputes")
            }}
          >
            <MessageSquare className="w-8 h-8" />
            <span className="font-medium">Disputes</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex-col space-y-2 bg-white/80 backdrop-blur-sm border-[#c6ecc5] hover:bg-[#69d259] hover:text-white hover:border-[#69d259] transition-all duration-300 shadow-lg"
            onClick={() => {
              onNavigate("payments")
              handleQuickAction("Payments")
            }}
          >
            <CreditCard className="w-8 h-8" />
            <span className="font-medium">Payments</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
