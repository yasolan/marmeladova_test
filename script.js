const CONFIG = {
  telegramUsername: 'your_username' // <-- замени на свой Telegram без @
};

// mobile menu
const header = document.querySelector('.site-header');
const menuBtn = document.querySelector('.menu-btn');
menuBtn.addEventListener('click', () => {
  header.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', header.classList.contains('open'));
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => header.classList.remove('open')));

// catalog filters
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.work-card').forEach(card => {
      card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
    });
  });
});

// interactive canvas
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let last = null;
function sizeCanvas(){
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#b7ff3c';
  ctx.lineWidth = 5;
}
sizeCanvas(); window.addEventListener('resize', sizeCanvas);
function point(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
canvas.addEventListener('pointerdown',e=>{drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});
canvas.addEventListener('pointerup',()=>drawing=false);canvas.addEventListener('pointerleave',()=>drawing=false);
document.getElementById('clearCanvas').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));

// FAQ single-open-ish visual behaviour
document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) document.querySelectorAll('details').forEach(other => { if(other !== d) other.open = false; });
}));

// order form
const pages = [...document.querySelectorAll('.form-page')];
const steps = [...document.querySelectorAll('.step')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('orderForm');
const successPanel = document.getElementById('successPanel');
const summaryBox = document.getElementById('summaryBox');
const resultText = document.getElementById('resultText');
const telegramLink = document.getElementById('telegramLink');
let currentPage = 0;
const choices = {};

const orderNo = Math.floor(1000 + Math.random() * 9000);
document.getElementById('orderNumber').textContent = orderNo;

function showPage(index){
  currentPage = Math.max(0, Math.min(index, pages.length - 1));
  pages.forEach((p,i)=>p.classList.toggle('active',i===currentPage));
  steps.forEach((s,i)=>s.classList.toggle('active',i===currentPage));
  prevBtn.style.visibility = currentPage === 0 ? 'hidden' : 'visible';
  nextBtn.classList.toggle('hidden', currentPage === pages.length - 1);
  submitBtn.classList.toggle('hidden', currentPage !== pages.length - 1);
  if(currentPage === pages.length - 1) updateSummary();
}
showPage(0);

steps.forEach((step,i)=>step.addEventListener('click',()=>showPage(i)));
prevBtn.addEventListener('click',()=>showPage(currentPage-1));
nextBtn.addEventListener('click',()=>showPage(currentPage+1));

document.querySelectorAll('[data-name]').forEach(group => {
  const name = group.dataset.name;
  const multi = group.dataset.multi === 'true';
  choices[name] = multi ? [] : '';
  group.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click',()=>{
    if(multi){
      btn.classList.toggle('selected');
      choices[name] = [...group.querySelectorAll('.choice.selected')].map(x=>x.textContent.trim());
    } else {
      group.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected'); choices[name]=btn.textContent.trim();
    }
  }));
});

// previews
const refsInput = document.getElementById('refs');
document.getElementById('uploadBtn').addEventListener('click',()=>refsInput.click());
refsInput.addEventListener('change',()=>{
  const list = document.getElementById('previewList'); list.innerHTML='';
  [...refsInput.files].slice(0,6).forEach(file=>{
    const img=document.createElement('img'); img.src=URL.createObjectURL(file); img.alt=file.name; list.appendChild(img);
  });
});

function val(name){return (form.elements[name]?.value || '').trim();}
function applicationText(){
  const lines = [
    `🧪 Заявка CUSTOM.LAB #${orderNo}`,
    '',
    `👕 Вещь: ${choices.item || val('itemOther') || 'не указано'}${val('itemOther') ? ` (${val('itemOther')})` : ''}`,
    `📦 Основа: ${choices.source || 'не указано'}`,
    `📏 Размер: ${val('size') || 'не указан'}`,
    '',
    `🎨 Идея: ${val('idea') || 'не описана'}`,
    `🔗 Ссылки: ${val('links') || 'нет'}`,
    `🖼 Референсы: ${refsInput.files.length ? refsInput.files.length + ' файл(а/ов) — прикреплю отдельно' : 'нет'}`,
    '',
    `📍 Размещение: ${Array.isArray(choices.placement) && choices.placement.length ? choices.placement.join(', ') : 'не указано'}`,
    `🌈 Цвет: ${choices.color || 'не указано'}`,
    `💰 Бюджет: ${choices.budget || 'не указан'}`,
    `📅 Срок: ${val('deadline') || 'не указан'}`,
    `🚚 Получение: ${val('delivery') || 'не указано'}`,
    '',
    `👤 Имя: ${val('name') || 'не указано'}`,
    `💬 Контакт: ${val('contact') || 'не указан'}`,
    `📝 Комментарий: ${val('comment') || 'нет'}`
  ];
  return lines.join('\n');
}
function updateSummary(){
  summaryBox.textContent = applicationText();
}
form.addEventListener('input',()=>{ if(currentPage===3) updateSummary(); });
form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!form.checkValidity()){ form.reportValidity(); return; }
  const text = applicationText();
  resultText.value = text;
  const username = CONFIG.telegramUsername.replace('@','');
  telegramLink.href = username && username !== 'your_username' ? `https://t.me/${username}` : `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
  successPanel.classList.remove('hidden');
  successPanel.scrollIntoView({behavior:'smooth',block:'center'});
});

document.getElementById('copyBtn').addEventListener('click', async e => {
  try{await navigator.clipboard.writeText(resultText.value);e.currentTarget.textContent='Скопировано ✓';setTimeout(()=>e.currentTarget.textContent='Скопировать заявку',1800)}
  catch{resultText.select();document.execCommand('copy');}
});
