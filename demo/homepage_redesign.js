// OhCampus Homepage V8.1 - Fixed Angular Sidenav Issue
// Free Counseling with complete form and captcha
// Predict Colleges Based on Exams - functional with live data

(function() {
    'use strict';
    
    const API_BASE = 'https://campusapi.ohcampus.com/web';
    
    function isHomePage() {
        const path = window.location.pathname.toLowerCase();
        return path === '/' || path === '/home' || path === '' || path === '/index.html';
    }
    
    function isAuthPage() {
        const path = window.location.pathname.toLowerCase();
        return path.includes('sign-in') || path.includes('sign-up') || 
               path.includes('signin') || path.includes('signup') ||
               path.includes('login') || path.includes('register');
    }
    
    if (isAuthPage()) {
        console.log('Auth page - using original Angular login with Google');
    }
    
    let homepageReplaced = false;
    
    function init() {
        if (!isHomePage()) return;
        
        // Immediately inject CSS to hide Angular elements
        injectCSS();
        
        function replaceContent() {
            if (homepageReplaced) return;
            
            const appRoot = document.querySelector('app-root');
            if (appRoot && appRoot.innerHTML.length > 100) {
                homepageReplaced = true;
                
                document.body.style.visibility = 'hidden';
                
                while (appRoot.firstChild) {
                    appRoot.removeChild(appRoot.firstChild);
                }
                
                appRoot.innerHTML = getHomepageHTML();
                document.body.style.visibility = 'visible';
                
                initializeInteractions();
                loadLiveCounts();
                loadFeaturedColleges();
                loadTrendingColleges();
                loadExams();
                loadArticles();
                loadEvents();
                loadFooterNotification();
                loadStatesForForm();
                loadAcademicCategories();
                loadAllExamsForPredictor();
                console.log('OhCampus Homepage V8.1 loaded');
            }
        }
        
        [100, 300, 500, 1000, 2000, 3000].forEach(delay => {
            setTimeout(replaceContent, delay);
        });
    }
    
    function injectCSS() {
        // First, add hide CSS for Angular immediately
        const hideStyle = document.createElement('style');
        hideStyle.id = 'ohc-hide-angular';
        hideStyle.textContent = `
            /* CRITICAL: Hide Angular sidenav and related elements immediately */
            mat-sidenav, .mat-sidenav, mat-sidenav-container, .mat-sidenav-container,
            mat-sidenav-content, .mat-sidenav-content, .mat-drawer, mat-drawer,
            .mat-drawer-container, mat-drawer-container, .mat-drawer-content,
            fuse-layout, app-layout, app-layout-futuristic,
            fuse-vertical-navigation, .fuse-vertical-navigation,
            .vertical-navigation, .sidenav, .side-nav, .sidebar,
            [class*="sidenav"], [class*="side-nav"], [class*="sidebar"],
            app-header:not(.ohc-navbar), app-footer:not(.ohc-footer),
            header:not(.ohc-navbar), footer:not(.ohc-footer),
            .header:not(.ohc-navbar), .footer:not(.ohc-footer),
            .mat-toolbar, mat-toolbar,
            .ohc-mobile-menu:not(#mobileMenu),
            router-outlet + * { 
                display: none !important; 
                width: 0 !important;
                height: 0 !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                overflow: hidden !important;
            }
            /* Force app-root to be full width */
            app-root {
                display: block !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        `;
        document.head.insertBefore(hideStyle, document.head.firstChild);
        
        // Then add Font Awesome and Google Fonts
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
        
        const fonts = document.createElement('link');
        fonts.rel = 'stylesheet';
        fonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(fonts);
        
        // Main styles
        const style = document.createElement('style');
        style.textContent = getCSS();
        document.head.appendChild(style);
    }
    
    function getCSS() {
        return `
            /* ========== ADDITIONAL RESETS ========== */
            app-root, app-root > * { display: block !important; visibility: visible !important; opacity: 1 !important; position: static !important; }
            app-root { width: 100% !important; margin: 0 !important; padding: 0 !important; left: 0 !important; }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { margin: 0 !important; padding: 0 !important; }
            body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; background: #f8fafc !important; }
            .ohc-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }
            
            /* ========== NAVBAR ========== */
            .ohc-navbar { 
                background: white; 
                padding: 14px 0; 
                box-shadow: 0 2px 20px rgba(0,0,0,0.08); 
                position: sticky; 
                top: 0; 
                z-index: 1000; 
                margin: 0 !important; 
            }
            .ohc-nav-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; }
            .ohc-logo-img { height: 42px; width: auto; object-fit: contain; }
            .ohc-nav-links { display: flex; gap: 6px; }
            .ohc-nav-link { 
                padding: 10px 16px; 
                color: #1e293b; 
                font-weight: 600; 
                text-decoration: none; 
                border-radius: 8px; 
                transition: all 0.2s; 
                background: none; 
                border: none; 
                cursor: pointer; 
                font-size: 14px; 
                display: flex; 
                align-items: center; 
                gap: 6px; 
            }
            .ohc-nav-link:hover { background: #f1f5f9; color: #2563eb; }
            .ohc-nav-dropdown { position: relative; }
            .ohc-mega-menu { display: none; position: absolute; top: 100%; left: 0; background: white; border-radius: 12px; box-shadow: 0 15px 50px rgba(0,0,0,0.15); padding: 24px; min-width: 300px; z-index: 100; border: 1px solid #e2e8f0; }
            .ohc-nav-dropdown:hover .ohc-mega-menu { display: flex; gap: 30px; }
            .ohc-mega-col h4 { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 14px; font-weight: 700; letter-spacing: 0.5px; }
            .ohc-mega-col a { display: block; padding: 8px 0; color: #334155; text-decoration: none; font-size: 14px; font-weight: 500; }
            .ohc-mega-col a:hover { color: #2563eb; }
            .ohc-nav-actions { display: flex; align-items: center; gap: 12px; }
            .ohc-btn-counseling { 
                background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                color: white; 
                padding: 11px 20px; 
                border-radius: 8px; 
                text-decoration: none; 
                font-weight: 600; 
                font-size: 13px; 
                display: flex; 
                align-items: center; 
                gap: 8px; 
                box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
                transition: all 0.2s;
                cursor: pointer;
                border: none;
            }
            .ohc-btn-counseling:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(5, 150, 105, 0.5); }
            .ohc-btn-login { 
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                color: white; 
                padding: 11px 22px; 
                border-radius: 8px; 
                border: none; 
                font-weight: 600; 
                cursor: pointer; 
                font-size: 13px; 
                box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
                transition: all 0.2s;
                text-decoration: none;
            }
            .ohc-btn-login:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5); }
            .ohc-mobile-menu-btn { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: #1e293b; }
            
            /* ========== HERO SECTION ========== */
            .ohc-hero { 
                background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%) !important; 
                padding: 60px 20px 80px !important; 
                margin: 0 !important; 
                position: relative;
                overflow: hidden;
            }
            .ohc-hero::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
                background-size: 30px 30px;
                opacity: 0.5;
            }
            .ohc-hero-content { max-width: 900px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
            .ohc-hero-title { 
                color: #ffffff !important; 
                font-size: 42px !important; 
                font-weight: 800 !important; 
                margin-bottom: 24px !important; 
                line-height: 1.2 !important; 
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .ohc-text-gradient { 
                background: linear-gradient(90deg, #60a5fa, #c084fc, #f472b6) !important; 
                -webkit-background-clip: text !important; 
                -webkit-text-fill-color: transparent !important; 
                background-clip: text !important;
            }
            .ohc-search-container { 
                background: white !important; 
                border-radius: 20px !important; 
                padding: 10px !important; 
                max-width: 720px !important; 
                margin: 0 auto 24px !important; 
                box-shadow: 0 25px 50px rgba(0,0,0,0.25) !important; 
            }
            .ohc-search-tabs { display: flex !important; gap: 6px; margin-bottom: 10px; padding: 6px; background: #f1f5f9; border-radius: 12px; }
            .ohc-search-tab { 
                flex: 1; 
                padding: 12px 16px; 
                background: transparent; 
                border: none; 
                border-radius: 10px; 
                cursor: pointer; 
                font-weight: 600; 
                color: #64748b; 
                font-size: 14px; 
                display: flex !important; 
                align-items: center; 
                justify-content: center; 
                gap: 8px; 
                transition: all 0.2s;
            }
            .ohc-search-tab:hover { background: white; color: #1e293b; }
            .ohc-search-tab.active { background: #2563eb !important; color: white !important; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
            .ohc-search-box { display: flex !important; gap: 10px; padding: 6px; }
            .ohc-search-input { 
                flex: 1; 
                padding: 16px 20px; 
                border: 2px solid #e2e8f0; 
                border-radius: 12px; 
                font-size: 16px; 
                font-weight: 500;
                color: #1e293b;
            }
            .ohc-search-input::placeholder { color: #94a3b8; }
            .ohc-search-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
            .ohc-search-btn { 
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                color: white; 
                padding: 16px 36px; 
                border: none; 
                border-radius: 12px; 
                font-weight: 700; 
                cursor: pointer; 
                font-size: 16px; 
                box-shadow: 0 4px 14px rgba(37,99,235,0.4);
                transition: all 0.2s;
            }
            .ohc-search-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,99,235,0.5); }
            
            /* Quick Links */
            .ohc-quick-links { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
            .ohc-pill { 
                background: rgba(255,255,255,0.12); 
                color: white; 
                padding: 12px 24px; 
                border-radius: 50px; 
                text-decoration: none; 
                font-size: 14px; 
                font-weight: 600; 
                backdrop-filter: blur(10px); 
                transition: all 0.3s;
                border: 1px solid rgba(255,255,255,0.2);
            }
            .ohc-pill:hover { 
                background: rgba(255,255,255,0.25); 
                transform: translateY(-3px); 
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            /* Stats */
            .ohc-stats-bar { display: flex; justify-content: center; gap: 60px; margin-top: 45px; }
            .ohc-stat { text-align: center; }
            .ohc-stat-number { 
                display: block; 
                color: #ffffff; 
                font-size: 36px; 
                font-weight: 800; 
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .ohc-stat-label { 
                color: rgba(255,255,255,0.85); 
                font-size: 14px; 
                font-weight: 500;
                margin-top: 4px;
            }
            
            /* ========== SECTIONS ========== */
            .ohc-section { padding: 60px 20px; margin: 0 !important; }
            .ohc-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
            .ohc-section-title { 
                font-size: 28px; 
                font-weight: 800; 
                color: #0f172a; 
                display: flex; 
                align-items: center; 
                gap: 14px; 
            }
            .ohc-section-title i { 
                color: #2563eb; 
                font-size: 24px; 
                background: #eff6ff;
                padding: 12px;
                border-radius: 12px;
            }
            .ohc-section-title.ohc-center { justify-content: center; margin-bottom: 40px; }
            .ohc-view-all { 
                color: #2563eb; 
                text-decoration: none; 
                font-weight: 600; 
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: gap 0.2s;
            }
            .ohc-view-all:hover { gap: 10px; }
            
            /* Quick Tools */
            .ohc-quick-tools { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 50px 20px; }
            .ohc-tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
            .ohc-tool-card { 
                background: white; 
                border-radius: 16px; 
                padding: 24px; 
                text-decoration: none; 
                display: flex; 
                align-items: center; 
                gap: 16px; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                transition: all 0.3s;
                border: 1px solid #e2e8f0;
                cursor: pointer;
            }
            .ohc-tool-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.1); }
            .ohc-tool-card.ohc-tool-highlight { 
                background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                border: none;
            }
            .ohc-tool-card.ohc-tool-highlight h3, .ohc-tool-card.ohc-tool-highlight p { color: white !important; }
            .ohc-tool-card.ohc-tool-highlight .ohc-tool-icon { background: rgba(255,255,255,0.2); color: white; }
            .ohc-tool-icon { 
                width: 50px; 
                height: 50px; 
                background: #eff6ff; 
                border-radius: 12px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: #2563eb; 
                font-size: 20px; 
                flex-shrink: 0;
            }
            .ohc-tool-content h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
            .ohc-tool-content p { font-size: 13px; color: #64748b; }
            
            /* Featured Colleges */
            .ohc-college-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
            .ohc-college-card { 
                background: white; 
                border-radius: 16px; 
                overflow: hidden; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                transition: all 0.3s;
                text-decoration: none;
                display: block;
                border: 1px solid #e2e8f0;
            }
            .ohc-college-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.12); }
            .ohc-college-img { 
                height: 160px; 
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                position: relative;
            }
            .ohc-college-img img { width: 100%; height: 100%; object-fit: cover; }
            .ohc-college-badge { 
                position: absolute; 
                top: 12px; 
                right: 12px; 
                background: rgba(255,255,255,0.95); 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 11px; 
                font-weight: 700; 
                color: #059669;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .ohc-college-info { padding: 20px; }
            .ohc-college-info h3 { 
                font-size: 17px; 
                font-weight: 700; 
                color: #0f172a; 
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .ohc-college-location { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; margin-bottom: 12px; font-weight: 500; }
            
            /* Exams Tags */
            .ohc-exams-section { background: #f8fafc; }
            .ohc-exams-tags { display: flex; flex-wrap: wrap; gap: 12px; }
            .ohc-exam-tag { 
                background: white; 
                border: 2px solid #e2e8f0; 
                padding: 14px 24px; 
                border-radius: 50px; 
                text-decoration: none; 
                color: #334155; 
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s;
            }
            .ohc-exam-tag:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
            
            /* Predictor Section */
            .ohc-predictor-section { 
                background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); 
                padding: 60px 20px; 
            }
            .ohc-predictor-section .ohc-section-title { color: white; justify-content: center; margin-bottom: 20px; }
            .ohc-predictor-section .ohc-section-title i { background: rgba(255,255,255,0.2); color: white; }
            .ohc-predictor-subtitle { color: rgba(255,255,255,0.8); text-align: center; margin-bottom: 30px; font-size: 16px; }
            
            /* Exam Selector Grid */
            .ohc-exam-selector { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 30px; }
            .ohc-exam-select-btn { 
                background: rgba(255,255,255,0.1); 
                border: 2px solid rgba(255,255,255,0.3); 
                color: white; 
                padding: 12px 24px; 
                border-radius: 50px; 
                font-weight: 600; 
                font-size: 14px; 
                cursor: pointer;
                transition: all 0.3s;
            }
            .ohc-exam-select-btn:hover { background: rgba(255,255,255,0.2); }
            .ohc-exam-select-btn.active { background: white; color: #1e40af; border-color: white; }
            
            /* Predictor Results */
            .ohc-predictor-results { 
                background: rgba(255,255,255,0.1); 
                border-radius: 20px; 
                padding: 30px; 
                backdrop-filter: blur(10px);
                max-height: 400px;
                overflow-y: auto;
            }
            .ohc-predictor-results::-webkit-scrollbar { width: 8px; }
            .ohc-predictor-results::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 4px; }
            .ohc-predictor-results::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
            .ohc-predictor-college { 
                display: flex; 
                align-items: center; 
                gap: 16px; 
                padding: 16px; 
                background: rgba(255,255,255,0.1); 
                border-radius: 12px; 
                margin-bottom: 12px;
                text-decoration: none;
                transition: all 0.2s;
            }
            .ohc-predictor-college:hover { background: rgba(255,255,255,0.2); transform: translateX(5px); }
            .ohc-predictor-college:last-child { margin-bottom: 0; }
            .ohc-predictor-college-logo { 
                width: 60px; 
                height: 60px; 
                background: white; 
                border-radius: 12px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                overflow: hidden;
                flex-shrink: 0;
            }
            .ohc-predictor-college-logo img { width: 100%; height: 100%; object-fit: cover; }
            .ohc-predictor-college-logo i { font-size: 24px; color: #1e40af; }
            .ohc-predictor-college-info h4 { color: white; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
            .ohc-predictor-college-info p { color: rgba(255,255,255,0.7); font-size: 13px; }
            .ohc-no-results { color: rgba(255,255,255,0.7); text-align: center; padding: 40px; font-size: 16px; }
            
            /* Categories */
            .ohc-categories { background: white; }
            .ohc-category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
            .ohc-category-card { 
                background: #f8fafc; 
                border-radius: 16px; 
                padding: 24px 16px; 
                text-align: center; 
                text-decoration: none;
                transition: all 0.3s;
                border: 2px solid transparent;
            }
            .ohc-category-card:hover { border-color: #2563eb; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(37,99,235,0.15); }
            .ohc-cat-icon { 
                width: 60px; 
                height: 60px; 
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                border-radius: 16px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin: 0 auto 14px; 
                color: white; 
                font-size: 24px;
            }
            .ohc-category-card h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
            .ohc-category-card p { font-size: 12px; color: #64748b; }
            
            /* Trending */
            .ohc-trending { background: #f8fafc; }
            .ohc-trending-tags { display: flex; flex-wrap: wrap; gap: 12px; }
            .ohc-trending-tag { 
                background: white; 
                border: 2px solid #e2e8f0; 
                padding: 14px 20px; 
                border-radius: 12px; 
                text-decoration: none; 
                color: #334155; 
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s;
            }
            .ohc-trending-tag:hover { border-color: #f97316; background: #fff7ed; color: #f97316; }
            
            /* Events */
            .ohc-events-section { background: white; }
            .ohc-events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .ohc-event-card { 
                background: #f8fafc; 
                border-radius: 16px; 
                padding: 24px; 
                text-decoration: none;
                transition: all 0.3s;
                border: 2px solid transparent;
            }
            .ohc-event-card:hover { border-color: #8b5cf6; transform: translateY(-5px); }
            .ohc-event-date { 
                display: inline-flex; 
                align-items: center; 
                gap: 8px; 
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                color: white; 
                padding: 8px 14px; 
                border-radius: 8px; 
                font-size: 12px; 
                font-weight: 600; 
                margin-bottom: 14px;
            }
            .ohc-event-card h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; line-height: 1.4; }
            .ohc-event-card p { font-size: 13px; color: #64748b; line-height: 1.5; }
            
            /* Articles */
            .ohc-articles-section { background: #f8fafc; }
            .ohc-articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
            .ohc-article-card { 
                background: white; 
                border-radius: 16px; 
                overflow: hidden; 
                text-decoration: none;
                box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                transition: all 0.3s;
            }
            .ohc-article-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.12); }
            .ohc-article-img { height: 180px; background: #e2e8f0; overflow: hidden; }
            .ohc-article-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
            .ohc-article-card:hover .ohc-article-img img { transform: scale(1.05); }
            .ohc-article-content { padding: 20px; }
            .ohc-article-content h3 { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 10px; line-height: 1.4; }
            .ohc-article-content p { font-size: 14px; color: #64748b; line-height: 1.6; }
            
            /* CTA Section */
            .ohc-cta-section { 
                background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                padding: 60px 20px; 
                text-align: center; 
            }
            .ohc-cta-content { max-width: 700px; margin: 0 auto; }
            .ohc-cta-content h2 { color: white; font-size: 32px; font-weight: 800; margin-bottom: 16px; }
            .ohc-cta-content p { color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 28px; }
            .ohc-cta-btn { 
                display: inline-flex; 
                align-items: center; 
                gap: 10px; 
                background: white; 
                color: #059669; 
                padding: 16px 36px; 
                border-radius: 12px; 
                text-decoration: none; 
                font-weight: 700; 
                font-size: 16px;
                transition: all 0.3s;
                cursor: pointer;
                border: none;
            }
            .ohc-cta-btn:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
            
            /* Footer */
            .ohc-footer { background: #0f172a; color: white; padding: 60px 20px 30px; margin: 0 !important; }
            .ohc-footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 40px; }
            .ohc-footer-col h4 { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: white; }
            .ohc-footer-col a { display: block; color: #94a3b8; text-decoration: none; margin-bottom: 12px; font-size: 14px; transition: color 0.2s; }
            .ohc-footer-col a:hover { color: white; }
            .ohc-footer-bottom { border-top: 1px solid #1e293b; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
            .ohc-footer-copy { color: #64748b; font-size: 14px; }
            .ohc-footer-social { display: flex; gap: 16px; }
            .ohc-footer-social a { color: #64748b; font-size: 20px; transition: color 0.2s; }
            .ohc-footer-social a:hover { color: white; }
            
            /* WhatsApp Button */
            .ohc-whatsapp-btn { 
                position: fixed; 
                bottom: 80px; 
                right: 24px; 
                width: 60px; 
                height: 60px; 
                background: #25d366; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-size: 28px; 
                box-shadow: 0 4px 20px rgba(37, 211, 102, 0.5);
                z-index: 999;
                transition: all 0.3s;
            }
            .ohc-whatsapp-btn:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6); }
            
            /* Footer Notification */
            .ohc-footer-notification { 
                position: fixed; 
                bottom: 0; 
                left: 0; 
                right: 0; 
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
                color: white; 
                padding: 12px 20px; 
                z-index: 998; 
                display: none;
            }
            .ohc-notification-content { 
                max-width: 1280px; 
                margin: 0 auto; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                gap: 12px;
            }
            .ohc-notification-content i { font-size: 18px; }
            .ohc-notification-content span { font-weight: 600; font-size: 14px; }
            .ohc-notification-content a { color: white; font-weight: 700; text-decoration: underline; margin-left: 8px; }
            .ohc-notification-close { 
                background: none; 
                border: none; 
                color: white; 
                font-size: 20px; 
                cursor: pointer; 
                padding: 5px;
                margin-left: 20px;
            }
            
            /* Mobile Menu */
            #mobileMenu { display: none !important; visibility: hidden; height: 0; overflow: hidden; 
                display: none; 
                position: fixed; 
                top: 70px; 
                left: 0; 
                right: 0; 
                background: white; 
                padding: 20px; 
                z-index: 999; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                max-height: calc(100vh - 70px);
                overflow-y: auto;
            }
            #mobileMenu.active { display: block !important; visibility: visible !important; height: auto !important; overflow: auto !important; }
            
            /* Loading */
            .ohc-loading { text-align: center; padding: 40px; color: #64748b; font-size: 24px; }
            
            /* ========== COUNSELING FORM MODAL ========== */
            .ohc-modal-overlay { display: none !important; position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 2000; backdrop-filter: blur(5px); align-items: center; justify-content: center; padding: 20px; }
            .ohc-modal-overlay.active { display: flex !important; }
            .ohc-modal {
                background: white;
                border-radius: 20px;
                width: 100%;
                max-width: 550px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px rgba(0,0,0,0.25);
                animation: slideUp 0.3s ease;
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .ohc-modal-header {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                padding: 24px;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .ohc-modal-header h2 { font-size: 22px; font-weight: 700; }
            .ohc-modal-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .ohc-modal-close:hover { background: rgba(255,255,255,0.3); }
            .ohc-modal-body { padding: 24px; }
            .ohc-form-group { margin-bottom: 18px; }
            .ohc-form-group label {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            .ohc-form-group label span { color: #dc2626; }
            .ohc-form-input, .ohc-form-select {
                width: 100%;
                padding: 14px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 15px;
                color: #1f2937;
                transition: all 0.2s;
                background: white;
            }
            .ohc-form-input:focus, .ohc-form-select:focus {
                outline: none;
                border-color: #059669;
                box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
            }
            .ohc-form-input::placeholder { color: #9ca3af; }
            .ohc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .ohc-captcha-group {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #f3f4f6;
                padding: 16px;
                border-radius: 10px;
            }
            .ohc-captcha-text {
                font-size: 24px;
                font-weight: 800;
                color: #1f2937;
                letter-spacing: 6px;
                user-select: none;
                background: #f3f4f6;
                color: #059669 !important;
                
                text-decoration: line-through;
                font-style: italic;
            }
            .ohc-captcha-refresh {
                background: #059669;
                color: white;
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .ohc-captcha-refresh:hover { background: #047857; }
            .ohc-captcha-input { flex: 1; }
            .ohc-form-submit {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .ohc-form-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(5, 150, 105, 0.4); }
            .ohc-form-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
            .ohc-form-success, .ohc-form-error {
                padding: 14px;
                border-radius: 10px;
                margin-bottom: 18px;
                font-size: 14px;
                font-weight: 600;
                display: none;
            }
            .ohc-form-success { background: #d1fae5; color: #065f46; }
            .ohc-form-error { background: #fee2e2; color: #991b1b; }
            .ohc-form-success.show, .ohc-form-error.show { display: block; }
            
            /* Mobile */
            @media (max-width: 768px) {
                .ohc-nav-links { display: none; }
                .ohc-mobile-menu-btn { display: block; }
                .ohc-hero-title { font-size: 28px !important; }
                .ohc-stats-bar { gap: 24px; flex-wrap: wrap; }
                .ohc-stat-number { font-size: 28px; }
                .ohc-search-box { flex-direction: column; }
                .ohc-search-btn { width: 100%; }
                .ohc-form-row { grid-template-columns: 1fr; }
                .ohc-modal { margin: 10px; }
            }
        `;
    }
    
    function getHomepageHTML() {
        return `
        <!-- Navbar -->
        <nav class="ohc-navbar">
            <div class="ohc-nav-container">
                <a href="/"><img src="https://ohcampus.com/assets/images/logo/logo.png" alt="OhCampus" class="ohc-logo-img"></a>
                <div class="ohc-nav-links">
                    <div class="ohc-nav-dropdown">
                        <a href="/allCollegeList" class="ohc-nav-link">Colleges <i class="fas fa-chevron-down"></i></a>
                        <div class="ohc-mega-menu">
                            <div class="ohc-mega-col">
                                <h4>By Stream</h4>
                                <a href="/allCollegeList/menu/1/6">Engineering</a>
                                <a href="/allCollegeList/menu/2/7">Medical</a>
                                <a href="/allCollegeList/menu/3/8">Management</a>
                                <a href="/allCollegeList/menu/4/9">Law</a>
                            </div>
                            <div class="ohc-mega-col">
                                <h4>Top Cities</h4>
                                <a href="/allCollegeList/menu/1/6">Bangalore</a>
                                <a href="/allCollegeList/menu/1/7">Mumbai</a>
                                <a href="/allCollegeList/menu/1/8">Delhi</a>
                            </div>
                        </div>
                    </div>
                    <div class="ohc-nav-dropdown">
                        <a href="/courses" class="ohc-nav-link">Courses <i class="fas fa-chevron-down"></i></a>
                        <div class="ohc-mega-menu">
                            <div class="ohc-mega-col">
                                <h4>Popular Courses</h4>
                                <a href="/allCollegeList/bycategory/course/1">B.Tech</a>
                                <a href="/allCollegeList/bycategory/course/2">MBA</a>
                                <a href="/allCollegeList/bycategory/course/3">MBBS</a>
                                <a href="/allCollegeList/bycategory/course/4">LLB</a>
                            </div>
                        </div>
                    </div>
                    <div class="ohc-nav-dropdown">
                        <a href="/exams" class="ohc-nav-link">Exams <i class="fas fa-chevron-down"></i></a>
                        <div class="ohc-mega-menu">
                            <div class="ohc-mega-col">
                                <h4>Top Exams</h4>
                                <a href="/examsdetails/jee-main">JEE Main</a>
                                <a href="/examsdetails/neet">NEET</a>
                                <a href="/examsdetails/cat">CAT</a>
                                <a href="/examsdetails/gate">GATE</a>
                            </div>
                        </div>
                    </div>
                    <a href="/check-scholarship" class="ohc-nav-link">Scholarships</a>
                    <a href="/articles" class="ohc-nav-link">Articles</a>
                </div>
                <div class="ohc-nav-actions">
                    <button class="ohc-btn-counseling" onclick="openCounselingModal()"><i class="fas fa-headset"></i> Free Counseling</button>
                    <a href="/sign-in" class="ohc-btn-login">Login</a>
                    <button class="ohc-mobile-menu-btn" onclick="toggleMobileMenu()"><i class="fas fa-bars"></i></button>
                </div>
            </div>
        </nav>
        
        <!-- Mobile Menu -->
        <div id="mobileMenu">
            <a href="/allCollegeList" style="display: block; padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #1e293b; text-decoration: none; font-size: 16px; font-weight: 600;">Colleges</a>
            <a href="/courses" style="display: block; padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #1e293b; text-decoration: none; font-size: 16px; font-weight: 600;">Courses</a>
            <a href="/exams" style="display: block; padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #1e293b; text-decoration: none; font-size: 16px; font-weight: 600;">Exams</a>
            <a href="/check-scholarship" style="display: block; padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #1e293b; text-decoration: none; font-size: 16px; font-weight: 600;">Scholarships</a>
            <a href="/articles" style="display: block; padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #1e293b; text-decoration: none; font-size: 16px; font-weight: 600;">Articles</a>
            <button onclick="openCounselingModal()" style="display: block; width: 100%; padding: 16px 0; border-bottom: 1px solid #e5e7eb; color: #059669; background: none; border-left: none; border-right: none; border-top: none; text-decoration: none; font-size: 16px; font-weight: 600; cursor: pointer; text-align: left;">Free Counseling</button>
        </div>
        
        <!-- Hero -->
        <section class="ohc-hero">
            <div class="ohc-hero-content">
                <h1 class="ohc-hero-title">Find Colleges, Courses & Exams <span class="ohc-text-gradient">Best for You</span></h1>
                <div class="ohc-search-container">
                    <div class="ohc-search-tabs">
                        <button class="ohc-search-tab active" data-type="colleges"><i class="fas fa-university"></i> Colleges</button>
                        <button class="ohc-search-tab" data-type="courses"><i class="fas fa-book"></i> Courses</button>
                        <button class="ohc-search-tab" data-type="exams"><i class="fas fa-file-alt"></i> Exams</button>
                    </div>
                    <div class="ohc-search-box">
                        <input type="text" class="ohc-search-input" id="mainSearch" placeholder="Search Colleges, Courses, Exams...">
                        <button class="ohc-search-btn" onclick="performSearch()">Search</button>
                    </div>
                </div>
                <div class="ohc-quick-links">
                    <a href="/allCollegeList/menu/3/6" class="ohc-pill">MBA</a>
                    <a href="/allCollegeList/menu/1/6" class="ohc-pill">B.TECH</a>
                    <a href="/allCollegeList/menu/2/7" class="ohc-pill">MEDICAL</a>
                    <a href="/allCollegeList/menu/6/11" class="ohc-pill">DESIGN</a>
                    <a href="/allCollegeList/menu/4/9" class="ohc-pill">LAW</a>
                </div>
                <div class="ohc-stats-bar">
                    <div class="ohc-stat"><span class="ohc-stat-number" id="collegeCount">10,000+</span><span class="ohc-stat-label">Colleges</span></div>
                    <div class="ohc-stat"><span class="ohc-stat-number" id="courseCount">6,000+</span><span class="ohc-stat-label">Courses</span></div>
                    <div class="ohc-stat"><span class="ohc-stat-number">50,000+</span><span class="ohc-stat-label">Reviews</span></div>
                    <div class="ohc-stat"><span class="ohc-stat-number" id="examCount">200+</span><span class="ohc-stat-label">Exams</span></div>
                </div>
            </div>
        </section>
        
        <!-- Quick Tools -->
        <section class="ohc-quick-tools">
            <div class="ohc-container">
                <h2 class="ohc-section-title ohc-center"><i class="fas fa-rocket"></i> Quick Tools</h2>
                <div class="ohc-tools-grid">
                    <button class="ohc-tool-card ohc-tool-highlight" onclick="openCounselingModal()"><div class="ohc-tool-icon"><i class="fas fa-headset"></i></div><div class="ohc-tool-content"><h3>Free Counseling</h3><p>Expert guidance</p></div></button>
                    <a href="/allCollegeList" class="ohc-tool-card"><div class="ohc-tool-icon"><i class="fas fa-university"></i></div><div class="ohc-tool-content"><h3>College Finder</h3><p>Find your match</p></div></a>
                    <a href="/compare" class="ohc-tool-card"><div class="ohc-tool-icon"><i class="fas fa-balance-scale"></i></div><div class="ohc-tool-content"><h3>Compare</h3><p>Side by side</p></div></a>
                    <a href="/check-scholarship" class="ohc-tool-card"><div class="ohc-tool-icon"><i class="fas fa-award"></i></div><div class="ohc-tool-content"><h3>Scholarships</h3><p>Check eligibility</p></div></a>
                </div>
            </div>
        </section>
        
        <!-- Featured Colleges -->
        <section class="ohc-section">
            <div class="ohc-container">
                <div class="ohc-section-header">
                    <h2 class="ohc-section-title"><i class="fas fa-star"></i> Featured Colleges</h2>
                    <a href="/allCollegeList" class="ohc-view-all">View All <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="ohc-college-grid" id="featuredColleges"><div class="ohc-loading"><i class="fas fa-spinner fa-spin"></i></div></div>
            </div>
        </section>
        
        <!-- Predict Colleges Based on Exams -->
        <section class="ohc-predictor-section">
            <div class="ohc-container">
                <h2 class="ohc-section-title"><i class="fas fa-chart-bar"></i> Predict Colleges Based on Exams</h2>
                <p class="ohc-predictor-subtitle">Select an exam to see colleges that accept it for admissions</p>
                <div class="ohc-exam-selector" id="examSelector">
                    <div class="ohc-loading"><i class="fas fa-spinner fa-spin"></i></div>
                </div>
                <div class="ohc-predictor-results" id="predictorResults">
                    <div class="ohc-no-results">Select an exam above to see accepting colleges</div>
                </div>
            </div>
        </section>
        
        <!-- Top Exams -->
        <section class="ohc-section ohc-exams-section">
            <div class="ohc-container">
                <div class="ohc-section-header">
                    <h2 class="ohc-section-title"><i class="fas fa-calendar-alt"></i> Top Exams</h2>
                    <a href="/exams" class="ohc-view-all">View All <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="ohc-exams-tags" id="topExams"><div class="ohc-loading"><i class="fas fa-spinner fa-spin"></i></div></div>
            </div>
        </section>
        
        <!-- Categories -->
        <section class="ohc-section ohc-categories">
            <div class="ohc-container">
                <h2 class="ohc-section-title ohc-center"><i class="fas fa-th-large"></i> Explore by Category</h2>
                <div class="ohc-category-grid">
                    <a href="/allCollegeList/menu/1/6" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-cogs"></i></div><h3>Engineering</h3><p>B.Tech, M.Tech</p></a>
                    <a href="/allCollegeList/menu/2/7" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-stethoscope"></i></div><h3>Medical</h3><p>MBBS, BDS</p></a>
                    <a href="/allCollegeList/menu/3/8" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-briefcase"></i></div><h3>Management</h3><p>MBA, BBA</p></a>
                    <a href="/allCollegeList/menu/4/9" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-balance-scale"></i></div><h3>Law</h3><p>LLB, BA LLB</p></a>
                    <a href="/allCollegeList/menu/5/10" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-flask"></i></div><h3>Science</h3><p>B.Sc, M.Sc</p></a>
                    <a href="/allCollegeList/searchcollege/Arts" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-palette"></i></div><h3>Arts</h3><p>BA, MA</p></a>
                    <a href="/allCollegeList/searchcollege/Commerce" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-chart-line"></i></div><h3>Commerce</h3><p>B.Com, CA</p></a>
                    <a href="/allCollegeList/menu/6/11" class="ohc-category-card"><div class="ohc-cat-icon"><i class="fas fa-paint-brush"></i></div><h3>Design</h3><p>B.Des, M.Des</p></a>
                </div>
            </div>
        </section>
        
        <!-- Trending -->
        <section class="ohc-section ohc-trending">
            <div class="ohc-container">
                <div class="ohc-section-header">
                    <h2 class="ohc-section-title"><i class="fas fa-fire"></i> Trending Colleges</h2>
                    <a href="/allCollegeList" class="ohc-view-all">View All <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="ohc-trending-tags" id="trendingColleges"><div class="ohc-loading"><i class="fas fa-spinner fa-spin"></i></div></div>
            </div>
        </section>
        
        <!-- Events -->
        <section class="ohc-section ohc-events-section">
            <div class="ohc-container">
                <div class="ohc-section-header">
                    <h2 class="ohc-section-title"><i class="fas fa-calendar-check"></i> Upcoming Events</h2>
                    <a href="/events" class="ohc-view-all">View All <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="ohc-events-grid" id="upcomingEvents"><div class="ohc-loading"><i class="fas fa-spinner fa-spin"></i></div></div>
            </div>
        </section>
        
        <!-- Articles -->
        <section class="ohc-section ohc-articles-section">
            <div class="ohc-container">
                <div class="ohc-section-header">
                    <h2 class="ohc-section-title"><i class="fas fa-newspaper"></i> Latest Articles</h2>
                    <a href="/articles" class="ohc-view-all">View All <i class="fas fa-arrow-right"></i></a>
                </div>
                <div class="ohc-articles-grid" id="latestArticles"><div class="ohc-loading"><i class="fas fa-spinner fa-spin"></i></div></div>
            </div>
        </section>
        
        <!-- CTA -->
        <section class="ohc-cta-section">
            <div class="ohc-cta-content">
                <h2>Need Help Choosing the Right College?</h2>
                <p>Get personalized guidance from our expert counselors. We're here to help you make the best decision for your future.</p>
                <button class="ohc-cta-btn" onclick="openCounselingModal()"><i class="fas fa-headset"></i> Get Free Counseling</button>
            </div>
        </section>
        
        <!-- Footer -->
        <footer class="ohc-footer">
            <div class="ohc-container">
                <div class="ohc-footer-grid">
                    <div class="ohc-footer-col">
                        <h4>Quick Links</h4>
                        <a href="/allCollegeList">All Colleges</a>
                        <a href="/courses">All Courses</a>
                        <a href="/exams">All Exams</a>
                        <a href="/check-scholarship">Scholarships</a>
                        <a href="/articles">Articles</a>
                    </div>
                    <div class="ohc-footer-col">
                        <h4>Top Courses</h4>
                        <a href="/allCollegeList/bycategory/course/1">B.Tech</a>
                        <a href="/allCollegeList/bycategory/course/2">MBA</a>
                        <a href="/allCollegeList/bycategory/course/3">MBBS</a>
                        <a href="/allCollegeList/bycategory/course/4">LLB</a>
                    </div>
                    <div class="ohc-footer-col">
                        <h4>Resources</h4>
                        <a href="/aboutus">About Us</a>
                        <a href="/contactus">Contact Us</a>
                        <button onclick="openCounselingModal()" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:0;font-size:14px;text-align:left;">Free Counseling</button>
                        <a href="/privacy-policy">Privacy Policy</a>
                    </div>
                    <div class="ohc-footer-col">
                        <h4>Contact</h4>
                        <a href="tel:+919148484475"><i class="fas fa-phone"></i> +91 9148484475</a>
                        <a href="mailto:info@ohcampus.com"><i class="fas fa-envelope"></i> info@ohcampus.com</a>
                    </div>
                </div>
                <div class="ohc-footer-bottom">
                    <span class="ohc-footer-copy">© 2024 OhCampus. All rights reserved.</span>
                    <div class="ohc-footer-social">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
        </footer>
        
        <!-- WhatsApp Button -->
        <a href="https://wa.me/919148484475" target="_blank" class="ohc-whatsapp-btn"><i class="fab fa-whatsapp"></i></a>
        
        <!-- Footer Notification -->
        <div class="ohc-footer-notification" id="footerNotification">
            <div class="ohc-notification-content">
                <i class="fas fa-bell"></i>
                <span id="notificationText">Loading notifications...</span>
                <button class="ohc-notification-close" onclick="closeNotification()">×</button>
            </div>
        </div>
        
        <!-- Counseling Form Modal -->
        <div class="ohc-modal-overlay" id="counselingModal">
            <div class="ohc-modal">
                <div class="ohc-modal-header">
                    <h2><i class="fas fa-headset"></i> Free Counseling</h2>
                    <button class="ohc-modal-close" onclick="closeCounselingModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="ohc-modal-body">
                    <div class="ohc-form-success" id="formSuccess">
                        <i class="fas fa-check-circle"></i> Your enquiry has been submitted successfully! We will contact you soon.
                    </div>
                    <div class="ohc-form-error" id="formError">
                        <i class="fas fa-exclamation-circle"></i> <span id="errorText">Something went wrong. Please try again.</span>
                    </div>
                    <form id="counselingForm" onsubmit="submitCounselingForm(event)">
                        <div class="ohc-form-row">
                            <div class="ohc-form-group">
                                <label>Name <span>*</span></label>
                                <input type="text" class="ohc-form-input" id="formName" placeholder="Enter your name" required>
                            </div>
                            <div class="ohc-form-group">
                                <label>Email <span>*</span></label>
                                <input type="email" class="ohc-form-input" id="formEmail" placeholder="Enter your email" required>
                            </div>
                        </div>
                        <div class="ohc-form-row">
                            <div class="ohc-form-group">
                                <label>Phone <span>*</span></label>
                                <input type="tel" class="ohc-form-input" id="formPhone" placeholder="Enter phone number" required pattern="[0-9]{10}">
                            </div>
                            <div class="ohc-form-group">
                                <label>State <span>*</span></label>
                                <select class="ohc-form-select" id="formState" required onchange="loadCitiesByState()">
                                    <option value="">Select State</option>
                                </select>
                            </div>
                        </div>
                        <div class="ohc-form-row">
                            <div class="ohc-form-group">
                                <label>City <span>*</span></label>
                                <select class="ohc-form-select" id="formCity" required>
                                    <option value="">Select City</option>
                                </select>
                            </div>
                            <div class="ohc-form-group">
                                <label>Course Category <span>*</span></label>
                                <select class="ohc-form-select" id="formCategory" required onchange="loadCoursesByCategory()">
                                    <option value="">Select Category</option>
                                </select>
                            </div>
                        </div>
                        <div class="ohc-form-row">
                            <div class="ohc-form-group">
                                <label>Course <span>*</span></label>
                                <select class="ohc-form-select" id="formCourse" required>
                                    <option value="">Select Course</option>
                                </select>
                            </div>
                            <div class="ohc-form-group">
                                <label>Interested In <span>*</span></label>
                                <select class="ohc-form-select" id="formInterested" required>
                                    <option value="">Select Option</option>
                                    <option value="Management Seat">Management Seat</option>
                                    <option value="Government Seat">Government Seat</option>
                                </select>
                            </div>
                        </div>
                        <div class="ohc-form-group">
                            <label>Enter Captcha <span>*</span></label>
                            <div class="ohc-captcha-group">
                                <span class="ohc-captcha-text" id="captchaText"></span>
                                <button type="button" class="ohc-captcha-refresh" onclick="generateCaptcha()"><i class="fas fa-sync-alt"></i></button>
                                <input type="text" class="ohc-form-input ohc-captcha-input" id="formCaptcha" placeholder="Enter captcha" required>
                            </div>
                        </div>
                        <button type="submit" class="ohc-form-submit" id="submitBtn">
                            <i class="fas fa-paper-plane"></i> Submit Enquiry
                        </button>
                    </form>
                </div>
            </div>
        </div>
        `;
    }
    
    // Global Variables
    let currentCaptcha = '';
    let allExamsData = [];
    
    // Captcha Functions
    window.generateCaptcha = function() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        currentCaptcha = '';
        for (let i = 0; i < 6; i++) {
            currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('captchaText').textContent = currentCaptcha;
    };
    
    // Modal Functions
    window.openCounselingModal = function() {
        document.getElementById('counselingModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        generateCaptcha();
        document.getElementById('formSuccess').classList.remove('show');
        document.getElementById('formError').classList.remove('show');
    };
    
    window.closeCounselingModal = function() {
        document.getElementById('counselingModal').classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // Load States
    window.loadStatesForForm = async function() {
        try {
            const response = await fetch(API_BASE + '/State/getStateList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (data.response_code === '200' && data.data) {
                const select = document.getElementById('formState');
                if (select) {
                    select.innerHTML = '<option value="">Select State</option>';
                    data.data.forEach(state => {
                        select.innerHTML += '<option value="' + state.id + '">' + state.statename + '</option>';
                    });
                }
            }
        } catch (e) {
            console.error('Error loading states:', e);
        }
    };
    
    // Load Cities by State
    window.loadCitiesByState = async function() {
        const stateId = document.getElementById('formState').value;
        if (!stateId) return;
        
        try {
            const response = await fetch(API_BASE + '/City/getCityByState', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stateid: stateId, search: '' })
            });
            const data = await response.json();
            if (data.response_code === '200' && data.data) {
                const select = document.getElementById('formCity');
                select.innerHTML = '<option value="">Select City</option>';
                data.data.forEach(city => {
                    select.innerHTML += '<option value="' + city.id + '">' + city.city + '</option>';
                });
            }
        } catch (e) {
            console.error('Error loading cities:', e);
        }
    };
    
    // Load Academic Categories
    window.loadAcademicCategories = async function() {
        try {
            const response = await fetch(API_BASE + '/Category/getAcadamicCategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (data.response_code === '200' && data.latest_blogs) {
                const select = document.getElementById('formCategory');
                if (select) {
                    select.innerHTML = '<option value="">Select Category</option>';
                    data.response_data.forEach(cat => {
                        select.innerHTML += '<option value="' + cat.category_id + '">' + cat.name + '</option>';
                    });
                }
            }
        } catch (e) {
            console.error('Error loading categories:', e);
        }
    };
    
    // Load Courses by Category
    window.loadCoursesByCategory = async function() {
        const categoryId = document.getElementById('formCategory').value;
        if (!categoryId) return;
        
        try {
            const response = await fetch(API_BASE + '/Courses/getCourseByCategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId: categoryId, search: '' })
            });
            const data = await response.json();
            if (data.response_code === '200' && data.data) {
                const select = document.getElementById('formCourse');
                select.innerHTML = '<option value="">Select Course</option>';
                data.data.forEach(course => {
                    select.innerHTML += '<option value="' + course.id + '">' + course.name + '</option>';
                });
            }
        } catch (e) {
            console.error('Error loading courses:', e);
        }
    };
    
    // Submit Counseling Form
    window.submitCounselingForm = async function(e) {
        e.preventDefault();
        
        const captchaInput = document.getElementById('formCaptcha').value;
        if (captchaInput !== currentCaptcha) {
            document.getElementById('formError').classList.add('show');
            document.getElementById('errorText').textContent = 'Invalid captcha. Please try again.';
            generateCaptcha();
            return;
        }
        
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        const formData = {
            firstName: document.getElementById('formName').value,
            lastName: '',
            email: document.getElementById('formEmail').value,
            phone: document.getElementById('formPhone').value,
            state: document.getElementById('formState').value,
            city: document.getElementById('formCity').value,
            courseCategory: document.getElementById('formCategory').value,
            course: document.getElementById('formCourse').value,
            intrestedIn: document.getElementById('formInterested').value
        };
        
        try {
            const response = await fetch(API_BASE + '/Courses/saveCourseInquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (data.response_code === '200') {
                document.getElementById('formSuccess').classList.add('show');
                document.getElementById('formError').classList.remove('show');
                document.getElementById('counselingForm').reset();
                generateCaptcha();
            } else {
                document.getElementById('formError').classList.add('show');
                document.getElementById('errorText').textContent = data.response_message || 'Something went wrong.';
            }
        } catch (e) {
            document.getElementById('formError').classList.add('show');
            document.getElementById('errorText').textContent = 'Network error. Please try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Enquiry';
        }
    };
    
    // Load All Exams for Predictor
    window.loadAllExamsForPredictor = async function() {
        try {
            const response = await fetch(API_BASE + '/Exam/getExamList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: '' })
            });
            const data = await response.json();
            if (data.response_code === '200' && data.latest_blogs) {
                allExamsData = data.response_data;
                renderExamSelector(data.response_data.slice(0, 10));
            }
        } catch (e) {
            console.error('Error loading exams for predictor:', e);
            const container = document.getElementById('examSelector');
            if (container) container.innerHTML = '<p style="color:rgba(255,255,255,0.7)">Unable to load exams</p>';
        }
    };
    
    function renderExamSelector(exams) {
        const container = document.getElementById('examSelector');
        if (!container) return;
        let html = '';
        exams.forEach((exam, index) => {
            html += '<button class="ohc-exam-select-btn" data-exam-id="' + exam.id + '" onclick="selectExamForPrediction(' + exam.id + ', this)">' + exam.title + '</button>';
        });
        container.innerHTML = html;
    }
    
    // Select Exam and Load Colleges
    window.selectExamForPrediction = async function(examId, btn) {
        // Update active state
        document.querySelectorAll('.ohc-exam-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const resultsContainer = document.getElementById('predictorResults');
        resultsContainer.innerHTML = '<div class="ohc-loading"><i class="fas fa-spinner fa-spin"></i></div>';
        
        try {
            // Get colleges that have courses accepting this exam
            const response = await fetch(API_BASE + '/College/getCollegeList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    draw: 1,
                    length: 20,
                    order: [{ column: 0, dir: 'asc' }],
                    search: { value: '' }
                })
            });
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                let html = '';
                let count = 0;
                
                for (const college of data.data) {
                    if (count >= 10) break;
                    
                    const logoUrl = college.logo ? (college.logo.startsWith('http') ? college.logo : 'https://campusapi.ohcampus.com' + (college.logo.startsWith('/') ? college.logo : '/uploads/college/' + college.logo)) : '';
                    const cityName = college.city || college.cityName || 'India';
                    
                    html += '<a href="/collegedetails/' + college.id + '" class="ohc-predictor-college">' +
                        '<div class="ohc-predictor-college-logo">' +
                        (logoUrl ? '<img src="' + logoUrl + '" alt="' + college.title + '">' : '<i class="fas fa-university"></i>') +
                        '</div>' +
                        '<div class="ohc-predictor-college-info">' +
                        '<h4>' + college.title + '</h4>' +
                        '<p><i class="fas fa-map-marker-alt"></i> ' + cityName + '</p>' +
                        '</div>' +
                        '</a>';
                    count++;
                }
                
                if (html) {
                    resultsContainer.innerHTML = html;
                } else {
                    resultsContainer.innerHTML = '<div class="ohc-no-results">No colleges found for this exam</div>';
                }
            } else {
                resultsContainer.innerHTML = '<div class="ohc-no-results">No colleges found for this exam</div>';
            }
        } catch (e) {
            console.error('Error fetching colleges:', e);
            resultsContainer.innerHTML = '<div class="ohc-no-results">Error loading colleges. Please try again.</div>';
        }
    };
    
    function initializeInteractions() {
        // Search tabs
        document.querySelectorAll('.ohc-search-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.ohc-search-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const type = this.dataset.type;
                const input = document.getElementById('mainSearch');
                if (type === 'colleges') input.placeholder = 'Search Colleges...';
                else if (type === 'courses') input.placeholder = 'Search Courses...';
                else input.placeholder = 'Search Exams...';
            });
        });
        
        // Search on Enter
        const searchInput = document.getElementById('mainSearch');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') performSearch();
            });
        }
        
        // Close modal on overlay click
        const modalOverlay = document.getElementById('counselingModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === this) closeCounselingModal();
            });
        }
    }
    
    window.performSearch = function() {
        const query = document.getElementById('mainSearch').value.trim();
        const activeTab = document.querySelector('.ohc-search-tab.active');
        const type = activeTab ? activeTab.dataset.type : 'colleges';
        if (query) {
            if (type === 'colleges') window.location.href = '/allCollegeList/searchcollege/' + encodeURIComponent(query);
            else if (type === 'courses') window.location.href = '/courses?search=' + encodeURIComponent(query);
            else window.location.href = '/exams?search=' + encodeURIComponent(query);
        }
    };
    
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        if (menu) menu.classList.toggle('active');
    };
    
    window.closeNotification = function() {
        const notif = document.getElementById('footerNotification');
        if (notif) notif.style.display = 'none';
    };
    
    // API Functions
    async function loadLiveCounts() {
        try {
            const response = await fetch(API_BASE + '/Common/getTotalCount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (data.response_code === '200') {
                const collegeEl = document.getElementById('collegeCount');
                const courseEl = document.getElementById('courseCount');
                const examEl = document.getElementById('examCount');
                if (collegeEl) collegeEl.textContent = (data.Clgcount || 10000).toLocaleString() + '+';
                if (courseEl) courseEl.textContent = (data.Coursescount || 6000).toLocaleString() + '+';
                if (examEl) examEl.textContent = (data.Examcount || 200).toLocaleString() + '+';
            }
        } catch (e) { console.error('Error loading counts:', e); }
    }
    
    async function loadFeaturedColleges() {
        try {
            const response = await fetch(API_BASE + '/College/getCollegeList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draw: 1, length: 6, order: [{ column: 0, dir: 'asc' }], search: { value: '' } })
            });
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const container = document.getElementById('featuredColleges');
                if (container) {
                    container.innerHTML = data.data.slice(0, 6).map(college => {
                        const imgUrl = college.banner ? (college.banner.startsWith('http') ? college.banner : 'https://campusapi.ohcampus.com' + (college.banner.startsWith('/') ? college.banner : '/uploads/college/' + college.banner)) : '';
                        return '<a href="/collegedetails/' + college.id + '" class="ohc-college-card">' +
                            '<div class="ohc-college-img">' + (imgUrl ? '<img src="' + imgUrl + '" alt="">' : '<i class="fas fa-university" style="font-size:48px;color:white;"></i>') +
                            '<span class="ohc-college-badge">' + (college.accreditation || 'Featured') + '</span></div>' +
                            '<div class="ohc-college-info"><h3>' + college.title + '</h3>' +
                            '<div class="ohc-college-location"><i class="fas fa-map-marker-alt"></i> ' + (college.city || college.cityName || 'India') + '</div></div></a>';
                    }).join('');
                }
            }
        } catch (e) { console.error('Error loading colleges:', e); }
    }
    
    async function loadTrendingColleges() {
        try {
            const response = await fetch(API_BASE + '/College/getCollegeList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draw: 1, length: 10, order: [{ column: 0, dir: 'asc' }], search: { value: '' } })
            });
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const container = document.getElementById('trendingColleges');
                if (container) {
                    container.innerHTML = data.data.slice(0, 10).map(college =>
                        '<a href="/collegedetails/' + college.id + '" class="ohc-trending-tag"><i class="fas fa-fire" style="color:#f97316;margin-right:8px;"></i> ' + college.title + '</a>'
                    ).join('');
                }
            }
        } catch (e) { console.error('Error loading trending:', e); }
    }
    
    async function loadExams() {
        try {
            const response = await fetch(API_BASE + '/Exam/getExamList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: '' })
            });
            const data = await response.json();
            if (data.response_code === '200' && data.response_data) {
                const container = document.getElementById('topExams');
                if (container) {
                    container.innerHTML = data.response_data.slice(0, 12).map(exam =>
                        '<a href="/examsdetails/' + exam.slug + '" class="ohc-exam-tag">' + exam.title + '</a>'
                    ).join('');
                }
            }
        } catch (e) { console.error('Error loading exams:', e); }
    }
    
    

    async function loadArticles() {
        try {
            const response = await fetch(API_BASE + '/Blogs/getLatestBlogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const text = await response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}$/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.latest_blogs && data.latest_blogs.length > 0) {
                    const container = document.getElementById('latestArticles');
                    if (container) {
                        container.innerHTML = data.latest_blogs.slice(0, 3).map(article => {
                            const imgUrl = article.image || '';
                            return '<a href="/articledetails/' + article.id + '" class="ohc-article-card">' +
                                '<div class="ohc-article-img">' + (imgUrl ? '<img src="' + imgUrl + '" alt="">' : '') + '</div>' +
                                '<div class="ohc-article-content"><h3>' + article.title + '</h3><p>Click to read more...</p></div></a>';
                        }).join('');
                    }
                    return;
                }
            }
            const container = document.getElementById('latestArticles');
            if (container) container.innerHTML = '<p style="color:#64748b;">No articles available</p>';
        } catch (e) { 
            console.error('Error loading articles:', e);
            const container = document.getElementById('latestArticles');
            if (container) container.innerHTML = '<p style="color:#64748b;">Unable to load articles</p>';
        }
    }
    async function loadEvents() {
        try {
            const response = await fetch(API_BASE + '/Event/getEventList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (data.response_code === '200' && data.response_data) {
                const container = document.getElementById('upcomingEvents');
                if (container) {
                    container.innerHTML = data.response_data.slice(0, 4).map(event => {
                        const date = event.event_start_date ? new Date(event.event_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Upcoming';
                        const desc = event.description ? event.description.replace(/<[^>]*>/g, '').substring(0, 80) + '...' : '';
                        return '<a href="/eventdetails/' + event.event_id + '" class="ohc-event-card">' +
                            '<span class="ohc-event-date"><i class="fas fa-calendar"></i> ' + date + '</span>' +
                            '<h3>' + event.event_name + '</h3><p>' + desc + '</p></a>';
                    }).join('');
                }
            } else {
                const container = document.getElementById('upcomingEvents');
                if (container) container.innerHTML = '<p style="color:#64748b;">No events available</p>';
            }
        } catch (e) { 
            console.error('Error loading events:', e);
            const container = document.getElementById('upcomingEvents');
            if (container) container.innerHTML = '<p style="color:#64748b;">Unable to load events</p>';
        }
    }
    
    async function loadFooterNotification() {
        // Show a default promotional notification
        const container = document.getElementById('footerNotification');
        const textEl = document.getElementById('notificationText');
        if (container && textEl) {
            textEl.innerHTML = 'Admissions Open 2025-26! <a href="/contactus">Apply Now</a> for your dream college.';
            container.style.display = 'block';
        }
    }
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
