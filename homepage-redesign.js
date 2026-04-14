(function(){
  'use strict';
  var API='https://campusapi.ohcampus.com/apps';
  function isHome(){var p=window.location.pathname;return p==='/'||p==='/home'||p==='/index.html'||p==='';}
  function loadFonts(){
    if(!document.querySelector('link[href*="fontshare"]')){var l=document.createElement('link');l.href='https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap';l.rel='stylesheet';document.head.appendChild(l);}
    if(!document.querySelector('link[href*="Manrope"]')){var l2=document.createElement('link');l2.href='https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';l2.rel='stylesheet';document.head.appendChild(l2);}
  }
  var searchTimer=null;
  function doSearch(q){
    if(!q||q.length<2){hideDD();return;}
    clearTimeout(searchTimer);
    searchTimer=setTimeout(function(){
      var cp=fetch(API+'/Common/getDataBySearch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:q})}).then(function(r){return r.json();}).catch(function(){return{Colleges:[]};});
      var ep=fetch(API+'/Exam/getExamSearch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({searchexam:q})}).then(function(r){return r.json();}).catch(function(){return{Exams:[]};});
      var crp=fetch(API+'/Course/getCourseByCategory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({categoryId:'2',search:''})}).then(function(r){return r.json();}).then(function(d){var a=d.data||[];var lq=q.toLowerCase();return a.filter(function(c){return c.name.toLowerCase().indexOf(lq)!==-1;}).slice(0,5);}).catch(function(){return[];});
      Promise.all([cp,ep,crp]).then(function(res){
        var lq=q.toLowerCase();var colleges=(res[0].Colleges||[]).filter(function(c){return c.title.toLowerCase().indexOf(lq)!==-1;}).slice(0,5);
        var exams=(res[1].Exams||[]).slice(0,3);
        var courses=res[2]||[];
        var h='';
        if(exams.length>0){h+='<div class="ohc-dd-label">Exams</div>';h+=exams.map(function(e){return '<a href="/examsdetails/'+e.id+'" class="ohc-dd-item"><i class="fas fa-file-alt" style="color:#6366f1"></i><span>'+e.title+'</span></a>';}).join('');}
        if(courses.length>0){h+='<div class="ohc-dd-label">Courses</div>';h+=courses.map(function(c){return '<a href="/allCollegeList/course/bycat/'+c.id+'" class="ohc-dd-item"><i class="fas fa-book" style="color:#f59e0b"></i><span>'+c.name+'</span></a>';}).join('');}
        if(colleges.length>0){h+='<div class="ohc-dd-label">Colleges</div>';h+=colleges.map(function(c){return '<a href="/collegeDetails/'+c.id+'" class="ohc-dd-item"><i class="fas fa-university" style="color:#2e7d32"></i><span>'+c.title+'</span></a>';}).join('');}
        if(h){h+='<div class="ohc-dd-label" style="border-top:1px solid #e2e8f0;padding-top:8px">Search All</div>';h+='<a href="/search-results.html?q='+encodeURIComponent(q)+'" class="ohc-dd-item"><i class="fas fa-search" style="color:#1a73e8"></i><span>See all results for \u201c'+q+'\u201d</span></a>';}
        else{h+='<a href="/search-results.html?q='+encodeURIComponent(q)+'" class="ohc-dd-item"><i class="fas fa-search" style="color:#1a73e8"></i><span>Search for \u201c'+q+'\u201d</span></a>';}
        var dd=document.getElementById('ohcSearchDD');if(dd){dd.innerHTML=h;dd.style.display='block';}
      });
    },300);
  }
  function hideDD(){var dd=document.getElementById('ohcSearchDD');if(dd)dd.style.display='none';}

  function enhanceHero(){
    var hero=document.querySelector('.heroSection');
    if(!hero||document.getElementById('ohc-hero-search'))return;
    hero.classList.add('ohc-home-hero');
    var img=hero.querySelector('img.herosecimg,img');
    if(img)img.style.opacity='0.3';
    hero.style.backgroundColor='#070d14';
    var textset=hero.querySelector('.textset');
    if(!textset)return;
    var titleDiv=textset.querySelector('[class*="text-8xl"],[class*="text-7xl"],[class*="text-3xl"]');
    if(titleDiv)titleDiv.innerHTML='<span style="letter-spacing:-0.02em">Your Future Begins Here!</span>';
    var s=document.createElement('div');
    s.id='ohc-hero-search';
    s.innerHTML='<form class="ohc-search-box" action="/search-results.html" method="GET"><input type="text" name="q" placeholder="Search colleges, courses, exams..." id="ohcHeroInput" autocomplete="off"><button type="submit" class="ohc-search-btn"><i class="fas fa-search"></i> Search</button></form><div id="ohcSearchDD" class="ohc-search-dropdown" style="display:none"></div><div class="ohc-search-tags"><a href="/examsdetails/1268" class="ohc-search-tag">KCET</a><a href="/examsdetails/2084" class="ohc-search-tag">NEET</a><a href="/examsdetails/33" class="ohc-search-tag">JEE Main</a><a href="/examsdetails/1265" class="ohc-search-tag">COMEDK</a><a href="/rank-predictor.html" class="ohc-search-tag">Rank Predictor</a><a href="/college-predictor.html" class="ohc-search-tag">College Predictor</a></div>';
    textset.appendChild(s);
    var statsDiv=document.createElement("div");statsDiv.id="ohcHeroStats";statsDiv.className="ohc-hero-stats";statsDiv.innerHTML='<a href="/allCollegeList" class="ohc-hero-stat"><i class="fas fa-university ohc-hero-stat-icon"></i><span class="ohc-hero-stat-num">10,616</span><span class="ohc-hero-stat-label">Colleges</span></a><a href="/courselist" class="ohc-hero-stat"><i class="fas fa-book-open ohc-hero-stat-icon"></i><span class="ohc-hero-stat-num">6,303</span><span class="ohc-hero-stat-label">Courses</span></a><a href="/exams" class="ohc-hero-stat"><i class="fas fa-file-alt ohc-hero-stat-icon"></i><span class="ohc-hero-stat-num">201</span><span class="ohc-hero-stat-label">Exams</span></a>';textset.appendChild(statsDiv);
    var input=document.getElementById('ohcHeroInput');
    if(input){input.addEventListener('input',function(){doSearch(this.value);});input.addEventListener('focus',function(){if(this.value.length>=2)doSearch(this.value);});}
    document.addEventListener('click',function(e){if(!e.target.closest('#ohc-hero-search'))hideDD();});
  }

  function injectTopExams(){
    if(document.getElementById('ohc-top-exams'))return;
    var target=null;var ds=document.querySelectorAll('div');
    for(var i=0;i<ds.length;i++){if(ds[i].textContent.trim().indexOf('Featured Colleges')===0&&ds[i].children.length<5){target=ds[i].closest('[class*="px-30"],[class*="px-14"]')||ds[i];break;}}
    if(!target)target=document.querySelector('.ohc-predictor-wrapper');
    if(!target)return;
    var exams=[{n:'KCET 2026',d:'Karnataka CET',co:'#4361ee',ic:'fa-graduation-cap',b:'May 2026',id:1268},{n:'NEET UG 2026',d:'Medical Entrance',co:'#10b981',ic:'fa-heartbeat',b:'May 2026',id:2084},{n:'JEE Main 2026',d:'Engineering Entrance',co:'#f59e0b',ic:'fa-rocket',b:'Apr 2026',id:33},{n:'COMEDK 2026',d:'Private Engineering',co:'#7c3aed',ic:'fa-building',b:'May 2026',id:1265},{n:'CAT 2026',d:'MBA Entrance',co:'#ec4899',ic:'fa-briefcase',b:'Nov 2026',id:1245},{n:'GATE 2026',d:'PG Engineering',co:'#6366f1',ic:'fa-cogs',b:'Feb 2026',id:1259},{n:'NEET PG 2026',d:'Medical PG',co:'#14b8a6',ic:'fa-stethoscope',b:'Aug 2026',id:2082},{n:'PGCET 2026',d:'Karnataka PG',co:'#8b5cf6',ic:'fa-user-graduate',b:'Jun 2026',id:1248}];
    var el=document.createElement('div');el.id='ohc-top-exams';el.className='ohc-top-exams';
    el.innerHTML='<div class="ohc-section-title">Top Exams 2026</div><div class="ohc-section-subtitle">Stay updated with important entrance exams and their schedules</div><div class="ohc-exams-grid">'+exams.map(function(e){return '<a href="/examsdetails/'+e.id+'" class="ohc-exam-card"><div class="ohc-exam-icon" style="background:'+e.co+'"><i class="fas '+e.ic+'"></i></div><div class="ohc-exam-info"><h4>'+e.n+'</h4><p>'+e.d+'</p></div><span class="ohc-exam-badge">'+e.b+'</span></a>';}).join('')+'</div>';
    target.parentNode.insertBefore(el,target);
  }

  function injectCategories(){
    if(document.getElementById('ohc-categories'))return;
    var te=document.getElementById('ohc-top-exams');if(!te)return;
    var cats=[{n:'Engineering',ic:'fa-laptop-code',id:91},{n:'Medicine & Health Sciences',ic:'fa-heartbeat',id:97},{n:'Management',ic:'fa-chart-line',id:96},{n:'Pharmacy',ic:'fa-pills',id:162},{n:'Nursing',ic:'fa-user-nurse',id:164},{n:'Science',ic:'fa-flask',id:90},{n:'Law',ic:'fa-gavel',id:95},{n:'Design',ic:'fa-palette',id:155},{n:'Dental',ic:'fa-tooth',id:219},{n:'IT Software',ic:'fa-laptop-code',id:180},{n:'Arts',ic:'fa-book',id:191}];
    var el=document.createElement('div');el.id='ohc-categories';el.className='ohc-top-exams';
    el.innerHTML='<div class="ohc-section-title">Top NIRF Ranked Colleges</div><div class="ohc-section-subtitle">Browse NIRF ranked colleges by category</div><div class="ohc-cat-tabs">'+cats.map(function(c,i){return '<button class="ohc-cat-tab'+(i===0?' active':'')+'" data-catid="'+c.id+'" data-catname="'+c.n+'" onclick="window.ohcSwitchCat(this)"><i class="fas '+c.ic+'"></i> '+c.n+'</button>';}).join('')+'</div><div id="ohcCatColleges" class="ohc-cat-colleges"><div class="ohc-cat-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div></div>';
    te.parentNode.insertBefore(el,te.nextSibling);
    loadNirfColleges(cats[0].id,cats[0].n);
  }

  window.ohcSwitchCat=function(btn){
    document.querySelectorAll('.ohc-cat-tab').forEach(function(t){t.classList.remove('active');});
    btn.classList.add('active');
    loadNirfColleges(btn.getAttribute('data-catid'),btn.getAttribute('data-catname'));
  };

  function loadNirfColleges(catId,catName){
    var c=document.getElementById('ohcCatColleges');if(!c)return;
    c.innerHTML='<div class="ohc-cat-loading"><i class="fas fa-spinner fa-spin"></i> Loading '+catName+' colleges...</div>';
    fetch(API+'/College/getCollegeListByRank',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({courseId:catId.toString()})})
    .then(function(r){return r.json();})
    .then(function(d){
      var colleges=(d.collegelist||[]).filter(function(cl){return cl.title.indexOf('TESTING')===-1;});
      if(colleges.length===0){c.innerHTML='<div class="ohc-cat-loading">No NIRF ranked colleges found for '+catName+'</div>';return;}
      c.innerHTML=colleges.map(function(cl){
        var logo=cl.logo||'';
        var rank=cl.nirf_rank||'';
        return '<a href="/collegeDetails/'+cl.collegeid+'" class="ohc-clg-card">'+(rank?'<div class="ohc-clg-rank"><span class="ohc-rank-badge">#'+rank+'</span></div>':'')+'<div class="ohc-clg-left">'+(logo?'<img src="'+logo+'" alt="" onerror="this.style.display=\'none\'">':'')+'</div><div class="ohc-clg-info"><h4>'+cl.title+'</h4><p><i class="fas fa-map-marker-alt" style="color:#2e7d32;margin-right:4px"></i>'+(cl.statename||'India')+'</p>'+(rank?'<span class="ohc-nirf-tag">NIRF Rank #'+rank+'</span>':'')+'</div></a>';
      }).join('');
    })
    .catch(function(){c.innerHTML='<div class="ohc-cat-loading">Error loading colleges</div>';});
  }


  function injectLoansScholarships(){
    if(document.getElementById('ohc-loans-scholarships'))return;
    var cats=document.getElementById('ohc-categories');
    if(!cats)return;
    var el=document.createElement('div');
    el.id='ohc-loans-scholarships';
    el.className='ohc-top-exams';
    el.innerHTML='<div class="ohc-section-title">Loans & Scholarships</div>'
      +'<div class="ohc-section-subtitle">Finance your education with the right support</div>'
      +'<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;padding:0 20px">'
      +'<a href="/loans" style="flex:1;min-width:280px;max-width:480px;text-decoration:none">'
      +'<div style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);border:1px solid #90caf9;border-radius:16px;padding:24px">'
      +'<div style="width:50px;height:50px;background:#1565c0;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px"><i class="fas fa-university" style="color:white;font-size:22px"></i></div>'
      +'<h3 style="font-size:1.1rem;font-weight:700;color:#0d47a1;margin:0 0 8px">Education Loans</h3>'
      +'<p style="font-size:0.85rem;color:#333;margin:0 0 12px;line-height:1.4">Compare loans from 26+ banks. Get best interest rates for your education.</p>'
      +'<span style="font-size:0.85rem;font-weight:600;color:#1565c0">Explore Loans <i class="fas fa-arrow-right"></i></span>'
      +'</div></a>'
      +'<a href="/scholarships" style="flex:1;min-width:280px;max-width:480px;text-decoration:none">'
      +'<div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border:1px solid #a5d6a7;border-radius:16px;padding:24px">'
      +'<div style="width:50px;height:50px;background:#2e7d32;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px"><i class="fas fa-award" style="color:white;font-size:22px"></i></div>'
      +'<h3 style="font-size:1.1rem;font-weight:700;color:#1b5e20;margin:0 0 8px">Scholarships</h3>'
      +'<p style="font-size:0.85rem;color:#333;margin:0 0 12px;line-height:1.4">22+ scholarships available. Check eligibility & apply today!</p>'
      +'<span style="font-size:0.85rem;font-weight:600;color:#2e7d32">Explore Scholarships <i class="fas fa-arrow-right"></i></span>'
      +'</div></a></div>';
    // Place above Quick Enquiry (predictor wrapper area)
    var predWrapper = document.querySelector('.ohc-predictor-wrapper, #ohc-predictor-wrapper');
    if(predWrapper) {
      predWrapper.parentNode.insertBefore(el, predWrapper);
    } else {
      cats.parentNode.insertBefore(el, cats.nextSibling);
    }
  }


  function injectPredictorSection(){
    if(document.getElementById('ohc-predictor-cards'))return;
    var topExams=document.getElementById('ohc-top-exams');
    if(!topExams)return;
    var el=document.createElement('div');
    el.id='ohc-predictor-cards';
    el.className='ohc-top-exams';
    el.innerHTML='<div class="ohc-section-title">Rank & College Predictors</div>'
      +'<div class="ohc-section-subtitle">Find the best colleges matching your exam rank</div>'
      +'<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;padding:0 20px">'
      +'<a href="/rank-predictor.html" style="flex:1;min-width:280px;max-width:480px;text-decoration:none">'
      +'<div style="background:linear-gradient(135deg,#fff3e0,#ffe0b2);border:1px solid #ffcc80;border-radius:16px;padding:28px;transition:transform 0.2s">'
      +'<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">'
      +'<div style="width:50px;height:50px;background:#e65100;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fas fa-chart-line" style="color:white;font-size:22px"></i></div>'
      +'<div><h3 style="font-size:1.15rem;font-weight:700;color:#bf360c;margin:0">Rank Predictor</h3>'
      +'<p style="font-size:0.8rem;color:#666;margin:2px 0 0">KCET, COMEDK, JEE, NEET & more</p></div></div>'
      +'<p style="font-size:0.88rem;color:#333;margin:0 0 14px;line-height:1.5">Enter your expected marks and get predicted rank with accuracy based on historical data.</p>'
      +'<span style="font-size:0.9rem;font-weight:700;color:#e65100;display:flex;align-items:center;gap:6px">Predict My Rank <i class="fas fa-arrow-right"></i></span>'
      +'</div></a>'
      +'<a href="/college-predictor.html" style="flex:1;min-width:280px;max-width:480px;text-decoration:none">'
      +'<div style="background:linear-gradient(135deg,#e8eaf6,#c5cae9);border:1px solid #9fa8da;border-radius:16px;padding:28px;transition:transform 0.2s">'
      +'<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">'
      +'<div style="width:50px;height:50px;background:#283593;border-radius:12px;display:flex;align-items:center;justify-content:center"><i class="fas fa-university" style="color:white;font-size:22px"></i></div>'
      +'<div><h3 style="font-size:1.15rem;font-weight:700;color:#1a237e;margin:0">College Predictor</h3>'
      +'<p style="font-size:0.8rem;color:#666;margin:2px 0 0">Find colleges by your rank</p></div></div>'
      +'<p style="font-size:0.88rem;color:#333;margin:0 0 14px;line-height:1.5">Enter your exam rank and discover matching colleges with cutoff details, fees & more.</p>'
      +'<span style="font-size:0.9rem;font-weight:700;color:#283593;display:flex;align-items:center;gap:6px">Find Colleges <i class="fas fa-arrow-right"></i></span>'
      +'</div></a></div>';
    topExams.parentNode.insertBefore(el,topExams);
  }

  function cleanup(){
    ['ohc-hero-search','ohcHeroStats','ohc-predictor-cards','ohc-top-exams','ohc-categories','ohc-loans-scholarships'].forEach(function(id){
      var e=document.getElementById(id);if(e)e.remove();
    });
    var hero=document.querySelector('.heroSection.ohc-home-hero');
    if(hero)hero.classList.remove('ohc-home-hero');
  }

  function run(){
    if(!isHome()){cleanup();return;}
    loadFonts();enhanceHero();injectTopExams();injectPredictorSection();injectCategories();injectLoansScholarships();
  }

  function go(){[1000,2000,3500,5000,7000,10000].forEach(function(d){setTimeout(run,d);});}

  /* Initial run */
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',go);}else{go();}

  /* Watch for Angular SPA navigation — always active regardless of starting page */
  var lastUrl=location.href;
  var navTimer=null;
  new MutationObserver(function(){
    if(location.href!==lastUrl){
      lastUrl=location.href;
      clearTimeout(navTimer);
      cleanup();
      if(isHome()){navTimer=setTimeout(go,800);}
    }
    /* Also detect if we're on home but hero hasn't been enhanced yet (Angular rebuilt DOM) */
    if(isHome()&&document.querySelector('.heroSection')&&!document.getElementById('ohc-hero-search')){
      clearTimeout(navTimer);
      navTimer=setTimeout(run,500);
    }
  }).observe(document.body,{childList:true,subtree:true});
})();
