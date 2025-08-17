"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"

interface Notification {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration?: number
}

interface NotificationContextType {
  showNotification: (message: string, type: Notification["type"], duration?: number) => void
  showPushNotification: (title: string, message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((message: string, type: Notification["type"], duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = { id, message, type, duration }

    setNotifications((prev) => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }
  }, [])

  const showPushNotification = useCallback(
    (title: string, message: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/placeholder.svg?height=64&width=64&text=🏞️",
          badge: "/placeholder.svg?height=32&width=32&text=🏞️",
        })
      }
      // Also show in-app notification
      showNotification(`${title}: ${message}`, "info")
    },
    [showNotification],
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-[#69d259]" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-[#c6ecc5] border-[#69d259]"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <NotificationContext.Provider value={{ showNotification, showPushNotification }}>
      {children}

      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${getBgColor(notification.type)} shadow-lg animate-in slide-in-from-right duration-300`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={() => removeNotification(notification.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
