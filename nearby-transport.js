/* OhCampus - Transport + Nearby Colleges */
(function(){
  var API='https://campusapi.ohcampus.com';
  var transportShownForCid=null;
  var transportFetching=false;

  function isCollegePage(){
    return location.pathname.indexOf('/collegeDetails/')>=0;
  }

  function getCollegeId(){
    var m=location.pathname.match(/\/collegeDetails\/(\d+)/);
    return m?m[1]:null;
  }

  function findContactDetailsSection(){
    var h1s=document.querySelectorAll('h1');
    for(var i=0;i<h1s.length;i++){
      if(h1s[i].textContent.trim()==='Contact Details'){
        var parent=h1s[i].parentElement;
        if(parent)return parent;
      }
    }
    return null;
  }

  function removeAllTransport(){
    var els=document.querySelectorAll('[id="ohc-transport-section"]');
    for(var i=0;i<els.length;i++)els[i].remove();
  }

  function showTransport(cid){
    if(transportShownForCid===cid)return;
    if(transportFetching)return;
    var contactDiv=findContactDetailsSection();
    if(!contactDiv)return;
    transportFetching=true;
    fetch(API+'/apps/NearbyCollege/getTransport',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({college_id:cid})})
    .then(function(r){return r.json()})
    .then(function(d){
      transportFetching=false;
      if(!d.feature_enabled||!d.transport||d.transport.length===0)return;
      // Remove any existing before inserting
      removeAllTransport();
      var contactDiv2=findContactDetailsSection();
      if(!contactDiv2)return;
      var icons={railway:'\u{1F686}',airport:'\u2708\uFE0F',bus_stand:'\u{1F68C}',metro:'\u{1F687}'};
      var labels={railway:'Railway Station',airport:'Airport',bus_stand:'Bus Stand',metro:'Metro Station'};
      var html='<div id="ohc-transport-section" style="margin-top:16px;padding:18px 20px;background:#f0f9ff;border-radius:14px;border:1px solid #bae6fd">'
        +'<h3 style="font-size:1rem;font-weight:700;color:#0f172a;margin:0 0 12px;display:flex;align-items:center;gap:6px">\u{1F4CD} Nearest Transport</h3>'
        +'<div style="display:flex;flex-direction:column;gap:10px">';
      d.transport.forEach(function(t){
        html+='<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fff;border-radius:10px;border:1px solid #e2e8f0">'
          +'<span style="font-size:22px">'+(icons[t.type]||'\u{1F4CD}')+'</span>'
          +'<div><div style="font-size:0.72rem;color:#64748b">'+(labels[t.type]||t.type)+'</div>'
          +'<div style="font-size:0.88rem;font-weight:600;color:#1e293b">'+t.name+'</div>'
          +'<div style="font-size:0.72rem;color:#4f46e5;font-weight:600">~'+t.distance_km+' km</div></div></div>';
      });
      html+='</div></div>';
      contactDiv2.insertAdjacentHTML('afterend',html);
      transportShownForCid=cid;
    }).catch(function(){transportFetching=false;});
  }

  function findQuickEnquirySection(){
    var allEls=document.querySelectorAll('div,h1,h2,h3,h4,h5');
    for(var i=0;i<allEls.length;i++){
      var el=allEls[i];
      var nodes=el.childNodes;
      for(var j=0;j<nodes.length;j++){
        if(nodes[j].nodeType===3 && nodes[j].textContent.trim().toLowerCase()==='quick enquiry'){
          var parent=el;
          for(var k=0;k<5;k++){
            if(parent.parentElement){
              parent=parent.parentElement;
              if(parent.className && parent.className.indexOf('bgContact')>=0){
                return parent;
              }
            }
          }
          return el.parentElement||el;
        }
      }
    }
    return null;
  }

  function showNearby(){
    if(document.getElementById('ohc-nearby-section'))return;
    if(!navigator.geolocation)return;
    var anchor=findQuickEnquirySection();
    if(!anchor){
      var f=document.querySelector('footer,[class*="footer"]');
      if(f)anchor=f;
    }
    if(!anchor)return;
    var html='<div id="ohc-nearby-section" style="margin:20px auto;max-width:1200px;padding:0 20px">'
      +'<div style="background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04)">'
      +'<h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 4px">\u{1F4CD} Colleges Near You</h3>'
      +'<p style="font-size:0.78rem;color:#64748b;margin:0 0 14px">Find colleges in your area offering your preferred courses</p>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">'
      +'<select id="ohc-radius" style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.82rem">'
      +'<option value="10">10 km</option><option value="25" selected>25 km</option><option value="50">50 km</option><option value="100">100 km</option></select>'
      +'<input type="text" id="ohc-course-filter" placeholder="Filter by course (e.g. Engineering, MBA)" style="flex:1;min-width:150px;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.82rem">'
      +'<button onclick="window.__ohcSearch()" style="padding:8px 16px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer">Search Nearby</button>'
      +'</div><div id="ohc-nearby-results" style="font-size:0.82rem;color:#64748b;text-align:center;padding:10px">Click Search to find colleges near your location</div></div></div>';
    anchor.insertAdjacentHTML('afterend',html);
  }

  window.__ohcSearch=function(){
    var el=document.getElementById('ohc-nearby-results');if(!el)return;
    el.innerHTML='<div style="padding:16px;color:#64748b">Detecting location...</div>';
    navigator.geolocation.getCurrentPosition(function(p){
      var radius=document.getElementById('ohc-radius').value;
      var course=document.getElementById('ohc-course-filter').value.trim();
      el.innerHTML='<div style="padding:16px;color:#64748b">Searching within '+radius+' km...</div>';
      var body={latitude:p.coords.latitude,longitude:p.coords.longitude,radius:parseInt(radius),limit:20};
      if(course)body.course=course;
      fetch(API+'/apps/NearbyCollege/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json()})
      .then(function(d){
        if(!d.colleges||d.colleges.length===0){el.innerHTML='<div style="padding:16px;color:#94a3b8">No colleges found'+(course?' for "'+course+'"':'')+'. Try increasing the radius.</div>';return;}
        var h='<div style="font-size:0.72rem;color:#94a3b8;margin-bottom:8px">'+d.total+' colleges within '+radius+' km'+(course?' matching "'+course+'"':'')+'</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">';
        d.colleges.forEach(function(c){
          h+='<a href="/collegeDetails/'+c.id+'" style="display:block;text-decoration:none;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;transition:border-color 0.2s" onmouseover="this.style.borderColor=\'#4f46e5\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">'
            +'<div style="font-size:0.88rem;font-weight:600;color:#1e293b">'+c.title+'</div>'
            +'<div style="font-size:0.72rem;color:#64748b">'+(c.city||'')+(c.state?', '+c.state:'')+'</div>'
            +'<div style="font-size:0.75rem;color:#4f46e5;font-weight:600;margin-top:3px">~'+c.distance_km+' km away</div></a>';
        });
        el.innerHTML=h+'</div>';
      }).catch(function(){el.innerHTML='<div style="padding:16px;color:#f87171">Failed to search. Please try again.</div>';});
    },function(){el.innerHTML='<div style="padding:16px;color:#f87171">Location access denied. Please enable location permissions.</div>';},{enableHighAccuracy:true,timeout:15000});
  };

  var lastPath='';
  setInterval(function(){
    var path=location.pathname;
    if(path!==lastPath){
      lastPath=path;
      removeAllTransport();
      transportShownForCid=null;
      transportFetching=false;
      var o2=document.getElementById('ohc-nearby-section');if(o2)o2.remove();
    }
    if(isCollegePage()){
      var cid=getCollegeId();
      if(cid)showTransport(cid);
    }else if(path==='/' || path==='/home'){
      showNearby();
    }
  },1500);
})();
