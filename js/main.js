// js/main.js

// Attribution: If you reuse or adapt this template, please credit
// "Based on the personal website of Dr. Nguimeya Tematio Gaël-Pacôme"

class AcademicWebsite {
    constructor() {
        this.currentSection = 'home';
        this.data = {};
        this.init();
    }
    
    // Initialize website features and UI setup
    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.setupNavigation();
            this.setupThemeToggle();
            this.renderDynamicContent();
            this.setupMobileMenu();
            this.setupScrollEffects();
        } catch (error) {
            // console.error('Initialization error:', error);
        }
    }

    // Load JSON data for config, publications, talks, blog, teaching, and tutorials
    async loadData() {
        const defaultData = {
            config: { theme: 'light' },
            conferences: [],
            journals: [],
            books: [],
            talks: [],
            blog: [],
            courses: [],
            tutoring: [],
            mentoring: [],
            tutorials: []
        };

        try {
            // console.log('Starting to load data...');
            
            const fetchWithErrorHandling = async (url) => {
                // console.log(`Fetching: ${url}`);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    // console.warn(`Response from ${url} is not JSON:`, contentType);
                }
                
                const data = await response.json();
                // console.log(`Successfully loaded data from ${url}:`, data);
                return data;
            };

            const [
                configData,
                conferencesData,
                journalsData,
                booksData,
                talksData,
                blogData,
                coursesData,
                tutoringData,
                mentoringData,
                tutorialsData
            ] = await Promise.allSettled([
                fetchWithErrorHandling(`data/config.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/conferences.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/journals.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/books.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/talks.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/blog.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/courses.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/tutoring.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/mentoring.json?v=${Date.now()}`),
                fetchWithErrorHandling(`data/tutorials.json?v=${Date.now()}`)
            ]);

            this.data = {
                config: configData.status === 'fulfilled' ? configData.value : defaultData.config,
                conferences: conferencesData.status === 'fulfilled' ? conferencesData.value : defaultData.conferences,
                journals: journalsData.status === 'fulfilled' ? journalsData.value : defaultData.journals,
                books: booksData.status === 'fulfilled' ? booksData.value : defaultData.books,
                talks: talksData.status === 'fulfilled' ? talksData.value : defaultData.talks,
                blog: blogData.status === 'fulfilled' ? blogData.value : defaultData.blog,
                courses: coursesData.status === 'fulfilled' ? coursesData.value : defaultData.courses,
                tutoring: tutoringData.status === 'fulfilled' ? tutoringData.value : defaultData.tutoring,
                mentoring: mentoringData.status === 'fulfilled' ? mentoringData.value : defaultData.mentoring,
                tutorials: tutorialsData.status === 'fulfilled' ? tutorialsData.value : defaultData.tutorials
            };
            
            // Log failed requests
            [
                ['config', configData],
                ['conferences', conferencesData],
                ['journals', journalsData],
                ['books', booksData],
                ['talks', talksData],
                ['blog', blogData],
                ['courses', coursesData],
                ['tutoring', tutoringData],
                ['mentoring', mentoringData],
                ['tutorials', tutorialsData]
            ].forEach(([name, result]) => {
                if (result.status === 'rejected') {
                    // console.error(`Failed to load ${name}.json:`, result.reason);
                }
            });

            // console.log('Final loaded data:', this.data);
            
        } catch (error) {
            // console.error('Error loading data:', error);
            this.data = defaultData;
        }
    }
    
    // Setup event listeners for navigation and interactions
    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                if (target !== this.currentSection) {
                    this.navigateToSection(target);
                }
            });
        });
        
        // Handle mailto links: always copy email to clipboard, then try to open default email client
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();

                // Extract the plain email from the mailto href
                const href = link.getAttribute('href') || '';
                const match = href.match(/^mailto:([^?]+)/i);
                const email = match ? decodeURIComponent(match[1]) : 'pacome.nguimeya@aims-cameroon.org';

                // Copy to clipboard with a fallback for older browsers
                const copyFallback = (text) => {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'absolute';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch (_) {}
                    document.body.removeChild(ta);
                };

                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(email);
                    } else {
                        copyFallback(email);
                    }
                } catch (_) {
                    copyFallback(email);
                }
                
                // Uncomment if you want a quick notice
                // alert('Email copied to clipboard');
                
                // Attempt to open the user's default email client
                window.location.href = href;
            });
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const section = (e.state && e.state.section)
                ? e.state.section
                : (location.hash ? location.hash.slice(1) : 'home');

            this.showSection(section);
            this.updateActiveNavLink(section);

            // close mobile menu if open
            const navMenu = document.getElementById('navMenu');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Initialize navigation: set default section and URL
    setupNavigation() {
        // Set initial state
        this.updateURL('home');
        this.showSection('home');
    }

    // Handle navigation to a given section and update URL + active state
    navigateToSection(sectionId) {
        this.showSection(sectionId);
        this.updateURL(sectionId);
        this.updateActiveNavLink(sectionId);

        // Close mobile menu if open
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    }
    
    // Show a specific section and apply fade-in animation
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            // Add animation
            targetSection.classList.add('fade-in');
            setTimeout(() => {
                targetSection.classList.remove('fade-in');
            }, 600);
        }
    }

    // Update the browser URL with the current section
    updateURL(sectionId) {
        const newURL = `${window.location.pathname}#${sectionId}`;
        window.history.pushState({ section: sectionId }, '', newURL);
    }

    // Highlight the active navigation link
    updateActiveNavLink(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Setup light/dark theme toggle and persist choice
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;

        if (!themeToggle) return;

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.className = `theme-${savedTheme}`;
        this.updateThemeIcon(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            body.className = `theme-${newTheme}`;
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }
    
    // Update the theme toggle icon (sun for dark, moon for light)
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
    
    // Render dynamic sections: publications, talks, teaching, tutorials, blog
    renderDynamicContent() {
        this.renderPublications();
        this.renderTalks();
        this.renderTeaching();
        this.renderTutorials();
        this.renderBlog();
    }
    
    // Publications JavaScript Methods //
    
    renderPublications() {
        // Controls
        this.$controls = document.getElementById('pubControls');
        this.$datesBtn = document.getElementById('pubTabDates');
        this.$datesMenu = document.getElementById('pubDatesMenu');

        // Accordions
        this.$accConf = document.getElementById('acc-conf');
        this.$accJourn = document.getElementById('acc-journals');
        this.$accBooks = document.getElementById('acc-books');

        // Lists INSIDE panels
        this.$confList = document.querySelector('#acc-conf .pub-list');
        this.$journalList = document.querySelector('#acc-journals .pub-list');
        this.$bookList = document.querySelector('#acc-books .pub-list');

        // Check if required elements exist
        if (!this.$controls || !this.$datesBtn || !this.$datesMenu) {
            // console.error('Required publication UI elements not found');
            return;
        }

        // State
        this.pubView = 'all'; // all | conferences | journals | books
        this.pubYear = null; // null = all years

        // Years collected from whatever data exists
        const years = new Set();
        
        // Safely extract years - handle both array and object formats
        const extractYears = (dataArray, dataType) => {
            if (!Array.isArray(dataArray)) {
                // console.warn(`Expected array for ${dataType}, got:`, typeof dataArray);
                return;
            }
            
            dataArray.forEach(item => {
                if (item && typeof item.year !== 'undefined') {
                    const year = parseInt(item.year, 10);
                    if (!isNaN(year)) {
                        years.add(year);
                    }
                } else {
                    // console.warn(`Item in ${dataType} missing year:`, item);
                }
            });
        };

        extractYears(this.data.conferences || [], 'conferences');
        extractYears(this.data.journals || [], 'journals');
        extractYears(this.data.books || [], 'books');

        this.pubYears = Array.from(years).sort((a, b) => b - a);
        // console.log('Extracted publication years:', this.pubYears);

        this.buildDatesMenu();
        this.bindPublicationUI();
        this.renderPublicationsList();
    }

    buildDatesMenu() {
        if (!this.$datesMenu || !this.$datesBtn) return;

        const items = [
            `<button type="button" data-year="">All years</button>`,
            ...this.pubYears.map(y => `<button type="button" data-year="${y}">${y}</button>`)
        ].join('');

        this.$datesMenu.innerHTML = items;
        // console.log('Built dates menu with items:', this.pubYears);

        // Toggle dropdown and visual active state
        this.$datesBtn.addEventListener('click', () => {
            const open = this.$datesMenu.style.display === 'block';
            this.$datesMenu.style.display = open ? 'none' : 'block';
            this.$datesBtn.classList.toggle('active', !open);
            this.$datesBtn.setAttribute('aria-expanded', String(!open));
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.$datesMenu.contains(e.target) && !this.$datesBtn.contains(e.target)) {
                this.$datesMenu.style.display = 'none';
                this.$datesBtn.classList.remove('active');
                this.$datesBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Year selection
        this.$datesMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-year]');
            if (!btn) return;

            const val = btn.getAttribute('data-year');
            this.pubYear = val ? parseInt(val, 10) : null;
            
            this.$datesMenu.style.display = 'none';
            this.$datesBtn.classList.remove('active');
            this.$datesBtn.setAttribute('aria-expanded', 'false');
            
            // console.log('Selected year:', this.pubYear);
            
            // Auto-expand accordions when date is selected and render immediately
            if (this.pubYear && this.$accConf && this.$accJourn && this.$accBooks) {
                [this.$accConf, this.$accJourn, this.$accBooks].forEach(acc => {
                    acc.classList.add('open');
                    const header = acc.querySelector('.acc-header');
                    if (header) header.setAttribute('aria-expanded', 'true');
                });
            }
            
            // Render the filtered lists immediately
            this.renderPublicationsList();
        });
    }

    bindPublicationUI() {
        if (!this.$controls) return;

        // View tabs
        this.$controls.querySelectorAll('.pub-tab[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.$controls.querySelectorAll('.pub-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.pubView = btn.dataset.view;
                // console.log('Changed view to:', this.pubView);

                // when "All" is clicked, clear year filter and collapse accordions
                if (this.pubView === 'all') {
                    // clear any year filter
                    this.pubYear = null;

                    // collapse all accordions to default state
                    [this.$accConf, this.$accJourn, this.$accBooks].forEach(acc => {
                        if (acc) {
                            acc.classList.remove('open', 'static');
                            const header = acc.querySelector('.acc-header');
                            if (header) header.setAttribute('aria-expanded', 'false');
                        }
                    });

                    // ensure the dates dropdown is closed and not marked active
                    if (this.$datesMenu) this.$datesMenu.style.display = 'none';
                    if (this.$datesBtn) this.$datesBtn.classList.remove('active');
                }

                this.applyPublicationView();
            });
        });

        // In "all" view, render the full list when a panel is opened
        const hook = (accEl, renderFn) => {
            if (!accEl) return;
            const header = accEl.querySelector('.acc-header');
            if (header) {
                header.addEventListener('click', () => {
                    if (this.pubView !== 'all') return;
                    // Delay to let the global toggle add .open
                    setTimeout(() => {
                        if (accEl.classList.contains('open')) {
                            renderFn(); // Render full list when opened
                        }
                    }, 0);
                });
            }
        };

        hook(this.$accConf, () => this.renderList('conferences', this.$confList));
        hook(this.$accJourn, () => this.renderList('journals', this.$journalList));
        hook(this.$accBooks, () => this.renderList('books', this.$bookList));
    }

    applyPublicationView() {
        const show = el => {
            if (el) el.style.display = '';
        };
        const hide = el => {
            if (el) el.style.display = 'none';
        };

        if (this.pubView === 'all') {
            // Show all accordions
            show(this.$accConf);
            show(this.$accJourn);
            show(this.$accBooks);
            
            // Render lists immediately
            this.renderPublicationsList();
        } else {
            // Single category view: show one, expand, make static, and render immediately
            const map = {
                    conferences: [this.$accConf, () => this.renderList('conferences', this.$confList)],
                    journals: [this.$accJourn, () => this.renderList('journals', this.$journalList)],
                    books: [this.$accBooks, () => this.renderList('books', this.$bookList)]
            };

            Object.entries(map).forEach(([k, [acc]]) => {
                if (!acc) return;
                if (k === this.pubView) {
                    show(acc);
                } else {
                    hide(acc);
                }
            });

            const entry = map[this.pubView];
            if (entry) {
                const [accEl, renderFn] = entry;
                if (accEl) {
                    accEl.classList.add('static', 'open');
                    const header = accEl.querySelector('.acc-header');
                    if (header) header.setAttribute('aria-expanded', 'true');
                    renderFn();
                }
            }
        }
    }

    renderPublicationsList() {
        // Render all three lists
        this.renderList('conferences', this.$confList);
        this.renderList('journals', this.$journalList);
        this.renderList('books', this.$bookList);
    }

    renderList(kind, targetEl) {
        if (!targetEl) {
            // console.warn(`Target element for ${kind} not found`);
            return;
        }

        const src = this.data[kind] || [];
        // console.log(`Rendering ${kind}:`, src);
        
        if (!Array.isArray(src)) {
            // console.error(`Data for ${kind} is not an array:`, src);
            targetEl.innerHTML = `<li class="pub-item"><div class="pub-meta">Invalid data format for ${kind}.</div></li>`;
            return;
        }

        // Handle empty data or missing files
        if (src.length === 0) {
            const emptyMessages = {
                conferences: 'No entries available yet. Stay tuned!',
                journals: 'No entries available yet. Stay tuned!',
                books: 'No entries available yet. Stay tuned!'
            };
            targetEl.innerHTML = `<li class="pub-item"><div class="pub-meta">${emptyMessages[kind]}</div></li>`;
            return;
        }

        const filtered = this.pubYear ? 
            src.filter(x => x.year && parseInt(x.year, 10) === this.pubYear) : 
            src;

        // console.log(`Filtered ${kind} (year: ${this.pubYear}):`, filtered);

        if (filtered.length === 0) {
            const message = this.pubYear ? 
                `No entries available for ${this.pubYear}.` : 
                'No entries available.';
            targetEl.innerHTML = `<li class="pub-item"><div class="pub-meta">${message}</div></li>`;
            return;
        }

        targetEl.innerHTML = filtered.map(item => {
            const safeProp = (prop) => item[prop] || '';
            const safeArray = (prop) => Array.isArray(item[prop]) ? item[prop] : [];
            
            return `<li class="pub-item" data-id="${safeProp('id')}">
                <div class="pub-title">${safeProp('title')}</div>
                <div class="pub-meta">${safeArray('authors').join(', ')} • ${safeProp('venue')} (${safeProp('year')})</div>
                <div class="pub-links">
                    ${safeProp('pdf') ? `<a href="${safeProp('pdf')}" target="_blank"><i class="fas fa-file-pdf"></i> PDF</a>` : ''}
                    ${safeProp('doi') ? `<a href="${safeProp('doi')}" target="_blank"><i class="fas fa-external-link-alt"></i> DOI</a>` : ''}
                    ${safeProp('code') ? `<a href="${safeProp('code')}" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
                    ${safeProp('slides') ? `<a href="${safeProp('slides')}" target="_blank"><i class="fas fa-clapperboard"></i> Slides</a>` : ''}
                    ${safeProp('video') ? `<a href="${safeProp('video')}" target="_blank"><i class="fas fa-video"></i> Video</a>` : ''}
                    ${safeProp('poster') ? `<a href="${safeProp('poster')}" target="_blank"><i class="fas fa-image"></i> Poster</a>` : ''}
                    ${safeProp('bibtex') ? `<a href="#" class="js-copy-bibtex" data-bibtex="${encodeURIComponent(safeProp('bibtex'))}"><i class="fas fa-quote-right"></i> BibTeX</a>` : ''}
                </div>
            </li>`;
        }).join('');

        // Copy-to-clipboard for BibTeX and prevent page jump
        targetEl.onclick = (ev) => {
            const link = ev.target.closest('.js-copy-bibtex');
            if (!link) return;
            ev.preventDefault();
            try {
                const bib = decodeURIComponent(link.getAttribute('data-bibtex') || '');
                navigator.clipboard.writeText(bib);
            } catch (err) {
                // console.error('Failed to copy BibTeX:', err);
            }
        };
    }
    
    // Talks JavaScript Methods //
    
    renderTalks() {
        // Controls
        this.$talkControls = document.getElementById('talkControls');
        this.$talkDatesBtn = document.getElementById('talkTabDates');
        this.$talkDatesMenu = document.getElementById('talkDatesMenu');

        // Accordion
        this.$accTalks = document.getElementById('acc-talks');

        // List INSIDE panel
        this.$talksList = document.querySelector('#acc-talks .talk-list');

        // Check if required elements exist
        if (!this.$talkControls || !this.$talkDatesBtn || !this.$talkDatesMenu) {
            // console.error('Required talk UI elements not found');
            return;
        }

        // State
        this.talkView = 'all';
        this.talkYear = null;

        // Extract years from talks data
        const years = new Set();
        const talks = this.data.talks || [];
        
        talks.forEach(talk => {
            if (talk && talk.date) {
                const dateYear = new Date(talk.date).getFullYear();
                if (!isNaN(dateYear)) {
                    years.add(dateYear);
                }
            }
        });

        this.talkYears = Array.from(years).sort((a, b) => b - a);
        // console.log('Extracted talk years:', this.talkYears);

        this.buildTalkDatesMenu();
        this.bindTalkUI();
        this.renderTalksList();
    }

    buildTalkDatesMenu() {
        if (!this.$talkDatesMenu || !this.$talkDatesBtn) return;

        const items = [
            `<button type="button" data-year="">All years</button>`,
            ...this.talkYears.map(y => `<button type="button" data-year="${y}">${y}</button>`)
        ].join('');

        this.$talkDatesMenu.innerHTML = items;

        // Toggle dropdown
        this.$talkDatesBtn.addEventListener('click', () => {
            const open = this.$talkDatesMenu.style.display === 'block';
            this.$talkDatesMenu.style.display = open ? 'none' : 'block';
            this.$talkDatesBtn.classList.toggle('active', !open);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.$talkDatesMenu.contains(e.target) && !this.$talkDatesBtn.contains(e.target)) {
                this.$talkDatesMenu.style.display = 'none';
                this.$talkDatesBtn.classList.remove('active');
            }
        });

        // Year selection
        this.$talkDatesMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-year]');
            if (!btn) return;

            const val = btn.getAttribute('data-year');
            this.talkYear = val ? parseInt(val, 10) : null;
            
            this.$talkDatesMenu.style.display = 'none';
            this.$talkDatesBtn.classList.remove('active');
            
            // console.log('Selected talk year:', this.talkYear);
            
            // Auto-expand accordion when date is selected and render immediately
            if (this.talkYear && this.$accTalks) {
                this.$accTalks.classList.add('open');
                const header = this.$accTalks.querySelector('.acc-header');
                if (header) header.setAttribute('aria-expanded', 'true');
            }
            
            // Render the filtered list immediately
            this.renderTalksList();
        });
    }

    bindTalkUI() {
        // This handles the "All" button and future filter buttons
        if (!this.$talkControls) return;

        this.$talkControls.querySelectorAll('.talk-tab[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.$talkControls.querySelectorAll('.talk-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.talkView = btn.dataset.view;

                // when "All" is clicked, clear year filter and collapse the main accordion
                if (this.talkView === 'all') {
                    // clear any year filter
                    this.talkYear = null;

                    // collapse the accordion wrapper to default state
                    if (this.$accTalks) {
                        this.$accTalks.classList.remove('open');
                        const header = this.$accTalks.querySelector('.acc-header');
                        if (header) header.setAttribute('aria-expanded', 'false');
                    }

                    // ensure the dates dropdown is closed and not marked active
                    if (this.$talkDatesMenu) this.$talkDatesMenu.style.display = 'none';
                    if (this.$talkDatesBtn) this.$talkDatesBtn.classList.remove('active');
                }

                this.renderTalksList();
            });
        });
    }

    renderTalksList() {
        const talksList = document.getElementById('talksList');
        if (!talksList) {
            // console.warn('talksList element not found');
            return;
        }

        const talks = this.data.talks || [];
        // console.log('Rendering talks with full data:', talks);

        if (!Array.isArray(talks)) {
            // console.error('Talks data is not an array:', talks);
            talksList.innerHTML = `<li class="talk-item"><div class="talk-meta">Invalid data format for talks.</div></li>`;
            return;
        }

        // Handle empty data
        if (talks.length === 0) {
            const emptyMessages = {
                talks: 'No entries available yet. Stay tuned!',
            };
            talksList.innerHTML = `<li class="talk-item"><div class="talk-meta">${emptyMessages.talks}</div></li>`;
            return;
        }

        // Filter by year if selected
        const filtered = this.talkYear ? 
            talks.filter(x => {
                if (x.date) {
                    const dateYear = new Date(x.date).getFullYear();
                    return dateYear === this.talkYear;
                }
                return false;
            }) : 
            talks;

        // console.log(`Filtered talks (year: ${this.talkYear}):`, filtered);

        if (filtered.length === 0) {
            const message = this.talkYear ? 
                `No talks available for ${this.talkYear}.` : 
                'No talks available.';
            talksList.innerHTML = `<li class="talk-item"><div class="talk-meta">${message}</div></li>`;
            return;
        }
        
        talksList.innerHTML = filtered.map(talk => {
            const safeProp = (prop) => talk[prop] || '';
            
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                try {
                    return new Date(dateStr).toLocaleDateString();
                } catch (e) {
                    return dateStr;
                }
            };
            
            // Enhanced materials handling - supports arrays of strings or objects
            const renderMaterialsLinks = (materials) => {
                if (!materials) return '';
                
                const mats = Array.isArray(materials) ? materials : [materials];
                const linksHtml = mats.map((m, i) => {
                    const href = typeof m === "string" ? m : m.href;
                    const label = typeof m === "string"
                        ? `Materials${mats.length > 1 ? ` ${i + 1}` : ""}`
                        : (m.label || "Materials");
                    return `<a href="${href}" target="_blank"><i class="fas fa-folder-open"></i> ${label}</a>`;
                }).join(' ');
                return linksHtml;
            };
            
            return `<li class="talk-item">
                <div class="talk-card">
                    <h3 class="talk-title">${safeProp('title')}</h3>
                    <div class="talk-meta">${safeProp('event')} (${formatDate(safeProp('date'))})</div>
                    ${safeProp('description') ? `<p class="talk-description">${safeProp('description')}</p>` : ''}
                    <div class="talk-links">
                        ${renderMaterialsLinks(talk.materials)}
                        ${safeProp('slides') ? `<a href="${safeProp('slides')}" target="_blank"><i class="fas fa-presentation"></i> Slides</a>` : ''}
                        ${safeProp('video') ? `<a href="${safeProp('video')}" target="_blank"><i class="fas fa-video"></i> Video</a>` : ''}
                        ${safeProp('abstract') ? `<a href="${safeProp('abstract')}" target="_blank"><i class="fas fa-file-text"></i> Abstract</a>` : ''}
                        ${safeProp('pdf') ? `<a href="${safeProp('pdf')}" target="_blank"><i class="fas fa-file-pdf"></i> PDF</a>` : ''}
                        ${safeProp('poster') ? `<a href="${safeProp('poster')}" target="_blank"><i class="fas fa-image"></i> Poster</a>` : ''}
                        ${safeProp('website') ? `<a href="${safeProp('website')}" target="_blank"><i class="fas fa-globe"></i> Website</a>` : ''}
                    </div>
                </div>
            </li>`;
        }).join('');
    }
    
    // Teaching JavaScript Methods //

    renderTeaching() {
        // Controls
        this.$teachControls = document.getElementById('teachControls');
        this.$teachDatesBtn = document.getElementById('teachTabDates');
        this.$teachDatesMenu = document.getElementById('teachDatesMenu');

        // Accordions
        this.$accCourses = document.getElementById('acc-courses');
        this.$accTutoring = document.getElementById('acc-tutoring');
        this.$accMentoring = document.getElementById('acc-mentoring');

        // Lists INSIDE panels
        this.$coursesList = document.querySelector('#acc-courses .teach-list');
        this.$tutoringList = document.querySelector('#acc-tutoring .teach-list');
        this.$mentoringList = document.querySelector('#acc-mentoring .teach-list');

        // Check if required elements exist
        if (!this.$teachControls || !this.$teachDatesBtn || !this.$teachDatesMenu) {
            // console.error('Required teaching UI elements not found');
            return;
        }

        // State
        this.teachView = 'all'; // all | courses | tutoring | mentoring
        this.teachYear = null; // null = all years

        // Years collected from whatever data exists
        const years = new Set();
        
        // Safely extract years - handle both array and object formats
        const extractTeachingYears = (dataArray, dataType) => {
            if (!Array.isArray(dataArray)) {
                // console.warn(`Expected array for ${dataType}, got:`, typeof dataArray);
                return;
            }
            
            dataArray.forEach(item => {
                // Check for year field first
                if (item && typeof item.year !== 'undefined') {
                    const year = parseInt(item.year, 10);
                    if (!isNaN(year)) {
                        years.add(year);
                    }
                } 
                // Check for start_date field (e.g., "2024-01-15")
                else if (item && item.start_date) {
                    const dateYear = new Date(item.start_date).getFullYear();
                    if (!isNaN(dateYear)) {
                        years.add(dateYear);
                    }
                }
                // Check for date field as fallback
                else if (item && item.date) {
                    const dateYear = new Date(item.date).getFullYear();
                    if (!isNaN(dateYear)) {
                        years.add(dateYear);
                    }
                } else {
                    // console.warn(`Item in ${dataType} missing year/date:`, item);
                }
            });
        };

        extractTeachingYears(this.data.courses || [], 'courses');
        extractTeachingYears(this.data.tutoring || [], 'tutoring');
        extractTeachingYears(this.data.mentoring || [], 'mentoring');

        this.teachYears = Array.from(years).sort((a, b) => b - a);
        // console.log('Extracted teaching years:', this.teachYears);

        this.buildTeachingDatesMenu();
        this.bindTeachingUI();
        this.renderTeachingLists();
    }

    buildTeachingDatesMenu() {
        if (!this.$teachDatesMenu || !this.$teachDatesBtn) return;

        const items = [
            `<button type="button" data-year="">All years</button>`,
            ...this.teachYears.map(y => `<button type="button" data-year="${y}">${y}</button>`)
        ].join('');

        this.$teachDatesMenu.innerHTML = items;
        // console.log('Built teaching dates menu with items:', this.teachYears);

        // Toggle dropdown and visual active state
        this.$teachDatesBtn.addEventListener('click', () => {
            const open = this.$teachDatesMenu.style.display === 'block';
            this.$teachDatesMenu.style.display = open ? 'none' : 'block';
            this.$teachDatesBtn.classList.toggle('active', !open);
            this.$teachDatesBtn.setAttribute('aria-expanded', String(!open));
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.$teachDatesMenu.contains(e.target) && !this.$teachDatesBtn.contains(e.target)) {
                this.$teachDatesMenu.style.display = 'none';
                this.$teachDatesBtn.classList.remove('active');
                this.$teachDatesBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Year selection
        this.$teachDatesMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-year]');
            if (!btn) return;

            const val = btn.getAttribute('data-year');
            this.teachYear = val ? parseInt(val, 10) : null;
            
            this.$teachDatesMenu.style.display = 'none';
            this.$teachDatesBtn.classList.remove('active');
            this.$teachDatesBtn.setAttribute('aria-expanded', 'false');
            
            // console.log('Selected teaching year:', this.teachYear);
            
            // Auto-expand accordions when date is selected and render immediately
            if (this.teachYear && this.$accCourses && this.$accTutoring && this.$accMentoring) {
                [this.$accCourses, this.$accTutoring, this.$accMentoring].forEach(acc => {
                    acc.classList.add('open');
                    const header = acc.querySelector('.acc-header');
                    if (header) header.setAttribute('aria-expanded', 'true');
                });
            }
            
            // Render the filtered lists immediately
            this.renderTeachingLists();
        });
    }

    bindTeachingUI() {
        if (!this.$teachControls) return;

        // View tabs
        this.$teachControls.querySelectorAll('.teach-tab[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.$teachControls.querySelectorAll('.teach-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.teachView = btn.dataset.view;
                // console.log('Changed teaching view to:', this.teachView);

                // when "All" is clicked, clear year filter and collapse accordions
                if (this.teachView === 'all') {
                    // clear any year filter
                    this.teachYear = null;

                    // collapse all accordions to default state
                    [this.$accCourses, this.$accTutoring, this.$accMentoring].forEach(acc => {
                        if (acc) {
                            acc.classList.remove('open', 'static');
                            const header = acc.querySelector('.acc-header');
                            if (header) header.setAttribute('aria-expanded', 'false');
                        }
                    });

                    // ensure the dates dropdown is closed and not marked active
                    if (this.$teachDatesMenu) this.$teachDatesMenu.style.display = 'none';
                    if (this.$teachDatesBtn) this.$teachDatesBtn.classList.remove('active');
                }

                this.applyTeachingView();
            });
        });

        // In "all" view, render the list when a panel is opened
        const hook = (accEl, renderFn) => {
            if (!accEl) return;
            const header = accEl.querySelector('.acc-header');
            if (header) {
                header.addEventListener('click', () => {
                    if (this.teachView !== 'all') return;
                    // Delay to let the global toggle add .open
                    setTimeout(() => {
                        if (accEl.classList.contains('open')) {
                            renderFn();
                        }
                    }, 0);
                });
            }
        };

        hook(this.$accCourses, () => this.renderTeachingList('courses', this.$coursesList));
        hook(this.$accTutoring, () => this.renderTeachingList('tutoring', this.$tutoringList));
        hook(this.$accMentoring, () => this.renderTeachingList('mentoring', this.$mentoringList));
    }

    applyTeachingView() {
        const show = el => {
            if (el) el.style.display = '';
        };
        const hide = el => {
            if (el) el.style.display = 'none';
        };

        if (this.teachView === 'all') {
            // Show all accordions
            show(this.$accCourses);
            show(this.$accTutoring);
            show(this.$accMentoring);
            
            // Render lists immediately
            this.renderTeachingLists();
        } else {
            // Single category view: show one, expand, make static, and render immediately
            const map = {
                courses: [this.$accCourses, () => this.renderTeachingList('courses', this.$coursesList)],
                tutoring: [this.$accTutoring, () => this.renderTeachingList('tutoring', this.$tutoringList)],
                mentoring: [this.$accMentoring, () => this.renderTeachingList('mentoring', this.$mentoringList)]
            };

            Object.entries(map).forEach(([k, [acc]]) => {
                if (!acc) return;
                if (k === this.teachView) {
                    show(acc);
                } else {
                    hide(acc);
                }
            });

            const entry = map[this.teachView];
            if (entry) {
                const [accEl, renderFn] = entry;
                if (accEl) {
                    accEl.classList.add('static', 'open');
                    const header = accEl.querySelector('.acc-header');
                    if (header) header.setAttribute('aria-expanded', 'true');
                    renderFn();
                }
            }
        }
    }

    renderTeachingLists() {
        // Render all three lists
        this.renderTeachingList('courses', this.$coursesList);
        this.renderTeachingList('tutoring', this.$tutoringList);
        this.renderTeachingList('mentoring', this.$mentoringList);
    }

    renderTeachingList(kind, targetEl) {
        if (!targetEl) {
            // console.warn(`Target element for ${kind} not found`);
            return;
        }

        const src = this.data[kind] || [];
        // console.log(`Rendering ${kind}:`, src);
        
        if (!Array.isArray(src)) {
            // console.error(`Data for ${kind} is not an array:`, src);
            targetEl.innerHTML = `<li class="teach-item"><div class="teach-meta">Invalid data format for ${kind}.</div></li>`;
            return;
        }

        // Handle empty data or missing files
        if (src.length === 0) {
            const emptyMessages = {
                courses: 'No entries available yet. Stay tuned!',
                tutoring: 'No entries available yet. Stay tuned!',
                mentoring: 'No entries available yet. Stay tuned!'
            };
            targetEl.innerHTML = `<li class="teach-item"><div class="teach-meta">${emptyMessages[kind]}</div></li>`;
            return;
        }

        // Filter by year if selected
        const filtered = this.teachYear ? 
            src.filter(x => {
                // Check year field first
                if (x.year && parseInt(x.year, 10) === this.teachYear) return true;
                // Check start_date field
                if (x.start_date) {
                    const dateYear = new Date(x.start_date).getFullYear();
                    return dateYear === this.teachYear;
                }
                // Check date field as fallback
                if (x.date) {
                    const dateYear = new Date(x.date).getFullYear();
                    return dateYear === this.teachYear;
                }
                return false;
            }) : 
            src;

        // console.log(`Filtered ${kind} (year: ${this.teachYear}):`, filtered);

        if (filtered.length === 0) {
            const message = this.teachYear ? 
                `No entries available for ${this.teachYear}.` : 
                'No entries available.';
            targetEl.innerHTML = `<li class="teach-item"><div class="teach-meta">${message}</div></li>`;
            return;
        }

        targetEl.innerHTML = filtered.map(item => {
            const safeProp = (prop) => item[prop] || '';
            const safeArray = (prop) => Array.isArray(item[prop]) ? item[prop] : [];
            
            // Format date for display
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                try {
                    return new Date(dateStr).toLocaleDateString();
                } catch (e) {
                    return dateStr; // fallback to original string
                }
            };

            // Format date range
            const formatDateRange = (start, end) => {
                const startFormatted = formatDate(start);
                const endFormatted = formatDate(end);
                if (startFormatted && endFormatted) {
                    return `${startFormatted} - ${endFormatted}`;
                }
                return startFormatted || endFormatted;
            };

            // Enhanced materials handling - supports arrays of strings or objects
            const renderMaterialsLinks = (materials) => {
                if (!materials) return '';
                
                const mats = Array.isArray(materials) ? materials : [materials];
                const linksHtml = mats.map((m, i) => {
                    const href = typeof m === "string" ? m : m.href;
                    const label = typeof m === "string"
                        ? `Materials${mats.length > 1 ? ` ${i + 1}` : ""}`
                        : (m.label || "Materials");
                    return `<a href="${href}" target="_blank"><i class="fas fa-folder-open"></i> ${label}</a>`;
                }).join(' ');
                return linksHtml;
            };

            // Determine website link label based on subsection
            const getWebsiteLinkLabel = (kind) => {
                return kind === 'courses' ? 'Course Site' : 'Website';
            };
            
            return `<li class="teach-item" data-id="${safeProp('id')}">
                <div class="teach-card">
                    <h3 class="teach-title">${safeProp('title')}</h3>
                    <div class="teach-meta">
                        ${safeProp('institution')} 
                        ${safeProp('level') ? `• ${safeProp('level')}` : ''}
                        ${safeProp('year') ? `(${safeProp('year')})` : ''}
                        ${safeProp('start_date') || safeProp('end_date') ? `(${formatDateRange(safeProp('start_date'), safeProp('end_date'))})` : ''}
                        ${safeProp('date') ? `(${formatDate(safeProp('date'))})` : ''}
                    </div>
                    ${safeProp('description') ? `<p class="teach-description">${safeProp('description')}</p>` : ''}
                    ${safeProp('students') ? `<p class="teach-students">Students: ${safeProp('students')}</p>` : ''}
                    <div class="teach-links">
                        ${safeProp('syllabus') ? `<a href="${safeProp('syllabus')}" target="_blank"><i class="fas fa-file-alt"></i> Syllabus</a>` : ''}
                        ${renderMaterialsLinks(item.materials)}
                        ${safeProp('slides') ? `<a href="${safeProp('slides')}" target="_blank"><i class="fas fa-presentation"></i> Slides</a>` : ''}
                        ${safeProp('assignments') ? `<a href="${safeProp('assignments')}" target="_blank"><i class="fas fa-tasks"></i> Assignments</a>` : ''}
                        ${safeProp('website') ? `<a href="${safeProp('website')}" target="_blank"><i class="fas fa-globe"></i> ${getWebsiteLinkLabel(kind)}</a>` : ''}
                        ${safeProp('video') ? `<a href="${safeProp('video')}" target="_blank"><i class="fas fa-video"></i> Recordings</a>` : ''}
                        ${safeProp('certificate') ? `<a href="${safeProp('certificate')}" target="_blank"><i class="fas fa-certificate"></i> Certificate</a>` : ''}
                    </div>
                </div>
            </li>`;
        }).join('');
    }
    
    // Tutorials JavaScript Methods //

    renderTutorials() {
        // Controls
        this.$tutorialsControls = document.getElementById('tutorialsControls');
        this.$tutorialsTabDates = document.getElementById('tutorialsTabDates');
        this.$tutorialsTabDatesMenu = document.getElementById('tutorialsDatesMenu');

        // Accordion
        this.$accTutorials = document.getElementById('acc-tutorials');

        // List INSIDE panel
        this.$tutorialsList = document.querySelector('#acc-tutorials .tutorials-list');

        // Check if required elements exist
        if (!this.$tutorialsControls || !this.$tutorialsTabDates || !this.$tutorialsTabDatesMenu) {
            // console.error('Required tutorial UI elements not found');
            return;
        }

        // State
        this.tutorialsView = 'all';
        this.tutorialsYear = null;

        // Extract years from tutorials data
        const years = new Set();
        const tutorials = this.data.tutorials || [];
        
        tutorials.forEach(tutorial => {
            if (tutorial && tutorial.date) {
                const dateYear = new Date(tutorial.date).getFullYear();
                if (!isNaN(dateYear)) {
                    years.add(dateYear);
                }
            }
        });

        this.tutorialsYears = Array.from(years).sort((a, b) => b - a);
        // console.log('Extracted tutorial years:', this.tutorialsYears);

        this.buildTutorialsDatesMenu();
        this.bindTutorialsUI();
        this.renderTutorialsList();
    }

    buildTutorialsDatesMenu() {
        if (!this.$tutorialsTabDatesMenu || !this.$tutorialsTabDates) return;

        const items = [
            `<button type="button" data-year="">All years</button>`,
            ...this.tutorialsYears.map(y => `<button type="button" data-year="${y}">${y}</button>`)
        ].join('');

        this.$tutorialsTabDatesMenu.innerHTML = items;

        // Toggle dropdown
        this.$tutorialsTabDates.addEventListener('click', () => {
            const open = this.$tutorialsTabDatesMenu.style.display === 'block';
            this.$tutorialsTabDatesMenu.style.display = open ? 'none' : 'block';
            this.$tutorialsTabDates.classList.toggle('active', !open);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.$tutorialsTabDatesMenu.contains(e.target) && !this.$tutorialsTabDates.contains(e.target)) {
                this.$tutorialsTabDatesMenu.style.display = 'none';
                this.$tutorialsTabDates.classList.remove('active');
            }
        });

        // Year selection
        this.$tutorialsTabDatesMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-year]');
            if (!btn) return;

            const val = btn.getAttribute('data-year');
            this.tutorialsYear = val ? parseInt(val, 10) : null;
            
            this.$tutorialsTabDatesMenu.style.display = 'none';
            this.$tutorialsTabDates.classList.remove('active');
            
            // console.log('Selected tutorial year:', this.tutorialsYear);
            
            // Auto-expand accordion when date is selected and render immediately
            if (this.$accTutorials) {
                this.$accTutorials.classList.add('open');
                const header = this.$accTutorials.querySelector('.acc-header');
                if (header) header.setAttribute('aria-expanded', 'true');
                
                // Render the filtered list immediately
                this.renderTutorialsList();
            }
        });
    }

    bindTutorialsUI() {
        // This handles the "All" button and future filter buttons
        if (!this.$tutorialsControls) return;

        this.$tutorialsControls.querySelectorAll('.tutorials-tab[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.$tutorialsControls.querySelectorAll('.tutorials-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.tutorialsView = btn.dataset.view;

                // when "All" is clicked, clear year filter and collapse the main accordion
                if (this.tutorialsView === 'all') {
                    // clear any year filter
                    this.tutorialsYear = null;

                    // collapse the accordion wrapper to default state
                    if (this.$accTutorials) {
                        this.$accTutorials.classList.remove('open');
                        const header = this.$accTutorials.querySelector('.acc-header');
                        if (header) header.setAttribute('aria-expanded', 'false');
                    }

                    // ensure the dates dropdown is closed and not marked active
                    if (this.$tutorialsTabDatesMenu) this.$tutorialsTabDatesMenu.style.display = 'none';
                    if (this.$tutorialsTabDates) this.$tutorialsTabDates.classList.remove('active');
                }

                this.renderTutorialsList();
            });
        });
    }

    renderTutorialsList() {
        // Use the stored reference instead of getElementById
        if (!this.$tutorialsList) {
            // console.warn('tutorialsList element not found');
            return;
        }

        const tutorials = this.data.tutorials || [];
        // console.log('Rendering tutorials with full data:', tutorials);

        if (!Array.isArray(tutorials)) {
            // console.error('Tutorials data is not an array:', tutorials);
            this.$tutorialsList.innerHTML = `<li class="tutorials-item"><div class="tutorials-meta">Invalid data format for tutorials.</div></li>`;
            return;
        }

        // Handle empty data
        if (tutorials.length === 0) {
            const emptyMessages = {
                tutorials: 'Tutorials are in the works!',
            };
            this.$tutorialsList.innerHTML = `<li class="tutorials-item"><div class="tutorials-meta">${emptyMessages.tutorials}</div></li>`;
            return;
        }

        // Filter by year if selected
        const filtered = this.tutorialsYear ? 
            tutorials.filter(x => {
                if (x.date) {
                    const dateYear = new Date(x.date).getFullYear();
                    return dateYear === this.tutorialsYear;
                }
                return false;
            }) : 
            tutorials;

        // console.log(`Filtered tutorials (year: ${this.tutorialsYear}):`, filtered);

        if (filtered.length === 0) {
            const message = this.tutorialsYear ? 
                `No tutorials available for ${this.tutorialsYear}.` : 
                'No tutorials available.';
            this.$tutorialsList.innerHTML = `<li class="tutorials-item"><div class="tutorials-meta">${message}</div></li>`;
            return;
        }
        
        this.$tutorialsList.innerHTML = filtered.map(tutorial => {
            const safeProp = (prop) => tutorial[prop] || '';
            
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                try {
                    return new Date(dateStr).toLocaleDateString();
                } catch (e) {
                    return dateStr;
                }
            };
            
            // Build meta information with all available fields
            let metaInfo = [];
            if (safeProp('date')) {
                metaInfo.push(`Published: ${formatDate(safeProp('date'))}`);
            }
            if (safeProp('difficulty')) {
                metaInfo.push(`Difficulty: ${safeProp('difficulty')}`);
            }
            if (safeProp('duration')) {
                metaInfo.push(`Duration: ${safeProp('duration')}`);
            }
            
            return `<li class="tutorials-item" data-id="${safeProp('id')}">
                <div class="tutorials-card">
                    <h3 class="tutorials-title">${safeProp('title')}</h3>
                    <div class="tutorials-meta">${metaInfo.join(' • ')}</div>
                    ${safeProp('description') ? `<p class="tutorials-description">${safeProp('description')}</p>` : ''}
                    <div class="tutorials-links">
                        <a href="${safeProp('url')}" class="tutorial-link">Read More...</a>
                    </div>
                </div>
            </li>`;
        }).join('');
    }
    
    // Blog JavaScript Methods //
    
    renderBlog() {
        // Controls
        this.$blogControls = document.getElementById('blogControls');
        this.$blogTabDates = document.getElementById('blogTabDates');
        this.$blogTabDatesMenu = document.getElementById('blogDatesMenu');

        // Accordion
        this.$accBlog = document.getElementById('acc-blog');

        // List INSIDE panel
        this.$blogList = document.querySelector('#acc-blog .blog-list');

        // Check if required elements exist
        if (!this.$blogControls || !this.$blogTabDates || !this.$blogTabDatesMenu) {
            // console.error('Required blog UI elements not found');
            return;
        }

        // State
        this.blogView = 'all';
        this.blogYear = null;

        // Extract years from blog data
        const years = new Set();
        const blogs = this.data.blog || [];
        
        blogs.forEach(blog => {
            if (blog && blog.date) {
                const dateYear = new Date(blog.date).getFullYear();
                if (!isNaN(dateYear)) {
                    years.add(dateYear);
                }
            }
        });

        this.blogYears = Array.from(years).sort((a, b) => b - a);
        // console.log('Extracted blog years:', this.blogYears);

        this.buildBlogDatesMenu();
        this.bindBlogUI();
        this.renderBlogList();
    }

    buildBlogDatesMenu() {
        if (!this.$blogTabDatesMenu || !this.$blogTabDates) return;

        const items = [
            `<button type="button" data-year="">All years</button>`,
            ...this.blogYears.map(y => `<button type="button" data-year="${y}">${y}</button>`)
        ].join('');

        this.$blogTabDatesMenu.innerHTML = items;

        // Toggle dropdown
        this.$blogTabDates.addEventListener('click', () => {
            const open = this.$blogTabDatesMenu.style.display === 'block';
            this.$blogTabDatesMenu.style.display = open ? 'none' : 'block';
            this.$blogTabDates.classList.toggle('active', !open);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.$blogTabDatesMenu.contains(e.target) && !this.$blogTabDates.contains(e.target)) {
                this.$blogTabDatesMenu.style.display = 'none';
                this.$blogTabDates.classList.remove('active');
            }
        });

        // Year selection
        this.$blogTabDatesMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-year]');
            if (!btn) return;

            const val = btn.getAttribute('data-year');
            this.blogYear = val ? parseInt(val, 10) : null;
            
            this.$blogTabDatesMenu.style.display = 'none';
            this.$blogTabDates.classList.remove('active');
            
            // console.log('Selected blog year:', this.blogYear);
            
            // Auto-expand accordion when date is selected and render immediately
            if (this.blogYear && this.$accBlog) {
                this.$accBlog.classList.add('open');
                const header = this.$accBlog.querySelector('.acc-header');
                if (header) header.setAttribute('aria-expanded', 'true');
            }
            
            // Render the filtered list immediately
            this.renderBlogList();
        });
    }

    bindBlogUI() {
        // This handles the "All" button and future filter buttons
        if (!this.$blogControls) return;

        this.$blogControls.querySelectorAll('.blog-tab[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.$blogControls.querySelectorAll('.blog-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.blogView = btn.dataset.view;

                // when "All" is clicked, clear year filter and collapse the main accordion
                if (this.blogView === 'all') {
                    // clear any year filter
                    this.blogYear = null;

                    // collapse the accordion wrapper to default state
                    if (this.$accBlog) {
                        this.$accBlog.classList.remove('open');
                        const header = this.$accBlog.querySelector('.acc-header');
                        if (header) header.setAttribute('aria-expanded', 'false');
                    }

                    // ensure the dates dropdown is closed and not marked active
                    if (this.$blogTabDatesMenu) this.$blogTabDatesMenu.style.display = 'none';
                    if (this.$blogTabDates) this.$blogTabDates.classList.remove('active');
                }

                this.renderBlogList();
            });
        });
    }

    renderBlogList() {
        // Use the stored reference instead of getElementById
        if (!this.$blogList) {
            // console.warn('blogList element not found');
            return;
        }

        const blogs = this.data.blog || [];
        // console.log('Rendering blogs with full data:', blogs);

        if (!Array.isArray(blogs)) {
            // console.error('Blog data is not an array:', blogs);
            this.$blogList.innerHTML = `<li class="blog-item"><div class="blog-meta">Invalid data format for blog.</div></li>`;
            return;
        }

        // Handle empty data
        if (blogs.length === 0) {
            const emptyMessages = {
                blog: 'Blog posts are coming soon!',
            };
            this.$blogList.innerHTML = `<li class="blog-item"><div class="blog-meta">${emptyMessages.blog}</div></li>`;
            return;
        }

        // Filter by year if selected
        const filtered = this.blogYear ? 
            blogs.filter(x => {
                if (x.date) {
                    const dateYear = new Date(x.date).getFullYear();
                    return dateYear === this.blogYear;
                }
                return false;
            }) : 
            blogs;

        // console.log(`Filtered blogs (year: ${this.blogYear}):`, filtered);

        if (filtered.length === 0) {
            const message = this.blogYear ? 
                `No blog posts available for ${this.blogYear}.` : 
                'No blog posts available.';
            this.$blogList.innerHTML = `<li class="blog-item"><div class="blog-meta">${message}</div></li>`;
            return;
        }
        
        this.$blogList.innerHTML = filtered.map(blog => {
            const safeProp = (prop) => blog[prop] || '';
            const safeArray = (prop) => Array.isArray(blog[prop]) ? blog[prop] : [];
            
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                try {
                    return new Date(dateStr).toLocaleDateString();
                } catch (e) {
                    return dateStr;
                }
            };
            
            // Build meta information with all available fields
            let metaInfo = [];
            if (safeProp('date')) {
                metaInfo.push(`Published: ${formatDate(safeProp('date'))}`);
            }
            if (safeProp('duration')) {
                metaInfo.push(`Duration: ${safeProp('duration')}`);
            }
            if (safeArray('tags').length > 0) {
                metaInfo.push(safeArray('tags').join(' '));
            }
            
            return `<li class="blog-item" data-id="${safeProp('id')}">
                <div class="blog-card">
                    <h3 class="blog-title">${safeProp('title')}</h3>
                    <div class="blog-meta">${metaInfo.join(' • ')}</div>
                    ${safeProp('description') ? `<p class="blog-description">${safeProp('description')}</p>` : ''}
                    <div class="blog-links">
                        <a href="${safeProp('url')}" class="blog-link">Read More...</a>
                    </div>
                </div>
            </li>`;
        }).join('');
    }
    
    // Setup mobile navigation menu toggle and close behavior
    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const body = document.body;
        if (!navToggle || !navMenu) return;

        const closeMenu = () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('no-scroll');
        };


        // ARIA and linkage
        navToggle.setAttribute('aria-controls', 'navMenu');
        navToggle.setAttribute('aria-expanded', 'false');

        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
            body.classList.toggle('no-scroll', isOpen);
        });

        // Click outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });

        // Esc to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        // Auto-close if viewport grows beyond mobile
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) closeMenu();
        });
    }
    
    setupScrollEffects() {
        // Elements created by the renderers use these classes
        const selector = '.pub-item, .teach-item, .talk-item, .blog-item, .card-item, .info-card';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target); // animate once
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const observeAll = () => {
            document.querySelectorAll(selector).forEach(el => observer.observe(el));
        };

        // Initial pass
        observeAll();

        // Pick up dynamically-rendered items (publications, talks, teaching, blog)
        const root = document.querySelector('main') || document.body;
        const mo = new MutationObserver(() => observeAll());
        mo.observe(root, { childList: true, subtree: true });
    }
    
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.academicWebsite = new AcademicWebsite();

    // After AcademicWebsite has rendered its sections,
    // attach staggered animation observers to all lists.
    const selectors = [
        '.news-list',
        '.talk-list',
        '.teach-list',
        '.tutorials-list',
        '.pub-list',
        '.blog-list'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(list => {
        observeStagger(list, { durationSec: 0.6, stepSec: 0.1, startIndex: 0 });
    });
    
    // Re-apply staggered animations when About accordions (Education, Experience, Skills, News) open
    document.querySelectorAll('#about .accordion').forEach(acc => {
        const list = acc.querySelector('.card-list, .news-list');
        if (!list) return;

        const restart = () => {
            // Reset and re-apply stagger so first item also animates
            list.querySelectorAll('.card-item, li').forEach(el => {
                el.style.animation = 'none';
                void el.offsetWidth; // force reflow
                el.style.animation = '';
            });
            applyStaggerToList(list, { durationSec: 0.6, stepSec: 0.10, startIndex: 0 });
        };

        // Watch accordion open/close
        const mo = new MutationObserver(() => {
            if (acc.classList.contains('open')) restart();
        });
        mo.observe(acc, { attributes: true, attributeFilter: ['class'] });
    });

    // Attach staggered animations to Talks, Tutorials, and Blog accordions
    attachAccordionStagger('#acc-talks', '.talk-list',       { durationSec: 0.6, stepSec: 0.10, startIndex: 0 });
    attachAccordionStagger('#acc-tutorials', '.tutorials-list', { durationSec: 0.6, stepSec: 0.10, startIndex: 0 });
    attachAccordionStagger('#acc-blog', '.blog-list',         { durationSec: 0.6, stepSec: 0.10, startIndex: 0 });
});

/* Stagger helper: applies fadeIn and per-item delay */
function applyStaggerToList(listEl, opts = {}) {
  const dur   = opts.durationSec ?? 0.6;   // seconds
  const step  = opts.stepSec     ?? 0.10;  // per-item delay increment
  const from  = opts.startIndex  ?? 0;     // 0 or 1 depending on taste

  const items = Array.from(listEl.children).filter(el => el.matches('li'));
  items.forEach((el, i) => {
    const k = i + from;
    el.style.animation = `fadeIn ${dur}s ease-out`;
    el.style.animationDelay = `${k * step}s`;
    el.style.animationFillMode = 'both';
    // Optional: clear any previous transforms so the keyframes are visible
    el.style.transform = '';
  });
}

/* Watch a list and reapply stagger whenever its children change */
function observeStagger(listEl, opts) {
  // Initial pass to apply staggered animation to any existing items
  applyStaggerToList(listEl, opts);

  // Create a MutationObserver to monitor child list changes
  const obs = new MutationObserver(() => {
    // Re-apply stagger whenever the list's children are updated
    // (e.g. innerHTML replacement, adding/removing <li> items)
    applyStaggerToList(listEl, opts);
  });

  // Observe only changes to the list's direct children
  obs.observe(listEl, { childList: true });

  return obs;
}

/* Attach "restart-on-open" behavior for any accordion + list pair */
function attachAccordionStagger(accordionSelector, listSelector, opts = {}) {
  document.querySelectorAll(accordionSelector).forEach(acc => {
    const list = acc.querySelector(listSelector);
    if (!list) return;

    const restart = () => {
      // Reset running animations so the first item can animate too
      list.querySelectorAll('li').forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth; // force reflow
        el.style.animation = '';
      });
      applyStaggerToList(list, opts);
    };

    // Re-stagger when the accordion opens (class changes)
    const mo = new MutationObserver(() => {
      if (acc.classList.contains('open')) restart();
    });
    mo.observe(acc, { attributes: true, attributeFilter: ['class'] });

    // If it starts already open, run once
    if (acc.classList.contains('open')) restart();
  });
}

// Handle page visibility for analytics
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page is visible - could trigger analytics events
        // console.log('Page became visible');
    }
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                // console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                // console.log('SW registration failed: ', registrationError);
            });
    });
}

// About and Publications accordions (expand or collapse)
document.querySelectorAll('.accordion .acc-header').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const acc = btn.closest('.accordion');
        if (acc.classList.contains('static')) {
            e.preventDefault();
            return;
        }
        const isOpen = acc.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
    });
});

