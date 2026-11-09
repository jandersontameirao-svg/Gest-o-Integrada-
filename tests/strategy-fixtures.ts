export const fixtures={
 porter:[{id:'p1',tipo:'Rivalidade',intensidade:4,descricao:'Concorrência sintética'}],
 stakeholders:[{id:'s1',nome:'Parceiro sintético',poder:4,interesse:3,descricao:'Demonstração'}],
 vrio:[{id:'v1',nome:'Capacidade sintética',valioso:4,raro:4,imitavel:5,organizado:4}],
 bsc:['financeira','cliente','processos','aprendizado'].map(id=>({id,nome:id,icone:id,cor:'#22c55e',indicadores:[{id:'i-'+id,nome:'Indicador sintético',meta:100,atual:70}]})),
 okr:[{id:'o1',objetivo:'Objetivo sintético',keyResults:[1,2,3,4].map(i=>({id:'kr'+i,descricao:'Resultado sintético '+i,meta:100,atual:i*10}))}],
 swot:{forcas:[{id:'sw1',descricao:'Força sintética'}],fraquezas:[],oportunidades:[],ameacas:[]},
 pestel:[{id:'pe1',categoria:'Político',descricao:'Fator sintético',impacto:4,probabilidade:3}],
};
export const editedFixtures={
 porter:fixtures.porter.map(v=>({...v,descricao:'Concorrência revisada sintética'})),
 stakeholders:fixtures.stakeholders.map(v=>({...v,nome:'Parceiro revisado sintético'})),
 vrio:fixtures.vrio.map(v=>({...v,valioso:5})),
 bsc:fixtures.bsc.map(v=>({...v,indicadores:v.indicadores.map(i=>({...i,atual:81}))})),
 okr:fixtures.okr.map(v=>({...v,keyResults:v.keyResults.map(i=>({...i,atual:77}))})),
 swot:{...fixtures.swot,forcas:[{id:'sw1',descricao:'Força revisada sintética'}]},
 pestel:fixtures.pestel.map(v=>({...v,probabilidade:4})),
};
