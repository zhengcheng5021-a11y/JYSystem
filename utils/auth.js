const api = require('./api')
const session = require('./session')
const md5 = require('./md5')
const { toast } = require('./ui')

function toSafeText(value) { return value === undefined || value === null ? '' : String(value) }

async function finishLogin(token, config) {
  if (!token) throw new Error('登录成功但未返回访问凭证')
  session.setConfig(config)
  session.setToken(token)
  const info = await api.getInfo()
  const user = (info && info.user) || {}
  user.userId = toSafeText(user.userId || user.id)
  user.userName = toSafeText(user.userName)
  user.nickName = toSafeText(user.nickName || user.userName)
  session.setUser(user)
  session.setPermissions((info && info.permissions) || [])
  return info
}

async function login(username, password, config) {
  const usernameText = String(username || '').trim()
  if (!usernameText) throw new Error('请输入账号')
  if (!password) throw new Error('请输入密码')
  const body = {
    username: usernameText,
    password: md5(password),
    code: '',
    uuid: '',
    clientId: 'jingyue-mini-program',
    tenantId: String((config && config.tenantId) || '0')
  }
  session.setConfig(config)
  const token = await api.login(body)
  return finishLogin(token, config)
}

async function restore() {
  if (!session.getToken()) return false
  try {
    const info = await api.getInfo()
    const user = (info && info.user) || session.getUser() || {}
    user.userId = toSafeText(user.userId || user.id)
    user.userName = toSafeText(user.userName)
    user.nickName = toSafeText(user.nickName || user.userName)
    session.setUser(user)
    session.setPermissions((info && info.permissions) || [])
    return true
  } catch (error) {
    if (session.getToken()) toast(error.message || '无法刷新账号信息')
    return false
  }
}

const LOGIN_ROUTE = 'pages/login/login'

function currentRoute() {
  const pages = getCurrentPages()
  return pages.length ? pages[pages.length - 1].route : ''
}

// Replacing the page immediately from a modal callback can be swallowed while
// the native dialog is still closing, so retry on a short schedule.
function goLogin(onDone) {
  let attempt = 0
  let finished = false

  function finish(ok) {
    if (finished) return
    finished = true
    if (typeof onDone === 'function') onDone(ok)
  }

  function attemptNavigation() {
    if (currentRoute() === LOGIN_ROUTE) {
      finish(true)
      return
    }
    if (attempt >= 4) {
      finish(false)
      return
    }

    const delay = attempt === 0 ? 300 : 220
    const method = attempt < 3 ? 'reLaunch' : 'redirectTo'
    attempt += 1

    setTimeout(() => {
      wx[method]({
        url: '/' + LOGIN_ROUTE,
        complete() {
          setTimeout(() => {
            if (currentRoute() === LOGIN_ROUTE) finish(true)
            else attemptNavigation()
          }, 120)
        }
      })
    }, delay)
  }

  attemptNavigation()
}

function logout(onDone) {
  // Invalidate the token on the server without letting a slow request block logout.
  const serverLogout = api.logout()
  if (serverLogout && typeof serverLogout.catch === 'function') serverLogout.catch(() => {})

  session.clearSession()
  goLogin(onDone)
}

module.exports = { login, restore, logout, goLogin }
