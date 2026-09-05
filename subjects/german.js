const GERMAN_VERBS = [
  ["achten","4を尊敬する／4を尊重する。auf 4 achten：4に注意する"],
  ["ändern","4を変える。sich ändern：変わる"],
  ["anfangen","始まる／4を始める。mit 3 anfangen：3を始める、3から始める"],
  ["antworten","答える。auf 4 antworten：4に答える"],
  ["arbeiten","働く。an 3 arbeiten：3に従事する"],
  ["atmen","呼吸する／4を吸い込む"],
  ["aufgehen","昇る／開く"],
  ["aufhören","止む。mit 3 aufhören：3を止める"],
  ["aufmachen","4を開く／4を開ける"],
  ["aufstehen","立ち上がる／起きる"],
  ["aussehen","〜のように見える"],
  ["bauen","4を建てる／4をつくる。an 3 bauen：3の建設に従事する。auf 4 bauen：4を頼りにする"],
  ["bedeuten","4を意味する"],
  ["begegnen","3に出会う"],
  ["beginnen","始まる／4を始める。mit 3 beginnen：3を始める、3から始まる。zu 不定詞 beginnen：〜し始める"],
  ["begleiten","4に伴う"],
  ["behandeln","4を取り扱う"],
  ["bekommen","4をもらう／4を得る"],
  ["bemerken","4に気づく"],
  ["besuchen","4を訪れる／4に行く"],
  ["beten","祈る"],
  ["bewegen","4を動かす。sich bewegen：動く。4 zu 3 bewegen：4に3させる"],
  ["bezahlen","4を支払う"],
  ["bilden","4を形成する。sich bilden：形成される"],
  ["binden","4を結ぶ。4 an 4 binden：4を4に結び付ける"],
  ["bitten","4を頼む。4 um 4 bitten：4に4を頼む"],
  ["bleiben","留まる／残る／1のままである"],
  ["blicken","見る"],
  ["blühen","咲いている／栄えている"],
  ["brauchen","4を必要とする。nicht zu 不定詞 brauchen：〜する必要がない。nur zu 不定詞 brauchen：〜しさえすればよい"],
  ["brechen","4を折る／4を割る／4を破る。折れる／割れる。aus 3 brechen：3から現れる。mit 3 brechen：3と絶交する"],
  ["brennen","燃える／4を燃やす"],
  ["bringen","4を持ってくる／4をもたらす"],
  ["danken","3に感謝する。3 für 4 danken：3に4のことで感謝する"],
  ["dauern","続く"],
  ["decken","4を覆う。4 mit 3 decken：4を3で覆う"],
  ["denken","考える。an 4 denken：4（のこと）を考える。über 4 denken：4について考える"],
  ["dienen","3に仕える／3に役立つ。als 1 dienen：1として役立つ、1として使われる。zu 3 dienen：3に役立つ"],
  ["drehen","4を回す。sich drehen：回る。es dreht sich um 4：4が問題である"],
  ["drücken","4を押す／4を苦しめる。auf 4 drücken：4を押す"],
  ["ehren","4を尊敬する"],
  ["eilen","急ぐ"],
  ["enden","終わる。mit 3 enden：3で終わる"],
  ["entdecken","4を発見する"],
  ["entwickeln","4を発展（発達）させる。sich entwickeln：発展（発達）する。sich zu 3 entwickeln：（発展して）3になる"],
  ["erfahren","4を（聞いて）知る／4を経験する"],
  ["erinnern","4を思い出させる。4 an 4 erinnern：4に4を思い出させる。sich an 4 erinnern：4を思い出す"],
  ["erklären","4を説明する／4を宣言する／4を表明する。sich erklären：説明される"],
  ["erlauben","4を許す。sich 4 erlauben：敢えて4をする"],
  ["erleben","4を体験する"],
  ["erscheinen","現れる／刊行される／形のように思われる"],
  ["erwarten","4を待つ／4を期待する"],
  ["essen","4を食べる／食べる"],
  ["fahren","（乗り物で）行く"],
  ["fallen","落ちる／倒れる"],
  ["fangen","4を捕らえる"],
  ["fassen","4を掴む／4を収容する／4を理解する"],
  ["finden","4を見つける／4を得る／4を形と思う"],
  ["fliegen","飛ぶ"],
  ["fließen","流れる"],
  ["folgen","3に従う／auf 4 folgen：4に続く／aus 3 folgen：3から推論される"],
  ["fragen","4に尋ねる／4 nach 3 fragen：4に3を尋ねる／nach 3 fragen：3（の事）を気にかける"],
  ["freuen","4を喜ばせる／sich an 3 freuen：3を楽しむ／sich auf 4 freuen：4を楽しみにしている／sich über 4 freuen：4を喜ぶ"],
  ["fühlen","4を感じる／sich 形 fühlen：（自分を）形と感じる"],
  ["führen","4を導く／zu 3 führen：3に至る／zu 3 führen：3をもたらす"],
  ["füllen","4を満たす／4 mit 3 füllen：4を3で満たす"],
  ["fürchten","4を恐れる／sich vor 3 fürchten：3を恐れる／für（um）4 fürchten：4（の事）を心配する"],
  ["geben","3に4を与える／es gibt 4：4が存在する／es gibt 4：4が起こる／zu 不定詞 geben：不定詞させる"],
  ["gefallen","3に気に入る"],
  ["gehen","行く／an 4 gehen：4に取りかかる／不定詞 gehen：不定詞しに行く／es geht um 4：4が問題である"],
  ["gehören","3のものである／zu 3 gehören：3の一部である／zu 3 gehören：3のために必要である／zu 3 gehören：3にふさわしい／in 4 gehören：4に入れられるべきである"],
  ["glauben","4と思う／4を信じる／3 glauben：3を信じる／an 4 glauben：4を信じる"],
  ["greifen","4を掴む／nach 3 greifen：3に手を伸ばす／zu 3 greifen：3を手にとる"],
  ["grüßen","4に挨拶する"],
  ["haben","4を持っている／es leicht haben：楽である／es mit 3 zu tun haben：3に関わる／zu 不定詞 haben：不定詞しなければならない／zu 不定詞 haben：不定詞し得る"],
  ["halten","4を（手に）持っている／4を守る、4を保つ／4を行う／sich halten：持ちこたえる／halten：止まる／4 für 4 halten：4を4と思う"],
  ["handeln","行動する／mit 3 handeln：3を商う／von 3（über 4）handeln：3（4）を扱う／es handelt sich um 4：4が問題である"],
  ["hängen","4を掛ける／4 an 4 hängen：4を4に掛ける／an 3 hängen：3に掛っている"],
  ["hassen","4を憎む、4を嫌う"],
  ["heiraten","4と結婚する"],
  ["heißen","1という名前である／1という意味である"],
  ["helfen","3を助ける／3に役立つ／3 bei 3 helfen：3の3を助ける"],
  ["herrschen","支配する／über 4 herrschen：4を支配する"],
  ["hindern","4を妨げる／4 an 3 hindern：4の3を妨げる"],
  ["hoffen","4を望む／auf 4 hoffen：4を期待する"],
  ["holen","4を持ってくる／4を連れてくる"],
  ["hören","4を聞く／auf 4 hören：4に耳を傾ける"],
  ["jagen","4を狩る／4を追う／nach 3 jagen：3を追い求める"],
  ["kämpfen","戦う／für 4 kämpfen：4のために戦う／gegen 4 kämpfen：4と戦う／mit 3 kämpfen：3と戦う、3と共に戦う／um 4 kämpfen：4を得るために戦う"],
  ["kaufen","4を買う"],
  ["kennen","4を知っている"],
  ["kennenlernen","4を（はじめて）知る"],
  ["klopfen","叩く／4を叩く／an 4 klopfen：4を叩く"],
  ["kochen","4を煮る／4を沸かす／4を料理する／煮える／沸く／料理をする"],
  ["kommen","来る／生じる／in 4 kommen：4に入る／von 3 kommen：3に由来する／zu 3 kommen：3に至る／zu 3 kommen：3を手に入れる／es kommt zu 3：3になる"],
  ["kosten","（費用、労力が）かかる／4を要する／4を失わせる／4を味わう"],
  ["lächeln","微笑む／über 4 lächeln：4を冷笑する"],
  ["lachen","笑う／über 4 lachen：4を嘲笑する"],
  ["laufen","走る／歩く／動く"],
  ["leben","生きる／für 4 leben：4のために生きる／von 3 leben：3によって生きる"],
  ["legen","4を横たえる／4を置く／sich legen：横たわる"],
  ["lehren","4に4を教える"],
  ["lernen","4を学ぶ／4を習う／4を覚える"],
  ["lesen","4を読む"],
  ["lieben","4を愛する／4を好む"],
  ["liegen","横たわっている／ある／an 3 liegen：3のせいである／an 3 liegen：3次第である"],
  ["loben","4をほめる"],
  ["machen","4をつくる／4をする／4 形 machen：4を形にする／4 zu 3 machen：4を3にする"],
  ["malen","4を（絵で）描く"],
  ["meinen","4と思う／4（の事を）言う"],
  ["nehmen","4を取る／4 auf sich nehmen：4を引き受ける／4 zu sich nehmen：4を引き取る／4 für 4 nehmen：4を4とみなす"],
  ["nennen","4を4と名づける／4を4と呼ぶ／4の名を挙げる"],
  ["öffnen","4を開ける／4を開く／sich öffnen：開く／sich öffnen：開かれる"],
  ["prüfen","4を検査する／4を試験する"],
  ["rauchen","煙草を吸う／煙を出す／4を吸う"],
  ["rechnen","計算する／auf 4 rechnen：4を当てにする／mit 3 rechnen：3を計算に入れる／zu 3 rechnen：3に数えられる"],
  ["reden","語る／über 4 reden：4について語る"],
  ["regnen","雨が降る"],
  ["reisen","旅行する"],
  ["reiten","馬に乗る／馬に乗って行く"],
  ["reizen","4を刺激する／4を怒らせる／4を魅惑する"],
  ["retten","4を救う"],
  ["rufen","叫ぶ、呼ぶ／nach 3 rufen：3を呼ぶ"],
  ["ruhen","休む／止まっている"],
  ["sagen","4を言う／4と言う"],
  ["schaffen","4を創り出す／4を作り出す／4をなす／働く"],
  ["schauen","見る／4 schauen：4を見る"],
  ["scheinen","輝く／zu 不定詞 scheinen：不定詞であるように見える／形 scheinen：形のように見える"],
  ["schenken","3に4を贈る"],
  ["schicken","3に4を送る／4を行かせる"],
  ["schlafen","眠る"],
  ["schlagen","4を打つ"],
  ["schließen","4を閉じる、4を閉める／4を終わらせる／4を結ぶ／4を結論する"],
  ["schmecken","〜の味がする／4を味わう"],
  ["schmücken","4を飾る"],
  ["schneiden","4を切る"],
  ["schneien","雪が降る"],
  ["schreiben","4を書く／書ける"],
  ["schreien","叫ぶ"],
  ["schweigen","黙っている"],
  ["schwimmen","泳ぐ／浮かぶ"],
  ["sehen","4を見る／4と会う"],
  ["sein","存在する（いる、ある）／1・形 sein：1・形である／zu 不定詞 sein：不定詞され得る／zu 不定詞 sein：不定詞されるべきである"],
  ["senden","3に4を送る／4を放送する"],
  ["setzen","4を座らせる／4を置く／sich setzen：座る"],
  ["singen","歌う／4を歌う"],
  ["sinken","沈む／下がる"],
  ["sitzen","座っている"],
  ["sorgen","心配する／für 4 sorgen：4を心配する／für 4 sorgen：4を調達する／für 4 sorgen：4を引き起こす／sich um 4 sorgen：4を心配する"],
  ["sprechen","話す／4 sprechen：4を話す"],
  ["springen","跳ぶ"],
  ["stehen","立っている"],
  ["steigen","登る／上がる"],
  ["stellen","4を立てる、4を置く／sich stellen：立つ"],
  ["sterben","死ぬ／an 3 sterben：3で死ぬ"],
  ["studieren","（大学で）学ぶ／4を学ぶ"],
  ["suchen","4をさがす／nach 3 suchen：3をさがす／zu 不定詞 suchen：不定詞しようと努める"],
  ["tanzen","踊る／4を踊る"],
  ["teilen","4を分ける／4 mit 3 teilen：4を3と分け合う"],
  ["teilnehmen","参加する／an 3 teilnehmen：3に参加する"],
  ["töten","4を殺す"],
  ["tragen","4を運ぶ／4を支える／4を身につけている"],
  ["träumen","夢を見る／4を夢にみる／von 3 träumen：3を夢にみる"],
  ["treffen","4に当てる／4に当たる／4に出会う"],
  ["treiben","4を駆り立てる／4を動かす／漂う"],
  ["trennen","4を分ける／4 von 3 trennen：4を3から分ける"],
  ["treten","歩む／踏む"],
  ["trinken","4を飲む"],
  ["tun","4をする／振舞う／作用する／es mit 3 zu tun haben：3に関わる"],
  ["üben","4を練習する／練習する"],
  ["übersetzen","4を翻訳する"],
  ["vergessen","4を忘れる"],
  ["verkaufen","4を売る"],
  ["verlieren","4を失う"],
  ["versprechen","3に4を約束する"],
  ["verstehen","4を理解する／zu 不定詞 verstehen：不定詞する術を心得ている"],
  ["vorstellen","4を紹介する／4を表す／sich 4 vorstellen：4を想像する"],
  ["wachen","起きている／über 4 wachen：4を見張っている"],
  ["wachsen","成長する／増す／an 3 wachsen：3を増す"],
  ["wandern","歩き回る／移動する"],
  ["warten","待つ／auf 4 warten：4を待つ"],
  ["waschen","4を洗う／sich waschen：体を洗う／sich 4 waschen：4を洗う"],
  ["wecken","4を起こす／4を呼び起こす"],
  ["weinen","泣く"],
  ["werden","1・形 werden：1・形になる／werden：生じる／zu 3 werden：（変化して）3になる／3（zuteil）werden：3に与えられる"],
  ["werfen","4を投げる"],
  ["wiedersehen","4と再会する"],
  ["wissen","4を知っている／zu 不定詞 wissen：不定詞する術を心得ている"],
  ["wohnen","住む／泊まる"],
  ["wundern","4を驚かせる／sich über 4 wundern：4に驚く"],
  ["wünschen","4を望む"],
  ["zahlen","4を支払う"],
  ["zählen","4を数える／zu 3 zählen：3に数えられる"],
  ["zeichnen","4を（線で）描く"],
  ["zeigen","4を見せる／4を示す"],
  ["zerstören","4を破壊する"],
  ["ziehen","4を引く／移動する"],
  ["zumachen","4を閉める、4を閉じる"],
  ["zweifeln","疑う／an 3 zweifeln：3を疑う"],
  ["zwingen","4を強いる／4 zu 3 zwingen：4に3を強いる"]
];

function germanQuizMeaning(fullMeaning) {
  const parts = fullMeaning
    .split(/[。／]/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(part => {
      if (/[A-Za-zÄÖÜäöüß]/.test(part)) {
        const colon = part.lastIndexOf("：");
        return colon >= 0 ? part.slice(colon + 1).trim() : "";
      }
      return part;
    })
    .filter(Boolean);

  return [...new Set(parts)].join("／");
}

function germanDistractors(i, mode) {
  const targetMeaning = germanQuizMeaning(GERMAN_VERBS[i][1]);
  const result = [];
  const seenMeanings = new Set([targetMeaning]);

  const order = [];
  for (let d = 1; d < GERMAN_VERBS.length; d++) {
    order.push(i - d, i + d);
  }

  for (const j of order) {
    if (j < 0 || j >= GERMAN_VERBS.length || j === i || result.includes(j)) continue;

    const candidateMeaning = germanQuizMeaning(GERMAN_VERBS[j][1]);

    if (mode === "de-ja" && seenMeanings.has(candidateMeaning)) continue;
    if (mode === "ja-de" && candidateMeaning === targetMeaning) continue;

    result.push(j);
    seenMeanings.add(candidateMeaning);

    if (result.length === 3) break;
  }

  return result;
}

/* ===== 日本語 → ドイツ語：200問 ===== */
const GERMAN_JA_TO_DE = GERMAN_VERBS.map(([verb, fullMeaning], i) => {
  const meaning = germanQuizMeaning(fullMeaning);
  const candidates = germanDistractors(i, "ja-de");
  const correctPos = (i * 3 + 1) % 4;

  const o = candidates.map(j => GERMAN_VERBS[j][0]);
  o.splice(correctPos, 0, verb);

  return {
    id: `ger-jd-${String(i + 1).padStart(3, "0")}`,
    subject: "german",
    c: 1,
    s: "基本動詞200",
    n: i + 1,
    d: "A",
    type: "choice",
    q: `「${meaning}」に当たるドイツ語の基本動詞を選びなさい。`,
    o,
    a: [correctPos + 1],
    e: `${verb}：${fullMeaning}`
  };
});

/* ===== ドイツ語 → 日本語：200問 ===== */
const GERMAN_DE_TO_JA = GERMAN_VERBS.map(([verb, fullMeaning], i) => {
  const meaning = germanQuizMeaning(fullMeaning);
  const candidates = germanDistractors(i, "de-ja");
  const correctPos = (i * 3 + 2) % 4;

  const o = candidates.map(j =>
    germanQuizMeaning(GERMAN_VERBS[j][1])
  );

  o.splice(correctPos, 0, meaning);

  return {
    id: `ger-dj-${String(i + 1).padStart(3, "0")}`,
    subject: "german",
    c: 1,
    s: "基本動詞200",
    n: i + 201,
    d: "A",
    type: "choice",
    q: `ドイツ語「${verb}」の意味として最も適切なものを選びなさい。`,
    o,
    a: [correctPos + 1],
    e: `${verb}：${fullMeaning}`
  };
});

/* 基本動詞200 × 2方向 = 400問 */
const GERMAN_Q = [
  ...GERMAN_JA_TO_DE,
  ...GERMAN_DE_TO_JA
];


window.__TANGO_SUBJECTS = window.__TANGO_SUBJECTS || {};
window.__TANGO_SUBJECTS.german = [...GERMAN_Q];
