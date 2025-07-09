// Authentication utilities for the admin system

export const ADMIN_API_KEY = "8frugfboO2fU0C_cEQLMtPXI3FmijRTYgLVvG-nmMrc"

export function validateApiKey(apiKey: string | null | undefined): boolean {
  if (!apiKey) {
    console.log("❌ validateApiKey: No API key provided")
    return false
  }

  const trimmedKey = apiKey.trim()
  const isValid = trimmedKey === ADMIN_API_KEY

  console.log("🔑 validateApiKey:", {
    provided: trimmedKey.substring(0, 15) + "...",
    expected: ADMIN_API_KEY.substring(0, 15) + "...",
    lengthMatch: trimmedKey.length === ADMIN_API_KEY.length,
    exactMatch: isValid,
  })

  return isValid
}

export function getAuthHeaders(apiKey: string): Record<string, string> {
  return {
    "x-api-key": apiKey.trim(),
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  }
}

export function isValidApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== "string") {
    return false
  }

  const trimmed = apiKey.trim()

  // Check length
  if (trimmed.length !== ADMIN_API_KEY.length) {
    return false
  }

  // Check if it contains only valid characters (base64-like)
  const validChars = /^[A-Za-z0-9_-]+$/
  return validChars.test(trimmed)
}

export function createApiKeyError(reason: string, details?: any): object {
  return {
    error: "Invalid API key",
    reason,
    details,
    timestamp: new Date().toISOString(),
    expectedFormat: {
      length: ADMIN_API_KEY.length,
      pattern: "Base64-like string with letters, numbers, underscores, and hyphens",
    },
  }
}
