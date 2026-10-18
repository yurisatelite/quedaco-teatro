import {ID,required,uid,placeBet} from './model.mjs';
export const CLASSES=['Combatente','Especialista','Ocultista'];
export const physicalTypes=new Set(['weapon','armor','clothing','equipment','consumable','loot']);
// Skyfall calls its threat document type "npc". Social NPCs use character sheets.
export function eligibleNpc(actor){return actor?.type==='character'&&!actor.hasPlayerOwner;}
export function ownedCharacter(actor,user){return actor?.type==='character'&&actor.testUserPermission(user,'OWNER');}
export function characterSummary(actor){const items=Array.from(actor.items??[]);const classItem=items.find(i=>i.type==='class'&&i.system?.initial)??items.find(i=>i.type==='class');return {id:actor.id,uuid:actor.uuid,name:actor.name,img:actor.img,type:actor.type,player:Boolean(actor.hasPlayerOwner),className:String(classItem?.name??actor.system?.characterClass??''),cash:Number(actor.system?.currency?.p??0),items:items.filter(i=>physicalTypes.has(i.type)).map(i=>({id:i.id,name:i.name,type:i.type,img:i.img,price:Number(i.system?.price??0),quantity:Number(i.system?.quantity??1)}))};}
export async function processMemberRequest(state,input,{game,user,requestId}){
  state.memberships??=[];state.invitations??=[];state.enrollments??=[];state.memberRequests??=[];
  if(state.memberRequests.includes(requestId))return;
  const actor=game.actors.get(input.actorId);
  if(!ownedCharacter(actor,user))throw Error('Selecione um personagem que pertence a você.');
  let member=state.memberships.find(m=>m.actorId===actor.id);
  if(input.action==='register'){
    if(!CLASSES.includes(input.role))throw Error('Selecione Combatente, Especialista ou Ocultista.');
    if(!member){
      const paid=actor.flags?.[ID]?.registrationPaid;
      const cash=Number(actor.system?.currency?.p);
      if(!paid){if(!Number.isSafeInteger(cash)||cash<10)throw Error('Você precisa de 10 pilas na ficha para se inscrever.');await actor.update({'system.currency.p':cash-10,[`flags.${ID}.registrationPaid`]:true});}
      member={actorId:actor.id,userId:user.id,name:actor.name,img:actor.img,role:input.role,paid:10,joinedAt:Date.now()};state.memberships.push(member);state.registrationIncome=Number(state.registrationIncome??0)+10;
    }
  }else{
    if(!member)throw Error('Inscreva este personagem no Coliseu primeiro.');
    const teamFor=id=>state.teams.find(t=>t.members.some(m=>m.actorId===id));
    if(input.action==='create-team'){
      if(teamFor(actor.id))throw Error('Este personagem já pertence a uma equipe.');
      const name=required(input.name);if(state.teams.some(t=>t.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('Este nome de equipe já está em uso.');
      state.teams.push({id:uid(),name,ownerActorId:actor.id,open:true,visible:true,fame:0,sponsor:'',members:[{actorId:actor.id,name:actor.name,img:actor.img,role:member.role}]});
    }else if(input.action==='invite'){
      const team=teamFor(actor.id),target=state.memberships.find(m=>m.actorId===input.targetId);
      if(!team||team.ownerActorId!==actor.id||!target||teamFor(target.actorId))throw Error('Convite indisponível: escolha um inscrito sem equipe e use o capitão.');
      if(!state.invitations.some(i=>i.teamId===team.id&&i.actorId===target.actorId))state.invitations.push({id:uid(),teamId:team.id,actorId:target.actorId});
    }else if(input.action==='accept'||input.action==='decline'){
      const invite=state.invitations.find(i=>i.id===input.inviteId&&i.actorId===actor.id),team=state.teams.find(t=>t.id===invite?.teamId);
      if(!invite||!team)throw Error('Convite indisponível.');
      if(input.action==='accept'){if(teamFor(actor.id))throw Error('Você já pertence a uma equipe.');team.members.push({actorId:actor.id,name:actor.name,img:actor.img,role:member.role});}
      state.invitations=state.invitations.filter(i=>i.id!==invite.id);
    }else if(input.action==='enroll'){
      const event=state.events.find(e=>e.id===input.eventId&&e.visible&&e.status==='open');
      if(!event||!state.entries.some(e=>e.category==='game'&&e.name===event.game&&e.revealed))throw Error('Esta prova não está aberta para inscrição.');
      if(!state.enrollments.some(e=>e.eventId===event.id&&e.actorId===actor.id))state.enrollments.push({eventId:event.id,actorId:actor.id,name:actor.name});
    }else if(input.action==='item-bet'){
      const item=actor.items.get(input.itemId),quantity=Number(input.quantity),event=state.events.find(e=>e.id===input.eventId&&e.visible&&e.status==='open');
      if(!item||!physicalTypes.has(item.type)||item.flags?.quedaco?.narrativeProp||!Number.isSafeInteger(quantity)||quantity<1||quantity>Number(item.system.quantity)||!event||!state.entries.some(e=>e.category==='game'&&e.name===event.game&&e.revealed))throw Error('Escolha um item físico disponível e uma prova aberta.');
      if(item.system.equipped||item.system.attuned)throw Error('Desequipe e desvincule o item antes de apostá-lo.');
      const price=Number(item.system.price),stake=price*quantity;if(!Number.isSafeInteger(stake)||stake<1)throw Error('O item precisa ter um preço válido na ficha para ser aceito pela Casa.');
      placeBet(state,{eventId:event.id,bettor:actor.name,side:input.side,stake},requestId);
      const debit=item.flags?.[ID]?.itemDebits??[];
      if(!debit.includes(requestId))await item.update({'system.quantity':Number(item.system.quantity)-quantity,[`flags.${ID}.itemDebits`]:[...debit,requestId]});
      Object.assign(state.bets.at(-1),{actorId:actor.id,itemStake:{itemId:item.id,name:item.name,quantity,price}});
    }else if(input.action==='bet'){
      const stake=Number(input.stake),event=state.events.find(e=>e.id===input.eventId&&e.visible&&e.status==='open');
      if(!event||!state.entries.some(e=>e.category==='game'&&e.name===event.game&&e.revealed)||!Number.isSafeInteger(stake)||stake<1)throw Error('Escolha uma prova aberta e um valor inteiro em pilas.');
      const debits=Array.from(actor.flags?.[ID]?.betDebits??[]),alreadyPaid=debits.includes(requestId);
      const cash=Number(actor.system?.currency?.p);if(!Number.isSafeInteger(cash)||(!alreadyPaid&&cash<stake))throw Error('Saldo insuficiente.');
      placeBet(state,{eventId:event.id,bettor:actor.name,side:input.side,stake},requestId);
      if(!alreadyPaid)await actor.update({'system.currency.p':cash-stake,[`flags.${ID}.betDebits`]:[...debits,requestId]});
      state.bets.at(-1).actorId=actor.id;
    }else if(input.action==='claim'){
      const bets=state.bets.filter(b=>b.actorId===actor.id&&b.status!=='pending'&&b.payout>0&&!b.claimed);
      const total=bets.reduce((n,b)=>n+b.payout,0);if(!total)throw Error('Nenhum prêmio disponível.');
      const claimed=Array.from(actor.flags?.[ID]?.claimedBets??[]),fresh=bets.filter(b=>!claimed.includes(b.id));
      const payout=fresh.reduce((n,b)=>n+(b.itemStake?Math.max(0,b.payout-b.stake):b.payout),0);
      if(!Number.isSafeInteger(payout))throw Error('Prêmio fracionado: solicite a conversão ao mestre.');
      for(const bet of fresh.filter(b=>b.itemStake)){
        const item=actor.items.get(bet.itemStake.itemId);if(!item)throw Error(`A ficha não contém mais ${bet.itemStake.name}. O mestre precisa restaurar o item antes do resgate.`);
        const refunds=item.flags?.[ID]?.itemRefunds??[];
        if(!refunds.includes(bet.id))await item.update({'system.quantity':Number(item.system.quantity)+bet.itemStake.quantity,[`flags.${ID}.itemRefunds`]:[...refunds,bet.id]});
      }
      if(fresh.length)await actor.update({'system.currency.p':Number(actor.system.currency.p)+payout,[`flags.${ID}.claimedBets`]:[...claimed,...fresh.map(b=>b.id)]});
      bets.forEach(b=>b.claimed=true);
    }else throw Error('Ação indisponível.');
  }
  state.memberRequests.push(requestId);
}

// ChatMessage.user is persisted by Foundry. Never trust a userId supplied in flags.
export function connectMembership(store,{game,onChange=()=>{}}){
  let queue=Promise.resolve();
  const handler=message=>{
    if(!game.user.isGM)return;
    const leader=Array.from(game.users).filter(u=>u.active&&u.isGM).sort((a,b)=>a.id.localeCompare(b.id))[0];if(leader?.id!==game.user.id)return;
    const request=message.flags?.[ID]?.memberRequest;if(!request||message.flags?.[ID]?.memberResponse)return;
    queue=queue.then(async()=>{
      const user=message.author??message.user;if(!user?.id)return;
      try{await store.mutate(s=>processMemberRequest(s,request,{game,user,requestId:message.id}));await message.setFlag(ID,'memberResponse',{ok:true,text:'Solicitação concluída.'});if(store.published())await store.refreshMembers();onChange();}
      catch(error){await message.setFlag(ID,'memberResponse',{ok:false,text:error.message});}
    }).catch(error=>console.error(ID,error));
  };
  Hooks.on('createChatMessage',handler);
  Hooks.on('updateChatMessage',message=>{const response=message.flags?.[ID]?.memberResponse;if(response&&(message.author??message.user)?.id===game.user.id){ui.notifications[response.ok?'info':'error'](response.text);onChange();}});
  return async request=>{
    const gms=Array.from(game.users).filter(u=>u.active&&u.isGM);if(!gms.length)throw Error('É necessário um mestre conectado para confirmar a inscrição.');
    await foundry.documents.ChatMessage.create({content:'Solicitação ao Teatro dos Condenados.',whisper:[game.user.id,...gms.map(u=>u.id)],flags:{[ID]:{memberRequest:request}}});
  };
}
