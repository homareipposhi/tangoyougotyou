import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const manifest = await readFile('js/generated-manifest.js', 'utf8');
const files = JSON.parse(manifest.match(/\[[\s\S]*\]/)[0]);
const packs = [];
const context = vm.createContext({ registerQuestionPack: pack => packs.push(pack) });

for (const file of files) vm.runInContext(await readFile(file, 'utf8'), context, { filename: file });

const questions = packs.flatMap(pack => pack.questions);
const ids = new Set();
for (const question of questions) {
  if (!['choice', 'tf'].includes(question.type)) throw new Error(`未対応形式: ${question.id}`);
  if (ids.has(question.id)) throw new Error(`重複ID: ${question.id}`);
  ids.add(question.id);
  if (question.type === 'choice' && question.o.length !== 4) throw new Error(`四択ではありません: ${question.id}`);
}

const german = questions.filter(question => question.subject === 'german');
if (german.length !== 400) throw new Error(`ドイツ語問題数が400ではありません: ${german.length}`);
const jaToDe = german.filter(question => question.id.startsWith('ger-jd-'));
if (jaToDe.some(question => question.q.includes(question.o[question.a[0] - 1]))) {
  throw new Error('日本語→ドイツ語問題の本文に正解語が含まれています。');
}

console.log(`OK: ${packs.length}パック / ${questions.length}問 / ドイツ語${german.length}問 / input 0件`);
