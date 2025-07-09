"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  EyeOff,
  Check,
  TrendingUp,
  Store,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Copy,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { OrderNotification } from "@/components/order-notification"
import { AdminOrderAlert } from "@/components/admin-order-alert"
import type { VisitorLog } from "@/lib/supabase"
import Image from "next/image"
import { EnhancedMenuManagement } from "@/components/enhanced-menu-management"
import { SalesAnalytics } from "@/components/sales-analytics"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { AdminPOS } from "@/components/admin-pos"
import type { Product } from "@/lib/supabase"

interface AdminPageState {
  visitors: VisitorLog[]
  products: Product[]
  visitorsError: string | null
  productsError: string | null
  productsLoading: boolean
  visitorsLoading: boolean
  connectionStatus: "online" | "offline" | "checking"
  acknowledgedOrderCount: number
}

const CORRECT_API_KEY = "8frugfboO2fU0C_cEQLMtPXI3FmijRTYgLVvG-nmMrc"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempting, setLoginAttempting] = useState(false)
  const [keycopied, setKeyCopied] = useState(false)
  const { toast } = useToast()
  const { orders, loading, newOrderAlert, clearNewOrderAlert, error: ordersError } = useRealtimeOrders()

  const [state, setState] = useState<AdminPageState>({
    visitors: [],
    products: [],
    visitorsError: null,
    productsError: null,
    productsLoading: false,
    visitorsLoading: false,
    connectionStatus: "checking",
    acknowledgedOrderCount: 0,
  })

  const {
    isAuthenticated,
    login,
    logout,
    getAuthHeaders,
    isLoading,
    error: authError,
    hasValidKey,
    validateSession,
  } = useAdminAuth()

  // Computed values
  const pendingOrders = orders.filter((order) => order.status === "pending")
  const completedOrders = orders.filter((order) => order.status === "completed")
  const counterPaymentOrders = pendingOrders.filter((order) => order.payment_method === "Pay at Counter")
  const todayVisitors = state.visitors.filter(
    (visitor) => new Date(visitor.visited_at).toDateString() === new Date().toDateString(),
  )
  const newOrderCount = Math.max(0, pendingOrders.length - state.acknowledgedOrderCount)

  // Copy API key to clipboard
  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(CORRECT_API_KEY)
      setKeyCopied(true)
      toast({
        title: "API Key Copied",
        description: "The admin API key has been copied to your clipboard",
      })
      setTimeout(() => setKeyCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy API key:", error)
      toast({
        title: "Copy Failed",
        description: "Could not copy API key to clipboard",
        variant: "destructive",
      })
    }
  }

  // Event handlers
  const handleAcknowledgeOrders = () => {
    setState((prev) => ({ ...prev, acknowledgedOrderCount: pendingOrders.length }))
  }

  const handleLogin = async () => {
    if (!password.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an API key",
        variant: "destructive",
      })
      return
    }

    setLoginAttempting(true)
    console.log("\n🔐 === ADMIN LOGIN ATTEMPT ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Provided key preview:", password.trim().substring(0, 15) + "...")
    console.log("Expected key preview:", CORRECT_API_KEY.substring(0, 15) + "...")
    console.log("Key lengths match:", password.trim().length === CORRECT_API_KEY.length)

    try {
      const success = await login(password.trim())

      if (success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to Sol Kaffe admin dashboard",
        })
        setPassword("") // Clear password field
        console.log("✅ Admin login successful")
      } else {
        console.log("❌ Admin login failed")
        // Error message is already set by the login function
      }
    } catch (error) {
      console.error("💥 Admin login error:", error)
      toast({
        title: "Login Error",
        description: "An unexpected error occurred during login",
        variant: "destructive",
      })
    } finally {
      setLoginAttempting(false)
      console.log("=== ADMIN LOGIN ATTEMPT END ===\n")
    }
  }

  const checkNetworkConnection = async () => {
    setState((prev) => ({ ...prev, connectionStatus: "checking" }))
    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
        signal: AbortSignal.timeout(5000),
      })
      setState((prev) => ({
        ...prev,
        connectionStatus: response.ok ? "online" : "offline",
      }))
    } catch (error) {
      console.warn("Network check failed:", error)
      setState((prev) => ({ ...prev, connectionStatus: "offline" }))
    }
  }

  const fetchProducts = async (retryCount = 0) => {
    const maxRetries = 3
    setState((prev) => ({ ...prev, productsLoading: true, productsError: null }))

    try {
      console.log(`\n🔄 === FETCHING PRODUCTS (attempt ${retryCount + 1}) ===`)

      if (state.connectionStatus === "offline") {
        throw new Error("No network connection")
      }

      const headers = getAuthHeaders()
      console.log("📤 Request headers keys:", Object.keys(headers))
      console.log("📤 API key preview:", headers["x-api-key"]?.substring(0, 15) + "...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log("⏰ Products fetch timeout")
        controller.abort()
      }, 15000)

      const response = await fetch("/api/admin/products", {
        method: "GET",
        headers: {
          ...headers,
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("📡 Products API response:")
      console.log("- Status:", response.status)
      console.log("- Status text:", response.statusText)
      console.log("- OK:", response.ok)
      console.log("- Content type:", response.headers.get("content-type"))

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetails = null

        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          errorDetails = errorData.details || errorData.debug
          console.log("❌ API Error details:", errorData)
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError)
        }

        if (response.status === 401) {
          console.log("🔐 Authentication failed, logging out...")
          logout()
          throw new Error("Authentication failed - please log in again")
        }

        throw new Error(errorMessage + (errorDetails ? ` (${JSON.stringify(errorDetails)})` : ""))
      }

      const responseText = await response.text()
      console.log("📄 Raw response length:", responseText.length)

      if (!responseText.trim()) {
        throw new Error("Empty response from server")
      }

      let data: any
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse products response:", parseError)
        console.error("Response preview:", responseText.substring(0, 500))
        throw new Error("Invalid JSON response from server")
      }

      if (data.error) {
        console.warn("API returned error in successful response:", data)
        throw new Error(data.error + (data.details ? ` (${data.details})` : ""))
      }

      const productsArray = data.data || data

      if (!Array.isArray(productsArray)) {
        console.error("Products data is not an array:", typeof productsArray)
        throw new Error("Invalid data format received from server")
      }

      console.log(`✅ Successfully fetched ${productsArray.length} products`)
      console.log("=== PRODUCTS FETCH END ===\n")

      setState((prev) => ({
        ...prev,
        products: productsArray,
        productsError: null,
      }))
    } catch (error) {
      console.error("💥 Products fetch error:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      if (
        retryCount < maxRetries &&
        (errorMessage.includes("fetch") ||
          errorMessage.includes("network") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("aborted"))
      ) {
        console.log(`🔄 Retrying products fetch in ${(retryCount + 1) * 1000}ms...`)
        setTimeout(
          () => {
            fetchProducts(retryCount + 1)
          },
          (retryCount + 1) * 1000,
        )
        return
      }

      setState((prev) => ({
        ...prev,
        productsError: errorMessage,
        products: [],
      }))
    } finally {
      setState((prev) => ({ ...prev, productsLoading: false }))
    }
  }

  const fetchVisitors = async (retryCount = 0) => {
    const maxRetries = 3
    setState((prev) => ({ ...prev, visitorsLoading: true, visitorsError: null }))

    try {
      console.log(`🔄 Fetching visitors (attempt ${retryCount + 1})`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch("/api/analytics/visitors", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("📡 Visitors API response:", {
        status: response.status,
        ok: response.ok,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Non-JSON response from visitors API:", textResponse.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setState((prev) => ({
        ...prev,
        visitors: Array.isArray(data) ? data : [],
        visitorsError: null,
      }))
    } catch (error) {
      console.error("Error fetching visitors:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      if (
        retryCount < maxRetries &&
        (errorMessage.includes("fetch") ||
          errorMessage.includes("network") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("aborted"))
      ) {
        console.log(`🔄 Retrying visitors fetch in ${(retryCount + 1) * 1000}ms...`)
        setTimeout(
          () => {
            fetchVisitors(retryCount + 1)
          },
          (retryCount + 1) * 1000,
        )
        return
      }

      setState((prev) => ({
        ...prev,
        visitorsError: errorMessage,
        visitors: [],
      }))
    } finally {
      setState((prev) => ({ ...prev, visitorsLoading: false }))
    }
  }

  const updateOrderStatus = async (orderId: string, status: "completed" | "cancelled") => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
      }

      toast({
        title: "Order updated",
        description: `Order marked as ${status}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleRefreshData = () => {
    if (isAuthenticated) {
      checkNetworkConnection()
      fetchProducts()
      fetchVisitors()
    }
  }

  // Effects
  useEffect(() => {
    checkNetworkConnection()
  }, [])

  useEffect(() => {
    if (isAuthenticated && hasValidKey) {
      console.log("🔄 User authenticated, fetching data...")
      fetchProducts()
      fetchVisitors()
    }
  }, [isAuthenticated, hasValidKey])

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, connectionStatus: "online" }))
      if (isAuthenticated) {
        fetchProducts()
        fetchVisitors()
      }
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, connectionStatus: "offline" }))
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isAuthenticated])

  // Validate session periodically
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(
        () => {
          validateSession()
        },
        5 * 60 * 1000,
      ) // Check every 5 minutes

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, validateSession])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center"
        >
          <div className="mb-8">
            <Image
              src="/sol-kaffe-logo.png"
              alt="Sol Kaffé"
              width={200}
              height={80}
              className="h-16 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SOL KAFFE</h1>
            <p className="text-gray-500">Admin Access</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Authentication Error</span>
              </div>
              <p className="text-sm text-red-700">{authError}</p>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-left text-sm font-medium text-gray-700 mb-3">Admin API Key</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loginAttempting && handleLogin()}
                placeholder="Enter your API key"
                className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors text-center border-gray-200"
                disabled={loginAttempting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:bg-gray-100 rounded-full p-2"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginAttempting}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-2xl py-4 text-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!password.trim() || loginAttempting}
          >
            {loginAttempting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Access Admin Panel"
            )}
          </Button>

          <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs text-gray-600 mb-3">
              <strong>Admin API Key Required</strong>
            </p>
            <div className="flex items-center gap-2 mb-2">
              <code className="bg-gray-200 px-2 py-1 rounded text-xs break-all flex-1 font-mono">
                {CORRECT_API_KEY}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyApiKey}
                className="p-1 h-auto rounded"
                title="Copy API key"
              >
                {keycopied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Click the copy button to copy the API key to your clipboard</p>
          </div>

          {/* Debug Information */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-2xl text-left">
              <p className="text-xs text-blue-800 font-medium mb-2">Debug Info:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>Expected key length: {CORRECT_API_KEY.length}</p>
                <p>Current input length: {password.length}</p>
                <p>Keys match: {password.trim() === CORRECT_API_KEY ? "✅" : "❌"}</p>
                <p>Auth state: {isAuthenticated ? "authenticated" : "not authenticated"}</p>
                <p>Has valid key: {hasValidKey ? "yes" : "no"}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Main admin interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/sol-kaffe-logo.png" alt="Sol Kaffé Admin" width={120} height={40} className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-medium text-gray-900">SOL KAFFE</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {state.connectionStatus === "online" && <Wifi className="w-4 h-4 text-green-600" />}
              {state.connectionStatus === "offline" && <WifiOff className="w-4 h-4 text-red-600" />}
              {state.connectionStatus === "checking" && <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />}
              <span
                className={`text-sm ${
                  state.connectionStatus === "online"
                    ? "text-green-600"
                    : state.connectionStatus === "offline"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {state.connectionStatus === "online"
                  ? "Online"
                  : state.connectionStatus === "offline"
                    ? "Offline"
                    : "Checking..."}
              </span>
            </div>

            {/* Auth Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hasValidKey ? "bg-green-500" : "bg-yellow-500"}`} />
              <span className="text-sm text-gray-600">{hasValidKey ? "Authenticated" : "Session Invalid"}</span>
            </div>

            <Button
              variant="outline"
              onClick={handleRefreshData}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
              disabled={state.productsLoading || state.visitorsLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${state.productsLoading || state.visitorsLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <OrderNotification newOrderCount={newOrderCount} onAcknowledge={handleAcknowledgeOrders} />
      <AdminOrderAlert newOrder={newOrderAlert} onDismiss={clearNewOrderAlert} />

      <div className="p-6">
        {/* Error Messages */}
        {(ordersError || state.visitorsError || state.productsError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">API Connection Issues</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshData}
                className="ml-auto text-red-700 border-red-300 hover:bg-red-50 bg-transparent rounded-xl"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
            {ordersError && <p className="text-sm text-red-700">Orders: {ordersError}</p>}
            {state.visitorsError && <p className="text-sm text-red-700">Visitors: {state.visitorsError}</p>}
            {state.productsError && <p className="text-sm text-red-700">Products: {state.productsError}</p>}
            {state.connectionStatus === "offline" && (
              <p className="text-sm text-red-700 mt-2">
                ⚠️ You appear to be offline. Some features may not work properly.
              </p>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Counter Payment</p>
                  <p className="text-3xl font-bold text-gray-900">{counterPaymentOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed Today</p>
                  <p className="text-3xl font-bold text-gray-900">{completedOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Revenue Today</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₱{completedOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <div className="flex gap-8 border-b border-gray-200">
            <TabsList className="bg-transparent border-0 p-0">
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none pb-2 text-gray-400 hover:text-gray-600"
              >
                Live Orders
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none pb-2 text-gray-400 hover:text-gray-600"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="menu"
                className="data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none pb-2 text-gray-400 hover:text-gray-600"
              >
                Menu Management
              </TabsTrigger>
              <TabsTrigger
                value="pos"
                className="data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none pb-2 text-gray-400 hover:text-gray-600"
              >
                POS System
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  Live Orders
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 rounded-full">
                    {pendingOrders.length} pending
                  </Badge>
                  {counterPaymentOrders.length > 0 && (
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800 rounded-full">
                      {counterPaymentOrders.length} need payment
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending orders</h3>
                    <p className="text-gray-500">New orders will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {pendingOrders.map((order) => {
                        const isCounterPayment = order.payment_method === "Pay at Counter"
                        return (
                          <motion.div
                            key={order.id}
                            className={`p-6 border rounded-2xl ${
                              isCounterPayment ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</h3>
                                  <Badge
                                    variant={isCounterPayment ? "destructive" : "secondary"}
                                    className={`rounded-full ${
                                      isCounterPayment ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {order.payment_method}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">Customer: {order.customer_name || "Anonymous"}</p>
                                <p className="text-sm text-gray-600">
                                  Ordered: {new Date(order.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">₱{order.total.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">{order.items.length} items</p>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-700">
                                    {item.quantity}x {item.name}
                                    {item.variations && item.variations.length > 0 && (
                                      <span className="text-gray-500">
                                        {" "}
                                        ({item.variations.map((v) => v.name).join(", ")})
                                      </span>
                                    )}
                                    {item.add_ons && item.add_ons.length > 0 && (
                                      <span className="text-gray-500">
                                        {" "}
                                        + {item.add_ons.map((a) => a.name).join(", ")}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-gray-900 font-medium">₱{item.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateOrderStatus(order.id, "completed")}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl flex-1"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Mark Complete
                              </Button>
                              <Button
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl bg-transparent"
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="menu">
            <EnhancedMenuManagement
              products={state.products}
              loading={state.productsLoading}
              error={state.productsError}
              onRefresh={() => fetchProducts()}
            />
          </TabsContent>

          <TabsContent value="pos">
            <AdminPOS />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
