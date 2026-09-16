/**
 * ADMIN-FRONTEND SYNC MODULE
 * Handles all data synchronization between admin panel and frontend
 */

// ============================================
// STORAGE MANAGER - Handles localStorage
// ============================================

const StorageManager = {
    // Key for storing data
    KEY: 'portfolioData',
    
    // Save data to localStorage
    save: function(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
            console.log('✅ Data saved to localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return false;
        }
    },
    
    // Load data from localStorage
    load: function() {
        try {
            const data = localStorage.getItem(this.KEY);
            if (data) {
                console.log('✅ Data loaded from localStorage');
                return JSON.parse(data);
            }
            console.log('⚠️ No saved data found, using defaults');
            return null;
        } catch (error) {
            console.error('❌ Error loading data:', error);
            return null;
        }
    },
    
    // Clear all data
    clear: function() {
        try {
            localStorage.removeItem(this.KEY);
            console.log('✅ Data cleared');
            return true;
        } catch (error) {
            console.error('❌ Error clearing data:', error);
            return false;
        }
    },
    
    // Get data size
    getSize: function() {
        const data = localStorage.getItem(this.KEY);
        if (data) {
            return (new Blob([data]).size / 1024).toFixed(2) + ' KB';
        }
        return '0 KB';
    }
};

// ============================================
// DATA SYNC - Syncs admin changes to frontend
// ============================================

const DataSync = {
    // Initialize sync
    init: function() {
        console.log('🔄 DataSync initialized');
        this.watchForChanges();
    },
    
    // Watch for changes in localStorage
    watchForChanges: function() {
        window.addEventListener('storage', (event) => {
            if (event.key === StorageManager.KEY) {
                console.log('🔄 Detected changes from admin panel');
                this.refreshPortfolio();
            }
        });
    },
    
    // Refresh portfolio with new data
    refreshPortfolio: function() {
        const data = StorageManager.load();
        if (data) {
            window.portfolioData = data;
            console.log('✅ Portfolio refreshed with new data');
            
            // Trigger custom event for listeners
            const event = new CustomEvent('portfolioUpdated', { detail: data });
            document.dispatchEvent(event);
        }
    },
    
    // Update specific section
    updateSection: function(section, data) {
        const allData = StorageManager.load() || {};
        allData[section] = data;
        StorageManager.save(allData);
        this.refreshPortfolio();
    },
    
    // Add item to section
    addItem: function(section, item) {
        const allData = StorageManager.load() || {};
        if (!Array.isArray(allData[section])) {
            allData[section] = [];
        }
        allData[section].push(item);
        StorageManager.save(allData);
        this.refreshPortfolio();
    },
    
    // Update item in section
    updateItem: function(section, itemId, updatedItem) {
        const allData = StorageManager.load() || {};
        if (Array.isArray(allData[section])) {
            const index = allData[section].findIndex(item => item.id === itemId);
            if (index !== -1) {
                allData[section][index] = updatedItem;
                StorageManager.save(allData);
                this.refreshPortfolio();
                return true;
            }
        }
        return false;
    },
    
    // Delete item from section
    deleteItem: function(section, itemId) {
        const allData = StorageManager.load() || {};
        if (Array.isArray(allData[section])) {
            allData[section] = allData[section].filter(item => item.id !== itemId);
            StorageManager.save(allData);
            this.refreshPortfolio();
            return true;
        }
        return false;
    }
};

// ============================================
// DISPLAY FUNCTIONS - Render data on frontend
// ============================================

const DisplayManager = {
    // Display case studies
    displayCaseStudies: function(studies) {
        const container = document.getElementById('caseStudiesContainer');
        if (!container || !studies) return;
        
        container.innerHTML = studies.map(study => `
            <div class="case-study" data-industry="${study.industry}">
                <div class="case-study-image">[${study.title}]</div>
                <div class="case-study-content">
                    <h3>${study.title}</h3>
                    <p>${study.description}</p>
                    <div class="results-grid">
                        ${study.results.split(',').map(result => `
                            <div class="result-item">
                                <div class="result-value">${result.trim().split(' ')[0]}</div>
                                <div class="result-label">${result.trim()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        console.log('✅ Case studies displayed');
    },
    
    // Display testimonials
    displayTestimonials: function(testimonials) {
        const track = document.getElementById('testimonialsTrack');
        if (!track || !testimonials) return;
        
        track.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card-carousel" onclick="openImageModal('${testimonial.proof}', '${testimonial.name}', '${testimonial.role}')">
                <div class="testimonial-stars">${'★'.repeat(testimonial.rating)}</div>
                <div class="testimonial-text">"${testimonial.text}"</div>
                <div class="testimonial-author">${testimonial.name}</div>
                <div class="testimonial-role">${testimonial.role}</div>
            </div>
        `).join('');
        console.log('✅ Testimonials displayed');
    },
    
    // Display services
    displayServices: function(services) {
        const container = document.querySelector('.services-grid-new');
        if (!container || !services) return;
        
        container.innerHTML = services.map(service => `
            <div class="service-card">
                <h3>${service.name}</h3>
                <p class="service-category">${service.category}</p>
                <p class="service-description">${service.description}</p>
            </div>
        `).join('');
        console.log('✅ Services displayed');
    },
    
    // Display industry filters
    displayIndustryFilters: function(industries) {
        const container = document.querySelector('.casestudy-filters');
        if (!container || !industries) return;
        
        let html = '<button class="filter-btn active" onclick="filterCaseStudies(\'all\')">All Industries</button>';
        html += industries.map(industry => `
            <button class="filter-btn" onclick="filterCaseStudies('${industry.name}')">
                ${industry.icon} ${industry.name}
            </button>
        `).join('');
        
        container.innerHTML = html;
        console.log('✅ Industry filters displayed');
    },
    
    // Display settings
    displaySettings: function(settings) {
        if (settings) {
            // Update footer
            const emailLink = document.querySelector('a[href*="mailto"]');
            if (emailLink && settings.email) {
                emailLink.href = `mailto:${settings.email}`;
            }
            
            // Update phone
            const phoneLink = document.querySelector('a[href*="tel"]');
            if (phoneLink && settings.phone) {
                phoneLink.href = `tel:${settings.phone}`;
            }
            
            console.log('✅ Settings displayed');
        }
    }
};

// ============================================
// INITIALIZATION
// ============================================

// Initialize sync when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load data from admin panel
    const data = StorageManager.load();
    
    if (data) {
        // Save to global variable
        window.portfolioData = data;
        
        // Display all data
        if (data.caseStudies) DisplayManager.displayCaseStudies(data.caseStudies);
        if (data.testimonials) DisplayManager.displayTestimonials(data.testimonials);
        if (data.services) DisplayManager.displayServices(data.services);
        if (data.industries) DisplayManager.displayIndustryFilters(data.industries);
        if (data.settings) DisplayManager.displaySettings(data.settings);
        
        console.log('✅ Portfolio initialized with saved data');
    } else {
        console.log('⚠️ No saved data found - using defaults');
    }
    
    // Initialize real-time sync
    DataSync.init();
    
    // Listen for portfolio updates
    document.addEventListener('portfolioUpdated', function(event) {
        console.log('🔄 Portfolio updated with new data');
        const data = event.detail;
        
        // Re-render everything
        if (data.caseStudies) DisplayManager.displayCaseStudies(data.caseStudies);
        if (data.testimonials) DisplayManager.displayTestimonials(data.testimonials);
        if (data.services) DisplayManager.displayServices(data.services);
        if (data.industries) DisplayManager.displayIndustryFilters(data.industries);
        if (data.settings) DisplayManager.displaySettings(data.settings);
    });
});

// ============================================
// EXPORT FOR ADMIN PANEL USE
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, DataSync, DisplayManager };
}
