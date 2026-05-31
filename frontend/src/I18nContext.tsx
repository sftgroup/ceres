import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Locale = 'en' | 'zh-TW'

type TranslationMap = Record<string, Record<string, string>>

const translations: TranslationMap = {
  'app.title': { en: 'Ceres', 'zh-TW': 'Ceres' },
  'app.subtitle': { en: 'Decentralized Social Relationship Network', 'zh-TW': '去中心化社交關係網絡' },
  'app.description': { en: 'Mint your DID NFT and build your on-chain social graph.', 'zh-TW': '鑄造你的 DID NFT，構建鏈上社交圖譜。' },

  // HomePage
  'home.hero.title': { en: 'Ceres', 'zh-TW': 'Ceres' },
  'home.hero.subtitle': { en: 'Decentralized Social Relationship Network', 'zh-TW': '去中心化社交關係網絡' },
  'home.hero.cta': { en: 'Create Your DID', 'zh-TW': '創建你的 DID' },
  'home.stats.profiles': { en: 'Total Profiles', 'zh-TW': '總配置文件數' },
  'home.stats.connections': { en: 'Total Connections', 'zh-TW': '總連接數' },
  'home.levels.title': { en: 'Level System', 'zh-TW': '等級系統' },
  'home.levels.desc': { en: 'Level up by growing your network', 'zh-TW': '通過擴展網絡來升級' },
  'home.graph.title': { en: 'Active Network', 'zh-TW': '活躍網絡' },

  // Profile
  'profile.title': { en: 'Profile', 'zh-TW': '個人檔案' },
  'profile.edit': { en: 'Edit Profile', 'zh-TW': '編輯檔案' },
  'profile.save': { en: 'Save', 'zh-TW': '保存' },
  'profile.cancel': { en: 'Cancel', 'zh-TW': '取消' },
  'profile.name': { en: 'Name', 'zh-TW': '名稱' },
  'profile.bio': { en: 'Bio', 'zh-TW': '簡介' },
  'profile.avatar': { en: 'Avatar URL', 'zh-TW': '頭像連結' },
  'profile.urls': { en: 'Links', 'zh-TW': '連結' },
  'profile.owner': { en: 'Owner', 'zh-TW': '擁有者' },
  'profile.ancestors': { en: 'Invite Chain', 'zh-TW': '邀請鏈' },
  'profile.inviter': { en: 'Invited by', 'zh-TW': '邀請人' },
  'profile.invitees': { en: 'Invitees', 'zh-TW': '被邀請者' },
  'profile.directInvites': { en: 'Direct Invites', 'zh-TW': '直接邀請' },
  'profile.totalDescendants': { en: 'Total Descendants', 'zh-TW': '總後代數' },
  'profile.notFound': { en: 'Profile not found', 'zh-TW': '未找到個人檔案' },
  'profile.loading': { en: 'Loading...', 'zh-TW': '加載中...' },
  'profile.tokenId': { en: 'DID Token ID', 'zh-TW': 'DID Token ID' },
  'profile.level': { en: 'Level', 'zh-TW': '等級' },

  // Invite
  'invite.title': { en: 'Invite Friends', 'zh-TW': '邀請朋友' },
  'invite.description': { en: 'Share your invite link to grow your network.', 'zh-TW': '分享你的邀請連結來擴展網絡。' },
  'invite.yourLink': { en: 'Your Invite Link', 'zh-TW': '你的邀請連結' },
  'invite.copyLink': { en: 'Copy Link', 'zh-TW': '複製連結' },
  'invite.copied': { en: 'Copied!', 'zh-TW': '已複製！' },
  'invite.noProfile': { en: 'You need a DID profile first.', 'zh-TW': '你需要先創建 DID 檔案。' },
  'invite.createFirst': { en: 'Create Profile', 'zh-TW': '創建檔案' },
  'invite.preview': { en: 'What they will see', 'zh-TW': '他們將看到的內容' },
  'invite.qrCode': { en: 'QR Code', 'zh-TW': '二維碼' },

  // Search
  'search.title': { en: 'Search Profiles', 'zh-TW': '搜索檔案' },
  'search.placeholder': { en: 'Search by Token ID or address...', 'zh-TW': '按 Token ID 或地址搜索...' },
  'search.noResults': { en: 'No results found', 'zh-TW': '未找到結果' },
  'search.recent': { en: 'Recent Profiles', 'zh-TW': '最近檔案' },

  // Create Profile
  'create.title': { en: 'Create Your DID Profile', 'zh-TW': '創建你的 DID 檔案' },
  'create.name': { en: 'Display Name', 'zh-TW': '顯示名稱' },
  'create.bio': { en: 'Bio', 'zh-TW': '簡介' },
  'create.avatar': { en: 'Avatar URL', 'zh-TW': '頭像圖片連結' },
  'create.urls': { en: 'Personal Links (comma separated)', 'zh-TW': '個人連結（逗號分隔）' },
  'create.inviter': { en: 'Inviter Token ID (optional)', 'zh-TW': '邀請人 Token ID（可選）' },
  'create.submit': { en: 'Mint DID NFT', 'zh-TW': '鑄造 DID NFT' },
  'create.processing': { en: 'Processing...', 'zh-TW': '處理中...' },
  'create.success': { en: 'Profile created!', 'zh-TW': '檔案創建成功！' },

  // Levels
  'level.seed': { en: 'Seed', 'zh-TW': '種子' },
  'level.bronze': { en: 'Bronze', 'zh-TW': '青銅' },
  'level.silver': { en: 'Silver', 'zh-TW': '白銀' },
  'level.gold': { en: 'Gold', 'zh-TW': '黃金' },
  'level.crystal': { en: 'Crystal', 'zh-TW': '水晶' },
  'level.diamond': { en: 'Diamond', 'zh-TW': '鑽石' },

  // Navbar
  'nav.home': { en: 'Home', 'zh-TW': '首頁' },
  'nav.search': { en: 'Search', 'zh-TW': '搜索' },
  'nav.invite': { en: 'Invite', 'zh-TW': '邀請' },
  'nav.profile': { en: 'My Profile', 'zh-TW': '我的檔案' },

  // Common
  'common.loading': { en: 'Loading...', 'zh-TW': '加載中...' },
  'common.error': { en: 'Error', 'zh-TW': '錯誤' },
  'common.connect': { en: 'Connect Wallet', 'zh-TW': '連接錢包' },
  'common.disconnect': { en: 'Disconnect', 'zh-TW': '斷開' },
  'common.address': { en: 'Address', 'zh-TW': '地址' },
}

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
  getTranslation: (key: string) => Record<Locale, string>
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('ceres-locale')
    if (saved === 'en' || saved === 'zh-TW') return saved
    return navigator.language.startsWith('zh') ? 'zh-TW' : 'en'
  })

  const setLocalePersisted = useCallback((l: Locale) => {
    localStorage.setItem('ceres-locale', l)
    setLocale(l)
  }, [])

  const t = useCallback(
    (key: string) => translations[key]?.[locale] ?? key,
    [locale],
  )

  const getTranslation = useCallback(
    (key: string): Record<Locale, string> => translations[key] ?? { en: key, 'zh-TW': key },
    [],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale: setLocalePersisted, t, getTranslation }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
