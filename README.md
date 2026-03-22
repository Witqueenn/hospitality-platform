# Hospitality Experience Orchestration Platform

> **Mimari Versiyon:** 2.0
> **Pattern:** Domain-Driven Modular Monolith
> **Stack:** TypeScript · Next.js 14 · PostgreSQL · Prisma · tRPC · Redis · BullMQ

---

## İçindekiler

1. [Platform Özeti](#1-platform-özeti)
2. [Monorepo Yapısı](#2-monorepo-yapısı)
3. [Teknoloji Yığını](#3-teknoloji-yığını)
4. [Yüksek Seviye Mimari](#4-yüksek-seviye-mimari)
5. [Frontend Mimarisi](#5-frontend-mimarisi)
6. [API Katmanı — tRPC](#6-api-katmanı--trpc)
7. [Ajanlar Sistemi](#7-ajanlar-sistemi)
8. [Kuyruk ve Arka Plan İşleri](#8-kuyruk-ve-arka-plan-işleri)
9. [Veritabanı](#9-veritabanı)
10. [AI Concierge — Aria](#10-ai-concierge--aria)
11. [Altyapı ve DevOps](#11-altyapı-ve-devops)
12. [Çevre Değişkenleri](#12-çevre-değişkenleri)
13. [Geliştirme Ortamı](#13-geliştirme-ortamı)
14. [Mimari Prensipler](#14-mimari-prensipler)

---

## 1. Platform Özeti

Dört ana operasyonel sistemi kapsayan **çok kiracılı (multi-tenant) otelcilik orkestrasyon platformu**:

| Sistem              | Kapsam                                                                    |
| ------------------- | ------------------------------------------------------------------------- |
| **Stay OS**         | Konaklama — odalar, check-in/out, şikayetler, recovery                    |
| **Event OS**        | Toplantılar, konferanslar, düğünler, BEO yönetimi                         |
| **Experience OS**   | Yeme-içme, gece hayatı, deneyim kürasyon                                  |
| **Agentic Manager** | Merkezi AI orkestrasyonu — intent routing, ajan koordinasyonu, eskalasyon |

### Kullanıcı Rolleri

| Rol              | Açıklama                                                       |
| ---------------- | -------------------------------------------------------------- |
| **Guest**        | Oda/etkinlik/yemek rezervasyonu, sorun bildirme, recovery alma |
| **Hotel Staff**  | Envanter, etkinlik, şikayet ve operasyon yönetimi              |
| **Platform Ops** | Kalite izleme, eskalasyon, otel doğrulama                      |
| **Super Admin**  | Kiracı, politika, fiyatlandırma ve ajan davranışı kontrolü     |

---

## 2. Monorepo Yapısı

**Turborepo + pnpm workspaces** ile yönetilen monorepo:

```
/
├── apps/
│   └── web/                    ← Next.js 14 uygulaması (tüm portallar)
│
├── packages/
│   ├── db/                     ← Prisma şeması, client, migration, seed
│   ├── api/                    ← tRPC router'ları ve procedure'ları
│   ├── agents/                 ← Agentic Manager + 12 özelleşmiş ajan
│   ├── queue/                  ← BullMQ worker'ları ve job tanımları
│   ├── shared/                 ← Tipler, sabitler, utility'ler, Zod validatörleri
│   └── email/                  ← Email şablonları ve gönderici
│
├── tooling/
│   ├── eslint-config/
│   ├── tsconfig/
│   └── prettier-config/
│
├── docker-compose.yml          ← Lokal geliştirme (PG + Redis + MailHog)
├── docker-compose.prod.yml     ← Production (Coolify)
├── turbo.json                  ← Turborepo task pipeline
└── pnpm-workspace.yaml
```

---

## 3. Teknoloji Yığını

| Katman               | Teknoloji                           | Kullanım Amacı                             |
| -------------------- | ----------------------------------- | ------------------------------------------ |
| **Runtime**          | Node.js 20+                         | TypeScript ekosistemi                      |
| **Framework**        | Next.js 14 (App Router)             | SSR, API routes, middleware, layout'lar    |
| **API**              | tRPC v11                            | Uçtan uca tip güvenliği, codegen yok       |
| **ORM**              | Prisma 5                            | Tip-güvenli sorgular, migration'lar        |
| **Veritabanı**       | PostgreSQL 16                       | JSONB, row-level security, olgun ekosistem |
| **Cache / Queue**    | Redis 7 + BullMQ                    | Job queue'ları, cache, pub/sub             |
| **Auth**             | NextAuth.js v5 + özel RBAC          | Multi-provider, session yönetimi           |
| **Dosya Depolama**   | MinIO (S3-uyumlu)                   | Pre-signed upload/download                 |
| **Email**            | MailHog (dev) → Resend (prod)       | Transactional email'ler                    |
| **Gerçek Zamanlı**   | Server-Sent Events (SSE)            | Canlı bildirimler, case güncellemeleri     |
| **UI**               | React 18 + Tailwind CSS + shadcn/ui | Hızlı, tutarlı, erişilebilir UI            |
| **State**            | TanStack Query (tRPC) + Zustand     | Server state + yerel UI state              |
| **Validasyon**       | Zod                                 | Client-server ortak şema                   |
| **Test**             | Vitest + Playwright                 | Unit/integration + E2E                     |
| **Monorepo**         | Turborepo                           | Build cache, task orkestrasyonu            |
| **AI / LLM**         | Anthropic Claude / OpenRouter       | 12 ajan için LLM backend                   |
| **AI Observability** | Langfuse                            | Her ajan kararını trace etme               |
| **Arama**            | Algolia                             | Otel, oda, deneyim arama                   |
| **Bildirim**         | Novu                                | Email + SMS + push + in-app                |
| **Analytics**        | Umami (self-hosted)                 | Web analytics                              |
| **Monitoring**       | Sentry + New Relic                  | Hata izleme + APM                          |
| **Harita**           | Mapbox                              | Otel konum haritaları                      |

---

## 4. Yüksek Seviye Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │ Guest Portal│  │ Hotel Portal│  │ Admin Dashboard  │    │
│  │  (Next.js)  │  │  (Next.js)  │  │   (Next.js)      │    │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘    │
│         └───────────┬────┴─────────────────-┘              │
│                     ▼                                       │
│           ┌─────────────────┐                              │
│           │   API Gateway   │  ← tRPC + NextAuth middleware │
│           │   (Next.js)     │                              │
│           └────────┬────────┘                              │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────────┐
│                    ▼     APPLICATION LAYER                  │
│         ┌──────────────────────┐                           │
│         │   Agentic Manager    │ ← Intent sınıflandırma,   │
│         │   (Orchestrator)     │   ajan routing, eskalasyon │
│         └─┬──┬──┬──┬──┬──┬────┘                           │
│           │  │  │  │  │  │                                 │
│     ┌─────┘  │  │  │  │  └──────┐                         │
│     ▼        ▼  ▼  ▼  ▼        ▼                          │
│  [SSA]  [RCA] [BIA] [MMA] [EMA] [...]  ← 12 Özel Ajan     │
│     └────────────┬──────────────┘                         │
│                  ▼                                         │
│  ┌───────────────────────────────────────────────────┐    │
│  │               DOMAIN SERVICE LAYER                │    │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────────────┐   │    │
│  │  │  Stay OS │ │ Event OS │ │  Experience OS   │   │    │
│  │  └────┬─────┘ └────┬─────┘ └────────┬────────┘   │    │
│  └───────┼────────────┼────────────────┼────────────┘    │
│          ▼            ▼                ▼                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │            INFRASTRUCTURE LAYER                   │    │
│  │  ┌────────┐ ┌───────┐ ┌────────┐ ┌────────────┐  │    │
│  │  │ Prisma │ │ Redis │ │ BullMQ │ │ MinIO / FS │  │    │
│  │  │  (PG)  │ │ Cache │ │ Queues │ │  Storage   │  │    │
│  │  └────────┘ └───────┘ └────────┘ └────────────┘  │    │
│  └───────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### İstek Akışı Örneği (Misafir Sorun Bildirme)

```
1.  Misafir UI formu üzerinden sorun gönderir
2.  Next.js API route → tRPC mutation: supportCase.create
3.  Middleware: auth, tenant scope, rate limit doğrular
4.  Domain service SupportCase kaydı oluşturur (status: OPEN)
5.  Domain event tetiklenir: SUPPORT_CASE_CREATED
6.  Agentic Manager event'i alır
7.  Intent sınıflandırır: "in-stay complaint — oda temizliği"
8.  Manager StaySupportAgent'ı çağırır
9.  Ajan analiz eder: şiddet, misafir geçmişi, otel politikaları
10. Ajan öneri üretir: "Hemen oda yeniden temizleme + amenity kredisi"
11. Tazminat eşiği aşılırsa → insan onay kuyruğuna yönlendir
12. Otel personeline SSE push bildirimi gönderilir
13. Personel onaylar/değiştirir → case güncellenir
14. Misafir çözümden bilgilendirilir (email + in-app)
```

---

## 5. Frontend Mimarisi

### `apps/web/src/` Yapısı

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/              ← Giriş sayfası
│   │   └── register/           ← Kayıt sayfası
│   ├── (guest)/                ← Misafir portalı layout grubu
│   ├── hotel/
│   │   └── (hotel)/            ← Otel yönetim portalı
│   ├── admin/
│   │   └── (admin)/            ← Süper admin dashboard
│   ├── api/
│   │   ├── ai-concierge/       ← Aria AI streaming endpoint
│   │   ├── sse/                ← Server-Sent Events endpoint
│   │   └── trpc/               ← tRPC HTTP handler
│   ├── layout.tsx              ← Root layout
│   ├── page.tsx                ← Ana sayfa
│   └── providers.tsx           ← TanStack Query, auth provider'ları
│
├── components/
│   ├── ai-concierge/           ← Aria floating chat panel
│   │   └── AiConcierge.tsx
│   ├── layouts/
│   │   └── HotelLayout.tsx     ← Otel portal layout
│   ├── magicui/                ← Animasyonlu UI bileşenleri
│   └── ui/                     ← shadcn/ui base bileşenleri
│
├── lib/                        ← Client-side utility'ler
├── stores/                     ← Zustand store'ları (authStore vb.)
├── styles/                     ← Global CSS
└── instrumentation.ts          ← OpenTelemetry / Sentry başlatma
```

---

## 6. API Katmanı — tRPC

`packages/api/src/routers/` altında tanımlı tüm router'lar:

| Router                   | Sorumluluk                                |
| ------------------------ | ----------------------------------------- |
| `auth.router.ts`         | Giriş, çıkış, session yönetimi            |
| `booking.router.ts`      | Rezervasyon CRUD, uygunluk sorgulama      |
| `hotel.router.ts`        | Otel profili, onay, envanter              |
| `roomType.router.ts`     | Oda tipleri ve fiyatlandırma              |
| `venue.router.ts`        | Etkinlik mekanları, kapasite              |
| `eventRequest.router.ts` | BEO talepleri, etkinlik planlaması        |
| `supportCase.router.ts`  | Şikayet yönetimi, eskalasyon              |
| `review.router.ts`       | Misafir değerlendirmeleri                 |
| `notification.router.ts` | Bildirim tercihleri, geçmişi              |
| `tenant.router.ts`       | Multi-tenant yönetimi                     |
| `analytics.router.ts`    | Operasyonel metrikler, dashboard verileri |

Tüm router'lar `packages/api/src/root.ts` içinde birleştirilerek `appRouter` oluşturulur. Middleware: **auth doğrulama + tenant scope zorunluluğu**.

---

## 7. Ajanlar Sistemi

`packages/agents/src/` içinde merkezi orkestrasyonlu 12 özelleşmiş ajan:

```
packages/agents/src/
├── orchestrator.ts       ← Merkezi Agentic Manager
├── registry.ts           ← Ajan kaydı ve keşfi
├── contextBuilder.ts     ← Ajan için zenginleştirilmiş context hazırlama
├── pipelines.ts          ← Çok adımlı ajan pipeline'ları
├── llm.ts                ← LLM abstraction (Anthropic / OpenRouter)
└── agents/
    ├── staySupport.agent.ts         ← Konaklama şikayet analizi
    ├── recoveryCompensation.agent.ts← Tazminat hesaplama ve onay
    ├── preStayConcierge.agent.ts    ← Varış öncesi kişiselleştirme
    ├── bookingIntegrity.agent.ts    ← Rezervasyon tutarlılık kontrolü
    ├── truthTransparency.agent.ts   ← Listeleme doğrulama
    ├── insightHotelSuccess.agent.ts ← Operasyonel insight üretimi
    ├── matchmaking.agent.ts         ← Misafir-oda eşleştirme
    ├── eventMatch.agent.ts          ← Etkinlik talep eşleştirme
    ├── venueCapacity.agent.ts       ← Mekan kapasite optimizasyonu
    ├── fbPlanning.agent.ts          ← F&B planlama
    ├── beoRunOfShow.agent.ts        ← BEO run-of-show oluşturma
    └── nightlifeExperience.agent.ts ← Gece hayatı deneyim kürasyon
```

### Ajan Karar Akışı

```
Intent gelir → Orchestrator sınıflandırır → İlgili ajan seçilir
    → Context Builder zenginleştirir → LLM'e gönderilir
    → Öneri + reasoning döner → Eşik kontrolü:
        - Düşük tazminat: Otomatik uygula
        - Yüksek tazminat (>₺250): Human-in-the-loop kuyruğa ekle
    → Langfuse'a trace kaydedilir
```

---

## 8. Kuyruk ve Arka Plan İşleri

`packages/queue/src/` — Redis üzerinde **BullMQ** ile yönetilen iş kuyruğu:

| Worker                  | İşlev                                |
| ----------------------- | ------------------------------------ |
| `agentWorker.ts`        | Asenkron ajan görevlerini işleme     |
| `notificationWorker.ts` | Email, SMS, push bildirim gönderimi  |
| `slaCheckWorker.ts`     | SLA süre aşımı kontrol ve eskalasyon |

```
SLA hedefleri:
  CRITICAL → 15 dakika
  HIGH     → 30 dakika
  MEDIUM   → 2 saat
  LOW      → 24 saat
```

---

## 9. Veritabanı

`packages/db/prisma/schema.prisma` — **PostgreSQL 16** + **Prisma 5**

### Temel Prensipler

- **Her kayıt `tenantId` içerir** — çapraz kiracı veri sızıntısı yok
- **Para birimleri tamsayı sent olarak saklanır** — float yok
- **Tüm timestamp'ler UTC** — görüntüleme timezone'u client-side
- **PII alanları AES-256-GCM ile şifreli**
- **Domain event'ler immutable log olarak saklanır**

### Önemli Komutlar

```bash
pnpm db:generate    # Prisma client oluştur
pnpm db:migrate     # Migration'ları uygula
pnpm db:seed        # Seed verisi ekle
```

---

## 10. AI Concierge — Aria

`apps/web/src/components/ai-concierge/AiConcierge.tsx`

Sağ altta floating panel olarak açılan AI asistan. Hotel operasyon portalına entegre.

### Özellikler

- **Streaming yanıtlar** — `/api/ai-concierge` endpoint'i üzerinden SSE
- **OpenUI Lang renderer** — Yanıtlarda `\`\`\`openui` bloklarını parse ederek bileşen render eder
- **Yerleşik bileşenler:**
  - `MetricCard` — KPI metrikleri (doluluk, gelir, vb.)
  - `BookingCard` — Rezervasyon detayları
  - `EventCard` — BEO durumu ile etkinlik bilgileri
  - `InsightAlert` — Kritik/uyarı/info seviyeli uyarılar
  - `SupportCaseCard` — Şikayet kartları
  - `DataTable` — Tablo verileri
  - `ActionList` — Öncelikli aksiyon listesi
- **Sohbet geçmişi** — Tüm konuşma context olarak gönderilir
- **Hızlı eylemler** — Önceden tanımlı sorgu kısayolları
- **Abort kontrolü** — Streaming yanıtlar durdurulabilir

---

## 11. Altyapı ve DevOps

### Yerel Geliştirme (`docker-compose.yml`)

| Servis        | Port      | Açıklama               |
| ------------- | --------- | ---------------------- |
| PostgreSQL 16 | 5432      | Ana veritabanı         |
| Redis 7       | 6379      | Cache + queue          |
| MailHog       | 1025/8025 | Email test (SMTP + UI) |

### Production (`docker-compose.prod.yml` — Coolify)

| Servis      | Açıklama                      |
| ----------- | ----------------------------- |
| Next.js App | Ana uygulama                  |
| PostgreSQL  | Yönetilen veritabanı          |
| Redis       | Yönetilen cache/queue         |
| MinIO       | Self-hosted S3 dosya depolama |
| Umami       | Self-hosted web analytics     |

### CI/CD (`.github/workflows/`)

- Lint, typecheck, test pipeline
- Husky pre-commit: lint-staged, commitlint
- Conventional Commits zorunlu

### Monitoring Yığını

| Araç      | Amaç                                  |
| --------- | ------------------------------------- |
| Sentry    | Hata izleme (5,000 hata/ay ücretsiz)  |
| New Relic | APM (100GB/ay ücretsiz)               |
| Langfuse  | LLM trace ve ajan kararları           |
| Umami     | Web analytics (self-hosted, sınırsız) |

---

## 12. Çevre Değişkenleri

`.env.example` dosyasından tam liste — temel kategoriler:

| Kategori               | Değişken Örnekleri                                                           |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Veritabanı**         | `DATABASE_URL`, `POSTGRES_*`                                                 |
| **Redis**              | `REDIS_URL`, `REDIS_PASSWORD`                                                |
| **Auth**               | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ENCRYPTION_KEY`                          |
| **Email**              | `RESEND_API_KEY`, `SMTP_*`                                                   |
| **Dosya**              | `MINIO_*`, `UPLOAD_DIR`                                                      |
| **AI (Birincil)**      | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`                                       |
| **AI (Yedek)**         | `OPENROUTER_API_KEY`, `AGENT_DEFAULT_MODEL`                                  |
| **Gözlemlenebilirlik** | `LANGFUSE_*`                                                                 |
| **Bildirim**           | `NOVU_API_KEY`                                                               |
| **Arama**              | `ALGOLIA_*`                                                                  |
| **Analytics**          | `NEXT_PUBLIC_UMAMI_*`                                                        |
| **Monitoring**         | `NEXT_PUBLIC_SENTRY_DSN`, `NEW_RELIC_*`                                      |
| **Harita**             | `NEXT_PUBLIC_MAPBOX_TOKEN`                                                   |
| **Ajan Yapılandırma**  | `AGENT_CONFIDENCE_THRESHOLD`, `COMPENSATION_AUTO_APPROVE_MAX_CENTS`, `SLA_*` |

---

## 13. Geliştirme Ortamı

### Gereksinimler

- Node.js >= 20
- pnpm >= 8
- Docker (PostgreSQL + Redis + MailHog için)

### Kurulum

```bash
# Bağımlılıkları yükle
pnpm install

# Altyapı servislerini başlat
docker-compose up -d

# Env dosyasını hazırla
cp .env.example .env
# .env içinde gerekli değerleri doldur

# Veritabanını hazırla
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Geliştirme sunucusunu başlat
pnpm dev
```

### Kullanışlı Komutlar

```bash
pnpm build          # Tüm package'ları build et
pnpm test           # Tüm testleri çalıştır
pnpm lint           # ESLint
pnpm typecheck      # TypeScript kontrol
pnpm format         # Prettier format
pnpm analyze        # Proje analiz scripti
pnpm check:secrets  # Gizli bilgi sızıntısı kontrolü
pnpm check:deps     # Bağımlılık kontrolü
```

---

## 14. Mimari Prensipler

| Kod | Prensip                     | Açıklama                                                  |
| --- | --------------------------- | --------------------------------------------------------- |
| P1  | **Domain İzolasyonu**       | Her bounded context kendi verisine sahip                  |
| P2  | **Tenant İzolasyonu**       | Tüm sorgular `tenant_id` ile scope'lanır                  |
| P3  | **Her Şeyi Audit Et**       | Tüm ajan kararları ve tazminatlar immutable log           |
| P4  | **Açıklanabilirlik**        | Her ajan önerisi insan-okunabilir gerekçe içerir          |
| P5  | **Idempotent İşlemler**     | Tüm state mutation'ları güvenli şekilde tekrar edilebilir |
| P6  | **Event-Driven**            | Domain event'leri bounded context'leri bağlar             |
| P7  | **Schema-First API**        | tRPC router'lar kontratı tanımlar                         |
| P8  | **Progressive Enhancement** | MVP önce, yeniden yazmadan genişlet                       |

### Kritik Kısıtlamalar

- Para birimleri **integer sent** (float asla)
- Timestamp'ler **UTC** (display timezone client-side)
- PII alanlar **AES-256-GCM** şifreli
- Bir ajan kendi finansal önerisini **onaylayamaz** (human-in-the-loop zorunlu)
- Kullanıcı-yüzü endpoint'ler max **3 saniye** yanıt süresi
- Dosya upload'lar **pre-signed URL** üzerinden (direkt server upload yok)
