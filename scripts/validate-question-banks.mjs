import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const manifest = await readFile('js/generated-manifest.js', 'utf8');
const files = JSON.parse(manifest.match(/\[[\s\S]*\]/)[0]);
const packs = [];
const context = vm.createContext({ registerQuestionPack: pack => packs.push(pack) });

for (const file of files) vm.runInContext(await readFile(file, 'utf8'), context, { filename: file });

const questions = packs.flatMap(pack => pack.questions);
const examPacks = packs.filter(pack => pack.exam);
if (examPacks.length < 4 || examPacks.some(pack => !/^https:\/\//.test(pack.source ?? '') || !pack.sourceLabel)) {
  throw new Error('二次試験由来の問題パックに出典がありません。');
}
const ids = new Set();
for (const question of questions) {
  if (!['choice', 'tf'].includes(question.type)) throw new Error(`未対応形式: ${question.id}`);
  if (ids.has(question.id)) throw new Error(`重複ID: ${question.id}`);
  ids.add(question.id);
  if (question.type === 'choice') {
    if (question.o.length !== 4 || new Set(question.o).size !== 4) throw new Error(`選択肢に不足または重複があります: ${question.id}`);
    if (!question.a.length || question.a.some(index => !Number.isInteger(index) || index < 1 || index > 4)) {
      throw new Error(`正解番号が不正です: ${question.id}`);
    }
  }
}

const german = questions.filter(question => question.subject === 'german');
if (german.length !== 400) throw new Error(`ドイツ語問題数が400ではありません: ${german.length}`);
const jaToDe = german.filter(question => question.id.startsWith('ger-jd-'));
if (jaToDe.some(question => question.q.includes(question.o[question.a[0] - 1]))) {
  throw new Error('日本語→ドイツ語問題の本文に正解語が含まれています。');
}

const rtaCategories = questions.filter(question => question.rta).map(question => question.rta).sort();
const expectedRta = ['formula', 'recognition', 'term', 'unit'];
if (expectedRta.some(category => !rtaCategories.includes(category))) {
  throw new Error(`物理RTAカテゴリが不足しています: ${rtaCategories.join(', ')}`);
}
for (const category of ['term', 'recognition']) {
  for (const chapter of [1, 2, 3, 4, 5]) {
    if (questions.filter(question => question.subject === 'physics' && question.rta === category && question.c === chapter).length < 3) {
      throw new Error(`物理RTAの${category}・単元${chapter}の問題が不足しています。`);
    }
  }
}

console.log(`OK: ${packs.length}パック / ${questions.length}問 / ドイツ語${german.length}問 / input 0件`);
