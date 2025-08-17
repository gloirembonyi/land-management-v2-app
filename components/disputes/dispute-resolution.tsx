"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  FileText,
  Video,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Send,
} from "lucide-react"
import type { User } from "@/types"

interface DisputeResolutionProps {
  user: User
  onNavigate: (view: "dashboard" | "map" | "transactions" | "disputes" | "payments") => void
}

interface Dispute {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved"
  landId: string
  createdAt: string
  abunzi: string
  messages: Array<{
    id: string
    sender: string
    message: string
    timestamp: string
    type: "text" | "document" | "decision"
  }>
}

const mockDisputes: Dispute[] = [
  {
    id: "1",
    title: "Boundary Dispute - Kigali Plot 123",
    description: "Disagreement about the exact boundaries between my land and neighbor's property",
    status: "in_progress",
    landId: "LAND-001",
    createdAt: "2024-01-15",
    abunzi: "Mukamana Jeanne",
    messages: [
      {
        id: "1",
        sender: "Jean Baptiste Uwimana",
        message: "I need help resolving a boundary dispute with my neighbor. The fence seems to be placed incorrectly.",
        timestamp: "2024-01-15 10:30",
        type: "text",
      },
      {
        id: "2",
        sender: "Mukamana Jeanne",
        message:
          "I have reviewed your case. Let's schedule a site visit to examine the boundaries. Please provide the original land documents.",
        timestamp: "2024-01-15 14:20",
        type: "text",
      },
    ],
  },
]

export function DisputeResolution({ user, onNavigate }: DisputeResolutionProps) {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showNewDisputeForm, setShowNewDisputeForm] = useState(false)
  const [newDisputeTitle, setNewDisputeTitle] = useState("")
  const [newDisputeDescription, setNewDisputeDescription] = useState("")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "open":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedDispute) {
      // Add message logic here
      setNewMessage("")
    }
  }

  const handleCreateDispute = () => {
    if (newDisputeTitle.trim() && newDisputeDescription.trim()) {
      // Create dispute logic here
      setShowNewDisputeForm(false)
      setNewDisputeTitle("")
      setNewDisputeDescription("")
    }
  }

  if (showNewDisputeForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setShowNewDisputeForm(false)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">New Dispute</h1>
          </div>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Report a Land Dispute</CardTitle>
              <CardDescription>Describe your dispute and our Abunzi committee will help resolve it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Dispute Title</label>
                <Input
                  placeholder="Brief description of the dispute"
                  value={newDisputeTitle}
                  onChange={(e) => setNewDisputeTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Detailed Description</label>
                <Textarea
                  placeholder="Provide detailed information about the dispute, including dates, parties involved, and specific issues"
                  value={newDisputeDescription}
                  onChange={(e) => setNewDisputeDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Supporting Documents</label>
                <Button variant="outline" className="w-full bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
                <p className="text-xs text-gray-500 mt-1">Upload land titles, photos, or other relevant documents</p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleCreateDispute}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!newDisputeTitle.trim() || !newDisputeDescription.trim()}
                >
                  Submit Dispute
                </Button>
                <Button variant="outline" onClick={() => setShowNewDisputeForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (selectedDispute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedDispute(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900 text-sm">{selectedDispute.title}</h1>
              <p className="text-xs text-gray-500">Abunzi: {selectedDispute.abunzi}</p>
            </div>
            <Badge
              variant={
                selectedDispute.status === "resolved"
                  ? "default"
                  : selectedDispute.status === "in_progress"
                    ? "secondary"
                    : "destructive"
              }
              className={`${selectedDispute.status === "resolved" ? "bg-green-600" : ""} flex items-center space-x-1`}
            >
              {getStatusIcon(selectedDispute.status)}
              <span className="capitalize">{selectedDispute.status.replace("_", " ")}</span>
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedDispute.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === user.name ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] ${message.sender === user.name ? "bg-green-600 text-white" : "bg-white"} rounded-lg p-3 shadow-sm`}
              >
                {message.sender !== user.name && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-gray-200">
                        {message.sender
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">{message.sender}</span>
                  </div>
                )}
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${message.sender === user.name ? "text-green-100" : "text-gray-500"}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border-t p-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              className="bg-green-600 hover:bg-green-700"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
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
            <h1 className="font-semibold text-gray-900">Dispute Resolution</h1>
          </div>
          <Button size="sm" onClick={() => setShowNewDisputeForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Dispute
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Abunzi Committee</h3>
                <p className="text-sm text-gray-600">Traditional mediation for land disputes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">My Disputes</h2>

          {mockDisputes.map((dispute) => (
            <Card
              key={dispute.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDispute(dispute)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{dispute.title}</h3>
                  <Badge
                    variant={
                      dispute.status === "resolved"
                        ? "default"
                        : dispute.status === "in_progress"
                          ? "secondary"
                          : "destructive"
                    }
                    className={`${dispute.status === "resolved" ? "bg-green-600" : ""} flex items-center space-x-1`}
                  >
                    {getStatusIcon(dispute.status)}
                    <span className="capitalize">{dispute.status.replace("_", " ")}</span>
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{dispute.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Abunzi: {dispute.abunzi}</span>
                  <span>Created: {dispute.createdAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {mockDisputes.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Disputes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You don't have any active disputes. If you have a land-related issue, you can report it here.
                </p>
                <Button onClick={() => setShowNewDisputeForm(true)} className="bg-green-600 hover:bg-green-700">
                  Report a Dispute
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
