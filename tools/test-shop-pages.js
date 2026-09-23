const fs=require('fs'), vm=require('vm');
const RACINE=require('path').join(__dirname,'..')+'/';

function creerEnv(search, page, memPartagee){
  const store = { 'bt_panier_v1': localStorage0 };
  function localStorage0(){}
  const mem = memPartagee || {};
  const listeners = {};           // document listeners
  const els = {};                 // registry d'éléments par id

  function el(id){
    const e = {
      id, innerHTML:'', textContent:'', value:'', checked:false, style:{}, children:[],
      _ev:{},
      addEventListener(t,f){ (this._ev[t]=this._ev[t]||[]).push(f); },
      querySelector(){ return el(id+'-q'); }, querySelectorAll(){ return []; },
      classList:{ _s:new Set(), add(...c){c.forEach(x=>this._s.add(x))}, remove(...c){c.forEach(x=>this._s.delete(x))},
                  toggle(c,f){ f===undefined? (this._s.has(c)?this._s.delete(c):this._s.add(c)) : (f?this._s.add(c):this._s.delete(c)) },
                  contains(c){return this._s.has(c)} },
      setAttribute(k,v){this['_'+k]=v}, getAttribute(k){ return this['_'+k]!==undefined?this['_'+k]:null },
      closest(){ return null }, matches(){ return false }, remove(){}, appendChild(c){this.children.push(c);return c},
      getBoundingClientRect(){return {top:0}}, offsetWidth:0, scrollIntoView(){},
      click(){ (this._ev.click||[]).forEach(f=>f({target:this})); }
    };
    return e;
  }
  function getEl(id){ if(!els[id]) els[id]=el(id); return els[id]; }

  const document = {
    readyState:'complete', title:'', body: Object.assign(el('body'), { dataset:{ page: page } }),
    documentElement: Object.assign(el('html'), { scrollHeight:2000 }),
    addEventListener(t,f){ (listeners[t]=listeners[t]||[]).push(f); },
    getElementById:getEl,
    querySelector(sel){ return el(sel); },
    querySelectorAll(){ return []; },
    createElement(){ return el('tmp'); }
  };
  const location = { href:'', search:search, replace(u){ this.href=u; } };
  const ctx = {
    console, document, location, setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame:f=>f(), URLSearchParams, Date, Math, JSON, Object, Array, String, Number,
    Boolean, parseInt, parseFloat, isNaN, RegExp, Error, confirm:()=>true,
    localStorage:{ getItem:k=> (k in mem? mem[k]:null), setItem:(k,v)=>{mem[k]=String(v)}, removeItem:k=>{delete mem[k]} },
    matchMedia:()=>({matches:false}),
    window:{ addEventListener(){}, scrollY:0, innerHeight:900, matchMedia:()=>({matches:false}), scrollTo(){} }
  };
  ctx.globalThis = ctx; ctx.window.document = document; ctx.window.localStorage = ctx.localStorage;
  vm.createContext(ctx);
  return { ctx, document, els, getEl, listeners, mem, fire(t,fake){ (listeners[t]||[]).forEach(h=>h(fake)); } };
}

function charger(env){
  for (const f of ['js/shop-data.js','js/shop-pages.js'])
    vm.runInContext(fs.readFileSync(RACINE+f,'utf8'), env.ctx, {filename:f});
  env.fire('DOMContentLoaded', {});
}
function clic(env, map){ env.fire('click', { preventDefault(){}, target: { closest: sel => map[sel] || null, id:'' } }); }
function attrs(o){ return { getAttribute:k=>o[k]!==undefined?o[k]:null }; }

const T=(n,f)=>{ try{ const r=f(); console.log((r===false?'✗':'✓')+' '+n); return r!==false; }catch(e){ console.log('✗ '+n+' → '+e.message); return false; } };

/* ─────────── PAGE LISTE ─────────── */
{
  const env = creerEnv('?cat=%C3%89lectronique', 'liste'); charger(env);
  T('liste : filtre catégorie Électronique (7 produits)', ()=>{
    const h = env.getEl('plist').innerHTML;
    if(!h.includes('Téléphone mobile 4G')) throw new Error('produit attendu absent');
    if(h.includes('Machine à laver')) throw new Error('produit hors catégorie');
    if((h.match(/class="card rv/g)||[]).length !== 7) throw new Error('nb cartes = '+(h.match(/class="card rv/g)||[]).length);
    return true; });
  T('liste : markup de carte identique au template', ()=>{
    const h = env.getEl('plist').innerHTML;
    for(const sel of ['class="thumb"','class="off"','class="fav"','class="body"','class="name"','class="was"','class="price"','class="add"','<use href="#i-phone"'])
      if(!h.includes(sel)) throw new Error('élément manquant : '+sel);
    return true; });
  T('liste : titre + compteur', ()=>{
    if(env.getEl('titre').textContent!=='Électronique') throw new Error(env.getEl('titre').textContent);
    if(!env.getEl('count').innerHTML.includes('<b>7</b>')) throw new Error(env.getEl('count').innerHTML);
    return true; });
  T('liste : chips de catégories', ()=>{
    const h = env.getEl('chips').innerHTML;
    if(!h.includes('>Toutes<')||!h.includes('Promos')||!h.includes('Sport')) throw new Error('chips');
    return true; });
}
{
  const env = creerEnv('?promo=1', 'liste'); charger(env);
  T('liste : filtre promo = produits en remise seulement', ()=>{
    const h = env.getEl('plist').innerHTML;
    if(h.includes('Montre connectée')) throw new Error('produit sans remise présent');
    if(!h.includes('Téléphone mobile 4G')) throw new Error('produit en remise absent');
    return true; });
}
{
  const env = creerEnv('?q=ventilateur', 'liste'); charger(env);
  T('liste : recherche « ventilateur »', ()=>{
    const h = env.getEl('plist').innerHTML;
    if(!h.includes('Ventilateur')) throw new Error('résultat absent');
    if((h.match(/class="card rv/g)||[]).length !== 1) throw new Error('trop de résultats');
    return true; });
}
{
  const env = creerEnv('?fav=1', 'liste'); charger(env);
  T('liste : favoris vides → état vide', ()=>{
    if(!env.getEl('plist').innerHTML.includes('Aucun produit trouvé')) throw new Error('pas d\'état vide');
    return true; });
}
{
  const env = creerEnv('', 'liste'); charger(env);
  T('liste : 10 produits au total', ()=>{
    if(env.getEl('count').innerHTML.indexOf('<b>10</b>')===-1) throw new Error(env.getEl('count').innerHTML);
    return true; });
}

/* ─────────── PAGE DÉTAIL ─────────── */
{
  const env = creerEnv('?p=telephone-mobile-4g', 'detail'); charger(env);
  T('détail : galerie 3 vues + badges', ()=>{
    const h = env.getEl('pdp').innerHTML;
    if((h.match(/class="g-th[\" ]/g)||[]).length !== 3) throw new Error('vues ≠ 3');
    if(!h.includes('-30%')) throw new Error('badge remise');
    if(!h.includes('background-size:100%')) throw new Error('vue entière');
    if(!h.includes('background-size:190%')) throw new Error('zoom détail');
    return true; });
  T('détail : prix, note, stock, assurances', ()=>{
    const h = env.getEl('pdp').innerHTML;
    if(!h.includes('15 501 FCFA')) throw new Error('prix');
    if(!h.includes('22 000 FCFA')) throw new Error('prix barré');
    if(!h.includes('(128 avis)')) throw new Error('avis');
    if(!h.includes('En stock — expédié aujourd\'hui')) throw new Error('stock');
    if(!h.includes('Livraison offerte dès 25 000 FCFA')) throw new Error('assurances');
    return true; });
  T('détail : options (coloris + stockage + garantie)', ()=>{
    const h = env.getEl('pdp').innerHTML;
    if(!h.includes('data-opt="0"')||!h.includes('class="swatch')) throw new Error('swatches');
    if(!h.includes('128 Go')||!h.includes('256 Go')) throw new Error('pills');
    if(!h.includes('Garantie')) throw new Error('option garantie');
    return true; });
  T('détail : onglets + similaires + buybar', ()=>{
    if(!env.getEl('tabs').innerHTML.includes('Description')) throw new Error('onglets');
    if(!env.getEl('tabs').innerHTML.includes('Caractéristiques')) throw new Error('onglets specs');
    if((env.getEl('similaires').innerHTML.match(/class="card rv/g)||[]).length !== 4) throw new Error('similaires');
    if(!env.getEl('buybar').innerHTML.includes('Ajouter')) throw new Error('buybar');
    return true; });
  T('détail : fil d\'ariane mis à jour + titre', ()=>{
    if(env.getEl('crumNom').textContent!=='Téléphone mobile 4G') throw new Error('ariane');
    if(!env.document.title.includes('Téléphone mobile 4G')) throw new Error('title');
    return true; });
  T('détail : slug inconnu → redirection', ()=>{
    const e2 = creerEnv('?p=nexiste-pas','detail'); charger(e2);
    if(!e2.ctx.location.href.includes('produits.html')) throw new Error('pas de redirection');
    return true; });
  T('détail : ajout au panier (options par défaut)', ()=>{
    clic(env, { '[data-add]': attrs({ 'data-add':'telephone-mobile-4g' }) });
    const p = JSON.parse(env.mem['bt_panier_v1']||'[]');
    if(p.length!==1) throw new Error('panier vide');
    if(p[0].prix!==15501) throw new Error('prix options = '+p[0].prix);
    if(p[0].choix['Stockage']!=='128 Go') throw new Error('option par défaut');
    return true; });
  T('détail : bascule favori', ()=>{
    clic(env, { '[data-fav]': attrs({ 'data-fav':'telephone-mobile-4g' }) });
    const f = JSON.parse(env.mem['bt_favoris_v1']||'[]');
    if(f.length!==1||f[0]!=='telephone-mobile-4g') throw new Error('favoris');
    return true; });
}

/* ─────────── PAGE PANIER ─────────── */
{
  const env = creerEnv('', 'panier'); charger(env);
  T('panier : état vide', ()=>{
    if(!env.getEl('cart').innerHTML.includes('Votre panier est vide')) throw new Error('pas d\'état vide');
    return true; });
}
{
  const env = creerEnv('', 'panier');
  env.mem['bt_panier_v1'] = JSON.stringify([
    { cle:'telephone-mobile-4g|Coloris:Noir|Garantie:6 mois|Stockage:128 Go', slug:'telephone-mobile-4g', nom:'Téléphone mobile 4G', image:'img/shop/produits/smartphone-4g.jpg', icone:'i-phone', prix:15501, prixBase:15501, choix:{Stockage:'128 Go',Coloris:'Noir','Garantie':'6 mois'}, qte:2 },
    { cle:'ventilateur|Taille:43 cm', slug:'ventilateur', nom:'Ventilateur', image:'img/shop/tile-speaker.jpg', icone:'i-fan', prix:48795, prixBase:48795, choix:{Taille:'43 cm'}, qte:1 }
  ]);
  charger(env);
  T('panier : lignes, sous-total et livraison offerte', ()=>{
    const h = env.getEl('cart').innerHTML;
    if(!h.includes('Téléphone mobile 4G')||!h.includes('Ventilateur')) throw new Error('lignes');
    if(!h.includes('79 797 FCFA')) throw new Error('sous-total attendu 79 797 — '+(h.match(/[\d  ]+ FCFA/g)||[]).slice(0,3));
    if(!h.includes('Offerte')) throw new Error('livraison non offerte au-dessus du seuil');
    if(!h.includes('1. Panier')||!h.includes('4. Confirmation')) throw new Error('étapes');
    return true; });
  T('panier : livraison facturée sous le seuil', ()=>{
    const e2 = creerEnv('', 'panier');
    e2.mem['bt_panier_v1'] = JSON.stringify([{ cle:'batterie-externe|Modèle:20 000 mAh', slug:'batterie-externe', nom:'Batterie externe 20 000 mAh', image:'img/shop/produits/powerbank.jpg', icone:'i-bolt', prix:12900, prixBase:12900, choix:{Modèle:'20 000 mAh'}, qte:1 }]);
    charger(e2);
    const h = e2.getEl('cart').innerHTML;
    if(!h.includes('1 500 FCFA')) throw new Error('frais de livraison absents');
    if(!h.includes('14 400 FCFA')) throw new Error('total attendu 14 400');
    return true; });
  T('panier : code promo FLASH10 (-10 %)', ()=>{
    env.getEl('promo').value = 'FLASH10';
    env.getEl('ok-promo').click();
    const h = env.getEl('cart').innerHTML;
    if(!h.includes('FLASH10')) throw new Error('code non repris');
    if(!h.includes('7 980 FCFA')) throw new Error('remise de 10 % absente');
    if(!h.includes('71 817 FCFA')) throw new Error('total remisé absent');
    return true; });
  T('panier : code inconnu refusé', ()=>{
    env.getEl('promo').value = 'XXX';
    env.getEl('ok-promo').click();
    if(!env.getEl('promoMsg').textContent.includes('Code inconnu')) throw new Error('message : '+env.getEl('promoMsg').textContent);
    return true; });
  T('panier : minimum de commande pour BIENVENUE', ()=>{
    const e3 = creerEnv('', 'panier');
    e3.mem['bt_panier_v1'] = JSON.stringify([{ cle:'batterie-externe|M', slug:'batterie-externe', nom:'Batterie externe', image:'img/1.jpg', icone:'i-bolt', prix:12900, choix:{Modèle:'20 000 mAh'}, qte:1 }]);
    charger(e3);
    e3.getEl('promo').value='BIENVENUE'; e3.getEl('ok-promo').click();
    if(!e3.getEl('promoMsg').textContent.includes('Valable dès')) throw new Error('minimum non vérifié : '+e3.getEl('promoMsg').textContent);
    return true; });
  T('panier : suppression de ligne', ()=>{
    clic(env, { '[data-del]': attrs({ 'data-del':'ventilateur|Taille:43 cm' }) });
    const p = JSON.parse(env.mem['bt_panier_v1']);
    if(p.length!==1) throw new Error('ligne non supprimée');
    return true; });
}
{
  const env = creerEnv('?etape=2', 'panier');
  env.mem['bt_panier_v1'] = JSON.stringify([{ cle:'ventilateur|Taille:43 cm', slug:'ventilateur', nom:'Ventilateur', image:'img/shop/tile-speaker.jpg', icone:'i-fan', prix:48795, choix:{Taille:'43 cm'}, qte:1 }]);
  charger(env);
  T('panier : étape 2 = formulaire de livraison', ()=>{
    const h = env.getEl('cart').innerHTML;
    if(!h.includes('Adresse de livraison')) throw new Error('formulaire absent');
    for(const id of ['cNom','cTel','cMail','cVille','cDet']) if(!h.includes('id="'+id+'"')) throw new Error('champ manquant : '+id);
    return true; });
  T('panier : validation des champs de livraison', ()=>{
    env.getEl('go3').click();
    const h = env.getEl('cart').innerHTML;
    if(!h.includes('Adresse de livraison')) throw new Error('passé à l\'étape suivante malgré les erreurs');
    return true; });
}
/* ─────────── Tri, filtres et tunnel de commande complet ─────────── */
{
  const env = creerEnv('', 'liste'); charger(env);
  T('liste : tri prix croissant', ()=>{
    env.getEl('tri').value='prix-asc';
    (env.getEl('tri')._ev.change||[]).forEach(f=>f({target:env.getEl('tri')}));
    const h=env.getEl('plist').innerHTML;
    const prix=(h.match(/class="price">([\d ]+)/g)||[]).map(x=>parseInt(x.replace(/\D/g,''),10));
    if(prix.length<3) throw new Error('prix illisibles ('+prix.length+')');
    for(let i=1;i<prix.length;i++) if(prix[i]<prix[i-1]) throw new Error('ordre croissant non respecté en position '+i);
    if(prix[0]!==12900) throw new Error('premier prix attendu 12 900 — obtenu '+prix[0]);
    return true; });
  T('liste : case « En promotion »', ()=>{
    env.getEl('cb-promo').checked=true;
    (env.getEl('cb-promo')._ev.change||[]).forEach(f=>f({target:env.getEl('cb-promo')}));
    const h=env.getEl('plist').innerHTML;
    if(h.includes('Montre connectée sport')) throw new Error('produit sans remise affiché');
    if(!h.includes('Téléphone mobile 4G')) throw new Error('produit en remise manquant');
    return true; });
}
{
  const env = creerEnv('?etape=2', 'panier');
  env.mem['bt_panier_v1'] = JSON.stringify([
    { cle:'machine-a-laver|Capacité:8 kg|Coloris:Blanc', slug:'machine-a-laver', nom:'Machine à laver', image:'img/shop/tile-washer.jpg', icone:'i-washer', prix:226833, choix:{'Capacité':'8 kg',Coloris:'Blanc'}, qte:1 }]);
  charger(env);
  T('commande : étape 2 → 3 (champs valides)', ()=>{
    env.getEl('cNom').value='Ibrahim Sangaré';
    env.getEl('cTel').value='+223 70 12 34 56';
    env.getEl('cMail').value='ibrahim@example.com';
    env.getEl('cVille').value='Bamako';
    env.getEl('cDet').value='Badalabougou, près du marché';
    env.getEl('go3').click();
    const h=env.getEl('cart').innerHTML;
    if(!h.includes('Mode de paiement')) throw new Error('étape 3 non atteinte');
    if(!h.includes('Orange Money')||!h.includes('Wave')) throw new Error('moyens de paiement absents');
    return true; });
  T('commande : paiement → confirmation + commande enregistrée', ()=>{
    env.getEl('payNum') && (env.getEl('payNum').value='+22370123456');
    env.getEl('pay').click();
    const h=env.getEl('cart').innerHTML;
    if(!h.includes('Votre commande est enregistrée')) throw new Error('pas de confirmation');
    if(!h.includes('CMD-')) throw new Error('numéro de commande absent');
    const cmds=JSON.parse(env.mem['bt_commandes_v1']||'[]');
    /* 5 commandes de démonstration + la nouvelle */
    if(cmds.length!==6) throw new Error('commandes = '+cmds.length+' (6 attendues)');
    if(cmds[0].total!==226833) throw new Error('total commande = '+cmds[0].total);
    if(!cmds[0].statut) throw new Error('statut absent sur la nouvelle commande');
    if(!/^CMD-\d{4}-0006$/.test(cmds[0].id)) throw new Error('numérotation : '+cmds[0].id);
    if(JSON.parse(env.mem['bt_panier_v1']).length!==0) throw new Error('panier non vidé');
    return true; });
}
/* ─────────── Pagination & navigation produit précédent/suivant ─────────── */
{
  const env = creerEnv('', 'liste'); charger(env);
  T('pagination : boutons Précédent / Suivant présents', ()=>{
    const h = env.getEl('pager').innerHTML;
    if(!h.includes('← Précédent')) throw new Error('bouton précédent absent');
    if(!h.includes('Suivant →')) throw new Error('bouton suivant absent');
    if(!h.includes('Page 1 / 2')) throw new Error('indicateur de page : '+h);
    if(!/data-page="0"[^>]*disabled/.test(h.replace(/\s+/g,' '))) throw new Error('précédent non désactivé en page 1');
    if(/data-page="2"[^>]*disabled/.test(h.replace(/\s+/g,' '))) throw new Error('suivant désactivé à tort en page 1');
    return true; });
  T('pagination : passage en page 2', ()=>{
    const btn = { getAttribute: k => k==='data-page' ? '2' : null, closest: () => null };
    (env.getEl('pager')._ev.click||[]).forEach(f=>f({ target:{ closest: sel => sel==='[data-page]' ? btn : null }, preventDefault(){} }));
    const h = env.getEl('plist').innerHTML;
    if((h.match(/class="card rv/g)||[]).length !== 2) throw new Error('page 2 = '+(h.match(/class="card rv/g)||[]).length+' produits (attendu 2)');
    return true; });
  T('pagination : précédent activé en page 2', ()=>{
    const h = env.getEl('pager').innerHTML;
    if(!h.includes('Page 2 / 2')) throw new Error('indicateur : '+h);
    if(!/data-page="3"[^>]*disabled/.test(h.replace(/\s+/g,' '))) throw new Error('suivant devrait être désactivé en dernière page');
    if(/data-page="1"[^>]*disabled/.test(h.replace(/\s+/g,' '))) throw new Error('précédent devrait être actif en page 2');
    return true; });
}
{
  const env = creerEnv('?p=telephone-mobile-4g', 'detail'); charger(env);
  T('fiche : barre produit précédent / suivant (même catégorie)', ()=>{
    const h = env.getEl('pdp').innerHTML;
    if(!h.includes('← Précédent') || !h.includes('Suivant →')) throw new Error('barre absente');
    if(!h.includes('class="sib-c"') || !h.includes(' / 7')) throw new Error('position absente');
    const liens = (h.match(/produit\.html\?p=[a-z0-9-]+/g)||[]);
    if(liens.length < 2) throw new Error('liens précédent/suivant absents');
    return true; });
  T('fiche : la barre mène à de vrais produits', ()=>{
    const h = env.getEl('pdp').innerHTML;
    const refs = (h.match(/produit\.html\?p=([a-z0-9-]+)/g)||[]).map(x=>x.split('=')[1]);
    if(new Set(refs).size !== 2) throw new Error('slugs identiques');
    return true; });
}
{
  const env = creerEnv('?p=montre-connectee', 'detail'); charger(env);
  T('fiche : catégorie à 1 produit → repli sur tout le catalogue', ()=>{
    const h = env.getEl('pdp').innerHTML;
    if(!h.includes(' / 10')) throw new Error('position : '+(h.match(/sib-c">([^<]+)/)||[])[1]);
    return true; });
}
/* ─────────── Tableaux de bord ─────────── */
try {
  const testsBord = require('./tests-dashboards.js');
  testsBord(T, (page, panier, mem) => {
    const env = creerEnv(typeof page === 'string' && page.indexOf('?') === 0 ? page : '', page, mem);
    charger(env);
    env.g = env.getEl;          /* alias pratique pour les tests */
    return env;
  });
} catch (e) {
  console.log('✗ tests des tableaux de bord : ' + e.message);
}

console.log('\nFin des tests.');
process.exit(0);
