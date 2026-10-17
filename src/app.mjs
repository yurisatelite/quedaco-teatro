import {ID, TITLE, publicState, addEvent, placeBet, settleEvent, required, amount, uid, escape as e} from './model.mjs';
import {renderView} from './view.mjs';
export function createTheatreApp(store) {
  return class TheatreApp extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {id:ID,classes:['quedaco-teatro'],window:{title:'QT.Title',icon:'fa-solid fa-masks-theater',resizable:true},position:{width:1120,height:790}};
    tab='overview'; category='place'; query=''; preview=false; notice=''; busy=false; dirty=false; revision=0;
    async _renderHTML() {
      const gm=game.user.isGM, published=store.published();
      const source=gm?store.read():null;
      this.revision=source?.revision;
      return renderView({state:gm?(this.preview?publicState(source):source):published,gm,preview:this.preview,tab:this.tab,category:this.category,query:this.query,notice:this.notice,published});
    }
    _replaceHTML(result,content) {content.innerHTML=result;}
    _onRender(context,options) {
      super._onRender(context,options);
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
        }else{
          this.requireGM();
          if(this.dirty)throw Error('Salve os campos do formulário antes de usar esta ação.');
          if(action==='publish') {await store.publish();this.notice='Cartaz publicado. A apresentação foi aberta para os jogadores conectados.';}
          else if(action==='withdraw') {await store.withdraw();this.notice='Apresentação fechada. Informações já vistas não podem ser desfeitas.';}
          else if(action==='edit-entry') {await this.editEntry(id);}
          else if(action==='settle') {
            const winner=target.dataset.winner==='void'?'void':Number(target.dataset.winner);
            const event=store.read().events.find(ev=>ev.id===id);
            if(!event)throw Error('Espetáculo indisponível.');
            const yes=await foundry.applications.api.DialogV2.confirm({window:{title:'Confirmar resultado'},content:`<p>${e(event.name)}: ${winner==='void'?'anular e devolver todas as apostas':`vitória de ${e(event.sides[winner])}`}?</p><p>O lançamento financeiro só pode ser efetuado uma vez.</p>`});
            if(!yes)return;
            await store.mutate(s=>settleEvent(s,id,winner),this.revision);
          }else if(action==='incident') {
            const {INCIDENTS}=await import('./catalog.mjs');
            const roll=await new foundry.dice.Roll(`1d${INCIDENTS.length}`).evaluate();
            await store.mutate(s=>{s.incident=INCIDENTS[roll.total-1];},this.revision);
          }else {
            await store.mutate(s=>{
              if(action==='reveal'){const row=s.entries.find(r=>r.id===id);if(row)row.revealed=!row.revealed;}
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
      this.requireGM();if(this.busy)return;this.busy=true;
      try {
        const values=Object.fromEntries(new FormData(form)), action=form.dataset.qtForm;
        await store.mutate(s=>{
          if(action==='event')addEvent(s,values);
          if(action==='bet')placeBet(s,values);
          if(action==='team')s.teams.push({id:uid(),name:required(values.name),sponsor:values.sponsor,fame:0,visible:false});
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
