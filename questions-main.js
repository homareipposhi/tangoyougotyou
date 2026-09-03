/* ===== 汎用問題データ =====
   subject: 科目ID
   c: 単元番号
   s: 小分類
   n: 問題番号（科目内で一意推奨）
   d: 難易度 A/B/C
   type: "tf" | "choice" | "input"
   a:
     tf     -> true / false
     choice -> 正解番号の配列（1始まり）
     input  -> answers:[...] または number + tolerance
*/

const SUBJECTS = {
  physics: {
    name: "物理",
    chapters: {
      1: "力学", 2: "熱力学", 3: "波動", 4: "電磁気", 5: "原子"
    }
  },
  earth: {
    name: "地学",
    chapters: {
      1: "地球", 2: "地質・地史", 3: "大気・海洋", 4: "宇宙"
    }
  },
  classics: {
    name: "古典",
    chapters: {
      1: "古文単語", 2: "文法", 3: "敬語", 4: "古文読解", 5: "漢文"
    }
  },
  german: {
    name: "ドイツ語",
    chapters: {
      1: "語彙", 2: "文法", 3: "語順・作文", 4: "読解"
    }
  }
};

const Q_ALL = [
  /* ---------- 物理 ---------- */
  {id:"phy-1",subject:"physics",c:1,s:"運動方程式",n:1,d:"A",type:"tf",
   q:"物体に働く合力が0なら、その物体の加速度は0である。",a:true,
   e:"運動方程式 F=ma より、合力Fが0なら加速度aも0。静止または等速直線運動になる。"},
  {id:"phy-2",subject:"physics",c:1,s:"運動方程式",n:2,d:"A",type:"choice",
   q:"質量2.0 kgの物体に6.0 Nの合力が働く。加速度はいくらか。",o:["1.0 m/s²","2.0 m/s²","3.0 m/s²","12 m/s²"],a:[3],
   e:"a=F/m=6.0/2.0=3.0 m/s²。"},
  {id:"phy-3",subject:"physics",c:1,s:"速度・加速度",n:3,d:"A",type:"choice",
   q:"位置xを時間tで1回微分した量として正しいものを選びなさい。",o:["速度","加速度","力","運動量"],a:[1],
   e:"v=dx/dt。位置の時間変化率が速度。"},
  {id:"phy-4",subject:"physics",c:1,s:"速度・加速度",n:4,d:"B",type:"input",
   q:"速度vを時間tで微分した量を、漢字2文字で答えなさい。",answers:["加速度"],aText:"加速度",
   e:"a=dv/dt なので、速度の時間変化率は加速度。"},
  {id:"phy-5",subject:"physics",c:1,s:"仕事とエネルギー",n:5,d:"B",type:"tf",
   q:"保存力だけが仕事をする場合、力学的エネルギーは保存される。",a:true,
   e:"非保存力による散逸がなければ、運動エネルギーと位置エネルギーの和は一定。"},
  {id:"phy-6",subject:"physics",c:1,s:"円運動",n:6,d:"B",type:"choice",
   q:"等速円運動をする物体の加速度の向きはどれか。",o:["接線方向","円の中心方向","円の外向き","速度と同じ向き"],a:[2],
   e:"速度の大きさは一定でも向きが変化するため、加速度は常に円の中心方向。"},
  {id:"phy-7",subject:"physics",c:2,s:"気体",n:7,d:"A",type:"tf",
   q:"理想気体の状態方程式は pV=nRT である。",a:true,
   e:"圧力p、体積V、物質量n、気体定数R、絶対温度Tの関係。"},
  {id:"phy-8",subject:"physics",c:2,s:"熱力学第一法則",n:8,d:"B",type:"choice",
   q:"気体が外部から熱Qを受け取り、外部へ仕事Wをしたとき、内部エネルギー変化ΔUはどれか。",o:["Q+W","Q-W","W-Q","-Q-W"],a:[2],
   e:"気体が外へした仕事をWとする約束では、ΔU=Q-W。"},
  {id:"phy-9",subject:"physics",c:3,s:"波",n:9,d:"A",type:"choice",
   q:"波の速さv、振動数f、波長λの関係として正しいものを選びなさい。",o:["v=fλ","v=f/λ","v=λ/f","v=f+λ"],a:[1],
   e:"1周期で1波長進むので v=fλ。"},
  {id:"phy-10",subject:"physics",c:4,s:"電場",n:10,d:"B",type:"tf",
   q:"正の試験電荷が受ける力の向きが、その点での電場の向きである。",a:true,
   e:"電場の向きは、正の試験電荷に働く力の向きで定義される。"},
  {id:"phy-11",subject:"physics",c:4,s:"コンデンサー",n:11,d:"B",type:"input",
   q:"電気容量C、電圧V、電気量Qの関係を Q= の形で答えなさい。",answers:["CV","C V","C×V","C*V"],aText:"CV",
   e:"コンデンサーでは Q=CV。"},
  {id:"phy-12",subject:"physics",c:5,s:"光電効果",n:12,d:"C",type:"tf",
   q:"光電効果では、入射光の振動数がしきい振動数より低ければ、光を強くしても光電子は放出されない。",a:true,
   e:"1個の光子のエネルギーhfが仕事関数を超える必要がある。強度を上げても光子1個あたりのエネルギーは増えない。"},

  /* ---------- 地学 ---------- */
  {id:"ear-1",subject:"earth",c:1,s:"地球内部",n:1,d:"A",type:"tf",
   q:"地球の外核は主に液体で、内核は主に固体である。",a:true,
   e:"外核は液体、内核は高圧のため固体と考えられている。"},
  {id:"ear-2",subject:"earth",c:1,s:"地震波",n:2,d:"A",type:"choice",
   q:"液体中を伝わらない地震波はどれか。",o:["P波","S波","表面波","どれも伝わる"],a:[2],
   e:"S波はせん断変形を伝える波なので液体中を伝わらない。"},
  {id:"ear-3",subject:"earth",c:1,s:"プレート",n:3,d:"B",type:"tf",
   q:"海洋プレートは、一般に中央海嶺付近で形成され、海溝付近で沈み込む。",a:true,
   e:"海洋底拡大により海嶺で形成され、収束境界の海溝で沈み込む。"},
  {id:"ear-4",subject:"earth",c:2,s:"地層",n:4,d:"A",type:"choice",
   q:"未変形の地層で、一般に下位ほど古いとする原理はどれか。",o:["地層累重の法則","斉一説","相対性原理","パスカルの原理"],a:[1],
   e:"地層累重の法則では、通常は下の地層ほど古い。"},
  {id:"ear-5",subject:"earth",c:2,s:"示準化石",n:5,d:"B",type:"tf",
   q:"示準化石は、地層が堆積した年代を推定する手がかりになる。",a:true,
   e:"生存期間が比較的短く広く分布した生物の化石は、年代対比に有効。"},
  {id:"ear-6",subject:"earth",c:3,s:"大気",n:6,d:"A",type:"choice",
   q:"対流圏では高度が上がるにつれて、気温は一般にどうなるか。",o:["上がる","下がる","一定","必ず0℃になる"],a:[2],
   e:"対流圏では高度とともに気温は一般に低下する。"},
  {id:"ear-7",subject:"earth",c:3,s:"コリオリの力",n:7,d:"B",type:"choice",
   q:"北半球で運動する空気は、進行方向に対してどちら向きに曲げられるか。",o:["右","左","上","下"],a:[1],
   e:"北半球ではコリオリの力により進行方向の右向きに偏向する。"},
  {id:"ear-8",subject:"earth",c:3,s:"海洋",n:8,d:"B",type:"tf",
   q:"黒潮は日本の南岸付近を流れる暖流である。",a:true,
   e:"黒潮は北太平洋西部を北上する代表的な暖流。"},
  {id:"ear-9",subject:"earth",c:4,s:"恒星",n:9,d:"A",type:"choice",
   q:"恒星の表面温度が高いほど、一般に何色寄りに見えるか。",o:["赤","青白","緑","黒"],a:[2],
   e:"高温の恒星ほど青白く、低温の恒星ほど赤く見える。"},
  {id:"ear-10",subject:"earth",c:4,s:"太陽系",n:10,d:"A",type:"input",
   q:"太陽系で最も大きい惑星を日本語で答えなさい。",answers:["木星"],aText:"木星",
   e:"太陽系最大の惑星は木星。"},

  /* ---------- 古典 ---------- */
  {id:"cla-1",subject:"classics",c:1,s:"古文単語",n:1,d:"A",type:"choice",
   q:"古文単語『をかし』の代表的な意味として最も適切なものを選びなさい。",o:["趣がある・すばらしい","恐ろしい","腹立たしい","眠い"],a:[1],
   e:"『をかし』は、趣がある・すばらしい・おもしろいなどの意味。"},
  {id:"cla-2",subject:"classics",c:1,s:"古文単語",n:2,d:"A",type:"input",
   q:"古文単語『いみじ』の代表的な意味を1つ答えなさい。",answers:["とても","たいそう","はなはだしい","すばらしい","ひどい"],aText:"とても／たいそう など",
   e:"『いみじ』は程度が甚だしいことを表し、文脈により『とてもすばらしい』『ひどい』などになる。"},
  {id:"cla-3",subject:"classics",c:2,s:"助動詞",n:3,d:"A",type:"choice",
   q:"助動詞『けり』の代表的な意味の組として適切なものを選びなさい。",o:["過去・詠嘆","推量・意志","打消・禁止","断定・存在"],a:[1],
   e:"『けり』は過去と詠嘆が中心。"},
  {id:"cla-4",subject:"classics",c:2,s:"助動詞",n:4,d:"B",type:"tf",
   q:"助動詞『まじ』には、打消推量・打消意志・不可能などの意味がある。",a:true,
   e:"『まじ』は否定的意味を持ち、打消推量・打消意志・不可能・禁止・当然の打消・不適当など。"},
  {id:"cla-5",subject:"classics",c:2,s:"助動詞",n:5,d:"B",type:"choice",
   q:"助動詞『む』が一人称主語で使われるとき、代表的に何を表すか。",o:["意志","過去","断定","打消"],a:[1],
   e:"一人称主語では意志、二人称では勧誘・適当、三人称では推量となることが多い。"},
  {id:"cla-6",subject:"classics",c:2,s:"係り結び",n:6,d:"A",type:"choice",
   q:"係助詞『ぞ・なむ・や・か』の結びは何形か。",o:["連体形","已然形","終止形","命令形"],a:[1],
   e:"ぞ・なむ・や・か → 連体形。こそ → 已然形。"},
  {id:"cla-7",subject:"classics",c:2,s:"係り結び",n:7,d:"A",type:"input",
   q:"係助詞『こそ』の結びの活用形を答えなさい。",answers:["已然形"],aText:"已然形",
   e:"『こそ』の結びは已然形。"},
  {id:"cla-8",subject:"classics",c:3,s:"敬語",n:8,d:"B",type:"choice",
   q:"尊敬語は、基本的に誰の動作を高める敬語か。",o:["動作主","話し手","聞き手","必ず作者"],a:[1],
   e:"尊敬語は動作主を高める。謙譲語は動作の受け手側を高める。"},
  {id:"cla-9",subject:"classics",c:3,s:"敬語",n:9,d:"B",type:"tf",
   q:"謙譲語は、話し手側の動作を低めることで、その動作が向かう相手を高める。",a:true,
   e:"謙譲語の基本構造。誰から誰への動作かを見る。"},
  {id:"cla-10",subject:"classics",c:4,s:"主語把握",n:10,d:"B",type:"tf",
   q:"古文では主語が省略されることが多いため、敬語や接続助詞も主語判断の手がかりになる。",a:true,
   e:"古文読解では敬語の方向、接続、人物関係などを使って主語を補う。"},
  {id:"cla-11",subject:"classics",c:1,s:"古文単語",n:11,d:"A",type:"choice",
   q:"古文単語『あはれなり』の意味として最も近いものを選びなさい。",o:["しみじみと心を動かされる","非常に速い","腹が減る","明るく輝く"],a:[1],
   e:"『あはれ』は、しみじみとした感動や情趣を表す。"},
  {id:"cla-12",subject:"classics",c:2,s:"助動詞",n:12,d:"B",type:"choice",
   q:"伝聞・推定の助動詞『なり』が接続する形として基本的に正しいものはどれか。",o:["終止形","未然形","連用形","命令形"],a:[1],
   e:"伝聞・推定の『なり』は原則として終止形接続。ラ変型には連体形接続。"},

  /* ---------- ドイツ語 ---------- */
  {id:"ger-1",subject:"german",c:1,s:"語彙",n:1,d:"A",type:"choice",
   q:"ドイツ語 Haus の意味として正しいものを選びなさい。",o:["家","本","机","学校"],a:[1],
   e:"das Haus = 家。"},
  {id:"ger-2",subject:"german",c:1,s:"語彙",n:2,d:"A",type:"input",
   q:"『本』を意味するドイツ語を、定冠詞なしで答えなさい。",answers:["Buch","buch"],caseSensitive:false,aText:"Buch",
   e:"Buch = 本。名詞なので通常は大文字で書く。"},
  {id:"ger-3",subject:"german",c:2,s:"格変化",n:3,d:"A",type:"choice",
   q:"Ich sehe ___ Mann. の空欄に入る定冠詞を選びなさい。",o:["der","den","dem","des"],a:[2],
   e:"sehen の目的語は4格。男性単数の4格は den。"},
  {id:"ger-4",subject:"german",c:2,s:"格変化",n:4,d:"A",type:"choice",
   q:"mit ___ Mann の空欄に入る定冠詞を選びなさい。",o:["der","den","dem","des"],a:[3],
   e:"mit は3格支配。男性単数3格は dem。"},
  {id:"ger-5",subject:"german",c:2,s:"動詞",n:5,d:"A",type:"input",
   q:"sein の一人称単数現在形を答えなさい。",answers:["bin"],aText:"bin",
   e:"ich bin, du bist, er/sie/es ist。"},
  {id:"ger-6",subject:"german",c:2,s:"動詞",n:6,d:"A",type:"choice",
   q:"Er ___ Deutsch. 『彼はドイツ語を話す』に入る語を選びなさい。",o:["spreche","sprichst","spricht","sprechen"],a:[3],
   e:"sprechen の3人称単数現在形は spricht。"},
  {id:"ger-7",subject:"german",c:3,s:"語順",n:7,d:"A",type:"tf",
   q:"ドイツ語の平叙文では、定動詞が原則として文の第2要素に置かれる。",a:true,
   e:"主文の基本はV2語順。第1要素は主語とは限らない。"},
  {id:"ger-8",subject:"german",c:3,s:"語順",n:8,d:"B",type:"choice",
   q:"Heute ___ ich Deutsch. に入る語を選びなさい。",o:["lerne","ich lerne","Deutsch lerne","lernen"],a:[1],
   e:"Heute が第1要素なので、定動詞 lerne が第2要素、その後に主語 ich。"},
  {id:"ger-9",subject:"german",c:2,s:"従属文",n:9,d:"B",type:"tf",
   q:"weil で始まる従属文では、定動詞は基本的に文末に置かれる。",a:true,
   e:"weil, dass などの従属接続詞では定動詞が後置される。"},
  {id:"ger-10",subject:"german",c:2,s:"完了形",n:10,d:"B",type:"choice",
   q:"Ich habe das Buch ___. 『私はその本を読んだ』に入る過去分詞を選びなさい。",o:["lesen","gelesen","las","liest"],a:[2],
   e:"lesen の過去分詞は gelesen。haben + 過去分詞で現在完了形。"},
  {id:"ger-11",subject:"german",c:3,s:"作文",n:11,d:"B",type:"input",
   q:"『私は学生です。』をドイツ語で答えなさい。",answers:["Ich bin Schüler.","Ich bin Schueler.","Ich bin Schüler","Ich bin Schueler"],caseSensitive:false,aText:"Ich bin Schüler.",
   e:"ich + sein の現在形 bin。Schüler は男性の『生徒・学生』。"},
  {id:"ger-12",subject:"german",c:4,s:"読解",n:12,d:"B",type:"choice",
   q:"Morgen fahre ich nach Kyoto. の意味として最も適切なものを選びなさい。",o:["私は明日京都へ行く。","私は昨日京都へ行った。","京都は明日休みだ。","私は京都から帰る。"],a:[1],
   e:"Morgen=明日、fahren=行く・乗り物で移動する、nach Kyoto=京都へ。"}
,
  {id:"phy-13",subject:"physics",c:1,s:"運動方程式",n:13,d:"A",type:"input",
   q:"質量2.0 kgの物体に6.0 Nの合力が働く。加速度の数値だけを答えなさい。",number:3,tolerance:0.001,unit:"m/s²",aText:"3",
   e:"a=F/m=6.0/2.0=3.0 m/s²。"},

  {id:"cla-13",subject:"classics",c:5,s:"返り点",n:13,d:"A",type:"choice",
   q:"漢文の訓読で、レ点が示す基本的な読み方として適切なものを選びなさい。",o:["直後の一字を先に読んで戻る","文末から逆順にすべて読む","その字を読まない","必ず二字飛ばして読む"],a:[1],
   e:"レ点は、下の一字を先に読んでから上の字へ戻ることを示す。"},
  {id:"cla-14",subject:"classics",c:5,s:"再読文字",n:14,d:"B",type:"choice",
   q:"『未』を再読文字として読むときの基本形として正しいものを選びなさい。",o:["いまだ〜ず","まさに〜べし","すべからく〜べし","あへて〜ず"],a:[1],
   e:"未は『いまだ〜ず』と再読する。"},
  {id:"cla-15",subject:"classics",c:5,s:"否定",n:15,d:"A",type:"input",
   q:"漢文の否定形『不〜』を、ひらがなで基本的にどう読むか答えなさい。",answers:["〜ず","ず","～ず"],aText:"〜ず",
   e:"不は基本的に『〜ず』と訓読して否定を表す。"}
];
