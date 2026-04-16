/* OhCampus - Smart App Banner: Floating Open in App + Download Card */
(function(){
  'use strict';
  
  var PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.ohcampus.ohcampus';
  var PACKAGE = 'com.ohcampus.ohcampus';
  
  function isMobile(){
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  function isAndroid(){
    return /Android/i.test(navigator.userAgent);
  }
  
  function getIntentUrl(){
    var path = window.location.pathname.replace(/^\//, '');
    return 'intent://' + (path || 'home') + '#Intent;scheme=https;package=' + PACKAGE + ';S.browser_fallback_url=' + encodeURIComponent(PLAY_STORE) + ';end';
  }
  
  /* 
   * Detection: Try opening app via intent with a hidden iframe.
   * If the app opens, the page blurs. If not, nothing visible happens.
   * We store the result in sessionStorage for the rest of the session.
   */
  function detectAppInstalled(callback){
    var cached = sessionStorage.getItem('ohc_app_installed');
    if(cached !== null){ callback(cached === 'true'); return; }
    
    if(!isAndroid()){ callback(false); return; }
    
    // Use visibility change detection
    var detected = false;
    var startTime = Date.now();
    
    function onBlur(){
      if(Date.now() - startTime < 3000){
        detected = true;
        sessionStorage.setItem('ohc_app_installed', 'true');
        callback(true);
      }
      cleanup();
    }
    
    function onTimeout(){
      if(!detected){
        sessionStorage.setItem('ohc_app_installed', 'false');
        callback(false);
      }
      cleanup();
    }
    
    function cleanup(){
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisChange);
    }
    
    function onVisChange(){
      if(document.hidden){
        detected = true;
        sessionStorage.setItem('ohc_app_installed', 'true');
        callback(true);
        cleanup();
      }
    }
    
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisChange);
    
    // Try opening via a hidden iframe
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'intent://#Intent;scheme=ohcampus;package=' + PACKAGE + ';end';
    document.body.appendChild(iframe);
    setTimeout(function(){ iframe.remove(); }, 100);
    
    // Timeout: if no blur/visibility change in 1.5s, app is not installed
    setTimeout(onTimeout, 1500);
  }
  
  function showFloatingOpenInApp(){
    if(document.getElementById('ohc-floating-open')) return;
    
    var btn = document.createElement('div');
    btn.id = 'ohc-floating-open';
    btn.innerHTML = '<a href="' + getIntentUrl() + '" style="'
      + 'display:flex;align-items:center;gap:8px;'
      + 'background:linear-gradient(135deg,#4f46e5,#7c3aed);'
      + 'color:#fff;padding:10px 20px;border-radius:50px;'
      + 'text-decoration:none;font-family:Inter,sans-serif;'
      + 'font-size:0.85rem;font-weight:700;'
      + 'box-shadow:0 4px 20px rgba(79,70,229,0.4);'
      + 'transition:transform 0.2s;'
      + '">'
      + '<img src="https://ohcampus.com/assets/images/logo/logo.png" style="width:22px;height:22px;border-radius:5px" onerror="this.style.display=\'none\'">'
      + '<span>Open in App</span>'
      + '</a>'
      + '<button id="ohc-float-dismiss" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#1e293b;border:1px solid #334155;color:#94a3b8;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1">&times;</button>';
    
    btn.style.cssText = 'position:fixed;bottom:80px;right:16px;z-index:99998;';
    document.body.appendChild(btn);
    
    document.getElementById('ohc-float-dismiss').addEventListener('click', function(e){
      e.stopPropagation();
      btn.remove();
      sessionStorage.setItem('ohc_float_dismissed', 'true');
    });
  }
  
  function showDownloadCard(){
    if(document.getElementById('ohc-download-card')) return;
    if(sessionStorage.getItem('ohc_download_dismissed') === 'true') return;
    
    var card = document.createElement('div');
    card.id = 'ohc-download-card';
    card.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99997;'
      + 'background:#111827;border-top:1px solid #1e293b;'
      + 'padding:10px 14px;display:flex;align-items:center;gap:10px;'
      + 'font-family:Inter,sans-serif;box-shadow:0 -4px 20px rgba(0,0,0,0.3);';
    
    card.innerHTML = '<img src="https://ohcampus.com/assets/images/logo/logo.png" style="width:40px;height:40px;border-radius:10px" onerror="this.style.display=\'none\'">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:0.85rem;font-weight:700;color:#f1f5f9">OhCampus App</div>'
      + '<div style="font-size:0.68rem;color:#94a3b8">Get college predictions & exam updates</div>'
      + '<div style="display:flex;align-items:center;gap:4px;margin-top:2px">'
      + '<span style="color:#fbbf24;font-size:10px">&#9733;&#9733;&#9733;&#9733;&#9733;</span>'
      + '<span style="font-size:0.6rem;color:#64748b">Free</span>'
      + '</div>'
      + '</div>'
      + '<a href="' + PLAY_STORE + '" target="_blank" style="'
      + 'background:#16a34a;color:#fff;padding:8px 16px;border-radius:8px;'
      + 'font-size:0.82rem;font-weight:700;text-decoration:none;white-space:nowrap;'
      + 'display:flex;align-items:center;gap:5px;'
      + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm.55-3.24L7.56 2.66l10.24 6.22-1.44 3zm4.64 1.62l-3.18 1.82-2.34-2.34 2.34-2.34 3.18 1.82c.58.34.58 1.16 0 1.04z"/></svg>Download</a>'
      + '<button id="ohc-dl-dismiss" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer;padding:4px;line-height:1">&times;</button>';
    
    document.body.appendChild(card);
    
    document.getElementById('ohc-dl-dismiss').addEventListener('click', function(){
      card.remove();
      sessionStorage.setItem('ohc_download_dismissed', 'true');
    });
  }
  
  function removeAll(){
    var f = document.getElementById('ohc-floating-open');
    if(f) f.remove();
    var d = document.getElementById('ohc-download-card');
    if(d) d.remove();
  }
  
  function init(){
    if(!isMobile()) return;
    
    detectAppInstalled(function(installed){
      removeAll();
      if(installed){
        // App is installed: show floating "Open in App" pill
        if(sessionStorage.getItem('ohc_float_dismissed') !== 'true'){
          showFloatingOpenInApp();
        }
      } else {
        // App not installed: show bottom "Download" card
        showDownloadCard();
      }
    });
  }
  
  // Run
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 2000); });
  } else {
    setTimeout(init, 2000);
  }
  
  // Watch for SPA navigation
  var lastUrl = location.href;
  new MutationObserver(function(){
    if(location.href !== lastUrl){
      lastUrl = location.href;
      removeAll();
      setTimeout(init, 1500);
    }
  }).observe(document.body, {childList: true, subtree: true});
})();
