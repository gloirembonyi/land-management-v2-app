"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { MobileApp } from "@/components/mobile/mobile-app"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import type { AuthUser } from "@/lib/auth"

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  // Request notification permission on app load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  if (!currentUser) {
    return <LoginForm onLogin={setCurrentUser} />
  }

  return (
    <NotificationProvider>
      <MobileApp user={currentUser} />
    </NotificationProvider>
  )
}
