"use client"

import { Button } from "@/components/ui/button"
import { MapIcon, List, CreditCard, MessageCircle, User } from "lucide-react"
import type { ViewType } from "./mobile-app"

interface BottomNavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function BottomNavigation({ currentView, onViewChange }: BottomNavigationProps) {
  const navItems = [
    { id: "map" as ViewType, icon: MapIcon, label: "Map" },
    { id: "list" as ViewType, icon: List, label: "Lands" },
    { id: "transactions" as ViewType, icon: CreditCard, label: "Transactions" },
    { id: "chat" as ViewType, icon: MessageCircle, label: "Support" },
    { id: "profile" as ViewType, icon: User, label: "Profile" },
  ]

  return (
    <div className="bg-[#17412b] px-2 py-3 flex items-center justify-around border-t border-[#69d259]/20">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentView === item.id

        return (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 p-3 rounded-xl min-w-[60px] h-16 transition-all duration-200 ${
              isActive
                ? "bg-[#69d259] text-white hover:bg-[#69d259] shadow-lg scale-105"
                : "text-white/70 hover:text-white hover:bg-white/10 hover:scale-105"
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[50px]">
              {item.label}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
