const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const api = require('../../utils/api')
const list = require('../../utils/list')
const ui = require('../../utils/ui')
const bridge = require('../../utils/bridge')
const navigation = require('../../utils/navigation')

Page({
  data: {
    theme: {},
    keyword: '',
    rows: [],
    totalText: '0',
    loading: false,
    error: '',
    creating: false,
    saving: false,
    formError: '',
    form: { memberName: '', phone: '', wechatNo: '' }
  },
  onShow() {
    themeUtil.apply(this)
    if (session.requireLogin()) this.search()
  },
  noop() {},
  onKeyword(e) { this.setData({ keyword: e.detail.value }) },
  openCreate() { this.setData({ creating: true, formError: '' }) },
  closeCreate() { this.setData({ creating: false }) },
  onForm(e) { this.setData({ ['form.' + e.currentTarget.dataset.field]: e.detail.value }) },
  async search() {
    this.setData({ loading: true, error: '' })
    try {
      const data = await api.memberList({ pageNum: 1, pageSize: 50, keyword: this.data.keyword, status: 0 })
      const rows = list.rows(data).map((item) => Object.assign({}, item, { initial: String(item.memberName || '客').slice(0, 1), pointsText: String(item.pointsBalance || 0) }))
      this.setData({ rows, totalText: String(list.total(data) || rows.length) })
    } catch (error) { this.setData({ error: error.message || '加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  contact(e) {
    const row = this.data.rows[e.currentTarget.dataset.index]
    if (!row || !row.phone) return ui.toast('该客户没有手机号')
    wx.makePhoneCall({ phoneNumber: String(row.phone), fail() { wx.setClipboardData({ data: String(row.phone) }) } })
  },
  follow(e) {
    const row = this.data.rows[e.currentTarget.dataset.index]
    if (!row) return
    bridge.putFollowMember({ memberId: row.id, memberName: row.memberName, phone: row.phone || '' })
    navigation.open('/pages/follow/follow')
  },
  sendToSale(e) {
    const row = this.data.rows[e.currentTarget.dataset.index]
    if (!row) return
    bridge.putSaleMember({ memberId: row.id, memberName: row.memberName, phone: row.phone || '', levelName: row.levelName || '会员' })
    navigation.open('/pages/sale/sale')
    ui.toast('已带入客户：' + row.memberName)
  },
  async save() {
    if (!this.data.form.memberName.trim()) return this.setData({ formError: '请填写客户姓名' })
    this.setData({ saving: true, formError: '' })
    try {
      await api.saveMember({ id: 0, memberName: this.data.form.memberName.trim(), phone: this.data.form.phone.trim(), wechatNo: this.data.form.wechatNo.trim(), sex: 0, status: 0, followStatus: 0, referrers: [] })
      ui.toast('客户已保存', 'success')
      const keyword = this.data.form.memberName.trim()
      this.setData({ creating: false, form: { memberName: '', phone: '', wechatNo: '' }, keyword })
      this.search()
    } catch (error) { this.setData({ formError: error.message || '保存失败' }) }
    finally { this.setData({ saving: false }) }
  },
  onTheme() { themeUtil.apply(this) }
})
