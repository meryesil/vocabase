# VocaBase

Akademik İngilizce kelime defteri ve quiz platformu. YÖKDİL, YDS, TOEFL ve diğer sınavlara hazırlık için kişisel kelime yönetimi.

## Özellikler

- Kullanıcı kaydı ve girişi (JWT)
- Sınav hedefi seçimi (YÖKDİL, YDS, TOEFL, IELTS, KPSS)
- Özel bölümler oluşturma (Bağlaçlar, Fiiller, vb.)
- Kelime kaydetme (İngilizce, Türkçe, örnek cümle, notlar)
- Akıllı quiz modu (çoktan seçmeli, öğrenme seviyesi takibi)
- Modern, animasyonlu arayüz

## Geliştirme

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001

## Production (Sunucuda)

### 1. Ortam değişkenleri

```bash
cp .env.example .env
# .env dosyasını düzenle — JWT_SECRET mutlaka değiştir
```

### 2. Build ve çalıştır

```bash
npm install
npm run build
npm start
```

### Docker ile

```bash
JWT_SECRET=guclu-bir-sifre docker compose up -d
```

### PM2 ile (önerilen)

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name senin-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

SSL için Certbot kullanabilirsin: `certbot --nginx -d senin-domain.com`

## Teknolojiler

- **Frontend:** Vue 3, Pinia, Vue Router, Vite
- **Backend:** Express, SQLite (better-sqlite3), JWT, bcrypt
- **Deploy:** Docker, PM2, Nginx
