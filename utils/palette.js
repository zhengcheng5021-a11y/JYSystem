// Single source of truth for the JINGYUE visual language.
// The login page, every inner page, the top nav and the bottom tab bar all read
// their palette from here, so the whole mini program stays on one aesthetic.

const ORDER = ['blush', 'celadon', 'dark']
const DEFAULT_ID = 'blush'

const THEMES = {
  blush: {
    id: 'blush',
    label: '画境 · 绯粉',
    short: '绯粉春霖 · 桃夭',
    name: '绯粉春霖 · 桃夭',
    caption: '温润柔粉 · 桃花初绽',
    dot: '#E5A8A2',
    accent: '#9A4D55',
    navBg: '#FDF5F2',
    navFront: '#000000',
    pageStyle: 'background:linear-gradient(180deg,#FDF5F2 0%,#F8E8E4 52%,#F1DAD4 100%);color:#3A2624;',
    textColor: '#3A2624',
    subTextColor: '#553634',
    labelColor: '#5E4442',
    cardBg: 'rgba(255,255,255,.55)',
    cardBorder: 'rgba(255,255,255,.7)',
    cardShadow: '0 18px 42px rgba(168,112,102,.26), 0 6px 16px rgba(168,112,102,.14), inset 0 1px 0 rgba(255,255,255,.9)',
    cardGlow: 'radial-gradient(circle,rgba(251,193,205,.38),transparent 70%)',
    headBorder: 'rgba(60,40,39,.08)',
    seal: '#99554D',
    inputBg: 'rgba(255,255,255,.85)',
    inputBorder: 'rgba(216,156,146,.3)',
    inputColor: '#2A2022',
    inputPlaceholder: '#A89495',
    iconColor: '#A89495',
    buttonGradient: 'linear-gradient(90deg,#3C2827 0%,#5A3835 52%,#3C2827 100%)',
    buttonTextColor: '#FDF7F2',
    buttonIconColor: '#F2D9BF',
    buttonShadow: '0 6px 20px rgba(60,40,39,.3)',
    checkColor: '#523533',
    checkTextColor: '#FFFFFF',
    linkColor: '#7D403C',
    capsuleBg: 'rgba(255,255,255,.4)',
    capsuleBorder: 'rgba(60,40,39,.1)',
    capsuleColor: '#332324',
    sloganLine: 'rgba(216,156,146,.65)',
    knotColor: 'rgba(154,77,85,.55)',
    mountainColor: 'rgba(216,156,146,.35)',
    orbGradient: 'radial-gradient(circle,rgba(244,166,184,.42) 0%,rgba(223,176,122,.2) 58%,transparent 100%)',
    logoGlow: 'radial-gradient(circle,rgba(244,166,184,.42),rgba(250,212,192,.2) 55%,transparent 72%)',
    petalColors: ['#F4A6B8', '#FBC1CD', '#E88B9E', '#FBECEB'],
    dustColor: '#DFB07A',
    rippleColor: '#D9A392',
    vars: {
      paper: '#FDF5F2',
      surface: 'rgba(255,255,255,.55)',
      surfaceStrong: 'rgba(255,255,255,.82)',
      surfaceSoft: 'rgba(255,255,255,.38)',
      ink: '#3A2624',
      muted: '#553634',
      line: 'rgba(216,156,146,.34)',
      jade: '#9A4D55',
      jadeSoft: 'rgba(154,77,85,.12)',
      gold: '#B58555',
      goldSoft: 'rgba(181,133,85,.15)',
      red: '#9A4D55',
      redSoft: 'rgba(154,77,85,.13)',
      blue: '#7D5B63',
      shadow: '0 18rpx 40rpx rgba(168,112,102,.18), 0 6rpx 16rpx rgba(168,112,102,.10)',
      glow: 'radial-gradient(circle,rgba(251,193,205,.40) 0%,rgba(255,214,170,.16) 65%,transparent 100%)',
      btnGrad: 'linear-gradient(90deg,#3C2827 0%,#5A3835 52%,#3C2827 100%)',
      btnText: '#FDF7F2',
      navBg: '#FDF5F2',
      navFront: '#3A2624',
      pageBg: 'linear-gradient(180deg,#FDF5F2 0%,#F8E8E4 52%,#F1DAD4 100%)'
    }
  },
  celadon: {
    id: 'celadon',
    label: '画境 · 天青',
    short: '烟雨天青 · 润玉',
    name: '烟雨天青 · 润玉',
    caption: '青瓷烟雨 · 温润如玉',
    dot: '#7CA296',
    accent: '#2F6B5A',
    navBg: '#EFF6F3',
    navFront: '#000000',
    pageStyle: 'background:linear-gradient(180deg,#EFF6F3 0%,#E3EEE9 52%,#D4E4DC 100%);color:#21352E;',
    textColor: '#21352E',
    subTextColor: '#3E564E',
    labelColor: '#3E564E',
    cardBg: 'rgba(255,255,255,.6)',
    cardBorder: 'rgba(164,196,184,.5)',
    cardShadow: '0 18px 42px rgba(58,104,90,.22), 0 6px 16px rgba(58,104,90,.12), inset 0 1px 0 rgba(255,255,255,.85)',
    cardGlow: 'radial-gradient(circle,rgba(168,212,198,.35),transparent 70%)',
    headBorder: 'rgba(33,53,46,.08)',
    seal: '#4F7D6F',
    inputBg: 'rgba(255,255,255,.85)',
    inputBorder: 'rgba(144,180,168,.35)',
    inputColor: '#182B24',
    inputPlaceholder: '#7A968D',
    iconColor: '#7A968D',
    buttonGradient: 'linear-gradient(90deg,#243831 0%,#3B564C 52%,#243831 100%)',
    buttonTextColor: '#F0F7F4',
    buttonIconColor: '#CBE4DA',
    buttonShadow: '0 6px 20px rgba(36,56,49,.26)',
    checkColor: '#243831',
    checkTextColor: '#FFFFFF',
    linkColor: '#2F6B5A',
    capsuleBg: 'rgba(255,255,255,.4)',
    capsuleBorder: 'rgba(33,53,46,.1)',
    capsuleColor: '#21352E',
    sloganLine: 'rgba(124,162,150,.6)',
    knotColor: 'rgba(47,107,90,.52)',
    mountainColor: 'rgba(124,162,150,.35)',
    orbGradient: 'radial-gradient(circle,rgba(168,212,198,.4) 0%,rgba(216,190,140,.2) 58%,transparent 100%)',
    logoGlow: 'radial-gradient(circle,rgba(168,212,198,.38),rgba(216,190,140,.16) 55%,transparent 72%)',
    petalColors: ['#C8E3D8', '#F5ECEB', '#9BBCAE', '#E4F0EB'],
    dustColor: '#A7C7B9',
    rippleColor: '#7CA296',
    vars: {
      paper: '#EFF6F3',
      surface: 'rgba(255,255,255,.6)',
      surfaceStrong: 'rgba(255,255,255,.84)',
      surfaceSoft: 'rgba(255,255,255,.4)',
      ink: '#21352E',
      muted: '#3E564E',
      line: 'rgba(144,180,168,.35)',
      jade: '#2F6B5A',
      jadeSoft: 'rgba(47,107,90,.12)',
      gold: '#B08A45',
      goldSoft: 'rgba(176,138,69,.15)',
      red: '#8D5A55',
      redSoft: 'rgba(141,90,85,.13)',
      blue: '#1F6B56',
      shadow: '0 18rpx 40rpx rgba(58,104,90,.16), 0 6rpx 16rpx rgba(58,104,90,.09)',
      glow: 'radial-gradient(circle,rgba(168,212,198,.40) 0%,rgba(216,190,140,.16) 65%,transparent 100%)',
      btnGrad: 'linear-gradient(90deg,#243831 0%,#3B564C 52%,#243831 100%)',
      btnText: '#F0F7F4',
      navBg: '#EFF6F3',
      navFront: '#21352E',
      pageBg: 'linear-gradient(180deg,#EFF6F3 0%,#E3EEE9 52%,#D4E4DC 100%)'
    }
  },
  dark: {
    id: 'dark',
    label: '画境 · 玄黛',
    short: '玄黛金辉 · 沉香',
    name: '玄黛金辉 · 沉香',
    caption: '墨色鎏金 · 静夜生香',
    dot: '#2B2326',
    accent: '#DFB07A',
    navBg: '#1D1618',
    navFront: '#ffffff',
    pageStyle: 'background:linear-gradient(180deg,#1D1618 0%,#2A1F22 50%,#181113 100%);color:#FBE9DC;',
    textColor: '#FBE9DC',
    subTextColor: '#D8BEAA',
    labelColor: '#D8BEAA',
    cardBg: 'rgba(35,27,30,.65)',
    cardBorder: 'rgba(223,176,122,.25)',
    cardShadow: '0 18px 42px rgba(0,0,0,.46), 0 6px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.14)',
    cardGlow: 'radial-gradient(circle,rgba(223,176,122,.2),transparent 70%)',
    headBorder: 'rgba(223,176,122,.16)',
    seal: '#DFB07A',
    inputBg: 'rgba(20,15,17,.7)',
    inputBorder: 'rgba(223,176,122,.25)',
    inputColor: '#FDF5F2',
    inputPlaceholder: '#877074',
    iconColor: '#A98D7E',
    buttonGradient: 'linear-gradient(90deg,#DFB07A 0%,#C79558 52%,#DFB07A 100%)',
    buttonTextColor: '#2B1B15',
    buttonIconColor: '#5C3A22',
    buttonShadow: '0 6px 20px rgba(0,0,0,.32)',
    checkColor: '#DFB07A',
    checkTextColor: '#2B1B15',
    linkColor: '#EBC79B',
    capsuleBg: 'rgba(255,255,255,.12)',
    capsuleBorder: 'rgba(255,255,255,.2)',
    capsuleColor: '#F5E4CE',
    sloganLine: 'rgba(223,176,122,.5)',
    knotColor: 'rgba(223,176,122,.6)',
    mountainColor: 'rgba(223,176,122,.15)',
    orbGradient: 'radial-gradient(circle,rgba(223,176,122,.3) 0%,rgba(200,120,100,.14) 58%,transparent 100%)',
    logoGlow: 'radial-gradient(circle,rgba(223,176,122,.32),rgba(200,120,100,.12) 55%,transparent 72%)',
    petalColors: ['#DFB07A', '#FBE6D0', '#D9A392', '#EED5C8'],
    dustColor: '#FFE3B5',
    rippleColor: '#DFB07A',
    vars: {
      paper: '#1D1618',
      surface: 'rgba(35,27,30,.65)',
      surfaceStrong: 'rgba(28,22,24,.85)',
      surfaceSoft: 'rgba(20,15,17,.5)',
      ink: '#FBE9DC',
      muted: '#D8BEAA',
      line: 'rgba(223,176,122,.24)',
      jade: '#DFB07A',
      jadeSoft: 'rgba(223,176,122,.16)',
      gold: '#DFB07A',
      goldSoft: 'rgba(223,176,122,.14)',
      red: '#E7B2A4',
      redSoft: 'rgba(231,178,164,.16)',
      blue: '#C9D5E6',
      shadow: '0 18rpx 40rpx rgba(0,0,0,.40), 0 6rpx 16rpx rgba(0,0,0,.24)',
      glow: 'radial-gradient(circle,rgba(223,176,122,.22) 0%,rgba(200,120,100,.12) 65%,transparent 100%)',
      btnGrad: 'linear-gradient(90deg,#DFB07A 0%,#C79558 52%,#DFB07A 100%)',
      btnText: '#2B1B15',
      navBg: '#1D1618',
      navFront: '#FBE9DC',
      pageBg: 'linear-gradient(180deg,#1D1618 0%,#2A1F22 50%,#181113 100%)'
    }
  }
}

// Older builds stored spring/summer/autumn/winter; map them onto this palette.
const LEGACY = { spring: 'blush', summer: 'celadon', autumn: 'blush', winter: 'dark' }

function normalize(id) {
  const key = LEGACY[id] || id
  return THEMES[key] ? key : DEFAULT_ID
}

// Painterly background: the login page's soft glows layered over the season gradient.
function backdropOf(theme) {
  const vars = (theme && theme.vars) || THEMES[DEFAULT_ID].vars
  return [
    'radial-gradient(58% 38% at 14% 4%,' + vars.jadeSoft + ' 0%,transparent 72%)',
    'radial-gradient(52% 34% at 88% 10%,' + vars.goldSoft + ' 0%,transparent 74%)',
    'radial-gradient(76% 46% at 50% 104%,' + vars.jadeSoft + ' 0%,transparent 78%)',
    vars.pageBg
  ].join(',')
}

// CSS custom properties consumed by app.wxss and every page stylesheet.
function styleOf(theme) {
  const vars = (theme && theme.vars) || THEMES[DEFAULT_ID].vars
  return [
    '--paper:' + vars.paper,
    '--surface:' + vars.surface,
    '--surface-strong:' + vars.surfaceStrong,
    '--surface-soft:' + vars.surfaceSoft,
    '--ink:' + vars.ink,
    '--muted:' + vars.muted,
    '--line:' + vars.line,
    '--jade:' + vars.jade,
    '--jade-soft:' + vars.jadeSoft,
    '--gold:' + vars.gold,
    '--gold-soft:' + vars.goldSoft,
    '--red:' + vars.red,
    '--red-soft:' + vars.redSoft,
    '--blue:' + vars.blue,
    '--shadow:' + vars.shadow,
    '--glow:' + vars.glow,
    '--btn-grad:' + vars.btnGrad,
    '--btn-text:' + vars.btnText,
    '--nav-bg:' + vars.navBg,
    '--nav-front:' + vars.navFront,
    '--page-bg:' + backdropOf(theme)
  ].join(';') + ';'
}

function decorate(theme) {
  const base = theme || THEMES[DEFAULT_ID]
  return Object.assign({}, base, {
    // style = full page backdrop; varsStyle = palette only (for nav / tab / menus)
    varsStyle: styleOf(base),
    style: styleOf(base) + 'background:' + backdropOf(base) + ';color:' + base.textColor + ';'
  })
}

module.exports = {
  ORDER,
  DEFAULT_ID,
  LEGACY,
  THEMES,
  normalize,
  styleOf,
  decorate,
  list() { return ORDER.map((id) => THEMES[id]) },
  get(id) { return THEMES[normalize(id)] }
}