const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const api = require('../../utils/api')
const format = require('../../utils/format')
const ui = require('../../utils/ui')
const list = require('../../utils/list')
const bridge = require('../../utils/bridge')

function firstRow(data) {
  const rows = Array.isArray(data) ? data : ((data && (data.rows || data.items || data.goods || data.result)) || [])
  return rows[0] || data || null
}

function initialOf(name) { return String(name || '客').slice(0, 1) }

Page({
  data: {
    theme: {},
    mode: 'pos',
    customerKeyword: '',
    goodsKeyword: '',
    drawerKeyword: '',
    drawer: '',
    drawerMembers: [],
    drawerGoods: [],
    customer: {},
    customerInitial: '客',
    lines: [],
    history: [],
    memberDiscount: false,
    roundOff: '0',
    rawTotalText: '0.00',
    previewText: '0.00',
    previewHint: '加入货品后自动预览',
    orderId: 0,
    customOrderId: 0,
    customOrderNo: '',
    customRemain: '0.00',
    previewAmount: 0,
    customHasGoods: false,
    customOffsetText: '0.00',
    customCashText: '0.00',
    matching: false,
    finding: false,
    saving: false,
    confirming: false,
    error: ''
  },
  onShow() {
    themeUtil.apply(this)
    if (!session.requireLogin()) return
    this.restoreDraft()
    this.consumeBridge()
    this.loadHistory()
  },
  onHide() { this.persistDraft() },
  onUnload() { this.persistDraft() },
  noop() {},
  setMode(e) {
    const mode = e.currentTarget.dataset.mode
    bridge.setPreference('saleMode', mode)
    this.setData({ mode })
    if (mode === 'history') this.loadHistory()
  },
  onCustomerKeyword(e) { this.setData({ customerKeyword: e.detail.value }) },
  onGoodsKeyword(e) { this.setData({ goodsKeyword: e.detail.value }) },
  onDrawerKeyword(e) { this.setData({ drawerKeyword: e.detail.value }) },
  onRoundOff(e) { this.setData({ roundOff: e.detail.value || '0' }); this.persistDraft(); this.preview() },
  closeDrawer() { this.setData({ drawer: '', drawerKeyword: '' }) },
  walkIn() {
    this.setCustomer({ memberName: '到店散客', customerName: '到店散客', phone: '柜面直购', levelName: '散客直开' })
    ui.toast('已切换为散客直开模式')
  },
  setCustomer(row) {
    const customer = {
      memberId: row.memberId || row.id || null,
      memberName: row.memberName || row.name || '',
      customerName: row.memberName || row.customerName || row.name || '',
      phone: row.phone || '',
      levelName: row.levelName || '会员',
      discountRate: row.discountRate || 1
    }
    this.setData({ customer, customerInitial: initialOf(customer.memberName), customerKeyword: customer.memberName || customer.phone || '' })
    this.persistDraft()
  },
  async matchCustomer() {
    const keyword = String(this.data.customerKeyword || '').trim()
    if (!keyword) return ui.toast('请输入客户姓名或手机号')
    this.setData({ matching: true, error: '' })
    try {
      const data = await api.saleCustomer(keyword)
      const candidate = (data && data.candidates && data.candidates[0]) || data || {}
      if (!candidate.memberName && !candidate.customerName && !(data && data.exists)) {
        this.setData({ customer: { customerName: keyword, memberName: keyword, levelName: '新客户' }, customerInitial: initialOf(keyword) })
      } else this.setCustomer(Object.assign({}, candidate, { memberId: candidate.memberId || (data && data.memberId) }))
      this.persistDraft()
    } catch (error) { this.setData({ error: error.message || '识别失败' }) }
    finally { this.setData({ matching: false }) }
  },
  async openMemberDrawer() {
    this.setData({ drawer: 'member', drawerKeyword: '', drawerMembers: [] })
    await this.searchDrawerMembers()
  },
  async searchDrawerMembers() {
    try {
      const data = await api.memberList({ pageNum: 1, pageSize: 40, keyword: this.data.drawerKeyword, status: 0 })
      this.setData({ drawerMembers: list.rows(data) })
    } catch (error) { this.setData({ error: error.message || '客户加载失败' }) }
  },
  selectMember(e) {
    const id = String(e.currentTarget.dataset.id)
    const row = this.data.drawerMembers.find((item) => String(item.id) === id)
    if (row) this.setCustomer(row)
    this.closeDrawer()
  },
  async openGoodsDrawer() {
    this.setData({ drawer: 'goods', drawerKeyword: '', drawerGoods: [] })
    await this.searchDrawerGoods()
  },
  async searchDrawerGoods() {
    try {
      const data = await api.stockList({ pageNum: 1, pageSize: 50, keyword: this.data.drawerKeyword, status: 1 })
      this.setData({ drawerGoods: list.rows(data).map((item) => Object.assign({}, item, { goodsName: item.styleName || item.goodsName || '未命名货品', saleText: format.money(item.salePrice) })) })
    } catch (error) { this.setData({ error: error.message || '货品加载失败' }) }
  },
  selectGoods(e) {
    const row = this.data.drawerGoods[e.currentTarget.dataset.index]
    if (row) this.addLine(row)
    this.closeDrawer()
  },
  async findGoods() {
    this.setData({ finding: true, error: '' })
    try {
      const row = firstRow(await api.saleGoods(this.data.goodsKeyword))
      if (!row || !(row.goodsItemId || row.id)) throw new Error('没有找到可售货品')
      this.addLine(row)
      this.setData({ goodsKeyword: '' })
    } catch (error) { this.setData({ error: error.message || '查找失败' }) }
    finally { this.setData({ finding: false }) }
  },
  addLine(row) {
    const goodsItemId = row.goodsItemId || row.id
    if (!goodsItemId) return ui.toast('货品信息不完整')
    if (this.data.lines.some((line) => String(line.goodsItemId) === String(goodsItemId))) return ui.toast('这件货已在当前开单中')
    const salePrice = Number(row.salePrice || 0)
    const line = {
      goodsItemId,
      goodsName: row.goodsName || row.styleName || '未命名货品',
      goodsNo: row.goodsNo || row.barcode || '',
      styleItemName: row.styleItemName || '',
      salePrice,
      saleText: format.money(salePrice),
      dealPrice: String(salePrice),
      isGift: false
    }
    this.setData({ lines: this.data.lines.concat(line), error: '' })
    this.persistDraft()
    this.preview()
  },
  onPrice(e) {
    const lines = this.data.lines.slice()
    lines[e.currentTarget.dataset.index].dealPrice = e.detail.value
    this.setData({ lines })
    this.persistDraft()
    this.preview()
  },
  toggleGift(e) {
    const lines = this.data.lines.slice()
    const line = lines[e.currentTarget.dataset.index]
    line.isGift = !line.isGift
    if (line.isGift) line.dealPrice = '0'
    else line.dealPrice = String(line.salePrice || 0)
    this.setData({ lines })
    this.persistDraft()
    this.preview()
  },
  removeLine(e) {
    const lines = this.data.lines.slice()
    lines.splice(e.currentTarget.dataset.index, 1)
    this.setData({ lines })
    this.persistDraft()
    this.preview()
  },
  toggleDiscount() {
    this.setData({ memberDiscount: !this.data.memberDiscount })
    this.persistDraft()
    this.preview()
  },
  payload() {
    const c = this.data.customer
    const offsetAmount = this.customOffsetAmount()
    const offsets = this.data.customOrderId && offsetAmount > 0 ? [{ customOrderId: Number(this.data.customOrderId), offsetAmount }] : []
    return {
      id: Number(this.data.orderId || 0),
      orderType: 1,
      memberId: c.memberId || null,
      customerName: c.customerName || c.memberName || null,
      customerPhone: c.phone || null,
      customerSex: 0,
      applyMemberDiscount: !!this.data.memberDiscount,
      adjustAmount: 0,
      roundOffAmount: Number(this.data.roundOff || 0),
      items: this.data.lines.map((item) => ({ goodsItemId: Number(item.goodsItemId), qty: 1, dealPrice: Number(item.dealPrice || 0), isGift: item.isGift ? 1 : 0 })),
      customOffsets: offsets
    }
  },
  rawTotal() { return this.data.lines.reduce((sum, item) => sum + (item.isGift ? 0 : Number(item.dealPrice || 0)), 0) },
  customOffsetAmount() {
    if (!this.data.customOrderId) return 0
    const remain = Number(String(this.data.customRemain || '0').replace(/,/g, '')) || 0
    return Math.max(0, Math.min(remain, Number(this.data.previewAmount || 0)))
  },
  async preview() {
    const raw = this.rawTotal()
    this.setData({ rawTotalText: format.money(raw) })
    if (!this.data.lines.length) return this.setData({ previewText: '0.00', previewHint: '加入货品后自动预览' })
    try {
      const data = await api.previewSale(this.payload())
      const payAmount = Number(data.payAmount || 0)
      const offsetAmount = Math.max(0, Math.min(Number(String(this.data.customRemain || '0').replace(/,/g, '')) || 0, payAmount))
      this.setData({
        previewAmount: payAmount,
        previewText: format.money(payAmount),
        customOffsetText: format.money(offsetAmount),
        customCashText: format.money(payAmount - offsetAmount),
        previewHint: '会员优惠 ¥' + format.money(data.memberDiscount || data.discountAmount || 0)
      })
    } catch (error) { this.setData({ previewHint: error.message || '预览失败' }) }
  },
  persistDraft() {
    bridge.saveSaleDraft({
      customer: this.data.customer,
      lines: this.data.lines,
      memberDiscount: this.data.memberDiscount,
      roundOff: this.data.roundOff,
      customOrderId: this.data.customOrderId,
      customOrderNo: this.data.customOrderNo,
      customRemain: this.data.customRemain
    })
  },
  restoreDraft() {
    const draft = bridge.getSaleDraft()
    if (!draft) return
    const customer = draft.customer || {}
    this.setData({
      customer,
      customerInitial: initialOf(customer.memberName || customer.customerName),
      customerKeyword: customer.memberName || customer.customerName || '',
      lines: Array.isArray(draft.lines) ? draft.lines : [],
      memberDiscount: !!draft.memberDiscount,
      roundOff: String(draft.roundOff || 0),
      customOrderId: draft.customOrderId || 0,
      customOrderNo: draft.customOrderNo || '',
      customRemain: draft.customRemain || '0.00',
      customOffsetText: '0.00',
      customCashText: '0.00'
    })
    this.preview()
  },
  consumeBridge() {
    const goods = bridge.takeGoods()
    const member = bridge.takeSaleMember()
    const custom = bridge.takeCustom()
    if (member) this.setCustomer(member)
    if (goods) this.addLine(goods)
    if (custom) {
      this.setData({ customOrderId: custom.id || 0, customOrderNo: custom.customNo || '', customRemain: format.money(custom.remainAmount), customHasGoods: !!custom.goodsItemId, customOffsetText: '0.00', customCashText: '0.00', customer: { memberId: custom.memberId || null, memberName: custom.customerName || '定制客户', customerName: custom.customerName || '定制客户', phone: custom.customerPhone || '', levelName: '定制客户' }, customerInitial: initialOf(custom.customerName) })
      if (custom.goodsItemId) {
        this.addLine({ goodsItemId: custom.goodsItemId, goodsNo: custom.goodsNo || custom.barcode || '', goodsName: custom.goodsName || '定制货品', salePrice: custom.expectPrice || 0 })
      }
      this.persistDraft()
      this.preview()
      ui.toast(custom.goodsItemId ? '已带入定制货品与尾款' : '已带入定制客户，请再挑选本次货品')
    }
  },
  async loadHistory() {
    try {
      const data = await api.saleList({ pageNum: 1, pageSize: 30 })
      this.setData({ history: list.rows(data).map((item) => Object.assign({}, item, { payText: format.money(item.payAmount), customerText: item.customerName || item.memberName || '散客', timeText: format.dateTimeText(item.dealTime || item.createTime) })) })
    } catch (error) { if (this.data.mode === 'history') this.setData({ error: error.message || '销售记录加载失败' }) }
  },
  async save() {
    if (!this.data.lines.length) return this.setData({ error: '请先加入货品' })
    this.setData({ saving: true, error: '' })
    try {
      const id = await api.saveSale(this.payload())
      this.setData({ orderId: id || this.data.orderId })
      this.persistDraft()
      this.loadHistory()
      ui.toast('开单草稿已保存', 'success')
    } catch (error) { this.setData({ error: error.message || '保存失败' }) }
    finally { this.setData({ saving: false }) }
  },
  async confirm() {
    if (!this.data.customer.customerName && !this.data.customer.memberId) return this.setData({ error: '请先识别或填写客户' })
    if (!this.data.lines.length) return this.setData({ error: '请先加入货品' })
    try { await ui.confirm('确认收款', '确认后扣减库存。应收 ¥' + this.data.previewText, '确认收款') } catch (e) { return }
    this.setData({ confirming: true, error: '' })
    try {
      const id = this.data.orderId || await api.saveSale(this.payload())
      await api.confirmSale(id)
      bridge.clearSaleDraft()
      this.setData({ orderId: 0, lines: [], customer: {}, customerInitial: '客', memberDiscount: false, roundOff: '0', previewText: '0.00', rawTotalText: '0.00', customOrderId: 0, customOrderNo: '', customRemain: '0.00', customHasGoods: false, customOffsetText: '0.00', customCashText: '0.00', previewAmount: 0, mode: 'history' })
      this.loadHistory()
      ui.toast('收款成功，库存已核减', 'success')
    } catch (error) { this.setData({ error: error.message || '收款失败' }) }
    finally { this.setData({ confirming: false }) }
  },
  async confirmHistory(e) {
    try { await ui.confirm('确认收款', '确认后会核减库存。', '确认收款') } catch (error) { return }
    try { await api.confirmSale(e.currentTarget.dataset.id); this.loadHistory(); ui.toast('草稿单已确认收款', 'success') }
    catch (error) { ui.toast(error.message || '确认失败') }
  },
  onTheme() { themeUtil.apply(this) }
})
