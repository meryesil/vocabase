<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  { icon: '📖', title: 'Kelime Defteri', desc: 'Bilmediğin kelimeleri anında kaydet, örnek cümlelerle pekiştir.' },
  { icon: '🗂️', title: 'Özel Bölümler', desc: 'Bağlaçlar, fiiller, akademik terimler — kendi kategorilerini oluştur.' },
  { icon: '🎯', title: 'Akıllı Quiz', desc: 'Bilmediğin kelimelerden otomatik quiz, öğrenme seviyesi takibi.' },
  { icon: '🎓', title: 'Sınav Hedefi', desc: 'YÖKDİL, YDS, TOEFL — hedefin ne olursa olsun senin için.' },
]
</script>

<template>
  <div class="page landing">
    <section class="hero">
      <div class="container hero-content">
        <div class="badge">Akademik İngilizce Platformu</div>
        <h1>
          Kelimelerini kaydet,
          <span class="gradient-text">hedefine ulaş</span>
        </h1>
        <p class="hero-desc">
          VocaBase ile bilmediğin kelimeleri organize et, akıllı quizlerle pekiştir ve YÖKDİL, YDS, TOEFL, IELTS gibi tüm akademik sınavlara hazırlan.
          Kişisel kelime defterin, artık dijital, akıllı ve profesyonel.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" @click="router.push('/register')">
            Ücretsiz Başla
          </button>
          <button class="btn btn-ghost btn-lg" @click="router.push('/login')">Giriş Yap</button>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card glass-card">
            <span class="feature-icon">{{ f.icon }}</span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing {
  padding-bottom: 4rem;
}

.hero {
  padding: 6rem 0 4rem;
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.hero h1 {
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
}

.gradient-text {
  background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 560px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1rem;
}

.features {
  padding: 2rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.feature-card {
  padding: 2rem 1.5rem;
}

.feature-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.feature-card p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
