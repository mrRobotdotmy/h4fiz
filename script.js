
/* ----------------------------
   Helper + State
   ---------------------------- */
const state = {
  portfolio: [
    {title:"EQNov Dashboard", meta:"Web App", desc:"Admin dashboard & order management."},
    {title:"Neon Terminal UI", meta:"UI/UX", desc:"Terminal-inspired UI kit."}
  ],
  blog: [
    {title:"Launching EQNov", desc:"Short intro to the project."}
  ],
  products: [
    {id:1,name:"Bot Package A",price:"RM10",link:"https://example.com/order1"},
    {id:2,name:"Bot Package B",price:"RM20",link:"https://example.com/order2"}
  ],
  cart: []
};

/* ----------------------------
   SPA Navigation
   ---------------------------- */
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const sections = Array.from(document.querySelectorAll('main section'));
navButtons.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const view = btn.dataset.view;
    if(view) showView(view);
  });
});
function showView(view){
  navButtons.forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  sections.forEach(s=>s.classList.toggle('active', s.id===view));
  window.scrollTo({top:0,behavior:'smooth'});
}
function scrollToShop(){ showView('shop'); }

/* ----------------------------
   Home terminal / typewriter
   ---------------------------- */
const homeType = document.getElementById('homeType');
const homeLines = [
  "full-stack digital marketing • web development",
  "problem solver • visual hacker",
  "crafting immersive experiences with code & pixels.",
  "currently: building a good life."
];
let hl=0,ch=0;
(function typeWriter(){
  const line = homeLines[hl];
  homeType.textContent = line.slice(0,ch) + (ch%2 ? "|" : "");
  ch++;
  if(ch > line.length + 6){
    hl = (hl+1) % homeLines.length;
    ch = 0;
    setTimeout(typeWriter, 700);
  } else {
    setTimeout(typeWriter, 50 + Math.random()*60);
  }
})();

/* ----------------------------
   Mini Console (hacker widgets)
   ---------------------------- */
const miniConsole = document.getElementById('miniConsole');
let uptimeStart = Date.now();
const logPool = [
  "System: Running(OK)",
];
function fmtUptime(sec){
  const h = Math.floor(sec/3600); const m = Math.floor((sec%3600)/60); const s = sec%60;
  return `${h}h ${m}m ${s}s`;
}
function updateMini(){
  const now = Date.now();
  const sec = Math.floor((now - uptimeStart)/1000);
  const cpu = Math.floor(Math.random()*45 + 5); // 5-50%
  const mem = Math.floor(Math.random()*60 + 10); // 10-70%
  const net = Math.floor(Math.random()*900 + 100); // pkts/s
  const ip = `192.168.${Math.floor(Math.random()*200)}.${Math.floor(Math.random()*250)}`;
  // header lines
  let html = `<div><span class="prompt">&gt;_</span> system: secured</div>`;
  html += `<div><span class="prompt">&gt;_</span> uptime: ${fmtUptime(sec)}</div>`;
  html += `<div><span class="prompt">&gt;_</span> ip: ${ip}</div>`;
  html += `<div><span class="prompt">&gt;_</span> cpu: ${cpu}% | mem: ${mem}% | net: ${net} pkt/s</div>`;
  // logs (append last few)
  html += '<div style="margin-top:8px;color:var(--muted)">';
  // keep a persistent log array on the element
  miniConsole._logs = miniConsole._logs || [];
  if(Math.random() < 0.6){
    miniConsole._logs.push(`>_ ${logPool[Math.floor(Math.random()*logPool.length)]} (${new Date().toLocaleTimeString()})`);
    if(miniConsole._logs.length > 12) miniConsole._logs.shift();
  }
  miniConsole._logs.forEach(l => html += `<div>${l}</div>`);
  html += '</div>';
  miniConsole.innerHTML = html;
  // keep scroll to bottom
  miniConsole.scrollTop = miniConsole.scrollHeight;
}
setInterval(updateMini, 1500);
updateMini();

/* ----------------------------
   Portfolio / Blog / Shop renderers
   ---------------------------- */
const portfolioGrid = document.getElementById('portfolioGrid');
function renderPortfolio(){
  portfolioGrid.innerHTML = '';
  state.portfolio.forEach((p,idx)=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<div style="font-weight:700">${escapeHtml(p.title)}</div><div class="small" style="margin-top:6px">${escapeHtml(p.meta)}</div>`;
    el.addEventListener('click', ()=> openModal(p.title, p.meta, p.desc || '—'));
    portfolioGrid.appendChild(el);
  });
}
renderPortfolio();

const postsEl = document.getElementById('posts');
function renderBlog(){
  postsEl.innerHTML = '';
  state.blog.forEach((b,idx)=>{
    const el = document.createElement('div'); el.className='card';
    el.style.padding = '10px';
    el.innerHTML = `<div style="font-weight:700">${escapeHtml(b.title)}</div><div class="small" style="margin-top:6px">${escapeHtml(b.desc || '')}</div>`;
    postsEl.appendChild(el);
  });
}
renderBlog();

const shopList = document.getElementById('shopList');
const cartEl = document.getElementById('cart');
function renderShop(){
  shopList.innerHTML = '';
  state.products.forEach(prod=>{
    const div = document.createElement('div'); div.className = 'shop-item';
    div.innerHTML = `<div class="img">${prod.id}</div>
                     <div class="meta"><div style="font-weight:700">${escapeHtml(prod.name)}</div><div class="small">${escapeHtml(prod.price)}</div></div>
                     <div><button class="add-btn">Add to Cart</button></div>`;
    div.querySelector('button').addEventListener('click', ()=> {
      state.cart.push(prod);
      renderCart();
      toast('Added to cart');
    });
    shopList.appendChild(div);
  });
}
renderShop();

function renderCart(){
  if(!cartEl) return;
  if(state.cart.length === 0){
    cartEl.innerHTML = `<div class="small" style="color:var(--muted)">Cart is empty</div>`;
    return;
  }
  let totalText = '';
  state.cart.forEach((it, i)=>{
    const line = document.createElement('div');
    line.style.display='flex'; line.style.justifyContent='space-between'; line.style.alignItems='center'; line.style.marginBottom='6px';
    line.innerHTML = `<div>${escapeHtml(it.name)}</div><div class="small">${escapeHtml(it.price)} <button class="nav-btn" data-i="${i}">✕</button></div>`;
    line.querySelector('button').addEventListener('click', ()=>{ state.cart.splice(i,1); renderCart(); });
    cartEl.appendChild(line);
  });
  const checkoutWrap = document.createElement('div');
  checkoutWrap.style.marginTop='8px';
  checkoutWrap.innerHTML = `<div style="display:flex;justify-content:space-between;font-weight:700"><div>Items</div><div>${state.cart.length}</div></div>`;
  cartEl.appendChild(checkoutWrap);
}
renderCart();

/* Checkout behavior: as requested, opens external link(s) in new tabs.
   We'll open one tab per cart item to that product's external link.
*/
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  if(state.cart.length === 0){ toast('Cart empty'); return; }
  // Open each product link in new tab
  state.cart.forEach(p => {
    try { window.open(p.link, '_blank'); } catch(e){ /* ignore */ }
  });
  // Clear cart
  state.cart = [];
  renderCart();
  toast('Checkout opened in new tab(s)');
});

/* ----------------------------
   Modal functions
   ---------------------------- */
const overlay = document.getElementById('overlay');
function openModal(title, tag, content){
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalTag').textContent = tag;
  document.getElementById('modalContent').textContent = content;
  overlay.classList.add('show');
}
function closeModal(){
  overlay.classList.remove('show');
}

/* ----------------------------
   Contact form (mock)
   ---------------------------- */
document.getElementById('sendBtn').addEventListener('click', ()=>{
  const name = document.getElementById('cname').value.trim();
  const email = document.getElementById('cemail').value.trim();
  if(!name || !email){ document.getElementById('contactStatus').textContent = 'Please enter name and email.'; return; }
  document.getElementById('contactStatus').textContent = 'Sending...';
  setTimeout(()=>{ document.getElementById('contactStatus').textContent = 'Message sent (mock).'; document.getElementById('contactForm').reset(); }, 900);
});

/* ----------------------------
   Simple toast
   ---------------------------- */
function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position='fixed'; t.style.left='50%'; t.style.bottom='22px'; t.style.transform='translateX(-50%)';
  t.style.padding='10px 14px'; t.style.borderRadius='10px'; t.style.background='linear-gradient(90deg,var(--accent),var(--accent2))';
  t.style.color='#021'; t.style.boxShadow='var(--neon-shadow)'; t.style.zIndex=60;
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity='0', 1200);
  setTimeout(()=> t.remove(), 1800);
}

/* ----------------------------
   Admin Panel: Ctrl+Shift+A opens admin prompt and admin UI
   Admin key (prompt): root@h4fiz/admin
   ---------------------------- */
const ADMIN_KEY = 'root@h4fiz/admin';
let adminUnlocked = false;
document.addEventListener('keydown', (e)=>{
  if(e.ctrlKey && e.shiftKey && e.code === "KeyA"){
    const key = prompt('Enter admin key:');
    if(key === ADMIN_KEY){
      adminUnlocked = true;
      openAdminUI();
    } else {
      alert('Access denied');
    }
  }
});

function openAdminUI(){
  // small admin panel overlay
  const panel = document.createElement('div');
  panel.style.position='fixed'; panel.style.inset='0'; panel.style.zIndex=70; panel.style.background='rgba(0,0,0,0.95)';
  panel.style.color='#aaffcc'; panel.style.padding='18px'; panel.style.overflow='auto';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h2 style="margin:0">Admin Panel</h2>
      <div><button class="nav-btn" id="closeAdmin">Close</button></div>
    </div>

    <section style="margin-bottom:14px">
      <h3 style="margin:6px 0">Add Portfolio Item</h3>
      <label>Title</label><input id="adm_pf_title">
      <label>Meta</label><input id="adm_pf_meta">
      <label>Description</label><textarea id="adm_pf_desc"></textarea>
      <div style="margin-top:8px"><button class="primary" id="adm_add_pf">Add Portfolio</button></div>
    </section>

    <section style="margin-bottom:14px">
      <h3 style="margin:6px 0">Add Blog Post</h3>
      <label>Title</label><input id="adm_bl_title">
      <label>Content</label><textarea id="adm_bl_desc"></textarea>
      <div style="margin-top:8px"><button class="primary" id="adm_add_bl">Add Blog</button></div>
    </section>

    <section style="margin-bottom:14px">
      <h3 style="margin:6px 0">Add Shop Product</h3>
      <label>Name</label><input id="adm_pr_name">
      <label>Price</label><input id="adm_pr_price">
      <label>External Link</label><input id="adm_pr_link" placeholder="https://...">
      <div style="margin-top:8px"><button class="primary" id="adm_add_pr">Add Product</button></div>
    </section>

    <section style="margin-top:24px">
      <h3 style="margin:6px 0">Current Data</h3>
      <div style="max-height:180px;overflow:auto;border:1px solid rgba(255,255,255,0.03);padding:8px;border-radius:6px;background:rgba(255,255,255,0.01)">
        <pre id="adm_dump" style="white-space:pre-wrap;font-size:13px"></pre>
      </div>
    </section>
  `;
  document.body.appendChild(panel);
  document.getElementById('closeAdmin').addEventListener('click', ()=>panel.remove());
  document.getElementById('adm_add_pf').addEventListener('click', ()=>{
    const t = document.getElementById('adm_pf_title').value.trim();
    const m = document.getElementById('adm_pf_meta').value.trim();
    const d = document.getElementById('adm_pf_desc').value.trim();
    if(!t) return alert('Title required');
    state.portfolio.push({title:t,meta:m,desc:d});
    renderPortfolio(); updateAdminDump();
  });
  document.getElementById('adm_add_bl').addEventListener('click', ()=>{
    const t = document.getElementById('adm_bl_title').value.trim();
    const d = document.getElementById('adm_bl_desc').value.trim();
    if(!t) return alert('Title required');
    state.blog.push({title:t,desc:d});
    renderBlog(); updateAdminDump();
  });
  document.getElementById('adm_add_pr').addEventListener('click', ()=>{
    const n = document.getElementById('adm_pr_name').value.trim();
    const p = document.getElementById('adm_pr_price').value.trim();
    const l = document.getElementById('adm_pr_link').value.trim();
    if(!n || !l) return alert('Name and link required');
    const id = (state.products.length? state.products[state.products.length-1].id+1 : 1);
    state.products.push({id, name:n, price:p||'—', link:l});
    renderShop(); updateAdminDump();
  });
  function updateAdminDump(){
    document.getElementById('adm_dump').textContent = JSON.stringify(state, null, 2);
  }
  updateAdminDump();
}

/* ----------------------------
   Utilities
   ---------------------------- */
function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

/* ----------------------------
   Matrix rain (canvas) — responsive
   ---------------------------- */
(function matrixRain(){
  const wrap = document.getElementById('matrix');
  const canvas = document.createElement('canvas'); canvas.style.width='100%'; canvas.style.height='100%'; canvas.style.display='block';
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const fontSize = 14;
  let cols = Math.floor(w / fontSize);
  let drops = new Array(cols).fill(1);
  function resize(){
    w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight;
    cols = Math.floor(w / fontSize); drops = new Array(cols).fill(1);
  }
  window.addEventListener('resize', resize);
  function draw(){
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(0,0,w,h);
    ctx.font = fontSize + "px monospace";
    for(let i=0;i<cols;i++){
      const text = String.fromCharCode(33 + Math.random()*94);
      // alternate color between accent and accent2
      ctx.fillStyle = (i%6 === 0) ? "#7C4DFF" : "#00FF9F";
      ctx.fillText(text, i*fontSize, drops[i]*fontSize);
      if(drops[i]*fontSize > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ----------------------------
   Initialize render + footer year
   ---------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();
renderPortfolio();
renderBlog();
renderShop();

/* ----------------------------
   Cursor glow
   ---------------------------- */
const glow = document.getElementById('glow');
document.addEventListener('mousemove', (e)=>{
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

/* ----------------------------
   Small accessibility: close overlay click
   ---------------------------- */
document.getElementById('overlay').addEventListener('click', (ev)=>{
  if(ev.target === document.getElementById('overlay')) closeModal();
});



(function(){
  const el = document.querySelector('.h4x-typer');
  if(!el) return;
  const full = el.getAttribute('data-text') || el.textContent;
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'h4x-cursor';
  cursor.textContent = '|';
  el.after(cursor);

  let i = 0;
  const speed = 20; // ~ "2" speed from your note: moderately fast
  function tick(){
    if(i <= full.length){
      el.textContent = full.slice(0, i);
      i++;
      requestAnimationFrame(tick);
    }else{
      // leave cursor blinking at end
    }
  }
  // slight delay so it starts after existing boot lines
  setTimeout(()=>requestAnimationFrame(tick), 400);
})();



(function(){
  // 1) Visually rename "Shop(EQNov)" -> "Shop" without touching original HTML
  const shopBtn = document.querySelector('nav[aria-label="Primary"] .nav-btn[data-view="shop"]');
  if (shopBtn && /Shop\(EQNov\)/i.test(shopBtn.textContent)) {
    shopBtn.setAttribute('data-original-label', shopBtn.textContent.trim());
    shopBtn.textContent = 'Shop';
  }

  // 2) Ensure .active styling stays in sync with existing logic
  const btns = document.querySelectorAll('nav[aria-label="Primary"] .nav-btn');
  btns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    }, {capture:true});
  });
})();
