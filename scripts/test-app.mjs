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
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; }
    set innerHTML(value) {
      if (this.tag === 'app') html = [];
      else html.push(value);
      if (this.tag === 'template') this.content = {firstElementChild:new Element('fragment')};
    }
    appendChild(child) { this.children.push(child); return child; }
    querySelector() { return new Element('child'); }
    addEventListener() {}
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
  for (const [subject, minimum] of Object.entries({classics:15, earth:10, german:400, physics:764})) {
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

for (const [ms, counter, label, review] of [
  [0,'reflex','反射',false], [2000,'reflex','反射',false],
  [2001,'settled','定着',false], [5000,'settled','定着',false],
  [5001,'slow','遅い',true], [9999,'slow','遅い',true],
  [10000,'review','要復習',true], [10001,'review','要復習',true],
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
    [legacyQuestion.id]:{seen:5, wrong:2, last:0},
    [rtaQuestion.id]:{seen:2, wrong:1, last:0, needsReview:true, lastMs:9000, bestMs:3000, totalMs:12000, slow:1},
    'unknown-retained-id':{seen:7, wrong:0, last:1, extra:'keep'},
  };
  const app = makeApp(initial);
  app.begin(); app.answer(2000);
  const saved = app.saved();
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
