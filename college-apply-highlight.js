/* OhCampus College Page Enhancement - Apply Now Highlight */
(function(){
  'use strict';
  
  function isCollegePage(){
    return window.location.pathname.startsWith('/collegeDetails/');
  }
  
  function injectApplyHighlight(){
    if(!isCollegePage()) return;
    if(document.getElementById('ohc-apply-highlight')) return;
    
    // Add style for repositioning floating buttons
    if(!document.getElementById('ohc-apply-style')){
      var style = document.createElement('style');
      style.id = 'ohc-apply-style';
      style.textContent = '@keyframes ohcSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}'
        + '#ohc-apply-highlight{position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#1a237e,#0d47a1);padding:12px 0;z-index:10000;box-shadow:0 -4px 20px rgba(0,0,0,0.2);animation:ohcSlideUp 0.5s ease}'
        + 'body:has(#ohc-apply-highlight) .ohc-floating-cta{bottom:80px!important}'
        + 'body:has(#ohc-apply-highlight) #ai-assistant-btn{bottom:135px!important}'
        + '@media(max-width:768px){#ohc-apply-highlight .ohc-apply-subtitle{display:none!important}#ohc-apply-highlight .ohc-apply-inner{padding:0 12px!important}}';
      document.head.appendChild(style);
    }
    
    var bar = document.createElement('div');
    bar.id = 'ohc-apply-highlight';
    bar.innerHTML = '<div class="ohc-apply-inner" style="display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:0 20px;flex-wrap:wrap;gap:10px">'
      + '<div style="display:flex;align-items:center;gap:12px">'
      + '<i class="fas fa-graduation-cap" style="font-size:24px;color:#ffd700"></i>'
      + '<div><strong style="font-size:0.95rem;color:white">Interested in this college?</strong>'
      + '<p class="ohc-apply-subtitle" style="margin:2px 0 0;font-size:0.8rem;color:rgba(255,255,255,0.85)">Get direct admission with management seat. Limited seats available!</p></div></div>'
      + '<div style="display:flex;gap:10px">'
      + '<button id="ohc-apply-btn" style="background:#ffd700;color:#000;border:none;padding:10px 24px;border-radius:10px;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:Manrope,sans-serif">Apply Now</button>'
      + '<a href="tel:08884560456" style="background:rgba(255,255,255,0.15);color:white;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:0.9rem;display:flex;align-items:center;gap:6px"><i class="fas fa-phone"></i> Call Us</a>'
      + '</div></div>';
    
    document.body.appendChild(bar);
    
    // Wire up Apply Now button to click the Angular Apply Now
    document.getElementById('ohc-apply-btn').addEventListener('click', function(){
      // Try clicking Angular's Apply Now button
      var angularBtn = document.querySelector('button[class*="apply"], a[class*="apply"], [class*="Apply Now"]');
      if(!angularBtn) {
        // Try finding by text content
        var allBtns = document.querySelectorAll('button, a');
        for(var i = 0; i < allBtns.length; i++){
          if(allBtns[i].textContent.trim().indexOf('Apply Now') !== -1 && allBtns[i].offsetWidth > 0){
            angularBtn = allBtns[i];
            break;
          }
        }
      }
      if(angularBtn){
        angularBtn.click();
        // Scroll to the form area
        setTimeout(function(){
          var form = document.querySelector('form, [class*="apply-form"], mat-dialog-container');
          if(form) form.scrollIntoView({behavior:'smooth', block:'center'});
        }, 500);
      } else {
        // Fallback: scroll to top where Apply Now button is
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    });
  }
  
  function cleanup(){
    var el = document.getElementById('ohc-apply-highlight');
    if(el) el.remove();
  }
  
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
  
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(check, 2000); });
  } else {
    setTimeout(check, 2000);
  }
  
  new MutationObserver(function(){
    if(location.href !== lastUrl) check();
  }).observe(document.body, {childList:true, subtree:true});
})();
