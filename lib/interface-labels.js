// Từ điển giao diện 2 ngôn ngữ (en / ja) — xoay vòng mỗi 10 giây.
// Giữ nguyên: tên "Slimu Neet", tên/bong bóng chat của Rin, dữ liệu repo.
export const UI = {
  intro: {
    en: 'Just a plain human with hobbies and a passion for linux & open source.',
    ja: '趣味たくさんの普通の人。linux & オープンソースに夢中です。'
  },
  marryBed: {
    en: 'Just go ahead and marry your bed△',
    ja: '布団と結婚しちゃえばいいのに△'
  },
  projects: {
    en: 'Projects',
    ja: 'プロジェクト'
  },
  onTheWeb: {
    en: 'On the web',
    ja: 'ウェブ上'
  },
  footerRights: {
    en: 'All Rights Reserved.',
    ja: '無断転載禁止。'
  },
  clickToEnter: {
    en: 'click to enter...',
    ja: 'クリックして入る...'
  },
  connecting: {
    en: 'Connecting to Discord status...',
    ja: 'Discordステータスに接続中...'
  },
  readyToChat: {
    en: 'Ready to chat',
    ja: '雑談歓迎'
  },
  takingRest: {
    en: 'Taking a rest',
    ja: 'お休み中'
  },
  stars: {
    en: 'Stars',
    ja: 'スター'
  },
  listening: {
    en: 'Listening:',
    ja: '再生中:'
  },
  playing: {
    en: 'Playing:',
    ja: 'プレイ中:'
  },
  justNow: {
    en: 'just now',
    ja: 'たった今'
  }
}

// "push X trước" theo từng ngôn ngữ (sinh ra từ timeAgo bên dưới)
export const TIME = {
  minute: {
    en: n => `${n} minute${n === 1 ? '' : 's'} ago`,
    ja: n => `${n}分前`
  },
  hour: {
    en: n => `${n} hour${n === 1 ? '' : 's'} ago`,
    ja: n => `${n}時間前`
  },
  day: {
    en: n => `${n} day${n === 1 ? '' : 's'} ago`,
    ja: n => `${n}日前`
  },
  week: {
    en: n => `${n} week${n === 1 ? '' : 's'} ago`,
    ja: n => `${n}週間前`
  },
  month: {
    en: n => `${n} month${n === 1 ? '' : 's'} ago`,
    ja: n => `${n}か月前`
  },
  year: {
    en: n => `${n} year${n === 1 ? '' : 's'} ago`,
    ja: n => `${n}年前`
  }
}

// "push X trước" — thời gian tương đối theo ngôn ngữ giao diện hiện tại
export const timeAgo = (lang, dateStr) => {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 0) return UI.justNow[lang]
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return UI.justNow[lang]
  const hours = Math.floor(mins / 60)
  if (hours < 1) return TIME.minute[lang](mins)
  const days = Math.floor(hours / 24)
  if (days < 1) return TIME.hour[lang](hours)
  const weeks = Math.floor(days / 7)
  if (weeks < 1) return TIME.day[lang](days)
  const months = Math.floor(days / 30)
  if (months < 1) return TIME.week[lang](weeks)
  const years = Math.floor(days / 365)
  if (years < 1) return TIME.month[lang](months)
  return TIME.year[lang](years)
}