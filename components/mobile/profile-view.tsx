"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Bell,
  Shield,
  FileText,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  MapPin,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import type { User } from "@/types"
import { mockLandParcels, mockTransactions } from "@/lib/mock-data"

interface ProfileViewProps {
  user: User
}

export function ProfileView({ user }: ProfileViewProps) {
  const userLandParcels = mockLandParcels.filter((land) => land.owner === user.name)
  const userTransactions = mockTransactions.filter((tx) => tx.buyer === user.name || tx.seller === user.name)

  const stats = {
    totalLand: userLandParcels.length,
    verifiedLand: userLandParcels.filter((land) => land.status === "verified").length,
    totalValue: userLandParcels.reduce((sum, land) => sum + land.value, 0),
    completedTransactions: userTransactions.filter((tx) => tx.status === "completed").length,
  }

  const menuItems = [
    { icon: Settings, label: "Account Settings", hasChevron: true },
    { icon: Bell, label: "Notifications", hasChevron: true },
    { icon: Shield, label: "Security & Privacy", hasChevron: true },
    { icon: FileText, label: "Documents", hasChevron: true },
    { icon: CreditCard, label: "Payment Methods", hasChevron: true },
    { icon: HelpCircle, label: "Help & Support", hasChevron: true },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#17412b] to-[#69d259] px-4 py-8 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-white text-[#17412b] text-2xl font-bold">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
            <p className="text-white/80 mb-2">{user.email}</p>
            <Badge className="bg-white/20 text-white border-white/30">
              <Shield className="w-3 h-3 mr-1" />
              NIDA Verified
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalLand}</p>
            <p className="text-white/80 text-sm">Land Parcels</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{(stats.totalValue / 1000000).toFixed(1)}M</p>
            <p className="text-white/80 text-sm">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.completedTransactions}</p>
            <p className="text-white/80 text-sm">Transactions</p>
          </div>
        </div>
      </div>

      {/* Account Overview */}
      <div className="p-4">
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Account Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#c6ecc5] rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stats.verifiedLand}</p>
                  <p className="text-xs text-gray-500">Verified Lands</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#c6ecc5] rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">+12.5%</p>
                  <p className="text-xs text-gray-500">Value Growth</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#c6ecc5] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">100%</p>
                  <p className="text-xs text-gray-500">Compliance</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#c6ecc5] rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#17412b]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Active</p>
                  <p className="text-xs text-gray-500">Security Status</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Verification Status */}
        <Card className="bg-gradient-to-r from-[#17412b] to-[#69d259] border-0 rounded-2xl shadow-sm mb-6">
          <CardContent className="p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Blockchain Status</h3>
              <Badge className="bg-white/20 text-white border-white/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Total Transactions:</span>
                <span className="font-medium">{stats.completedTransactions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Blockchain Hash:</span>
                <span className="font-mono text-xs">0x1a2b...5y6z</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Last Verification:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <Button className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white border-white/30">
              View on Blockchain Explorer
            </Button>
          </CardContent>
        </Card>

        {/* Land Analytics */}
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Land Analytics</h3>

            {/* Value Chart */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Portfolio Value</span>
                <span className="text-sm font-medium text-[#69d259]">+8.2% this month</span>
              </div>
              <div className="h-20 flex items-end space-x-1">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-[#69d259] to-[#c6ecc5] rounded-t"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Jan</span>
                <span>Dec</span>
              </div>
            </div>

            {/* Land Distribution */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-[#f2faf4] rounded-xl">
                <p className="text-lg font-bold text-[#17412b]">
                  {Math.round((stats.totalValue / stats.totalLand / 1000000) * 100) / 100}M
                </p>
                <p className="text-xs text-gray-600">Avg. Value</p>
              </div>
              <div className="text-center p-3 bg-[#f2faf4] rounded-xl">
                <p className="text-lg font-bold text-[#17412b]">
                  {Math.round(userLandParcels.reduce((sum, land) => sum + land.area, 0) / 1000)}k
                </p>
                <p className="text-xs text-gray-600">Total Area</p>
              </div>
              <div className="text-center p-3 bg-[#f2faf4] rounded-xl">
                <p className="text-lg font-bold text-[#17412b]">
                  {Math.round((stats.verifiedLand / stats.totalLand) * 100)}%
                </p>
                <p className="text-xs text-gray-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#69d259] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Land verification completed</p>
                  <p className="text-xs text-gray-500">Kigali Residential Plot • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Document uploaded</p>
                  <p className="text-xs text-gray-500">Land title certificate • 1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Value assessment updated</p>
                  <p className="text-xs text-gray-500">Portfolio increased by 5.2% • 3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Card key={index} className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <CardContent className="p-0">
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto rounded-2xl hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    {item.hasChevron && <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Logout Button */}
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto rounded-2xl hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium">Sign Out</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center mt-8 pb-6">
          <p className="text-xs text-gray-500">Rwanda Land v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">Made with ❤️ for Rwanda</p>
        </div>
      </div>
    </div>
  )
}
