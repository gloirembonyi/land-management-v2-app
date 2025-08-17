"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Shield,
  Users,
  MapPin,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Bell,
  UserCheck,
  HandCoins,
  TrendingUp,
  Activity,
  Search,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Clock,
  ArrowUpRight,
  Eye,
} from "lucide-react"
import type { User } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface AdminDashboardProps {
  user: User
}

interface AdminNotification {
  id: string
  type: "user_verification" | "sale_approval" | "payment_confirmation"
  title: string
  message: string
  related_user_id?: string
  related_sale_id?: string
  status: "pending" | "reviewed" | "completed"
  created_at: string
}

interface PendingSale {
  id: string
  land_title: string
  location: string
  asking_price: number
  seller_name: string
  buyer_name: string
  created_at: string
}

interface UnverifiedUser {
  id: string
  name: string
  email: string
  nida_id: string
  role: string
  created_at: string
}

interface DashboardStats {
  totalUsers: number
  verifiedUsers: number
  totalLands: number
  activeSales: number
  totalRevenue: number
  monthlyGrowth: number
}

export function ModernAdminDashboard({ user }: AdminDashboardProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([])
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalLands: 0,
    activeSales: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [notificationsRes, salesRes, usersRes] = await Promise.all([
        fetch("/api/admin-notifications"),
        fetch("/api/admin/pending-sales"),
        fetch("/api/admin/unverified-users"),
      ])

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        setNotifications(notificationsData)
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json()
        setPendingSales(salesData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUnverifiedUsers(usersData)
      }

      // Calculate stats
      setStats({
        totalUsers: 156,
        verifiedUsers: 142,
        totalLands: 89,
        activeSales: pendingSales.length,
        totalRevenue: pendingSales.reduce((sum, sale) => sum + sale.asking_price, 0),
        monthlyGrowth: 12.5,
      })
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/verify-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: user.id }),
      })

      if (response.ok) {
        toast({
          title: "User Verified",
          description: "User has been successfully verified.",
        })
        fetchAdminData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify user.",
        variant: "destructive",
      })
    }
  }

  const handleApprovePayment = async (saleId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-payment/${saleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: user.id }),
      })

      if (response.ok) {
        toast({
          title: "Payment Approved",
          description: "Land sale has been completed successfully.",
        })
        fetchAdminData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve payment.",
        variant: "destructive",
      })
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 z-50">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LandAdmin</h1>
              <p className="text-xs text-slate-400">Rwanda Land Management</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "overview", label: "Overview", icon: Home },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "users", label: "Users", icon: Users },
              { id: "sales", label: "Sales", icon: MapPin },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-xl">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-emerald-500 text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <div className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "analytics" && "Analytics & Reports"}
                {activeTab === "users" && "User Management"}
                {activeTab === "sales" && "Land Sales"}
                {activeTab === "notifications" && "Notifications"}
                {activeTab === "settings" && "Settings"}
              </h1>
              <p className="text-slate-400">
                {new Date().toLocaleDateString("en-RW", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 w-80"
                />
              </div>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                <Bell className="w-4 h-4 mr-2" />
                {notifications.length}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                        <div className="flex items-center mt-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-400 mr-1" />
                          <span className="text-emerald-400 text-sm">+{stats.monthlyGrowth}%</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Active Sales</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.activeSales}</p>
                        <div className="flex items-center mt-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-400 mr-1" />
                          <span className="text-emerald-400 text-sm">+8.2%</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {formatCurrency(stats.totalRevenue).slice(0, -3)}M
                        </p>
                        <div className="flex items-center mt-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-400 mr-1" />
                          <span className="text-emerald-400 text-sm">+15.3%</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Pending Actions</p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {notifications.length + unverifiedUsers.length}
                        </p>
                        <div className="flex items-center mt-2">
                          <Clock className="w-4 h-4 text-orange-400 mr-1" />
                          <span className="text-orange-400 text-sm">Requires attention</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <Bell className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{notification.title}</p>
                          <p className="text-slate-400 text-xs mt-1">{formatDate(notification.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Verify {unverifiedUsers.length} Users
                    </Button>
                    <Button className="w-full justify-start bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                      <HandCoins className="w-4 h-4 mr-2" />
                      Review {pendingSales.length} Sales
                    </Button>
                    <Button className="w-full justify-start bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  User Verification
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Verify new user registrations and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {unverifiedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No users pending verification</p>
                  </div>
                ) : (
                  unverifiedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-emerald-500 text-white">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-white">{user.name}</h4>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          <p className="text-xs text-slate-500">NIDA: {user.nida_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{user.role}</Badge>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyUser(user.id)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "sales" && (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
                  Pending Land Sales
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Approve payments and complete land transfers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingSales.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No pending sales</p>
                  </div>
                ) : (
                  pendingSales.map((sale) => (
                    <div key={sale.id} className="p-6 bg-slate-700/30 rounded-xl border border-slate-600/50 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-white text-lg">{sale.land_title}</h4>
                          <p className="text-slate-400">{sale.location}</p>
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Pending Payment</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm">Seller</p>
                          <p className="font-medium text-white">{sale.seller_name}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm">Buyer</p>
                          <p className="font-medium text-white">{sale.buyer_name}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm">Price</p>
                          <p className="font-medium text-emerald-400">{formatCurrency(sale.asking_price)}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-slate-400 text-sm">Date</p>
                          <p className="font-medium text-white">{formatDate(sale.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleApprovePayment(sale.id)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Payment
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Request Info
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-purple-400" />
                  System Notifications
                </CardTitle>
                <CardDescription className="text-slate-400">Review and manage all system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No pending notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50"
                    >
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{notification.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{notification.message}</p>
                        <p className="text-slate-500 text-xs mt-2">{formatDate(notification.created_at)}</p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {notification.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
