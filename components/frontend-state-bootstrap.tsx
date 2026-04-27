"use client"

import { useLayoutEffect } from "react"
import defaultState from "@/data/frontend-state/default-state.json"

const IMPORT_MARKER_KEY = "frontendStateSeedImported"

type StorageValue = string | number | boolean | null | Record<string, unknown> | unknown[]

interface FrontendStateSeed {
  localStorage?: Record<string, StorageValue>
  sessionStorage?: Record<string, StorageValue>
  cookies?: string
}

function serializeStorageValue(value: StorageValue) {
  return typeof value === "string" ? value : JSON.stringify(value)
}

function importStorage(storage: Storage, values?: Record<string, StorageValue>) {
  if (!values) return

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return
    storage.setItem(key, serializeStorageValue(value))
  })
}

function importCookies(cookies?: string) {
  if (!cookies) return

  cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .forEach((cookie) => {
      document.cookie = `${cookie}; path=/`
    })
}

export function FrontendStateBootstrap() {
  useLayoutEffect(() => {
    if (localStorage.getItem(IMPORT_MARKER_KEY)) return

    const seed = defaultState as FrontendStateSeed
    importStorage(localStorage, seed.localStorage)
    importStorage(sessionStorage, seed.sessionStorage)
    importCookies(seed.cookies)
    localStorage.setItem(IMPORT_MARKER_KEY, new Date().toISOString())
  }, [])

  return null
}
