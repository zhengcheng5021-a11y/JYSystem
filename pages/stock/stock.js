const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const api = require('../../utils/api')
const list = require('../../utils/list')
const format = require('../../utils/format')
const bridge = require('../../utils/bridge')
const ui = require('../../utils/ui')
const navigation = require('../../utils/navigation')

Page({
  data: {
    theme: {},
    mode: 'stock',
    keyword: '',
    ledgerKeyword: '',
    status: '',
    rows: [],
    ledgerRows: [],
    loading: false,
    ledgerLoading: false,
    error: '',
    showCost: false,
    summary: { onShelfCount: '--', totalQty: '--', saleText: '--', costText: '--' }
  },
  onShow() {
    themeUtil.apply(this)
    if (!session.requireLogin()) return
    this.setData({ showCost: !!bridge.preference('showCost', false), mode: bridge.preference('stockMode', 'stock') })
    this.load()
  },
  onKeyword(e) { this.setData({ keyword: e.detail.value }) },
  onLedgerKeyword(e) { this.setData({ ledgerKeyword: e.detail.value }) },
  setMode(e) {
    const mode = e.currentTarget.dataset.mode
    bridge.setPreference('stockMode', mode)
    this.setData({ mode })
    if (mode === 'ledger') this.loadLedger()
  },
  setStatus(e) { this.setData({ status: e.currentTarget.dataset.status }); this.search() },
  toggleCost() {
    const showCost = !this.data.showCost
    bridge.setPreference('showCost', showCost)
    this.setData({ showCost })
  },
  async load() { await Promise.all([this.loadSummary(), this.search()]) },
  async loadSummary() {
    try {
      const data = await api.stockSummary()
      this.setData({ summary: { onShelfCount: String(data.onShelfCount || 0), totalQty: String(data.totalQty || 0), saleText: format.money(data.stockSale), costText: format.money(data.stockCost) } })
    } catch (error) { this.setData({ error: error.message }) }
  },
  async search() {
    this.setData({ loading: true, error: '' })
    try {
      const data = await api.stockList({ pageNum: 1, pageSize: 50, keyword: this.data.keyword, status: this.data.status === '' ? undefined : Number(this.data.status) })
      this.setData({ rows: list.rows(data).map((item) => Object.assign({}, item, { goodsName: item.styleName || item.goodsName || '未命名货品', initial: String(item.styleName || item.goodsName || '货').slice(0, 1), saleText: format.money(item.salePrice), costText: format.money(item.costPrice), statusText: format.statusText(item.status) })) })
    } catch (error) { this.setData({ error: error.message || '查询失败' }) }
    finally { this.setData({ loading: false }) }
  },
  async loadLedger() {
    this.setData({ ledgerLoading: true, error: '' })
    try {
      const data = await api.stockLedger({ pageNum: 1, pageSize: 50, keyword: this.data.ledgerKeyword })
      this.setData({ ledgerRows: list.rows(data).map((item) => Object.assign({}, item, { changeText: (Number(item.changeQty) > 0 ? '+' : '') + item.changeQty, bizTypeText: item.bizType || (Number(item.changeQty) >= 0 ? '入库' : '出库'), timeText: format.dateTimeText(item.bizTime) })) })
    } catch (error) { this.setData({ error: error.message || '流水加载失败' }) }
    finally { this.setData({ ledgerLoading: false }) }
  },
  sendToSale(e) {
    const row = this.data.rows[e.currentTarget.dataset.index]
    if (!row) return
    bridge.putGoods({ goodsItemId: row.id, goodsName: row.goodsName, goodsNo: row.goodsNo || '', styleItemName: row.styleItemName || '', salePrice: Number(row.salePrice || 0) })
    navigation.open('/pages/sale/sale')
    ui.toast('已带入本单：' + row.goodsName)
  },
  onTheme() { themeUtil.apply(this) }
})
