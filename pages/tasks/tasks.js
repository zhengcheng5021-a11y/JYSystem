const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const api = require('../../utils/api')
const list = require('../../utils/list')
const format = require('../../utils/format')
const ui = require('../../utils/ui')
const bridge = require('../../utils/bridge')

const PRIORITY = { 4: '紧急', 3: '重要', 2: '普通', 1: '稍后' }

Page({
  data: { theme: {}, view: 'today', rows: [], title: '', priority: 3, openCount: 0, doneCount: 0, loading: false, saving: false, error: '' },
  onShow() {
    themeUtil.apply(this)
    if (!session.requireLogin()) return
    this.setData({ view: bridge.preference('taskView', 'today'), priority: Number(bridge.preference('taskPriority', 3)) })
    this.load()
    this.consumeFollowTask()
  },
  onTitle(e) { this.setData({ title: e.detail.value }) },
  setView(e) {
    const view = e.currentTarget.dataset.view
    bridge.setPreference('taskView', view)
    this.setData({ view })
    this.load()
  },
  setPriority(e) {
    const priority = Number(e.currentTarget.dataset.priority)
    bridge.setPreference('taskPriority', priority)
    this.setData({ priority })
  },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const data = await api.workItems({ pageNum: 1, pageSize: 50, view: this.data.view })
      const rows = list.rows(data).map((item) => Object.assign({}, item, { priorityText: PRIORITY[Number(item.priority)] || item.priorityName || '普通', dueText: item.dueTime ? format.dateText(item.dueTime) : (item.isOverdue ? '已逾期' : '今日内') }))
      const openCount = rows.filter((item) => Number(item.status) !== 1).length
      this.setData({ rows, openCount, doneCount: rows.length - openCount })
    } catch (error) { this.setData({ error: error.message || '加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  async add() {
    if (!this.data.title.trim()) return ui.toast('请填写待办')
    this.setData({ saving: true, error: '' })
    try {
      await api.saveWorkItem({ id: 0, title: this.data.title.trim(), itemKind: 1, periodType: 3, priority: this.data.priority, dueTime: format.todayText() + ' 23:59:59' })
      this.setData({ title: '' })
      this.load()
      ui.toast('已加入今日待办', 'success')
    } catch (error) { this.setData({ error: error.message || '保存失败' }) }
    finally { this.setData({ saving: false }) }
  },
  async toggle(e) {
    try { await api.completeWorkItem(e.currentTarget.dataset.id, Number(e.currentTarget.dataset.done) !== 1); this.load() }
    catch (error) { ui.toast(error.message || '更新失败') }
  },
  async consumeFollowTask() {
    const item = bridge.takeFollowTask()
    if (!item || !item.title) return
    try {
      await api.saveWorkItem({ id: 0, title: item.title, itemKind: 1, periodType: 3, priority: 3, dueTime: format.todayText() + ' 23:59:59', remark: item.remark || '' })
      ui.toast('客户跟进已转入今日待办', 'success')
      this.load()
    } catch (error) { ui.toast(error.message || '转入待办失败') }
  },
  onTheme() { themeUtil.apply(this) }
})
