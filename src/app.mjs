import {ID, TITLE, publicState, addEvent, addBettor, placeBet, recordBattle, recordDuel, settleEvent, startBattle, startDuel, required, amount, uid, escape as e} from './model.mjs';
import {renderView} from './view.mjs';
import {characterSummary,ownedCharacter,eligibleNpc} from './membership.mjs';
export function createTheatreApp(store) {
  return class TheatreApp extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {id:ID,classes:['quedaco-teatro'],window:{title:'QT.Title',icon:'fa-solid fa-masks-theater',resizable:true},position:{width:1120,height:790}};
    tab='overview'; category='place'; query=''; preview=false; notice=''; busy=false; dirty=false; revision=0;
    async _renderHTML() {
      const gm=game.user.isGM, published=store.published();
      const source=gm?store.read():null;
      this.revision=source?.revision;
      const actors=!this.preview?Array.from(game.actors ?? []).filter(actor=>gm||ownedCharacter(actor,game.user)).map(actor=>({...characterSummary(actor),npc:eligibleNpc(actor)})).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')):[];
      return renderView({state:gm?(this.preview?publicState(source):source):published,gm,preview:this.preview,tab:this.tab,category:this.category,query:this.query,notice:this.notice,published,actors});
    }
    _replaceHTML(result,content) {content.innerHTML=result;}
    _onRender(context,options) {
      super._onRender(context,options);
      for(const input of this.element.querySelectorAll('input[name="role"]')){
        const select=document.createElement('select');select.name='role';for(const role of ['Combatente','Especialista','Ocultista']){const option=document.createElement('option');option.value=role;option.textContent=role;select.append(option);}input.replaceWith(select);
      }
      const sponsorInput=this.element.querySelector('input[name="sponsor"]');
      if(sponsorInput){const select=document.createElement('select');select.name='sponsorActorId';const empty=document.createElement('option');empty.value='';empty.textContent='Sem patrocinador';select.append(empty);for(const actor of Array.from(game.actors??[]).filter(eligibleNpc)){const option=document.createElement('option');option.value=actor.id;option.textContent=actor.name;select.append(option);}sponsorInput.replaceWith(select);}
      this.listeners?.abort();this.listeners=new AbortController();const {signal}=this.listeners;
      const report=fn=>Promise.resolve().then(fn).catch(err=>{console.error(ID,err);ui.notifications.error(err.message);});
      this.element.addEventListener('click',event=>{
        const target=event.target.closest('[data-qt-action]');
        if(target)void report(()=>this.action(target));
      },{signal});
      this.element.addEventListener('submit',event=>{
        const form=event.target.closest('[data-qt-form]');
        if(!form)return;event.preventDefault();
        if(!form.reportValidity())return;
        void report(()=>this.submit(form));
      },{signal});
      this.element.addEventListener('input',event=>{
        if(event.target.matches('[data-qt-search]')) {
          this.query=event.target.value;
          // Search locally to preserve focus and avoid a render on every keystroke.
          for(const card of this.element.querySelectorAll('.qt-cards .qt-card'))card.hidden=!card.textContent.toLocaleLowerCase('pt-BR').includes(this.query.toLocaleLowerCase('pt-BR'));
        }else if(event.target.closest('form'))this.dirty=true;
      },{signal});
      this.element.addEventListener('change',event=>{if(event.target.closest('form'))this.dirty=true;},{signal});
      this.element.addEventListener('dragstart',event=>{
        const actorId=event.target.closest('[data-qt-actor-id]')?.dataset.qtActorId;if(!actorId)return;
        const actor=game.actors?.get(actorId);if(!actor)return;
        event.dataTransfer?.setData('text/plain',JSON.stringify({type:'Actor',uuid:actor.uuid}));
        event.dataTransfer.effectAllowed='copy';
      },{signal});
      this.dirty=false;
    }
    requireGM() {if(!game.user.isGM||this.preview)throw Error('Somente o mestre pode alterar o Teatro.');}
    async discard() {
      return !this.dirty||await foundry.applications.api.DialogV2.confirm({window:{title:'Alterações não salvas'},content:'<p>Descartar os campos ainda não salvos?</p>'});
    }
    async close(options={}) {if(!await this.discard())return this;this.listeners?.abort();return super.close(options);}
    async refreshPublication({show=false}={}) {
      if(game.user.isGM)return; // Never overwrite a GM form in progress.
      if(!store.published()){this.dirty=false;if(this.rendered)await this.close();return;}
      if(show||this.rendered)await this.render({force:true});
    }
    async action(target) {
      if(this.busy)return;
      this.busy=true;
      try {
        const {qtAction:action,id}=target.dataset;
        if(['tab','category','preview'].includes(action)) {
          if(!await this.discard())return;
          if(action==='tab')this.tab=id;
          if(action==='category'){this.category=id;this.query='';}
          if(action==='preview'){if(!game.user.isGM)return;this.preview=!this.preview;this.tab='overview';}
        }else if(action==='refresh-member') {await this.render({force:true});return;
        }else{
          this.requireGM();
          if(this.dirty)throw Error('Salve os campos do formulário antes de usar esta ação.');
          if(action==='publish') {await store.publish();this.notice='Cartaz publicado. A apresentação foi aberta para os jogadores conectados.';}
          else if(action==='withdraw') {await store.withdraw();this.notice='Apresentação fechada. Informações já vistas não podem ser desfeitas.';}
          else if(action==='open-actor') {const actor=game.actors?.get(target.dataset.actorId);if(!actor)throw Error('Actor indisponível.');actor.sheet?.render(true);return;}
          else if(action==='open-actor-folder') {ui.actors?.render(true);this.notice='Abra a pasta Teatro dos Condenados no diretório de Actors. Os NPCs podem ser arrastados dela para qualquer Cena.';}
          else if(action==='prepare-game-map') {
            const state=store.read(),gameId=target.dataset.gameId;const {prepareGameScene,openArena}=await import('./arena.mjs');
            this.notice='Criando a Cena-modelo do jogo.';await this.render({force:true});
            const result=await prepareGameScene(gameId,{game});await store.mutate(s=>{s.gameScenes[gameId]=result.sceneId;},state.revision);await openArena(result.sceneId,{game});
            this.notice='Mapa pronto e aberto. As notas de narração estão no card do jogo.';
          }else if(action==='open-game-map') {
            const sceneId=store.read().gameScenes?.[target.dataset.gameId];if(!sceneId)throw Error('Prepare a Cena-modelo deste jogo primeiro.');
            const {openArena}=await import('./arena.mjs');await openArena(sceneId,{game});
          }
          else if(action==='edit-entry') {await this.editEntry(id);}
          else if(action==='settle') {
            const winner=target.dataset.winner==='void'?'void':Number(target.dataset.winner);
            const event=store.read().events.find(ev=>ev.id===id);
            if(!event)throw Error('Espetáculo indisponível.');
            const yes=await foundry.applications.api.DialogV2.confirm({window:{title:'Confirmar resultado'},content:`<p>${e(event.name)}: ${winner==='void'?'anular e devolver todas as apostas':`vitória de ${e(event.sides[winner])}`}?</p><p>O lançamento financeiro só pode ser efetuado uma vez.</p>`});
            if(!yes)return;
            await store.mutate(s=>settleEvent(s,id,winner),this.revision);
          }else if(action==='start-battle'||action==='start-duel') {
            const event=store.read().events.find(row=>row.id===id);
            const setup=action==='start-duel'?event?.duel:event?.battle;
            if(!setup?.sceneId)throw Error('Prepare a arena e a escalação antes de iniciar a prova.');
            const {openArena}=await import('./arena.mjs');await openArena(setup.sceneId,{game});
            await store.mutate(s=>action==='start-duel'?startDuel(s,id):startBattle(s,id),this.revision);
          }else if(action==='prepare-arena') {
            const state=store.read(),event=state.events.find(row=>row.id===id);
            if(!event)throw Error('Batalha indisponível.');
            const {prepareArena}=await import('./arena.mjs');
            this.notice='Montando cena, Tokens e iniciativa da Batalha de Equipes.';await this.render({force:true});
            const result=await prepareArena(event,state,{game});
            await store.mutate(s=>{const row=s.events.find(item=>item.id===id);Object.assign(row.battle,{...result,phase:'prepared'});},state.revision);
            this.notice='Arena pronta: 6 Tokens posicionados e iniciativa rolada. Revise a cena e inicie quando quiser.';
          }else if(action==='prepare-duel') {
            const state=store.read(),event=state.events.find(row=>row.id===id);
            if(!event)throw Error('Duelo indisponível.');
            const {prepareDuelArena}=await import('./arena.mjs');
            this.notice='Montando o Anel: 2 Tokens posicionados e iniciativa sendo rolada.';await this.render({force:true});
            const result=await prepareDuelArena(event,{game,state});
            await store.mutate(s=>{const row=s.events.find(item=>item.id===id);Object.assign(row.duel,{...result,phase:'prepared'});},state.revision);
            this.notice='Anel pronto: duelistas posicionados e iniciativa rolada. Revise a cena e inicie quando quiser.';
          }else if(action==='open-arena') {
            const event=store.read().events.find(row=>row.id===id);
            const {openArena}=await import('./arena.mjs');await openArena(event?.battle?.sceneId??event?.duel?.sceneId,{game});
          }else if(action==='battle-point'||action==='battle-death') {
            await store.mutate(s=>recordBattle(s,id,target.dataset.side,action==='battle-point'?'point':'death'),this.revision);
          }else if(action.startsWith('duel-')) {
            await store.mutate(s=>recordDuel(s,id,target.dataset.side,action.slice(5)),this.revision);
          }else if(action==='incident') {
            const {INCIDENTS}=await import('./catalog.mjs');
            const roll=await new foundry.dice.Roll(`1d${INCIDENTS.length}`).evaluate();
            await store.mutate(s=>{s.incident=INCIDENTS[roll.total-1];},this.revision);
          }else if(action==='install-roster') {
            const {installCircuit}=await import('./roster.mjs');
            await store.mutate(s=>installCircuit(s),this.revision);
            this.notice='Circuito inicial instalado: 4 equipes, 16 apostadores e 8 pessoas de bastidor.';
          }else if(action==='create-roster-actors') {
            const {CREATOR_ID,createCircuitActors,applyCircuitActorLinks,organizeCircuitActors,synchronizeCircuitCompetitorTags}=await import('./roster.mjs');
            const creator=game.modules?.get(CREATOR_ID)?.api;
            const total=store.read().teams.reduce((count,team)=>count+team.members.length,0)+(store.read().bettors?.length??0)+(store.read().personnel?.length??0);
            const yes=await foundry.applications.api.DialogV2.confirm({window:{title:'Criar fichas do elenco'},content:`<p>O Criador de Personagens vai pré-validar e criar ${total} Actors nativos de Skyfall.</p><p>Fichas já vinculadas pelo mesmo modelo não serão duplicadas. Cada ficha receberá a tag <code>quedaco-teatro.npc</code>.</p>`});
            if(!yes)return;
            this.notice='Criando fichas pelo Criador de Personagens; isto pode levar alguns instantes.';
            await this.render({force:true});
            const result=await createCircuitActors(creator,{game});
            const current=store.read();
            await store.mutate(s=>applyCircuitActorLinks(s,result.linked),current.revision);
            await synchronizeCircuitCompetitorTags(store.read(),{game});
            await organizeCircuitActors(store.read(),{game});
            this.notice=`Elenco sincronizado: ${result.created} ficha(s) criada(s), ${result.existing} já existente(s). Organizado no diretório Actors › Teatro dos Condenados.${result.warnings?.length?` ${result.warnings.length} relação(ões) aguardam revisão.`:''}`;
          }else {
            await store.mutate(s=>{
              if(action==='reveal'){const row=s.entries.find(r=>r.id===id);if(row)row.revealed=!row.revealed;}
              if(action==='toggle-game'){const row=s.entries.find(r=>r.id===id&&r.category==='game');if(row)row.revealed=!row.revealed;}
              if(action==='event-visible'){const row=s.events.find(r=>r.id===id);if(row)row.visible=!row.visible;}
              if(action==='lock'){const row=s.events.find(r=>r.id===id);if(row?.status==='open')row.status='closed';}
              if(action==='team-visible'){const row=s.teams.find(r=>r.id===id);if(row)row.visible=!row.visible;}
              if(action==='fame'){const row=s.teams.find(r=>r.id===id);if(row)row.fame=Math.max(0,Math.min(100,row.fame+Number(target.dataset.delta)));}
              if(action==='contract-close'){const row=s.contracts.find(r=>r.id===id);if(row)row.closed=true;}
            },this.revision);
          }
        }
        this.dirty=false;await this.render({force:true});
      }finally{this.busy=false;}
    }
    async submit(form) {
      if(form.dataset.qtForm==='member'){
        if(this.busy)return;this.busy=true;
        try{const request=Object.fromEntries(new FormData(form));await this.sendMemberRequest(request);this.dirty=false;this.notice='Solicitação enviada ao mestre conectado.';await this.render({force:true});}finally{this.busy=false;}return;
      }
      this.requireGM();if(this.busy)return;this.busy=true;
      try {
        const data=new FormData(form),values=Object.fromEntries(data), action=form.dataset.qtForm;
        values.side0ActorIds=data.getAll('side0ActorIds');values.side1ActorIds=data.getAll('side1ActorIds');
        await store.mutate(async s=>{
          if(action==='event') {
            const teamA=s.teams.find(t=>t.id===values.teamA),teamB=s.teams.find(t=>t.id===values.teamB);
            if(teamA)values.a=teamA.name;if(teamB)values.b=teamB.name;
            values.a ||= 'Lado A'; values.b ||= 'Lado B';
            if(values.teamA&&values.teamA===values.teamB)throw Error('Uma equipe não pode enfrentar a si mesma.');
            addEvent(s,values);
          }
          if(action==='bet')placeBet(s,values);
          if(action==='bettor')addBettor(s,values);
          if(action==='team'){const sponsor=values.sponsorActorId?game.actors.get(values.sponsorActorId):null;if(sponsor&&!eligibleNpc(sponsor))throw Error('Patrocinadores devem ser NPCs; ameaças não são permitidas.');s.teams.push({id:uid(),name:required(values.name),sponsor:sponsor?.name??'',sponsorActorId:sponsor?.id??'',fame:0,visible:false,members:[]});}
          if(action==='team-member') {
            const team=s.teams.find(t=>t.id===values.teamId),actor=game.actors?.get(values.actorId);
            if(!team||!actor)throw Error('Equipe ou Actor indisponível.');
            if(s.teams.some(t=>t.members.some(m=>m.actorId===actor.id)))throw Error(`${actor.name} já está inscrito em uma equipe.`);
            team.members.push({actorId:actor.id,name:actor.name,role:required(values.role)});
            await actor.setFlag?.(ID,'competitor',{teamId:team.id,teamName:team.name,role:values.role,registeredAt:Date.now()});
          }
          if(action==='contract')s.contracts.push({id:uid(),name:required(values.name),party:required(values.party),debt:amount(values.debt),terms:values.terms,closed:false});
          if(action==='direction') {
            const crowd=amount(values.crowd);
            if(!Number.isInteger(crowd)||crowd>100000)throw Error('Público deve ser inteiro entre 0 e 100.000.');
            Object.assign(s,{crowd,mood:required(values.mood),currency:required(values.currency),announcement:values.announcement,notes:values.notes});
          }
        },this.revision);
        this.dirty=false;this.notice='Salvo na direção. Use “Mostrar para os jogadores” para atualizar o cartaz.';
        await this.render({force:true});
      }finally{this.busy=false;}
    }
    async editEntry(id) {
      const state=store.read(),row=state.entries.find(r=>r.id===id);
      if(!row)throw Error('Registro indisponível.');
      const result=await foundry.applications.api.DialogV2.prompt({window:{title:'Editar registro do dossiê'},content:`<label>Nome<input name="name" value="${e(row.name)}" required maxlength="200"></label><label>Texto para jogadores<textarea name="text" rows="6">${e(row.text)}</textarea></label><label>Segredos do mestre<textarea name="secret" rows="6">${e(row.secret)}</textarea></label>`,ok:{label:'Salvar registro',callback:(_event,button)=>Object.fromEntries(new FormData(button.form))}});
      if(result)await store.mutate(s=>Object.assign(s.entries.find(r=>r.id===id),{name:required(result.name),text:result.text,secret:result.secret}),state.revision);
    }
  };
}
