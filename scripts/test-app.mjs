import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';
import { test } from 'node:test';

// No dependencies or real browser storage: exercise the shipped scripts in isolation.
const manifestCode = await readFile('js/generated-manifest.js', 'utf8');
const files = JSON.parse(manifestCode.match(/\[[\s\S]*\]/)[0]);
const sources = Object.fromEntries(await Promise.all(files.map(async file => [file, await readFile(file, 'utf8')])));
const loaderCode = await readFile('js/loader.js', 'utf8');
const appCode = await readFile('js/app.js', 'utf8');
const workflowCode = await readFile('.github/workflows/generate-manifest.yml', 'utf8');
const packs = [];
const bankContext = vm.createContext({registerQuestionPack: pack => packs.push(pack)});
for (const file of files) vm.runInContext(sources[file], bankContext, {filename:file});
const questions = packs.flatMap(pack => pack.questions.map(q => pack.exam
  ? {...q, exam:true, source:pack.source, sourceLabel:pack.sourceLabel} : q));
const subjects = {};
for (const pack of packs) {
  const sub = subjects[pack.subject] ||= {name:pack.name, chapters:{}};
  Object.assign(sub.chapters, pack.chapters || {});
}
const rtaQuestion = questions.find(q => q.subject === 'physics' && q.rta === 'recognition');
const legacyQuestion = questions.find(q => q.subject === 'classics');
const key = 'multi-study-drill-v1';
const copy = value => JSON.parse(JSON.stringify(value));

test('deployment waits for the actual legacy Pages workflow path, not its CLI display name', async () => {
  const script = workflowCode.match(/script: \|\r?\n([\s\S]*?)      - name: Publish tested app/)[1];
  const times = [0, 1, 600001];
  const context = vm.createContext({
    context:{repo:{owner:'test',repo:'test'},sha:'test-sha'},
    Date:{now:() => times.shift() ?? 600001}, setTimeout:callback => callback(),
    github:{rest:{
      repos:{getPages:async () => ({data:{build_type:'legacy'}})},
      actions:{listWorkflowRunsForRepo:async () => ({data:{workflow_runs:[
        {name:'pages build and deployment',path:'dynamic/pages/pages-build-deployment',status:'completed'},
        {name:'Validate and publish study app',path:'.github/workflows/generate-manifest.yml',status:'in_progress'},
      ]}})},
    }},
  });
  await vm.runInContext(`(async () => {${script}})()`, context);
});

function makeApp(initial = {}) {
  let now = 1000;
  let html = [];
  const storage = new Map([[key, typeof initial === 'string' ? initial : JSON.stringify(initial)]]);
  const descendants = node => [node, ...[...node.children, ...node.queries.values()].flatMap(descendants)];
  const connect = (node, connected) => descendants(node).forEach(el => {el.isConnected=connected;});
  class Element {
    constructor(tag) { this.tag=tag; this.children=[]; this.queries=new Map(); this.listeners=new Map(); this.isConnected=tag==='app'; }
    set innerHTML(value) {
      if (this.tag === 'app') {
        this.children.forEach(child => connect(child,false));
        this.children=[]; html=[];
      }
      else html.push(value);
      if (this.tag === 'template') {
        const node=new Element(value.match(/^\s*<([\w-]+)/)?.[1] || 'fragment');
        node.markup=value; node.open=/^<details[^>]*\sopen(?:\s|>)/.test(value.trim());
        node.disabled=/^<button[^>]*\sdisabled(?:\s|>)/.test(value.trim());
        this.content={firstElementChild:node};
      }
    }
    appendChild(child) { this.children.push(child); connect(child,this.isConnected); return child; }
    querySelector(selector) {
      if(!this.queries.has(selector)) {const child=new Element('child'); child.isConnected=this.isConnected; this.queries.set(selector,child);}
      return this.queries.get(selector);
    }
    addEventListener(type,callback) {this.listeners.set(type,callback);}
  }
  const root = new Element('app');
  const context = vm.createContext({
    Q_ALL:questions, SUBJECTS:subjects,
    document:{getElementById:() => root, createElement:tag => new Element(tag)},
    window:{scrollTo() {}}, location:{href:'http://localhost/'}, URL,
    localStorage:{getItem:k => storage.get(k) ?? null, setItem:(k,v) => storage.set(k,v)},
    performance:{now:() => now},
  });
  vm.runInContext(appCode, context, {filename:'js/app.js'});
  const run = code => vm.runInContext(code, context);
  return {
    run, value:code => copy(run(code)), saved:() => JSON.parse(storage.get(key)),
    html:() => html.join('\n'),
    nodes:() => descendants(root),
    click(label) {
      const nodes=descendants(root).filter(el => el.tag==='button' && el.markup.replace(/<[^>]*>/g,'').trim()===label);
      assert.equal(nodes.length,1,`unique button: ${label}`);
      assert.ok(!nodes[0].disabled,`enabled button: ${label}`);
      nodes[0].listeners.get('click')();
    },
    toggleDetails(open) {
      const details=descendants(root).find(el=>el.tag==='details');
      assert.ok(details); details.open=open; details.listeners.get('toggle')();
    },
    begin(q = rtaQuestion) {
      run(`subjectId=${JSON.stringify(q.subject)}; sess=[${JSON.stringify(q)}]; idx=0; hit=0; miss=[]; cleared=[]; picked=null; picks=[]; marks=[]; lastTiming=null; questionStartedAt=performance.now(); view='quiz'; render();`);
    },
    answer(ms, ok = true, q = rtaQuestion) {
      now = 1000 + ms;
      const value = q.type === 'tf' ? (ok ? q.a : !q.a) : (ok ? q.a : []);
      run(`answer(${JSON.stringify(value)});`);
    },
  };
}

test('manifest discovers every nested subjects/**/*.js file', async () => {
  async function walk(dir) {
    const entries = await readdir(dir, {withFileTypes:true});
    return (await Promise.all(entries.map(e => e.isDirectory() ? walk(`${dir}/${e.name}`)
      : e.isFile() && e.name.endsWith('.js') ? [`${dir}/${e.name}`] : []))).flat();
  }
  assert.deepEqual(files, (await walk('subjects')).sort());
});

test('all four existing subjects, German directions, and 87 included university-years are present', () => {
  for (const [subject, minimum] of Object.entries({classics:15, earth:10, german:400, physics:751})) {
    assert.ok(questions.filter(q => q.subject === subject).length >= minimum, subject);
  }
  const german = questions.filter(q => q.subject === 'german');
  assert.equal(german.length, 400);
  for (const prefix of ['ger-jd-', 'ger-dj-']) {
    const direction = german.filter(q => q.id.startsWith(prefix));
    assert.equal(direction.length, 200);
    assert.ok(direction.every(q => !q.q.includes(q.o[q.a[0]-1])), 'answer must not appear in prompt');
  }
  assert.ok(Object.values(subjects.german.chapters).includes('基本動詞200'));
  const examFiles = files.filter(file => file.includes('/recognition/'));
  const universities = ['hokkaido','tohoku','tokyo','nagoya','kyoto','osaka','kyushu','science-tokyo','kobe'];
  for (const university of universities) {
    for (let year = university === 'kobe' ? 2020 : 2017; year <= 2026; year++) {
      assert.ok(examFiles.some(file => file.endsWith(`/${university}-${year}.js`)), `${university}-${year}`);
    }
  }
  assert.ok(questions.every(q => q.type === 'choice' || q.type === 'tf'));
});

test('biology import contains all five supplied packs and all ten chapters', () => {
  const expected = {'vegetation.js':28, 'production.js':32, 'succession.js':30, 'world-biomes.js':32, 'japan-biomes.js':29};
  const biologyFiles = files.filter(file => file.startsWith('subjects/biology/'));
  assert.deepEqual(biologyFiles.sort(), Object.keys(expected).map(file => `subjects/biology/${file}`).sort());
  for (const [file, count] of Object.entries(expected)) {
    const imported = [];
    vm.runInNewContext(sources[`subjects/biology/${file}`], {registerQuestionPack:pack => imported.push(pack)});
    assert.equal(imported.length, 1);
    assert.equal(imported[0].subject, 'biology');
    assert.equal(imported[0].name, '生物');
    assert.equal(imported[0].questions.length, count, file);
  }
  const biology = questions.filter(q => q.subject === 'biology');
  assert.equal(biology.length, 151);
  assert.equal(subjects.biology.name, '生物');
  assert.deepEqual(Object.keys(subjects.biology.chapters).map(Number), [1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual([...new Set(biology.map(q => q.d))].sort(), ['A','B','C']);
  for (const q of biology) {
    assert.ok(q.id.startsWith('bio-'));
    assert.equal(q.type, 'choice');
    assert.equal(q.o.length, 4);
    assert.equal(new Set(q.o).size, 4);
    assert.equal(q.a.length, 1);
    assert.ok(Number.isInteger(q.a[0]) && q.a[0] >= 1 && q.a[0] <= 4);
    assert.ok(q.q && q.e && subjects.biology.chapters[q.c]);
    assert.ok(!q.rta && !q.exam);
  }
});

test('biology is available from home and supports chapter and difficulty filtering', () => {
  const app = makeApp();
  assert.ok(app.html().includes('<b>生物</b>'));
  assert.ok(!app.html().includes('生物基礎'));
  assert.ok(app.html().includes('151問'));
  app.run("subjectId='biology'; view='subject'; render();");
  assert.equal(app.value('pool().length'), 151);
  for (const [chapter, name] of Object.entries(subjects.biology.chapters)) {
    const count = questions.filter(q => q.subject === 'biology' && q.c === Number(chapter)).length;
    app.click(`${name} ${count}`);
    assert.equal(app.value('pool().length'), count);
    assert.ok(app.value('pool()').every(q => q.c === Number(chapter)));
    app.click(`${name} ${count}`);
    assert.equal(app.value('pool().length'), 151);
  }
  const hard = questions.filter(q => q.subject === 'biology' && q.d === 'C').length;
  app.click(`C ${hard}`);
  assert.equal(app.value('pool().length'), hard);
  app.click('20問');
  app.run('start();');
  const session = app.value('sess');
  assert.equal(session.length, Math.min(20, hard));
  assert.equal(new Set(session.map(q => q.id)).size, session.length);
  assert.ok(session.every(q => q.subject === 'biology' && q.d === 'C'));
});

test('every biology answer shows its explanation, preserves old history, and supports review', () => {
  const initial = {'phy-1':{seen:3,wrong:1,last:0}, [rtaQuestion.id]:{seen:2,wrong:0,last:1,lastMs:1500}};
  const app = makeApp(initial);
  const biology = questions.filter(q => q.subject === 'biology');
  for (const q of biology) {
    app.begin(q);
    app.answer(21000, true, q);
    assert.deepEqual(app.saved()[q.id], {seen:1,wrong:0,last:1});
    assert.ok(app.html().includes(q.e));
    assert.ok(!app.html().includes('回答時間'));
  }
  const q = biology[0];
  app.begin(q); app.answer(1000, false, q); app.run('next();');
  assert.deepEqual(app.saved()[q.id], {seen:2,wrong:1,last:0});
  for (const [id, record] of Object.entries(initial)) assert.deepEqual(app.saved()[id], record);
  const reloaded = makeApp(app.saved());
  reloaded.run("subjectId='biology'; view='subject'; render();");
  reloaded.click('要復習 1');
  assert.deepEqual(reloaded.value('pool().map(q=>q.id)'), [q.id]);
});

for (const [ms, counter, label, review] of [
  [0,'reflex','反射',false], [2000,'reflex','反射',false],
  [2001,'settled','定着',false], [5000,'settled','定着',false],
  [5001,'slow','遅い（5〜20秒）',true], [9999,'slow','遅い（5〜20秒）',true],
  [10000,'slow','遅い（5〜20秒）',true], [10001,'slow','遅い（5〜20秒）',true],
  [19999,'slow','遅い（5〜20秒）',true],
  [20000,'review','要復習（20秒以上）',true], [20001,'review','要復習（20秒以上）',true],
]) {
  test(`RTA boundary ${ms}ms: ${label}`, () => {
    const app = makeApp();
    app.begin();
    assert.ok(!app.html().includes('回答時間'), 'timer hidden before answer');
    app.answer(ms);
    const record = app.saved()[rtaQuestion.id];
    assert.equal(record.lastMs, ms);
    assert.equal(record.bestMs, ms);
    assert.equal(record.totalMs, ms);
    assert.equal(record[counter], 1);
    assert.equal(record.needsReview, review);
    assert.ok(app.html().includes('回答時間'));
    assert.ok(app.html().includes(label));
  });
}

test('wrong RTA answers are unlearned even if fast; double answer does not save twice', () => {
  const app = makeApp();
  app.begin(); app.answer(500, false); app.answer(500, false);
  const record = app.saved()[rtaQuestion.id];
  assert.equal(record.seen, 1);
  assert.equal(record.wrong, 1);
  assert.equal(record.review, 1);
  assert.equal(record.reflex, undefined);
  assert.equal(record.needsReview, true);
  assert.ok(app.html().includes('未定着（不正解）'));
});

test('old storage survives, timing accumulates, and fast correct answers clear review', () => {
  const initial = {
    'phy-1':{seen:3, wrong:1, last:0},
    [legacyQuestion.id]:{seen:5, wrong:2, last:0},
    [rtaQuestion.id]:{seen:2, wrong:1, last:0, needsReview:true, lastMs:9000, bestMs:3000, totalMs:12000, slow:1},
    'unknown-retained-id':{seen:7, wrong:0, last:1, extra:'keep'},
  };
  const app = makeApp(initial);
  app.begin(); app.answer(2000);
  const saved = app.saved();
  assert.deepEqual(saved['phy-1'], initial['phy-1'], 'deleted question history must be retained');
  assert.deepEqual(saved[legacyQuestion.id], initial[legacyQuestion.id]);
  assert.deepEqual(saved['unknown-retained-id'], initial['unknown-retained-id']);
  assert.equal(saved[rtaQuestion.id].seen, 3);
  assert.equal(saved[rtaQuestion.id].totalMs, 14000);
  assert.equal(saved[rtaQuestion.id].bestMs, 2000);
  assert.equal(saved[rtaQuestion.id].slow, 1);
  assert.equal(saved[rtaQuestion.id].needsReview, false);
  assert.equal(app.value('cleared.length'), 1);
  const reloaded = makeApp(saved);
  assert.deepEqual(reloaded.value('S'), saved);
});

test('legacy physics questions and the two-level selector are removed; all content remains usable', () => {
  assert.ok(!files.includes('subjects/physics/practice.js'));
  assert.ok(!questions.some(q => q.subject === 'physics' && /^phy-\d+$/.test(q.id)));
  const app = makeApp({'phy-1':{seen:3,wrong:1,last:0}});
  for (const content of ['exam','formula','unit','symbol','term','recognition','all']) {
    app.run(`subjectId='physics'; filters.content=${JSON.stringify(content)}; view='subject'; render();`);
    assert.ok(!app.html().includes('従来の問題'));
    assert.ok(!app.html().includes('RTAカテゴリ'));
    assert.ok(!app.html().includes('基礎RTA'));
    assert.ok(app.html().includes('過去問の条件判断'));
    assert.ok(app.html().includes('基礎の条件判断'));
    assert.ok(app.value('pool().length') > 0);
    const expected=Math.min(10,app.value('pool().length'));
    app.run('start();');
    assert.equal(app.value('sess.length'), expected);
  }
});

test('single-level content buttons preserve the existing exam/basic partition and exact counts', () => {
  const app=makeApp();
  app.run("subjectId='physics'; view='subject'; render();");
  const groups=[['公式',21],['単位',1],['微積の記号',15],['用語・定義',31],['基礎の条件判断',17],['過去問の条件判断',666],['全内容',751]];
  for(const [label,count] of groups){
    app.click(label);
    assert.equal(app.value('pool().length'),count,label);
    const content=app.value('filters.content');
    const qs=app.value('pool()');
    if(content==='exam') assert.ok(qs.every(q=>q.exam));
    else if(content!=='all') assert.ok(qs.every(q=>!q.exam && q.rta===content));
  }
});

test('switching content clears old restrictions; selecting the same content keeps them', () => {
  const app=makeApp();
  app.run("subjectId='physics'; view='subject'; render();");
  app.click('力学');
  app.run("filters.diffs=['C']; filters.types=['choice']; filters.only='todo'; advancedOpen=true; render();");
  app.click('公式');
  assert.deepEqual(app.value('filters'),{chapters:[],diffs:[],types:[],only:'all',content:'formula'});
  assert.equal(app.value('advancedOpen'),false);
  app.click('力学');
  app.click('公式');
  assert.deepEqual(app.value('filters.chapters'),[1]);
  app.click('全分野');
  assert.deepEqual(app.value('filters.chapters'),[]);
});

test('advanced settings are collapsed, keep their open state on rerender, and hide single-format noise', () => {
  const app=makeApp();
  app.run("subjectId='physics'; view='subject'; render();");
  assert.equal(app.nodes().find(el=>el.tag==='details').open,false);
  assert.ok(!app.nodes().some(el=>el.markup?.includes('<span>形式</span>')));
  app.toggleDetails(true);
  app.click('B');
  assert.deepEqual(app.value('filters.diffs'),['B']);
  assert.equal(app.nodes().find(el=>el.tag==='details').open,true);
  app.toggleDetails(false);
  app.run('render();');
  assert.equal(app.nodes().find(el=>el.tag==='details').open,false);
  assert.ok(app.html().includes('詳細設定（設定中）'));
  app.click('公式');
  app.toggleDetails(true);
  app.click('完全ランダム');
  assert.equal(app.value('order'),'rand');
  assert.equal(app.nodes().find(el=>el.tag==='details').open,true);
});

test('other subject controls remain available and non-collapsed', () => {
  const app=makeApp();
  for(const subject of ['classics','earth','german','biology']){
    app.run(`subjectId=${JSON.stringify(subject)}; view='subject'; render();`);
    assert.ok(!app.nodes().some(el=>el.tag==='details'));
    assert.ok(app.nodes().some(el=>el.markup?.includes('<span>単元</span>')));
    assert.ok(app.nodes().some(el=>el.markup?.includes('<span>形式</span>')));
    assert.ok(app.nodes().some(el=>el.markup?.includes('<span>出題順</span>')));
  }
});

test('simplified review targets still distinguish wrong, slow, and unseen questions', () => {
  const exam=questions.filter(q=>q.exam);
  const app=makeApp({
    [exam[0].id]:{seen:1,wrong:1,last:0,needsReview:true},
    [exam[1].id]:{seen:1,wrong:0,last:0,needsReview:true,lastMs:6000},
  });
  app.run("subjectId='physics'; view='subject'; render();");
  app.click('要復習');
  assert.deepEqual(app.value('pool().map(q=>q.id)').sort(),[exam[0].id,exam[1].id].sort());
  app.click('過去の誤答');
  assert.deepEqual(app.value('pool().map(q=>q.id)'),[exam[0].id]);
  app.click('未着手');
  assert.equal(app.value('pool().length'),exam.length-2);
  app.click('すべて');
  assert.equal(app.value('pool().length'),exam.length);
});

test('non-RTA answers retain the original record format', () => {
  const app = makeApp();
  app.begin(legacyQuestion); app.answer(15000, true, legacyQuestion);
  assert.deepEqual(app.saved()[legacyQuestion.id], {seen:1, wrong:0, last:1});
  assert.ok(!app.html().includes('回答時間'));
});

test('correct but slow answers appear on the results and review list', () => {
  const app = makeApp();
  app.begin(); app.answer(6000); app.run('next();');
  assert.equal(app.value('hit'), 1);
  assert.ok(app.html().includes('要復習 1問（不正解・遅答）'));
  assert.ok(app.html().includes('前回 6.0秒'));
  app.run("view='log'; render();");
  assert.ok(app.html().includes('要復習 1問'));
});

test('review-priority sessions contain unique questions, including all when requested', () => {
  const qs = questions.filter(q => q.subject === 'classics');
  const initial = Object.fromEntries(qs.map((q,i) => [q.id,{seen:1, wrong:0, last:i < 5 ? 0 : 1}]));
  const app = makeApp(initial);
  for (let attempt = 0; attempt < 30; attempt++) {
    app.run("subjectId='classics'; size=999; order='mix'; start();");
    const session = app.value('sess.map(q=>q.id)');
    assert.equal(session.length, qs.length);
    assert.equal(new Set(session).size, session.length);
  }
  app.run("size=5; start();");
  assert.ok(app.value('sess.filter(todo).length') >= 3);
});

test('answer shuffling preserves single and multiple correct options; false TF answer is handled once', () => {
  const app = makeApp();
  app.run("testChoice={type:'choice',o:['一','二','三','四'],a:[1,3]};");
  for (let i = 0; i < 30; i++) {
    assert.deepEqual(app.value('(()=>{const q=prepareQuestion(testChoice); return q.a.map(n=>q.o[n-1]).sort();})()'), ['一','三']);
  }
  const q = {...legacyQuestion, type:'tf', a:false};
  app.begin(q); app.answer(1000, true, q); app.answer(1000, true, q);
  assert.equal(app.saved()[q.id].seen, 1);
  assert.equal(app.saved()[q.id].wrong, 0);
});

test('broken or non-object JSON storage is recoverable', () => {
  for (const value of ['{', 'null', '[]', '42', '"text"']) {
    assert.deepEqual(makeApp(value).value('S'), {});
  }
});

async function makeLoader(fileSources, {timeoutFile} = {}) {
  const inserted = [], executed = [], batchSizes = [], errors = [], timers = new Map();
  let timerId = 0, queue = [], draining = false;
  const root = {children:[], replaceChildren(...children) {this.children=children;}};
  const status = {textContent:''};
  const document = {
    currentScript:null,
    getElementById:id => id === 'app' ? root : status,
    createElement:() => ({setAttribute() {}}),
    body:{appendChild(script) {
      inserted.push(script);
      queue.push(script);
      if (draining) return;
      draining = true;
      queueMicrotask(() => {
        while (queue.length) {
          const next = queue.shift();
          const file = next.src.split('?')[0];
          if (file === timeoutFile) { queue=[]; break; }
          if (!(file in fileSources)) { next.onerror(); continue; }
          document.currentScript = next;
          if (file.startsWith('subjects/')) batchSizes.push(inserted.length);
          try { vm.runInContext(fileSources[file], context, {filename:file}); }
          catch (error) { errors.push(error.message); }
          document.currentScript = null;
          executed.push(file);
          next.onload();
        }
        draining = false;
      });
    }},
  };
  const context = vm.createContext({
    document, console:{error:error => errors.push(error.message)},
    setTimeout:fn => {timers.set(++timerId,fn); return timerId;},
    clearTimeout:id => timers.delete(id),
  });
  context.window = context;
  vm.runInContext(loaderCode, context, {filename:'js/loader.js'});
  await new Promise(resolve => setImmediate(resolve));
  if (timeoutFile) {
    for (const callback of timers.values()) callback();
    await new Promise(resolve => setImmediate(resolve));
  }
  return {inserted, executed, batchSizes, errors, root, status, context};
}

test('loader downloads in parallel, executes in manifest order, builds all subjects, then app', async () => {
  const loader = await makeLoader({'js/generated-manifest.js':manifestCode, ...sources, 'js/app.js':'window.appLoaded = true;'});
  assert.deepEqual(loader.executed, ['js/generated-manifest.js', ...files, 'js/app.js']);
  assert.ok(loader.batchSizes.every(count => count === files.length + 1), 'all pack requests start before the first pack executes');
  assert.ok(loader.inserted.every(script => script.async === false && /\?v=\d+$/.test(script.src)));
  assert.equal(loader.context.Q_ALL.length, questions.length);
  assert.deepEqual(copy(loader.context.SUBJECTS), subjects);
  assert.equal(loader.context.appLoaded, true);
  assert.equal(loader.errors.length, 0);
  assert.ok(loader.status.textContent.endsWith(`${files.length} / ${files.length}`));
});

test('new nested question pack automatically creates its subject and chapter', async () => {
  const newFile = 'subjects/new-subject/nested/new-unit.js';
  const pack = {subject:'new-subject', name:'追加科目', chapters:{1:'追加単元'}, questions:[{id:'new-test', subject:'new-subject',type:'tf',a:true}]};
  const loader = await makeLoader({
    'js/generated-manifest.js':`const MANIFEST = ${JSON.stringify([newFile])};`,
    [newFile]:`registerQuestionPack(${JSON.stringify(pack)});`, 'js/app.js':'window.appLoaded=true;',
  });
  assert.equal(loader.context.SUBJECTS['new-subject'].name, '追加科目');
  assert.equal(loader.context.SUBJECTS['new-subject'].chapters[1], '追加単元');
  assert.equal(loader.context.Q_ALL[0].id, 'new-test');
});

for (const failure of ['missing','unregistered','duplicate','unsupported','timeout']) {
  test(`loader failure (${failure}) is visible and never starts a partial app`, async () => {
    const q = {id:'same', subject:'test', type:failure === 'unsupported' ? 'input' : 'tf', a:true};
    const code = `registerQuestionPack(${JSON.stringify({subject:'test',name:'テスト',questions:[q]})});`;
    const inputs = {'js/generated-manifest.js':"const MANIFEST=['subjects/one.js','subjects/two.js'];", 'subjects/two.js':code, 'js/app.js':'window.appLoaded=true;'};
    if (failure !== 'missing') inputs['subjects/one.js'] = failure === 'unregistered' ? '// no registration' : code;
    if (failure !== 'duplicate') inputs['subjects/two.js'] = code.replaceAll('same','other');
    const loader = await makeLoader(inputs, {timeoutFile:failure === 'timeout' ? 'subjects/one.js' : undefined});
    assert.equal(loader.context.appLoaded, undefined);
    assert.equal(loader.root.children[0].className, 'load-error');
    assert.ok(loader.root.children[0].textContent.includes('問題データを読み込めませんでした。'));
    assert.ok(loader.errors.length > 0);
  });
}
