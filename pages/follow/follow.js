const themeUtil = require('../../utils/theme')
const session = require('../../utils/session')
const api = require('../../utils/api')
const list = require('../../utils/list')
const format = require('../../utils/format')
const ui = require('../../utils/ui')
const bridge = require('../../utils/bridge')
const navigation = require('../../utils/navigation')

Page({
  data: { theme: {}, keyword: '', rows: [], loading: false, error: '', memberId: 0, memberName: '', content: '', nextTime: '', saving: false },
  onShow() {
    themeUtil.apply(this)
    if (!session.requireLogin()) return
    const member = bridge.takeFollowMember()
    if (member && member.memberId) this.setData({ memberId: member.memberId, memberName: member.memberName || '', keyword: member.memberName || member.phone || '' })
    this.load()
  },
  onKeyword(e) { this.setData({ keyword: e.detail.value }) },
  onContent(e) { this.setData({ content: e.detail.value }) },
  onNextTime(e) { this.setData({ nextTime: e.detail.value }) },
  async load() {
    this.setData({ loading: true, error: '' })
    try {
      const data = await api.followList({ pageNum: 1, pageSize: 40, keyword: this.data.keyword, memberId: this.data.memberId || undefined })
      this.setData({ rows: list.rows(data).map((item) => Object.assign({}, item, { timeText: format.dateText(item.followTime || item.createTime), nextText: item.nextFollowTime ? format.dateText(item.nextFollowTime) : '未定' })) })
    } catch (error) { this.setData({ error: error.message || '加载失败' }) }
    finally { this.setData({ loading: false }) }
  },
  async saveFollow() {
    if (!this.data.memberId) return ui.toast('请先从客户档案选择客户')
    if (!this.data.content.trim()) return ui.toast('请填写跟进内容')
    this.setData({ saving: true })
    try {
      await api.saveFollow({ memberId: this.data.memberId, followType: 1, content: this.data.content.trim(), nextFollowTime: this.data.nextTime ? this.data.nextTime + ' 00:00:00' : null })
      this.setData({ content: '', nextTime: '' })
      this.load()
      ui.toast('跟进记录已保存', 'success')
    } catch (error) { ui.toast(error.message || '保存失败') }
    finally { this.setData({ saving: false }) }
  },
  toTask(e) {
    const row = this.data.rows[e.currentTarget.dataset.index]
    if (!row) return
    bridge.putFollowTask({ title: '回访客户【' + (row.memberName || '未记名') + '】：' + String(row.content || '').slice(0, 20), remark: row.content || '' })
    navigation.tab('/pages/tasks/tasks')
  },
  onTheme() { themeUtil.apply(this) }
})
