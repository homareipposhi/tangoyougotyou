/* 基礎公式。気体が外部へする仕事を正とする符号約束。 */
registerQuestionPack({subject:"physics",name:"物理",chapters:{2:"熱力学"},questions:[
  {id:"phy-formula-thermo-101",subject:"physics",c:2,s:"公式",n:5201,d:"A",type:"choice",rta:"formula",
   q:"物質量n、絶対温度Tの理想気体の状態方程式は？",o:["pV=nRT","pV=nR/T","p/V=nRT","pT=nRV"],a:[1],
   e:"一定量の理想気体では圧力pと体積Vの積がnRTに等しい。温度は絶対温度を使う。"},
  {id:"phy-formula-thermo-102",subject:"physics",c:2,s:"公式",n:5202,d:"A",type:"choice",rta:"formula",
   q:"熱Qを気体に与え、気体が外部へ仕事Wをした。内部エネルギーの変化は？",o:["ΔU=Q−W","ΔU=Q+W","ΔU=W−Q","ΔU=QW"],a:[1],
   e:"気体へ入る熱を正、気体が外へする仕事を正に取ると、熱力学第一法則はΔU=Q−W。"},
  {id:"phy-formula-thermo-103",subject:"physics",c:2,s:"公式",n:5203,d:"B",type:"choice",rta:"formula",
   q:"圧力pを保ちながらとは限らない準静的な体積変化で、気体が外へする仕事は？",o:["W=∫[V₁→V₂] p dV","W=∫[V₁→V₂] p dt","W=p/(V₂−V₁)","W=∫[V₁→V₂] V dp"],a:[1],
   e:"準静的な過程では微小仕事がp dV。圧力が途中で変わる場合は体積について積分する。"},
  {id:"phy-formula-thermo-104",subject:"physics",c:2,s:"公式",n:5204,d:"B",type:"choice",rta:"formula",
   q:"単原子分子理想気体の内部エネルギーを、物質量nと絶対温度Tで表す式は？",o:["U=(3/2)nRT","U=nRT","U=(1/2)nRT","U=(3/2)p/T"],a:[1],
   e:"単原子分子理想気体の内部エネルギーは並進運動のエネルギーの和で、U=3nRT/2。"}
]});
