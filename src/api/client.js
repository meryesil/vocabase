function getApiBase() {
  const envUrl = import.meta.env.VITE_API_URL

  // Eğer tarayıcı ortamındaysak
  if (typeof window !== 'undefined') {
    // Eğer port 5173 (Vite local dev sunucusu) üzerinden çalışıyorsak (hosts ile domain girilmiş olsa bile)
    // Vite proxy'sini veya localhost:3001 backend adresini kullanmalıyız
    if (window.location.port === '5173' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return envUrl || '/api'
    }

    // Gerçek canlı sunucuda (Nginx/Express projesinde 80/443 vb. portlarda) ise daima relative /api kullanılır
    return '/api'
  }

  return envUrl || '/api'
}

const API_BASE = getApiBase()

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('vocabase_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })
  } catch (err) {
    throw new Error('Sunucuya bağlantı kurulamadı veya ağ hatası oluştu. Lütfen internet bağlantınızı ve sunucunuzun (Backend API) aktif olduğunu kontrol edin.')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 504 || res.status === 502 || res.status === 500) {
      throw new Error(
        data.error ||
          'Sunucuda geçici bir problem oluştu (Hata kodu: ' + res.status + '). Lütfen birkaç dakika sonra tekrar deneyin.'
      )
    }
    throw new Error(data.error || 'İşlem gerçekleştirilemedi. Lütfen bilgilerinizi kontrol edin.')
  }

  return data
}
