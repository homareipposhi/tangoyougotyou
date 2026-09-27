/* 基礎公式。波長・周期・角振動数・回折条件を分ける。 */
registerQuestionPack({subject:"physics",name:"物理",chapters:{3:"波動"},questions:[
  {id:"phy-formula-waves-101",subject:"physics",c:3,s:"公式",n:5301,d:"A",type:"choice",rta:"formula",
   q:"速さv、振動数f、波長λの関係は？",o:["v=fλ","v=f/λ","v=λ/f","v=f+λ"],a:[1],
   e:"波は一周期の間に一波長進む。速さは波長を周期で割った値、すなわちfλ。"},
  {id:"phy-formula-waves-102",subject:"physics",c:3,s:"公式",n:5302,d:"A",type:"choice",rta:"formula",
   q:"振動数fと周期Tの関係は？",o:["f=1/T","f=T","f=2πT","f=T²"],a:[1],
   e:"振動数は一秒あたりの周期の回数なので周期の逆数。"},
  {id:"phy-formula-waves-103",subject:"physics",c:3,s:"公式",n:5303,d:"B",type:"choice",rta:"formula",
   q:"振動数fに対応する角振動数ωは？",o:["ω=2πf","ω=f/(2π)","ω=2π/f","ω=f²"],a:[1],
   e:"一周期で位相が2π進むので、単位時間あたりの位相の進みは2πf。"},
  {id:"phy-formula-waves-104",subject:"physics",c:3,s:"公式",n:5304,d:"B",type:"choice",rta:"formula",
   q:"間隔dの回折格子へ垂直入射した光の主極大の条件は？ mを整数とする。",o:["d sinθ=mλ","d cosθ=mλ","d/ sinθ=mλ","d sinθ=λ/m"],a:[1],
   e:"隣り合うスリットを通る光の光路差d sinθが波長の整数倍なら強め合う。"}
]});
