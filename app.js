const KEY = "multi-study-drill-v1";

const app = document.getElementById("app");
let S = load();
let view = "home";
let subjectId = null;
let filters = {chapters:[], diffs:[], types:[], only:"all"};
let size = 10;
let order = "mix";
let sess = [], idx = 0, hit = 0, miss = [], cleared = [], picked = null, picks = [], marks = [];
let inputValue = "";

function load(){
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; }
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){}
}
function esc(v){
  return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function h(s){
  const t=document.createElement("template"); t.innerHTML=s.trim(); return t.content.firstElementChild;
}
function qid(q){ return q.id || `${q.subject}-${q.c}-${q.n}`; }
function rec(q){ return S[qid(q)]; }
function todo(q){ const r=rec(q); return !!(r && r.last===0); }
function currentSubject(){ return SUBJECTS[subjectId]; }
function subjectQuestions(id=subjectId){ return Q_ALL.filter(q=>q.subject===id); }

function tally(list){
  let seen=0,todoN=0,wrong=0,tries=0;
  list.forEach(q=>{
    const r=rec(q);
    if(r){ seen++; tries += r.seen||0; wrong += r.wrong||0; if(r.last===0) todoN++; }
  });
  const total=list.length;
  return {total,seen,todo:todoN,fresh:total-seen,wrong,tries,rate:tries?Math.round((tries-wrong)/tries*100):0};
}
function typeLabel(t){ return t==="tf"?"○×":t==="choice"?"選択":"短答"; }

function home(){
  app.appendChild(h(`<header class="top"><h1>学習問題集</h1><span class="subtle">${Q_ALL.length}問</span></header>`));
  const body=h(`<div class="grow"></div>`);
  body.appendChild(h(`<div class="subjects"></div>`));
  const box=body.querySelector(".subjects");
  Object.entries(SUBJECTS).forEach(([id,sub])=>{
    const qs=subjectQuestions(id), t=tally(qs);
    const b=h(`<button class="subject" type="button">
      <b>${esc(sub.name)}</b>
      <span>${qs.length}問<br>要復習 ${t.todo} ・ 未着手 ${t.fresh}</span>
    </button>`);
    b.addEventListener("click",()=>{subjectId=id;filters={chapters:[],diffs:[],types:[],only:"all"};view="subject";render();});
    box.appendChild(b);
  });
  body.appendChild(h(`<p class="empty">科目を選ぶと、単元・難易度・問題形式を絞って演習できます。</p>`));
  app.appendChild(body);
}

function scopedBase(){
  let p=subjectQuestions();
  if(filters.chapters.length) p=p.filter(q=>filters.chapters.includes(q.c));
  if(filters.diffs.length) p=p.filter(q=>filters.diffs.includes(q.d));
  if(filters.types.length) p=p.filter(q=>filters.types.includes(q.type));
  return p;
}
function pool(){
  let p=scopedBase();
  if(filters.only==="todo") p=p.filter(todo);
  if(filters.only==="unseen") p=p.filter(q=>!rec(q));
  if(filters.only==="past") p=p.filter(q=>{const r=rec(q);return r&&r.wrong>0;});
  return p;
}
function toggle(arr,v){
  const i=arr.indexOf(v); if(i>=0) arr.splice(i,1); else arr.push(v);
}
function filterButton(txt,on,fn,disabled=false){
  const b=h(`<button class="opt" type="button" aria-pressed="${on}" ${disabled?"disabled":""}>${esc(txt)}</button>`);
  if(!disabled) b.addEventListener("click",fn);
  return b;
}

function subjectView(){
  const sub=currentSubject(), all=subjectQuestions(), base=scopedBase(), t=tally(base), p=pool();
  const head=h(`<header class="top"><button class="back" type="button">← 科目</button><h1>${esc(sub.name)}</h1><span class="subtle">${all.length}問</span></header>`);
  head.querySelector(".back").addEventListener("click",()=>{view="home";subjectId=null;render();});
  app.appendChild(head);

  const body=h(`<div class="grow"></div>`);
  body.appendChild(h(`<div class="tiles">
    <div class="tile bad"><b>${t.todo}</b><span>要復習</span></div>
    <div class="tile good"><b>${t.seen-t.todo}</b><span>解けた</span></div>
    <div class="tile"><b>${t.fresh}</b><span>未着手</span></div>
  </div>`));

  const panel=h(`<div class="panel"></div>`);
  const ch=h(`<div class="grp"><span>単元</span><div class="opts"></div></div>`);
  Object.entries(sub.chapters).forEach(([c,name])=>{
    const n=Number(c), count=all.filter(q=>q.c===n).length;
    if(!count) return;
    ch.querySelector(".opts").appendChild(filterButton(`${name} ${count}`,filters.chapters.includes(n),()=>{toggle(filters.chapters,n);render();}));
  });
  panel.appendChild(ch);

  const dg=h(`<div class="grp"><span>難易度</span><div class="opts"></div></div>`);
  ["A","B","C"].forEach(d=>{
    const count=all.filter(q=>q.d===d).length;
    if(!count) return;
    dg.querySelector(".opts").appendChild(filterButton(`${d} ${count}`,filters.diffs.includes(d),()=>{toggle(filters.diffs,d);render();}));
  });
  panel.appendChild(dg);

  const tg=h(`<div class="grp"><span>形式</span><div class="opts"></div></div>`);
  ["tf","choice","input"].forEach(tp=>{
    const count=all.filter(q=>q.type===tp).length;
    tg.querySelector(".opts").appendChild(filterButton(`${typeLabel(tp)} ${count}`,filters.types.includes(tp),()=>{toggle(filters.types,tp);render();},!count));
  });
  panel.appendChild(tg);

  const og=h(`<div class="grp"><span>対象</span><div class="opts"></div></div>`);
  [["all","全部"],["todo",`要復習 ${t.todo}`],["past",`つまずいた ${base.filter(q=>rec(q)&&rec(q).wrong>0).length}`],["unseen",`未着手 ${t.fresh}`]].forEach(([v,label])=>{
    og.querySelector(".opts").appendChild(filterButton(label,filters.only===v,()=>{filters.only=v;render();},v!=="all" && Number(label.match(/\d+/)?.[0]||0)===0));
  });
  panel.appendChild(og);

  const sg=h(`<div class="grp"><span>出題数</span><div class="opts"></div></div>`);
  [5,10,20,999].forEach(v=>sg.querySelector(".opts").appendChild(filterButton(v===999?"全部":`${v}問`,size===v,()=>{size=v;render();})));
  panel.appendChild(sg);

  const rg=h(`<div class="grp"><span>出題順</span><div class="opts"></div></div>`);
  [["mix","要復習を優先"],["rand","完全ランダム"]].forEach(([v,label])=>rg.querySelector(".opts").appendChild(filterButton(label,order===v,()=>{order=v;render();})));
  panel.appendChild(rg);

  body.appendChild(panel);
  app.appendChild(body);

  const dock=h(`<div class="dock"></div>`);
  const go=h(`<button class="cta" type="button" ${p.length?"":"disabled"}>${p.length?Math.min(size,p.length)+"問 はじめる":"該当する問題がありません"}</button>`);
  if(p.length) go.addEventListener("click",start);
  dock.appendChild(go);
  const log=h(`<button class="ghost" type="button" ${t.todo||t.wrong?"":"disabled"}>復習リスト</button>`);
  if(t.todo||t.wrong) log.addEventListener("click",()=>{view="log";render();});
  dock.appendChild(log);
  dock.appendChild(h(`<div class="note"><span>絞り込み ${base.length}問</span><span>通算正答率 ${t.rate}%</span></div>`));
  app.appendChild(dock);
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function start(){
  const p=pool(), n=Math.min(size,p.length);
  if(!n) return;
  if(order==="rand") sess=shuffle(p.slice()).slice(0,n);
  else{
    const A=shuffle(p.filter(todo)), B=shuffle(p.filter(q=>!rec(q))),
          C=shuffle(p.filter(q=>{const r=rec(q);return r&&r.last===1&&r.wrong>0;})),
          D=shuffle(p.filter(q=>{const r=rec(q);return r&&r.wrong===0;}));
    const cap=Math.max(1,Math.ceil(n*.6)); let pick=A.slice(0,cap);
    for(const arr of [B,A.slice(cap),C,D]) if(pick.length<n) pick=pick.concat(arr.slice(0,n-pick.length));
    sess=shuffle(pick);
  }
  idx=0;hit=0;miss=[];cleared=[];picked=null;picks=[];marks=[];inputValue="";view="quiz";render();
}
function normalizeText(s,caseSensitive=false){
  let x=String(s??"").normalize("NFKC").trim().replace(/\s+/g," ");
  return caseSensitive?x:x.toLocaleLowerCase("de");
}
function checkInput(q,v){
  if(typeof q.number==="number"){
    const n=Number(String(v).replace(/,/g,""));
    return Number.isFinite(n) && Math.abs(n-q.number)<=Number(q.tolerance??0);
  }
  const ans=q.answers||[];
  return ans.some(a=>normalizeText(a,q.caseSensitive)===normalizeText(v,q.caseSensitive));
}
function isCorrect(q,v){
  if(q.type==="tf") return Boolean(v)===Boolean(q.a);
  if(q.type==="choice"){
    const x=[...v].sort((a,b)=>a-b), a=[...q.a].sort((a,b)=>a-b);
    return x.length===a.length && x.every((n,i)=>n===a[i]);
  }
  return checkInput(q,v);
}
function answer(v){
  if(picked!==null) return;
  const q=sess[idx], was=todo(q), ok=isCorrect(q,v);
  picked=v; marks[idx]=ok?"ok":"ng";
  if(ok){hit++; if(was) cleared.push(q);} else miss.push(q);
  const k=qid(q), r=S[k]||{seen:0,wrong:0,last:1};
  r.seen++; r.last=ok?1:0; if(!ok) r.wrong++;
  S[k]=r; save(); render();
}
function answerText(q){
  if(q.type==="tf") return q.a?"○":"×";
  if(q.type==="choice") return q.a.map(n=>`${n}. ${q.o[n-1]}`).join(" / ");
  return q.aText || (q.answers? q.answers[0] : String(q.number));
}
function yourText(q){
  if(q.type==="tf") return picked?"○":"×";
  if(q.type==="choice") return picked.map(n=>`${n}. ${q.o[n-1]}`).join(" / ");
  return String(picked);
}
function next(){
  picked=null;picks=[];inputValue="";idx++;
  if(idx>=sess.length) view="done";
  render();
}

function quiz(){
  const q=sess[idx], sub=SUBJECTS[q.subject];
  const head=h(`<header class="top"><h1>${idx+1} / ${sess.length}</h1><button class="back" type="button">やめる</button></header>`);
  head.querySelector(".back").addEventListener("click",()=>{view="subject";picked=null;render();});
  app.appendChild(head);

  const seg=h(`<div class="segs"></div>`);
  sess.forEach((_,i)=>seg.appendChild(h(`<i class="${marks[i]||(i===idx?"at":"")}"></i>`)));
  app.appendChild(seg);

  const tags=h(`<div class="tags"></div>`);
  tags.appendChild(h(`<span class="tg">${esc(sub.chapters[q.c]||"")}・${esc(q.s)}</span>`));
  tags.appendChild(h(`<span class="tg">難易度 ${esc(q.d)}</span>`));
  tags.appendChild(h(`<span class="tg good">${typeLabel(q.type)}</span>`));
  if(todo(q)) tags.appendChild(h(`<span class="tg hot">要復習</span>`));
  app.appendChild(tags);

  const body=h(`<div class="grow"><div class="qcard">${esc(q.q)}</div></div>`);
  if(picked===null){
    if(q.type==="choice"){
      const list=h(`<div class="opts5"></div>`);
      q.o.forEach((txt,i)=>{
        const no=i+1,on=picks.includes(no);
        const b=h(`<button class="op" type="button" aria-pressed="${on}"><span class="no">${no}</span><span>${esc(txt)}</span></button>`);
        b.addEventListener("click",()=>{const k=picks.indexOf(no); if(k>=0)picks.splice(k,1); else picks.push(no); render();});
        list.appendChild(b);
      });
      body.appendChild(list);
      body.appendChild(h(`<div class="pickinfo"><span>${q.a.length}つ選択</span><span>選択中 ${picks.length}</span></div>`));
    } else if(q.type==="input"){
      const row=h(`<div class="answerbox"><input id="ans" type="text" autocomplete="off" placeholder="答えを入力"><span class="unit">${esc(q.unit||"")}</span></div>`);
      const inp=row.querySelector("input"); inp.value=inputValue;
      inp.addEventListener("input",e=>{inputValue=e.target.value;const b=document.getElementById("input-submit");if(b)b.disabled=!inputValue.trim();});
      inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&inputValue.trim()) answer(inputValue);});
      body.appendChild(row);
    }
  }
  app.appendChild(body);

  const dock=h(`<div class="dock"></div>`);
  if(picked===null){
    if(q.type==="tf"){
      const m=h(`<div class="btns"></div>`);
      [[true,"○","正しい"],[false,"×","誤り"]].forEach(([v,g,l])=>{
        const b=h(`<button class="b" type="button"><span class="g">${g}</span><span class="l">${l}</span></button>`);
        b.addEventListener("click",()=>answer(v));m.appendChild(b);
      });
      dock.appendChild(m);
    } else if(q.type==="choice"){
      const ready=picks.length===q.a.length;
      const b=h(`<button class="cta" type="button" ${ready?"":"disabled"}>${ready?"決定":`あと${q.a.length-picks.length}つ選ぶ`}</button>`);
      if(ready)b.addEventListener("click",()=>answer([...picks]));
      dock.appendChild(b);
    } else {
      const b=h(`<button id="input-submit" class="cta" type="button" ${inputValue.trim()?"":"disabled"}>決定</button>`);
      if(inputValue.trim())b.addEventListener("click",()=>answer(inputValue));
      dock.appendChild(b);
    }
  } else {
    const ok=isCorrect(q,picked);
    const fb=h(`<div class="fb ${ok?"ok":"ng"}"><strong>${ok?"正解":"不正解"}</strong>
      <div>${ok?"":`あなたの答え：${esc(yourText(q))}<br>`}正解：${esc(answerText(q))}</div>
      <div>${esc(q.e)}</div></div>`);
    dock.appendChild(fb);
    const b=h(`<button class="cta" type="button">${idx+1<sess.length?"つづける":"結果を見る"}</button>`);
    b.addEventListener("click",next);dock.appendChild(b);
  }
  app.appendChild(dock);
  if(q.type==="input" && picked===null) setTimeout(()=>document.getElementById("ans")?.focus(),0);
}

function card(q){
  const r=rec(q);
  return h(`<div class="item"><div class="qt">${esc(q.q)}</div><div class="an"><b>正解:</b> ${esc(answerText(q))}<br>${esc(q.e)}${r?`<br>解答 ${r.seen}回 / 不正解 ${r.wrong}回`:""}</div></div>`);
}
function logView(){
  const sub=currentSubject(), qs=subjectQuestions();
  const head=h(`<header class="top"><button class="back" type="button">← 戻る</button><h1>${esc(sub.name)}・復習</h1><span></span></header>`);
  head.querySelector(".back").addEventListener("click",()=>{view="subject";render();});
  app.appendChild(head);
  const body=h(`<div class="grow"></div>`);
  const todoQs=qs.filter(todo).sort((a,b)=>(rec(b)?.wrong||0)-(rec(a)?.wrong||0));
  const past=qs.filter(q=>{const r=rec(q);return r&&r.wrong>0&&r.last===1;}).sort((a,b)=>rec(b).wrong-rec(a).wrong);
  if(todoQs.length){
    const l=h(`<div class="list"><h2>要復習 ${todoQs.length}問</h2></div>`);todoQs.forEach(q=>l.appendChild(card(q)));body.appendChild(l);
  }
  if(past.length){
    const l=h(`<div class="list"><h2>クリア済みのつまずき ${past.length}問</h2></div>`);past.forEach(q=>l.appendChild(card(q)));body.appendChild(l);
  }
  if(!todoQs.length&&!past.length) body.appendChild(h(`<p class="empty">復習対象はありません。</p>`));
  app.appendChild(body);
}

function result(){
  const pct=sess.length?Math.round(hit/sess.length*100):0;
  app.appendChild(h(`<header class="top"><h1>結果</h1><span class="subtle">${SUBJECTS[subjectId].name}</span></header>`));
  const body=h(`<div class="grow"><div class="score"><b>${hit} / ${sess.length}</b><span>正答率 ${pct}%</span></div></div>`);
  if(cleared.length){
    const l=h(`<div class="list"><h2>要復習から外れた ${cleared.length}問</h2></div>`);cleared.forEach(q=>l.appendChild(card(q)));body.appendChild(l);
  }
  if(miss.length){
    const l=h(`<div class="list"><h2>要復習に入った ${miss.length}問</h2></div>`);miss.forEach(q=>l.appendChild(card(q)));body.appendChild(l);
  }
  if(!cleared.length&&!miss.length) body.appendChild(h(`<p class="empty">全問正解です。</p>`));
  app.appendChild(body);
  const dock=h(`<div class="dock"></div>`);
  const again=h(`<button class="cta" type="button">もう一度</button>`);again.addEventListener("click",start);
  const back=h(`<button class="ghost" type="button">科目画面へ</button>`);back.addEventListener("click",()=>{view="subject";render();});
  dock.appendChild(again);dock.appendChild(back);app.appendChild(dock);
}
function render(){
  app.innerHTML="";
  if(view==="home") home();
  else if(view==="subject") subjectView();
  else if(view==="quiz") quiz();
  else if(view==="log") logView();
  else result();
  window.scrollTo(0,0);
}
render();
