const session = require('./session')
const { USE_CLOUD_PROXY } = require('./config')

const CLOUD_FUNCTION_NAME = 'jingyueApi'

function buildUrl(path) {
  const config = session.getConfig()
  if (!config.apiBase) throw new Error('请先配置服务端地址')
  return config.apiBase + (String(path).charAt(0) === '/' ? path : '/' + path)
}

function responseMessage(body, fallback) {
  if (!body) return fallback
  return body.msg || body.message || body.error || fallback
}

function handleResponse(res, resolve, reject) {
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
}

function callCloud(payload) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud || !wx.cloud.callFunction) {
      reject(new Error('当前基础库不支持云开发'))
      return
    }
    wx.cloud.callFunction({
      name: CLOUD_FUNCTION_NAME,
      data: payload,
      success(result) {
        const value = result && result.result
        if (!value || value.success === false) {
          reject(new Error((value && value.message) || '云端中转失败'))
          return
        }
        resolve({ statusCode: value.statusCode || 200, data: value.body })
      },
      fail(error) {
        reject(new Error('云端中转不可用：' + ((error && error.errMsg) || '请检查云函数是否已部署')))
      }
    })
  })
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
  if (USE_CLOUD_PROXY) {
    return callCloud({
      action: 'request',
      path: options.url,
      method: options.method || 'GET',
      data: options.data === undefined ? null : options.data,
      header: headers
    }).then((res) => new Promise((resolve, reject) => handleResponse(res, resolve, reject)))
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(options.url),
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      timeout: options.timeout || 20000,
      success: (res) => handleResponse(res, resolve, reject),
      fail: (err) => reject(new Error((err && err.errMsg) || '网络连接失败'))
    })
  })
}

function uploadFile(filePath, options) {
  const config = session.getConfig()
  const token = session.getToken()
  const user = session.getUser() || {}
  const extra = (options && options.formData) || {}
  const headers = {
    Authorization: token ? 'Bearer ' + token : '',
    tenantId: config.tenantId,
    userid: user.userId || '',
    userName: encodeURIComponent(user.userName || '')
  }
  const formData = Object.assign({ FileNameType: '3', FileDir: 'jingyue/mobile', Quality: '80', ClassifyType: (options && options.classifyType) || 'jingyue' }, extra)
  if (USE_CLOUD_PROXY) {
    return new Promise((resolve, reject) => {
      const extMatch = String(filePath || '').match(/(\.[a-zA-Z0-9]+)$/)
      const ext = extMatch ? extMatch[1].toLowerCase() : '.jpg'
      const cloudPath = 'jingyue-temp/' + Date.now() + '-' + Math.random().toString(16).slice(2) + ext
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success(uploadResult) {
          callCloud({
            action: 'upload',
            fileID: uploadResult.fileID,
            fileName: uploadResult.fileID ? uploadResult.fileID.split('/').pop() : 'photo' + ext,
            formData,
            header: headers
          }).then((res) => handleResponse(res, resolve, reject)).catch(reject)
        },
        fail(error) { reject(new Error('图片上传到云存储失败：' + ((error && error.errMsg) || '未知错误'))) }
      })
    })
  }
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: buildUrl('/Common/UploadFile'),
      filePath,
      name: 'file',
      timeout: 60000,
      header: headers,
      formData,
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
