const KEY = 'jingyue_theme'
const listeners = new Set()

const THEMES = {
  spring: {
    id: 'spring',
    label: '\u8282\u6c14 \u00b7 \u6625',
    short: '\u6625\u5206 \u00b7 \u6843\u82b1',
    navFront: '#000000',
    navBg: '#FDF5F2',
    tabColor: '#8d6d68',
    tabSelected: '#5A3835',
    tabBg: '#FDF5F2',
    tabBorder: 'white',
    style: '--ink:#2A2022;--muted:#8A6460;--paper:#FDF5F2;--surface:rgba(255,255,255,.62);--line:rgba(216,156,146,.35);--jade:#5A3835;--jade-soft:#f8e4df;--gold:#b58555;--red:#9a4d55;--blue:#7d5b63;--page-bg:linear-gradient(180deg,#FDF5F2 0%,#F8E8E4 52%,#F1DAD4 100%);--nav-bg:#FDF5F2;--nav-front:#2A2022;--btn-grad:linear-gradient(135deg,#3C2827 0%,#6B423E 50%,#3C2827 100%);--btn-text:#FDF7F2;background:linear-gradient(180deg,#FDF5F2 0%,#F8E8E4 52%,#F1DAD4 100%);color:#2A2022;'
  },
  summer: {
    id: 'summer',
    label: '\u8282\u6c14 \u00b7 \u590f',
    short: '\u590f\u81f3 \u00b7 \u6c34\u7eb9',
    navFront: '#000000',
    navBg: '#E7F4EE',
    tabColor: '#5d7b72',
    tabSelected: '#145C49',
    tabBg: '#E7F4EE',
    tabBorder: 'white',
    style: '--ink:#16352C;--muted:#3E564E;--paper:#E7F4EE;--surface:rgba(255,255,255,.62);--line:rgba(80,150,130,.28);--jade:#145C49;--jade-soft:#e3f4ee;--gold:#b08a45;--red:#8d5a55;--blue:#1F6B56;--page-bg:linear-gradient(180deg,#F3FBF7 0%,#D7F0E4 48%,#8FCBB4 100%);--nav-bg:#E7F4EE;--nav-front:#16352C;--btn-grad:linear-gradient(135deg,#0D4939 0%,#1F8067 55%,#0D4939 100%);--btn-text:#F3FBF7;background:linear-gradient(180deg,#F3FBF7 0%,#D7F0E4 48%,#8FCBB4 100%);color:#16352C;'
  },
  autumn: {
    id: 'autumn',
    label: '\u8282\u6c14 \u00b7 \u79cb',
    short: '\u79cb\u5206 \u00b7 \u67ab\u843d',
    navFront: '#000000',
    navBg: '#F8E7D2',
    tabColor: '#8a6248',
    tabSelected: '#6B3414',
    tabBg: '#F8E7D2',
    tabBorder: 'white',
    style: '--ink:#4A2A16;--muted:#7A4A28;--paper:#F8E7D2;--surface:rgba(255,248,240,.7);--line:rgba(196,106,46,.28);--jade:#6B3414;--jade-soft:#f8eadb;--gold:#C46A2E;--red:#9a3d22;--blue:#8A3E12;--page-bg:linear-gradient(180deg,#FFF6EA 0%,#F6D7B0 50%,#E7A15A 100%);--nav-bg:#F8E7D2;--nav-front:#4A2A16;--btn-grad:linear-gradient(135deg,#5A2810 0%,#B55B24 55%,#5A2810 100%);--btn-text:#FFF8F0;background:linear-gradient(180deg,#FFF6EA 0%,#F6D7B0 50%,#E7A15A 100%);color:#4A2A16;'
  },
  winter: {
    id: 'winter',
    label: '\u8282\u6c14 \u00b7 \u51ac',
    short: '\u51ac\u81f3 \u00b7 \u521d\u96ea',
    navFront: '#ffffff',
    navBg: '#1B2433',
    tabColor: '#b7c6d8',
    tabSelected: '#E8F1FF',
    tabBg: '#1B2433',
    tabBorder: 'black',
    style: '--ink:#F4F7FB;--muted:#C9D5E6;--paper:#1B2433;--surface:rgba(18,26,38,.72);--line:rgba(210,225,245,.22);--jade:#E8F1FF;--jade-soft:rgba(232,241,255,.12);--gold:#d7e4f5;--red:#e7b2a4;--blue:#d5e4f7;--page-bg:linear-gradient(180deg,#243044 0%,#1B2433 46%,#101722 100%);--nav-bg:#1B2433;--nav-front:#F4F7FB;--btn-grad:linear-gradient(135deg,#DCE9FA 0%,#A9C7E8 55%,#DCE9FA 100%);--btn-text:#172132;background:linear-gradient(180deg,#243044 0%,#1B2433 46%,#101722 100%);color:#F4F7FB;'
  }
}

const LEGACY = { blush: 'spring', celadon: 'summer', dark: 'winter' }

function current() {
  const raw = wx.getStorageSync(KEY) || 'spring'
  const id = LEGACY[raw] || raw
  return THEMES[id] || THEMES.spring
}

function decorate(theme) {
  const winter = theme.id === 'winter'
  const extra = winter
    ? '--surface-strong:rgba(28,38,54,.88);--surface-soft:rgba(16,22,34,.55);--glow:rgba(180,210,255,.18);--shadow:0 12rpx 32rpx rgba(0,0,0,.18);--gold-soft:rgba(232,241,255,.12);--red-soft:rgba(231,178,164,.16);--btn-text:#1B2433;'
    : '--surface-strong:rgba(255,255,255,.86);--surface-soft:rgba(255,255,255,.5);--glow:rgba(255,255,255,.45);--shadow:0 12rpx 32rpx rgba(60,40,39,.06);--gold-soft:#f3ead9;--red-soft:#f7e4e0;--btn-text:#fff;'
  return Object.assign({}, theme, { style: theme.style + extra })
}

function apply(page) {
  const theme = decorate(current())
  if (page && page.setData) page.setData({ theme })
  wx.setNavigationBarColor({ frontColor: theme.navFront, backgroundColor: theme.navBg, animation: { duration: 280, timingFunc: 'easeIn' } })
  return theme
}

function use(id, page) {
  if (!THEMES[id]) return current()
  wx.setStorageSync(KEY, id)
  const theme = apply(page)
  listeners.forEach((listener) => {
    try { listener(theme) } catch (error) { console.error('theme listener failed', error) }
  })
  return theme
}

function subscribe(listener) {
  if (typeof listener !== 'function') return function () {}
  listeners.add(listener)
  return function () { listeners.delete(listener) }
}

function seasons() { return list().map((item) => decorate(item)) }


function list() { return [THEMES.spring, THEMES.summer, THEMES.autumn, THEMES.winter] }

module.exports = { THEMES, current, apply, use, subscribe, list, seasons }
