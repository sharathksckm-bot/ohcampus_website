/* OhCampus - Open in App Banner */
(function(){
  'use strict';
  
  function isMobile(){
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  function isAndroid(){
    return /Android/i.test(navigator.userAgent);
  }
  
  function isIOS(){
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  
  function getBannerDismissed(){
    try { return sessionStorage.getItem('ohc_app_banner_dismissed') === 'true'; } catch(e) { return false; }
  }
  
  function injectBanner(){
    if(!isMobile()) return;
    if(getBannerDismissed()) return;
    if(document.getElementById('ohc-app-banner')) return;
    
    var appStoreUrl = 'https://play.google.com/store/apps/details?id=com.ohcampus.ohcampus';
    var currentPath = window.location.pathname;
    var deepLink = 'https://ohcampus.com' + currentPath;
    
    var banner = document.createElement('div');
    banner.id = 'ohc-app-banner';
    banner.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#111827;border-bottom:1px solid #1e293b;padding:8px 12px;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.3)">'
      + '<img src="https://ohcampus.com/assets/images/logo/logo.png" style="width:36px;height:36px;border-radius:8px" onerror="this.style.display=\'none\'">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:0.82rem;font-weight:700;color:#f1f5f9;line-height:1.2">OhCampus</div>'
      + '<div style="font-size:0.68rem;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Better experience on our app</div>'
      + '</div>'
      + '<a id="ohc-open-app-btn" href="' + appStoreUrl + '" style="background:#4f46e5;color:#fff;padding:6px 14px;border-radius:8px;font-size:0.78rem;font-weight:700;text-decoration:none;white-space:nowrap;display:flex;align-items:center;gap:4px">'
      + '<span style="font-size:12px">&#9654;</span> Open in App</a>'
      + '<button id="ohc-dismiss-banner" style="background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;padding:4px">&times;</button>'
      + '</div>';
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Add padding to body
    document.body.style.paddingTop = '52px';
    
    // Dismiss handler
    document.getElementById('ohc-dismiss-banner').addEventListener('click', function(){
      banner.remove();
      document.body.style.paddingTop = '';
      try { sessionStorage.setItem('ohc_app_banner_dismissed', 'true'); } catch(e){}
    });
    
    // If Android, try intent URL first
    if(isAndroid()){
      var intentUrl = 'intent://' + currentPath.replace(/^\//, '') + '#Intent;scheme=https;package=com.ohcampus.ohcampus;S.browser_fallback_url=' + encodeURIComponent(appStoreUrl) + ';end';
      document.getElementById('ohc-open-app-btn').href = intentUrl;
    }
  }
  
  // Run on page load
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(injectBanner, 1500); });
  } else {
    setTimeout(injectBanner, 1500);
  }
  
  // Watch for SPA navigation
  var lastUrl = location.href;
  new MutationObserver(function(){
    if(location.href !== lastUrl){
      lastUrl = location.href;
      var existing = document.getElementById('ohc-app-banner');
      if(existing) existing.remove();
      document.body.style.paddingTop = '';
      setTimeout(injectBanner, 1000);
    }
  }).observe(document.body, {childList: true, subtree: true});
})();
