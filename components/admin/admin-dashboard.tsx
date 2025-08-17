"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Shield, Users, MapPin, CheckCircle, AlertTriangle, DollarSign, Bell, UserCheck, HandCoins } from "lucide-react"
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

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([])
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([])
  const [loading, setLoading] = useState(true)
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "user_verification":
        return <UserCheck className="w-5 h-5 text-blue-600" />
      case "sale_approval":
        return <MapPin className="w-5 h-5 text-orange-600" />
      case "payment_confirmation":
        return <HandCoins className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#69d259]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-[#17412b] to-[#69d259] text-white px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/80">Welcome, {user.name}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white">{notifications.length} Pending</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{unverifiedUsers.length}</p>
                  <p className="text-sm text-gray-600">Unverified Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingSales.length}</p>
                  <p className="text-sm text-gray-600">Pending Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  <p className="text-sm text-gray-600">Notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingSales.reduce((sum, sale) => sum + sale.asking_price, 0) / 1000000}M
                  </p>
                  <p className="text-sm text-gray-600">Pending Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="sales">Pending Sales</TabsTrigger>
            <TabsTrigger value="users">User Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Admin Notifications
                </CardTitle>
                <CardDescription>Review and manage system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.created_at)}</p>
                      </div>
                      <Badge variant="outline">{notification.type.replace("_", " ")}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Pending Land Sales
                </CardTitle>
                <CardDescription>Approve payments and complete land transfers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingSales.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending sales</p>
                  </div>
                ) : (
                  pendingSales.map((sale) => (
                    <div key={sale.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{sale.land_title}</h4>
                          <p className="text-sm text-gray-600">{sale.location}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">Pending Payment</Badge>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Seller</p>
                          <p className="font-medium">{sale.seller_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Buyer</p>
                          <p className="font-medium">{sale.buyer_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price</p>
                          <p className="font-medium">{formatCurrency(sale.asking_price)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium">{formatDate(sale.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprovePayment(sale.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Payment
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Request Info
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Verification
                </CardTitle>
                <CardDescription>Verify new user registrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {unverifiedUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No users pending verification</p>
                  </div>
                ) : (
                  unverifiedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-[#c6ecc5] text-[#17412b]">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">NIDA: {user.nida_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyUser(user.id)}
                          className="bg-[#69d259] hover:bg-[#17412b]"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
