const KEY = "multi-study-drill-v1";
const GEOGRAPHY_MATERIALS = [
  {name:"地理ラボ",url:"https://alivevulnerable.com/basic/",description:"地理情報・地形・気候・農林水産業の解説"},
  {name:"いちごドリル・地理探究",url:"https://ichigo-drill.jp/chiritankyu-print",description:"分野別の問題・解答プリント"},
  {name:"地理教材共有サイト",url:"https://sites.google.com/view/geoclass2020/",description:"高校地理教員の授業スライド・プリント"},
  {name:"ちとにとせ",url:"https://chitonitose.com/geo/geo.html",description:"地図・自然環境・産業・人口・都市・地誌の解説"},
  {name:"高校地理授業動画",url:"https://www.geography-lesson.com/",description:"単元別の授業動画と解説テキスト"},
  {name:"高校地理の部屋",url:"https://geo-hs.com/",description:"地形・気候・地図の解説"},
  {name:"トフィーの地理教室",url:"https://note.com/toffee101",description:"高校・予備校講師の授業動画とプリント"},
  {name:"希望ケ丘高校・地理総合",url:"https://sites.google.com/gl.pen-kanagawa.ed.jp/geography-sogo2024/",description:"地理総合の授業プリント"},
  {name:"ちりナビ・高校地理",url:"https://geo.ewrs.jp/high/index.html",description:"地理総合・地理探究の解説と確認問題"},
  {name:"地理の王国",url:"https://kog-edu.jp/",description:"解説・気候グラフ・地図の学習ツール"},
  {name:"高校地理の一問一答",url:"https://school-plus.org/library/kou-social/geography/",description:"分野別の四択と解説"},
];

const app = document.getElementById("app");
let S = load();
let view = "home";
let subjectId = null;
let filters = {chapters:[], diffs:[], types:[], only:"all", content:"exam", course:"all"};
let advancedOpen = false;
let size = 10;
let order = "mix";
let sess = [], idx = 0, hit = 0, miss = [], cleared = [], picked = null, picks = [], marks = [];
let questionStartedAt = 0, lastTiming = null;

function load(){
  try {
    const data=JSON.parse(localStorage.getItem(KEY));
    return data && typeof data==="object" && !Array.isArray(data) ? data : {};
  } catch(e){ return {}; }
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){}
  driveHistory.changed();
}
// Google access tokens stay in memory. Only the public client ID is remembered.
const DRIVE_CLIENT_ID = "95228930762-4pbom5l5sh2hij2d0grfqso7i34vgfkg.apps.googleusercontent.com";
const DRIVE_CONFIG_KEY = "multi-study-drive-client-v1";
function createDriveHistory({fetcher, authorize, readLocal, applyRemote, notify, readSyncState = () => ({}), writeSyncState = () => {}, clock = () => Date.now()}) {
  const scope = 'https://www.googleapis.com/auth/drive.appdata';
  const filename = 'study-history-v1.json';
  const stored = readSyncState();
  let token = '', expires = 0, fileId = stored.fileId || '', baseline = stored.baseline || '', ready = false;
  let busy = false, dirty = Boolean(stored.pending), running = null, generation = 0;
  const persist = () => writeSyncState({fileId,baseline,pending:dirty});
  const report = message => notify({message, connected:ready, busy, pending:dirty});
  const encode = records => JSON.stringify({format:'study-history',version:1,records});
  function decode(text) {
    if (text.length > 2000000) throw new Error('Driveの履歴ファイルが大きすぎます。');
    const data = JSON.parse(text);
    if (data?.format !== 'study-history' || data.version !== 1 || !data.records || typeof data.records !== 'object' || Array.isArray(data.records)) throw new Error('Driveの履歴形式を確認できません。上書きせず停止しました。');
    for (const [id, record] of Object.entries(data.records)) {
      if (['__proto__','constructor','prototype'].includes(id) || !record || typeof record !== 'object' || Array.isArray(record) || !Number.isFinite(record.seen) || record.seen < 0 || !Number.isFinite(record.wrong) || record.wrong < 0 || ![0,1].includes(record.last)) throw new Error('Driveの履歴に読み込めない記録があります。上書きせず停止しました。');
    }
    return data.records;
  }
  async function api(path, init = {}) {
    if (!token || clock() >= expires) {
      ready = false;
      throw new Error('Googleへの再接続が必要です。未保存の履歴はこの端末に残っています。');
    }
    const controller = typeof AbortController==='undefined' ? null : new AbortController();
    const timer = controller ? setTimeout(()=>controller.abort(),20000) : null;
    let response;
    try { response = await fetcher('https://www.googleapis.com/' + path, {...init, signal:controller?.signal, headers:{...init.headers, Authorization:'Bearer '+token}}); }
    catch(error) { throw new Error('Driveと通信できません。未保存の履歴はこの端末に残っています。'); }
    finally { if(timer) clearTimeout(timer); }
    if (!response.ok) {
      if (response.status === 401) { token=''; ready=false; }
      throw new Error(response.status === 401 ? 'Googleへの再接続が必要です。' : `Driveと通信できませんでした（${response.status}）。端末の履歴は残っています。`);
    }
    return response;
  }
  async function findFile() {
    const query = new URLSearchParams({spaces:'appDataFolder',q:`name = '${filename}' and trashed = false`,fields:'files(id),nextPageToken',pageSize:'100'});
    const result = await (await api('drive/v3/files?'+query)).json();
    if (result.nextPageToken || result.files.length > 1) throw new Error('同名の履歴が複数あります。上書きせず停止しました。');
    return result.files[0]?.id || '';
  }
  async function download() { return (await api(`drive/v3/files/${encodeURIComponent(fileId)}?alt=media`)).text(); }
  async function upload(text) {
    if (fileId) {
      await api(`upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:text});
    } else {
      // Check again before creation: another device may have created the first file.
      if (await findFile()) throw new Error('Driveに新しい履歴があります。再接続して読み込んでください。');
      const boundary = 'study_history_boundary';
      const metadata = JSON.stringify({name:filename,parents:['appDataFolder'],mimeType:'application/json'});
      const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${text}\r\n--${boundary}--`;
      const result = await (await api('upload/drive/v3/files?uploadType=multipart&fields=id', {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body})).json();
      if (!result.id) throw new Error('Driveの保存結果を確認できませんでした。再接続してください。');
      fileId = result.id;
    }
  }
  async function connect(clientId, useDrive = false) {
    if (busy) return;
    busy = true; ready = false; report('Googleに接続しています。');
    const startGeneration = generation, previousFileId = fileId;
    try {
      const result = await authorize(clientId, scope);
      if (!result.access_token || !Number.isFinite(Number(result.expires_in)) || Number(result.expires_in)<=30 || !result.scope?.split(' ').includes(scope)) throw new Error('履歴保存へのアクセスが許可されませんでした。');
      token = result.access_token; expires = clock() + Number(result.expires_in)*1000 - 30000;
      fileId = await findFile();
      if (fileId) {
        const text = await download(); const records = decode(text);
        if (startGeneration !== generation) throw new Error('接続中に回答が追加されました。端末の履歴を保持して読み込みを停止しました。');
        if (dirty && !useDrive) {
          if(previousFileId !== fileId || baseline !== text) throw new Error('端末とDriveの両方に変更があります。端末の履歴を保持して停止しました。');
        } else { applyRemote(records); dirty=false; }
        baseline = text; persist();
      } else baseline = '';
      ready = true; busy = false;
      report(fileId ? 'Driveの履歴を読み込みました。回答後に自動保存します。' : 'Driveに接続しました。履歴を保存しています。');
      if (!fileId || dirty) { dirty=true; persist(); await flush(); }
    } catch (error) {
      token = ''; ready = false; busy = false; report(error.message || 'Googleへの接続に失敗しました。');
    }
  }
  function changed() {
    generation++; dirty = true; persist();
    if (ready) return flush();
    report('この端末に保存しました。Driveへ保存するには接続してください。');
    return Promise.resolve();
  }
  function flush() {
    if (running) return running;
    if (!ready || !dirty) return Promise.resolve();
    busy = true; report('Driveに保存しています。');
    let failure = '';
    running = (async () => {
      try {
        while (dirty && ready) {
          const currentGeneration = generation;
          const text = encode(readLocal());
          if (fileId && await download() !== baseline) {
            ready = false;
            throw new Error('Driveの履歴が別の端末で変更されています。この端末の履歴を保持して保存を停止しました。');
          }
          await upload(text); baseline = text;
          if (generation === currentGeneration) dirty = false;
          persist();
        }
        report('Driveに保存しました。');
      } catch (error) { failure = error.message || 'Driveに保存できませんでした。'; }
      finally { busy = false; running = null; }
    })().finally(() => report(failure || (dirty ? 'Driveに未保存の履歴があります。再試行してください。' : 'Driveに保存しました。')));
    return running;
  }
  function disconnect() {
    if (busy) return;
    token = ''; expires = 0; ready = false;
    // Keep the local record, including unsaved changes.
    report('Driveとの接続を終了しました。');
  }
  return {connect,changed,flush,disconnect,get state(){return {connected:ready,busy,pending:dirty};}};
}
let driveStatus = {message:'Google Driveは未接続です。',connected:false,busy:false,pending:false};
let driveSdkPromise = null, driveSdkReady = false, driveSdkError = false;
function loadDriveSdk() {
  if (driveSdkPromise) return driveSdkPromise;
  driveSdkPromise = new Promise((resolve,reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; script.async=true;
    script.onload = () => {driveSdkReady=true;resolve(); if(view==='home') render();};
    script.onerror = () => {driveSdkError=true; driveStatus.message='Googleの接続機能を読み込めません。通信状態を確認してください。'; if(view==='home') render(); reject(new Error(driveStatus.message));};
    document.head.appendChild(script);
  });
  return driveSdkPromise;
}
const driveHistory = createDriveHistory({
  fetcher:(...args)=>fetch(...args),
  authorize:(clientId,scope)=>new Promise((resolve,reject)=>{
    if (!driveSdkReady) {reject(new Error('Googleの接続機能を読み込み中です。少し待ってもう一度押してください。'));return;}
    const client = google.accounts.oauth2.initTokenClient({client_id:clientId,scope,callback:resolve,error_callback:error=>reject(new Error(error.type==='popup_closed'?'Googleへの接続をキャンセルしました。':'Googleのログイン画面を開けませんでした。'))});
    client.requestAccessToken({prompt:'select_account'});
  }),
  readSyncState:()=>{try{return JSON.parse(localStorage.getItem('multi-study-drive-sync-v1')) || {};}catch(e){return {};}},
  writeSyncState:state=>{try{localStorage.setItem('multi-study-drive-sync-v1',JSON.stringify(state));}catch(e){}},
  readLocal:()=>S,
  applyRemote:records=>{S=records; try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}},
  notify:state=>{
    driveStatus=state;
    const element=document.getElementById('drive-status');
    if(element) element.textContent=state.message;
    if(view==='home') render();
  },
});
Object.assign(driveStatus,driveHistory.state);
if(driveStatus.pending) driveStatus.message='Driveに未保存の履歴がこの端末にあります。Googleに接続してください。';
function driveClientId() {
  try{return DRIVE_CLIENT_ID || localStorage.getItem(DRIVE_CONFIG_KEY) || '';}catch(e){return DRIVE_CLIENT_ID;}
}
function drivePanel() {
  const panel=h(`<section class="panel"><h2>Google Driveに履歴を保存</h2><p id="drive-status" role="status">${esc(driveStatus.message)}</p><div class="opts"></div><p class="subtle">接続中は回答後に自動保存します。次回もGoogleに接続して履歴を読み込みます。</p></section>`);
  const buttons=panel.querySelector('.opts');
  const clientId=driveClientId();
  if(!clientId) {
    panel.appendChild(h(`<p>初回はGoogle側の接続設定が必要です。<a href="https://github.com/homareipposhi/tangoyougotyou/blob/main/research/google-drive-setup.md" target="_blank" rel="noopener">設定手順</a></p>`));
    const input=h(`<input type="text" aria-label="Google OAuthクライアントID" placeholder="…apps.googleusercontent.com" autocomplete="off" style="width:100%;box-sizing:border-box">`);
    panel.appendChild(input);
    const set=filterButton('接続設定を保存',false,()=>{
      const id=input.value.trim();
      if(!/^[\w-]+\.apps\.googleusercontent\.com$/.test(id)){driveStatus.message='GoogleのOAuthクライアントIDを入力してください。';render();return;}
      try{localStorage.setItem(DRIVE_CONFIG_KEY,id);driveStatus.message='接続設定を保存しました。Googleに接続してください。';}catch(e){driveStatus.message='接続設定を端末に保存できませんでした。';}
      render();
    });
    buttons.appendChild(set);
  } else {
    if(typeof navigator!=='undefined' && !driveSdkPromise) loadDriveSdk().catch(()=>{});
    if(driveSdkError) buttons.appendChild(filterButton('Google接続機能を再読み込み',false,()=>{driveSdkError=false;driveSdkPromise=null;loadDriveSdk().catch(()=>{});}));
    buttons.appendChild(filterButton(driveStatus.connected?'再接続して読み込む':'Googleに接続',false,()=>driveHistory.connect(clientId),driveStatus.busy||!driveSdkReady||driveStatus.pending&&driveStatus.connected));
    if(driveStatus.connected) {
      buttons.appendChild(filterButton('今すぐ保存',false,()=>driveHistory.flush(),driveStatus.busy));
      buttons.appendChild(filterButton('接続を終了',false,()=>driveHistory.disconnect(),driveStatus.busy||driveStatus.pending));
    }
    if(driveStatus.pending && !driveStatus.connected) buttons.appendChild(filterButton('Driveの履歴を使う',false,()=>{
      if(window.confirm('この端末の未保存履歴に代えて、Driveの履歴を読み込みますか？')) {
        try{localStorage.setItem('multi-study-before-drive-restore-v1',JSON.stringify(S));}catch(e){}
        driveHistory.connect(clientId,true);
      }
    },driveStatus.busy||!driveSdkReady));
    if(!DRIVE_CLIENT_ID && !driveStatus.connected) buttons.appendChild(filterButton('接続設定を変更',false,()=>{try{localStorage.removeItem(DRIVE_CONFIG_KEY);}catch(e){}render();},driveStatus.busy));
  }
  return panel;
}

function esc(v){
  return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function h(s){
  const t=document.createElement("template"); t.innerHTML=s.trim(); return t.content.firstElementChild;
}
function qid(q){ return q.id || `${q.subject}-${q.c}-${q.n}`; }
function rec(q){ return S[qid(q)]; }
function todo(q){ const r=rec(q); return !!(r && (r.last===0 || r.needsReview)); }
function currentSubject(){ return SUBJECTS[subjectId]; }
function subjectQuestions(id=subjectId){ return Q_ALL.filter(q=>q.subject===id); }

function tally(list){
  let seen=0,todoN=0,wrong=0,tries=0;
  list.forEach(q=>{
    const r=rec(q);
    if(r){ seen++; tries += r.seen||0; wrong += r.wrong||0; if(todo(q)) todoN++; }
  });
  const total=list.length;
  return {total,seen,todo:todoN,fresh:total-seen,wrong,tries,rate:tries?Math.round((tries-wrong)/tries*100):0};
}
function typeLabel(t){ return t==="tf"?"○×":"選択"; }
function isRta(q){ return q.subject === "physics" && Boolean(q.rta); }
function timingLabel(ms, ok){
  if (!ok) return "未定着（不正解）";
  if (ms <= 20000) return "反射（0〜20秒）";
  if (ms <= 40000) return "定着（20秒超〜40秒）";
  if (ms < 70000) return "遅い（40秒超〜70秒未満）";
  return "要復習（70秒以上）";
}

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
    b.addEventListener("click",()=>{subjectId=id;filters={chapters:[],diffs:[],types:[],only:"all",content:"exam",course:"all"};advancedOpen=false;view="subject";render();});
    box.appendChild(b);
  });
  body.appendChild(h(`<p class="empty">科目を選ぶと、単元・難易度・問題形式を絞って演習できます。</p>`));
  body.appendChild(drivePanel());
  app.appendChild(body);
}

function physicsContentMatches(q, content=filters.content){
  if(content==="all") return true;
  if(content==="exam") return Boolean(q.exam);
  return !q.exam && q.rta===content;
}
// 「学習範囲」の既存ボタンを、11月模試の指定単元に対応させる。
// 「全範囲」は従来どおり全問題を表示する。問題データと学習履歴は変更しない。
function matchesNumberedId(id, prefix, list){
  if(!id.startsWith(prefix)) return false;
  const tail=id.slice(prefix.length);
  if(!/^\d+$/.test(tail)) return false;
  const n=Number(tail);
  return list.split(",").some(range=>{
    const [min,max=min]=range.split("-").map(Number);
    return n>=min && n<=max;
  });
}
function earthNovemberCourse(q){
  if(q.id.startsWith("earth-nov25-audit-")) return "地学";
  if(q.studyTarget==="benesse-h2-nov-2026") return "地学";
  const id=q.id;
  if(["ear-1","ear-2","ear-3","ear-6"].includes(id)) return "両方";
  if(["ear-4","ear-5","ear-7","ear-8","ear-10"].includes(id)) return "地学";
  const both=[
    ["earth-nov25-interior-","1-22"],
    ["earth-nov25-tectonics-","1-22"],
    ["earth-nov25-gravity-","3-6"],
    ["earth-nov25-atmosphere-","1-11,21"],
    ["earth-lecture-volcano-","1-7"],
    ["earth-lecture-circulation-","1-2,5"],
    ["earth-lecture-environment-","1-2,4"],
    ["earth-lecture-sun-","1"],
    ["earth-nov25-planets-","5,15"]
  ];
  if(both.some(([prefix,range])=>matchesNumberedId(id,prefix,range))) return "両方";
  const advanced=[
    ["earth-nov25-gravity-","1-2,7-19"],
    ["earth-nov25-atmosphere-","12-20"],
    ["earth-lecture-circulation-","3-4"],
    ["earth-lecture-ocean-","1-4"],
    ["earth-lecture-strata-","1-8"],
    ["earth-lecture-sun-","2-5"],
    ["earth-lecture-cosmos-","1-2"],
    ["earth-nov25-history-","1-18"],
    ["earth-nov25-planets-","1-4,6-14,17"]
  ];
  return advanced.some(([prefix,range])=>matchesNumberedId(id,prefix,range)) ? "地学" : null;
}
function geographyNovemberCourse(q){
  const id=q.id;
  if(id.startsWith("geography-nov25-audit-")) return q.c<=3 ? "地理総合" : "地理探究";
  if(q.studyTarget==="benesse-h2-nov-2026-geography") return "地理総合";
  if(id.startsWith("geography-nov25-maps-")) return "地理総合";
  if(id.startsWith("geography-nov25-energy-")) return "地理総合";
  if(id.startsWith("geography-nov25-climate-")) return "地理探究";
  if(id.startsWith("geography-nov25-landforms-")) return "地理探究";
  if(matchesNumberedId(id,"geography-nov25-industry-","4,7-8,16-20")) return "地理総合";
  return null;
}
function courseMatches(q, course=filters.course){
  if(!course || course==="all") return true;
  if(q.subject==="earth" && (course==="地学基礎" || course==="地学")){
    const scope=earthNovemberCourse(q);
    return scope==="両方" || scope===course;
  }
  if(q.subject==="geography" && (course==="地理総合" || course==="地理探究")){
    return geographyNovemberCourse(q)===course;
  }
  const courses=q.courses || [];
  return courses.includes(course);
}
function scopedBase(){
  let p=subjectQuestions().filter(q=>courseMatches(q));
  if(subjectId==="physics") p=p.filter(q=>physicsContentMatches(q));
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
  const physics=subjectId==="physics";
  const categoryQuestions=all.filter(q=>courseMatches(q) && (!physics || physicsContentMatches(q)));
  const head=h(`<header class="top"><button class="back" type="button">← 科目</button><h1>${esc(sub.name)}</h1><span class="subtle">${all.length}問</span></header>`);
  head.querySelector(".back").addEventListener("click",()=>{view="home";subjectId=null;render();});
  app.appendChild(head);

  const body=h(`<div class="grow"></div>`);
  if(subjectId==="geography"){
    const materials=h(`<button class="ghost" type="button">教材を読む（11サイト）</button>`);
    materials.addEventListener("click",()=>{view="materials";render();});
    body.appendChild(materials);
  }
  body.appendChild(h(`<div class="tiles">
    <div class="tile bad"><b>${t.todo}</b><span>要復習</span></div>
    <div class="tile good"><b>${t.seen-t.todo}</b><span>解けた</span></div>
    <div class="tile"><b>${t.fresh}</b><span>未着手</span></div>
  </div>`));

  const panel=h(`<div class="panel"></div>`);
  if(subjectId==="earth" || subjectId==="geography"){
    const courses=subjectId==="earth" ? ["地学基礎","地学"] : ["地理総合","地理探究"];
    const group=h(`<div class="grp"><span>学習範囲</span><div class="opts"></div></div>`);
    ["all",...courses].forEach(value=>{
      const label=value==="all" ? "全範囲" : value;
      group.querySelector(".opts").appendChild(filterButton(label,filters.course===value,()=>{
        filters.course=value;filters.chapters=[];filters.diffs=[];filters.types=[];filters.only="all";render();
      }));
    });
    panel.appendChild(group);
    panel.appendChild(h(`<p class="subtle">11月模試の指定範囲を科目別に表示します。全範囲は従来の問題をすべて表示します。</p>`));
  }
  if(physics){
    const categories=h(`<div class="grp"><span>学習内容</span><div class="opts"></div></div>`);
    [["exam","過去問の条件判断"],["formula","公式"],["unit","単位"],["symbol","微積の記号"],["term","用語・定義"],["recognition","基礎の条件判断"],["all","全内容"]].forEach(([value,label])=>{
      const count=all.filter(q=>physicsContentMatches(q,value)).length;
      categories.querySelector(".opts").appendChild(filterButton(label,filters.content===value,()=>{
        if(filters.content===value) return;
        filters.content=value;filters.chapters=[];filters.diffs=[];filters.types=[];filters.only="all";advancedOpen=false;render();
      },!count));
    });
    panel.appendChild(categories);
  }
  const ch=h(`<div class="grp"><span>${physics?"分野":"単元"}</span><div class="opts"></div></div>`);
  if(physics) ch.querySelector(".opts").appendChild(filterButton("全分野",!filters.chapters.length,()=>{filters.chapters=[];render();}));
  Object.entries(sub.chapters).forEach(([c,name])=>{
    const n=Number(c), count=categoryQuestions.filter(q=>q.c===n).length;
    if(!count) return;
    ch.querySelector(".opts").appendChild(filterButton(physics?name:`${name} ${count}`,filters.chapters.includes(n),()=>{toggle(filters.chapters,n);render();}));
  });
  panel.appendChild(ch);

  const advanced=h(`<details class="advanced" ${advancedOpen?"open":""}><summary>詳細設定${filters.diffs.length||filters.types.length||order!=="mix"?"（設定中）":""}</summary><div class="advanced-body"></div></details>`);
  advanced.addEventListener("toggle",()=>{if(advanced.isConnected) advancedOpen=advanced.open;});
  const settings=physics ? advanced.querySelector(".advanced-body") : panel;
  const dg=h(`<div class="grp"><span>難易度</span><div class="opts"></div></div>`);
  ["A","B","C"].forEach(d=>{
    const count=categoryQuestions.filter(q=>q.d===d).length;
    if(!count) return;
    dg.querySelector(".opts").appendChild(filterButton(physics?d:`${d} ${count}`,filters.diffs.includes(d),()=>{toggle(filters.diffs,d);render();}));
  });
  if(!physics || new Set(categoryQuestions.map(q=>q.d)).size>1) settings.appendChild(dg);

  const tg=h(`<div class="grp"><span>形式</span><div class="opts"></div></div>`);
  ["tf","choice"].forEach(tp=>{
    const count=categoryQuestions.filter(q=>q.type===tp).length;
    if(physics && !count) return;
    tg.querySelector(".opts").appendChild(filterButton(physics?typeLabel(tp):`${typeLabel(tp)} ${count}`,filters.types.includes(tp),()=>{toggle(filters.types,tp);render();},!count));
  });
  if(!physics || new Set(categoryQuestions.map(q=>q.type)).size>1) settings.appendChild(tg);

  const og=h(`<div class="grp"><span>対象</span><div class="opts"></div></div>`);
  [["all",physics?"すべて":"全部",base.length],["todo","要復習",t.todo],["past",physics?"過去の誤答":"つまずいた",base.filter(q=>rec(q)&&rec(q).wrong>0).length],["unseen","未着手",t.fresh]].forEach(([v,label,count])=>{
    og.querySelector(".opts").appendChild(filterButton(physics?label:v==="all"?label:`${label} ${count}`,filters.only===v,()=>{filters.only=v;render();},v!=="all" && !count));
  });
  panel.appendChild(og);

  const sg=h(`<div class="grp"><span>出題数</span><div class="opts"></div></div>`);
  [5,10,20,999].forEach(v=>sg.querySelector(".opts").appendChild(filterButton(v===999?"全部":`${v}問`,size===v,()=>{size=v;render();})));
  panel.appendChild(sg);

  const rg=h(`<div class="grp"><span>出題順</span><div class="opts"></div></div>`);
  [["mix","要復習を優先"],["rand","完全ランダム"]].forEach(([v,label])=>rg.querySelector(".opts").appendChild(filterButton(label,order===v,()=>{order=v;render();})));
  settings.appendChild(rg);
  if(physics) panel.appendChild(advanced);

  body.appendChild(panel);
  app.appendChild(body);

  const dock=h(`<div class="dock"></div>`);
  const go=h(`<button class="cta" type="button" ${p.length?"":"disabled"}>${p.length?Math.min(size,p.length)+"問 はじめる":"該当する問題がありません"}</button>`);
  if(p.length) go.addEventListener("click",start);
  dock.appendChild(go);
  const log=h(`<button class="ghost" type="button" ${t.todo||t.wrong?"":"disabled"}>復習リスト</button>`);
  if(t.todo||t.wrong) log.addEventListener("click",()=>{view="log";render();});
  dock.appendChild(log);
  dock.appendChild(h(`<div class="note"><span>${physics?`対象 ${p.length}問`:`絞り込み ${base.length}問`}</span><span>通算正答率 ${t.rate}%</span></div>`));
  app.appendChild(dock);
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function prepareQuestion(q){
  if(q.type!=="choice") return q;
  const indices=shuffle(q.o.map((_,i)=>i));
  return {...q,o:indices.map(i=>q.o[i]),a:q.a.map(n=>indices.indexOf(n-1)+1)};
}
function start(){
  const p=pool(), n=Math.min(size,p.length);
  if(!n) return;
  if(order==="rand") sess=shuffle(p.slice()).slice(0,n);
  else{
    const A=shuffle(p.filter(todo)), B=shuffle(p.filter(q=>!rec(q))),
          C=shuffle(p.filter(q=>{const r=rec(q);return r&&!todo(q)&&r.wrong>0;})),
          D=shuffle(p.filter(q=>{const r=rec(q);return r&&!todo(q)&&!r.wrong;}));
    const cap=Math.max(1,Math.ceil(n*.6)); let pick=A.slice(0,cap);
    for(const arr of [B,A.slice(cap),C,D]) if(pick.length<n) pick=pick.concat(arr.slice(0,n-pick.length));
    sess=shuffle(pick);
  }
  sess=sess.map(prepareQuestion);
  idx=0;hit=0;miss=[];cleared=[];picked=null;picks=[];marks=[];lastTiming=null;questionStartedAt=performance.now();view="quiz";render();
}
function isCorrect(q,v){
  if(q.type==="tf") return Boolean(v)===Boolean(q.a);
  if(q.type==="choice"){
    const x=[...v].sort((a,b)=>a-b), a=[...q.a].sort((a,b)=>a-b);
    return x.length===a.length && x.every((n,i)=>n===a[i]);
  }
  return false;
}
function answer(v){
  if(picked!==null) return;
  const q=sess[idx], was=todo(q), ok=isCorrect(q,v);
  picked=v; marks[idx]=ok?"ok":"ng";
  if(ok) hit++; else miss.push(q);
  const k=qid(q), r=S[k]||{seen:0,wrong:0,last:1};
  r.seen++; r.last=ok?1:0; if(!ok) r.wrong++;
  if(isRta(q)){
    const ms=Math.max(0, Math.round(performance.now()-questionStartedAt));
    lastTiming={ms, label:timingLabel(ms,ok)};
    r.lastMs=ms; r.bestMs=Math.min(r.bestMs ?? Infinity, ms); r.totalMs=(r.totalMs||0)+ms;
    if(!ok){ r.review=(r.review||0)+1; r.needsReview=true; }
    else if(ms<=20000){ r.reflex=(r.reflex||0)+1; r.needsReview=false; }
    else if(ms<=40000){ r.settled=(r.settled||0)+1; r.needsReview=false; }
    else if(ms<70000){ r.slow=(r.slow||0)+1; r.needsReview=true; }
    else { r.review=(r.review||0)+1; r.needsReview=true; }
    r.last=ok && ms<=40000 ? 1 : 0;
  }
  S[k]=r;
  if(ok && was && !todo(q)) cleared.push(q);
  save(); render();
}
function answerText(q){
  if(q.type==="tf") return q.a?"○":"×";
  if(q.type==="choice") return q.a.map(n=>`${n}. ${q.o[n-1]}`).join(" / ");
  return "";
}
function yourText(q){
  if(q.type==="tf") return picked?"○":"×";
  if(q.type==="choice") return picked.map(n=>`${n}. ${q.o[n-1]}`).join(" / ");
  return String(picked);
}
function next(){
  picked=null;picks=[];lastTiming=null;idx++;questionStartedAt=performance.now();
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
  if(q.courses) tags.appendChild(h(`<span class="tg">${esc(q.courses.join("・"))}</span>`));
  if(isRta(q)) tags.appendChild(h(`<span class="tg">RTA・${esc({formula:"公式",unit:"単位",symbol:"微積物理の記号",term:"用語の定義",recognition:"条件判断"}[q.rta]||q.rta)}</span>`));
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
    }
  } else {
    const ok=isCorrect(q,picked);
    const fb=h(`<div class="fb ${ok?"ok":"ng"}"><strong>${ok?"正解":"不正解"}</strong>
      <div>${ok?"":`あなたの答え：${esc(yourText(q))}<br>`}正解：${esc(answerText(q))}</div>
      <div>${esc(q.e)}</div>${isRta(q)&&lastTiming?`<div class="timing">回答時間 ${formatMs(lastTiming.ms)}秒：${esc(lastTiming.label)}</div>`:""}</div>`);
    if(q.basis) fb.appendChild(h(`<div class="subtle">対応する出題分野：${esc(q.basis)}</div>`));
    if(q.material) fb.appendChild(h(`<div class="subtle">教材：${esc(q.material.title)} — ${q.material.type==="book"?"教科書":"PDF"} ${esc(q.material.page)}ページ・${esc(q.material.section)}</div>`));
    if(q.examMaterial) fb.appendChild(h(`<div class="subtle">範囲：${esc(q.examMaterial.title)}・${esc(q.examMaterial.section)}</div>`));
    const references=[...(q.source?[{url:q.source,label:q.sourceLabel||"公開入試問題・出題意図"}]:[]),...(q.references||[])];
    const shown=new Set();
    for(const reference of references){
      let url;
      try{url=new URL(reference.url,location.href);}catch{continue;}
      if(shown.has(url.href)) continue;
      shown.add(url.href);
      if(url.protocol==="https:"){
        const link=h(`<p><a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">教材：${esc(reference.label||"関連する解説")}</a></p>`);
        fb.appendChild(link);
      }
    }
    dock.appendChild(fb);
    const b=h(`<button class="cta" type="button">${idx+1<sess.length?"つづける":"結果を見る"}</button>`);
    b.addEventListener("click",next);dock.appendChild(b);
  }
  app.appendChild(dock);
}
function formatMs(ms){ return (ms/1000).toFixed(ms < 10000 ? 1 : 0); }

function card(q){
  const r=rec(q);
  const time=r?.lastMs!==undefined ? ` / 前回 ${formatMs(r.lastMs)}秒 / 最速 ${formatMs(r.bestMs)}秒` : "";
  return h(`<div class="item"><div class="qt">${esc(q.q)}</div><div class="an"><b>正解:</b> ${esc(answerText(q))}<br>${esc(q.e)}${r?`<br>解答 ${r.seen}回 / 不正解 ${r.wrong}回${time}`:""}</div></div>`);
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
  const reviewQs=sess.filter(todo);
  app.appendChild(h(`<header class="top"><h1>結果</h1><span class="subtle">${SUBJECTS[subjectId].name}</span></header>`));
  const body=h(`<div class="grow"><div class="score"><b>${hit} / ${sess.length}</b><span>正答率 ${pct}%</span></div></div>`);
  if(cleared.length){
    const l=h(`<div class="list"><h2>要復習から外れた ${cleared.length}問</h2></div>`);cleared.forEach(q=>l.appendChild(card(q)));body.appendChild(l);
  }
  if(reviewQs.length){
    const l=h(`<div class="list"><h2>要復習 ${reviewQs.length}問（不正解・遅答）</h2></div>`);reviewQs.forEach(q=>l.appendChild(card(q)));body.appendChild(l);
  }
  if(!cleared.length&&!reviewQs.length) body.appendChild(h(`<p class="empty">全問正解です。</p>`));
  app.appendChild(body);
  const dock=h(`<div class="dock"></div>`);
  const again=h(`<button class="cta" type="button">もう一度</button>`);again.addEventListener("click",start);
  const back=h(`<button class="ghost" type="button">科目画面へ</button>`);back.addEventListener("click",()=>{view="subject";render();});
  dock.appendChild(again);dock.appendChild(back);app.appendChild(dock);
}
function materialsView(){
  const library=window.GEOGRAPHY_LIBRARY || {sites:GEOGRAPHY_MATERIALS,items:[]};
  const head=h(`<header class="top"><button class="back" type="button">← 地理</button><h1>地理の教材</h1><span class="subtle">11サイト</span></header>`);
  head.querySelector(".back").addEventListener("click",()=>{view="subject";render();});
  app.appendChild(head);
  const body=h(`<div class="grow"></div>`);
  const index=h(`<div class="panel"><h2>教材元</h2></div>`);
  library.sites.forEach(site=>index.appendChild(h(`<p><a href="${esc(site.url)}" target="_blank" rel="noopener noreferrer">${esc(site.name)}</a><br><span class="subtle">${esc(site.description)}</span></p>`)));
  body.appendChild(index);
  const search=h(`<div class="panel"><label for="material-search">記事・プリント・スライドを探す</label><input id="material-search" type="search" placeholder="例：海流、地形、資源" autocomplete="off"><p class="subtle" role="status"></p></div>`);
  const list=h(`<div class="list"></div>`);
  const draw=term=>{
    list.innerHTML="";
    const terms=term.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const items=library.items.filter(item=>terms.every(word=>(item.title+" "+item.siteName).toLowerCase().includes(word)));
    search.querySelector('[role="status"]').textContent=`${items.length}件${items.length>60?"（先頭60件を表示。検索して絞り込めます）":""}`;
    items.slice(0,60).forEach(item=>list.appendChild(h(`<div class="item"><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a><p class="subtle">${esc(item.siteName)}・${esc(item.kind)}</p></div>`)));
    if(!items.length) list.appendChild(h(`<p class="empty">該当する教材はありません。</p>`));
  };
  search.querySelector("input").addEventListener("input",event=>draw(event.target.value));
  body.appendChild(search);body.appendChild(list);app.appendChild(body);draw("");
}
function render(){
  app.innerHTML="";
  if(view==="home") home();
  else if(view==="subject") subjectView();
  else if(view==="quiz") quiz();
  else if(view==="materials") materialsView();
  else if(view==="log") logView();
  else result();
  window.scrollTo(0,0);
}
render();

