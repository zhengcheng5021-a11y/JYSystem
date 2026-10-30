const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const auth = require('../../utils/auth')
const ui = require('../../utils/ui')

Page({
  data: {
    theme: {},
    nickName: '静悦主理人',
    userName: '',
    tenantId: '0',
    apiBase: '',
    permissionText: '门店顾问权限',
    initial: '静',
    seasons: [],
    loggingOut: false
  },
  onShow() {
    themeUtil.apply(this)
    this.fill()
  },
  fill() {
    if (!session.requireLogin()) return
    const user = session.getUser() || {}
    const config = session.getConfig()
    const permissions = session.getPermissions()
    const nickName = user.nickName || user.userName || '静悦主理人'
    this.setData({
      theme: themeUtil.current(),
      seasons: themeUtil.list(),
      nickName,
      initial: String(nickName).slice(0, 1),
      userName: user.userName || '',
      tenantId: config.tenantId,
      apiBase: config.apiBase,
      permissionText: permissions.indexOf('*:*:*') >= 0 ? '全域掌柜权限 (*:*:*)' : ('已授权 ' + permissions.length + ' 项门店权限')
    })
  },
  chooseSeason(e) {
    const theme = themeUtil.use(e.currentTarget.dataset.id, this)
    this.setData({ theme })
    ui.toast('已切换至 ' + theme.short, 'success')
  },
  copyBase() {
    if (!this.data.apiBase) return
    wx.setClipboardData({ data: this.data.apiBase, success: () => ui.toast('服务端地址已复制', 'success') })
  },
  logout() {
    if (this.data.loggingOut) return
    wx.showModal({
      title: '退出登录',
      content: '退出后需要重新输入账号密码。',
      confirmText: '退出',
      cancelText: '再检查一下',
      success: (res) => {
        if (!res.confirm) return
        this.setData({ loggingOut: true })
        auth.logout((ok) => {
          if (ok) return
          this.setData({ loggingOut: false })
          ui.toast('退出失败，请稍后重试', 'none')
        })
      }
    })
  },
  onTheme() { themeUtil.apply(this); this.fill() }
})
