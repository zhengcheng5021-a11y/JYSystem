const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const api = require('../../utils/api')
const list = require('../../utils/list')
const ui = require('../../utils/ui')

const CATEGORIES = ['全部', '接待开场', '产品介绍', '异议处理', '成交推进', '售后维护', '其他']

Page({
  data: {
    theme: {},
    categories: CATEGORIES,
    category: '全部',
    keyword: '',
    allRows: [],
    rows: [],
    loading: false,
    error: '',
    drawer: false,
    copiedId: 0,
    saving: false,
    formError: '',
    form: { title: '', scriptType: '接待开场', content: '' }
  },
  onShow() {
    themeUtil.apply(this)
    if (session.requireLogin()) this.load()
  },
  onKeyword(e) { this.setData({ keyword: e.detail.value }) },
  setCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ category, rows: this.filterRows(this.data.allRows, category) })
  },
  filterRows(rows, category) {
    return category === '全部' ? rows : rows.filter((item) => item.scriptType === category)
  },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const data = await api.scriptList({ pageNum: 1, pageSize: 100, keyword: this.data.keyword, status: 0 })
      const allRows = list.rows(data).map((item) => Object.assign({}, item, { scriptType: item.scriptType || '其他' }))
      this.setData({ allRows, rows: this.filterRows(allRows, this.data.category) })
    } catch (error) {
      this.setData({ error: error.message || '话术加载失败' })
    } finally {
      this.setData({ loading: false })
    }
  },
  openDrawer() { this.setData({ drawer: true, formError: '' }) },
  closeDrawer() { this.setData({ drawer: false }) },
  noop() {},
  onForm(e) { this.setData({ ['form.' + e.currentTarget.dataset.field]: e.detail.value }) },
  setFormType(e) { this.setData({ 'form.scriptType': e.currentTarget.dataset.type }) },
  copy(e) {
    const id = e.currentTarget.dataset.id
    const row = this.data.allRows.find((item) => String(item.id) === String(id))
    if (!row || !row.content) return ui.toast('这条话术没有内容')
    wx.setClipboardData({ data: row.content, success: () => { this.setData({ copiedId: id }); ui.toast('话术已复制', 'success') } })
  },
  async save() {
    const title = String(this.data.form.title || '').trim()
    const content = String(this.data.form.content || '').trim()
    if (!title) return this.setData({ formError: '请填写话术标题' })
    if (!content) return this.setData({ formError: '请填写话术内容' })
    this.setData({ saving: true, formError: '' })
    try {
      await api.saveScript({ id: 0, title, content, scriptType: this.data.form.scriptType, status: 0, sortNo: 0 })
      ui.toast('话术已保存', 'success')
      this.setData({ drawer: false, form: { title: '', scriptType: '接待开场', content: '' } })
      await this.load()
    } catch (error) { this.setData({ formError: error.message || '保存失败' }) }
    finally { this.setData({ saving: false }) }
  },
  onTheme() { themeUtil.apply(this) }
})
