/* OhCampus College Page Enhancement - Apply Now Highlight */
(function(){
  'use strict';
  
  function isCollegePage(){
    return window.location.pathname.startsWith('/collegeDetails/');
  }
  
  function injectApplyHighlight(){
    if(!isCollegePage()) return;
    if(document.getElementById('ohc-apply-highlight')) return;
    
    // Find the Apply Now button area or sidebar
    var sidebar = document.querySelector('.mat-card, [class*="sidebar"], [class*="right-col"]');
    var mainContent = document.querySelector('[class*="college-info"], [class*="tab-content"], .mat-tab-body-active');
    
    // Create floating Apply Now bar
    var bar = document.createElement('div');
    bar.id = 'ohc-apply-highlight';
    bar.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:0 20px;flex-wrap:wrap;gap:10px">'
      + '<div style="display:flex;align-items:center;gap:12px">'
      + '<i class="fas fa-graduation-cap" style="font-size:24px;color:#ffd700"></i>'
      + '<div><strong style="font-size:0.95rem;color:white">Interested in this college?</strong>'
      + '<p style="margin:2px 0 0;font-size:0.8rem;color:rgba(255,255,255,0.85)">Get direct admission with management seat. Limited seats available!</p></div></div>'
      + '<div style="display:flex;gap:10px">'
      + '<button onclick="document.querySelector(\'[class*=Apply],.ohc-floating-cta\')?.click()" style="background:#ffd700;color:#000;border:none;padding:10px 24px;border-radius:10px;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:Manrope,sans-serif">Apply Now</button>'
      + '<a href="tel:08884560456" style="background:rgba(255,255,255,0.15);color:white;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:0.9rem;display:flex;align-items:center;gap:6px"><i class="fas fa-phone"></i> Call Us</a>'
      + '</div></div>';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#1a237e,#0d47a1);padding:12px 0;z-index:999;box-shadow:0 -4px 20px rgba(0,0,0,0.2);animation:ohcSlideUp 0.5s ease';
    
    // Add animation
    if(!document.getElementById('ohc-apply-style')){
      var style = document.createElement('style');
      style.id = 'ohc-apply-style';
      style.textContent = '@keyframes ohcSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @media(max-width:768px){#ohc-apply-highlight{padding:10px 0!important}#ohc-apply-highlight p{display:none!important}#ohc-apply-highlight strong{font-size:0.85rem!important}}';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(bar);
  }
  
  function cleanup(){
    var el = document.getElementById('ohc-apply-highlight');
    if(el) el.remove();
  }
  
  // Watch for navigation
  var lastUrl = location.href;
  function check(){
    if(location.href !== lastUrl){
      lastUrl = location.href;
      cleanup();
    }
    if(isCollegePage()){
      setTimeout(injectApplyHighlight, 2000);
    }
  }
  
  // Initial check
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(check, 2000); });
  } else {
    setTimeout(check, 2000);
  }
  
  // Watch for SPA navigation
  new MutationObserver(function(){
    if(location.href !== lastUrl) check();
  }).observe(document.body, {childList:true, subtree:true});
})();
