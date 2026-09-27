registerQuestionPack({
  subject:"physics",name:"物理",chapters:{2:"熱力学"},questions:[
    {id:"phy-rta-rec-thermo-001",subject:"physics",c:2,s:"条件判断",n:1301,d:"A",type:"choice",rta:"recognition",
     q:"気体が断熱変化する。熱力学第一法則で直ちに0と置く量は？",o:["気体が受け取る熱Q","気体のする仕事W","内部エネルギー変化ΔU","圧力変化Δp"],a:[1],
     e:"断熱は熱の出入りがない条件なのでQ=0。仕事や温度変化が0とは限らない。"},
    {id:"phy-rta-rec-thermo-002",subject:"physics",c:2,s:"条件判断",n:1302,d:"A",type:"choice",rta:"recognition",
     q:"ピストンが固定され、気体の体積が変わらない。気体が外部へする仕事Wは？",o:["W=0","W=pV","W=Q","W=ΔU"],a:[1],
     e:"体積仕事はW=∫p dV。定積ならdV=0なのでW=0。"},
    {id:"phy-rta-rec-thermo-003",subject:"physics",c:2,s:"条件判断",n:1303,d:"B",type:"choice",rta:"recognition",
     q:"一定量の理想気体が温度一定で変化する。内部エネルギー変化ΔUは？",o:["ΔU=0","ΔU=Q","ΔU=−W","ΔU=pV"],a:[1],
     e:"理想気体の内部エネルギーは温度だけで決まる。定温ならΔU=0。"}
  ]
});
