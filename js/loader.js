/* Loads the generated manifest, then each question pack, then the app. */
(function () {
  const version = Date.now();
  const packs = [];
  const registeredScripts = new WeakSet();
  const status = document.getElementById('load-status');
  let failed = false;
  window.registerQuestionPack = function registerQuestionPack(pack) {
    if (!pack || !pack.subject || !pack.name || !Array.isArray(pack.questions)) {
      throw new Error("問題パックの形式が正しくありません。");
    }
    packs.push(pack);
    if (document.currentScript) registeredScripts.add(document.currentScript);
  };
  const load = (src, questionPack = false) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Download packs concurrently, but execute them in manifest order.
    script.async = false;
    script.src = `${src}?v=${version}`;
    const timer = setTimeout(() => reject(new Error(`読み込みがタイムアウトしました: ${src}`)), 30000);
    script.onload = () => {
      clearTimeout(timer);
      if (questionPack && !registeredScripts.has(script)) {
        reject(new Error(`問題パックが登録されませんでした: ${src}`));
      } else resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`読み込みに失敗しました: ${src}`));
    };
    document.body.appendChild(script);
  });

  load('js/generated-manifest.js')
    .then(() => {
      let completed = 0;
      return Promise.all(MANIFEST.map(file => load(file, true).then(() => {
        completed++;
        if (status && !failed) status.textContent = `問題データを読み込んでいます。${completed} / ${MANIFEST.length}`;
      })));
    })
    .then(() => {
      const ids = new Set();
      const subjects = {};
      const questions = [];
      packs.forEach(pack => {
        const subject = subjects[pack.subject] ||= { name: pack.name, chapters: {} };
        Object.assign(subject.chapters, pack.chapters || {});
        pack.questions.forEach(raw => {
          const question = pack.exam ? {...raw, exam:true, source:pack.source, sourceLabel:pack.sourceLabel} : raw;
          if (!question.id) throw new Error(`${pack.subject} にIDのない問題があります。`);
          if (ids.has(question.id)) throw new Error(`問題IDが重複しています: ${question.id}`);
          if (!['choice', 'tf'].includes(question.type)) throw new Error(`未対応の問題形式です: ${question.id}`);
          ids.add(question.id);
          questions.push(question);
        });
      });
      window.SUBJECTS = subjects;
      window.Q_ALL = questions;
      return load('js/app.js');
    })
    .catch(error => {
      failed = true;
      const message = document.createElement('p');
      message.className = 'load-error';
      message.setAttribute('role', 'alert');
      message.textContent = `問題データを読み込めませんでした。 ${error.message}`;
      document.getElementById('app').replaceChildren(message);
      console.error(error);
    });
})();
