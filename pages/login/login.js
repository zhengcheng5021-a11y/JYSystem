const session = require('../../utils/session')
const themeUtil = require('../../utils/theme')
const auth = require('../../utils/auth')

const REMEMBER_KEY = 'jingyue_login_remember'

const THEMES = {
  blush: {
    id: 'blush',
    globalId: 'spring',
    label: '画境 · 绯粉',
    name: '绯粉春霖 · 桃夭',
    caption: '温润柔粉 · 桃花初绽',
    dot: '#E5A8A2',
    accent: '#9A4D55',
    navBg: '#FDF5F2',
    navFront: '#000000',
    pageStyle: 'background:linear-gradient(180deg,#FDF5F2 0%,#F8E8E4 52%,#F1DAD4 100%);color:#3A2624;',
    textColor: '#3A2624',
    subTextColor: '#553634',
    labelColor: '#5E4442',
    cardBg: 'rgba(255,255,255,.55)',
    cardBorder: 'rgba(255,255,255,.7)',
    cardShadow: '0 15px 35px rgba(180,130,120,.18)',
    cardGlow: 'radial-gradient(circle,rgba(251,193,205,.38),transparent 70%)',
    headBorder: 'rgba(60,40,39,.08)',
    seal: '#99554D',
    inputBg: 'rgba(255,255,255,.85)',
    inputBorder: 'rgba(216,156,146,.3)',
    inputColor: '#2A2022',
    inputPlaceholder: '#A89495',
    iconColor: '#A89495',
    buttonGradient: 'linear-gradient(90deg,#3C2827 0%,#5A3835 52%,#3C2827 100%)',
    buttonTextColor: '#FDF7F2',
    buttonIconColor: '#F2D9BF',
    buttonShadow: '0 6px 20px rgba(60,40,39,.3)',
    checkColor: '#523533',
    checkTextColor: '#FFFFFF',
    linkColor: '#7D403C',
    capsuleBg: 'rgba(255,255,255,.4)',
    capsuleBorder: 'rgba(60,40,39,.1)',
    capsuleColor: '#332324',
    sloganLine: 'rgba(216,156,146,.65)',
    knotColor: 'rgba(154,77,85,.55)',
    mountainColor: 'rgba(216,156,146,.35)',
    orbGradient: 'radial-gradient(circle,rgba(244,166,184,.42) 0%,rgba(223,176,122,.2) 58%,transparent 100%)',
    logoGlow: 'radial-gradient(circle,rgba(244,166,184,.42),rgba(250,212,192,.2) 55%,transparent 72%)',
    petalColors: ['#F4A6B8', '#FBC1CD', '#E88B9E', '#FBECEB'],
    dustColor: '#DFB07A',
    rippleColor: '#D9A392'
  },
  dark: {
    id: 'dark',
    globalId: 'winter',
    label: '画境 · 玄黛',
    name: '玄黛金辉 · 沉香',
    caption: '墨色鎏金 · 静夜生香',
    dot: '#2B2326',
    accent: '#DFB07A',
    navBg: '#1D1618',
    navFront: '#ffffff',
    pageStyle: 'background:linear-gradient(180deg,#1D1618 0%,#2A1F22 50%,#181113 100%);color:#FBE9DC;',
    textColor: '#FBE9DC',
    subTextColor: '#D8BEAA',
    labelColor: '#D8BEAA',
    cardBg: 'rgba(35,27,30,.65)',
    cardBorder: 'rgba(223,176,122,.25)',
    cardShadow: '0 15px 35px rgba(0,0,0,.32)',
    cardGlow: 'radial-gradient(circle,rgba(223,176,122,.2),transparent 70%)',
    headBorder: 'rgba(223,176,122,.16)',
    seal: '#DFB07A',
    inputBg: 'rgba(20,15,17,.7)',
    inputBorder: 'rgba(223,176,122,.25)',
    inputColor: '#FDF5F2',
    inputPlaceholder: '#877074',
    iconColor: '#A98D7E',
    buttonGradient: 'linear-gradient(90deg,#DFB07A 0%,#C79558 52%,#DFB07A 100%)',
    buttonTextColor: '#2B1B15',
    buttonIconColor: '#5C3A22',
    buttonShadow: '0 6px 20px rgba(0,0,0,.32)',
    checkColor: '#DFB07A',
    checkTextColor: '#2B1B15',
    linkColor: '#EBC79B',
    capsuleBg: 'rgba(255,255,255,.12)',
    capsuleBorder: 'rgba(255,255,255,.2)',
    capsuleColor: '#F5E4CE',
    sloganLine: 'rgba(223,176,122,.5)',
    knotColor: 'rgba(223,176,122,.6)',
    mountainColor: 'rgba(223,176,122,.15)',
    orbGradient: 'radial-gradient(circle,rgba(223,176,122,.3) 0%,rgba(200,120,100,.14) 58%,transparent 100%)',
    logoGlow: 'radial-gradient(circle,rgba(223,176,122,.32),rgba(200,120,100,.12) 55%,transparent 72%)',
    petalColors: ['#DFB07A', '#FBE6D0', '#D9A392', '#EED5C8'],
    dustColor: '#FFE3B5',
    rippleColor: '#DFB07A'
  },
  celadon: {
    id: 'celadon',
    globalId: 'summer',
    label: '画境 · 天青',
    name: '烟雨天青 · 润玉',
    caption: '青瓷烟雨 · 温润如玉',
    dot: '#7CA296',
    accent: '#2F6B5A',
    navBg: '#EFF6F3',
    navFront: '#000000',
    pageStyle: 'background:linear-gradient(180deg,#EFF6F3 0%,#E3EEE9 52%,#D4E4DC 100%);color:#21352E;',
    textColor: '#21352E',
    subTextColor: '#3E564E',
    labelColor: '#3E564E',
    cardBg: 'rgba(255,255,255,.6)',
    cardBorder: 'rgba(164,196,184,.5)',
    cardShadow: '0 15px 35px rgba(80,120,108,.14)',
    cardGlow: 'radial-gradient(circle,rgba(168,212,198,.35),transparent 70%)',
    headBorder: 'rgba(33,53,46,.08)',
    seal: '#4F7D6F',
    inputBg: 'rgba(255,255,255,.85)',
    inputBorder: 'rgba(144,180,168,.35)',
    inputColor: '#182B24',
    inputPlaceholder: '#7A968D',
    iconColor: '#7A968D',
    buttonGradient: 'linear-gradient(90deg,#243831 0%,#3B564C 52%,#243831 100%)',
    buttonTextColor: '#F0F7F4',
    buttonIconColor: '#CBE4DA',
    buttonShadow: '0 6px 20px rgba(36,56,49,.26)',
    checkColor: '#243831',
    checkTextColor: '#FFFFFF',
    linkColor: '#2F6B5A',
    capsuleBg: 'rgba(255,255,255,.4)',
    capsuleBorder: 'rgba(33,53,46,.1)',
    capsuleColor: '#21352E',
    sloganLine: 'rgba(124,162,150,.6)',
    knotColor: 'rgba(47,107,90,.52)',
    mountainColor: 'rgba(124,162,150,.35)',
    orbGradient: 'radial-gradient(circle,rgba(168,212,198,.4) 0%,rgba(216,190,140,.2) 58%,transparent 100%)',
    logoGlow: 'radial-gradient(circle,rgba(168,212,198,.38),rgba(216,190,140,.16) 55%,transparent 72%)',
    petalColors: ['#C8E3D8', '#F5ECEB', '#9BBCAE', '#E4F0EB'],
    dustColor: '#A7C7B9',
    rippleColor: '#7CA296'
  }
}

const GLOBAL_TO_LOGIN = { spring: 'blush', summer: 'celadon', autumn: 'blush', winter: 'dark' }

const AGREEMENTS = {
  user: {
    title: '用户服务协议',
    body: '欢迎来到静悦（JY手作珠宝）平台。\n\n1. 手工甄选与孤品特性：平台所有沙金、纯银、古法金、老檀木及晶石手串均为独立匠人手作打造，天然材质微小纹理与雕刻细节均属正常东方手工美学范畴。\n\n2. 真品保证与证书：所有贵金属及高价值宝石配饰均经过国家级检测机构认证。\n\n3. 定制与养护：部分手围或手工编绳可享受终身免费养护与换线服务。'
  },
  privacy: {
    title: '隐私保护政策',
    body: '我们深知个人信息对您的重要性。\n\n1. 我们仅在您使用账号登录时，收集必要的联系方式与收货地址，用于专属珠宝订单鉴赏与安全发货服务。\n\n2. 严格采用银行级高强度加密技术守护您的个人数据与专属定制记录，绝不向任何第三方透露。'
  }
}

function currentLoginTheme() {
  return THEMES[GLOBAL_TO_LOGIN[themeUtil.current().id]] || THEMES.blush
}

Page({
  data: {
    theme: THEMES.blush,
    themes: Object.keys(THEMES).map((id) => THEMES[id]),
    statusBarHeight: 20,
    navHeight: 44,
    capsuleSpace: 92,
    menuTop: 70,
    toastTop: 76,
    username: '',
    password: '',
    passwordVisible: false,
    remember: true,
    agree: true,
    loading: false,
    menuOpen: false,
    modal: false,
    modalTitle: '',
    modalBody: '',
    serverOpen: false,
    serverError: '',
    serverTesting: false,
    serverForm: { apiBase: '', tenantId: '0' },
    toastShow: false,
    toastMessage: '',
    toastSuccess: true
  },

  onLoad() {
    const config = session.getConfig()
    const user = session.getUser() || {}
    const remembered = wx.getStorageSync(REMEMBER_KEY) || {}
    const remember = remembered.remember !== false
    const username = remember ? String(remembered.userName || user.userName || '') : ''
    const theme = currentLoginTheme()
    this.config = config
    this.applyWindowMetrics()
    this.setData({
      theme,
      username,
      remember,
      serverForm: { apiBase: config.apiBase, tenantId: config.tenantId }
    })
    this.setNavigation(theme)
  },

  onReady() {
    this.initCanvas()
  },

  onShow() {
    if (this._canvas && !this._running) this.startLoop()
  },

  onHide() {
    this.stopLoop()
  },

  onUnload() {
    this.stopLoop()
    if (this._toastTimer) clearTimeout(this._toastTimer)
    if (this._loginTimer) clearTimeout(this._loginTimer)
  },

  applyWindowMetrics() {
    let info = {}
    try { info = wx.getSystemInfoSync() } catch (error) {}
    const statusBarHeight = info.statusBarHeight || 20
    let menu = null
    try { menu = wx.getMenuButtonBoundingClientRect() } catch (error) {}
    let navHeight = 44
    let capsuleSpace = 92
    if (menu && menu.height && menu.top >= statusBarHeight) {
      navHeight = Math.max(40, Math.min(60, (menu.top - statusBarHeight) * 2 + menu.height))
      if (menu.left && info.windowWidth) capsuleSpace = Math.max(76, info.windowWidth - menu.left + 8)
    }
    this.setData({
      statusBarHeight,
      navHeight,
      capsuleSpace,
      menuTop: statusBarHeight + navHeight + 6,
      toastTop: statusBarHeight + navHeight + 10
    })
  },

  setNavigation(theme) {
    wx.setNavigationBarColor({
      frontColor: theme.navFront,
      backgroundColor: theme.navBg,
      animation: { duration: 300, timingFunc: 'easeIn' }
    })
  },

  showToast(message, success) {
    if (this._toastTimer) clearTimeout(this._toastTimer)
    this.setData({
      toastShow: true,
      toastMessage: String(message || ''),
      toastSuccess: success !== false
    })
    this._toastTimer = setTimeout(() => {
      this.setData({ toastShow: false })
    }, 2400)
  },

  initCanvas() {
    wx.createSelectorQuery().in(this).select('#zenCanvas').fields({ node: true, size: true }).exec((res) => {
      const info = res && res[0]
      if (!info || !info.node || !info.width || !info.height) return
      const canvas = info.node
      const ctx = canvas.getContext('2d')
      let pixelRatio = 1
      try { pixelRatio = wx.getSystemInfoSync().pixelRatio || 1 } catch (error) {}
      const dpr = Math.min(Math.max(pixelRatio, 1), 3)
      canvas.width = Math.round(info.width * dpr)
      canvas.height = Math.round(info.height * dpr)
      ctx.scale(dpr, dpr)
      this._canvas = { canvas, ctx, w: info.width, h: info.height, dpr }
      this.seedParticles()
      this.startLoop()
    })
  },

  startLoop() {
    if (!this._canvas || this._running) return
    this._running = true
    const tick = () => {
      if (!this._running || !this._canvas) return
      this.drawFrame()
      this._raf = this._canvas.canvas.requestAnimationFrame(tick)
    }
    tick()
  },

  stopLoop() {
    this._running = false
    if (this._raf && this._canvas) {
      this._canvas.canvas.cancelAnimationFrame(this._raf)
      this._raf = null
    }
  },

  makePetal(init) {
    const box = this._canvas
    const palette = this.data.theme.petalColors
    return {
      x: init ? Math.random() * box.w : Math.random() * box.w * 1.2 - box.w * 0.1,
      y: init ? Math.random() * box.h : -24,
      size: 6 + Math.random() * 7,
      speedY: 0.5 + Math.random() * 0.8,
      speedX: 0.15 + Math.random() * 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.6,
      flip: Math.random() * 360,
      flipSpeed: 1 + Math.random() * 2,
      alpha: 0.45 + Math.random() * 0.45,
      color: palette[Math.floor(Math.random() * palette.length)]
    }
  },

  makeDust() {
    const box = this._canvas
    return {
      x: Math.random() * box.w,
      y: Math.random() * box.h,
      radius: 0.6 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.7,
      alphaChange: (Math.random() - 0.5) * 0.015,
      speedY: -0.1 - Math.random() * 0.3,
      speedX: (Math.random() - 0.5) * 0.3
    }
  },

  seedParticles() {
    if (!this._canvas) return
    this.petals = Array.from({ length: 26 }, () => this.makePetal(true))
    this.dust = Array.from({ length: 30 }, () => this.makeDust())
    this.ripples = []
  },

  drawPetal(ctx, petal) {
    ctx.save()
    ctx.translate(petal.x, petal.y)
    ctx.rotate(petal.rotation * Math.PI / 180)
    ctx.scale(Math.cos(petal.flip * Math.PI / 180), 1)
    ctx.globalAlpha = petal.alpha
    ctx.fillStyle = petal.color
    ctx.shadowColor = this.data.theme.rippleColor
    ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.moveTo(0, -petal.size)
    ctx.bezierCurveTo(petal.size * 0.9, -petal.size * 0.9, petal.size * 0.9, petal.size * 0.5, 0, petal.size)
    ctx.bezierCurveTo(-petal.size * 0.9, petal.size * 0.5, -petal.size * 0.9, -petal.size * 0.9, 0, -petal.size)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(255,255,255,.4)'
    ctx.lineWidth = 0.7
    ctx.beginPath()
    ctx.moveTo(0, -petal.size * 0.7)
    ctx.lineTo(0, petal.size * 0.6)
    ctx.stroke()
    ctx.restore()
  },

  drawDust(ctx, dust) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, dust.alpha))
    ctx.fillStyle = this.data.theme.dustColor
    ctx.shadowColor = '#FFFFFF'
    ctx.shadowBlur = 5
    ctx.beginPath()
    ctx.arc(dust.x, dust.y, dust.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  },

  drawRipple(ctx, ripple) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, ripple.alpha)
    ctx.strokeStyle = this.data.theme.rippleColor
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  },

  drawFrame() {
    const box = this._canvas
    if (!box) return
    const ctx = box.ctx
    const width = box.w
    const height = box.h
    ctx.clearRect(0, 0, width, height)

    this.dust.forEach((dust) => {
      dust.y += dust.speedY
      dust.x += dust.speedX
      dust.alpha += dust.alphaChange
      if (dust.alpha <= 0.15 || dust.alpha >= 0.85) dust.alphaChange = -dust.alphaChange
      if (dust.y < -10) dust.y = height + 10
      if (dust.x < -10) dust.x = width + 10
      if (dust.x > width + 10) dust.x = -10
      this.drawDust(ctx, dust)
    })

    this.petals.forEach((petal, index) => {
      petal.y += petal.speedY
      petal.x += petal.speedX + Math.sin(petal.y * 0.015) * 0.5
      petal.rotation += petal.rotationSpeed
      petal.flip += petal.flipSpeed
      if (petal.y > height + 25 || petal.x > width + 40 || petal.x < -40) {
        this.petals[index] = this.makePetal(false)
      }
      this.drawPetal(ctx, petal)
    })

    for (let index = this.ripples.length - 1; index >= 0; index -= 1) {
      const ripple = this.ripples[index]
      ripple.radius += 1.6
      ripple.alpha -= 0.018
      this.drawRipple(ctx, ripple)
      if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) this.ripples.splice(index, 1)
    }
  },

  onPageTouch(e) {
    if (this.data.modal || this.data.serverOpen || this.data.menuOpen || !this._canvas) return
    const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0])
    if (!touch) return
    const x = touch.clientX != null ? touch.clientX : (touch.pageX != null ? touch.pageX : touch.x)
    const y = touch.clientY != null ? touch.clientY : (touch.pageY != null ? touch.pageY : touch.y)
    if (typeof x !== 'number' || typeof y !== 'number') return
    if (x < 0 || y < 0 || x > this._canvas.w || y > this._canvas.h) return
    this.ripples.push({ x, y, radius: 2, maxRadius: 50, alpha: 0.6 })
  },

  pulseSparkles() {
    if (this._canvas) {
      const palette = this.data.theme.petalColors
      const centerX = this._canvas.w / 2
      const centerY = Math.min(this._canvas.h * 0.32, 260)
      for (let index = 0; index < 8; index += 1) {
        this.petals.push({
          x: centerX + (Math.random() - 0.5) * 50,
          y: centerY + (Math.random() - 0.5) * 50,
          size: 6 + Math.random() * 7,
          speedY: (Math.random() - 0.3) * 1.6 + 0.6,
          speedX: (Math.random() - 0.5) * 1.5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3,
          flip: Math.random() * 360,
          flipSpeed: 1 + Math.random() * 2,
          alpha: 0.65 + Math.random() * 0.3,
          color: palette[Math.floor(Math.random() * palette.length)]
        })
      }
      if (this.petals.length > 70) this.petals.splice(0, this.petals.length - 70)
    }
    this.showToast('触碰东方灵韵 · 晶石生辉')
  },

  toggleMenu() {
    this.setData({ menuOpen: !this.data.menuOpen })
  },

  closeMenu() {
    this.setData({ menuOpen: false })
  },

  noop() {},

  chooseTheme(e) {
    const id = e.currentTarget.dataset.id
    const theme = THEMES[id]
    if (!theme) return
    themeUtil.use(theme.globalId)
    this.setData({ theme, menuOpen: false })
    this.setNavigation(theme)
    this.seedParticles()
    this.showToast('已切换至：' + theme.label)
  },

  onUser(e) {
    this.setData({ username: e.detail.value })
  },

  onPass(e) {
    this.setData({ password: e.detail.value })
  },

  clearUser() {
    this.setData({ username: '' })
  },

  togglePassword() {
    this.setData({ passwordVisible: !this.data.passwordVisible })
  },

  toggleRemember() {
    this.setData({ remember: !this.data.remember })
  },

  toggleAgree() {
    this.setData({ agree: !this.data.agree })
  },

  openModal(e) {
    const type = e.currentTarget.dataset.type
    const item = AGREEMENTS[type] || AGREEMENTS.user
    this.setData({ modal: true, modalTitle: item.title, modalBody: item.body })
  },

  closeModal() {
    this.setData({ modal: false })
  },

  openServer() {
    this.setData({
      serverOpen: true,
      serverError: '',
      serverForm: { apiBase: this.config.apiBase, tenantId: this.config.tenantId }
    })
  },

  closeServer() {
    this.setData({ serverOpen: false, serverError: '' })
  },

  onServerInput(e) {
    this.setData({
      ['serverForm.' + e.currentTarget.dataset.field]: e.detail.value,
      serverError: ''
    })
  },

  async saveServer() {
    const apiBase = String(this.data.serverForm.apiBase || '').trim()
    const tenantId = String(this.data.serverForm.tenantId || '0').trim() || '0'
    if (!/^https?:\/\/[^/\s]+/i.test(apiBase)) {
      this.setData({ serverError: '请填写完整的 http:// 或 https:// 地址' })
      return
    }
    this.setData({ serverError: '', serverTesting: true })
    try {
      await new Promise((resolve, reject) => {
        wx.request({
          url: apiBase.replace(/\/+$/, '') + '/getInfo',
          method: 'GET',
          timeout: 8000,
          header: { tenantId },
          success(res) {
            if (res.statusCode >= 200 && res.statusCode < 500) resolve(res)
            else reject(new Error('服务返回 HTTP ' + res.statusCode))
          },
          fail(err) {
            reject(new Error((err && err.errMsg) || '无法连接服务端'))
          }
        })
      })
      const config = session.setConfig({ apiBase, tenantId })
      this.config = config
      this.setData({
        serverOpen: false,
        serverTesting: false,
        serverForm: { apiBase: config.apiBase, tenantId: config.tenantId }
      })
      this.showToast('连接正常，地址已保存')
    } catch (error) {
      this.setData({
        serverTesting: false,
        serverError: '连接失败：' + (error.message || '请检查地址和后台服务')
      })
    }
  },

  forgot() {
    this.showToast('请联系客服微信或重置密码')
  },

  register() {
    this.showToast('新用户注册请联系门店管理员开设账号')
  },

  guest() {
    this.showToast('请先登录后再进入工作台')
  },

  async submitLogin() {
    if (this.data.loading) return
    if (!this.data.agree) {
      this.showToast('请先勾选同意用户与隐私政策', false)
      return
    }
    const user = String(this.data.username || '').trim()
    const pass = String(this.data.password || '')
    if (!user) {
      this.showToast('请输入您的账号或手机号', false)
      return
    }
    if (!pass) {
      this.showToast('请输入您的登录密码', false)
      return
    }
    this.setData({ loading: true })
    try {
      await auth.login(user, pass, this.config)
      if (this.data.remember) wx.setStorageSync(REMEMBER_KEY, { userName: user, remember: true })
      else wx.removeStorageSync(REMEMBER_KEY)
      this.showToast('欢迎归来，' + user + '！登录成功')
      this._loginTimer = setTimeout(() => {
        this.setData({ loading: false })
        wx.reLaunch({ url: '/pages/home/home' })
      }, 420)
    } catch (error) {
      this.setData({ loading: false })
      this.showToast(error.message || '登录失败', false)
    }
  }
})
