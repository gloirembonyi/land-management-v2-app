"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Users,
  MapPin,
  Bell,
  Search,
  Home,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  DollarSign,
  TrendingUp,
  Menu,
  X,
  Sun,
  Moon,
  CreditCard,
} from "lucide-react"
import { PaymentVerificationModal } from "./payment-verification-modal"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/types"
import type { Land, Transaction, AdminNotification } from "@/lib/types"

interface AdminDashboardProps {
  user: User
}

export function AdvancedAdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Data states
  const [pendingLands, setPendingLands] = useState<Land[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])
  const [paymentVerifications, setPaymentVerifications] = useState<Transaction[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [stats, setStats] = useState({
    totalLands: 0,
    pendingApprovals: 0,
    completedTransactions: 0,
    totalValue: 0,
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch pending lands
      const landsResponse = await fetch("/api/admin/pending-lands")
      if (landsResponse.ok) {
        const landsData = await landsResponse.json()
        setPendingLands(landsData.lands || [])
      }

      // Fetch pending transactions
      const transactionsResponse = await fetch("/api/admin/pending-transactions")
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setPendingTransactions(transactionsData.transactions || [])
      }

      const paymentResponse = await fetch("/api/admin/payment-verifications")
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        setPaymentVerifications(paymentData.transactions || [])
      }

      // Fetch notifications
      const notificationsResponse = await fetch("/api/admin/notifications")
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications || [])
      }

      // Update stats
      setStats({
        totalLands: 156, // Mock data
        pendingApprovals: (pendingLands?.length || 0) + (pendingTransactions?.length || 0),
        completedTransactions: 89, // Mock data
        totalValue: 12500000, // Mock data
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveLand = async (landId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-land/${landId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved_by: user.id }),
      })

      if (response.ok) {
        toast({
          title: "Land Approved",
          description: "The land registration has been approved successfully.",
        })
        fetchDashboardData()
      } else {
        throw new Error("Failed to approve land")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve land registration.",
        variant: "destructive",
      })
    }
  }

  const handleRejectLand = async (landId: string) => {
    try {
      const response = await fetch(`/api/admin/reject-land/${landId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved_by: user.id }),
      })

      if (response.ok) {
        toast({
          title: "Land Rejected",
          description: "The land registration has been rejected.",
        })
        fetchDashboardData()
      } else {
        throw new Error("Failed to reject land")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject land registration.",
        variant: "destructive",
      })
    }
  }

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-transaction/${transactionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved_by: user.id }),
      })

      if (response.ok) {
        toast({
          title: "Transaction Approved",
          description: "The transaction has been approved successfully.",
        })
        fetchDashboardData()
      } else {
        throw new Error("Failed to approve transaction")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve transaction.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentVerification = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowPaymentModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-gray-50"} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-emerald-200 border-t-emerald-500"></div>
      </div>
    )
  }

  const themeClasses = {
    background: isDarkMode ? "bg-slate-900" : "bg-gray-50",
    cardBg: isDarkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-gray-200 shadow-sm",
    sidebarBg: isDarkMode ? "bg-black" : "bg-white border-r border-gray-200",
    headerBg: isDarkMode ? "bg-black border-slate-800" : "bg-white border-gray-200",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-slate-400" : "text-gray-600",
    textMuted: isDarkMode ? "text-slate-500" : "text-gray-500",
    inputBg: isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-300",
    hoverBg: isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-50",
    activeBg: isDarkMode ? "bg-emerald-500" : "bg-emerald-500",
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <div className={`min-h-screen ${themeClasses.text} relative`}>
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 bottom-0 w-64 ${themeClasses.sidebarBg} z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className={`text-lg font-bold ${themeClasses.text}`}>LandVest Admin</span>
              </div>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className={`text-xs ${themeClasses.textMuted} uppercase tracking-wider mb-3`}>Admin Panel</div>

            <nav className="space-y-1">
              <div
                className={`${activeTab === "overview" ? themeClasses.activeBg + " text-white" : themeClasses.textSecondary + " " + themeClasses.hoverBg} px-3 py-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-colors`}
                onClick={() => setActiveTab("overview")}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Overview</span>
              </div>
              <div
                className={`${activeTab === "land-approvals" ? themeClasses.activeBg + " text-white" : themeClasses.textSecondary + " " + themeClasses.hoverBg} px-3 py-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-colors`}
                onClick={() => setActiveTab("land-approvals")}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Land Approvals</span>
                {pendingLands.length > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">{pendingLands.length}</Badge>
                )}
              </div>
              <div
                className={`${activeTab === "transactions" ? themeClasses.activeBg + " text-white" : themeClasses.textSecondary + " " + themeClasses.hoverBg} px-3 py-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-colors`}
                onClick={() => setActiveTab("transactions")}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Transactions</span>
                {pendingTransactions.length > 0 && (
                  <Badge className="bg-orange-500 text-white text-xs">{pendingTransactions.length}</Badge>
                )}
              </div>
              <div
                className={`${activeTab === "payment-verification" ? themeClasses.activeBg + " text-white" : themeClasses.textSecondary + " " + themeClasses.hoverBg} px-3 py-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-colors`}
                onClick={() => setActiveTab("payment-verification")}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Payment Verification</span>
                {paymentVerifications.length > 0 && (
                  <Badge className="bg-purple-500 text-white text-xs">{paymentVerifications.length}</Badge>
                )}
              </div>
              <div
                className={`${activeTab === "analytics" ? themeClasses.activeBg + " text-white" : themeClasses.textSecondary + " " + themeClasses.hoverBg} px-3 py-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-colors`}
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Analytics</span>
              </div>
              <div
                className={`${activeTab === "users" ? themeClasses.activeBg + " text-white" : themeClasses.textSecondary + " " + themeClasses.hoverBg} px-3 py-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-colors`}
                onClick={() => setActiveTab("users")}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Users</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Header */}
          <div className={`${themeClasses.headerBg} border-b px-4 lg:px-6 py-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMobileSidebarOpen(true)}>
                  <Menu className="w-4 h-4" />
                </Button>
                <h1 className={`text-xl font-bold ${themeClasses.text}`}>Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="relative hidden sm:block">
                  <Search
                    className={`w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary}`}
                  />
                  <Input
                    placeholder="Search lands, users, transactions..."
                    className={`pl-10 w-48 lg:w-72 ${themeClasses.inputBg} ${themeClasses.text} h-9 rounded-lg`}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <div className="relative">
                  <Bell className={`w-5 h-5 ${themeClasses.textSecondary} hover:${themeClasses.text} cursor-pointer`} />
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-emerald-500 text-white text-sm">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 lg:p-5">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`${themeClasses.textSecondary} text-sm`}>Total Lands</p>
                          <p className={`text-2xl font-bold ${themeClasses.text}`}>{stats.totalLands}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`${themeClasses.textSecondary} text-sm`}>Pending Approvals</p>
                          <p className={`text-2xl font-bold ${themeClasses.text}`}>{stats.pendingApprovals}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`${themeClasses.textSecondary} text-sm`}>Completed Transactions</p>
                          <p className={`text-2xl font-bold ${themeClasses.text}`}>{stats.completedTransactions}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`${themeClasses.textSecondary} text-sm`}>Total Value</p>
                          <p className={`text-2xl font-bold ${themeClasses.text}`}>
                            {formatCurrency(stats.totalValue).slice(0, -3)}M
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                  <CardHeader>
                    <CardTitle className={`${themeClasses.text}`}>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${notification.is_read ? "bg-gray-400" : "bg-emerald-500"}`}
                          ></div>
                          <div className="flex-1">
                            <p className={`${themeClasses.text} text-sm font-medium`}>{notification.title}</p>
                            <p className={`${themeClasses.textSecondary} text-xs`}>{notification.message}</p>
                            <p className={`${themeClasses.textMuted} text-xs mt-1`}>
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "land-approvals" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>Land Registration Approvals</h2>
                  <Badge className="bg-orange-500 text-white">{pendingLands.length} Pending</Badge>
                </div>

                <div className="grid gap-4">
                  {pendingLands.map((land) => (
                    <Card key={land.id} className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>{land.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className={`${themeClasses.textSecondary}`}>Owner: {land.owner_name}</p>
                                <p className={`${themeClasses.textSecondary}`}>Location: {land.location_address}</p>
                                <p className={`${themeClasses.textSecondary}`}>Area: {land.area_size} m²</p>
                              </div>
                              <div>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Price: {land.price ? formatCurrency(land.price) : "Not specified"}
                                </p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Submitted: {new Date(land.created_at).toLocaleDateString()}
                                </p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Documents: {land.documents?.length || 0} files
                                </p>
                              </div>
                            </div>
                            {land.description && (
                              <p className={`${themeClasses.textSecondary} text-sm mt-2`}>{land.description}</p>
                            )}
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800 ml-4">Pending Review</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                              <FileText className="w-4 h-4 mr-2" />
                              Documents ({land.documents?.length || 0})
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleRejectLand(land.id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleApproveLand(land.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pendingLands.length === 0 && (
                    <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                      <CardContent className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <p className={`${themeClasses.textSecondary}`}>No pending land registrations</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>Transaction Approvals</h2>
                  <Badge className="bg-blue-500 text-white">{pendingTransactions.length} Pending</Badge>
                </div>

                <div className="grid gap-4">
                  {pendingTransactions.map((transaction) => (
                    <Card key={transaction.id} className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                              {transaction.land_title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className={`${themeClasses.textSecondary}`}>Seller: {transaction.seller_name}</p>
                                <p className={`${themeClasses.textSecondary}`}>Buyer: {transaction.buyer_name}</p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Location: {transaction.location_address}
                                </p>
                              </div>
                              <div>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Amount: {formatCurrency(transaction.transaction_amount)}
                                </p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Initiated: {new Date(transaction.created_at).toLocaleDateString()}
                                </p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Payment: {transaction.payment_confirmed ? "Confirmed" : "Pending"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`${transaction.payment_confirmed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} ml-4`}
                          >
                            {transaction.payment_confirmed ? "Payment Confirmed" : "Awaiting Payment"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View Land Details
                            </Button>
                            {transaction.blockchain_hash && (
                              <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                                <Shield className="w-4 h-4 mr-2" />
                                Blockchain: {transaction.blockchain_hash.slice(0, 8)}...
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleApproveTransaction(transaction.id)}
                              disabled={!transaction.payment_confirmed}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {transaction.payment_confirmed ? "Complete Transaction" : "Awaiting Payment"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {pendingTransactions.length === 0 && (
                    <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                      <CardContent className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <p className={`${themeClasses.textSecondary}`}>No pending transactions</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "payment-verification" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>Payment Verification</h2>
                  <Badge className="bg-purple-500 text-white">{paymentVerifications.length} Pending</Badge>
                </div>

                <div className="grid gap-4">
                  {paymentVerifications.map((transaction) => (
                    <Card key={transaction.id} className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                              {transaction.land_title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className={`${themeClasses.textSecondary}`}>Seller: {transaction.seller_name}</p>
                                <p className={`${themeClasses.textSecondary}`}>Buyer: {transaction.buyer_name}</p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Location: {transaction.location_address}
                                </p>
                              </div>
                              <div>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Amount: {formatCurrency(transaction.transaction_amount)}
                                </p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Initiated: {new Date(transaction.created_at).toLocaleDateString()}
                                </p>
                                <p className={`${themeClasses.textSecondary}`}>
                                  Status: {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 ml-4">Payment Verification Required</Badge>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-yellow-900">Action Required</p>
                              <p className="text-yellow-800 text-sm">
                                Please contact the seller to verify if they have received the payment from the buyer.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {transaction.blockchain_hash && (
                              <Button size="sm" variant="outline" className="border-slate-300 bg-transparent">
                                <Shield className="w-4 h-4 mr-2" />
                                Blockchain: {transaction.blockchain_hash.slice(0, 8)}...
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              className="bg-purple-500 hover:bg-purple-600"
                              onClick={() => handlePaymentVerification(transaction)}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Verify Payment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {paymentVerifications.length === 0 && (
                    <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                      <CardContent className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <p className={`${themeClasses.textSecondary}`}>No payment verifications pending</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Analytics & Reports</h2>
                <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className={`${themeClasses.textSecondary}`}>Analytics dashboard coming soon</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Management</h2>
                <Card className={`${themeClasses.cardBg} backdrop-blur-sm`}>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className={`${themeClasses.textSecondary}`}>User management coming soon</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {showPaymentModal && selectedTransaction && (
          <PaymentVerificationModal
            transaction={selectedTransaction}
            onClose={() => {
              setShowPaymentModal(false)
              setSelectedTransaction(null)
            }}
            onSuccess={() => {
              fetchDashboardData()
            }}
          />
        )}
      </div>
    </div>
  )
}
