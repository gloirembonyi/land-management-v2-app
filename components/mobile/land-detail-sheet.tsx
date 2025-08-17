"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, MapPin, TrendingUp, Droplets, Thermometer, Activity, Leaf, ArrowRight } from "lucide-react"
import type { LandParcel } from "@/types"

interface LandDetailSheetProps {
  land: LandParcel
  isOpen: boolean
  onClose: () => void
}

export function LandDetailSheet({ land, isOpen, onClose }: LandDetailSheetProps) {
  if (!isOpen) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-[#69d259] text-white"
      case "pending":
        return "bg-yellow-500 text-white"
      case "disputed":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full p-2">
              <X className="w-5 h-5" />
            </Button>
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Land Image */}
        <div className="px-4 pb-4">
          <div className="relative h-48 bg-gradient-to-br from-[#c6ecc5] to-[#69d259] rounded-2xl overflow-hidden mb-4">
            <img
              src="/placeholder.svg?height=200&width=400&text=Land+View"
              alt={land.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <Badge className={`absolute top-4 left-4 ${getStatusColor(land.status)} rounded-full px-3 py-1`}>
              {land.status}
            </Badge>
          </div>

          {/* Land Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{land.title}</h2>
            <p className="text-gray-600 flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {land.location}
            </p>
            <p className="text-sm text-gray-500">Land ID: {land.id}</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
            <Button className="flex-1 bg-[#17412b] text-white rounded-lg py-2 text-sm font-medium">Overview</Button>
            <Button variant="ghost" className="flex-1 text-gray-600 rounded-lg py-2 text-sm font-medium">
              Analysis
            </Button>
            <Button variant="ghost" className="flex-1 text-gray-600 rounded-lg py-2 text-sm font-medium">
              Documents
            </Button>
            <Button variant="ghost" className="flex-1 text-gray-600 rounded-lg py-2 text-sm font-medium">
              History
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <Card className="bg-white border border-gray-100 rounded-xl">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Area</p>
                <p className="text-sm font-bold text-gray-900">{(land.area / 1000).toFixed(1)}k m²</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 rounded-xl">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Thermometer className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Value</p>
                <p className="text-sm font-bold text-gray-900">{(land.value / 1000000).toFixed(1)}M</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 rounded-xl">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-sm font-bold text-gray-900 capitalize">{land.status}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 rounded-xl">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="text-sm font-bold text-gray-900">Residential</p>
              </CardContent>
            </Card>
          </div>

          {/* Land Details Card */}
          <Card className="bg-white border border-gray-100 rounded-xl mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <img
                  src="/placeholder.svg?height=60&width=60&text=🏞️"
                  alt="Land thumbnail"
                  className="w-15 h-15 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {land.title} {land.id}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">Last updated: {new Date().toLocaleDateString()}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />+{(land.value / 1000000).toFixed(1)}M RWF
                    </span>
                  </div>
                </div>
                <Button size="sm" className="bg-[#17412b] hover:bg-[#17412b] text-white rounded-full p-2">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Growth Chart Placeholder */}
          <Card className="bg-white border border-gray-100 rounded-xl mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Value Growth</h3>
                  <p className="text-sm text-gray-600">2.5% increase</p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1 rounded-full">
                    W
                  </Button>
                  <Button size="sm" className="text-xs px-2 py-1 rounded-full bg-gray-900 text-white">
                    M
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1 rounded-full">
                    Y
                  </Button>
                </div>
              </div>

              {/* Simple bar chart */}
              <div className="flex items-end space-x-1 h-20">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#69d259] rounded-t"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  ></div>
                ))}
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Apr. 20</span>
                <span>May. 20</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pb-6">
            <Button className="flex-1 bg-[#17412b] hover:bg-[#17412b] text-white rounded-xl py-3">
              View on Blockchain
            </Button>
            <Button variant="outline" className="flex-1 border-gray-200 rounded-xl py-3 bg-transparent">
              Share Land
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
