const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const api = require('../../utils/api')
const list = require('../../utils/list')
const format = require('../../utils/format')
const ui = require('../../utils/ui')
const bridge = require('../../utils/bridge')
const navigation = require('../../utils/navigation')

function progressOf(deposit, total) {
  const amount = Number(deposit || 0) + Number(total || 0)
  return amount > 0 ? Math.max(0, Math.min(100, Math.round(Number(deposit || 0) * 100 / amount))) : 0
}

Page({
  data: {
    theme: {},
    filter: 'all',
    keyword: '',
    allRows: [],
    rows: [],
    loading: false,
    error: '',
    arrivingId: 0,
    totalText: '0'
  },
  onShow() {
    themeUtil.apply(this)
    if (session.requireLogin()) this.load()
  },
  onKeyword(e) { this.setData({ keyword: e.detail.value }) },
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ filter, rows: this.filterRows(this.data.allRows, filter) })
  },
  filterRows(rows, filter) {
    if (filter === 'waiting') return rows.filter((item) => Number(item.arrivalStatus) !== 1)
    if (filter === 'arrived') return rows.filter((item) => Number(item.arrivalStatus) === 1)
    return rows
  },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const data = await api.customList({ pageNum: 1, pageSize: 60, keyword: this.data.keyword })
      const allRows = list.rows(data).map((item) => {
        const remain = Number(item.remainAmount || 0)
        return Object.assign({}, item, {
          arrived: Number(item.arrivalStatus) === 1,
          customerText: item.customerName || item.memberName || '未记客户',
          goodsText: item.goodsName || item.styleItemName || '定制货品',
          depositText: format.money(item.depositAmount),
          remainText: format.money(remain),
          progress: progressOf(item.depositAmount, remain),
          pickupText: item.pickupDate ? format.dateText(item.pickupDate) : '未约定',
          statusText: Number(item.arrivalStatus) === 1 ? '已到店待取' : '工坊匠造中'
        })
      })
      this.setData({ allRows, rows: this.filterRows(allRows, this.data.filter), totalText: String(list.total(data) || allRows.length) })
    } catch (error) {
      this.setData({ error: error.message || '加载失败' })
    } finally {
      this.setData({ loading: false })
    }
  },
  async arrive(e) {
    const id = e.currentTarget.dataset.id
    if (this.data.arrivingId) return
    try { await ui.confirm('确认定制到货', '确认后客户可到店取货，并进入待结尾款流程。', '确认到货') } catch (error) { return }
    this.setData({ arrivingId: id })
    try {
      await api.customArrive(id, { remark: '门店确认到货' })
      ui.toast('已标记到店', 'success')
      await this.load()
    } catch (error) { ui.toast(error.message || '到货确认失败') }
    finally { this.setData({ arrivingId: 0 }) }
  },
  payRemain(e) {
    const row = this.data.allRows.find((item) => String(item.id) === String(e.currentTarget.dataset.id))
    if (!row) return
    bridge.putCustom(row)
    navigation.open('/pages/sale/sale')
    ui.toast('已带入定制客户：' + (row.customerText || '定制客户'))
  },
  onTheme() { themeUtil.apply(this) }
})
