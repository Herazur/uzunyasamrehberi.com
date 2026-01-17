/**
 * Sağlık Rehberi - Makale Sayfası JavaScript
 * SEO ve Erişilebilirlik Optimizasyonlu
 */

(function() {
    'use strict';

    const CONFIG = {
        apiBase: 'tables',
        articlesTable: 'articles',
        siteUrl: window.location.origin,
        siteName: 'Sağlık Rehberi'
    };

    // URL'den parametreleri al
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    const articleSlug = urlParams.get('slug');

    // ===================================
    // Article Page Manager
    // ===================================
    const ArticlePage = {
        article: null,

        init: async function() {
            await this.loadArticle();
            this.initReadingProgress();
            this.initTableOfContents();
            this.loadRelatedArticles();
            this.loadPopularArticles();
        },

        loadArticle: async function() {
            try {
                if (articleId) {
                    // API'den makale yükle
                    const response = await fetch(`${CONFIG.apiBase}/${CONFIG.articlesTable}/${articleId}`);
                    if (response.ok) {
                        this.article = await response.json();
                        this.renderArticle();
                        this.incrementViewCount();
                        return;
                    }
                }
                
                // Makale bulunamadıysa hata göster
                this.renderNotFound();
            } catch (error) {
                console.error('Makale yüklenirken hata:', error);
                this.renderNotFound();
            }
        },

        renderNotFound: function() {
            const articleBody = document.getElementById('article-body');
            if (articleBody) {
                articleBody.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-search" aria-hidden="true"></i>
                        </div>
                        <h3>Makale Bulunamadı</h3>
                        <p>Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
                        <a href="/" class="btn-back">Ana Sayfaya Dön</a>
                    </div>
                `;
            }
            document.getElementById('article-title').textContent = 'Makale Bulunamadı';
            document.title = `Makale Bulunamadı | ${CONFIG.siteName}`;

            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', 'Aradığınız makale mevcut değil veya kaldırılmış olabilir.');
            }

            const robots = document.querySelector('meta[name="robots"]');
            if (robots) {
                robots.setAttribute('content', 'noindex, follow');
            }

            const canonical = document.getElementById('canonical-url');
            if (canonical) {
                canonical.setAttribute('href', `${CONFIG.siteUrl}/makale.html`);
            }

            ['schema-article', 'schema-breadcrumb', 'schema-faq'].forEach((id) => {
                const schema = document.getElementById(id);
                if (schema) schema.remove();
            });
        },

        renderArticle: function() {
            const article = this.article;
            if (!article) return;

            // Sayfa başlığı ve meta etiketleri
            this.updateMetaTags(article);

            // Makale içeriğini render et
            this.updateElement('article-title', article.title);
            this.updateElement('article-excerpt', article.excerpt || '');
            this.updateElement('article-category', article.category || 'Sağlık');
            this.updateElement('reading-time', `<i class="fas fa-clock" aria-hidden="true"></i><span>${this.calculateReadingTime(article.content)} dk okuma</span>`);
            
            // Yazar bilgileri - varsa göster
            if (article.author) {
                this.updateElement('author-name', article.author);
                this.updateElement('author-title-text', article.author_title || '');
                
                if (article.author_image) {
                    this.updateAttribute('author-avatar', 'src', article.author_image);
                    this.updateAttribute('author-avatar', 'alt', article.author + ' fotoğrafı');
                } else {
                    // Yazar fotoğrafı yoksa gizle
                    const authorAvatar = document.getElementById('author-avatar');
                    if (authorAvatar) authorAvatar.style.display = 'none';
                }
                
                // Author box'ı göster - yazar bilgisi varsa
                const authorBox = document.getElementById('author-box');
                if (authorBox && article.author) {
                    authorBox.style.display = 'flex';
                    this.updateElement('author-box-name', article.author);
                    this.updateElement('author-box-title', article.author_title || '');
                    this.updateElement('author-box-bio', article.author_bio || '');
                    if (article.author_image) {
                        this.updateAttribute('author-box-avatar', 'src', article.author_image);
                        this.updateAttribute('author-box-avatar', 'alt', article.author + ' fotoğrafı');
                    }
                }
            } else {
                // Yazar bilgisi yoksa gizle
                const authorInfo = document.querySelector('.author-info');
                if (authorInfo) authorInfo.style.display = 'none';
            }

            // Tarihler
            const publishDate = new Date(article.created_at);
            const updateDate = article.updated_at ? new Date(article.updated_at) : publishDate;
            
            this.updateElement('publish-date', `<i class="fas fa-calendar-alt" aria-hidden="true"></i><span>${this.formatDate(publishDate)}</span>`);
            this.updateAttribute('publish-date', 'datetime', publishDate.toISOString());
            this.updateElement('update-date', `<i class="fas fa-sync-alt" aria-hidden="true"></i><span>${this.formatDate(updateDate)}</span>`);
            this.updateAttribute('update-date', 'datetime', updateDate.toISOString());

            // Öne çıkan görsel
            const featuredContainer = document.getElementById('featured-image-container');
            if (article.image) {
                this.updateAttribute('featured-image', 'src', article.image);
                this.updateAttribute('featured-image', 'alt', article.title);
                this.updateElement('image-caption', article.image_caption || '');
                if (featuredContainer) featuredContainer.style.display = 'block';
            } else {
                if (featuredContainer) featuredContainer.style.display = 'none';
            }

            // Makale içeriği
            this.updateElement('article-body', article.content || '<p>İçerik yükleniyor...</p>');

            // Etiketler
            if (article.tags && article.tags.length > 0) {
                const tagsArray = Array.isArray(article.tags) ? article.tags : article.tags.split(',');
                const tagsHtml = tagsArray.map(tag => 
                    `<a href="/etiket/${this.createSlug(tag.trim())}" class="tag">${tag.trim()}</a>`
                ).join('');
                const tagsContainer = document.getElementById('article-tags');
                if (tagsContainer) {
                    tagsContainer.innerHTML = `
                        <span class="tags-label">
                            <i class="fas fa-tags" aria-hidden="true"></i>
                            Etiketler:
                        </span>
                        ${tagsHtml}
                    `;
                }
            }

            // Breadcrumb güncelle
            this.updateBreadcrumb(article);

            // Schema.org güncelle
            this.updateSchemaOrg(article);
            this.updateBreadcrumbSchema(article);
            this.updateFaqSchema(article);
        },

        updateMetaTags: function(article) {
            const url = this.getArticleUrl(article);
            const description = article.excerpt || this.truncateText(this.stripHtml(article.content), 160);
            const tags = this.getTagsArray(article);
            const keywords = tags.length ? tags.join(', ') : (article.category || 'Sağlık');
            const authorName = article.author || CONFIG.siteName;
            const authorUrl = this.getAuthorUrl(article);
            const imageUrl = article.image ? this.ensureAbsoluteUrl(article.image) : '';
            const imageAlt = article.image_alt || article.title || CONFIG.siteName;
            const publishedIso = this.toISODate(article.created_at);
            const modifiedIso = this.toISODate(article.updated_at || article.created_at);
            
            // Title
            document.title = `${article.title} | ${CONFIG.siteName}`;

            // Meta Description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', description);

            const metaKeywords = document.getElementById('meta-keywords');
            if (metaKeywords) metaKeywords.setAttribute('content', keywords);

            const metaAuthor = document.getElementById('meta-author');
            if (metaAuthor) metaAuthor.setAttribute('content', authorName);
            
            // Canonical URL
            const canonical = document.getElementById('canonical-url');
            if (canonical) canonical.setAttribute('href', url);

            // Open Graph
            const ogTitle = document.getElementById('og-title');
            if (ogTitle) ogTitle.setAttribute('content', article.title);
            
            const ogDesc = document.getElementById('og-description');
            if (ogDesc) ogDesc.setAttribute('content', description);
            
            const ogUrl = document.getElementById('og-url');
            if (ogUrl) ogUrl.setAttribute('content', url);

            const ogSection = document.getElementById('og-section');
            if (ogSection) ogSection.setAttribute('content', article.category || 'Sağlık');

            const ogAuthor = document.getElementById('og-author');
            if (ogAuthor) ogAuthor.setAttribute('content', authorUrl || authorName);

            const ogPublished = document.getElementById('og-published');
            if (ogPublished && publishedIso) ogPublished.setAttribute('content', publishedIso);

            const ogModified = document.getElementById('og-modified');
            if (ogModified && modifiedIso) ogModified.setAttribute('content', modifiedIso);

            if (imageUrl) {
                const ogImage = document.getElementById('og-image');
                if (ogImage) ogImage.setAttribute('content', imageUrl);
            }

            const ogImageAlt = document.getElementById('og-image-alt');
            if (ogImageAlt) ogImageAlt.setAttribute('content', imageAlt);

            this.updateArticleTagsMeta(tags);
        },

        updateSchemaOrg: function(article) {
            const schemaArticle = document.getElementById('schema-article');
            if (!schemaArticle) return;

            const url = this.getArticleUrl(article);
            const description = article.excerpt || this.truncateText(this.stripHtml(article.content), 160);
            const text = this.stripHtml(article.content || '');
            const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
            const tags = this.getTagsArray(article);
            const imageUrl = article.image ? this.ensureAbsoluteUrl(article.image) : '';
            const publishedIso = this.toISODate(article.created_at);
            const modifiedIso = this.toISODate(article.updated_at || article.created_at);
            const authorUrl = this.getAuthorUrl(article);

            const schema = {
                "@context": "https://schema.org",
                "@type": "MedicalWebPage",
                "@id": `${url}#webpage`,
                "url": url,
                "name": article.title,
                "description": description,
                "inLanguage": "tr-TR",
                "isPartOf": {
                    "@type": "WebSite",
                    "@id": `${CONFIG.siteUrl}/#website`,
                    "name": CONFIG.siteName,
                    "url": CONFIG.siteUrl
                },
                "mainEntity": {
                    "@type": "Article",
                    "@id": `${url}#article`,
                    "headline": article.title,
                    "description": description,
                    "publisher": {
                        "@type": "Organization",
                        "name": CONFIG.siteName,
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${CONFIG.siteUrl}/images/logo.png`,
                            "width": 600,
                            "height": 60
                        }
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": url
                    },
                    "articleSection": article.category || "Sağlık",
                    "wordCount": wordCount,
                    "inLanguage": "tr-TR"
                },
                "specialty": {
                    "@type": "MedicalSpecialty",
                    "name": article.category || "Genel Sağlık"
                }
            };

            if (publishedIso) {
                schema.mainEntity.datePublished = publishedIso;
            }
            if (modifiedIso) {
                schema.mainEntity.dateModified = modifiedIso;
            }
            if (modifiedIso || publishedIso) {
                schema.lastReviewed = modifiedIso || publishedIso;
            }

            // Yazar bilgisi varsa ekle
            if (article.author) {
                const author = {
                    "@type": "Person",
                    "name": article.author
                };
                if (authorUrl) {
                    author.url = authorUrl;
                }
                schema.mainEntity.author = author;
                schema.reviewedBy = author;
            }

            // Görsel varsa ekle
            if (imageUrl) {
                schema.mainEntity.image = {
                    "@type": "ImageObject",
                    "url": imageUrl,
                    "width": 1200,
                    "height": 630
                };
            }

            // Etiketler varsa ekle
            if (tags.length) {
                schema.mainEntity.keywords = tags.join(', ');
            }

            schemaArticle.textContent = JSON.stringify(schema, null, 2);
        },

        updateBreadcrumb: function(article) {
            const categoryLink = document.querySelector('#breadcrumb-category a');
            const articleTitle = document.querySelector('#breadcrumb-article span[itemprop="name"]');
            
            if (categoryLink) {
                const categorySlug = this.createSlug(article.category || 'saglik');
                categoryLink.href = `/kategori/${categorySlug}`;
                categoryLink.querySelector('span').textContent = article.category || 'Sağlık';
            }
            
            if (articleTitle) {
                articleTitle.textContent = article.title;
            }
        },

        updateBreadcrumbSchema: function(article) {
            const breadcrumbSchema = document.getElementById('schema-breadcrumb');
            if (!breadcrumbSchema) return;

            const url = this.getArticleUrl(article);
            const categoryName = article.category || 'Sağlık';
            const categorySlug = this.createSlug(categoryName);

            const schema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Ana Sayfa",
                        "item": `${CONFIG.siteUrl}/`
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": categoryName,
                        "item": `${CONFIG.siteUrl}/kategori/${categorySlug}`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": article.title,
                        "item": url
                    }
                ]
            };

            breadcrumbSchema.textContent = JSON.stringify(schema, null, 2);
        },

        updateFaqSchema: function(article) {
            const faqSchema = document.getElementById('schema-faq');
            if (!faqSchema) return;

            let faqs = article.faqs || article.faq || [];
            if (typeof faqs === 'string') {
                try {
                    faqs = JSON.parse(faqs);
                } catch (error) {
                    faqs = [];
                }
            }

            if (!Array.isArray(faqs)) {
                faqs = [];
            }

            const items = faqs.map((faq) => {
                const question = faq.question || faq.q;
                const answer = faq.answer || faq.a;

                if (!question || !answer) return null;

                return {
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                };
            }).filter(Boolean);

            if (!items.length) {
                faqSchema.remove();
                return;
            }

            const schema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": items
            };

            faqSchema.textContent = JSON.stringify(schema, null, 2);
        },

        initTableOfContents: function() {
            const articleBody = document.getElementById('article-body');
            const tocList = document.getElementById('toc-list');
            const sidebarTocList = document.getElementById('sidebar-toc-list');
            const tocContainer = document.querySelector('.table-of-contents');
            const sidebarToc = document.querySelector('.sidebar-toc');
            
            if (!articleBody || !tocList) return;

            const headings = articleBody.querySelectorAll('h2, h3');
            if (headings.length === 0) {
                if (tocContainer) tocContainer.style.display = 'none';
                if (sidebarToc) sidebarToc.style.display = 'none';
                return;
            }

            let tocHtml = '';
            headings.forEach((heading, index) => {
                // ID yoksa oluştur
                if (!heading.id) {
                    heading.id = `heading-${index}`;
                }
                
                const level = heading.tagName === 'H2' ? '' : 'toc-sub';
                tocHtml += `
                    <li class="${level}">
                        <a href="#${heading.id}">${heading.textContent}</a>
                    </li>
                `;
            });

            tocList.innerHTML = tocHtml;
            if (sidebarTocList) {
                sidebarTocList.innerHTML = tocHtml;
            }

            // Scroll spy
            this.initScrollSpy(headings);
        },

        initScrollSpy: function(headings) {
            const tocLinks = document.querySelectorAll('.toc-list a');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        tocLinks.forEach(link => {
                            link.parentElement.classList.remove('active');
                            if (link.getAttribute('href') === `#${entry.target.id}`) {
                                link.parentElement.classList.add('active');
                            }
                        });
                    }
                });
            }, {
                rootMargin: '-100px 0px -70% 0px'
            });

            headings.forEach(heading => observer.observe(heading));
        },

        initReadingProgress: function() {
            const progressBar = document.getElementById('progress-bar');
            const progressFill = document.getElementById('reading-progress-fill');
            const progressPercent = document.getElementById('progress-percent');
            const articleBody = document.getElementById('article-body');
            
            if (!articleBody) return;

            const updateProgress = () => {
                const articleRect = articleBody.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const articleHeight = articleBody.offsetHeight;
                
                let progress = 0;
                
                if (articleRect.top < windowHeight && articleRect.bottom > 0) {
                    const scrolled = windowHeight - articleRect.top;
                    progress = Math.min(100, Math.max(0, (scrolled / articleHeight) * 100));
                } else if (articleRect.bottom <= 0) {
                    progress = 100;
                }
                
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
                if (progressPercent) {
                    progressPercent.textContent = `${Math.round(progress)}%`;
                }
            };

            window.addEventListener('scroll', this.debounce(updateProgress, 10));
            updateProgress();
        }, 2000);
                } catch (err) {
                    console.error('Kopyalama başarısız:', err);
                }
            });
        },

        loadRelatedArticles: async function() {
            const container = document.getElementById('related-articles');
            const section = document.querySelector('.related-articles');
            if (!container) return;

            try {
                const result = await fetch(`${CONFIG.apiBase}/${CONFIG.articlesTable}?limit=3&sort=-created_at`);
                if (result.ok) {
                    const data = await result.json();
                    if (data.data && data.data.length > 0) {
                        // Mevcut makaleyi hariç tut
                        const filtered = data.data.filter(a => a.id !== articleId);
                        if (filtered.length > 0) {
                            container.innerHTML = this.renderRelatedArticles(filtered.slice(0, 3));
                            return;
                        }
                    }
                }
                // İlgili makale yoksa bölümü gizle
                if (section) section.style.display = 'none';
            } catch (error) {
                if (section) section.style.display = 'none';
            }
        },

        renderRelatedArticles: function(articles) {
            const defaultImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop';
            
            return articles.map(article => {
                const slug = article.slug || this.createSlug(article.title);
                return `
                    <article class="article-card">
                        <div class="article-card-image">
                            <img src="${article.image || defaultImage}" 
                                 alt="${article.title}" 
                                 loading="lazy"
                                 width="400" height="300">
                            <span class="article-card-category">${article.category || 'Sağlık'}</span>
                        </div>
                        <div class="article-card-content">
                            <h3 class="article-card-title">
                                <a href="makale.html?id=${article.id}&slug=${slug}">${article.title}</a>
                            </h3>
                            <div class="article-card-meta">
                                <span class="article-card-date">
                                    <i class="fas fa-clock" aria-hidden="true"></i>
                                    ${this.calculateReadingTime(article.content || '')} dk
                                </span>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
        },

        loadPopularArticles: async function() {
            const container = document.getElementById('popular-articles');
            const widget = container?.closest('.sidebar-widget');
            if (!container) return;

            try {
                const result = await fetch(`${CONFIG.apiBase}/${CONFIG.articlesTable}?limit=5&sort=-view_count`);
                if (result.ok) {
                    const data = await result.json();
                    if (data.data && data.data.length > 0) {
                        container.innerHTML = data.data.map(article => `
                            <li>
                                <a href="makale.html?id=${article.id}&slug=${this.createSlug(article.title)}">${article.title}</a>
                            </li>
                        `).join('');
                        return;
                    }
                }
                // Makale yoksa widget'ı gizle
                if (widget) widget.style.display = 'none';
            } catch (error) {
                if (widget) widget.style.display = 'none';
            }
        },

        incrementViewCount: async function() {
            if (!articleId || !this.article) return;
            
            try {
                await fetch(`${CONFIG.apiBase}/${CONFIG.articlesTable}/${articleId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        view_count: (this.article.view_count || 0) + 1 
                    })
                });
            } catch (error) {
                console.error('Görüntülenme sayısı güncellenemedi:', error);
            }
        },

        // Yardımcı fonksiyonlar
        updateElement: function(id, content) {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = content;
            }
        },

        updateAttribute: function(id, attr, value) {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute(attr, value);
            }
        },

        getArticleUrl: function(article) {
            const slug = article.slug || this.createSlug(article.title || '');
            const id = articleId || article.id;
            const params = [];
            if (id) params.push(`id=${encodeURIComponent(id)}`);
            if (slug) params.push(`slug=${encodeURIComponent(slug)}`);
            const query = params.length ? `?${params.join('&')}` : '';
            return `${CONFIG.siteUrl}/makale.html${query}`;
        },

        getTagsArray: function(article) {
            const rawTags = article.tags || [];
            let tags = [];

            if (Array.isArray(rawTags)) {
                tags = rawTags;
            } else if (typeof rawTags === 'string') {
                tags = rawTags.split(',');
            }

            return [...new Set(tags.map(tag => tag.trim()).filter(Boolean))];
        },

        ensureAbsoluteUrl: function(url) {
            if (!url) return '';
            if (/^https?:\/\//i.test(url)) return url;
            if (url.startsWith('//')) return `${window.location.protocol}${url}`;

            const baseUrl = CONFIG.siteUrl.replace(/\/$/, '');
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            return `${baseUrl}/${url}`;
        },

        getAuthorUrl: function(article) {
            if (article.author_url) return article.author_url;
            if (article.author_slug) return `${CONFIG.siteUrl}/yazar/${article.author_slug}`;
            if (article.author) return `${CONFIG.siteUrl}/yazar/${this.createSlug(article.author)}`;
            return '';
        },

        toISODate: function(value) {
            if (!value) return '';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return date.toISOString();
        },

        updateArticleTagsMeta: function(tags) {
            const head = document.head;
            if (!head) return;

            const existing = document.querySelectorAll('meta[property="article:tag"]');
            existing.forEach((meta) => {
                if (meta.id !== 'og-tags') {
                    meta.remove();
                }
            });

            if (!tags || !tags.length) {
                const primary = document.getElementById('og-tags');
                if (primary) primary.setAttribute('content', '');
                return;
            }

            const primary = document.getElementById('og-tags');
            if (primary) {
                primary.setAttribute('content', tags[0]);
            } else {
                const meta = document.createElement('meta');
                meta.setAttribute('property', 'article:tag');
                meta.setAttribute('content', tags[0]);
                head.appendChild(meta);
            }

            tags.slice(1).forEach((tag) => {
                const meta = document.createElement('meta');
                meta.setAttribute('property', 'article:tag');
                meta.setAttribute('content', tag);
                head.appendChild(meta);
            });
        },

        createSlug: function(text) {
            const turkishMap = {
                'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
                'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
            };
            
            let slug = (text || '').toLowerCase();
            Object.keys(turkishMap).forEach(key => {
                slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
            });
            
            return slug
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        },

        formatDate: function(date) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString('tr-TR', options);
        },

        calculateReadingTime: function(content) {
            const text = this.stripHtml(content || '');
            const wordCount = text.split(/\s+/).length;
            return Math.ceil(wordCount / 200) || 1;
        },

        truncateText: function(text, maxLength) {
            if (!text || text.length <= maxLength) return text || '';
            return text.substr(0, maxLength).trim() + '...';
        },

        stripHtml: function(html) {
            const tmp = document.createElement('div');
            tmp.innerHTML = html || '';
            return tmp.textContent || tmp.innerText || '';
        },

        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ArticlePage.init());
    } else {
        ArticlePage.init();
    }

})();

