
/* ===== H4FIZ CMS (Ctrl+Shift+A) — non-destructive ===== */
(function(){
  var ADMIN_KEY='root@h4fiz/admin';
  var STORAGE='h4fiz_cms_state_v1';

  if (!window.state) window.state = { portfolio:[], blog:[], products:[], cart:[] };

  try{
    var saved = JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(saved){
      if(Array.isArray(saved.portfolio)) state.portfolio = saved.portfolio;
      if(Array.isArray(saved.blog)) state.blog = saved.blog;
      if(Array.isArray(saved.products)) state.products = saved.products;
    }
  }catch(e){}

  ['portfolio','blog','products'].forEach(function(k){
    (state[k]||[]).forEach(function(x){
      if (x.published===undefined) x.published = true;
      if (!x.id) x.id = k + '_' + Math.random().toString(36).slice(2,8);
    });
  });

  function persist(){
    localStorage.setItem(STORAGE, JSON.stringify({
      portfolio: state.portfolio||[],
      blog: state.blog||[],
      products: state.products||[]
    }));
  }
  function refresh(){
    try{ if(typeof renderPortfolio==='function') renderPortfolio(); }catch(e){}
    try{ if(typeof renderBlog==='function') renderBlog(); }catch(e){}
    try{ if(typeof renderShop==='function') renderShop(); }catch(e){}
    try{ if(typeof renderCart==='function') renderCart(); }catch(e){}
  }

  // Make sure our handler takes precedence
  document.addEventListener('keydown', function(e){
    if(e.ctrlKey && e.shiftKey && e.code==='KeyA'){
      var key = prompt('Enter admin key:');
      if (key===ADMIN_KEY){ e.preventDefault(); e.stopPropagation(); openCMS(); }
    }
  }, true);

  function esc(s){
    return String(s||'').replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#039;'}[m] || m;
    });
  }

  function openCMS(){
    var old = document.getElementById('__cms__overlay'); if(old) old.remove();
    var ui = document.createElement('div');
    ui.id='__cms__overlay';
    ui.style='position:fixed;inset:0;background:rgba(0,0,0,.96);color:#dfffee;z-index:99999;padding:18px;overflow:auto';
    ui.innerHTML = ''
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
      +   '<h2 style="margin:0">Admin CMS</h2>'
      +   '<div style="display:flex;gap:8px">'
      +     '<button class="nav-btn" id="cmsExport">Export</button>'
      +     '<label class="nav-btn" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">'
      +       'Import <input id="cmsImport" type="file" accept="application/json" style="display:none">'
      +     '</label>'
      +     '<button class="nav-btn" id="cmsClose">Close</button>'
      +   '</div>'
      + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'
      +   '<button class="nav-btn active" data-tab="portfolio">Portfolio</button>'
      +   '<button class="nav-btn" data-tab="blog">Blog</button>'
      +   '<button class="nav-btn" data-tab="products">Shop</button>'
      + '</div>'
      + '<div id="cmsTable" style="overflow:auto;border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin-bottom:12px"></div>'
      + '<div style="border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px">'
      +   '<h4 style="margin:6px 0">Create / Edit</h4>'
      +   '<label>Title/Name</label><input id="cmsTitle" style="width:100%;margin-bottom:8px">'
      +   '<label>Meta/Price</label><input id="cmsMeta" style="width:100%;margin-bottom:8px">'
      +   '<label>Description/Link</label><textarea id="cmsDesc" rows="4" style="width:100%;margin-bottom:8px"></textarea>'
      +   '<label style="display:inline-flex;gap:6px;align-items:center;font-size:13px;color:#aaffce"><input id="cmsPub" type="checkbox" checked> Published</label>'
      +   '<div style="display:flex;gap:8px;margin-top:8px">'
      +     '<button class="primary" id="cmsSave">Save</button>'
      +     '<button class="nav-btn" id="cmsNew">New</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(ui);

    var tab='portfolio', editId=null;
    ui.querySelector('#cmsClose').onclick=()=>ui.remove();
    ui.querySelector('#cmsExport').onclick=()=>{
      var blob=new Blob([JSON.stringify({portfolio:state.portfolio,blog:state.blog,products:state.products},null,2)],{type:'application/json'});
      var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='cms.json';a.click();URL.revokeObjectURL(url);
    };
    ui.querySelector('#cmsImport').onchange=(e)=>{
      var f=e.target.files&&e.target.files[0]; if(!f)return;
      var fr=new FileReader();
      fr.onload=()=>{ try{
        var d=JSON.parse(String(fr.result||'{}'));
        if(Array.isArray(d.portfolio)) state.portfolio=d.portfolio;
        if(Array.isArray(d.blog)) state.blog=d.blog;
        if(Array.isArray(d.products)) state.products=d.products;
        persist(); refresh(); draw(); alert('Imported.'); }catch(_){ alert('Invalid JSON'); } };
      fr.readAsText(f);
    };
    ui.querySelectorAll('[data-tab]').forEach(b=> b.onclick=()=>{ ui.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); tab=b.dataset.tab; editId=null; fill({}); draw(); });
    ui.querySelector('#cmsNew').onclick=()=>{ editId=null; fill({}); };
    ui.querySelector('#cmsSave').onclick=()=>{
      var item={
        title:ui.querySelector('#cmsTitle').value,
        name:ui.querySelector('#cmsTitle').value,
        meta:ui.querySelector('#cmsMeta').value,
        price:ui.querySelector('#cmsMeta').value,
        desc:ui.querySelector('#cmsDesc').value,
        link:ui.querySelector('#cmsDesc').value,
        published:ui.querySelector('#cmsPub').checked
      };
      var arr=state[tab]||(state[tab]=[]);
      if(!editId){ item.id=tab+'_'+Math.random().toString(36).slice(2,8); arr.push(item); }
      else { var i=arr.findIndex(x=>String(x.id)===String(editId)); if(i>=0) arr[i]=Object.assign({},arr[i],item); }
      persist(); refresh(); draw(); fill({}); editId=null;
    };
    function fill(o){ ui.querySelector('#cmsTitle').value=o.title||o.name||''; ui.querySelector('#cmsMeta').value=o.meta||o.price||''; ui.querySelector('#cmsDesc').value=o.desc||o.link||''; ui.querySelector('#cmsPub').checked=o.published!==false; }
    function draw(){
      var arr=state[tab]||[];
      var rows = arr.map(function(x){
        return '<tr>'
          + '<td>'+esc(x.title||x.name||'')+'</td>'
          + '<td>'+esc(x.meta||x.price||'')+'</td>'
          + '<td style="text-align:right;white-space:nowrap">'
          +   '<button class="nav-btn" data-e="'+x.id+'">Edit</button> '
          +   '<button class="nav-btn" data-t="'+x.id+'">'+(x.published!==false?'Unpublish':'Publish')+'</button> '
          +   '<button class="nav-btn" data-d="'+x.id+'">Delete</button>'
          + '</td></tr>';
      }).join('');
      ui.querySelector('#cmsTable').innerHTML = '<table style="width:100%"><thead><tr><th style="text-align:left">Title</th><th style="text-align:left">Meta/Price</th><th style="text-align:right"></th></tr></thead><tbody>' + (rows || '<tr><td colspan="3" class="small" style="padding:8px;color:#7b7b86">No items</td></tr>') + '</tbody></table>';
      ui.querySelectorAll('[data-e]').forEach(b=> b.onclick=()=>{ editId=b.dataset.e; var it=(state[tab]||[]).find(i=>String(i.id)===String(editId)); fill(it||{}); });
      ui.querySelectorAll('[data-d]').forEach(b=> b.onclick=()=>{ var id=b.dataset.d; var i=(state[tab]||[]).findIndex(i=>String(i.id)===String(id)); if(i>=0){ state[tab].splice(i,1); persist(); refresh(); draw(); if(editId===id){ editId=null; fill({}); } } });
      ui.querySelectorAll('[data-t]').forEach(b=> b.onclick=()=>{ var id=b.dataset.t; var it=(state[tab]||[]).find(i=>String(i.id)===String(id)); if(it){ it.published = !(it.published!==false); persist(); refresh(); draw(); } });
    }
    draw();
  }

  // Refresh once in case hydration changed data
  refresh();
})();
/* ===== END H4FIZ CMS ===== */
