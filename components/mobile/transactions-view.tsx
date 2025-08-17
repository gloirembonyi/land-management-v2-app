"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MessageCircle,
  Eye,
} from "lucide-react"
import type { User } from "@/types"
import { SellerContactAdmin } from "./seller-contact-admin"
import { TransactionDetailsModal } from "./transaction-details-modal"

interface Transaction {
  id: string
  land_id: string
  buyer_id: string
  seller_id: string
  amount: number
  status: "pending" | "payment_verification" | "completed" | "rejected"
  created_at: string
  updated_at: string
  land_title?: string
  buyer_name?: string
  seller_name?: string
  qr_code?: string
  blockchain_hash?: string
}

interface TransactionsViewProps {
  user: User
}

export function TransactionsView({ user }: TransactionsViewProps) {
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "pending" | "payment_verification" | "rejected"
  >("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showContactAdmin, setShowContactAdmin] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [user.id])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => filterStatus === "all" || tx.status === filterStatus)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-[#69d259]" />
      case "pending":
      case "payment_verification":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getTransactionIcon = (isBuyer: boolean) => {
    return isBuyer ? (
      <ArrowDownLeft className="w-5 h-5 text-red-500" />
    ) : (
      <ArrowUpRight className="w-5 h-5 text-[#69d259]" />
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#69d259] text-white"
      case "pending":
        return "bg-blue-500 text-white"
      case "payment_verification":
        return "bg-yellow-500 text-white"
      case "rejected":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "payment_verification":
        return "Payment Verification"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#17412b] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="rounded-full border-gray-200 bg-transparent">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full border-gray-200 bg-transparent">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {["all", "pending", "payment_verification", "completed", "rejected"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterStatus(status as any)}
              className={`flex-shrink-0 rounded-lg text-xs px-3 ${
                filterStatus === status ? "bg-[#17412b] text-white" : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : getStatusText(status)}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTransactions.map((transaction) => {
          const isBuyer = transaction.buyer_id === user.id
          const isSeller = transaction.seller_id === user.id
          return (
            <Card key={transaction.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(isBuyer)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{isBuyer ? "Land Purchase" : "Land Sale"}</h3>
                      <Badge className={`${getStatusColor(transaction.status)} rounded-full px-2 py-1 text-xs`}>
                        {getStatusText(transaction.status)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {transaction.land_title || `Land ID: ${transaction.land_id}`}
                    </p>

                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">
                        {isBuyer
                          ? `From: ${transaction.seller_name || "Unknown"}`
                          : `To: ${transaction.buyer_name || "Unknown"}`}
                      </p>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{(transaction.amount / 1000000).toFixed(1)}M RWF</p>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetails(transaction)}
                        className="flex-1 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>

                      {isSeller && transaction.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactAdmin(transaction.id)}
                          className="flex-1 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Contact Admin
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No Transactions</h3>
            <p className="text-gray-600 text-sm">
              {filterStatus === "all"
                ? "You haven't made any transactions yet"
                : `No ${getStatusText(filterStatus).toLowerCase()} transactions found`}
            </p>
          </div>
        )}
      </div>

      {showContactAdmin && (
        <SellerContactAdmin
          transactionId={showContactAdmin}
          onClose={() => setShowContactAdmin(null)}
          onSuccess={() => {
            setShowContactAdmin(null)
            fetchTransactions()
          }}
        />
      )}

      {showDetails && (
        <TransactionDetailsModal
          transaction={showDetails}
          onClose={() => setShowDetails(null)}
          currentUserId={user.id}
        />
      )}
    </div>
  )
}
