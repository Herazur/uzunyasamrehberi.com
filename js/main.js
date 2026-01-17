/**
 * Sağlık Rehberi - Ana JavaScript Dosyası
 * SEO ve Performans Optimizasyonlu
 */

(function() {
    'use strict';

    // ===================================
    // Configuration
    // ===================================
    const CONFIG = {
        apiBase: 'tables',
        articlesTable: 'articles',
        categoriesTable: 'categories',
        itemsPerPage: 10,
        siteUrl: window.location.origin,
        siteName: 'Sağlık Rehberi'
    };

    // ===================================
    // Utility Functions
    // ===================================
    const Utils = {
        // Slug oluşturucu (SEO dostu URL)
        createSlug: function(text) {
            const turkishMap = {
                'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
                'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
            };
            
            let slug = text.toLowerCase();
            Object.keys(turkishMap).forEach(key => {
                slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
            });
            
            return slug
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        },

        // Tarih formatla
        formatDate: function(dateString) {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            return new Date(dateString).toLocaleDateString('tr-TR', options);
        },

        // ISO tarih formatı
        toISODate: function(date) {
            return new Date(date).toISOString();
        },

        // Okuma süresi hesapla
        calculateReadingTime: function(content) {
            const wordsPerMinute = 200;
            const text = content ? content.replace(/<[^>]*>/g, '') : '';
            const wordCount = text.split(/\s+/).length;
            const minutes = Math.ceil(wordCount / wordsPerMinute);
            return minutes || 1;
        },

        // Metin kısalt
        truncateText: function(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substr(0, maxLength).trim() + '...';
        },

        // HTML'den metin çıkar
        stripHtml: function(html) {
            if (!html) return '';
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        },

        // Debounce fonksiyonu
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
        },

        // Cookie işlemleri
        setCookie: function(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
        },

        getCookie: function(name) {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    };

    // ===================================
    // API Service
    // ===================================
    const API = {
        async get(table, params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const url = `${CONFIG.apiBase}/${table}${queryString ? '?' + queryString : ''}`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('API hatası');
                return await response.json();
            } catch (error) {
                console.error('API GET hatası:', error);
                return { data: [], total: 0 };
            }
        },

        async getById(table, id) {
            try {
                const response = await fetch(`${CONFIG.apiBase}/${table}/${id}`);
                if (!response.ok) throw new Error('API hatası');
                return await response.json();
            } catch (error) {
                console.error('API GET hatası:', error);
                return null;
            }
        },

        async post(table, data) {
            try {
                const response = await fetch(`${CONFIG.apiBase}/${table}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('API hatası');
                return await response.json();
            } catch (error) {
                console.error('API POST hatası:', error);
                return null;
            }
        },

        async patch(table, id, data) {
            try {
                const response = await fetch(`${CONFIG.apiBase}/${table}/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('API hatası');
                return await response.json();
            } catch (error) {
                console.error('API PATCH hatası:', error);
                return null;
            }
        }
    };

    // ===================================
    // Mobile Navigation
    // ===================================
    const MobileNav = {
        init: function() {
            const toggle = document.querySelector('.mobile-menu-toggle');
            const menu = document.querySelector('.nav-menu');
            
            if (!toggle || !menu) return;

            toggle.addEventListener('click', () => {
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isExpanded);
                menu.classList.toggle('active');
            });

            // Dropdown toggle for mobile
            const dropdownToggles = document.querySelectorAll('.has-dropdown > a');
            dropdownToggles.forEach(dropdownToggle => {
                dropdownToggle.addEventListener('click', (e) => {
                    if (window.innerWidth < 1024) {
                        e.preventDefault();
                        const parent = dropdownToggle.parentElement;
                        const dropdown = parent.querySelector('.dropdown-menu');
                        const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
                        
                        dropdownToggle.setAttribute('aria-expanded', !isExpanded);
                        dropdown.style.display = isExpanded ? 'none' : 'block';
                    }
                });
            });

            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                    toggle.setAttribute('aria-expanded', 'false');
                    menu.classList.remove('active');
                }
            });

            // Close menu on resize
            window.addEventListener('resize', Utils.debounce(() => {
                if (window.innerWidth >= 1024) {
                    toggle.setAttribute('aria-expanded', 'false');
                    menu.classList.remove('active');
                }
            }, 250));
        }
    };

    // ===================================
    // Back to Top Button
    // ===================================
    const BackToTop = {
        init: function() {
            const button = document.getElementById('back-to-top');
            if (!button) return;

            window.addEventListener('scroll', Utils.debounce(() => {
                if (window.scrollY > 300) {
                    button.classList.add('visible');
                } else {
                    button.classList.remove('visible');
                }
            }, 100));

            button.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    };

    // ===================================
    // Cookie Consent
    // ===================================
    const CookieConsent = {
        init: function() {
            const banner = document.getElementById('cookie-consent');
            const acceptBtn = document.getElementById('accept-cookies');
            
            if (!banner || !acceptBtn) return;

            // Cookie daha önce kabul edilmediyse göster
            if (!Utils.getCookie('cookies_accepted')) {
                banner.hidden = false;
            }

            acceptBtn.addEventListener('click', () => {
                Utils.setCookie('cookies_accepted', 'true', 365);
                banner.hidden = true;
            });
        }
    };

    // ===================================
    // Current Year
    // ===================================
    const CurrentYear = {
        init: function() {
            const yearElement = document.getElementById('current-year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        }
    };

    // ===================================
    // Articles Manager
    // ===================================
    const ArticlesManager = {
        currentPage: 1,
        totalPages: 1,

        init: async function() {
            await this.loadArticles();
            await this.loadStats();
        },

        loadArticles: async function() {
            const container = document.getElementById('latest-articles');
            const emptyState = document.getElementById('empty-articles');
            const popularWidget = document.getElementById('popular-widget');
            const popularContainer = document.getElementById('popular-articles');
            
            if (!container) return;

            const urlParams = new URLSearchParams(window.location.search);
            this.currentPage = parseInt(urlParams.get('page')) || 1;

            try {
                const result = await API.get(CONFIG.articlesTable, {
                    page: this.currentPage,
                    limit: CONFIG.itemsPerPage,
                    sort: '-created_at'
                });

                if (result.data && result.data.length > 0) {
                    // Makaleler varsa göster
                    if (emptyState) emptyState.style.display = 'none';
                    container.innerHTML = this.renderArticles(result.data);
                    this.totalPages = Math.ceil(result.total / CONFIG.itemsPerPage);
                    this.renderPagination();
                    
                    // Popüler makaleleri göster
                    if (popularWidget && popularContainer) {
                        popularWidget.style.display = 'block';
                        const popularResult = await API.get(CONFIG.articlesTable, {
                            limit: 5,
                            sort: '-view_count'
                        });
                        if (popularResult.data && popularResult.data.length > 0) {
                            popularContainer.innerHTML = this.renderPopularArticles(popularResult.data);
                        }
                    }
                } else {
                    // Makale yoksa boş durum göster
                    if (emptyState) emptyState.style.display = 'flex';
                    if (popularWidget) popularWidget.style.display = 'none';
                }
            } catch (error) {
                console.error('Makaleler yüklenirken hata:', error);
                if (emptyState) emptyState.style.display = 'flex';
            }
        },

        loadStats: async function() {
            const articleCountEl = document.getElementById('article-count');
            const readerCountEl = document.getElementById('reader-count');
            
            try {
                const result = await API.get(CONFIG.articlesTable, { limit: 1 });
                
                if (articleCountEl) {
                    articleCountEl.textContent = result.total || 0;
                }
                
                // Toplam okuyucu sayısını hesapla (view_count toplamı)
                if (readerCountEl && result.total > 0) {
                    const allArticles = await API.get(CONFIG.articlesTable, { limit: 1000 });
                    const totalViews = allArticles.data ? allArticles.data.reduce((sum, article) => sum + (article.view_count || 0), 0) : 0;
                    readerCountEl.textContent = totalViews.toLocaleString('tr-TR');
                }
                
                // Kategori sayılarını güncelle
                this.updateCategoryCounts();
            } catch (error) {
                console.error('İstatistikler yüklenirken hata:', error);
            }
        },

        updateCategoryCounts: async function() {
            const categoryElements = document.querySelectorAll('[data-category]');
            if (!categoryElements.length) return;

            try {
                const result = await API.get(CONFIG.articlesTable, { limit: 1000 });
                if (!result.data) return;

                const categoryCounts = {};
                result.data.forEach(article => {
                    const category = article.category ? Utils.createSlug(article.category) : 'diger';
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                });

                categoryElements.forEach(el => {
                    const category = el.dataset.category;
                    const count = categoryCounts[category] || 0;
                    el.textContent = `${count} Makale`;
                });
            } catch (error) {
                console.error('Kategori sayıları güncellenirken hata:', error);
            }
        },

        renderArticles: function(articles) {
            return articles.map(article => {
                const slug = article.slug || Utils.createSlug(article.title);
                const readingTime = Utils.calculateReadingTime(article.content);
                const excerpt = Utils.truncateText(Utils.stripHtml(article.excerpt || article.content || ''), 150);
                const publishDate = Utils.formatDate(article.created_at);
                const defaultImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop';

                return `
                    <article class="article-list-item">
                        <div class="article-list-image">
                            <a href="makale.html?id=${article.id}&slug=${slug}">
                                <img src="${article.image || defaultImage}" 
                                     alt="${article.title}" 
                                     loading="lazy"
                                     width="220" height="165">
                            </a>
                        </div>
                        <div class="article-list-content">
                            <a href="/kategori/${Utils.createSlug(article.category || 'saglik')}" class="article-list-category">
                                ${article.category || 'Sağlık'}
                            </a>
                            <h3 class="article-list-title">
                                <a href="makale.html?id=${article.id}&slug=${slug}">${article.title}</a>
                            </h3>
                            <p class="article-list-excerpt">${excerpt}</p>
                            <div class="article-list-meta">
                                <span><i class="fas fa-calendar-alt" aria-hidden="true"></i> ${publishDate}</span>
                                <span><i class="fas fa-clock" aria-hidden="true"></i> ${readingTime} dk okuma</span>
                                <span><i class="fas fa-eye" aria-hidden="true"></i> ${(article.view_count || 0).toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
        },

        renderPopularArticles: function(articles) {
            return articles.map(article => {
                const slug = article.slug || Utils.createSlug(article.title);
                return `
                    <li>
                        <a href="makale.html?id=${article.id}&slug=${slug}">${article.title}</a>
                    </li>
                `;
            }).join('');
        },

        renderPagination: function() {
            const container = document.getElementById('pagination');
            if (!container || this.totalPages <= 1) {
                if (container) container.innerHTML = '';
                return;
            }

            let html = '';
            
            // Önceki sayfa
            if (this.currentPage > 1) {
                html += `<a href="?page=${this.currentPage - 1}" aria-label="Önceki sayfa"><i class="fas fa-chevron-left"></i></a>`;
            } else {
                html += `<span class="disabled" aria-hidden="true"><i class="fas fa-chevron-left"></i></span>`;
            }

            // Sayfa numaraları
            for (let i = 1; i <= this.totalPages; i++) {
                if (i === this.currentPage) {
                    html += `<span class="active" aria-current="page">${i}</span>`;
                } else {
                    html += `<a href="?page=${i}">${i}</a>`;
                }
            }

            // Sonraki sayfa
            if (this.currentPage < this.totalPages) {
                html += `<a href="?page=${this.currentPage + 1}" aria-label="Sonraki sayfa"><i class="fas fa-chevron-right"></i></a>`;
            } else {
                html += `<span class="disabled" aria-hidden="true"><i class="fas fa-chevron-right"></i></span>`;
            }

            container.innerHTML = html;
        }
    };

    // ===================================
    // Newsletter Form
    // ===================================
    const Newsletter = {
        init: function() {
            const forms = document.querySelectorAll('#newsletter-form, #cta-newsletter-form');
            forms.forEach(form => {
                if (form) {
                    form.addEventListener('submit', this.handleSubmit.bind(this));
                }
            });
        },

        handleSubmit: function(e) {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            
            // Form validasyonu
            if (!this.validateEmail(email)) {
                alert('Lütfen geçerli bir e-posta adresi girin.');
                return;
            }

            // Başarılı mesajı göster
            alert('Bülten aboneliğiniz başarıyla oluşturuldu! 🎉');
            e.target.reset();
        },

        validateEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
    };

    // ===================================
    // Search Functionality
    // ===================================
    const Search = {
        init: function() {
            const searchForms = document.querySelectorAll('[role="search"]');
            searchForms.forEach(form => {
                form.addEventListener('submit', this.handleSubmit.bind(this));
            });
        },

        handleSubmit: function(e) {
            const input = e.target.querySelector('input[type="search"]');
            if (input && !input.value.trim()) {
                e.preventDefault();
                input.focus();
            }
        }
    };

    // ===================================
    // Lazy Loading Images
    // ===================================
    const LazyLoad = {
        init: function() {
            if ('loading' in HTMLImageElement.prototype) {
                const images = document.querySelectorAll('img[loading="lazy"]');
                images.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                });
            } else {
                const images = document.querySelectorAll('img[loading="lazy"]');
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                            }
                            observer.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            }
        }
    };

    // ===================================
    // Initialize App
    // ===================================
    const App = {
        init: function() {
            // DOM yüklendikten sonra çalıştır
            MobileNav.init();
            BackToTop.init();
            CookieConsent.init();
            CurrentYear.init();
            Newsletter.init();
            Search.init();
            LazyLoad.init();

            // Anasayfa için makaleleri yükle
            if (document.getElementById('latest-articles')) {
                ArticlesManager.init();
            }

            console.log('✅ Sağlık Rehberi başlatıldı');
        }
    };

    // DOMContentLoaded event
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.init);
    } else {
        App.init();
    }

    // Global exports (gerekirse)
    window.SaglikRehberi = {
        Utils,
        API,
        ArticlesManager
    };

})();