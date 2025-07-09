"use client"

import { useState, useCallback, useEffect } from "react"

const ADMIN_API_KEY = "8frugfboO2fU0C_cEQLMtPXI3FmijRTYgLVvG-nmMrc"

interface AdminAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasValidKey: boolean
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    hasValidKey: false,
  })

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedKey = localStorage.getItem("admin_api_key")
        const isValid = storedKey === ADMIN_API_KEY

        setState({
          isAuthenticated: isValid,
          isLoading: false,
          error: null,
          hasValidKey: isValid,
        })
      } catch (error) {
        console.error("Error checking auth:", error)
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to check authentication",
          hasValidKey: false,
        })
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (apiKey: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log("🔐 Attempting admin login...")
      console.log("Provided key length:", apiKey.length)
      console.log("Expected key length:", ADMIN_API_KEY.length)
      console.log("Keys match:", apiKey === ADMIN_API_KEY)

      if (apiKey === ADMIN_API_KEY) {
        localStorage.setItem("admin_api_key", apiKey)
        setState({
          isAuthenticated: true,
          isLoading: false,
          error: null,
          hasValidKey: true,
        })
        console.log("✅ Admin login successful")
        return true
      } else {
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: "Invalid API key. Please check your credentials.",
          hasValidKey: false,
        })
        console.log("❌ Admin login failed - invalid key")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: "Login failed. Please try again.",
        hasValidKey: false,
      })
      return false
    }
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("admin_api_key")
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasValidKey: false,
      })
      console.log("🚪 Admin logged out")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [])

  const getAuthHeaders = useCallback(() => {
    const apiKey = localStorage.getItem("admin_api_key")
    return {
      "x-api-key": apiKey || "",
      "Content-Type": "application/json",
    }
  }, [])

  const validateSession = useCallback(() => {
    const storedKey = localStorage.getItem("admin_api_key")
    const isValid = storedKey === ADMIN_API_KEY

    if (!isValid && state.isAuthenticated) {
      logout()
    }

    setState((prev) => ({
      ...prev,
      hasValidKey: isValid,
    }))

    return isValid
  }, [state.isAuthenticated, logout])

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    hasValidKey: state.hasValidKey,
    login,
    logout,
    getAuthHeaders,
    validateSession,
  }
}
