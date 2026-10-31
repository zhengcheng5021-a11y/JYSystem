const cloud = require('wx-server-sdk')
const http = require('http')
const https = require('https')
const path = require('path')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// Keep the origin server here instead of accepting an arbitrary URL from the client.
const API_BASE = String(process.env.JY_API_BASE || 'http://146.56.241.105:8888').replace(/\/+$/, '')
const MAX_JSON_BYTES = 2 * 1024 * 1024
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024

function assertAllowedPath(raw) {
  const value = String(raw || '')
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('..') || value.includes('\\') || /^[a-z]+:\/\//i.test(value)) {
    throw new Error('非法的接口路径')
  }
  const pathname = value.split('?')[0]
  const allowed = pathname === '/login' || pathname === '/getInfo' || pathname === '/LogOut' || pathname === '/Common/UploadFile' || pathname.startsWith('/jingyue/')
  if (!allowed) throw new Error('该接口不允许通过小程序访问')
  return value
}

function sanitizeHeaders(input) {
  const output = {}
  const source = input && typeof input === 'object' ? input : {}
  Object.keys(source).forEach((key) => {
    if (/^(host|content-length|connection|transfer-encoding)$/i.test(key)) return
    const value = source[key]
    if (value !== undefined && value !== null) output[key] = String(value)
  })
  return output
}

function sendHttp(options) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + options.path)
    const transport = url.protocol === 'https:' ? https : http
    const body = options.body === undefined || options.body === null ? null : Buffer.isBuffer(options.body) ? options.body : Buffer.from(String(options.body))
    const headers = sanitizeHeaders(options.headers)
    // The existing API derives the client IP from headers or the socket. CloudBase
    // calls leave X-Forwarded-For empty, so provide a stable proxy address here.
    if (!headers['X-Forwarded-For'] && !headers['x-forwarded-for']) headers['X-Forwarded-For'] = '127.0.0.1'
    headers['User-Agent'] = headers['User-Agent'] || headers['user-agent'] || 'JingYueMiniProgram/1.0 CloudBaseProxy'
    if (body) headers['Content-Length'] = String(body.length)
    const req = transport.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: String(options.method || 'GET').toUpperCase(),
      headers,
      timeout: options.timeout || 18000
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        let parsed = text
        try { parsed = text ? JSON.parse(text) : null } catch (error) {}
        resolve({ statusCode: res.statusCode || 502, body: parsed })
      })
    })
    req.on('timeout', () => req.destroy(new Error('后端接口响应超时')))
    req.on('error', (error) => reject(new Error('无法连接后端服务：' + error.message)))
    if (body) req.write(body)
    req.end()
  })
}

function requestJson(event) {
  const data = event.data === undefined ? null : event.data
  const raw = data === null ? '' : JSON.stringify(data)
  if (Buffer.byteLength(raw) > MAX_JSON_BYTES) throw new Error('请求数据过大')
  const headers = sanitizeHeaders(event.header)
  if (raw) headers['Content-Type'] = headers['Content-Type'] || headers['content-type'] || 'application/json;charset=utf-8'
  return sendHttp({ path: assertAllowedPath(event.path), method: event.method, headers, body: raw || null })
}

function safeName(value, fallback) {
  const name = path.basename(String(value || '')).replace(/[\r\n\"]/g, '_')
  return name || fallback
}

function mimeOf(name) {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.heic') return 'image/heic'
  return 'image/jpeg'
}

function multipartBody(fields, fileName, fileContent) {
  const boundary = '----JingYue' + Date.now().toString(16) + Math.random().toString(16).slice(2)
  const chunks = []
  Object.keys(fields || {}).forEach((key) => {
    chunks.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="' + String(key).replace(/[\r\n\"]/g, '_') + '"\r\n\r\n' + String(fields[key] === undefined || fields[key] === null ? '' : fields[key]) + '\r\n'))
  })
  chunks.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="' + safeName(fileName, 'photo.jpg') + '"\r\nContent-Type: ' + mimeOf(fileName) + '\r\n\r\n'))
  chunks.push(fileContent)
  chunks.push(Buffer.from('\r\n--' + boundary + '--\r\n'))
  return { body: Buffer.concat(chunks), contentType: 'multipart/form-data; boundary=' + boundary }
}

async function uploadFile(event) {
  if (!event.fileID) throw new Error('缺少云存储文件')
  let fileContent
  try {
    const downloaded = await cloud.downloadFile({ fileID: String(event.fileID) })
    fileContent = downloaded.fileContent
    if (!Buffer.isBuffer(fileContent)) throw new Error('无法读取图片内容')
    if (fileContent.length > MAX_UPLOAD_BYTES) throw new Error('图片不能超过 12MB')
    const form = multipartBody(event.formData, event.fileName, fileContent)
    const headers = sanitizeHeaders(event.header)
    headers['Content-Type'] = form.contentType
    return await sendHttp({ path: assertAllowedPath('/Common/UploadFile'), method: 'POST', headers, body: form.body, timeout: 28000 })
  } finally {
    // The uploaded copy is only a temporary bridge; the backend keeps the durable file.
    try { await cloud.deleteFile({ fileList: [String(event.fileID)] }) } catch (error) {}
  }
}

exports.main = async (event) => {
  try {
    if (event.action === 'upload') return Object.assign({ success: true }, await uploadFile(event))
    if (event.action === 'request') return Object.assign({ success: true }, await requestJson(event))
    if (event.action === 'health') {
      const result = await sendHttp({ path: '/login', method: 'POST', headers: { 'Content-Type': 'application/json', tenantId: '0' }, body: JSON.stringify({ username: '__cloud_proxy_health__', password: 'x', code: '', uuid: '', clientId: 'cloud-proxy-health', tenantId: '0' }) })
      return Object.assign({ success: true }, result)
    }
    throw new Error('未知的云函数操作')
  } catch (error) {
    return { success: false, statusCode: 502, message: error.message || '云端中转失败', body: { msg: error.message || '云端中转失败' } }
  }
}
