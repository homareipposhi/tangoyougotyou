/* 基礎公式。磁束の向きと電圧の定義を問題文で固定する。 */
registerQuestionPack({subject:"physics",name:"物理",chapters:{4:"電磁気"},questions:[
  {id:"phy-formula-em-101",subject:"physics",c:4,s:"公式",n:5401,d:"A",type:"choice",rta:"formula",
   q:"電荷qが電場Eから受ける電気力をベクトルで表す式は？",o:["F=qE","F=E/q","F=q/E","F=qE²"],a:[1],
   e:"電気力は電荷と電場の積。qが負なら力の向きは電場と逆になる。"},
  {id:"phy-formula-em-102",subject:"physics",c:4,s:"公式",n:5402,d:"A",type:"choice",rta:"formula",
   q:"極板に蓄えた電荷の大きさQ、極板間電圧Vのコンデンサーの静電容量は？",o:["C=Q/V","C=QV","C=V/Q","C=Q/V²"],a:[1],
   e:"静電容量の定義はC=Q/V。正負の極板の電荷の大きさをQとする。"},
  {id:"phy-formula-em-103",subject:"physics",c:4,s:"公式",n:5403,d:"B",type:"choice",rta:"formula",
   q:"孤立したコンデンサーの電荷の大きさQと静電容量Cから、静電エネルギーUを表す式は？",o:["U=Q²/(2C)","U=Q²C/2","U=Q/(2C²)","U=2Q²/C"],a:[1],
   e:"静電エネルギーはQ²/(2C)。電荷一定で容量が増えるとエネルギーは減る。"},
  {id:"phy-formula-em-104",subject:"physics",c:4,s:"公式",n:5404,d:"B",type:"choice",rta:"formula",
   q:"向きを決めた一巻きの閉回路を貫く磁束Φが時間変化するとき、誘導起電力εは？",o:["ε=−dΦ/dt","ε=dΦ/dt","ε=−Φdt","ε=Φ/t²"],a:[1],
   e:"ファラデーの法則。負号は選んだ回路の向きと面の向きに対して、磁束の変化を妨げる向きを示す。"}
]});
