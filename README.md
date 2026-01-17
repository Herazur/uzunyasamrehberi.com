# 🏥 Sağlık Rehberi - SEO Optimizasyonlu Türkçe Sağlık Blogu

Türkiye'nin en güvenilir sağlık bilgi platformu. %100 SEO optimizasyonlu, modern ve mobil uyumlu sağlık blogu.

## 📋 Proje Özeti

Bu proje, sağlık alanında içerik paylaşmak için geliştirilmiş, SEO açısından tamamen optimize edilmiş bir Türkçe blog platformudur.

## ✅ Tamamlanan Özellikler

### 🔍 SEO Optimizasyonu (%100)

#### Meta Etiketleri
- ✅ Title ve Description meta etiketleri
- ✅ Keywords meta etiketi
- ✅ Robots meta direktifleri
- ✅ Canonical URL'ler
- ✅ Hreflang etiketleri (Türkçe)
- ✅ Viewport ve mobile-friendly meta etiketleri

#### Open Graph (Facebook, LinkedIn)
- ✅ og:type, og:title, og:description
- ✅ og:url, og:image (1200x630)
- ✅ og:locale (tr_TR)
- ✅ article:published_time, article:modified_time
- ✅ article:author, article:section, article:tag

#### Twitter Cards
- ✅ twitter:card (summary_large_image)
- ✅ twitter:title, twitter:description
- ✅ twitter:image, twitter:image:alt
- ✅ twitter:site, twitter:creator

#### Schema.org Yapılandırılmış Veri
- ✅ WebSite schema (site çapında arama desteği)
- ✅ Organization schema
- ✅ MedicalWebPage schema
- ✅ Article schema (makaleler için)
- ✅ BreadcrumbList schema
- ✅ FAQPage schema (otomatik oluşturma)
- ✅ Person schema (yazarlar için)

#### Teknik SEO
- ✅ robots.txt (arama motoru yönergeleri)
- ✅ sitemap.xml (site haritası)
- ✅ Semantic HTML5 yapısı
- ✅ SEO dostu URL yapısı (slug)
- ✅ Breadcrumb navigasyonu
- ✅ İç bağlantı yapısı

### 🎨 Tasarım ve Kullanıcı Deneyimi

- ✅ Modern ve profesyonel tasarım
- ✅ %100 mobil uyumlu (responsive)
- ✅ Hızlı yüklenen sayfa yapısı
- ✅ Koyu/açık tema desteği hazır
- ✅ Erişilebilirlik (WCAG 2.1 uyumlu)
- ✅ Print styles

### 📱 PWA Desteği

- ✅ manifest.json
- ✅ App ikonu yapılandırması
- ✅ Offline ready altyapı

### ♿ Erişilebilirlik

- ✅ Skip link (içeriğe atla)
- ✅ ARIA etiketleri
- ✅ Keyboard navigation
- ✅ Screen reader uyumu
- ✅ Focus states
- ✅ Alt text'ler
- ✅ Reduced motion desteği

## 📁 Dosya Yapısı

```
/
├── index.html              # Ana sayfa
├── makale.html             # Makale detay sayfası
├── robots.txt              # Arama motoru yönergeleri
├── sitemap.xml             # Site haritası
├── manifest.json           # PWA manifest
├── css/
│   └── style.css           # Ana stil dosyası
├── js/
│   ├── main.js             # Ana JavaScript
│   └── article.js          # Makale sayfası JS
└── README.md               # Bu dosya
```

## 🔗 Sayfa URL'leri

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` veya `/index.html` | Blog ana sayfası |
| Makale | `/makale.html?id={id}&slug={slug}` | Makale detay sayfası |
| Kategori | `/kategori/{slug}` | Kategori sayfası |
| Etiket | `/etiket/{slug}` | Etiket sayfası |
| Yazar | `/yazar/{slug}` | Yazar profili |
| Arama | `/arama?q={query}` | Arama sonuçları |

## 📊 Veri Modelleri

### Articles (Makaleler)
```javascript
{
    id: "text",              // Benzersiz kimlik
    title: "text",           // Başlık (SEO)
    slug: "text",            // URL slug
    excerpt: "text",         // Özet (meta description)
    content: "rich_text",    // HTML içerik
    category: "text",        // Kategori
    tags: "array",           // Etiketler
    image: "text",           // Öne çıkan görsel URL
    image_caption: "text",   // Görsel alt yazısı
    author: "text",          // Yazar adı
    author_title: "text",    // Yazar unvanı
    author_image: "text",    // Yazar fotoğrafı
    author_bio: "text",      // Yazar biyografisi
    view_count: "number",    // Görüntülenme sayısı
    is_featured: "bool",     // Öne çıkan mı?
    is_published: "bool",    // Yayınlandı mı?
    meta_title: "text",      // Özel SEO başlığı
    meta_description: "text" // Özel meta açıklama
}
```

### Categories (Kategoriler)
```javascript
{
    id: "text",              // Benzersiz kimlik
    name: "text",            // Kategori adı
    slug: "text",            // URL slug
    description: "text",     // Açıklama
    icon: "text",            // Font Awesome ikon
    color: "text",           // Renk (hex)
    article_count: "number", // Makale sayısı
    meta_title: "text",      // SEO başlığı
    meta_description: "text" // SEO açıklaması
}
```

## 🔌 API Endpoints

RESTful Table API kullanılmaktadır:

```javascript
// Makaleleri listele
GET /tables/articles?page=1&limit=10&sort=-created_at

// Tek makale getir
GET /tables/articles/{id}

// Yeni makale oluştur
POST /tables/articles
Body: { title, content, category, ... }

// Makale güncelle
PATCH /tables/articles/{id}
Body: { view_count: 1251 }

// Makale sil
DELETE /tables/articles/{id}
```

## 🚀 Yayınlama

Website'i yayınlamak için **Publish** sekmesini kullanın.

## 📈 SEO Kontrol Listesi

### Google Search Console İçin
- [ ] Site doğrulaması yapın
- [ ] Sitemap.xml gönderimi
- [ ] URL inceleme
- [ ] Mobil uyumluluk testi

### Google Analytics İçin
- [ ] GA4 tracking kodu ekleyin
- [ ] Conversion tracking
- [ ] Event tracking

### Performans İzleme
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] PageSpeed Insights testi
- [ ] Mobile-Friendly testi

## 🔧 Yapılabilecek Geliştirmeler

1. **AMP Desteği** - Google AMP sayfaları
2. **Çok Dilli Destek** - i18n altyapısı
3. **Yorum Sistemi** - Disqus veya özel çözüm
4. **Newsletter Entegrasyonu** - Mailchimp, Sendinblue
5. **Arama Fonksiyonu** - Full-text search
6. **Admin Paneli** - İçerik yönetim arayüzü
7. **Sosyal Giriş** - Google, Facebook login
8. **RSS Feed** - Otomatik RSS oluşturma

## 🎯 SEO İpuçları

### İçerik Oluşturma
- Her makale için benzersiz meta description yazın (150-160 karakter)
- Başlıklarda anahtar kelimeler kullanın
- H1, H2, H3 hiyerarşisine dikkat edin
- Dahili bağlantılar ekleyin
- Görsel alt text'lerini ihmal etmeyin

### Teknik
- Sayfa yükleme hızını optimize edin
- Görsel boyutlarını optimize edin (WebP)
- Lazy loading kullanın
- HTTP/2 ve CDN kullanın
- SSL sertifikası kullanın

## 📞 İletişim

- **Website**: uzunyasamrehberi.com
- **Email**: iletisim@uzunyasamrehberi.com
- **Twitter**: @saglikrehberi

---

© 2024 Sağlık Rehberi. Tüm hakları saklıdır.
