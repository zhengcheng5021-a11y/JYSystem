const session = require('./session')

function buildUrl(path) {
  const config = session.getConfig()
  if (!config.apiBase) throw new Error('请先配置服务端地址')
  return config.apiBase + (String(path).charAt(0) === '/' ? path : '/' + path)
}

function responseMessage(body, fallback) {
  if (!body) return fallback
  return body.msg || body.message || body.error || fallback
}

function request(options) {
  const config = session.getConfig()
  const token = session.getToken()
  const user = session.getUser() || {}
  const headers = Object.assign({
    'Content-Type': 'application/json;charset=utf-8',
    tenantId: config.tenantId
  }, options.header || {})
  if (token) {
    headers.Authorization = 'Bearer ' + token
    headers.userid = user.userId || ''
    headers.userName = encodeURIComponent(user.userName || '')
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(options.url),
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      timeout: options.timeout || 20000,
      success(res) {
        const body = res.data
        if (res.statusCode === 401 || (body && body.code === 401)) {
          session.clearSession()
          wx.reLaunch({ url: '/pages/login/login' })
          reject(new Error('登录已过期，请重新登录'))
          return
        }
        if (res.statusCode === 403) {
          reject(new Error('当前账号没有这项权限'))
          return
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(responseMessage(body, '服务异常（' + res.statusCode + '）')))
          return
        }
        if (body && body.code !== undefined && body.code !== 200) {
          reject(new Error(responseMessage(body, '请求未完成')))
          return
        }
        resolve(body && body.data !== undefined ? body.data : body)
      },
      fail(err) { reject(new Error((err && err.errMsg) || '网络连接失败')) }
    })
  })
}

function uploadFile(filePath, options) {
  const config = session.getConfig()
  const token = session.getToken()
  const user = session.getUser() || {}
  const extra = (options && options.formData) || {}
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: buildUrl('/Common/UploadFile'),
      filePath,
      name: 'file',
      timeout: 60000,
      header: {
        Authorization: token ? 'Bearer ' + token : '',
        tenantId: config.tenantId,
        userid: user.userId || '',
        userName: encodeURIComponent(user.userName || '')
      },
      formData: Object.assign({ FileNameType: '3', FileDir: 'jingyue/mobile', Quality: '80', ClassifyType: (options && options.classifyType) || 'jingyue' }, extra),
      success(res) {
        let body = res.data
        try { body = JSON.parse(body) } catch (e) {}
        if (res.statusCode === 401) {
          session.clearSession()
          wx.reLaunch({ url: '/pages/login/login' })
          reject(new Error('登录已过期，请重新登录'))
          return
        }
        if (res.statusCode < 200 || res.statusCode >= 300 || (body && body.code !== undefined && body.code !== 200)) {
          reject(new Error(responseMessage(body, '上传失败')))
          return
        }
        resolve(body && body.data !== undefined ? body.data : body)
      },
      fail(err) { reject(new Error((err && err.errMsg) || '上传失败')) }
    })
  })
}

module.exports = { request, uploadFile, buildUrl }
