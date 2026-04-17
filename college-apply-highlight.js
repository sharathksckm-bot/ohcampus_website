/* OhCampus College Page Enhancement - Apply Now Highlight */
(function(){
  'use strict';
  
  function isCollegePage(){
    return window.location.pathname.startsWith('/collegeDetails/');
  }
  
  function injectApplyHighlight(){
    if(!isCollegePage()) return;
    if(document.getElementById('ohc-apply-highlight')) return;
    if(window.__ohcGovtCollege) return;
    
    // Check if this is a Government college - skip the banner
    if(!window.__ohcCollegeTypeChecked){
      window.__ohcCollegeTypeChecked = true;
      var pathParts = window.location.pathname.split('/');
      var cid = pathParts[pathParts.length - 1];
      if(cid && !isNaN(cid)){
        fetch('https://campusapi.ohcampus.com/apps/College/getCollegeDetailsByID',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({collegeId:cid})
        }).then(function(r){return r.json()}).then(function(d){
          var detail = d.college_detail;
          if(detail && detail.length > 0){
            var typeName = (detail[0].Collage_category || '').toLowerCase();
            var packageType = (detail[0].package_type || '').toLowerCase();
            
            if(typeName === 'government'){
              window.__ohcGovtCollege = true;
              var el = document.getElementById('ohc-apply-highlight');
              if(el) el.remove();
              hideBuiltInApplyBanners();
              return;
            }
            
            // Only show banner for featured colleges (package_type = feature_listing)
            if(packageType !== 'feature_listing'){
              window.__ohcNotFeatured = true;
              var el2 = document.getElementById('ohc-apply-highlight');
              if(el2) el2.remove();
              return;
            }
          }
          // Featured non-government college - proceed with injection
          doInjectApplyHighlight();
        }).catch(function(){ doInjectApplyHighlight(); });
        return;
      }
    }
    doInjectApplyHighlight();
  }
  
  function hideBuiltInApplyBanners(){
    // Hide Angular's built-in "Skip the Counseling Uncertainty" and "Request Info" sections
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      if(walker.currentNode.textContent.indexOf('Skip the Counseling') >= 0){
        var el = walker.currentNode.parentElement;
        // Walk up to find the containing card/section div
        for(var i=0;i<5;i++){
          if(el && el.parentElement){
            el = el.parentElement;
            var s = el.style || {};
            // Look for the orange/gradient background section
            if(el.offsetHeight > 50 && el.offsetHeight < 300){
              el.style.display = 'none';
              break;
            }
          }
        }
      }
    }
  }

  function doInjectApplyHighlight(){
    if(!isCollegePage()) return;
    if(document.getElementById('ohc-apply-highlight')) return;
    if(window.__ohcGovtCollege) return;
    if(window.__ohcNotFeatured) return;
    
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
    
    // Fix: Prevent campus photo clicks from changing banner image
    // Store the original banner image URL on page load
    setTimeout(function(){
      var bannerImg = document.querySelector('img[class*="cover-img"], [class*="coverphoto"] img, [class*="banner-img"] img');
      if(!bannerImg) {
        // Find the first large background image in the header area
        var allImgs = document.querySelectorAll('img');
        for(var i = 0; i < allImgs.length; i++) {
          if(allImgs[i].offsetWidth > 600 && allImgs[i].getBoundingClientRect().top < 400) {
            bannerImg = allImgs[i];
            break;
          }
        }
      }
      if(bannerImg) {
        var originalBannerSrc = bannerImg.src;
        // Watch for changes to the banner image src
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(m) {
            if(m.type === 'attributes' && m.attributeName === 'src') {
              if(bannerImg.src !== originalBannerSrc) {
                bannerImg.src = originalBannerSrc;
              }
            }
          });
        });
        observer.observe(bannerImg, {attributes: true, attributeFilter: ['src']});
      }
    }, 3000);
    
    // Wire up Apply Now button: scroll to Angular Apply Now and trigger it
    document.getElementById('ohc-apply-btn').addEventListener('click', function(){
      // Find the Angular Apply Now button
      var angularBtn = null;
      var allBtns = document.querySelectorAll('button');
      for(var i=0;i<allBtns.length;i++){
        if(allBtns[i].textContent.trim()==='Apply Now' && allBtns[i].offsetWidth>0 && !allBtns[i].closest('#ohc-apply-highlight')){
          angularBtn = allBtns[i];
          break;
        }
      }
      if(angularBtn){
        // Scroll to make the button visible
        angularBtn.scrollIntoView({behavior:'smooth', block:'center'});
        // Flash highlight effect
        var origBg = angularBtn.style.background;
        angularBtn.style.background = '#ffd700';
        angularBtn.style.transform = 'scale(1.15)';
        angularBtn.style.transition = 'all 0.3s';
        setTimeout(function(){
          angularBtn.style.background = origBg;
          angularBtn.style.transform = '';
          // Trigger click after scroll completes
          angularBtn.click();
        }, 800);
      }
    });
  }
  

  function injectCampusVideo(){
    if(!isCollegePage()) return;
    if(document.getElementById('ohc-campus-video')) return;
    
    // Get college ID from URL
    var pathParts = window.location.pathname.split('/');
    var collegeId = pathParts[pathParts.length - 1];
    if(!collegeId || isNaN(collegeId)) return;
    
    // Fetch college details to get video
    fetch('https://campusapi.ohcampus.com/apps/College/getCollegeDetailsByID', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({collegeId: collegeId})
    })
    .then(function(r){return r.json();})
    .then(function(d){
      var detail = d.college_detail;
      if(!detail || !detail.length) return;
      var clg = detail[0];
      if(!clg.video_url) return;
      
      // Find "Take a look at Campus" section
      var campusSection = null;
      var headings = document.querySelectorAll('h3, h4, h5, span, div');
      for(var i = 0; i < headings.length; i++){
        if(headings[i].innerText && headings[i].innerText.trim().indexOf('Take a look at Campus') === 0){
          campusSection = headings[i].closest('div');
          break;
        }
      }
      
      var videoHtml = '';
      if(clg.video_type === 'youtube'){
        // Extract YouTube video ID
        var ytUrl = clg.video_url;
        var videoId = '';
        var match = ytUrl.match(/[?&]v=([^&]+)/);
        if(match) videoId = match[1];
        else{
          match = ytUrl.match(/youtu\.be\/([^?]+)/);
          if(match) videoId = match[1];
        }
        if(videoId){
          videoHtml = '<iframe width="100%" height="280" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:12px;"></iframe>';
        }
      } else if(clg.video_type === 'upload'){
        videoHtml = '<video controls width="100%" style="border-radius:12px;max-height:300px;" preload="metadata"><source src="' + clg.video_url + '" type="video/mp4">Your browser does not support video.</video>';
      }
      
      if(!videoHtml) return;
      
      var container = document.createElement('div');
      container.id = 'ohc-campus-video';
      container.style.cssText = 'margin:16px 0;padding:0 16px;';
      container.innerHTML = '<h4 style="font-family:Manrope,sans-serif;font-weight:700;font-size:1rem;color:#1a237e;margin:0 0 12px;display:flex;align-items:center;gap:8px"><i class="fas fa-play-circle" style="color:#e65100"></i> Campus Video</h4>' + videoHtml;
      
      if(campusSection){
        // Insert at the top of the campus section
        campusSection.insertBefore(container, campusSection.children[1] || null);
      } else {
        // Try inserting before the gallery/photos section
        var gallery = document.querySelector('[class*="gallery"], [class*="photo-grid"]');
        if(gallery) gallery.parentNode.insertBefore(container, gallery);
      }
    })
    .catch(function(e){ console.log('Video fetch error:', e); });
  }

  function cleanup(){
    var el = document.getElementById('ohc-apply-highlight');
    var vid = document.getElementById('ohc-campus-video'); if(vid) vid.remove();
    if(el) el.remove();
    window.__ohcGovtCollege = false;
    window.__ohcNotFeatured = false;
    window.__ohcCollegeTypeChecked = false;
  }
  
  var lastUrl = location.href;
  function check(){
    if(location.href !== lastUrl){
      lastUrl = location.href;
      cleanup();
    }
    if(isCollegePage()){
      setTimeout(injectApplyHighlight, 2000);
      setTimeout(injectCampusVideo, 3000);
    }
  }
  
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(check, 2000); });
  } else {
    setTimeout(check, 2000);
  }
  
  new MutationObserver(function(){
    if(location.href !== lastUrl) check();
    if(window.__ohcGovtCollege && isCollegePage()) hideBuiltInApplyBanners();
  }).observe(document.body, {childList:true, subtree:true});
})();
