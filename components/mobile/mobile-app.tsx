"use client"

import { useState } from "react"
import { MapView } from "./map-view"
import { EnhancedListView } from "./enhanced-list-view"
import { TransactionsView } from "./transactions-view"
import { ChatView } from "./chat-view"
import { ProfileView } from "./profile-view"
import { BottomNavigation } from "./bottom-navigation"
import { AdvancedAdminDashboard } from "@/components/admin/advanced-admin-dashboard"
import type { User } from "@/types"

interface MobileAppProps {
  user: User
}

export type ViewType = "map" | "list" | "transactions" | "chat" | "profile"

export function MobileApp({ user }: MobileAppProps) {
  const [currentView, setCurrentView] = useState<ViewType>("list")

  if (user.role === "admin") {
    return <AdvancedAdminDashboard user={user} />
  }

  const renderView = () => {
    switch (currentView) {
      case "map":
        return <MapView user={user} />
      case "list":
        return <EnhancedListView user={user} />
      case "transactions":
        return <TransactionsView user={user} />
      case "chat":
        return <ChatView user={user} />
      case "profile":
        return <ProfileView user={user} />
      default:
        return <EnhancedListView user={user} />
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Status Bar */}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{renderView()}</div>

      {/* Bottom Navigation */}
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}
