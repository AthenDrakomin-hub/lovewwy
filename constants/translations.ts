
export type Language = 'en' | 'zh' | 'jp' | 'kr';

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    nav: {
      home: 'Music',
      visuals: 'Video',

      treasure: 'Treasure Box',
      admin: 'ADMIN LOGIN',
      core: 'CORE DASH',
      subscribe: 'PREMIUM'
    },
    treasure: {
      title: 'The Treasure Box',
      desc: 'Premium directory of curated tools, resources, and hidden gems.',
      locked: 'Membership Required',
      unlockDesc: 'Subscribe to WYY AURA Pro to unlock our exclusive collection.',
      unlockBtn: 'Subscribe Now',
      planName: 'Aura Pro Membership',
      price: '$9.90',
      period: '/ month',
      features: [
        'Exclusive Tool Directory',
        'Private Resource Links',

        'No Ads & Early Access'
      ],
      categories: {
        tools: 'Tools',
        creative: 'Creative',
        dev: 'Dev Resources',
        other: 'Hidden Gems'
      }
    },
    hero: {
      tag: 'Aura Music Experience',
      cta: 'PLAY LATEST',
      catalogue: 'PLAYLIST',
      scroll: 'DISCOVER MORE'
    },
    visuals: {
      title: 'Video Archive',
      desc: 'Cinematic captures and motion experiments.'
    },
    beats: {
      title: 'Sonic Flows',
      desc: 'Curated tracks organized by category and style.'
    },

  },
  zh: {
    nav: {
      home: '音乐',
      visuals: '视频',

      treasure: '百宝箱',
      admin: '管理登录',
      core: '核心控制台',
      subscribe: '开通会员'
    },
    treasure: {
      title: '私藏百宝箱',
      desc: '精选工具、设计资源和互联网遗珠的会员专属导航。',
      locked: '会员专享内容',
      unlockDesc: '开通 WYY AURA Pro 会员，立即解锁全站私藏资源。',
      unlockBtn: '立即订阅',
      planName: 'Aura Pro 会员计划',
      price: '￥19.00',
      period: '/ 月',
      features: [
        '专属工具导航目录',
        '内部私藏资源链接',

        '无广告干扰 & 新品早鸟'
      ],
      categories: {
        tools: '工具',
        creative: '创意',
        dev: '开发者',
        other: '宝藏'
      }
    },
    hero: {
      tag: 'Aura 音乐体验',
      cta: '播放最新',
      catalogue: '内容目录',
      scroll: '向下探索更多'
    },
    visuals: {
      title: '视频档案',
      desc: '捕捉瞬间，探索数字领域的视觉实相。'
    },
    beats: {
      title: '索尼克流',
      desc: '按类别和风格组织的精选曲目。'
    },

  },
  jp: {
    nav: {
      home: '音楽',
      visuals: 'ビデオ',

      treasure: '宝箱',
      admin: '管理者ログイン',
      core: 'ダッシュボード',
      subscribe: '購読する'
    },
    treasure: {
      title: 'トレジャーボックス',
      desc: '厳選されたプレミアムディレクトリ。',
      locked: '会員限定',
      unlockDesc: 'Aura Proに登録して、すべてのリソースをアンロックしましょう。',
      unlockBtn: '今すぐ購読',
      planName: 'Aura Pro メンバーシップ',
      price: '¥980',
      period: '/ 月',
      features: [
        '限定ツールディレクトリ',
        'プライベートリソース',

        '広告なし & 早期アクセス'
      ],
      categories: {
        tools: 'ツール',
        creative: 'クリエイティブ',
        dev: '開発者',
        other: '宝物'
      }
    },
    hero: {
      tag: 'Aura 音楽体験',
      cta: '最新を再生',
      catalogue: 'プレイリスト',
      scroll: 'スクロールして発見'
    },
    visuals: {
      title: 'ビデオアーカイブ',
      desc: '映画のようなキャプチャとモーション実験。'
    },
    beats: {
      title: 'ソニック・フロウ',
      desc: 'カテゴリとスタイル別に整理されたプレイリスト。'
    },

  },
  kr: {
    nav: {
      home: '음악',
      visuals: '비디오',

      treasure: '보물 상자',
      admin: '관리자 로그인',
      core: '대시보드',
      subscribe: '구독하기'
    },
    treasure: {
      title: '보물 상자',
      desc: '프리미엄 전용 디렉토리.',
      locked: '멤버십 전용',
      unlockDesc: 'Aura Pro를 구독하고 특별한 컬렉션을 만나보세요.',
      unlockBtn: '지금 구독',
      planName: 'Aura Pro 멤버십',
      price: '₩9,900',
      period: '/ 월',
      features: [
        '전용 도구 디렉토리',
        '프라이빗 리소스 링크',

        '광고 제거 & 조기 체험'
      ],
      categories: {
        tools: '도구',
        creative: '크리에이티브',
        dev: '개발자',
        other: '기타'
      }
    },
    hero: {
      tag: 'Aura 음악 체험',
      cta: '최신 재생',
      catalogue: '플레이리스트',
      scroll: '스크롤하여 탐색'
    },
    visuals: {
      title: '비디오 아카이브',
      desc: '시네마틱 캡처와 모션 실험.'
    },
    beats: {
      title: '소닉 플로우',
      desc: '카테고리와 스타일별로 정리된 추천 트랙입니다.'
    },

  }
};
