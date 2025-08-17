"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Smartphone, Building, CheckCircle, Clock, XCircle, Receipt } from "lucide-react"
import type { User } from "@/types"

interface PaymentSystemProps {
  user: User
  onNavigate: (view: "dashboard" | "map" | "transactions" | "disputes" | "payments") => void
}

interface Payment {
  id: string
  type: "land_fee" | "transaction_fee" | "verification_fee"
  amount: number
  status: "completed" | "pending" | "failed"
  method: "mtn" | "airtel" | "bank" | "irembo"
  date: string
  reference: string
}

const mockPayments: Payment[] = [
  {
    id: "PAY-001",
    type: "land_fee",
    amount: 25000,
    status: "completed",
    method: "mtn",
    date: "2024-01-15",
    reference: "MTN-789456123",
  },
  {
    id: "PAY-002",
    type: "transaction_fee",
    amount: 15000,
    status: "pending",
    method: "airtel",
    date: "2024-01-14",
    reference: "AIR-456789123",
  },
]

export function PaymentSystem({ user, onNavigate }: PaymentSystemProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mtn" | "airtel" | "bank" | "irembo">("mtn")
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showPaymentForm, setShowPaymentForm] = useState(false)

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

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mtn":
        return <Smartphone className="w-4 h-4 text-yellow-600" />
      case "airtel":
        return <Smartphone className="w-4 h-4 text-red-600" />
      case "bank":
        return <Building className="w-4 h-4 text-blue-600" />
      case "irembo":
        return <CreditCard className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  const handlePayment = () => {
    // Payment processing logic here
    console.log("Processing payment:", { selectedPaymentMethod, amount, phoneNumber })
    setShowPaymentForm(false)
    setAmount("")
    setPhoneNumber("")
  }

  if (showPaymentForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">Make Payment</h1>
          </div>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Choose your payment method and enter details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedPaymentMethod === "mtn" ? "default" : "outline"}
                    onClick={() => setSelectedPaymentMethod("mtn")}
                    className={`${selectedPaymentMethod === "mtn" ? "bg-yellow-600 hover:bg-yellow-700" : ""} flex items-center space-x-2`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>MTN MoMo</span>
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === "airtel" ? "default" : "outline"}
                    onClick={() => setSelectedPaymentMethod("airtel")}
                    className={`${selectedPaymentMethod === "airtel" ? "bg-red-600 hover:bg-red-700" : ""} flex items-center space-x-2`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Airtel Money</span>
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === "bank" ? "default" : "outline"}
                    onClick={() => setSelectedPaymentMethod("bank")}
                    className={`${selectedPaymentMethod === "bank" ? "bg-blue-600 hover:bg-blue-700" : ""} flex items-center space-x-2`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </Button>
                  <Button
                    variant={selectedPaymentMethod === "irembo" ? "default" : "outline"}
                    onClick={() => setSelectedPaymentMethod("irembo")}
                    className={`${selectedPaymentMethod === "irembo" ? "bg-green-600 hover:bg-green-700" : ""} flex items-center space-x-2`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>IremboPay</span>
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
                  Amount (RWF)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {(selectedPaymentMethod === "mtn" || selectedPaymentMethod === "airtel") && (
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="078XXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span>{amount ? `${Number.parseInt(amount).toLocaleString()} RWF` : "0 RWF"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee:</span>
                  <span>{amount ? `${Math.ceil(Number.parseInt(amount) * 0.01).toLocaleString()} RWF` : "0 RWF"}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>
                    {amount
                      ? `${(Number.parseInt(amount) + Math.ceil(Number.parseInt(amount) * 0.01)).toLocaleString()} RWF`
                      : "0 RWF"}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handlePayment}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={
                    !amount || ((selectedPaymentMethod === "mtn" || selectedPaymentMethod === "airtel") && !phoneNumber)
                  }
                >
                  Pay Now
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">Payments</h1>
          </div>
          <Button size="sm" onClick={() => setShowPaymentForm(true)} className="bg-green-600 hover:bg-green-700">
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Now
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-3 mt-4">
            {mockPayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMethodIcon(payment.method)}
                      <div>
                        <h3 className="font-medium capitalize">{payment.type.replace("_", " ")}</h3>
                        <p className="text-sm text-gray-600">Ref: {payment.reference}</p>
                        <p className="text-sm text-gray-500">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {getStatusIcon(payment.status)}
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={payment.status === "completed" ? "bg-green-600" : ""}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="font-medium">{payment.amount.toLocaleString()} RWF</p>
                      {payment.status === "completed" && (
                        <Button variant="ghost" size="sm" className="mt-1 p-0 h-auto">
                          <Receipt className="w-3 h-3 mr-1" />
                          <span className="text-xs">Receipt</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="methods" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-yellow-600" />
                  <span>MTN Mobile Money</span>
                </CardTitle>
                <CardDescription>Pay using your MTN MoMo account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Instant payments</p>
                    <p className="text-sm text-gray-600">Fee: 1% of transaction</p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-red-600" />
                  <span>Airtel Money</span>
                </CardTitle>
                <CardDescription>Pay using your Airtel Money account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Instant payments</p>
                    <p className="text-sm text-gray-600">Fee: 1% of transaction</p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span>IremboPay</span>
                </CardTitle>
                <CardDescription>Government payment platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Secure government payments</p>
                    <p className="text-sm text-gray-600">Fee: 0.5% of transaction</p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>Bank Transfer</span>
                </CardTitle>
                <CardDescription>Direct bank account transfer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">1-2 business days</p>
                    <p className="text-sm text-gray-600">Fee: 500 RWF</p>
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
