const state={stories:[],sources:[],companies:[],topic:"All",limit:10};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function dateFmt(d){try{return new Intl.DateTimeFormat("en",{day:"numeric",month:"short",year:"numeric"}).format(new Date(d))}catch{return d}}
function storyHTML(s){return `<article class="story"><div><div class="meta">${esc(s.source)} · ${dateFmt(s.date)}</div><h3><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></h3><div>${(s.tags||[]).slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>${s.summary?`<p class="summary">${esc(s.summary)}</p>`:""}<div class="why"><b>Why it matters</b> — ${esc(s.why)}</div></div><a class="read" href="${esc(s.url)}" target="_blank" rel="noopener">Read original ↗</a></article>`}
function renderLatest(){
 const q=$("#search").value.toLowerCase().trim(), sort=$("#sort").value;
 let arr=state.stories.filter(s=>state.topic==="All"||(s.tags||[]).includes(state.topic)).filter(s=>!q||[s.title,s.source,s.summary,s.why,...(s.tags||[]),...(s.companies||[])].join(" ").toLowerCase().includes(q));
 arr.sort(sort==="source"?(a,b)=>a.source.localeCompare(b.source):(a,b)=>new Date(b.date)-new Date(a.date));
 const feature=arr[0];
 $("#featured").innerHTML=feature?`<article class="featured"><div class="meta">${esc(feature.source)} · ${dateFmt(feature.date)}</div><h3><a href="${esc(feature.url)}" target="_blank" rel="noopener">${esc(feature.title)}</a></h3><div>${(feature.tags||[]).slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div><div class="why"><b>Why it matters</b> — ${esc(feature.why)}</div></article>`:"";
 $("#feed").innerHTML=arr.slice(1,state.limit).map(storyHTML).join("")||`<div class="empty">No stories match those filters.</div>`;
 $("#moreBtn").style.display=arr.length>state.limit?"block":"none";
}
function setTopic(t){state.topic=t; $$(".chip").forEach(x=>x.classList.toggle("active",x.dataset.topic===t)); renderLatest()}
function showView(v){
 $$(".view").forEach(x=>x.classList.add("hidden")); $("#"+v+"View").classList.remove("hidden");
 $$(".tab").forEach(x=>x.classList.toggle("active",x.dataset.view===v));
 if(v==="research") $("#researchFeed").innerHTML=state.stories.filter(s=>(s.tags||[]).some(t=>["Research","Technology"].includes(t))).map(storyHTML).join("")||`<div class="empty">No research items yet.</div>`;
}
function showCompany(name){
 showView("companies");
 $$(".company-card").forEach(x=>x.style.borderColor=x.dataset.company===name?"var(--rust)":"var(--line)");
 const a=state.stories.filter(s=>(s.companies||[]).includes(name));
 $("#companyStories").innerHTML=`<p class="eyebrow">${esc(name.toUpperCase())} · ${a.length} STORIES</p>`+(a.map(storyHTML).join("")||`<div class="empty">No recent stories for ${esc(name)} yet.</div>`);
}
async function init(){
 try{
  const r=await fetch("data/news.json",{cache:"no-store"}), d=await r.json();
  state.stories=d.stories||[]; state.sources=d.sources||[]; state.companies=d.companies||[];
  $("#updated").textContent="Updated "+dateFmt(d.updated_at);
  $("#storyCount").textContent=state.stories.length; $("#sourceCount").textContent=state.sources.length; $("#companyCount").textContent=state.companies.length;
  const topics=["All","Manufacturing","Equipment","AI & Compute","Advanced Packaging","Memory","Foundries","Materials","Research","Business","India"];
  $("#topics").innerHTML=topics.map(t=>`<button class="chip ${t==="All"?"active":""}" data-topic="${t}">${t}</button>`).join("");
  $$(".chip").forEach(b=>b.addEventListener("click",()=>setTopic(b.dataset.topic)));
  const counts={}; state.stories.flatMap(s=>s.tags||[]).forEach(t=>counts[t]=(counts[t]||0)+1);
  $("#stack").innerHTML=["AI & Compute","Manufacturing","Advanced Packaging","Memory","Equipment","Research"].map(t=>`<div class="stack-item"><span>${t}</span><span>${counts[t]||0}</span></div>`).join("");
  $("#quickCompanies").innerHTML=state.companies.slice(0,10).map(c=>`<button data-company="${esc(c)}">${esc(c)}</button>`).join("");
  $("#quickCompanies").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>showCompany(b.dataset.company)));
  $("#companyGrid").innerHTML=state.companies.map(c=>`<button class="company-card" data-company="${esc(c)}"><b>${esc(c)}</b><span>${state.stories.filter(s=>(s.companies||[]).includes(c)).length} recent stories →</span></button>`).join("");
  $$(".company-card").forEach(b=>b.addEventListener("click",()=>showCompany(b.dataset.company)));
  $("#sourceGrid").innerHTML=state.sources.map(s=>`<div class="source-card"><b>${esc(s.name)}</b><span>${esc(s.type)} · ${esc(s.focus)}</span><br><a href="${esc(s.url)}" target="_blank" rel="noopener">Visit source ↗</a></div>`).join("");
  renderLatest();
 }catch(e){$("#feed").innerHTML=`<div class="empty">The news feed could not be loaded. If you opened index.html directly, serve the folder with a local web server or publish it with GitHub Pages.</div>`}
}
$$(".tab").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("#search").addEventListener("input",()=>{state.limit=10;renderLatest()}); $("#sort").addEventListener("change",renderLatest);
$("#moreBtn").addEventListener("click",()=>{state.limit+=10;renderLatest()});
$("#themeBtn").addEventListener("click",()=>document.body.classList.toggle("dark"));
init();