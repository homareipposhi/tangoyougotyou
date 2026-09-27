/* 基礎公式。記号の向きと成立条件を各設問に明記する。 */
registerQuestionPack({subject:"physics",name:"物理",chapters:{1:"力学"},questions:[
  {id:"phy-formula-mech-101",subject:"physics",c:1,s:"公式",n:5101,d:"A",type:"choice",rta:"formula",
   q:"慣性系で、質量が一定の物体に働く合力と加速度の関係は？",o:["F合=ma","F合=mv","F合=ma²","F合=m/a"],a:[1],
   e:"運動方程式は合力F合=ma。個々の力を一つずつmaに等置するのではない。"},
  {id:"phy-formula-mech-102",subject:"physics",c:1,s:"公式",n:5102,d:"A",type:"choice",rta:"formula",
   q:"物体が受ける合力の力積と運動量の変化を結ぶ式は？",o:["∫F合 dt=Δp","∫F合 dt=Δx","∫F合 dt=ΔK","∫F合 dt=ΔU"],a:[1],
   e:"合力を時間で積分した力積は運動量の変化に等しい。衝突中も外力の力積を区別する。"},
  {id:"phy-formula-mech-103",subject:"physics",c:1,s:"公式",n:5103,d:"B",type:"choice",rta:"formula",
   q:"一直線上で位置によって変わる力の、位置x₁からx₂までの仕事は？",o:["W=∫[x₁→x₂] Fₓ dx","W=∫[x₁→x₂] Fₓ dt","W=Fₓ/(x₂−x₁)","W=∫[x₁→x₂] x dFₓ"],a:[1],
   e:"進行方向の力の成分Fₓを変位で積分する。力が一定のときだけW=Fₓ(x₂−x₁)に簡約できる。"},
  {id:"phy-formula-mech-104",subject:"physics",c:1,s:"公式",n:5104,d:"A",type:"choice",rta:"formula",
   q:"自然長からの伸びをx、ばね定数をkとした理想ばねの弾性エネルギーは？",o:["U=½kx²","U=kx","U=½k²x","U=k/x²"],a:[1],
   e:"ばねの復元力の大きさは伸びに比例する。自然長をエネルギーの基準にするとU=½kx²。"}
]});
