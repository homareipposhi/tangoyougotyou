/* Loads the generated manifest, then each question pack, then the app. */
(function () {
  const version = Date.now();
  const packs = [];
  window.registerQuestionPack = function registerQuestionPack(pack) {
    if (!pack || !pack.subject || !pack.name || !Array.isArray(pack.questions)) {
      throw new Error("問題パックの形式が正しくありません。");
    }
    packs.push(pack);
  };
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${src}?v=${version}`;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`読み込みに失敗しました: ${src}`));
    document.body.appendChild(script);
  });

  load('js/generated-manifest.js')
    .then(() => Promise.all(MANIFEST.map(file => load(file))))
    .then(() => {
      const ids = new Set();
      const subjects = {};
      const questions = [];
      packs.forEach(pack => {
        const subject = subjects[pack.subject] ||= { name: pack.name, chapters: {} };
        Object.assign(subject.chapters, pack.chapters || {});
        pack.questions.forEach(question => {
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
      document.getElementById('app').innerHTML = `<p class="load-error">問題データを読み込めませんでした。<br>${String(error.message)}</p>`;
      console.error(error);
    });
})();
