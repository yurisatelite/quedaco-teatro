import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,addEvent,settleEvent,publicState,ID} from '../src/model.mjs';
import {CATALOG} from '../src/catalog.mjs';
import {processMemberRequest,eligibleNpc} from '../src/membership.mjs';
function fixture(){
 const user={id:'u'},actors=new Map();
 for(const id of ['a','b'])actors.set(id,{id,name:id,type:'character',hasPlayerOwner:true,img:'portrait.webp',system:{currency:{p:50}},flags:{},testUserPermission:u=>u.id==='u',async update(data){for(const [path,value]of Object.entries(data)){let target=this;const parts=path.split('.');for(const key of parts.slice(0,-1))target=target[key]??=( {} );target[parts.at(-1)]=value;}}});
 return {state:initialState(CATALOG),game:{actors},user};
}
test('inscrição cobra uma vez, exige propriedade e bloqueia ações sem cadastro',async()=>{
 const f=fixture(),run=(input,id='r')=>processMemberRequest(f.state,input,{...f,requestId:id});
 await assert.rejects(()=>run({action:'create-team',actorId:'a',name:'Sol'}),/Inscreva/);
 await run({action:'register',actorId:'a',role:'Combatente'});await run({action:'register',actorId:'a',role:'Combatente'},'r2');
 assert.equal(f.game.actors.get('a').system.currency.p,40);assert.equal(f.state.memberships.length,1);
 await assert.rejects(()=>processMemberRequest(f.state,{action:'register',actorId:'b',role:'Ocultista'},{...f,user:{id:'intruso'},requestId:'bad'}),/pertence/);
});
test('convite exige capitão, aceite exige convidado e aposta debita e paga uma vez',async()=>{
 const f=fixture();let n=0;const run=input=>processMemberRequest(f.state,input,{...f,requestId:`r${n++}`});
 for(const actorId of ['a','b'])await run({action:'register',actorId,role:'Especialista'});
 await run({action:'create-team',actorId:'a',name:'Sol'});await run({action:'invite',actorId:'a',targetId:'b'});
 await run({action:'accept',actorId:'b',inviteId:f.state.invitations[0].id});assert.equal(f.state.teams[0].members.length,2);
 addEvent(f.state,{name:'Final',a:'Sol',b:'Lua',game:'Duelo do Anel',oddsA:2,oddsB:2},'ev');
 await run({action:'bet',actorId:'a',eventId:'ev',stake:10,side:0});assert.equal(f.game.actors.get('a').system.currency.p,30);
 settleEvent(f.state,'ev',0);await run({action:'claim',actorId:'a'});assert.equal(f.game.actors.get('a').system.currency.p,50);
 await assert.rejects(()=>run({action:'claim',actorId:'a'}),/Nenhum/);
 assert.doesNotMatch(JSON.stringify(publicState(f.state)),/claimedBets|betDebits|userId/);
});
test('patrocínio aceita NPC e rejeita ameaça e personagem de jogador',()=>{
 assert.equal(eligibleNpc({type:'npc'}),false);assert.equal(eligibleNpc({type:'character',hasPlayerOwner:false}),true);assert.equal(eligibleNpc({type:'threat'}),false);assert.equal(eligibleNpc({type:'character',hasPlayerOwner:true,flags:{[ID]:{npc:{}}}}),false);
});
test('aposta antiga de item ainda devolve na vitória e paga somente o lucro; novas são bloqueadas',async()=>{
 const f=fixture(),actor=f.game.actors.get('a');let n=0;
 const item={id:'gear',name:'Equipamento',type:'equipment',system:{price:5,quantity:2,equipped:false},flags:{},async update(data){for(const [path,value]of Object.entries(data)){let target=this;const parts=path.split('.');for(const key of parts.slice(0,-1))target=target[key]??={};target[parts.at(-1)]=value;}}};actor.items=new Map([['gear',item]]);
 const run=input=>processMemberRequest(f.state,input,{...f,requestId:`item-${n++}`});
 await run({action:'register',actorId:'a',role:'Combatente'});
 addEvent(f.state,{name:'Final',a:'Sol',b:'Lua',game:'Duelo do Anel',oddsA:2,oddsB:2},'ev');
 await assert.rejects(()=>run({action:'item-bet',actorId:'a',itemId:'gear',quantity:1,eventId:'ev',side:0}),/somente pilas/);
 item.system.quantity=1;f.state.bets.push({id:'old-item',eventId:'ev',actorId:'a',bettor:'a',side:0,stake:5,odds:2,status:'pending',payout:0,itemStake:{itemId:'gear',name:'Equipamento',quantity:1,price:5}});f.state.treasury+=5;
 assert.equal(item.system.quantity,1);assert.equal(actor.system.currency.p,40);
 settleEvent(f.state,'ev',0);await run({action:'claim',actorId:'a'});
 assert.equal(item.system.quantity,2);assert.equal(actor.system.currency.p,45);
 await assert.rejects(()=>run({action:'claim',actorId:'a'}),/Nenhum/);
});

test('limite de 100 é validado antes de debitar; classe vem da ficha e saldo público acompanha a aposta',async()=>{
 const f=fixture(),actor=f.game.actors.get('a');actor.system.currency.p=250;actor.items=[{type:'class',name:'Ocultista',system:{initial:true}}];let n=0;
 const run=input=>processMemberRequest(f.state,input,{...f,requestId:`limit${n++}`});
 await run({action:'register',actorId:'a',role:'Combatente'});assert.equal(f.state.memberships[0].role,'Ocultista');
 addEvent(f.state,{game:'Duelo do Anel',a:'Sol',b:'Lua',oddsA:2,oddsB:2},'ev');
 for(const stake of [101,1000,0,-1,1.5,NaN])await assert.rejects(()=>run({action:'bet',actorId:'a',eventId:'ev',side:0,stake}),/1 a 100/);
 assert.equal(actor.system.currency.p,240);assert.equal(f.state.bets.length,0);
 await run({action:'bet',actorId:'a',eventId:'ev',side:0,stake:100});assert.equal(actor.system.currency.p,140);assert.equal(publicState(f.state).memberships[0].cash,140);
 f.state.memberships=[];settleEvent(f.state,'ev',0);await run({action:'claim',actorId:'a'});assert.equal(actor.system.currency.p,340);
});

test('entrada em equipe NPC exige autorização e limite de cinco vale também no aceite',async()=>{
 const f=fixture();let n=0;const run=input=>processMemberRequest(f.state,input,{...f,requestId:`team${n++}`});
 for(const actorId of ['a','b'])await run({action:'register',actorId});
 const npcTeam={id:'npc-team',visible:true,members:[],allowPlayers:false};f.state.teams.push(npcTeam);
 await assert.rejects(()=>run({action:'join-team',actorId:'a',teamId:npcTeam.id}),/indisponível/);
 npcTeam.allowPlayers=true;await run({action:'join-team',actorId:'a',teamId:npcTeam.id});assert.equal(npcTeam.members.length,1);
 npcTeam.members.push(...[1,2,3,4].map(i=>({actorId:`npc${i}`})));f.state.invitations.push({id:'invite',teamId:npcTeam.id,actorId:'b'});
 await assert.rejects(()=>run({action:'accept',actorId:'b',inviteId:'invite'}),/cinco/);assert.equal(npcTeam.members.length,5);
});
