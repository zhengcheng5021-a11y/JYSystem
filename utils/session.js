const { DEFAULT_API_BASE, DEFAULT_TENANT_ID } = require('./config')

const CONFIG_KEY = 'jingyue_config'
const CONFIG_VERSION_KEY = 'jingyue_config_version'
const CONFIG_VERSION = 2
const TOKEN_KEY = 'jingyue_token'
const USER_KEY = 'jingyue_user'
const PERMISSIONS_KEY = 'jingyue_permissions'

function normalizeBase(value) {
  return String(value || DEFAULT_API_BASE).replace(/\/+$/, '')
}

function isLegacyDefault(apiBase) {
  return [
    'http://192.168.0.234:8888',
    'http://localhost:8888',
    'http://127.0.0.1:8888'
  ].indexOf(apiBase) >= 0
}

function getConfig() {
  const saved = wx.getStorageSync(CONFIG_KEY) || {}
  const savedVersion = Number(wx.getStorageSync(CONFIG_VERSION_KEY) || 0)
  let apiBase = normalizeBase(saved.apiBase)
  const tenantId = String(saved.tenantId || DEFAULT_TENANT_ID)
  if (savedVersion < CONFIG_VERSION && isLegacyDefault(apiBase)) {
    apiBase = DEFAULT_API_BASE
    wx.setStorageSync(CONFIG_KEY, { apiBase, tenantId })
  }
  if (savedVersion < CONFIG_VERSION) wx.setStorageSync(CONFIG_VERSION_KEY, CONFIG_VERSION)
  return {
    apiBase,
    tenantId
  }
}

function setConfig(config) {
  const next = {
    apiBase: normalizeBase(config && config.apiBase),
    tenantId: String((config && config.tenantId) || DEFAULT_TENANT_ID)
  }
  wx.setStorageSync(CONFIG_KEY, next)
  wx.setStorageSync(CONFIG_VERSION_KEY, CONFIG_VERSION)
  return next
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
