/* OhCampus - Transport Info + Nearby Colleges for College Detail Pages */
(function(){
  'use strict';
  var API = 'https://campusapi.ohcampus.com';
  
  function getCollegeId(){
    // Extract college ID from the Angular page data or URL
    var match = window.location.pathname.match(/\/college\/(\d+)/);
    if(match) return match[1];
    // Try from page content
    var metaId = document.querySelector('meta[name="college-id"]');
    if(metaId) return metaId.getAttribute('content');
    // Try from Angular component data
    var el = document.querySelector('[ng-reflect-college-id], [data-college-id]');
    if(el) return el.getAttribute('ng-reflect-college-id') || el.getAttribute('data-college-id');
    return null;
  }
  
  function getCollegeSlug(){
    var path = window.location.pathname;
    // URL pattern: /college-details/slug or /college/id/slug
    var match = path.match(/\/college-details\/([^\/]+)/);
    if(match) return match[1];
    match = path.match(/\/college\/[^\/]+\/([^\/]+)/);
    if(match) return match[1];
    return null;
  }
  
  function isCollegePage(){
    var path = window.location.pathname.toLowerCase();
    return path.indexOf('/college-details/') >= 0 || path.indexOf('/college/') >= 0;
  }
  
  function injectTransportSection(collegeId){
    if(document.getElementById('ohc-transport-section')) return;
    
    fetch(API + '/apps/NearbyCollege/getTransport', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({college_id: collegeId})
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d.feature_enabled || !d.transport || d.transport.length === 0) return;
      
      var icons = {railway: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 11V5a2 2 0 012-2h12a2 2 0 012 2v6M4 11h16M4 11v5a2 2 0 002 2h1l1 3h8l1-3h1a2 2 0 002-2v-5M9 7h.01M15 7h.01"/></svg>',
        airport: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
        bus_stand: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 10h18M7 17v2M17 17v2M8 7h.01M16 7h.01"/></svg>'
      };
      var labels = {railway: 'Railway Station', airport: 'Airport', bus_stand: 'Bus Stand'};
      
      var html = '<div id="ohc-transport-section" style="margin:20px 0;padding:18px 20px;background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0">'
        + '<h3 style="font-size:1rem;font-weight:700;color:#0f172a;margin:0 0 14px;display:flex;align-items:center;gap:8px">'
        + '<span style="font-size:18px">&#128205;</span> Nearest Transport</h3>'
        + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">';
      
      d.transport.forEach(function(t){
        html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fff;border-radius:10px;border:1px solid #e2e8f0">'
          + '<div style="flex-shrink:0">' + (icons[t.type] || '') + '</div>'
          + '<div><div style="font-size:0.78rem;color:#64748b">' + (labels[t.type] || t.type) + '</div>'
          + '<div style="font-size:0.88rem;font-weight:600;color:#1e293b">' + t.name + '</div>'
          + '<div style="font-size:0.72rem;color:#94a3b8">' + t.distance_km + ' km away</div>'
          + '</div></div>';
      });
      
      html += '</div></div>';
      
      // Find a good place to insert - after college info section
      var targets = document.querySelectorAll('.about-college, [class*="college-info"], [class*="about"], .campus-facilities, [class*="facilities"]');
      var inserted = false;
      
      for(var i=0; i<targets.length; i++){
        if(targets[i].offsetHeight > 50){
          targets[i].insertAdjacentHTML('afterend', html);
          inserted = true;
          break;
        }
      }
      
      if(!inserted){
        // Fallback: insert before footer or at end of main content
        var main = document.querySelector('.college-detail-content, main, .content, ion-content');
        if(main) main.insertAdjacentHTML('beforeend', html);
      }
    })
    .catch(function(e){ console.log('Transport fetch error:', e); });
  }
  
  function injectNearbyCollegesSection(){
    if(document.getElementById('ohc-nearby-section')) return;
    if(!navigator.geolocation) return;
    
    // Only show on homepage or college listing pages
    var path = window.location.pathname.toLowerCase();
    if(path !== '/' && path.indexOf('/colleges') < 0 && path.indexOf('/college-details') < 0) return;
    
    var html = '<div id="ohc-nearby-section" style="margin:20px auto;max-width:1200px;padding:0 20px">'
      + '<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">'
      + '<h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 4px;display:flex;align-items:center;gap:8px">'
      + '<span style="font-size:20px">&#128205;</span> Colleges Near You</h3>'
      + '<p style="font-size:0.78rem;color:#64748b;margin:0 0 14px">Find colleges in your area offering your preferred courses</p>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">'
      + '<select id="ohc-radius" style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.82rem;background:#fff">'
      + '<option value="10">10 km</option><option value="25" selected>25 km</option><option value="50">50 km</option><option value="100">100 km</option></select>'
      + '<input type="text" id="ohc-course-filter" placeholder="Filter by course (optional)" style="flex:1;min-width:150px;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.82rem">'
      + '<button onclick="ohcSearchNearby()" style="padding:8px 16px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer">Search</button>'
      + '</div>'
      + '<div id="ohc-nearby-results" style="font-size:0.82rem;color:#64748b;text-align:center;padding:10px">Click Search to find colleges near your location</div>'
      + '</div></div>';
    
    // Insert on homepage after predictor or top exams
    var targets = document.querySelectorAll('#predictors, #ohc-top-exams, .trending-section, [class*="trending"]');
    for(var i=0; i<targets.length; i++){
      if(targets[i].offsetHeight > 0){
        targets[i].insertAdjacentHTML('afterend', html);
        return;
      }
    }
  }
  
  // Global function for nearby search
  window.ohcSearchNearby = function(){
    var resultsEl = document.getElementById('ohc-nearby-results');
    if(!resultsEl) return;
    resultsEl.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b">Detecting your location...</div>';
    
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      var radius = document.getElementById('ohc-radius').value;
      var course = document.getElementById('ohc-course-filter').value.trim();
      
      resultsEl.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b">Searching colleges within ' + radius + ' km...</div>';
      
      fetch(API + '/apps/NearbyCollege/search', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({latitude: lat, longitude: lng, radius: parseInt(radius), course: course || null, limit: 20})
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d.response_code !== '200' || !d.colleges || d.colleges.length === 0){
          resultsEl.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8">No colleges found within ' + radius + ' km' + (course ? ' for "' + course + '"' : '') + '. Try increasing the radius.</div>';
          return;
        }
        
        var html = '<div style="font-size:0.72rem;color:#94a3b8;margin-bottom:10px">' + d.total + ' colleges found within ' + radius + ' km</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">';
        
        d.colleges.forEach(function(clg){
          html += '<a href="/college-details/' + clg.slug + '" style="display:block;text-decoration:none;padding:12px 14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;transition:border-color 0.2s" onmouseover="this.style.borderColor=\'#4f46e5\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">'
            + '<div style="font-size:0.88rem;font-weight:600;color:#1e293b;margin-bottom:2px">' + clg.title + '</div>'
            + '<div style="font-size:0.72rem;color:#64748b">' + (clg.city || '') + (clg.state ? ', ' + clg.state : '') + '</div>'
            + '<div style="font-size:0.72rem;color:#4f46e5;font-weight:600;margin-top:4px">' + clg.distance_km + ' km away</div>'
            + '</a>';
        });
        
        html += '</div>';
        resultsEl.innerHTML = html;
      })
      .catch(function(){ resultsEl.innerHTML = '<div style="padding:20px;text-align:center;color:#f87171">Failed to search. Please try again.</div>'; });
    }, function(err){
      resultsEl.innerHTML = '<div style="padding:20px;text-align:center;color:#f87171">Location access denied. Please enable location permissions.</div>';
    }, {enableHighAccuracy: true, timeout: 10000});
  };
  
  function init(){
    if(!isCollegePage()){
      // Homepage: show nearby colleges
      setTimeout(injectNearbyCollegesSection, 4000);
      return;
    }
    
    // College detail page: show transport
    // Get college ID from the page URL or API
    var slug = getCollegeSlug();
    if(slug){
      // Fetch college ID from slug via API
      fetch(API + '/apps/College/getCollegeBySlug', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({slug: slug})
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d.response_code === '200' || d.response_code === '1'){
          var id = d.college_id || d.response_data?.id;
          if(id) injectTransportSection(id);
        }
      })
      .catch(function(){});
    }
  }
  
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 3000); });
  } else {
    setTimeout(init, 3000);
  }
  
  var lastUrl = location.href;
  new MutationObserver(function(){
    if(location.href !== lastUrl){
      lastUrl = location.href;
      var old1 = document.getElementById('ohc-transport-section');
      if(old1) old1.remove();
      var old2 = document.getElementById('ohc-nearby-section');
      if(old2) old2.remove();
      setTimeout(init, 2000);
    }
  }).observe(document.body, {childList: true, subtree: true});
})();
