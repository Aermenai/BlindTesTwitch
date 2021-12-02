import { BlindTestData } from "components/data/BlindTestData"
import { deserialize, serialize } from 'class-transformer'
import { createPKCECodes, PKCECodePair } from 'pkce'
import { SettingsData } from "components/data/SettingsData"

export const getAppHomeURL = () => {
  return new URL(window.location.href).origin
}

export const getQueryParam = (name: string) => {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(window.location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}

export const computePkcePair = () => {
  const codePair: PKCECodePair = createPKCECodes()
  localStorage.setItem("pkce_pair", serialize(codePair))
  return codePair
}

export const consumePkcePair = () => {
  const codePair: PKCECodePair = deserialize(PKCECodePair, localStorage.getItem("pkce_pair") || "{}")
  localStorage.removeItem("pkce_pair")
  return codePair
}

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token")
}

export const setRefreshToken = (refresh_token: any) => {
  localStorage.setItem("refresh_token", refresh_token)
}

export const removeRefreshToken = () => {
  localStorage.removeItem("refresh_token")
}

export const getAccessToken = () => {
  return localStorage.getItem("access_token")
}

export const setAccessToken = (access_token: any) => {
  localStorage.setItem("access_token", access_token)
}

export const removeAccessToken = () => {
  localStorage.removeItem("access_token")
}

export const hasStoredBlindTest = () => {
  return localStorage.getItem("blind_test") !== null
}

export const getSettings = () => {
  return deserialize(SettingsData, localStorage.getItem("settings") || "{}")
}

export const removeSettings = () => {
  localStorage.removeItem("settings")
}

export const setSettings = (data: SettingsData) => {
  localStorage.setItem("settings", serialize(data))
}

export const getStoredBlindTest = () => {
  let bt = deserialize(BlindTestData, localStorage.getItem("blind_test") || "{}")
  bt.scores = new Map(Object.entries(bt.scores)) // ugly workaround because class-transformer deserialize maps to plain objects ...
  return bt
}

export const removeStoredBlindTest = () => {
  localStorage.removeItem("blind_test")
}

export const setStoredBlindTest = (data: BlindTestData) => {
  localStorage.setItem("blind_test", serialize(data))
}

// light clean + trailing parts (- X || (X))
export const cleanValue = (value: string) => {
  return cleanValueLight(value).replaceAll(/ \(.+\).*| -.+/g, "").trim()
}

// lower-case + remove diacritic + remove some special characters
export const cleanValueLight = (value: string) => {
  return value.toLowerCase().normalize("NFD").replaceAll(/\p{Diacritic}/gu, "").replaceAll(/[,!?:;.]/g, "").trim()
}

export const getMaxDist = (value: string) => {
  return Math.floor(Math.max(0, value.length - 3) / 6);
}

export const computeDistance = (source: string, target: string) => {
  const sourceLength: number = source.length
  const targetLength: number = target.length
  if (sourceLength === 0) return targetLength
  if (targetLength === 0) return sourceLength

  const dist = new Array<number[]>(sourceLength + 1)
  for (let i = 0; i <= sourceLength; ++i) {
    dist[i] = new Array<number>(targetLength + 1).fill(0)
  }

  for (let i = 0; i < sourceLength + 1; i++) {
    dist[i][0] = i
  }
  for (let j = 0; j < targetLength + 1; j++) {
    dist[0][j] = j
  }
  for (let i = 1; i < sourceLength + 1; i++) {
    for (let j = 1; j < targetLength + 1; j++) {
      let cost = source.charAt(i - 1) === target.charAt(j - 1) ? 0 : 1

      // special cases
      if (source.charAt(i - 1) === ' ' && (target.charAt(j - 1) === '-' || target.charAt(j - 1) === '\'')) cost = 0

      dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1] + cost)
      if (i > 1 &&
        j > 1 &&
        source.charAt(i - 1) === target.charAt(j - 2) &&
        source.charAt(i - 2) === target.charAt(j - 1)) {
        dist[i][j] = Math.min(dist[i][j], dist[i - 2][j - 2] + cost)
      }
    }
  }
  return dist[sourceLength][targetLength]
}