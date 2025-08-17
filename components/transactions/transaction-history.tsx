"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  BitcoinIcon as Blockchain,
} from "lucide-react"
import type { User, Transaction } from "@/types"
import { mockTransactions } from "@/lib/mock-data"

interface TransactionHistoryProps {
  user: User
  onNavigate: (view: "dashboard" | "map" | "transactions" | "disputes" | "payments") => void
}

export function TransactionHistory({ user, onNavigate }: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const userTransactions = mockTransactions.filter((tx) => tx.buyer === user.name || tx.seller === user.name)

  const filteredTransactions = userTransactions.filter(
    (tx) =>
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.landId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getTransactionIcon = (type: string, isBuyer: boolean) => {
    if (type === "sale" || type === "purchase") {
      return isBuyer ? (
        <ArrowDownLeft className="w-4 h-4 text-red-600" />
      ) : (
        <ArrowUpRight className="w-4 h-4 text-green-600" />
      )
    }
    return <FileText className="w-4 h-4 text-blue-600" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">Transactions</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transaction Tabs */}
      <div className="px-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredTransactions.map((transaction) => {
              const isBuyer = transaction.buyer === user.name
              return (
                <Card
                  key={transaction.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type, isBuyer)}
                        <div>
                          <h3 className="font-medium capitalize">{transaction.type}</h3>
                          <p className="text-sm text-gray-600">Land ID: {transaction.landId}</p>
                          <p className="text-sm text-gray-500">
                            {isBuyer ? `From: ${transaction.seller}` : `To: ${transaction.buyer}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {getStatusIcon(transaction.status)}
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={transaction.status === "completed" ? "bg-green-600" : ""}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="font-medium">{(transaction.amount / 1000000).toFixed(1)}M RWF</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {filteredTransactions
              .filter((tx) => tx.status === "pending")
              .map((transaction) => {
                const isBuyer = transaction.buyer === user.name
                return (
                  <Card key={transaction.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type, isBuyer)}
                          <div>
                            <h3 className="font-medium capitalize">{transaction.type}</h3>
                            <p className="text-sm text-gray-600">Land ID: {transaction.landId}</p>
                            <p className="text-sm text-gray-500">
                              {isBuyer ? `From: ${transaction.seller}` : `To: ${transaction.buyer}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                          <p className="font-medium">{(transaction.amount / 1000000).toFixed(1)}M RWF</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {filteredTransactions
              .filter((tx) => tx.status === "completed")
              .map((transaction) => {
                const isBuyer = transaction.buyer === user.name
                return (
                  <Card key={transaction.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type, isBuyer)}
                          <div>
                            <h3 className="font-medium capitalize">{transaction.type}</h3>
                            <p className="text-sm text-gray-600">Land ID: {transaction.landId}</p>
                            <p className="text-sm text-gray-500">
                              {isBuyer ? `From: ${transaction.seller}` : `To: ${transaction.buyer}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-600 mb-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                          <p className="font-medium">{(transaction.amount / 1000000).toFixed(1)}M RWF</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>

          <TabsContent value="failed" className="space-y-3 mt-4">
            {filteredTransactions
              .filter((tx) => tx.status === "failed")
              .map((transaction) => {
                const isBuyer = transaction.buyer === user.name
                return (
                  <Card key={transaction.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type, isBuyer)}
                          <div>
                            <h3 className="font-medium capitalize">{transaction.type}</h3>
                            <p className="text-sm text-gray-600">Land ID: {transaction.landId}</p>
                            <p className="text-sm text-gray-500">
                              {isBuyer ? `From: ${transaction.seller}` : `To: ${transaction.buyer}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-1">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                          <p className="font-medium">{(transaction.amount / 1000000).toFixed(1)}M RWF</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <Card className="w-full max-w-md rounded-t-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{selectedTransaction.type} Transaction</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(null)}>
                  ×
                </Button>
              </div>
              <CardDescription>Transaction ID: {selectedTransaction.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{(selectedTransaction.amount / 1000000).toFixed(1)}M RWF</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="capitalize">{selectedTransaction.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Buyer</p>
                  <p className="font-medium text-sm">{selectedTransaction.buyer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium text-sm">{selectedTransaction.seller}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Smart Contract</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {selectedTransaction.smartContractAddress}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Blockchain Hash</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {selectedTransaction.blockchainTxHash}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                  <Blockchain className="w-4 h-4 mr-2" />
                  Verify on Blockchain
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Download Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
