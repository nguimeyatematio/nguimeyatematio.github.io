// js/search.js

// Attribution: If you reuse or adapt this template, please credit
// "Based on the personal website of Dr. Nguimeya Tematio Gaël-Pacôme"

class SearchEngine {
    constructor() {
        this.searchableContent = [];
        this.indexLoaded = false;
        this.init();
    }

    init() {
        this.setupSearchUI();
        this.loadSearchableContent();
    }

    setupSearchUI() {
        const searchToggle = document.getElementById('searchToggle');
        const searchOverlay = document.getElementById('searchOverlay');
        const searchClose = document.getElementById('searchClose');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        // Search bar placeholder
        if (searchInput) {
            searchInput.placeholder = 'Search publications, talks and blog posts...';
        }

        // Open search overlay
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        });

        // Close search overlay
        const closeSearch = () => {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        };

        searchClose.addEventListener('click', closeSearch);
        
        // Close on overlay click
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                closeSearch();
            }
        });

        // Search input handler
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            // Debounce search
            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Handle result selection (card click navigates to source section and scrolls)
        searchResults.addEventListener('click', (e) => {
            // Let anchor tags work normally
            if (e.target.closest('a')) return;

            const resultItem = e.target.closest('.search-result');
            if (resultItem && resultItem.dataset.action) {
                this.handleSearchResultClick(resultItem.dataset.action);
                closeSearch();
            }
        });
    }

    async loadSearchableContent() {
        try {
            // Search include talks.json and blog.json, plus all publication subsets
            const [confRes, journRes, bookRes, talkRes, blogRes] = await Promise.all([
                fetch('data/conferences.json'),
                fetch('data/journals.json'),
                fetch('data/books.json'),
                fetch('data/talks.json'),
                fetch('data/blog.json')
            ]);

            const conferences = await confRes.json().catch(() => []);
            const journals   = await journRes.json().catch(() => []);
            const books      = await bookRes.json().catch(() => []);
            const talks      = await talkRes.json().catch(() => []);
            const blogPosts  = await blogRes.json().catch(() => []);

            // Helper to normalize id
            const slug = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');

            const toPubItem = (pub, kind) => ({
                type: 'publication',
                category: kind, // 'conferences' | 'journals' | 'books'
                id: pub.id || slug(pub.title),
                title: pub.title || '',
                content: `${pub.title || ''} ${(pub.authors||[]).join(' ')} ${pub.venue || ''} ${pub.abstract || ''} ${pub.year || ''}`,
                authors: (pub.authors||[]).join(', '),
                venue: pub.venue || '',
                year: pub.year || '',
                action: `${kind}-${pub.id || slug(pub.title)}`
            });

            const toTalkItem = (talk) => ({
                type: 'talk',
                category: 'talks',
                id: talk.id || slug(`${talk.title}-${talk.date || ''}`),
                title: talk.title || '',
                content: `${talk.title || ''} ${talk.event || ''} ${talk.description || ''} ${talk.date || ''}`,
                event: talk.event || '',
                date: talk.date || '',
                action: `talks-${talk.id || slug(`${talk.title}-${talk.date || ''}`)}`
            });

            const toBlogItem = (post) => ({
                type: 'blog',
                category: 'blog',
                id: post.id || post.slug || slug(post.title),
                title: post.title || '',
                content: `${post.title || ''} ${post.excerpt || ''} ${(post.tags || []).join(' ')}`,
                excerpt: post.excerpt || '',
                date: post.date || '',
                tags: post.tags || [],
                action: `blog-${post.id || post.slug || slug(post.title)}`
            });

            this.searchableContent = [
                ...conferences.map(p => toPubItem(p,'conferences')),
                ...journals.map(p => toPubItem(p,'journals')),
                ...books.map(p => toPubItem(p,'books')),
                ...talks.map(t => toTalkItem(t)),
                ...blogPosts.map(b => toBlogItem(b))
            ];

            this.indexLoaded = true;
        } catch (error) {
            // console.error('Error loading searchable content:', error);
            this.searchableContent = [];
            this.indexLoaded = false;
        }
    }

    performSearch(query) {
        if (!this.indexLoaded) return;
        const results = this.searchContent(query);
        this.displaySearchResults(results, query);
    }

    searchContent(query) {
        const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
        const results = [];

        this.searchableContent.forEach(item => {
            const hay = `${item.title} ${item.content}`.toLowerCase();

            let score = 0;
            let matchedTerms = 0;

            queryTerms.forEach(term => {
                // Title weight
                if ((item.title || '').toLowerCase().includes(term)) {
                    score += 10;
                    matchedTerms++;
                } else if (hay.includes(term)) {
                    score += 2;
                    matchedTerms++;
                }
            });

            if (matchedTerms === queryTerms.length || score >= 6) {
                results.push({
                    ...item,
                    score,
                    matchedTerms
                });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 12);
    }

    // Display matched items exactly as in their sections.
    // Strategy: find the already-rendered DOM node for the item, clone its HTML
    // Links open in same page, and place in results.
    displaySearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result">
                    <div class="no-results">
                        <p>No results found for "${this.escapeHtml(query)}"</p>
                        <p class="search-tip">Try different keywords or check spelling</p>
                    </div>
                </div>
            `;
            return;
        }

        const fragments = results.map(res => {
            const clonedMarkup = this.cloneSectionMarkup(res);
            const label = this.resultLabel(res);
            const titleHighlighted = this.highlightMatches(this.escapeHtml(res.title), query);

            // Fallback small header if clone not found
            const header = `
                <div class="result-type">
                    <i class="${label.icon}"></i>
                    <span>${label.text}</span>
                </div>
                <h4 class="result-title">${titleHighlighted}</h4>
            `;

            return `
                <div class="search-result" data-action="${this.escapeHtml(res.action)}">
                    ${header}
                    ${clonedMarkup || this.buildMetaFallback(res)}
                </div>
            `;
        }).join('');

        searchResults.innerHTML = fragments;
    }

    resultLabel(res) {
        if (res.type === 'publication') return { icon: 'fas fa-file-alt', text: this.ucfirst(res.category.replace('journals','Journal Articles').replace('conferences','Conference Papers').replace('books','Books & Chapters')) };
        if (res.type === 'talk') return { icon: 'fas fa-microphone', text: 'Talk' };
        if (res.type === 'blog') return { icon: 'fas fa-blog', text: 'Blog Post' };
        return { icon: 'fas fa-search', text: 'Result' };
    }

    // Try to locate the rendered list item in the respective section and clone its HTML.
    cloneSectionMarkup(res) {
        // Ensure source lists are rendered
        // Publications lists are rendered on init in main.js
        // Talks/blog are also rendered on init in main.js
        
        let selector = '';
        if (res.type === 'publication') {
            const idSel = `[data-id="${CSS.escape(res.id)}"]`;
            if (res.category === 'conferences') selector = `#acc-conf .pub-list ${idSel}`;
            if (res.category === 'journals')   selector = `#acc-journals .pub-list ${idSel}`;
            if (res.category === 'books')      selector = `#acc-books .pub-list ${idSel}`;
        } else if (res.type === 'talk') {
            // talks do not have data-id in the template, match by title text
            const all = document.querySelectorAll('#acc-talks .talk-list .talk-item');
            for (const li of all) {
                const t = li.querySelector('.talk-title');
                if (t && t.textContent.trim().toLowerCase() === (res.title || '').trim().toLowerCase()) {
                    // Clean links to open in same page
                    const copy = li.cloneNode(true);
                    copy.querySelectorAll('a[target]').forEach(a => a.removeAttribute('target'));
                    return `<div class="cloned-item">${copy.outerHTML}</div>`;
                }
            }
            return '';
        } else if (res.type === 'blog') {
            const idSel = `[data-id="${CSS.escape(res.id)}"]`;
            selector = `#acc-blog .blog-list ${idSel}`;
        }

        if (!selector) return '';

        const node = document.querySelector(selector);
        if (!node) return '';

        const clone = node.cloneNode(true);
        // Ensure all links open in same page
        clone.querySelectorAll('a[target]').forEach(a => a.removeAttribute('target'));

        return `<div class="cloned-item">${clone.outerHTML}</div>`;
    }

    buildMetaFallback(res) {
        // Minimal fallback if the clone could not be found
        if (res.type === 'publication') {
            const meta = [
                this.escapeHtml(res.authors || ''),
                this.escapeHtml(res.venue || ''),
                this.escapeHtml(String(res.year || ''))
            ].filter(Boolean).join(' • ');
            return `<p class="result-meta">${meta}</p>`;
        }
        if (res.type === 'talk') {
            const d = res.date ? new Date(res.date).toLocaleDateString() : '';
            return `<p class="result-meta">${this.escapeHtml(res.event || '')}${d ? ' • ' + this.escapeHtml(d) : ''}</p>`;
        }
        if (res.type === 'blog') {
            const d = res.date ? new Date(res.date).toLocaleDateString() : '';
            const ex = this.truncateText(this.escapeHtml(res.excerpt || ''), 120);
            return `<p class="result-meta">${d}</p><p class="result-excerpt">${ex}</p>`;
        }
        return '';
    }

    highlightMatches(text, query) {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        let out = text;
        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
            out = out.replace(regex, '<mark>$1</mark>');
        });
        return out;
    }

    truncateText(text, maxLength) {
        if ((text || '').length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    escapeHtml(s) {
        return String(s)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    }

    ucfirst(s) {
        if (!s) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    handleSearchResultClick(action) {
        // action pattern: "<category>-<id>"
        const [rawCategory, id] = action.split('-', 2);

        // Map subcategory to top-level section id to avoid blank pages
        // publications: conferences|journals|books -> 'publications'
        // talks -> 'talks'
        // blog -> 'blog'
        const sectionMap = {
            conferences: 'publications',
            journals: 'publications',
            books: 'publications',
            talks: 'talks',
            blog: 'blog'
        };

        const sectionId = sectionMap[rawCategory] || rawCategory;

        if (window.academicWebsite) {
            window.academicWebsite.navigateToSection(sectionId);
        }

        // After navigating, scroll to the original item in its list
        setTimeout(() => {
            let target = null;

            if (rawCategory === 'conferences') {
                target = document.querySelector(`#acc-conf .pub-list [data-id="${CSS.escape(id)}"]`);
            } else if (rawCategory === 'journals') {
                target = document.querySelector(`#acc-journals .pub-list [data-id="${CSS.escape(id)}"]`);
            } else if (rawCategory === 'books') {
                target = document.querySelector(`#acc-books .pub-list [data-id="${CSS.escape(id)}"]`);
            } else if (rawCategory === 'talks') {
                // No data-id on talks items; match by title text if possible
                // Find the highlighted card title in the search result that was clicked
                // or fallback to first title match
                const searchCard = document.querySelector(`.search-result[data-action="${CSS.escape(action)}"]`);
                const titleEl = searchCard ? searchCard.querySelector('.talk-title') : null;
                const titleText = titleEl ? titleEl.textContent.trim().toLowerCase() : null;
                const items = document.querySelectorAll('#acc-talks .talk-list .talk-item');
                for (const li of items) {
                    const t = li.querySelector('.talk-title');
                    if (t && (!titleText || t.textContent.trim().toLowerCase() === titleText)) {
                        target = li;
                        break;
                    }
                }
            } else if (rawCategory === 'blog') {
                target = document.querySelector(`#acc-blog .blog-list [data-id="${CSS.escape(id)}"]`);
            }

            if (target) {
                // Ensure the containing accordion is open so scrolling works
                const acc = target.closest('.accordion');
                if (acc && !acc.classList.contains('open')) {
                    acc.classList.add('open');
                    const header = acc.querySelector('.acc-header');
                    if (header) header.setAttribute('aria-expanded', 'true');
                }

                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('search-highlight');
                setTimeout(() => target.classList.remove('search-highlight'), 3000);
            }
        }, 400);
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SearchEngine();
});

// Add search result styling
const searchStyles = `
    .search-result {
        transition: background-color 0.2s ease;
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
    }
    .search-result:last-child { border-bottom: 0; }

    .search-result:hover {
        background: var(--bg-secondary);
    }
    
    .result-type {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }
    
    .result-title {
        margin: 0 0 0.25rem 0;
        color: var(--text-primary);
        font-size: 1rem;
        font-weight: 600;
    }
    
    .result-title mark {
        background: #fef3c7;
        color: #92400e;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
    }
    
    .result-meta {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0.25rem 0 0.5rem 0;
    }
    
    .result-excerpt {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.4;
    }
    
    .no-results {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary);
    }
    
    .search-tip {
        font-size: 0.875rem;
        opacity: 0.8;
    }
    
    .search-highlight {
        background: rgba(59, 130, 246, 0.1) !important;
        border: 2px solid var(--primary-color) !important;
        border-radius: 0.5rem !important;
        transition: all 0.3s ease !important;
    }

    /* ensure cloned list items look natural inside results */
    .cloned-item .pub-item,
    .cloned-item .talk-item,
    .cloned-item .blog-item {
        list-style: none;
        margin: 0;
    }
    
    body.theme-dark .result-title mark {
        background: #451a03;
        color: #fbbf24;
    }
`;

// Inject search styles
const styleSheet = document.createElement('style');
styleSheet.textContent = searchStyles;
document.head.appendChild(styleSheet);

