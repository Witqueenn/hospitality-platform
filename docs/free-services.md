# Free Services Stack

Kaynak: [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev)

**Deployment stratejisi: Coolify + Hetzner VPS (~€4/ay)**
PostgreSQL, Redis ve storage self-hosted. Geri kalanlar ücretsiz dış servis.

---

## Servis Haritası

| Katman          | Servis                               | Nasıl                     | Env Var                        |
| --------------- | ------------------------------------ | ------------------------- | ------------------------------ |
| **PostgreSQL**  | Self-hosted (Coolify)                | `docker-compose.prod.yml` | `DATABASE_URL`                 |
| **Redis**       | Self-hosted (Coolify)                | `docker-compose.prod.yml` | `REDIS_URL`                    |
| **Storage**     | MinIO self-hosted (Coolify)          | `docker-compose.prod.yml` | `MINIO_*`                      |
| **Deployment**  | [Coolify](https://coolify.io)        | Hetzner VPS üzerinde      | Dashboard                      |
| **Email**       | [Resend](https://resend.com)         | 3.000 email/ay ücretsiz   | `RESEND_API_KEY`               |
| **LLM API**     | [OpenRouter](https://openrouter.ai)  | DeepSeek/Llama ücretsiz   | `OPENROUTER_API_KEY`           |
| **LLM İzleme**  | [Langfuse](https://langfuse.com)     | 50K gözlem/ay             | `LANGFUSE_*`                   |
| **Bildirimler** | [Novu](https://novu.co)              | 30.000 event/ay           | `NOVU_API_KEY`                 |
| **Arama**       | [Algolia](https://algolia.com)       | 1M dok, 10K sorgu/ay      | `ALGOLIA_*`                    |
| **Analytics**   | Umami self-hosted (Coolify)          | Sınırsız                  | `NEXT_PUBLIC_UMAMI_WEBSITE_ID` |
| **Hata İzleme** | [Sentry](https://sentry.io)          | 5.000 hata/ay             | `NEXT_PUBLIC_SENTRY_DSN`       |
| **APM**         | [New Relic](https://newrelic.com)    | 100GB/ay                  | `NEW_RELIC_LICENSE_KEY`        |
| **Harita**      | [Mapbox](https://mapbox.com)         | 50.000 yükleme/ay         | `NEXT_PUBLIC_MAPBOX_TOKEN`     |
| **CDN + DNS**   | [Cloudflare](https://cloudflare.com) | Sınırsız                  | Dashboard                      |
| **CI/CD**       | GitHub Actions                       | Dahili                    | `.github/workflows/`           |

---

## Kurulum Sırası

### 1. Sunucu & Coolify

1. **Hetzner** → CX22 (€4/ay, 2vCPU, 4GB RAM, Ubuntu 22.04) oluştur
2. **Coolify** kurulumu:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. `http://your-server-ip:8000` → Coolify dashboard
4. **Cloudflare** → domain ekle, A kaydını sunucu IP'sine yönlendir

### 2. Coolify'da Servisler

5. Coolify → **New Resource → Docker Compose** → `docker-compose.prod.yml` seç
6. Environment variables'ları Coolify dashboard'dan gir (secrets olarak)
7. **Domain** ayarla: `app.yourdomain.com` → port 3000
8. MinIO Console: `minio.yourdomain.com` → port 9001

### 3. Dış Servisler

9. **Resend** → domain doğrula, `RESEND_API_KEY` al
10. **Algolia** → üç index oluştur: `hotels`, `rooms`, `experiences`
11. **Novu** → uygulama oluştur, notification template'leri ayarla
12. **OpenRouter** → API key al
13. **Langfuse** → proje oluştur, key al
14. **Sentry** → Next.js projesi oluştur, DSN al
15. **Umami** → `analytics.yourdomain.com` Coolify'da ayakta, dashboard'dan Website ekle → ID kopyala
16. **Mapbox** → token oluştur (domain kısıtlaması ekle)

---

## Ölçek Sınırları

Ücretsiz katmanlar şu kapasiteye yeterlidir:

| Metrik        | Ücretsiz Limit        | ~Yeterli Kapasite         |
| ------------- | --------------------- | ------------------------- |
| Email         | 3.000/ay              | ~100 aktif rezervasyon/ay |
| Bildirimler   | 30.000/ay             | ~1.000 aktif misafir/ay   |
| LLM çağrıları | Rate-limited          | Geliştirme + küçük prod   |
| Arama sorgusu | 10.000/ay             | ~300 arama/gün            |
| Analytics     | 1M event/ay           | ~30 aktif kullanıcı/gün   |
| Storage       | 25 Cloudinary kredisi | ~2.000 otel fotoğrafı     |

Ücretli katmana geçiş gerektiğinde değiştirilecek env var zaten hazır.

---

## Algolia Index Şeması

```typescript
// hotels index
{
  objectID: string        // hotel.id
  name: string
  city: string
  country: string
  starRating: number
  amenities: string[]
  priceFrom: number       // cents
  tenantId: string
}

// rooms index
{
  objectID: string        // room.id
  hotelId: string
  type: string            // SINGLE | DOUBLE | SUITE | ...
  pricePerNight: number   // cents
  maxOccupancy: number
  amenities: string[]
}

// experiences index
{
  objectID: string        // experience.id
  hotelId: string
  category: string        // DINING | NIGHTLIFE | SPA | TOUR | ...
  name: string
  price: number           // cents
}
```

---

## Novu Notification Templates

Platform şu kanalları kullanır:

| Template               | Kanal          | Tetikleyici           |
| ---------------------- | -------------- | --------------------- |
| `booking-confirmed`    | email + in-app | Rezervasyon onayı     |
| `booking-cancelled`    | email + in-app | İptal                 |
| `complaint-received`   | email + in-app | Şikayet açıldı        |
| `complaint-resolved`   | email + in-app | Şikayet çözüldü       |
| `compensation-offered` | email + in-app | Agent taziyat önerdi  |
| `staff-escalation`     | in-app + push  | Human-in-loop gerekli |
| `event-reminder`       | email + push   | Etkinlik -24h         |
| `check-in-reminder`    | email + push   | Check-in -2h          |

---

## Langfuse Trace Yapısı

Her agent kararı şu şekilde izlenir:

```
Trace: agent-decision
  ├── Input: {intent, context, tenantId, guestId}
  ├── Span: intent-classification
  ├── Span: agent-routing
  ├── Span: {agent-name}-execution
  │     ├── LLM call (model, tokens, latency)
  │     └── Output: {recommendation, confidence, reasoning}
  └── Output: {decision, requiresHumanApproval, auditLogId}
```
