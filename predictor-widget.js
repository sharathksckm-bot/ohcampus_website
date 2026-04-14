// OhCampus Predictor Widget - Homepage Section
(function() {
    'use strict';
    
    const widgetStyles = `
        <style id="predictor-widget-styles">
            .predictor-section {
                padding: 50px 20px;
                background: #f8f9fa;
            }
            .predictor-container {
                max-width: 1100px;
                margin: 0 auto;
            }
            .predictor-header {
                text-align: center;
                margin-bottom: 35px;
            }
            .predictor-header h2 {
                font-size: 1.8rem;
                color: #1a1a2e;
                margin-bottom: 10px;
                font-weight: 700;
            }
            .predictor-header p {
                font-size: 1rem;
                color: #666;
                max-width: 550px;
                margin: 0 auto;
            }
            .predictor-cards {
                display: flex;
                gap: 25px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .predictor-card {
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                transition: transform 0.3s, box-shadow 0.3s;
                flex: 1;
                min-width: 320px;
                max-width: 480px;
            }
            .predictor-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 12px 40px rgba(0,0,0,0.12);
            }
            .predictor-card-inner {
                display: flex;
                flex-direction: row;
                align-items: stretch;
            }
            .predictor-card-icon {
                width: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .predictor-card-icon.rank {
                background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
            }
            .predictor-card-icon.college {
                background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
            }
            .predictor-card-icon i {
                font-size: 2.2rem;
                color: white;
            }
            .predictor-card-content {
                padding: 22px 25px;
                flex: 1;
            }
            .predictor-card-content h3 {
                font-size: 1.15rem;
                color: #1a1a2e;
                margin-bottom: 8px;
                font-weight: 600;
            }
            .predictor-card-content p {
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            .predictor-exams {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 15px;
            }
            .predictor-exam-tag {
                background: #e8eaf6;
                color: #3949ab;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
            }
            .predictor-card.college .predictor-exam-tag {
                background: #e8f5e9;
                color: #2e7d32;
            }
            .predictor-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.3s;
            }
            .predictor-btn.rank {
                background: #1a237e;
                color: white;
            }
            .predictor-btn.college {
                background: #2e7d32;
                color: white;
            }
            .predictor-btn:hover {
                opacity: 0.9;
                transform: translateX(3px);
            }
            @media (max-width: 768px) {
                .predictor-cards {
                    flex-direction: column;
                    align-items: center;
                }
                .predictor-card {
                    max-width: 100%;
                }
                .predictor-card-inner {
                    flex-direction: column;
                }
                .predictor-card-icon {
                    width: 100%;
                    height: 80px;
                }
            }
        </style>
    `;

    const widgetHTML = `
        <section class="predictor-section" id="predictors">
            <div class="predictor-container">
                <div class="predictor-header">
                    <h2>Rank & College Predictors</h2>
                    <p>Use our tools to predict your rank and find colleges matching your scores</p>
                </div>
                <div class="predictor-cards">
                    <div class="predictor-card rank">
                        <div class="predictor-card-inner">
                            <div class="predictor-card-icon rank">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="predictor-card-content">
                                <h3>Rank Predictor</h3>
                                <p>Enter your marks to predict your expected rank based on previous year data.</p>
                                <div class="predictor-exams">
                                    <span class="predictor-exam-tag">KCET</span>
                                    <span class="predictor-exam-tag">NEET</span>
                                    <span class="predictor-exam-tag">JEE</span>
                                    <span class="predictor-exam-tag">COMEDK</span>
                                    <span class="predictor-exam-tag">GATE</span>
                                    <span class="predictor-exam-tag">CAT</span>
                                </div>
                                <a href="/rank-predictor.html" class="predictor-btn rank">
                                    <i class="fas fa-calculator"></i> Predict Rank
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="predictor-card college">
                        <div class="predictor-card-inner">
                            <div class="predictor-card-icon college">
                                <i class="fas fa-university"></i>
                            </div>
                            <div class="predictor-card-content">
                                <h3>College Predictor</h3>
                                <p>Find colleges you can get admission to based on your rank & category.</p>
                                <div class="predictor-exams">
                                    <span class="predictor-exam-tag">KCET</span>
                                    <span class="predictor-exam-tag">NEET</span>
                                    <span class="predictor-exam-tag">JEE</span>
                                    <span class="predictor-exam-tag">COMEDK</span>
                                    <span class="predictor-exam-tag">GATE</span>
                                    <span class="predictor-exam-tag">CAT</span>
                                </div>
                                <a href="/college-predictor.html" class="predictor-btn college">
                                    <i class="fas fa-search"></i> Find Colleges
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

    function findTargetSection() {
        // First try to find the Top Exams section injected by homepage-redesign.js
        var topExams = document.getElementById('ohc-top-exams');
        if (topExams) return topExams;
        // Fallback: find "Featured Colleges" heading
        var allDivs = document.querySelectorAll('div');
        for (var i = 0; i < allDivs.length; i++) {
            var text = allDivs[i].textContent || '';
            if (text.trim().indexOf('Featured Colleges') === 0 && allDivs[i].children.length < 10) {
                return allDivs[i].closest('[class*="px-30"],[class*="px-14"]') || allDivs[i];
            }
        }
        return null;
    }

    function injectPredictorWidget() {
        // Prevent duplicate injection
        if (document.getElementById('predictors')) return;
        
        // Only inject on homepage
        var p = window.location.pathname; if (p !== '/' && p !== '/index.html' && p !== '' && p !== '/home') return;

        // Add Font Awesome if not present
        if (!document.querySelector('link[href*="font-awesome"]')) {
            var faLink = document.createElement('link');
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            faLink.rel = 'stylesheet';
            document.head.appendChild(faLink);
        }

        // Add Inter font
        if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
            var fontLink = document.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }

        document.head.insertAdjacentHTML('beforeend', widgetStyles);

        // Insert above Top Exams section (or Featured Colleges as fallback)
        var targetSection = findTargetSection();
        if (targetSection) {
            targetSection.insertAdjacentHTML('beforebegin', widgetHTML);
            console.log('OhCampus Predictor Widget: Inserted above Top Exams section');
            return;
        }

        // Fallback: insert before footer
        var footer = document.querySelector('footer, .footer, app-footer, [class*="footer"]');
        if (footer) {
            footer.insertAdjacentHTML('beforebegin', widgetHTML);
            console.log('OhCampus Predictor Widget: Inserted before footer (fallback)');
        } else {
            document.body.insertAdjacentHTML('beforeend', widgetHTML);
            console.log('OhCampus Predictor Widget: Appended to body (fallback)');
        }
    }

    function tryInject() {
        injectPredictorWidget();
    }

    // Angular apps render asynchronously - retry multiple times
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            [1000, 2000, 3000, 5000, 8000].forEach(function(delay) {
                setTimeout(tryInject, delay);
            });
        });
    } else {
        [800, 1500, 3000, 5000, 8000].forEach(function(delay) {
            setTimeout(tryInject, delay);
        });
    }

    // Also watch for Angular route changes (SPA navigation)
    var currentUrl = location.href;
    var observer = new MutationObserver(function() {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            // Remove existing widget on navigation
            var existing = document.getElementById('predictors');
            if (existing) existing.remove();
            // Re-inject after a delay
            setTimeout(tryInject, 1500);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
