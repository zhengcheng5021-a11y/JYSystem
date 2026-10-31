const { DEFAULT_API_BASE, DEFAULT_TENANT_ID } = require('./config')

const TOKEN_KEY = 'jingyue_token'
const USER_KEY = 'jingyue_user'
const PERMISSIONS_KEY = 'jingyue_permissions'

function normalizeBase(value) {
  return String(value || DEFAULT_API_BASE).replace(/\/+$/, '')
}

// The service address is fixed in utils/config.js; the tenant defaults to 0.
function getConfig() {
  return {
    apiBase: normalizeBase(DEFAULT_API_BASE),
    tenantId: String(DEFAULT_TENANT_ID || '0')
  }
}

function setConfig(config) {
  return {
    apiBase: normalizeBase((config && config.apiBase) || DEFAULT_API_BASE),
    tenantId: String((config && config.tenantId) || DEFAULT_TENANT_ID || '0')
  }
}

function getToken() { return wx.getStorageSync(TOKEN_KEY) || '' }
function setToken(token) { wx.setStorageSync(TOKEN_KEY, token || '') }
function getUser() { return wx.getStorageSync(USER_KEY) || null }
function setUser(user) { wx.setStorageSync(USER_KEY, user || null) }
function getPermissions() { return wx.getStorageSync(PERMISSIONS_KEY) || [] }
function setPermissions(permissions) { wx.setStorageSync(PERMISSIONS_KEY, Array.isArray(permissions) ? permissions : []) }
function can(permission) {
  const permissions = getPermissions()
  return permissions.indexOf('*:*:*') >= 0 || permissions.indexOf(permission) >= 0
}
function clearSession() {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_KEY)
  wx.removeStorageSync(PERMISSIONS_KEY)
}
function requireLogin() {
  if (getToken()) return true
  wx.reLaunch({ url: '/pages/login/login' })
  return false
}

module.exports = { getConfig, setConfig, getToken, setToken, getUser, setUser, getPermissions, setPermissions, can, clearSession, requireLogin }
