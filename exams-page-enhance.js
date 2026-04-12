/* OhCampus Exams Page Enhancement */
(function(){
  'use strict';
  var API='https://campusapi.ohcampus.com/apps';
  function isExamsPage(){return window.location.pathname==='/exams';}

  function addExamSearch(){
    if(!isExamsPage()||document.getElementById('ohc-exam-search'))return;

    // Reduce banner height - find the large hero/banner area
    var allDivs=document.querySelectorAll('div,section');
    for(var k=0;k<allDivs.length;k++){
      var el=allDivs[k];
      var rect=el.getBoundingClientRect();
      if(rect.height>250&&rect.top<100&&rect.width>800){
        var bg=getComputedStyle(el).backgroundImage;
        var hasImg=el.querySelector('img');
        if(bg!=='none'||hasImg){
          el.style.maxHeight='250px';
          el.style.minHeight='200px';
          el.style.overflow='hidden';
          if(hasImg)hasImg.style.objectFit='cover';
          break;
        }
      }
    }

    // Find the EXAMS/ARTICLES tab area and insert search before it
    var tabArea=document.querySelector('[role="tablist"],.mat-tab-header');
    if(!tabArea){
      // Try text-based detection
      var allDivs=document.querySelectorAll('div');
      for(var j=0;j<allDivs.length;j++){
        var t=allDivs[j].textContent.trim();
        if((t==='EXAMS'||t==='EXAMSARTICLES'||t.startsWith('EXAMS'))&&allDivs[j].children.length<5&&allDivs[j].offsetHeight<80){
          tabArea=allDivs[j];break;
        }
      }
    }

    var searchDiv=document.createElement('div');
    searchDiv.id='ohc-exam-search';
    searchDiv.style.cssText='max-width:700px;margin:20px auto;padding:0 20px;position:relative;';
    searchDiv.innerHTML=
      '<form action="/search-results.html" method="GET" style="display:flex;gap:8px;">'+
        '<input type="text" name="q" id="ohcExamSearchInput" placeholder="Search exams..." autocomplete="off" style="flex:1;padding:12px 16px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;font-family:Manrope,sans-serif;outline:none;">'+
        '<button type="submit" style="background:#1a73e8;color:white;border:none;padding:12px 24px;border-radius:8px;font-family:Manrope,sans-serif;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;"><i class="fas fa-search"></i> Search</button>'+
      '</form>'+
      '<div id="ohcExamDD" style="display:none;position:absolute;top:100%;left:20px;right:20px;background:white;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.15);border:1px solid #e2e8f0;max-height:300px;overflow-y:auto;z-index:100;margin-top:4px;"></div>';

    if(tabArea&&tabArea.parentNode){
      tabArea.parentNode.insertBefore(searchDiv,tabArea);
    } else {
      // Insert after the first big element
      var content=document.querySelector('.mat-tab-group,[class*="content"],[class*="main"]');
      if(content)content.insertBefore(searchDiv,content.firstChild);
    }

    // Wire search
    var timer=null;
    var input=document.getElementById('ohcExamSearchInput');
    if(input){
      input.addEventListener('input',function(){
        var q=this.value;
        if(!q||q.length<2){document.getElementById('ohcExamDD').style.display='none';return;}
        clearTimeout(timer);
        timer=setTimeout(function(){
          fetch(API+'/Exam/getExamSearch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({searchexam:q})})
          .then(function(r){return r.json();})
          .then(function(d){
            var exams=d.Exams||[];
            var dd=document.getElementById('ohcExamDD');
            if(exams.length>0){
              dd.innerHTML=exams.map(function(e){
                return '<a href="/examsdetails/'+e.id+'" style="display:flex;align-items:center;gap:12px;padding:11px 18px;text-decoration:none;color:#0f172a;font-size:0.9rem;border-bottom:1px solid #f1f5f9;transition:background 0.15s;" onmouseover="this.style.background=\'#e8f5e9\'" onmouseout="this.style.background=\'white\'"><i class="fas fa-file-alt" style="color:#6366f1"></i><span>'+e.title+'</span></a>';
              }).join('');
              dd.style.display='block';
            } else {dd.style.display='none';}
          });
        },300);
      });
      input.addEventListener('focus',function(){if(this.value.length>=2)this.dispatchEvent(new Event('input'));});
      document.addEventListener('click',function(e){if(!e.target.closest('#ohc-exam-search'))document.getElementById('ohcExamDD').style.display='none';});
    }
    console.log('Exams page search added');
  }

  function go(){[1500,3000,5000].forEach(function(d){setTimeout(addExamSearch,d);});}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',go);}else{go();}
})();
