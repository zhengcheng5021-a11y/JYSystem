const themeUtil = require('../../utils/theme')
const api = require('../../utils/api')
const format = require('../../utils/format')
const ui = require('../../utils/ui')
const navigation = require('../../utils/navigation')
const session = require('../../utils/session')
const bridge = require('../../utils/bridge')

function blankLine() {
  return { key: 'k' + Date.now() + Math.random(), id: 0, goodsName: '', costPrice: '', salePrice: '', imageFileId: '', imageUrl: '', remark: '', styleItemId: '', styleItemName: '', materialItemId: '', materialName: '', metalItemId: '', metalName: '', certTypeId: '', certTypeName: '', profitText: '0.00', profitRate: 0 }
}

function labelOf(item) { return (item && (item.itemName || item.name || item.label)) || '未命名' }

function decorateLine(item) {
  const cost = Number(item.costPrice || 0)
  const sale = Number(item.salePrice || 0)
  const profit = sale - cost
  return Object.assign({}, item, { profitText: format.money(profit), profitRate: sale > 0 ? Math.round((profit / sale) * 100) : 0 })
}

Page({
  data: {
    theme: {},
    id: '',
    loading: true,
    saving: false,
    confirming: false,
    readOnly: false,
    error: '',
    options: { suppliers: [], categories: [], materials: [], metals: [], certTypes: [] },
    header: { inboundNo: '', inboundTime: '', supplierId: '', supplierName: '', remark: '', status: 0 },
    lines: [],
    costSumText: '0.00',
    saleSumText: '0.00'
  },
  onLoad(query) {
    themeUtil.apply(this)
    if (!session.requireLogin()) return
    this.setData({ id: query.id || '', 'header.inboundTime': format.todayText() })
    this.bootstrap()
  },
  onShow() { themeUtil.apply(this) },
  onHide() { this.persistDraft() },
  onUnload() { this.persistDraft() },
  async bootstrap() {
    this.setData({ loading: true, error: '' })
    try {
      const options = await api.inboundOptions()
      const next = { options: {
        suppliers: options.suppliers || [],
        categories: (options.categories || []).filter((item) => !item.level || item.level === 2 || item.parentId),
        materials: options.materials || [],
        metals: options.metals || [],
        certTypes: options.certTypes || []
      } }
      if (this.data.id) {
        const detail = await api.inboundDetail(this.data.id)
        next.header = { inboundNo: detail.inboundNo, inboundTime: format.dateText(detail.inboundTime), supplierId: detail.supplierId || '', supplierName: detail.supplierName || '', remark: detail.remark || '', status: detail.status }
        next.readOnly = detail.status === 1
        next.lines = (detail.lines || []).map((item, index) => decorateLine(Object.assign(blankLine(), item, { key: String(item.id || index), costPrice: String(item.costPrice || ''), salePrice: String(item.salePrice || '') })))
      } else {
        const draft = bridge.getInboundDraft()
        if (draft && Array.isArray(draft.lines) && draft.lines.length) {
          next.header = Object.assign({}, next.header, draft.header || {})
          next.lines = draft.lines.map(decorateLine)
        } else next.lines = [blankLine()]
      }
      this.setData(next)
      this.summarize()
    } catch (error) { this.setData({ error: error.message || '加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  summarize() {
    const cost = this.data.lines.reduce((sum, item) => sum + Number(item.costPrice || 0), 0)
    const sale = this.data.lines.reduce((sum, item) => sum + Number(item.salePrice || 0), 0)
    this.setData({ costSumText: format.money(cost), saleSumText: format.money(sale) })
  },
  persistDraft() {
    if (this.data.readOnly || this.data.id) return
    bridge.saveInboundDraft({ header: this.data.header, lines: this.data.lines })
  },
  onDate(e) { this.setData({ 'header.inboundTime': e.detail.value }); this.persistDraft() },
  onRemark(e) { this.setData({ 'header.remark': e.detail.value }); this.persistDraft() },
  onLine(e) {
    const index = e.currentTarget.dataset.index
    const field = e.currentTarget.dataset.field
    const lines = this.data.lines.slice()
    lines[index] = decorateLine(Object.assign({}, lines[index], { [field]: e.detail.value }))
    this.setData({ lines })
    this.summarize()
    this.persistDraft()
  },
  addLine() {
    this.setData({ lines: this.data.lines.concat(blankLine()) })
    this.summarize()
    this.persistDraft()
  },
  cloneLine(e) {
    const index = e.currentTarget.dataset.index
    const source = this.data.lines[index]
    const copy = decorateLine(Object.assign({}, source, { key: 'k' + Date.now(), id: 0, imageFileId: '', imageUrl: '', goodsName: (source.goodsName || '同款货品') + ' (同款)' }))
    const lines = this.data.lines.slice()
    lines.splice(index + 1, 0, copy)
    this.setData({ lines })
    this.summarize()
    this.persistDraft()
    ui.toast('已复制同款规格，请补拍新照片')
  },
  removeLine(e) {
    const lines = this.data.lines.slice()
    lines.splice(e.currentTarget.dataset.index, 1)
    this.setData({ lines })
    this.summarize()
    this.persistDraft()
  },
  async pickSupplier() {
    if (this.data.readOnly) return
    try {
      const item = await ui.pick('供应商', this.data.options.suppliers, (row) => row.name)
      this.setData({ 'header.supplierId': item.id, 'header.supplierName': item.name })
      this.persistDraft()
    } catch (error) {}
  },
  async pickAttr(e) {
    if (this.data.readOnly) return
    const index = e.currentTarget.dataset.index
    const kind = e.currentTarget.dataset.kind
    const map = { style: ['categories', 'styleItemId', 'styleItemName'], material: ['materials', 'materialItemId', 'materialName'], metal: ['metals', 'metalItemId', 'metalName'], cert: ['certTypes', 'certTypeId', 'certTypeName'] }
    const conf = map[kind]
    try {
      const item = await ui.pick('请选择', this.data.options[conf[0]], labelOf)
      const lines = this.data.lines.slice()
      lines[index] = Object.assign({}, lines[index], { [conf[1]]: item.id, [conf[2]]: labelOf(item) })
      this.setData({ lines })
      this.persistDraft()
    } catch (error) {}
  },
  chooseImage(e) {
    if (this.data.readOnly) return
    const index = e.currentTarget.dataset.index
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      sizeType: ['compressed'],
      success: async (res) => {
        const file = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
        if (!file) return
        ui.loading('上传照片')
        try {
          const uploaded = await api.upload(file)
          const lines = this.data.lines.slice()
          lines[index] = Object.assign({}, lines[index], { imageFileId: uploaded.fileId || '', imageUrl: uploaded.url || file })
          this.setData({ lines })
          this.persistDraft()
        } catch (error) { ui.toast(error.message || '上传失败') }
        finally { ui.hideLoading() }
      }
    })
  },
  payload() {
    return {
      id: Number(this.data.id || 0),
      inboundTime: this.data.header.inboundTime + ' 00:00:00',
      sourceType: 1,
      supplierId: this.data.header.supplierId || null,
      remark: this.data.header.remark || '',
      lines: this.data.lines.map((item) => ({
        id: Number(item.id || 0), goodsName: item.goodsName, costPrice: Number(item.costPrice || 0), salePrice: Number(item.salePrice || 0), imageFileId: item.imageFileId || null, remark: item.remark || '', styleItemId: item.styleItemId || null, materialItemId: item.materialItemId || null, metalItemId: item.metalItemId || null, certTypeId: item.certTypeId || null
      }))
    }
  },
  validate() {
    if (!this.data.header.inboundTime) return '请选择入库日期'
    if (!this.data.lines.length) return '请至少添加一件货品'
    if (this.data.lines.some((item) => !String(item.goodsName || '').trim())) return '每件货品都要填写名称'
    if (this.data.lines.some((item) => !item.styleItemId)) return '每件货品都要选择款式'
    return ''
  },
  async save() {
    const message = this.validate()
    if (message) return this.setData({ error: message })
    this.setData({ saving: true, error: '' })
    try {
      const id = await api.saveInbound(this.payload())
      bridge.clearInboundDraft()
      ui.toast('入库草稿已保存', 'success')
      if (!this.data.id && id) navigation.redirect('/pages/inbound/edit', { id })
      else this.bootstrap()
    } catch (error) { this.setData({ error: error.message || '保存失败' }) }
    finally { this.setData({ saving: false }) }
  },
  async confirm() {
    const message = this.validate()
    if (message) return this.setData({ error: message })
    try { await ui.confirm('确认入库', '确认后货品进入库存，这张单据不能再改。', '确认入库') } catch (error) { return }
    this.setData({ confirming: true, error: '' })
    try {
      const id = this.data.id || await api.saveInbound(this.payload())
      await api.confirmInbound(id)
      bridge.clearInboundDraft()
      ui.toast('已正式确认入库', 'success')
      navigation.tab('/pages/inbound/inbound')
    } catch (error) { this.setData({ error: error.message || '确认失败' }) }
    finally { this.setData({ confirming: false }) }
  },
  onTheme() { themeUtil.apply(this) }
})
