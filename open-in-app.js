/* OhCampus - Floating Open in App (only when app is installed) */
(function(){
  'use strict';
  
  var PACKAGE = 'com.ohcampus.ohcampus';
  var ICON = '/assets/images/logo/ohcampus-icon.png';
  
  function isMobile(){
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  function isAndroid(){
    return /Android/i.test(navigator.userAgent);
  }
  
  function getIntentUrl(){
    var path = window.location.pathname.replace(/^\//, '');
    return 'intent://' + (path || 'home') + '#Intent;scheme=https;package=' + PACKAGE + ';S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=' + PACKAGE) + ';end';
  }
  
  function detectAppInstalled(callback){
    var cached = sessionStorage.getItem('ohc_app_installed');
    if(cached !== null){ callback(cached === 'true'); return; }
    if(!isAndroid()){ callback(false); return; }
    
    var detected = false;
    var startTime = Date.now();
    
    function onBlur(){
      if(Date.now() - startTime < 3000 && !detected){
        detected = true;
        sessionStorage.setItem('ohc_app_installed', 'true');
        callback(true);
      }
      cleanup();
    }
    function onVisChange(){
      if(document.hidden && !detected){
        detected = true;
        sessionStorage.setItem('ohc_app_installed', 'true');
        callback(true);
        cleanup();
      }
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
    
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisChange);
    
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'intent://#Intent;scheme=ohcampus;package=' + PACKAGE + ';end';
    document.body.appendChild(iframe);
    setTimeout(function(){ iframe.remove(); }, 100);
    setTimeout(onTimeout, 1500);
  }
  
  function showFloatingOpenInApp(){
    if(document.getElementById('ohc-floating-open')) return;
    if(sessionStorage.getItem('ohc_float_dismissed') === 'true') return;
    
    var el = document.createElement('div');
    el.id = 'ohc-floating-open';
    el.style.cssText = 'position:fixed;bottom:80px;right:14px;z-index:99998;';
    el.innerHTML = '<a href="' + getIntentUrl() + '" style="'
      + 'display:flex;align-items:center;gap:8px;'
      + 'background:linear-gradient(135deg,#4f46e5,#7c3aed);'
      + 'color:#fff;padding:11px 20px;border-radius:50px;'
      + 'text-decoration:none;font-family:Inter,-apple-system,sans-serif;'
      + 'font-size:0.85rem;font-weight:700;'
      + 'box-shadow:0 4px 24px rgba(79,70,229,0.45);'
      + '">'
      + '<img src="' + ICON + '" style="width:22px;height:22px;border-radius:6px" onerror="this.style.display=\'none\'">'
      + '<span>Open in App</span>'
      + '</a>'
      + '<button id="ohc-float-dismiss" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;'
      + 'background:#1e293b;border:1px solid #334155;color:#94a3b8;font-size:11px;cursor:pointer;'
      + 'display:flex;align-items:center;justify-content:center;line-height:1">&times;</button>';
    
    document.body.appendChild(el);
    
    document.getElementById('ohc-float-dismiss').addEventListener('click', function(e){
      e.stopPropagation();
      el.remove();
      sessionStorage.setItem('ohc_float_dismissed', 'true');
    });
  }
  
  function removeAll(){
    var f = document.getElementById('ohc-floating-open');
    if(f) f.remove();
  }
  
  function init(){
    if(!isMobile()) return;
    detectAppInstalled(function(installed){
      removeAll();
      if(installed){
        showFloatingOpenInApp();
      }
      // If not installed: do nothing — Chrome's native banner handles download
    });
  }
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 1500); });
  } else {
    setTimeout(init, 1500);
  }
  
  var lastUrl = location.href;
  new MutationObserver(function(){
    if(location.href !== lastUrl){
      lastUrl = location.href;
      removeAll();
      setTimeout(init, 1000);
    }
  }).observe(document.body, {childList: true, subtree: true});
})();
