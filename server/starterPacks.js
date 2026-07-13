import { conjunctionsPack } from './starter_data/conjunctions.js'
import { fenWords } from './starter_data/yokdil_fen.js'
import { saglikWords } from './starter_data/yokdil_saglik.js'
import { saglikWords2 } from './starter_data/yokdil_saglik_part2.js'
import { sosyalWords } from './starter_data/yokdil_sosyal.js'
import { sosyalWords2 } from './starter_data/yokdil_sosyal_part2.js'
import { verbWords } from './starter_data/yds_verbs.js'
import { adjectiveWords } from './starter_data/yds_adjectives.js'
import { phrasalWords } from './starter_data/phrasal_verbs.js'

export const starterPacks = [
  conjunctionsPack,
  {
    id: 'yokdil_fen',
    name: 'YÖKDİL Fen Bilimleri En Çok Çıkan Kelimeler',
    description: 'Mühendislik, doğa bilimleri, fizik, kimya ve biyoloji metinlerinde geçen anahtar kelimeler (200 Kelime)',
    icon: '🔬',
    color: '#3b82f6',
    words: fenWords.slice(0, 200)
  },
  {
    id: 'yokdil_saglik',
    name: 'YÖKDİL Sağlık Bilimleri En Çok Çıkan Kelimeler',
    description: 'Tıp, eczacılık, biyokimya, anatomi, klinik ve hemşirelik metinlerinde geçen temel kelimeler (200 Kelime)',
    icon: '🩺',
    color: '#10b981',
    words: [...saglikWords, ...saglikWords2].slice(0, 200)
  },
  {
    id: 'yokdil_sosyal',
    name: 'YÖKDİL Sosyal Bilimler En Çok Çıkan Kelimeler',
    description: 'Tarih, sosyoloji, psikoloji, ekonomi, arkeoloji ve hukuk metinlerinde geçen anahtar kelimeler (200 Kelime)',
    icon: '🏛️',
    color: '#f59e0b',
    words: [...sosyalWords, ...sosyalWords2].slice(0, 200)
  },
  {
    id: 'yds_verbs',
    name: 'YDS & YÖKDİL En Çok Çıkan Akademik Fiiller',
    description: 'Sınavlarda okuduğunu anlama (Cloze Test, paragraf, cümle tamamlama) için can damarı olan 200 akademik fiil',
    icon: '⚡',
    color: '#ec4899',
    words: verbWords.slice(0, 200)
  },
  {
    id: 'yds_adjectives',
    name: 'YDS & YÖKDİL En Çok Çıkan Akademik Sıfat & Zarflar',
    description: 'Sınav metinlerindeki tonu ve detayları yakalamak için hayati öneme sahip 200 sıfat ve zarf hazinesi',
    icon: '💎',
    color: '#8b5cf6',
    words: adjectiveWords.slice(0, 200)
  },
  {
    id: 'phrasal_verbs',
    name: 'YÖKDİL & YDS Hayati Phrasal Verbs & Edat Öbekleri',
    description: 'Her sınavın ilk 15 kelime ve dilbilgisi sorusunda kesinlikle sorulan en kritik 200 phrasal verb ve edat öbeği',
    icon: '🔗',
    color: '#06b6d4',
    words: phrasalWords.slice(0, 200)
  }
]
