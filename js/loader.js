/* Loads the generated manifest, then each subject module, then the app. */
(function () {
  const version = Date.now();
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
      const metadata = {
        physics: { name: '物理', chapters: { 1: '力学', 2: '熱力学', 3: '波動', 4: '電磁気', 5: '原子' } },
        earth: { name: '地学', chapters: { 1: '地球', 2: '地質・地史', 3: '大気・海洋', 4: '宇宙' } },
        classics: { name: '古典', chapters: { 1: '古文単語', 2: '文法', 3: '敬語', 4: '古文読解', 5: '漢文' } },
        german: { name: 'ドイツ語', chapters: { 1: '基本動詞200' } }
      };
      window.SUBJECTS = Object.fromEntries(
        Object.entries(window.__TANGO_SUBJECTS || {}).map(([id, questions]) => [id, metadata[id] || { name: id, chapters: {} }])
      );
      window.Q_ALL = Object.values(window.__TANGO_SUBJECTS || {}).flat();
      return load('app.js');
    })
    .catch(error => {
      document.getElementById('app').textContent = `問題データを読み込めませんでした。${error.message}`;
      console.error(error);
    });
})();
