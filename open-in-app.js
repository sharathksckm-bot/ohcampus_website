/* OhCampus - Single Top App Banner */
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
  
  function showBanner(installed){
    if(document.getElementById('ohc-app-banner')) return;
    if(sessionStorage.getItem('ohc_banner_dismissed') === 'true') return;
    
    var btnHref = installed ? getIntentUrl() : PLAY_STORE;
    var btnText = installed ? 'Open in App' : 'Download';
    var btnBg = installed ? '#4f46e5' : '#16a34a';
    var subtitle = installed ? 'Continue on the app' : 'Get the OhCampus app';
    
    var banner = document.createElement('div');
    banner.id = 'ohc-app-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;'
      + 'background:#111827;border-bottom:1px solid #1e293b;'
      + 'padding:8px 10px;display:flex;align-items:center;gap:10px;'
      + 'font-family:Inter,-apple-system,sans-serif;'
      + 'box-shadow:0 2px 12px rgba(0,0,0,0.3);';
    
    banner.innerHTML = '<img src="' + ICON + '" style="width:36px;height:36px;border-radius:10px;flex-shrink:0" onerror="this.style.display=\'none\'">'
      + '<div style="flex:1;min-width:0;overflow:hidden">'
      + '<div style="font-size:0.82rem;font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">OhCampus</div>'
      + '<div style="font-size:0.65rem;color:#94a3b8;white-space:nowrap">' + subtitle + '</div>'
      + '</div>'
      + '<a id="ohc-banner-btn" href="' + btnHref + '"' + (installed ? '' : ' target="_blank"') + ' style="'
      + 'background:' + btnBg + ';color:#fff;padding:7px 16px;border-radius:8px;'
      + 'font-size:0.8rem;font-weight:700;text-decoration:none;white-space:nowrap;flex-shrink:0;'
      + '">' + btnText + '</a>'
      + '<button id="ohc-banner-dismiss" style="background:none;border:none;color:#475569;font-size:18px;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1">&times;</button>';
    
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.style.paddingTop = '54px';
    
    document.getElementById('ohc-banner-dismiss').addEventListener('click', function(){
      banner.remove();
      document.body.style.paddingTop = '';
      sessionStorage.setItem('ohc_banner_dismissed', 'true');
    });
  }
  
  function removeBanner(){
    var b = document.getElementById('ohc-app-banner');
    if(b){ b.remove(); document.body.style.paddingTop = ''; }
  }
  
  function init(){
    if(!isMobile()) return;
    detectAppInstalled(function(installed){
      removeBanner();
      showBanner(installed);
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
      removeBanner();
      setTimeout(init, 1000);
    }
  }).observe(document.body, {childList: true, subtree: true});
})();
