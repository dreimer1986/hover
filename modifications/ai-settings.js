/* AI difficulty is independent of the player's chosen craft. */
(function(){
 'use strict';
 const t=(de,en)=>hoverLocale.lang==='de'?de:en;
 const levels={easy:{speed:200,turnSpeed:65},normal:{speed:300,turnSpeed:80},hard:{speed:360,turnSpeed:90}};
 const label=document.createElement('label');label.textContent=t('KI-Stärke','AI difficulty');
 const select=document.createElement('select');select.id='modern-ai';
 for(const [value,name] of [['easy',t('Leicht','Easy')],['normal','Normal'],['hard',t('Schwer','Hard')]])select.add(new Option(name,value));
 try{select.value=localStorage.getItem('hover-ai-difficulty')||'normal';}catch(_){}if(!levels[select.value])select.value='normal';
 select.onchange=()=>{try{localStorage.setItem('hover-ai-difficulty',select.value);}catch(_){}};
 label.append(select);HoverEnhanced.controls.get('enhanced-single-options').append(label);HoverEnhanced.controls.set('modern-ai',select);
 const proto=Hover.views.GameView.prototype,initialize=proto.initialize;
 proto.initialize=function(){if(!levels[this.options.aiDifficulty])this.options.aiDifficulty=select.value;return initialize.call(this);};
 window.HoverAI={levels,selected:()=>select.value};
})();
