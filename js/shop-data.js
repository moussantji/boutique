/* ==========================================================================
   shop-data.js — Catalogue partagé des pages filles
   (liste produits · détail produit · panier)

   ▸ Reprend les 6 produits déjà présents dans index.html :
     mêmes noms, mêmes prix, mêmes pourcentages de remise, mêmes icônes SVG.
   ▸ 4 produits supplémentaires illustrés (audio, montre, enceinte, batterie).
   ▸ Prix en FCFA, comme le reste du template.
   ========================================================================== */

const BOUTIQUE = {
  devise: 'FCFA',
  franco: 25000,          // livraison offerte dès 25 000 FCFA (comme le bandeau du template)
  livraison: 1500,        // sinon 1 500 FCFA — Bamako
  livraisonRegion: 3000,  // autres régions
  telephone: '+223 82 01 95 83',
  email: 'contact@boutique.ml',
  whatsapp: '22382019583'
};

/* Codes promo acceptés par la page panier */
const PROMOS = {
  FLASH10:    { type: 'pourcent', valeur: 10, libelle: '-10 % sur tout le panier' },
  BIENVENUE:  { type: 'montant',  valeur: 2000, libelle: '-2 000 FCFA dès 20 000 FCFA', minimum: 20000 },
  MEGA5000:   { type: 'montant',  valeur: 5000, libelle: '-5 000 FCFA dès 100 000 FCFA', minimum: 100000 }
};

/* Catégories : identiques aux liens du menu du template */
const CATEGORIES = ['Électronique', 'Mode', 'Maison & Jardin', 'Beauté', 'Sport', 'Jouets'];

/* Une vue de galerie = image + cadrage. zoom 1 = image entière,
   zoom > 1 = plan rapproché (background-size + background-position). */
function vues(base, plans) {
  return plans.map(function (pl) { return { src: base, label: pl[0], zoom: pl[1], pos: pl[2] }; });
}

const CATALOGUE = [
  /* ─────── Les 6 produits du template (valeurs identiques) ─────── */
  {
    slug: 'telephone-mobile-4g', nom: 'Téléphone mobile 4G', cat: 'Électronique',
    icone: 'i-phone', image: 'img/shop/produits/smartphone-4g.jpg',
    prix: 15501, ancienPrix: 22000, note: 4.4, avis: 128, stock: 24, vendus: 412,
    court: "Smartphone 4G accessible : grand écran 6,5\", batterie 5 000 mAh et double SIM. Le best-seller de la boutique.",
    description: [
      "Le Téléphone mobile 4G est notre best-seller : écran 6,5 pouces lisible en plein soleil, batterie 5 000 mAh qui tient deux jours en usage normal et double SIM pour séparer vie pro et perso.",
      "Il encaisse sans broncher les coupures de courant répétées, la chaleur et les longues journées dehors. Livré avec chargeur, câble USB-C et coque de protection."
    ],
    specs: {
      'Écran': '6,5" HD+ (720 × 1600), dalle IPS',
      'Batterie': '5 000 mAh — charge 18 W',
      'Mémoire': '4 Go RAM · 128 Go stockage (microSD jusqu\'à 512 Go)',
      'Photo': 'Double capteur 13 MP + 2 MP · selfie 8 MP',
      'Réseau': '4G LTE · double SIM',
      'Inclus': 'Chargeur 18 W, câble USB-C, coque, écran de protection'
    },
    options: [
      { nom: 'Coloris', type: 'swatch', valeurs: [
        { nom: 'Noir', hex: '#1f2937' }, { nom: 'Bleu', hex: '#1d4ed8' }, { nom: 'Vert', hex: '#047857' }
      ] },
      { nom: 'Stockage', type: 'pill', valeurs: [
        { nom: '128 Go' }, { nom: '64 Go', extra: -2000 }, { nom: '256 Go', extra: 6000 }
      ] },
      { nom: 'Garantie', type: 'pill', valeurs: [
        { nom: '6 mois' }, { nom: '12 mois', extra: 3000 }
      ] }
    ],
    avisClients: [
      { nom: 'Ibrahim S.', note: 5, date: '18 août 2026', texte: 'Batterie impressionnante, je recharge tous les deux jours. Livré à Bamako en 24 h.' },
      { nom: 'Awa B.', note: 4, date: '2 août 2026', texte: 'Bon téléphone pour le prix. L\'appareil photo est correct en pleine journée.' }
    ]
  },
  {
    slug: 'smartphone-c', nom: 'Smartphone C', cat: 'Électronique',
    icone: 'i-phones', image: 'img/shop/produits/smartphone-c.jpg',
    prix: 43538, ancienPrix: 62197, note: 4.6, avis: 74, stock: 12, vendus: 168,
    court: 'Le milieu de gamme équilibré : 8 Go de RAM, 256 Go de stockage et charge rapide 33 W.',
    description: [
      "Le Smartphone C vise juste : assez puissant pour les jeux, les vidéos et le multitâche, sans le prix d'un flagship. 8 Go de RAM, 256 Go de stockage et charge rapide 33 W.",
      "Sa coque en verre dépoli ne garde pas les traces de doigts et son module photo principal de 50 MP fait de belles photos de nuit grâce au mode longue exposition."
    ],
    specs: {
      'Écran': '6,7" AMOLED 120 Hz',
      'Processeur': 'Octa-core 2,4 GHz',
      'Mémoire': '8 Go RAM · 256 Go stockage',
      'Photo': '50 MP + 8 MP ultra-grand-angle · selfie 16 MP',
      'Batterie': '5 200 mAh — charge rapide 33 W',
      'Inclus': 'Chargeur 33 W, câble USB-C, coque'
    },
    options: [
      { nom: 'Coloris', type: 'swatch', valeurs: [
        { nom: 'Bleu nuit', hex: '#1e1b4b' }, { nom: 'Violet', hex: '#6d28d9' }, { nom: 'Argent', hex: '#cbd5e1' }
      ] },
      { nom: 'Stockage', type: 'pill', valeurs: [
        { nom: '256 Go' }, { nom: '128 Go', extra: -4000 }
      ] }
    ],
    avisClients: [
      { nom: 'Mariam C.', note: 4.5, date: '21 août 2026', texte: 'Écran magnifique et très fluide. Rapport qualité-prix difficile à battre.' }
    ]
  },
  {
    slug: 'machine-a-laver', nom: 'Machine à laver', cat: 'Maison & Jardin',
    icone: 'i-washer', image: 'img/shop/tile-washer.jpg',
    prix: 226833, ancienPrix: 453666, note: 4.7, avis: 39, stock: 6, vendus: 84,
    court: 'Lave-linge frontal 8 kg, 15 programmes, essorage 1 200 tr/min et départ différé.',
    description: [
      "Lave-linge à chargement frontal de 8 kg : de quoi laver les draps d'une famille entière. 15 programmes dont un cycle court de 15 minutes pour les vêtements peu sales.",
      "Tambour en inox, essorage jusqu'à 1 200 tours/minute et départ différé programmable jusqu'à 24 h pour profiter des heures creuses. Installation et mise en service offertes à Bamako."
    ],
    specs: {
      'Capacité': '8 kg — chargement frontal',
      'Vitesse d\'essorage': '1 200 tours/minute',
      'Programmes': '15 programmes dont cycle court 15 min',
      'Classe': 'A+++ (basse consommation)',
      'Options': 'Départ différé 24 h, verrouillage enfant, anti-frottement',
      'Services': 'Livraison + installation à domicile (Bamako)'
    },
    options: [
      { nom: 'Capacité', type: 'pill', valeurs: [
        { nom: '8 kg' }, { nom: '6 kg', extra: -30000 }, { nom: '10 kg', extra: 45000 }
      ] },
      { nom: 'Coloris', type: 'swatch', valeurs: [
        { nom: 'Blanc', hex: '#f8fafc' }, { nom: 'Gris inox', hex: '#9ca3af' }
      ] }
    ],
    avisClients: [
      { nom: 'Kadiatou S.', note: 5, date: '10 août 2026', texte: 'Installation impeccable et le linge sort presque sec. Le cycle 15 minutes est parfait.' }
    ]
  },
  {
    slug: 'smartphone-5g', nom: 'Smartphone 5G', cat: 'Électronique',
    icone: 'i-phone', image: 'img/shop/produits/smartphone-5g.jpg',
    prix: 60640, ancienPrix: 75800, note: 4.5, avis: 58, stock: 14, vendus: 143,
    court: 'Compatible 5G, 12 Go de RAM, écran 120 Hz et triple capteur photo 64 MP.',
    description: [
      "Le Smartphone 5G prépare l'avenir : quand la couverture 5G arrivera dans votre ville, l'appareil suivra. Entretemps, il reste un excellent téléphone 4G+ avec 12 Go de RAM.",
      "Triple capteur 64 MP (grand-angle, ultra-grand-angle, macro), écran 120 Hz très confortable et refroidissement renforcé pour éviter de chauffer en jeu."
    ],
    specs: {
      'Écran': '6,6" AMOLED 120 Hz, 1 000 nits',
      'Réseau': '5G / 4G+ · double SIM',
      'Mémoire': '12 Go RAM · 256 Go stockage',
      'Photo': '64 MP + 12 MP ultra-grand-angle + 5 MP macro · selfie 32 MP',
      'Batterie': '4 800 mAh — charge 45 W',
      'Inclus': 'Chargeur 45 W, câble, coque, protection écran'
    },
    options: [
      { nom: 'Coloris', type: 'swatch', valeurs: [
        { nom: 'Titane', hex: '#d4d4d8' }, { nom: 'Noir mat', hex: '#111827' }
      ] },
      { nom: 'Stockage', type: 'pill', valeurs: [{ nom: '256 Go' }, { nom: '512 Go', extra: 15000 }] }
    ],
    avisClients: [
      { nom: 'Drissa M.', note: 4.5, date: '16 août 2026', texte: 'Très fluide, l\'écran 120 Hz change la vie. Photos nettes de jour.' }
    ]
  },
  {
    slug: 'telephone-pro', nom: 'Téléphone Pro', cat: 'Électronique',
    icone: 'i-phones', image: 'img/shop/produits/telephone-pro.jpg',
    prix: 141066, ancienPrix: 282132, note: 4.8, avis: 47, stock: 5, vendus: 62,
    court: 'Le flagship de la boutique : triple module photo, écran 2K, 512 Go et charge 65 W.',
    description: [
      "Le Téléphone Pro est ce qui se fait de mieux dans notre catalogue : châssis en titane, écran 2K 120 Hz et triple module photo capable de rivaliser avec un compact.",
      "512 Go de stockage, 16 Go de RAM, charge 65 W (0 à 60 % en 20 minutes) et étanchéité IP68. Livré dans un coffret avec chargeur, câble tressé, coque et verre trempé posé d'usine."
    ],
    specs: {
      'Écran': '6,8" LTPO AMOLED 2K 120 Hz',
      'Châssis': 'Titane brossé — étanchéité IP68',
      'Mémoire': '16 Go RAM · 512 Go stockage',
      'Photo': 'Triple 108 MP + 12 MP téléobjectif 3× + 12 MP ultra-grand-angle',
      'Batterie': '5 400 mAh — charge 65 W filaire / 30 W sans fil',
      'Coffret': 'Chargeur, câble tressé, coque cuir, verre trempé posé'
    },
    options: [
      { nom: 'Coloris', type: 'swatch', valeurs: [
        { nom: 'Noir titane', hex: '#18181b' }, { nom: 'Or sable', hex: '#d6c7a8' }
      ] },
      { nom: 'Stockage', type: 'pill', valeurs: [{ nom: '256 Go', extra: -25000 }, { nom: '512 Go', extra: 0 }] }
    ],
    avisClients: [
      { nom: 'Modibo K.', note: 5, date: '23 août 2026', texte: 'Photos de nuit impressionnantes et l\'écran est superbe. Le poids en titane se sent (positivement).' }
    ]
  },
  {
    slug: 'ventilateur', nom: 'Ventilateur', cat: 'Maison & Jardin',
    icone: 'i-fan', image: 'img/shop/tile-speaker.jpg',
    prix: 48795, ancienPrix: 60993, note: 4.6, avis: 66, stock: 20, vendus: 254,
    court: 'Ventilateur sur pied réglable en hauteur, 3 vitesses, minuterie et oscillation 90°.',
    description: [
      "Indispensable pendant la saison chaude : 5 pales pour un souffle puissant, 3 vitesses et oscillation 90° qui brasse l'air dans toute la pièce.",
      "Hauteur réglable, minuterie jusqu'à 7 h 30 et télécommande fournie. Consommation très basse : en vitesse 1, il tourne une journée entière pour le prix d'un litre d'eau."
    ],
    specs: {
      'Type': 'Ventilateur sur pied, 5 pales',
      'Diamètre': '43 cm (16 pouces)',
      'Vitesses': '3 vitesses + mode brise',
      'Fonctions': 'Oscillation 90°, minuterie 7 h 30, télécommande',
      'Hauteur': 'Réglable de 105 à 130 cm',
      'Consommation': '45 W maximum'
    },
    options: [
      { nom: 'Taille', type: 'pill', valeurs: [{ nom: '40 cm' }, { nom: '43 cm' }, { nom: '50 cm', extra: 7000 }] }
    ],
    avisClients: [
      { nom: 'Fatoumata D.', note: 5, date: '8 août 2026', texte: 'Très silencieux en vitesse 1, je dors avec toute la nuit.' }
    ]
  },

  /* ─────── 4 produits supplémentaires ─────── */
  {
    slug: 'casque-audio', nom: 'Casque audio sans fil', cat: 'Électronique',
    icone: 'i-headset', image: 'img/shop/produits/casque-audio.jpg',
    prix: 38900, ancienPrix: 49500, note: 4.7, avis: 52, stock: 16, vendus: 121,
    court: 'Casque over-ear Bluetooth 5.3, réduction de bruit active et 40 h d\'autonomie.',
    description: [
      "Casque circum-aural confortable même après plusieurs heures : coussinets à mémoire de forme, arceau réglable et 255 g seulement sur la tête.",
      "Réduction de bruit active sur 4 niveaux pour travailler dans le bruit de la ville, mode transparence pour entendre ce qui se passe autour, et 40 h d'autonomie. Mode filaire jack 3,5 mm fourni quand la batterie est vide."
    ],
    specs: {
      'Type': 'Circum-aural fermé, transducteurs 40 mm',
      'Réduction de bruit': 'Active (ANC) 4 niveaux + mode transparence',
      'Autonomie': '40 h avec ANC · charge USB-C (10 min = 3 h)',
      'Connectivité': 'Bluetooth 5.3 + jack 3,5 mm + multipoint',
      'Poids': '255 g · coussinets mémoire de forme',
      'Inclus': 'Étui rigide, câble jack 3,5 mm, câble USB-C'
    },
    options: [
      { nom: 'Coloris', type: 'swatch', valeurs: [
        { nom: 'Noir mat', hex: '#111827' }, { nom: 'Sable', hex: '#d6c7a8' }
      ] },
      { nom: 'Garantie', type: 'pill', valeurs: [{ nom: '6 mois' }, { nom: '12 mois', extra: 2500 }] }
    ],
    avisClients: [
      { nom: 'Oumar T.', note: 5, date: '19 août 2026', texte: 'Le confort est top et l\'isolation coupe bien le bruit des klaxons.' }
    ]
  },
  {
    slug: 'montre-connectee', nom: 'Montre connectée sport', cat: 'Sport',
    icone: 'i-watch', image: 'img/shop/produits/montre-connectee.jpg',
    prix: 27500, note: 4.5, avis: 61, stock: 22, vendus: 187,
    court: 'Montre connectée : cardio, SpO2, 100+ modes sport, notifications et 10 jours d\'autonomie.',
    description: [
      "Suivez votre activité au quotidien : fréquence cardiaque en continu, oxygène dans le sang (SpO2), sommeil, nombre de pas et plus de 100 modes sport dont la course et le football.",
      "Écran AMOLED 1,43 pouce lisible en plein soleil, notifications d'appels et messages au poignet, étanchéité 5 ATM (utilisable sous la douche et en natation) et jusqu'à 10 jours d'autonomie."
    ],
    specs: {
      'Écran': 'AMOLED 1,43" (466 × 466)',
      'Capteurs': 'Cardio continu, SpO2, sommeil, accéléromètre',
      'Sport': '100+ modes · suivi GPS via téléphone',
      'Autonomie': '10 jours (usage normal) · 5 jours (usage intensif)',
      'Étanchéité': '5 ATM (natation, douche)',
      'Compatibilité': 'Android 6+ / iOS 12+'
    },
    options: [
      { nom: 'Bracelet', type: 'swatch', valeurs: [
        { nom: 'Noir', hex: '#111827' }, { nom: 'Bleu nuit', hex: '#1e3a8a' }, { nom: 'Rose', hex: '#be185d' }
      ] },
      { nom: 'Pack', type: 'pill', valeurs: [{ nom: 'Standard' }, { nom: '+ bracelet offert', extra: 3500 }] }
    ],
    avisClients: [
      { nom: 'Aminata K.', note: 4.5, date: '13 août 2026', texte: 'L\'autonomie tient vraiment 8-9 jours. Le suivi du sommeil est étonnamment précis.' }
    ]
  },
  {
    slug: 'enceinte-bluetooth', nom: 'Enceinte Bluetooth', cat: 'Électronique',
    icone: 'i-speaker', image: 'img/shop/produits/haut-parleur.jpg',
    prix: 19900, ancienPrix: 24900, note: 4.4, avis: 45, stock: 26, vendus: 209,
    court: 'Enceinte portable 20 W, son stéréo, étanche IPX7 et 18 h de lecture.',
    description: [
      "Une enceinte qui suit partout : 20 W de son stéréo, basses renforcées par double radiateur passif et 18 h de lecture pour animer une soirée entière.",
      "Étanche IPX7 : elle survit à la pluie et même à une immersion accidentelle. Appairage stéréo possible entre deux enceintes identiques, et sortie aux pour brancher un micro."
    ],
    specs: {
      'Puissance': '20 W (2 × 10 W)',
      'Autonomie': '18 h · charge USB-C (3 h)',
      'Étanchéité': 'IPX7 (immersion 30 min)',
      'Connectivité': 'Bluetooth 5.2 · jack 3,5 mm · microSD · clé USB',
      'Fonctions': 'Appairage stéréo (2 enceintes), main libre, entrée micro',
      'Inclus': 'Câble USB-C, dragonne'
    },
    options: [
      { nom: 'Coloris', type: 'swatch', valeurs: [
        { nom: 'Anthracite', hex: '#374151' }, { nom: 'Bleu', hex: '#1d4ed8' }, { nom: 'Rouge', hex: '#b91c1c' }
      ] }
    ],
    avisClients: [
      { nom: 'Souleymane B.', note: 4, date: '5 août 2026', texte: 'Son puissant pour la taille. Je l\'emmène en pique-nique sans stress.' }
    ]
  },
  {
    slug: 'batterie-externe', nom: 'Batterie externe 20 000 mAh', cat: 'Électronique',
    icone: 'i-bolt', image: 'img/shop/produits/powerbank.jpg',
    prix: 12900, note: 4.3, avis: 93, stock: 40, vendus: 476,
    court: 'Batterie externe 20 000 mAh, charge rapide 22,5 W, 3 sorties et affichage LED.',
    description: [
      "Avec les coupures de courant, une bonne batterie externe n'est pas un luxe. 20 000 mAh réels : de quoi recharger un téléphone 4 fois ou une tablette presque deux fois.",
      "Charge rapide 22,5 W compatible QC et PD, deux ports USB-A et un port USB-C entrée/sortie pour recharger plusieurs appareils en même temps. Écran LED indiquant le pourcentage restant."
    ],
    specs: {
      'Capacité': '20 000 mAh (74 Wh)',
      'Puissance': '22,5 W max (QC 3.0 / PD)',
      'Ports': '2 × USB-A + 1 × USB-C entrée/sortie',
      'Affichage': 'Écran LED avec pourcentage',
      'Sécurité': 'Protection surcharge, surchauffe, court-circuit',
      'Inclus': 'Câble USB-C tressé, pochette, notice'
    },
    options: [
      { nom: 'Modèle', type: 'pill', valeurs: [
        { nom: '20 000 mAh' }, { nom: '10 000 mAh', extra: -4000 }, { nom: '30 000 mAh', extra: 6500 }
      ] }
    ],
    avisClients: [
      { nom: 'Cheick O.', note: 4, date: '1 août 2026', texte: 'Recharge mon téléphone 3 fois. Un peu lourde mais c\'est le jeu pour cette capacité.' }
    ]
  }
];

/* Remplit les galeries : vue entière + 2 plans rapprochés */
CATALOGUE.forEach(function (p, i) {
  p.ref = 'BT-' + String(i + 1).padStart(2, '0');
  p.images = vues(p.image, [
    ['Vue d\'ensemble', 1, 'center top'],
    ['Détail', 1.9, '38% 42%'],
    ['Matière / finition', 2.6, '68% 62%']
  ]);
  p.remise = p.ancienPrix ? Math.round((1 - p.prix / p.ancienPrix) * 100) : 0;
});

function getProduit(ref) {
  if (!ref) return null;
  return CATALOGUE.filter(function (p) { return p.slug === ref; })[0] || null;
}

function valeurNom(v) { return typeof v === 'string' ? v : v.nom; }
function valeurExtra(v) { return typeof v === 'string' ? 0 : (v.extra || 0); }

function choixDefaut(produit) {
  var choix = {};
  (produit.options || []).forEach(function (o) { choix[o.nom] = valeurNom(o.valeurs[0]); });
  return choix;
}
function prixUnitaire(produit, choix) {
  var total = produit.prix;
  (produit.options || []).forEach(function (o) {
    var sel = choix ? choix[o.nom] : null;
    o.valeurs.forEach(function (v) { if (valeurNom(v) === sel) total += valeurExtra(v); });
  });
  return total;
}
function produitsSimilaires(produit, max) {
  var memes = CATALOGUE.filter(function (p) { return p.cat === produit.cat && p.slug !== produit.slug; });
  var autres = CATALOGUE.filter(function (p) { return p.cat !== produit.cat && p.slug !== produit.slug; });
  return memes.concat(autres).slice(0, max || 4);
}
