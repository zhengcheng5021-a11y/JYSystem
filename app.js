const session = require('./utils/session')
const { CLOUD_ENV_ID } = require('./utils/config')

App({
  globalData: { apiBase: '', user: null },
  onLaunch() {
    if (wx.cloud && CLOUD_ENV_ID) {
      wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true })
    }
    const info = session.getConfig()
    this.globalData.apiBase = info.apiBase
    this.globalData.user = session.getUser()
  }
})
