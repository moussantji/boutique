/* Tests des tableaux de bord : espace client, suivi de commande, admin */
const { execSync } = require('child_process');

module.exports = function (T, env0) {
  /* ---------- Espace client ---------- */
  let env = env0('compte');
  T('compte : formulaire de connexion quand non connecté', () => {
    const h = env.g('compte').innerHTML;
    if (!h.includes('Mon espace client')) throw new Error('titre absent');
    if (!h.includes('id="loginForm"')) throw new Error('formulaire absent');
    if (!h.includes('demo@boutique.ml')) throw new Error('compte démo non indiqué');
    return true;
  });
  T('compte : 5 commandes de démonstration créées', () => {
    const cmds = JSON.parse(env.mem['bt_commandes_v1'] || '[]');
    if (cmds.length !== 5) throw new Error('commandes = ' + cmds.length);
    if (!cmds.every(c => c.id && c.statut && c.total > 0)) throw new Error('commande incomplète');
    if (!cmds.every(c => /^CMD-\d{4}-\d{4}$/.test(c.id))) throw new Error('numérotation : ' + cmds.map(c => c.id).join(','));
    return true;
  });
  T('compte : connexion démo → tableau de bord', () => {
    env.g('lMail').value = 'demo@boutique.ml';
    env.g('lMdp').value = 'demo1234';
    (env.g('compte')._ev.submit || []).forEach(f => f({ preventDefault() {}, target: { id: 'loginForm' } }));
    const h = env.g('compte').innerHTML;
    if (!h.includes('Bonjour')) throw new Error('pas de tableau de bord');
    if (!h.includes('Mes commandes')) throw new Error('section commandes absente');
    if (!h.includes('Mes favoris')) throw new Error('section favoris absente');
    if (!h.includes('Fidélité')) throw new Error('KPI fidélité absent');
    if (env.mem['bt_compte_v1'].indexOf('demo@boutique.ml') === -1) throw new Error('session non enregistrée');
    return true;
  });
  T('compte : identifiants invalides refusés', () => {
    const e2 = env0('compte');
    e2.g('lMail').value = 'pas-un-email';
    e2.g('lMdp').value = '12';
    (e2.g('compte')._ev.submit || []).forEach(f => f({ preventDefault() {}, target: { id: 'loginForm' } }));
    if (e2.g('compte').innerHTML.indexOf('id="loginForm"') === -1) throw new Error('connecté malgré des identifiants invalides');
    return true;
  });

  /* ---------- Suivi de commande ---------- */
  env = env0('suivi');
  T('suivi : frise des 4 étapes affichée', () => {
    const h = env.g('suivi').innerHTML;
    for (const st of ['Confirmée', 'En préparation', 'Expédiée', 'Livrée'])
      if (!h.includes(st)) throw new Error('étape manquante : ' + st);
    if (!h.includes('class="timeline"')) throw new Error('frise absente');
    if (!h.includes('tl-step actuel') && !h.includes('tl-step fait')) throw new Error('aucun état sur la frise');
    return true;
  });
  T('suivi : recherche par numéro de commande', () => {
    env.g('sQ').value = 'CMD-2026-0002';
    (env.g('suivi')._ev.submit || []).forEach(f => f({ preventDefault() {}, target: { id: 'suiviForm' } }));
    const h = env.g('suivi').innerHTML;
    if (!h.includes('CMD-2026-0002')) throw new Error('commande non trouvée');
    if (h.includes('Aucune commande trouvée')) throw new Error('à tort vide');
    if (!h.includes('Expédiée')) throw new Error('statut attendu absent');
    return true;
  });
  T('suivi : recherche par email (plusieurs commandes)', () => {
    env.g('sQ').value = 'demo@boutique.ml';
    (env.g('suivi')._ev.submit || []).forEach(f => f({ preventDefault() {}, target: { id: 'suiviForm' } }));
    const h = env.g('suivi').innerHTML;
    const nb = (h.match(/class="timeline"/g) || []).length;
    if (nb !== 2) throw new Error('frises = ' + nb + ' (attendu 2)');
    return true;
  });
  T('suivi : numéro inconnu → message clair', () => {
    env.g('sQ').value = 'CMD-9999-9999';
    (env.g('suivi')._ev.submit || []).forEach(f => f({ preventDefault() {}, target: { id: 'suiviForm' } }));
    if (!env.g('suivi').innerHTML.includes('Aucune commande trouvée')) throw new Error('pas de message');
    return true;
  });

  /* ---------- Admin ---------- */
  env = env0('admin');
  T('admin : indicateurs calculés', () => {
    const h = env.g('admin').innerHTML;
    if (!(h.includes('Chiffre d') && h.includes('affaires'))) throw new Error('KPI CA absent');
    if (!h.includes('class="kpis"')) throw new Error('bloc KPI absent');
    if (!h.includes('Panier moyen')) throw new Error('KPI panier moyen absent');
    if (!h.includes('Alertes stock')) throw new Error('KPI alertes absent');
    if (!h.includes('best-seller') && !h.includes('Meilleures ventes')) throw new Error('top ventes absent');
    return true;
  });
  T('admin : tableau des commandes + sélecteur de statut', () => {
    const h = env.g('admin').innerHTML;
    const sels = (h.match(/data-statut="CMD-[0-9-]+"/g) || []);
    if (sels.length !== 5) throw new Error('sélecteurs = ' + sels.length);
    if (!h.includes('class="tbl"')) throw new Error('tableau absent');
    return true;
  });
  T('admin : changement de statut persisté', () => {
    const h = env.g('admin').innerHTML;
    const sel = {
      getAttribute: k => k === 'data-statut' ? 'CMD-2026-0004' : null,
      value: 'Expédiée',
      closest: () => sel
    };
    (env.g('admin')._ev.change || []).forEach(f => f({ target: { closest: s => s === '[data-statut]' ? sel : null } }));
    const cmds = JSON.parse(env.mem['bt_commandes_v1']);
    const c = cmds.filter(x => x.id === 'CMD-2026-0004')[0];
    if (c.statut !== 'Expédiée') throw new Error('statut = ' + c.statut);
    return true;
  });
  T('admin : ajustement de stock persisté', () => {
    const btn = {
      getAttribute: k => ({ 'data-stock': '-1', 'data-slug': 'ventilateur' })[k] !== undefined ? ({ 'data-stock': '-1', 'data-slug': 'ventilateur' })[k] : null,
      closest: () => null
    };
    const avant = JSON.parse(env.mem['bt_panier_v1'] || '[]').length;
    (env.g('admin')._ev.click || []).forEach(f => f({ target: { closest: s => s === '[data-stock]' ? btn : null } }));
    const stocks = JSON.parse(env.mem['bt_stocks_v1'] || '{}');
    if (stocks['ventilateur'] === undefined) throw new Error('stock non enregistré');
    return true;
  });
  T('admin : tableau clients agrégé', () => {
    const h = env.g('admin').innerHTML;
    if (!h.includes('Clients')) throw new Error('section clients absente');
    if (!h.includes('demo@boutique.ml')) throw new Error('client démo absent');
    if (!h.includes('fatou.diarra@example.com')) throw new Error('client absent');
    return true;
  });

  /* ---------- Le seed ne doit pas s'appliquer deux fois ---------- */
  T('démo : pas de doublon au rechargement', () => {
    const e3 = env0('compte', null, env.mem);
    const cmds = JSON.parse(e3.mem['bt_commandes_v1'] || '[]');
    if (cmds.length !== 5) throw new Error('commandes = ' + cmds.length + ' après rechargement');
    return true;
  });
};
