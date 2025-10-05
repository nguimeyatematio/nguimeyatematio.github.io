// js/counter.js

// Attribution: If you reuse or adapt this template, please credit
// "Based on the personal website of Dr. Nguimeya Tematio Gaël-Pacôme"

// Global analytics config (can be overridden in HTML before this file loads)
window.analyticsConfig = Object.assign({ sendCvEmail: true }, window.analyticsConfig || {});

class VisitorCounter {
    constructor() {
        this.storageKey = 'academic-site-analytics';
        this.sessionKey = 'academic-site-session';
        this.onlineKey = 'academic-site-online';
        this.cvDownloadsKey = 'academic-site-cv-downloads';
        
        // Online tracking configuration
        this.onlineTimeout = 5 * 60 * 1000; // 5 minutes
        this.onlineCheckInterval = 30 * 1000; // 30 seconds
        
        this.init();
    }

    init() {
        this.addOnlineIndicatorStyles();
        this.updateVisitorCount();
        this.initOnlineTracking();
        this.setupCVDownloadTracking();
        this.trackPageView();
        this.trackScrollDepth();
        this.trackTimeSpent();
        this.displayCounter();
    }

    // Add CSS styles for the visitor counter
    addOnlineIndicatorStyles() {
        const styles = `
            <style>
                .visitor-counter {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // Existing Visitor Count Functionality //
    
    updateVisitorCount() {
        const analytics = this.getAnalytics();
        const currentSession = sessionStorage.getItem(this.sessionKey);
        
        if (!currentSession) {
            analytics.totalVisitors += 1;
            analytics.lastVisit = new Date().toISOString();
            sessionStorage.setItem(this.sessionKey, 'active');
        }

        analytics.pageViews += 1;
        this.saveAnalytics(analytics);
    }

    getAnalytics() {
        const defaultAnalytics = {
            totalVisitors: 0,
            pageViews: 0,
            lastVisit: null,
            sections: {},
            scrollDepth: [],
            timeSpent: [],
            dailyStats: {},
            cvDownloads: 0
        };

        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? { ...defaultAnalytics, ...JSON.parse(stored) } : defaultAnalytics;
        } catch (error) {
            // console.error('Error loading analytics:', error);
            return defaultAnalytics;
        }
    }

    saveAnalytics(analytics) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(analytics));
        } catch (error) {
            // console.error('Error saving analytics:', error);
        }
    }

    // Online Users Tracking //
    
    initOnlineTracking() {
        this.updateOnlineStatus();
        
        // Update online status periodically
        setInterval(() => {
            this.updateOnlineStatus();
            this.cleanupOfflineUsers();
        }, this.onlineCheckInterval);

        // Update when page becomes visible/hidden
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateOnlineStatus();
            }
        });

        // Update before page unload
        window.addEventListener('beforeunload', () => {
            this.removeFromOnlineUsers();
        });
    }

    updateOnlineStatus() {
        const onlineUsers = this.getOnlineUsers();
        const sessionId = this.getSessionId();
        const now = Date.now();

        onlineUsers[sessionId] = {
            timestamp: now,
            lastSeen: now
        };

        this.saveOnlineUsers(onlineUsers);
        this.updateOnlineDisplay();
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('online-session-id');
        if (!sessionId) {
            sessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('online-session-id', sessionId);
        }
        return sessionId;
    }

    getOnlineUsers() {
        try {
            const stored = localStorage.getItem(this.onlineKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            // console.error('Error loading online users:', error);
            return {};
        }
    }

    saveOnlineUsers(onlineUsers) {
        try {
            localStorage.setItem(this.onlineKey, JSON.stringify(onlineUsers));
        } catch (error) {
            // console.error('Error saving online users:', error);
        }
    }

    cleanupOfflineUsers() {
        const onlineUsers = this.getOnlineUsers();
        const now = Date.now();
        let hasChanges = false;

        Object.keys(onlineUsers).forEach(sessionId => {
            if (now - onlineUsers[sessionId].lastSeen > this.onlineTimeout) {
                delete onlineUsers[sessionId];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.saveOnlineUsers(onlineUsers);
            this.updateOnlineDisplay();
        }
    }

    removeFromOnlineUsers() {
        const onlineUsers = this.getOnlineUsers();
               const sessionId = this.getSessionId();
        
        if (onlineUsers[sessionId]) {
            delete onlineUsers[sessionId];
            this.saveOnlineUsers(onlineUsers);
        }
    }

    getOnlineCount() {
        const onlineUsers = this.getOnlineUsers();
        const now = Date.now();
        
        return Object.values(onlineUsers).filter(user => 
            now - user.lastSeen <= this.onlineTimeout
        ).length;
    }

    updateOnlineDisplay() {
        const visitorCounterElement = document.querySelector('.visitor-counter span');
        if (visitorCounterElement) {
            const analytics = this.getAnalytics();
            const onlineCount = this.getOnlineCount();
            
            visitorCounterElement.innerHTML = `Visitors: <span id="visitorCount">${analytics.totalVisitors}</span> Online: <span id="onlineCount">${onlineCount}</span>`;
        }
    }
    
    // CV Download Tracking & Email Notifications //
    
    setupCVDownloadTracking() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && this.isCVDownloadLink(link)) {
                // console.log('CV download detected:', link.href);
                this.handleCVDownload(event, link);
            }
        });
    }

    isCVDownloadLink(link) {
        const href = link.href.toLowerCase();
        const text = link.textContent.toLowerCase();
        
        return (
            href.includes('cv.pdf') || 
            href.includes('/cv/') ||
            text.includes('download cv') ||
            text.includes('cv (pdf)') ||
            (text.includes('cv') && href.includes('.pdf'))
        );
    }

    async handleCVDownload(event, link) {
        try {
            // console.log('Processing CV download...');
            
            // Update download count (kept for local analytics only)
            const analytics = this.getAnalytics();
            analytics.cvDownloads = (analytics.cvDownloads || 0) + 1;
            this.saveAnalytics(analytics);

            // console.log(`CV download count updated: ${analytics.cvDownloads}`);

            // Get user location and send notification email (guarded by switch)
            if (window.analyticsConfig && window.analyticsConfig.sendCvEmail === true) {
                await this.sendCVDownloadNotification();
            }
            
        } catch (error) {
            // console.error('Error tracking CV download:', error);
        }
    }
    
    async sendCVDownloadNotification() {
        try {
            // console.log('Getting user location...');
            const locationData = await this.getUserLocation();
            // console.log('Location data:', locationData);
            
            // Email Notification Section //
            
            const now = new Date();
            
            // Format date for body and a hyphenated version for subject
            const formattedDate = now.toLocaleDateString('en-GB');           // DD/MM/YYYY
            const formattedDateSubject = formattedDate.replace(/\//g, '-');  // DD-MM-YYYY
            const formattedTime = now.toLocaleTimeString('en-GB', {
                hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
            
            const emailData = {
                timestamp: `${formattedDate}, ${formattedTime}`,                  // used in email body
                timestampForSubject: `${formattedDateSubject} ${formattedTime}`,  // used in subject
                location: locationData
            };
            
            // console.log('Sending email with data:', emailData);
            await this.sendEmail(emailData);
            
            // End Email Notification Section //
            
        } catch (error) {
            // console.error('Error sending CV download notification:', error);
        }
    }

    async getUserLocation() {
        try {
            // console.log('Fetching location from ipapi.co...');
            const response = await fetch('https://ipapi.co/json/');
            
            if (response.ok) {
                const data = await response.json();
                // console.log('Location API response:', data);
                return {
                    city: data.city || 'Unknown',
                    region: data.region || 'Unknown', 
                    country: data.country_name || 'Unknown',
                    timezone: data.timezone || 'Unknown'
                };
            } else {
                throw new Error(`Location service returned ${response.status}`);
            }
        } catch (error) {
            // console.log('Could not determine location:', error.message);
            return {
                city: 'Unknown',
                region: 'Unknown',
                country: 'Unknown',
                timezone: 'Unknown'
            };
        }
    }

    async sendEmail(emailData) {
        try {
            // console.log('Attempting to send email...');

            // Check if EmailJS is available and configured
            if (typeof emailjs !== 'undefined' && window.emailjsConfig) {
                // console.log('Using EmailJS with config:', window.emailjsConfig);
                
                // Initialize EmailJS if not already done
                if (!window.emailjsInitialized) {
                    emailjs.init(window.emailjsConfig.publicKey || window.emailjsConfig.userId || 'your_public_key');
                    window.emailjsInitialized = true;
                    // console.log('EmailJS initialized');
                }

                const templateParams = {
                    to_email: window.emailjsConfig.toEmail,
                    user_location: `${emailData.location.city}, ${emailData.location.region}, ${emailData.location.country}`,
                    timestamp: emailData.timestamp,
                    timestamp_subject: emailData.timestampForSubject
                };

                // console.log('Sending email with template params:', templateParams);

                const response = await emailjs.send(
                    window.emailjsConfig.serviceId,
                    window.emailjsConfig.templateId,
                    templateParams
                );
                
                // console.log('EmailJS response:', response);
                
                return;
            }

            // Try Formspree or similar service
            if (window.formspreeEndpoint) {
                // console.log('Trying Formspree...');
                const formData = {
                    subject: `Your CV has been downloaded - ${emailData.timestampForSubject}`,
                    message: `Your CV has been downloaded by a user.\n\nDownload Details:\n- Date & Time: ${emailData.timestamp}\n- Location: ${emailData.location.city}, ${emailData.location.region}, ${emailData.location.country}`,
                    _replyto: 'noreply@nguimeyatematio.github.io'
                };

                const response = await fetch(window.formspreeEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // console.log('✅ Email notification sent successfully via Formspree');
                    return;
                }
            }

            // console.log('⚠️ No email service configured. Please set up EmailJS or Formspree.');
            
        } catch (error) {
            // console.error('❌ Failed to send email notification:', error);
            
            // Show error details for debugging
            if (error.text) {
                // console.error('EmailJS error details:', error.text);
            }
        }
    }

    showNotificationToast(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    trackPageView() {
        const analytics = this.getAnalytics();
        const today = new Date().toDateString();
        
        if (!analytics.dailyStats[today]) {
            analytics.dailyStats[today] = { visits: 0, sections: {} };
        }
        analytics.dailyStats[today].visits += 1;

        this.saveAnalytics(analytics);
    }

    trackSectionView(sectionId) {
        const analytics = this.getAnalytics();
        const today = new Date().toDateString();

        if (!analytics.sections[sectionId]) {
            analytics.sections[sectionId] = 0;
        }
        analytics.sections[sectionId] += 1;

        if (!analytics.dailyStats[today]) {
            analytics.dailyStats[today] = { visits: 0, sections: {} };
        }
        if (!analytics.dailyStats[today].sections[sectionId]) {
            analytics.dailyStats[today].sections[sectionId] = 0;
        }
        analytics.dailyStats[today].sections[sectionId] += 1;

        this.saveAnalytics(analytics);
    }

    trackScrollDepth() {
        let maxScrollDepth = 0;
        let scrollTimeout;

        const trackScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.saveScrollDepth(maxScrollDepth);
            }, 1000);
        };

        window.addEventListener('scroll', trackScroll, { passive: true });
        window.addEventListener('beforeunload', () => {
            this.saveScrollDepth(maxScrollDepth);
        });
    }

    saveScrollDepth(depth) {
        const analytics = this.getAnalytics();
        const timestamp = new Date().toISOString();
        
        analytics.scrollDepth.push({
            depth: Math.min(depth, 100),
            timestamp,
            section: this.getCurrentSection()
        });

        if (analytics.scrollDepth.length > 50) {
            analytics.scrollDepth = analytics.scrollDepth.slice(-50);
        }

        this.saveAnalytics(analytics);
    }

    trackTimeSpent() {
        const startTime = Date.now();
        let isActive = true;
        let lastActivity = startTime;

        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const updateActivity = () => {
            lastActivity = Date.now();
            if (!isActive) {
                isActive = true;
            }
            this.updateOnlineStatus();
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        setInterval(() => {
            if (Date.now() - lastActivity > 30000) {
                isActive = false;
            }
        }, 5000);

        window.addEventListener('beforeunload', () => {
            if (isActive) {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                this.saveTimeSpent(timeSpent);
            }
        });

        setInterval(() => {
            if (isActive) {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                this.saveTimeSpent(timeSpent);
            }
        }, 30000);
    }

    saveTimeSpent(seconds) {
        const analytics = this.getAnalytics();
        const timestamp = new Date().toISOString();

        analytics.timeSpent.push({
            duration: seconds,
            timestamp,
            section: this.getCurrentSection()
        });

        if (analytics.timeSpent.length > 50) {
            analytics.timeSpent = analytics.timeSpent.slice(-50);
        }

        this.saveAnalytics(analytics);
    }

    getCurrentSection() {
        const activeSection = document.querySelector('.section.active');
        return activeSection ? activeSection.id : 'unknown';
    }

    displayCounter() {
        const counterElement = document.getElementById('visitorCount');
        if (counterElement) {
            const analytics = this.getAnalytics();
            this.animateCounter(counterElement, analytics.totalVisitors);
        }
        
        // Also update online count
        setTimeout(() => {
            this.updateOnlineDisplay();
        }, 2000);
    }

    animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 2000;
        const startTime = Date.now();

        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * this.easeOutQuart(progress));
            
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }
    
    getAnalyticsSummary() {
        const analytics = this.getAnalytics();
        const totalTimeSpent = analytics.timeSpent.reduce((sum, record) => sum + record.duration, 0);
        const avgScrollDepth = analytics.scrollDepth.length > 0 
            ? analytics.scrollDepth.reduce((sum, record) => sum + record.depth, 0) / analytics.scrollDepth.length 
            : 0;

        return {
            totalVisitors: analytics.totalVisitors,
            totalPageViews: analytics.pageViews,
            cvDownloads: analytics.cvDownloads || 0,
            currentOnlineUsers: this.getOnlineCount(),
            averageTimeSpent: totalTimeSpent / analytics.timeSpent.length || 0,
            averageScrollDepth: Math.round(avgScrollDepth),
            mostVisitedSection: this.getMostVisitedSection(analytics.sections),
            recentVisits: this.getRecentVisits(analytics.dailyStats)
        };
    }

    getMostVisitedSection(sections) {
        let maxSection = '';
        let maxVisits = 0;

        for (const [section, visits] of Object.entries(sections)) {
            if (visits > maxVisits) {
                maxVisits = visits;
                maxSection = section;
            }
        }

        return { section: maxSection, visits: maxVisits };
    }

    getRecentVisits(dailyStats) {
        const sortedDates = Object.keys(dailyStats).sort((a, b) => new Date(b) - new Date(a));
        return sortedDates.slice(0, 7).map(date => ({
            date,
            visits: dailyStats[date].visits
        }));
    }

    exportAnalytics() {
        const analytics = this.getAnalytics();
        const summary = this.getAnalyticsSummary();
        
        const exportData = {
            summary,
            rawData: analytics,
            onlineUsers: this.getOnlineUsers(),
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `academic-site-analytics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
    
    showNotificationToast(message) { 
        return; 
    }
}

// Initialize visitor counter
document.addEventListener('DOMContentLoaded', () => {
    window.visitorCounter = new VisitorCounter();

    // Track section changes if main app is available
    if (window.academicWebsite) {
        const originalNavigateToSection = window.academicWebsite.navigateToSection;
        window.academicWebsite.navigateToSection = function(sectionId) {
            originalNavigateToSection.call(this, sectionId);
            window.visitorCounter.trackSectionView(sectionId);
        };
    }
});

// Enhanced debug function
window.debugAnalytics = () => {
    if (window.visitorCounter) {
        const summary = window.visitorCounter.getAnalyticsSummary();
        // console.log('=== ANALYTICS SUMMARY ===');
        // console.log(`Total Visitors: ${summary.totalVisitors}`);
        // console.log(`Total Page Views: ${summary.totalPageViews}`);
        // console.log(`CV Downloads: ${summary.cvDownloads}`);
        // console.log(`Currently Online: ${summary.currentOnlineUsers}`);
        // console.log(`Average Time Spent: ${Math.round(summary.averageTimeSpent)}s`);
        // console.log(`Average Scroll Depth: ${summary.averageScrollDepth}%`);
        // console.log('Most Visited Section:', summary.mostVisitedSection);
        // console.log('Recent Visits:', summary.recentVisits);
        // console.log('\n=== RAW DATA ===');
        // console.log('Full Analytics:', window.visitorCounter.getAnalytics());
        // console.log('Online Users:', window.visitorCounter.getOnlineUsers());
    }
};

