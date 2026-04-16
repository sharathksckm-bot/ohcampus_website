/* OhCampus - Smart App Banner
   - App NOT installed: Custom blue Download banner at top
   - App IS installed: Floating purple Open in App pill (Chrome's native banner also appears)
*/
(function(){
  'use strict';
  
  var PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.ohcampus.ohcampus';
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
    return 'intent://' + (path || 'home') + '#Intent;scheme=https;package=' + PACKAGE + ';S.browser_fallback_url=' + encodeURIComponent(PLAY_STORE) + ';end';
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
  
  /* ===== App NOT installed: Blue Download banner at top ===== */
  function showDownloadBanner(){
    if(document.getElementById('ohc-app-banner')) return;
    if(sessionStorage.getItem('ohc_banner_dismissed') === 'true') return;
    
    var banner = document.createElement('div');
    banner.id = 'ohc-app-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;'
      + 'background:linear-gradient(135deg,#1565c0,#1976d2);'
      + 'padding:8px 12px;display:flex;align-items:center;gap:10px;'
      + 'font-family:Inter,-apple-system,sans-serif;'
      + 'box-shadow:0 2px 12px rgba(0,0,0,0.25);';
    
    banner.innerHTML = '<img src="' + ICON + '" style="width:38px;height:38px;border-radius:10px;border:2px solid rgba(255,255,255,0.2);flex-shrink:0" onerror="this.style.display=\'none\'">'
      + '<div style="flex:1;min-width:0;overflow:hidden">'
      + '<div style="font-size:0.85rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">OhCampus App</div>'
      + '<div style="font-size:0.65rem;color:rgba(255,255,255,0.75);white-space:nowrap">Get accurate College Predictions</div>'
      + '</div>'
      + '<a href="' + PLAY_STORE + '" target="_blank" style="'
      + 'background:#ff6d00;color:#fff;padding:8px 18px;border-radius:20px;'
      + 'font-size:0.82rem;font-weight:800;text-decoration:none;white-space:nowrap;flex-shrink:0;'
      + '">Download</a>'
      + '<button id="ohc-banner-dismiss" style="background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:14px;cursor:pointer;'
      + 'width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1">&times;</button>';
    
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.style.paddingTop = '56px';
    
    document.getElementById('ohc-banner-dismiss').addEventListener('click', function(){
      banner.remove();
      document.body.style.paddingTop = '';
      sessionStorage.setItem('ohc_banner_dismissed', 'true');
    });
  }
  
  /* ===== App IS installed: Floating purple pill ===== */
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
    var b = document.getElementById('ohc-app-banner');
    if(b){ b.remove(); document.body.style.paddingTop = ''; }
    var f = document.getElementById('ohc-floating-open');
    if(f) f.remove();
  }
  
  function init(){
    if(!isMobile()) return;
    detectAppInstalled(function(installed){
      removeAll();
      if(installed){
        showFloatingOpenInApp();
      } else {
        showDownloadBanner();
      }
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
