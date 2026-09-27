/* 基礎公式。光電効果・物質波・半減期の条件を明記する。 */
registerQuestionPack({subject:"physics",name:"物理",chapters:{5:"原子"},questions:[
  {id:"phy-formula-atomic-101",subject:"physics",c:5,s:"公式",n:5501,d:"A",type:"choice",rta:"formula",
   q:"振動数fの光子一個のエネルギーは？ hをプランク定数とする。",o:["E=hf","E=h/f","E=f/h","E=h²f"],a:[1],
   e:"光子一個のエネルギーは振動数に比例し、比例係数がプランク定数h。"},
  {id:"phy-formula-atomic-102",subject:"physics",c:5,s:"公式",n:5502,d:"B",type:"choice",rta:"formula",
   q:"仕事関数W₀の表面に振動数fの光を当てた。電子が放出される場合の最大運動エネルギーは？",o:["K最大=hf−W₀","K最大=hf+W₀","K最大=W₀−hf","K最大=hf/W₀"],a:[1],
   e:"光子一個のエネルギーから電子を表面から取り出す最小エネルギーを引く。hfが仕事関数未満なら放出されない。"},
  {id:"phy-formula-atomic-103",subject:"physics",c:5,s:"公式",n:5503,d:"B",type:"choice",rta:"formula",
   q:"運動量の大きさpを持つ粒子のド・ブロイ波長は？",o:["λ=h/p","λ=hp","λ=p/h","λ=h/p²"],a:[1],
   e:"物質波の波長は運動量の大きさに反比例する。hはプランク定数。"},
  {id:"phy-formula-atomic-104",subject:"physics",c:5,s:"公式",n:5504,d:"B",type:"choice",rta:"formula",
   q:"初めにN₀個ある放射性核の半減期をTとすると、時刻tの未崩壊核数Nは？",o:["N=N₀(1/2)^(t/T)","N=N₀(1/2)^(T/t)","N=N₀(1/2)^(tT)","N=N₀−t/T"],a:[1],
   e:"時間Tごとに未崩壊核数が半分になる統計的法則。個々の核の崩壊時刻を決める式ではない。"}
]});
