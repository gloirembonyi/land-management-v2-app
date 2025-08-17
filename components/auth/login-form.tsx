"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Fingerprint, Shield, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from "lucide-react"
import type { AuthUser } from "@/lib/auth"

interface LoginFormProps {
  onLogin: (user: AuthUser) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nidaId, setNidaId] = useState("")
  const [password, setPassword] = useState("")
  const [biometricStep, setBiometricStep] = useState(0)
  const [error, setError] = useState("")
  const [showTestCredentials, setShowTestCredentials] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nidaId,
          password,
          biometric: false,
        }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        onLogin(data.user)
      } else {
        setError(data.error || "Invalid NIDA ID or password. Please check your credentials.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricAuth = async () => {
    setIsLoading(true)
    setError("")
    setBiometricStep(1)

    // Simulate biometric steps
    setTimeout(() => setBiometricStep(2), 1000)
    setTimeout(() => setBiometricStep(3), 2000)
    setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nidaId: "1199780123456789", // Use test user for biometric demo
            biometric: true,
          }),
        })

        const data = await response.json()

        if (data.success && data.user) {
          onLogin(data.user)
        } else {
          setError("Biometric authentication failed.")
          setBiometricStep(0)
        }
      } catch (err) {
        console.error("Biometric auth error:", err)
        setError("Biometric authentication failed.")
        setBiometricStep(0)
      } finally {
        setIsLoading(false)
      }
    }, 3000)
  }

  const testCredentials = [
    { nida: "1195432109876543", password: "admin123", role: "Admin", name: "Admin Uwimana" },
    { nida: "1199780123456789", password: "seller123", role: "Seller", name: "Jean Baptiste Seller" },
    { nida: "1198765432109876", password: "buyer123", role: "Buyer", name: "Marie Buyer" },
  ]

  const fillTestCredentials = (nida: string, pass: string) => {
    setNidaId(nida)
    setPassword(pass)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17412b] via-[#69d259] to-[#c6ecc5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-lg"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#17412b] to-[#69d259] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#17412b] to-[#69d259] bg-clip-text text-transparent">
            Rwanda Land
          </CardTitle>
          <CardDescription className="text-gray-600">Secure Digital Land Management System</CardDescription>
          <div className="flex items-center justify-center space-x-2 mt-3">
            <Badge className="bg-[#c6ecc5] text-[#17412b] hover:bg-[#c6ecc5]">
              <CheckCircle className="w-3 h-3 mr-1" />
              NIDA Integrated
            </Badge>
            <Badge className="bg-[#69d259] text-white hover:bg-[#69d259]">
              <Sparkles className="w-3 h-3 mr-1" />
              Blockchain Secured
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTestCredentials(!showTestCredentials)}
              className="w-full text-xs"
            >
              {showTestCredentials ? "Hide" : "Show"} Test Credentials
            </Button>
            {showTestCredentials && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                {testCredentials.map((cred, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="font-medium">
                      {cred.role}: {cred.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fillTestCredentials(cred.nida, cred.password)}
                      className="text-xs h-6 px-2"
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#e5eee9]">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#69d259] data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger
                value="biometric"
                className="data-[state=active]:bg-[#69d259] data-[state=active]:text-white"
              >
                Biometric
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nida" className="text-[#17412b] font-medium">
                    NIDA ID
                  </Label>
                  <Input
                    id="nida"
                    placeholder="1199780123456789"
                    value={nidaId}
                    onChange={(e) => setNidaId(e.target.value)}
                    className="border-[#c6ecc5] focus:border-[#69d259] focus:ring-[#69d259]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#17412b] font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-[#c6ecc5] focus:border-[#69d259] focus:ring-[#69d259]"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[#17412b]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#17412b] to-[#69d259] hover:from-[#69d259] hover:to-[#17412b] text-white shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying with NIDA...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="biometric">
              <div className="space-y-6 text-center">
                <div className="mx-auto w-32 h-32 bg-gradient-to-br from-[#c6ecc5] to-[#e5eee9] rounded-full flex items-center justify-center relative">
                  <Fingerprint
                    className={`w-16 h-16 transition-all duration-500 ${
                      biometricStep === 0
                        ? "text-[#17412b]"
                        : biometricStep === 1
                          ? "text-[#69d259] animate-pulse"
                          : biometricStep === 2
                            ? "text-[#69d259] scale-110"
                            : "text-[#69d259] scale-125"
                    }`}
                  />
                  {biometricStep > 0 && (
                    <div className="absolute inset-0 border-4 border-[#69d259] rounded-full animate-ping"></div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[#17412b] font-medium">
                    {biometricStep === 0 && "Place your finger on the sensor"}
                    {biometricStep === 1 && "Scanning fingerprint..."}
                    {biometricStep === 2 && "Verifying with NIDA..."}
                    {biometricStep === 3 && "Authentication successful!"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {biometricStep === 0 && "Touch and hold for biometric authentication"}
                    {biometricStep === 1 && "Keep your finger steady"}
                    {biometricStep === 2 && "Checking your identity"}
                    {biometricStep === 3 && "Welcome back!"}
                  </p>
                </div>
                <Button
                  onClick={handleBiometricAuth}
                  className="w-full bg-gradient-to-r from-[#17412b] to-[#69d259] hover:from-[#69d259] hover:to-[#17412b] text-white shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    "Use Biometric Login"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
