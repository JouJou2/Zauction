/**
 * Zauction I18n System
 * Handles language switching, RTL/LTR, and translations
 */

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.translations = {};
        this.translationCache = {};
        this.fallbackLang = 'en';
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        // Apply language immediately (before translations load)
        this.applyLanguage(this.currentLang);

        // Load header partial first
        await this.loadHeader();

        // Then load translations
        await this.loadTranslations(this.currentLang);
        await this.ensureFallbackTranslations();

        // Translate page content
        this.translatePage();

        // Setup language toggle
        this.setupLanguageToggle();

        this.isInitialized = true;

        window.dispatchEvent(new CustomEvent('i18nReady', {
            detail: { lang: this.currentLang }
        }));
    }

    async loadHeader() {
        const headerContainer = document.getElementById('site-header');
        if (!headerContainer) return;

        try {
            // Determine if we're in a subdirectory
            const isInSubdir = window.location.pathname.includes('/pages/') || 
                              window.location.pathname.includes('\\pages\\');
            const basePath = isInSubdir ? '../' : '';
            
            const response = await fetch(`${basePath}partials/header.html`);
            if (!response.ok) throw new Error('Header not found');

            const html = await response.text();
            headerContainer.innerHTML = html;

            // Update navigation links based on current directory
            this.updateNavigationPaths(isInSubdir);

            // Set active nav link based on current page
            this.setActiveNavLink();
            
            // Update header auth state (show/hide login/logout buttons)
            if (typeof updateHeaderAuthState === 'function') {
                updateHeaderAuthState();
            }
        } catch (error) {
            console.error('Failed to load header:', error);
        }
    }

    updateNavigationPaths(isInSubdir) {
        const basePath = isInSubdir ? '../pages/' : 'pages/';
        const rootPath = isInSubdir ? '../' : '';

        // Update links
        const links = {
            'logo-link': `${rootPath}index.html`,
            'auctions-link': `${basePath}auctions.html`,
            'collection-link': `${basePath}collection.html`,
            'account-link': `${basePath}account.html`,
            'admin-link': `${basePath}admin.html`,
            'login-link': `${basePath}login.html`,
            'register-link': `${basePath}register.html`
        };

        Object.entries(links).forEach(([id, href]) => {
            const link = document.getElementById(id);
            if (link) link.setAttribute('href', href);
        });
    }

    setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.endsWith(href)) {
                link.classList.add('active');
            }
        });
    }

    async loadTranslations(lang) {
        try {
            if (this.translationCache[lang]) {
                this.translations = this.translationCache[lang];
                return;
            }

            // Determine if we're in a subdirectory
            const isInSubdir = window.location.pathname.includes('/pages/') || 
                              window.location.pathname.includes('\\pages\\');
            const basePath = isInSubdir ? '../' : '';
            
            const response = await fetch(`${basePath}locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang} translations`);
            }
            const loadedTranslations = await response.json();
            this.translationCache[lang] = loadedTranslations;
            this.translations = loadedTranslations;
        } catch (error) {
            console.error('Translation load error:', error);
            if (lang !== this.fallbackLang) {
                await this.loadTranslations(this.fallbackLang);
            }
        }
    }

    async ensureFallbackTranslations() {
        if (this.translationCache[this.fallbackLang]) return;

        const previousTranslations = this.translations;
        await this.loadTranslations(this.fallbackLang);
        this.translationCache[this.fallbackLang] = this.translations;
        this.translations = previousTranslations;
    }

    applyLanguage(lang) {
        this.currentLang = lang;

        // Set document attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Toggle RTL class on body
        if (lang === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }

        // Save to localStorage
        localStorage.setItem('lang', lang);
    }

    async switchLanguage(lang) {
        if (lang === this.currentLang) return;

        this.applyLanguage(lang);
        await this.loadTranslations(lang);
        await this.ensureFallbackTranslations();
        this.translatePage();
        this.updateLanguageToggle();

        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { lang }
        }));
    }

    translatePage() {
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.textContent = translation;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.placeholder = translation;
            }
        });

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.setAttribute('aria-label', translation);
            }
        });

        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.title = translation;
            }
        });

        // Translate alt text
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.alt = translation;
            }
        });

        // Translate values
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.value = translation;
            }
        });
    }

    getTranslation(key) {
        const keys = key.split('.');

        const resolveFromObject = (source) => {
            let value = source;

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return null;
                }
            }

            return value;
        };

        const primaryValue = resolveFromObject(this.translations);
        if (primaryValue !== null && primaryValue !== undefined) {
            return primaryValue;
        }

        const fallbackSource = this.translationCache[this.fallbackLang];
        const fallbackValue = fallbackSource ? resolveFromObject(fallbackSource) : null;
        if (fallbackValue !== null && fallbackValue !== undefined) {
            return fallbackValue;
        }

        return key;
    }

    // Helper method for JavaScript usage
    t(key) {
        return this.getTranslation(key);
    }

    setupLanguageToggle() {
        const toggles = document.querySelectorAll('.lang-toggle');

        toggles.forEach(toggle => {
            toggle.addEventListener('click', async (e) => {
                e.preventDefault();
                const lang = toggle.getAttribute('data-lang');
                await this.switchLanguage(lang);
            });
        });

        this.updateLanguageToggle();
    }

    updateLanguageToggle() {
        const toggles = document.querySelectorAll('.lang-toggle');

        toggles.forEach(toggle => {
            const lang = toggle.getAttribute('data-lang');
            if (lang === this.currentLang) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        });
    }

    // Formatting helpers
    formatNumber(number) {
        return new Intl.NumberFormat(this.currentLang).format(number);
    }

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat(this.currentLang, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat(this.currentLang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    formatRelativeTime(date) {
        const rtf = new Intl.RelativeTimeFormat(this.currentLang, { numeric: 'auto' });
        const diff = new Date(date) - new Date();
        const days = Math.round(diff / (1000 * 60 * 60 * 24));

        if (Math.abs(days) < 1) {
            const hours = Math.round(diff / (1000 * 60 * 60));
            return rtf.format(hours, 'hour');
        }

        return rtf.format(days, 'day');
    }
}

// Initialize i18n when DOM is ready
const i18n = new I18n();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}
