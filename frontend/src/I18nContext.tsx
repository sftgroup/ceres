import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Locale = 'en' | 'zh-TW'

type TranslationMap = Record<string, Record<string, string>>

const translations: TranslationMap = {
  // App
  'app.title': { en: 'Ceres', 'zh-TW': 'Ceres' },
  'app.subtitle': { en: 'Decentralized Social Relationship Network', 'zh-TW': '去中心化社交關係網絡' },
  'app.description': { en: 'Mint your DID NFT and build your on-chain social graph.', 'zh-TW': '鑄造你的 DID NFT，構建鏈上社交圖譜。' },
  'app.beta': { en: 'Beta — Sepolia Testnet', 'zh-TW': '測試版 — Sepolia 測試網' },
  'app.network': { en: 'Sepolia Testnet', 'zh-TW': 'Sepolia 測試網' },
  'app.footer.tagline': { en: 'Ceres — Decentralized Social Graph', 'zh-TW': 'Ceres — 去中心化社交圖譜' },

  // HomePage
  'home.hero.title': { en: 'Ceres', 'zh-TW': 'Ceres' },
  'home.hero.subtitle': { en: 'Decentralized Social Relationship Network', 'zh-TW': '去中心化社交關係網絡' },
  'home.hero.cta': { en: 'Create Your DID', 'zh-TW': '創建你的 DID' },
  'home.stats.profiles': { en: 'Total Profiles', 'zh-TW': '總配置文件數' },
  'home.stats.connections': { en: 'Total Connections', 'zh-TW': '總連接數' },
  'home.stats.levels': { en: 'Levels', 'zh-TW': '等級' },
  'home.stats.network': { en: 'Network', 'zh-TW': '網絡' },
  'home.levels.title': { en: 'Level System', 'zh-TW': '等級系統' },
  'home.levels.desc': { en: 'Level up by growing your network', 'zh-TW': '通過擴展網絡來升級' },
  'home.levels.distribution': { en: 'Level Distribution', 'zh-TW': '等級分佈' },
  'home.levels.seed': { en: 'Starting point — 0 descendants', 'zh-TW': '起點 — 0 個後代' },
  'home.levels.bronze': { en: '≥ 3 direct invitees', 'zh-TW': '≥ 3 位直接邀請者' },
  'home.levels.silver': { en: '≥ 10 descendants', 'zh-TW': '≥ 10 位後代' },
  'home.levels.gold': { en: '≥ 50 descendants', 'zh-TW': '≥ 50 位後代' },
  'home.levels.crystal': { en: '≥ 200 descendants', 'zh-TW': '≥ 200 位後代' },
  'home.levels.diamond': { en: '≥ 1000 descendants', 'zh-TW': '≥ 1000 位後代' },
  'home.graph.title': { en: 'Active Network', 'zh-TW': '活躍網絡' },
  'home.cta.title': { en: 'Ready to build your network?', 'zh-TW': '準備好建立你的網絡了嗎？' },
  'home.cta.desc': { en: 'Mint your DID NFT and start inviting friends. Your social graph, on chain.', 'zh-TW': '鑄造你的 DID NFT 並開始邀請朋友。你的社交圖譜，在鏈上。' },
  'home.network.title': { en: 'Ceres Network', 'zh-TW': 'Ceres 網絡' },
  'home.network.desc': { en: 'Explore all DIDs on the global social graph', 'zh-TW': '探索全球社交圖譜上的所有 DID' },
  'home.network.overview': { en: 'Network Overview', 'zh-TW': '網絡概覽' },
  'home.network.totalDids': { en: 'Total DIDs', 'zh-TW': '總 DID 數' },
  'home.network.totalInvites': { en: 'Total Invitations', 'zh-TW': '總邀請數' },
  'home.network.density': { en: 'Network Density', 'zh-TW': '網絡密度' },
  'home.network.connPerDid': { en: 'conn/DID', 'zh-TW': '連接/DID' },
  'home.network.recentMembers': { en: 'Recent Members', 'zh-TW': '最新成員' },
  'home.network.viewAll': { en: 'View All →', 'zh-TW': '查看全部 →' },
  'home.network.searchArrow': { en: 'Search →', 'zh-TW': '搜索 →' },
  'home.network.noProfiles': { en: 'No profiles yet — be the first!', 'zh-TW': '暫無檔案 — 成為第一人！' },
  'home.network.unknown': { en: 'Unknown', 'zh-TW': '未知' },

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
  'profile.notFoundDesc': { en: 'DID # does not exist', 'zh-TW': 'DID # 不存在' },
  'profile.loading': { en: 'Loading...', 'zh-TW': '加載中...' },
  'profile.tokenId': { en: 'DID Token ID', 'zh-TW': 'DID Token ID' },
  'profile.level': { en: 'Level', 'zh-TW': '等級' },
  'profile.noBio': { en: 'No bio yet', 'zh-TW': '暫無簡介' },
  'profile.noInviter': { en: 'No inviter — this is an origin profile', 'zh-TW': '無邀請人 — 這是一個原始檔案' },
  'profile.stats': { en: 'Statistics', 'zh-TW': '統計' },
  'profile.levelUp': { en: 'How to level up', 'zh-TW': '如何升級' },
  'profile.levelUpDesc': { en: 'Level increases based on total descendant count. Invite more people and help your network grow!', 'zh-TW': '等級根據總後代數量增加。邀請更多人，幫助你的網絡成長！' },
  'profile.backHome': { en: '← Back home', 'zh-TW': '← 返回首頁' },

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
  'invite.connectWallet': { en: 'Connect Your Wallet', 'zh-TW': '連接你的錢包' },
  'invite.connectDesc': { en: 'Connect your wallet to view your invite link and grow your network.', 'zh-TW': '連接你的錢包以查看邀請連結並擴展你的網絡。' },
  'invite.needDidDesc': { en: 'You need a DID profile before you can invite others. Create one now to get your invite link!', 'zh-TW': '你需要先有 DID 檔案才能邀請他人。立即創建以獲取你的邀請連結！' },
  'invite.shareDesc': { en: 'Share this link with friends to grow your network:', 'zh-TW': '將此連結分享給朋友以擴展你的網絡：' },
  'invite.detecting': { en: 'Detecting your DID...', 'zh-TW': '正在檢測你的 DID...' },
  'invite.tips': { en: 'Tips', 'zh-TW': '提示' },
  'invite.tip1': { en: 'Share your invite link on social media to grow your network', 'zh-TW': '在社交媒體上分享你的邀請連結以擴展網絡' },
  'invite.tip2': { en: 'Each person you invite becomes part of your descendant tree', 'zh-TW': '你邀請的每個人都會成為你後代樹的一部分' },
  'invite.tip3': { en: 'Your level increases as your descendant count grows', 'zh-TW': '隨著後代數量增加，你的等級也會提升' },
  'invite.tip4': { en: 'DID NFTs are transferable — relationships follow the NFT', 'zh-TW': 'DID NFT 可以轉移 — 關係跟隨 NFT' },

  // Search
  'search.title': { en: 'Search Profiles', 'zh-TW': '搜索檔案' },
  'search.placeholder': { en: 'Search by Token ID or address...', 'zh-TW': '按 Token ID 或地址搜索...' },
  'search.noResults': { en: 'No results found', 'zh-TW': '未找到結果' },
  'search.recent': { en: 'Recent Profiles', 'zh-TW': '最近檔案' },
  'search.button': { en: 'Search', 'zh-TW': '搜索' },
  'search.profileCount': { en: '{count} profiles on the network', 'zh-TW': '網絡上有 {count} 個檔案' },
  'search.explore': { en: 'Explore the Ceres network', 'zh-TW': '探索 Ceres 網絡' },
  'search.hint': { en: 'Try searching by DID Token ID number', 'zh-TW': '嘗試按 DID Token ID 號碼搜索' },
  'search.results': { en: 'Results ({count})', 'zh-TW': '結果 ({count})' },
  'search.moreProfiles': { en: '... and {count} more profiles. Use search to find specific ones.', 'zh-TW': '... 還有 {count} 個檔案。使用搜索查找特定檔案。' },

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
  'create.alreadyHave': { en: 'You already have a DID', 'zh-TW': '你已經有一個 DID' },
  'create.alreadyHaveDesc': { en: 'Each address can only create one DID profile.', 'zh-TW': '每個地址只能創建一個 DID 檔案。' },
  'create.searchProfiles': { en: 'Search Profiles', 'zh-TW': '搜索檔案' },
  'create.close': { en: 'Close', 'zh-TW': '關閉' },
  'create.created': { en: 'Profile Created!', 'zh-TW': '檔案已創建！' },
  'create.done': { en: 'Done', 'zh-TW': '完成' },
  'create.mintFee': { en: 'Mint Fee: {fee} ETH', 'zh-TW': '鑄造費用：{fee} ETH' },

  // MintPage
  'mint.connectWallet': { en: 'Connect Your Wallet', 'zh-TW': '連接你的錢包' },
  'mint.connectDesc': { en: 'Connect your wallet to mint your Ceres DID and join the network.', 'zh-TW': '連接你的錢包以鑄造 Ceres DID 並加入網絡。' },
  'mint.alreadyHaveDID': { en: 'You Already Have a DID', 'zh-TW': '你已經有一個 DID' },
  'mint.alreadyHaveDesc': { en: 'Your wallet already owns a Ceres DID. Each address can only mint one DID.', 'zh-TW': '你的錢包已擁有一個 Ceres DID。每個地址只能鑄造一個 DID。' },
  'mint.viewProfile': { en: 'View Profile →', 'zh-TW': '查看檔案 →' },
  'mint.goHome': { en: 'Go Home', 'zh-TW': '返回首頁' },
  'mint.validating': { en: 'Validating invite link...', 'zh-TW': '正在驗證邀請連結...' },
  'mint.invalidInvite': { en: 'Invalid Invite Link', 'zh-TW': '無效的邀請連結' },
  'mint.inviterNotFound': { en: 'The inviter (DID #{id}) does not exist. Please check your link and try again.', 'zh-TW': '邀請人（DID #{id}）不存在。請檢查你的連結後再試。' },
  'mint.successDesc': { en: 'Your Ceres DID has been minted! Redirecting...', 'zh-TW': '你的 Ceres DID 已鑄造！正在重新導向...' },
  'mint.invitedTitle': { en: "You've been invited to Ceres", 'zh-TW': '你已被邀請加入 Ceres' },
  'mint.invitedDesc': { en: 'Mint your DID NFT and join the decentralized social graph', 'zh-TW': '鑄造你的 DID NFT 並加入去中心化社交圖譜' },
  'mint.invitedBy': { en: 'Invited by', 'zh-TW': '邀請人' },
  'mint.cannotChange': { en: 'This field is set from your invite link and cannot be changed.', 'zh-TW': '此欄位由邀請連結設置，無法更改。' },
  'mint.terms': { en: 'By minting, you agree to the Ceres terms. DID NFTs are non-transferable by default.', 'zh-TW': '鑄造即表示你同意 Ceres 條款。DID NFT 預設不可轉移。' },
  'mint.backHome': { en: '← Back to Home', 'zh-TW': '← 返回首頁' },

  // AdminPage
  'admin.connectWallet': { en: 'Connect Your Wallet', 'zh-TW': '連接你的錢包' },
  'admin.connectDesc': { en: 'Connect your wallet to access the admin dashboard.', 'zh-TW': '連接你的錢包以訪問管理面板。' },
  'admin.accessDenied': { en: 'Access Denied', 'zh-TW': '訪問被拒絕' },
  'admin.notOwner': { en: 'You are not the contract owner. Only the owner of the CeresRegistry contract can access this page.', 'zh-TW': '你不是合約擁有者。只有 CeresRegistry 合約的擁有者才能訪問此頁面。' },
  'admin.title': { en: 'Admin Dashboard', 'zh-TW': '管理面板' },
  'admin.desc': { en: 'Manage CeresRegistry contract settings', 'zh-TW': '管理 CeresRegistry 合約設置' },
  'admin.mintFee': { en: 'Mint Fee', 'zh-TW': '鑄造費用' },
  'admin.status': { en: 'Status', 'zh-TW': '狀態' },
  'admin.enabled': { en: 'Enabled', 'zh-TW': '已啟用' },
  'admin.disabled': { en: 'Disabled', 'zh-TW': '已停用' },
  'admin.currentFee': { en: 'Current Fee', 'zh-TW': '當前費用' },
  'admin.setFee': { en: 'Set Fee Amount', 'zh-TW': '設置費用金額' },
  'admin.setFeeBtn': { en: 'Set Fee', 'zh-TW': '設置費用' },
  'admin.setting': { en: 'Setting...', 'zh-TW': '設置中...' },
  'admin.withdraw': { en: 'Withdraw', 'zh-TW': '提取' },
  'admin.contractBalance': { en: 'Contract Balance', 'zh-TW': '合約餘額' },
  'admin.withdrawAll': { en: 'Withdraw All', 'zh-TW': '全部提取' },
  'admin.withdrawing': { en: 'Withdrawing...', 'zh-TW': '提取中...' },
  'admin.noBalance': { en: 'No ETH available to withdraw', 'zh-TW': '沒有可提取的 ETH' },
  'admin.toggleFailed': { en: 'Toggle failed', 'zh-TW': '切換失敗' },
  'admin.setFeeFailed': { en: 'Set fee failed', 'zh-TW': '設置費用失敗' },
  'admin.withdrawFailed': { en: 'Withdraw failed', 'zh-TW': '提取失敗' },
  'admin.invalidFee': { en: 'Please enter a valid fee amount', 'zh-TW': '請輸入有效的費用金額' },
  'admin.noBalanceToWithdraw': { en: 'No balance to withdraw', 'zh-TW': '沒有餘額可提取' },

  // Levels
  'level.seed': { en: 'Seed', 'zh-TW': '種子' },
  'level.bronze': { en: 'Bronze', 'zh-TW': '青銅' },
  'level.silver': { en: 'Silver', 'zh-TW': '白銀' },
  'level.gold': { en: 'Gold', 'zh-TW': '黃金' },
  'level.crystal': { en: 'Crystal', 'zh-TW': '水晶' },
  'level.diamond': { en: 'Diamond', 'zh-TW': '鑽石' },

  // Graph
  'graph.globalTitle': { en: 'Global Network', 'zh-TW': '全球網絡' },
  'graph.networkTitle': { en: 'Network Graph', 'zh-TW': '網絡圖' },
  'graph.fullscreen': { en: '⛶ Fullscreen', 'zh-TW': '⛶ 全螢幕' },
  'graph.closeFullscreen': { en: '✕ Close', 'zh-TW': '✕ 關閉' },
  'graph.exitFullscreen': { en: '✕ Exit Fullscreen', 'zh-TW': '✕ 退出全螢幕' },
  'graph.stats': { en: '{dids} DIDs · {edges} edges', 'zh-TW': '{dids} 個 DID · {edges} 條連線' },
  'graph.noDids': { en: 'No DIDs yet — be the first to mint!', 'zh-TW': '暫無 DID — 成為第一個鑄造者！' },
  'graph.viewProfile': { en: 'View Profile →', 'zh-TW': '查看檔案 →' },
  'graph.close': { en: 'Close', 'zh-TW': '關閉' },
  'graph.invitedBy': { en: 'Invited by', 'zh-TW': '邀請人' },
  'graph.rootNode': { en: 'Root node', 'zh-TW': '根節點' },
  'graph.error': { en: 'Unable to render graph', 'zh-TW': '無法渲染圖表' },
  'graph.noConnections': { en: 'No connections yet', 'zh-TW': '暫無連接' },
  'graph.shareInvite': { en: 'Share your invite link', 'zh-TW': '分享你的邀請連結' },
  'graph.loading': { en: 'Loading...', 'zh-TW': '加載中...' },
  'graph.nodes': { en: '{count} node{plural}', 'zh-TW': '{count} 個節點' },

  // Navbar
  'nav.home': { en: 'Home', 'zh-TW': '首頁' },
  'nav.search': { en: 'Search', 'zh-TW': '搜索' },
  'nav.invite': { en: 'Invite', 'zh-TW': '邀請' },
  'nav.profile': { en: 'My Profile', 'zh-TW': '我的檔案' },
  'nav.explore': { en: 'Explore', 'zh-TW': '探索' },

  // ProfileCard
  'profileCard.viewFullProfile': { en: 'View Full Profile →', 'zh-TW': '查看完整檔案 →' },
  'profileCard.mintDate': { en: 'Minted', 'zh-TW': '鑄造日期' },

  // Common
  'common.loading': { en: 'Loading...', 'zh-TW': '加載中...' },
  'common.error': { en: 'Error', 'zh-TW': '錯誤' },
  'common.connect': { en: 'Connect Wallet', 'zh-TW': '連接錢包' },
  'common.disconnect': { en: 'Disconnect', 'zh-TW': '斷開連接' },
  'common.address': { en: 'Address', 'zh-TW': '地址' },
  'common.copyAddress': { en: 'Copy Address', 'zh-TW': '複製地址' },
  'common.copied': { en: '✓ Copied!', 'zh-TW': '✓ 已複製！' },
  'common.viewProfile': { en: 'View Profile', 'zh-TW': '查看檔案' },
  'common.switchAccount': { en: 'Switch Account', 'zh-TW': '切換帳戶' },
  'common.chooseWallet': { en: 'Choose your wallet to connect to Ceres on Sepolia.', 'zh-TW': '選擇你的錢包以連接到 Ceres（Sepolia）。' },
  'common.chooseNewAccount': { en: 'Choose a wallet and pick a new account.', 'zh-TW': '選擇錢包並挑選新帳戶。' },
  'common.detected': { en: 'Detected', 'zh-TW': '已檢測' },
  'common.noWallet': { en: 'No wallet detected', 'zh-TW': '未檢測到錢包' },
  'common.installWallet': { en: 'Please install MetaMask or OKX Wallet and refresh.', 'zh-TW': '請安裝 MetaMask 或 OKX 錢包後刷新。' },
  'common.agreeConnect': { en: 'By connecting, you agree to use Sepolia testnet.', 'zh-TW': '連接即表示你同意使用 Sepolia 測試網。' },
  'common.reloadHint': { en: 'Your browser will reload — wallet will show the account picker.', 'zh-TW': '瀏覽器將重新加載 — 錢包會顯示帳戶選擇器。' },
  'common.switchedTo': { en: 'Switched to {chain}', 'zh-TW': '已切換到 {chain}' },
  'common.requestCancelled': { en: 'Request cancelled', 'zh-TW': '請求已取消' },
  'common.switchFailed': { en: 'Failed to switch: {msg}', 'zh-TW': '切換失敗：{msg}' },
}

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
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
    (key: string, params?: Record<string, string | number>) => {
      let str = translations[key]?.[locale] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v))
        }
      }
      return str
    },
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
