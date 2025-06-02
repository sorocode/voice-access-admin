"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MemberManagement } from "@/components/member-management"
import { AccessLogs } from "@/components/access-logs"
import { Dashboard } from "@/components/dashboard"
import { LoginPage } from "@/components/login-page"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = (username: string, password: string) => {
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setActiveTab("dashboard")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "members":
        return <MemberManagement />
      case "access-logs":
        return <AccessLogs />
      default:
        return <Dashboard />
    }
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
