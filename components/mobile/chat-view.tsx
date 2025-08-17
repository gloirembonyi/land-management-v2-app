"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Mic, CheckCircle, Settings } from "lucide-react"
import type { User } from "@/types"

interface ChatViewProps {
  user: User
}

interface Message {
  id: string
  sender: "user" | "ai"
  message: string
  timestamp: string
  type?: "text" | "task"
}

export function ChatView({ user }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      message: "Hello! How can I help you?",
      timestamp: "Yesterday",
    },
    {
      id: "2",
      sender: "user",
      message: "Create a to-do list for the upcoming week for all lands that required my attention.",
      timestamp: "10:30 AM",
    },
    {
      id: "3",
      sender: "user",
      message: "I'd like that to-do list to be openable in a separate window.",
      timestamp: "10:31 AM",
    },
    {
      id: "4",
      sender: "ai",
      message: "Here's a prioritized list of tasks and recommendations for the upcoming week.",
      timestamp: "10:32 AM",
    },
  ])

  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "user",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, message])
      setNewMessage("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          message: "I'll help you with that right away!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1000)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="rounded-full p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#69d259] text-white font-bold">AI</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">LandAI</h1>
            <p className="text-sm text-gray-500">Yesterday</p>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full p-2">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] ${
                message.sender === "user"
                  ? "bg-[#17412b] text-white rounded-2xl rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md"
              } px-4 py-3`}
            >
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Task Card */}
        <Card className="bg-white border border-gray-200 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">To-do list (May 20 - 27)</h3>
              <Button size="sm" className="bg-[#17412b] hover:bg-[#17412b] text-white rounded-full p-2">
                <CheckCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-[#69d259] rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Check land boundaries</p>
                  <p className="text-xs text-gray-500">Kigali Plot • ES-VAL-190346</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-0.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Inspect for boundary issues</p>
                  <p className="text-xs text-gray-500">Nyagatare Land • ES-VAL-001286</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Type your question"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="border-gray-200 rounded-full pr-12 bg-gray-50 focus:bg-white"
            />
          </div>
          <Button
            size="sm"
            className="bg-[#17412b] hover:bg-[#17412b] text-white rounded-full p-3"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
