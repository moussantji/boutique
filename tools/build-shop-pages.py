#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build-shop-pages.py — Génère les pages filles de la boutique à partir du
template `index.html` (source unique de vérité du design).

Pages générées :
    produits.html              → liste produits (filtres, tri, recherche)
    produit.html     → détail produit (galerie, options, onglets, avis)
    panier.html      → panier + tunnel de commande (3 étapes)

Blocs repris **à l'identique** du template : CSS complet (<style>), sprite SVG
d'icônes, bandeau promo, en-tête, navigation, bandeau de confiance, pied de page.

Usage :  python3 tools/build-shop-pages.py
"""

import re
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SOURCE = RACINE / "index.html"
if not SOURCE.exists():
    sys.exit("index.html introuvable — le template est la source du design.")

src = SOURCE.read_text(encoding="utf-8")

# ─────────────────────────── Extraction des blocs du template ───────────────────────────
style = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
sprite = re.search(r'(<svg width="0" height="0".*?</svg>)', src, re.S).group(1)


def borne(motif):
    """Position du commentaire-bannière contenant `motif`."""
    m = re.search(r"<!--[^>]*?" + re.escape(motif) + r"[^>]*?-->", src)
    if not m:
        sys.exit("Bloc introuvable dans le template : %s" % motif)
    return m.start()


def segment(a, b=None):
    return src[borne(a):borne(b) if b else len(src)]


topbar = segment("Bandeau promo", "Header")
header = segment("Header", "Nav")
nav = segment("Nav", "Hero")
trust = segment("Bandeau de confiance", "Offres flash")
footer = segment("Footer", "Recherche")

# ─────────────── Adaptation de l'en-tête (idempotent : le template peut déjà être adapté) ───────────────
header = header.replace('aria-label="Mes favoris"', 'aria-label="Mes favoris" data-fav-count')
header = header.replace('aria-label="Mon panier"', 'aria-label="Mon panier" data-bag')
header = header.replace('aria-label="Mon compte"', 'aria-label="Mon espace client" data-user')
if '<a class="acc"' not in header:
    # 1) nom du client affiché à côté de l'icône compte
    header = header.replace(
        '</svg></button>\n    </div>\n  </div>\n</header>',
        '</svg><span class="nm" style="font-size:11px;font-weight:700;margin-left:4px"></span></button>\n    </div>\n  </div>\n</header>',
    )
    # 2) ce bouton devient un lien vers l'espace client (ouverture ET fermeture)
    header = header.replace(
        '<button type="button" aria-label="Mon espace client" data-user>',
        '<a class="acc" href="compte.html" aria-label="Mon espace client" data-user>',
    )
    header = header.replace(
        '</svg><span class="nm" style="font-size:11px;font-weight:700;margin-left:4px"></span></button>',
        '</svg><span class="nm" style="font-size:11px;font-weight:700;margin-left:4px"></span></a>',
    )
# contrôle : l'espace client est bien un lien, aucun bouton orphelin
assert header.count('<a class="acc"') >= 1 and '</span></a>' in header, 'en-tête compte mal converti'
assert '</span></button>' not in header, "balise </button> orpheline dans l'en-tête"

# ─────────────────────────── Navigation → pages filles ───────────────────────────
for libelle, cible in [
    ("Électronique", "produits.html?cat=%C3%89lectronique"),
    ("Mode", "produits.html?cat=Mode"),
    ("Maison &amp; Jardin", "produits.html?cat=Maison%20%26%20Jardin"),
    ("Beauté", "produits.html?cat=Beaut%C3%A9"),
    ("Sport", "produits.html?cat=Sport"),
    ("Jouets", "produits.html?cat=Jouets"),
    ("Promos", "produits.html?promo=1"),
]:
    nav = re.sub(
        r'(<a[^>]*?href=")#[a-z]+("[^>]*?>\s*' + re.escape(libelle) + r"\s*</a>)",
        r"\g<1>" + cible + r"\g<2>",
        nav,
    )

# Pied de page : liens vers les pages réelles
footer = footer.replace('href="#nouveautes"', 'href="produits.html"')
footer = footer.replace('href="#promos"', 'href="produits.html?promo=1"')
footer = footer.replace('href="#marques"', 'href="admin.html"')
footer = footer.replace('href="#suivi"', 'href="suivi.html"')
footer = footer.replace('href="#livraison"', 'href="suivi.html"')
footer = footer.replace('href="#retours"', 'href="suivi.html"')
footer = footer.replace('href="#aide"', 'href="suivi.html"')
if 'Admin (démo)</a>' not in footer:
    footer = footer.replace(
    '<div class="bot">',
    '<div class="bot"><span style="display:flex;gap:14px;flex-wrap:wrap">'
    '<a href="suivi.html">Suivre ma commande</a>'
    '<a href="compte.html">Mon espace client</a>'
    '<a href="admin.html">Admin (démo)</a></span>'
)

# ─────────────────────────── Icônes supplémentaires (préfixe i-b2-) ───────────────────────────
SPRITE_BIS = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-b2-star" viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/></symbol>
  <symbol id="i-b2-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-b2-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
  <symbol id="i-b2-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></symbol>
  <symbol id="i-b2-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
  <symbol id="i-b2-tag" viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z"/><circle cx="7" cy="7" r="1.3"/></symbol>
  <symbol id="i-b2-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>
  <symbol id="i-b2-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></symbol>
  <symbol id="i-b2-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></symbol>
</svg>"""

# ─────────────────────────── Fragments communs ───────────────────────────
FIN = """<!-- ══════════════════════════ Panier latéral ══════════════════════════ -->
<div class="veil" id="veil"></div>
<aside class="drawer" id="drawer" aria-label="Panier">
  <div class="drawer-head">
    <b>Mon panier</b>
    <button class="x" type="button" data-drawer-close aria-label="Fermer"><svg class="ic"><use href="#i-close"/></svg></button>
  </div>
  <div class="drawer-body" id="dBody"></div>
  <div class="drawer-foot" id="dFoot"></div>
</aside>

<!-- ══════════════════════════ Notifications ══════════════════════════ -->
<div class="toasts" id="toasts" aria-live="polite"></div>

<script src="js/shop-data.js"></script>
<script src="js/shop-pages.js"></script>
</body>
</html>
"""


def page(titre, description, contenu, classe_body="", page_id="liste"):
    return """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(titre)s</title>
<meta name="description" content="%(description)s">
<style>%(style)s</style>
<link rel="stylesheet" href="css/shop-pages.css">
</head>
<body class="%(classe)s" data-page="%(page)s">

<div id="progress" aria-hidden="true"></div>

%(sprite)s
%(sprite_bis)s

%(topbar)s
%(header)s
%(nav)s

%(contenu)s

%(trust)s

%(footer)s

%(fin)s""" % {
        "titre": titre,
        "description": description,
        "style": style,
        "classe": classe_body,
        "page": page_id,
        "sprite": sprite,
        "sprite_bis": SPRITE_BIS,
        "topbar": topbar,
        "header": header,
        "nav": nav,
        "contenu": contenu,
        "trust": trust,
        "footer": footer,
        "fin": FIN,
    }


# ─────────────────────────── 1. Liste produits ───────────────────────────
CONTENU_LISTE = """<!-- ═════════════════════════ Liste produits ═════════════════════════ -->
<nav class="crumb" aria-label="Fil d'Ariane">
  <div class="wrap">
    <a href="index.html">Accueil</a>
    <svg class="ic"><use href="#i-chevron"/></svg>
    <span class="here">Produits</span>
  </div>
</nav>

<section class="phead">
  <div class="wrap">
    <h1 id="titre">Tous les produits</h1>
    <p id="count-suite"><span id="count"></span></p>
    <div class="cats" id="chips" style="padding:16px 0 0"></div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="toolbar">
      <span style="font-size:13px;font-weight:600;color:var(--violet-900)">Affiner</span>
      <label><input type="checkbox" id="cb-promo"> En promotion</label>
      <label><input type="checkbox" id="cb-dispo"> Disponible</label>
      <label><input type="checkbox" id="cb-fav"> Mes favoris</label>
      <span class="grow"></span>
      <label for="tri" style="font-weight:600;color:var(--violet-900)">Trier par</label>
      <select class="ctrl" id="tri" aria-label="Trier les produits">
        <option value="populaire">Popularité</option>
        <option value="prix-asc">Prix croissant</option>
        <option value="prix-desc">Prix décroissant</option>
        <option value="note">Meilleures notes</option>
      </select>
    </div>

    <div class="grid plist" id="plist"></div>
    <div class="pager" id="pager"></div>
  </div>
</section>"""

# ─────────────────────────── 2. Détail produit ───────────────────────────
CONTENU_DETAIL = """<!-- ════════════════════════ Détail produit ════════════════════════ -->
<nav class="crumb" aria-label="Fil d'Ariane">
  <div class="wrap">
    <a href="index.html">Accueil</a>
    <svg class="ic"><use href="#i-chevron"/></svg>
    <a id="crumCat" href="produits.html">Produits</a>
    <svg class="ic"><use href="#i-chevron"/></svg>
    <span class="here" id="crumNom">Produit</span>
  </div>
</nav>

<section>
  <div class="wrap">
    <div class="pdp" id="pdp"></div>
    <div id="tabs"></div>
  </div>
</section>

<section class="sec mini">
  <div class="wrap">
    <div class="sec-head rv">
      <h2><span>✨</span> Produits similaires</h2>
      <a class="more" href="produits.html">Tout voir <svg class="ic ic-sm"><use href="#i-chevron"/></svg></a>
    </div>
    <div class="grid plist" id="similaires"></div>
  </div>
</section>

<!-- Barre d'achat collante (mobile) -->
<div class="buybar" id="buybar"></div>"""

# ─────────────────────────── 3. Panier ───────────────────────────
CONTENU_PANIER = """<!-- ══════════════════════════════ Panier ══════════════════════════════ -->
<nav class="crumb" aria-label="Fil d'Ariane">
  <div class="wrap">
    <a href="index.html">Accueil</a>
    <svg class="ic"><use href="#i-chevron"/></svg>
    <a href="produits.html">Produits</a>
    <svg class="ic"><use href="#i-chevron"/></svg>
    <span class="here">Panier</span>
  </div>
</nav>

<section class="phead">
  <div class="wrap">
    <h1>Mon panier</h1>
    <p>Vérifiez vos articles, appliquez un code promo puis validez votre commande.</p>
  </div>
</section>

<section>
  <div class="wrap" id="cart"></div>
</section>"""

CONTENU_COMPTE = '<!-- ═════════════════════ Espace client (tableau de bord) ═════════════════════ -->\n<nav class="crumb" aria-label="Fil d\'Ariane">\n  <div class="wrap">\n    <a href="index.html">Accueil</a>\n    <svg class="ic"><use href="#i-chevron"/></svg>\n    <span class="here">Mon espace client</span>\n  </div>\n</nav>\n\n<section class="phead">\n  <div class="wrap">\n    <h1>Mon espace client</h1>\n    <p>Vos commandes, leur suivi, vos favoris et vos informations de livraison.</p>\n  </div>\n</section>\n\n<section>\n  <div class="wrap" id="compte"></div>\n</section>'

CONTENU_SUIVI = '<!-- ═════════════════════════ Suivi de commande ═════════════════════════ -->\n<nav class="crumb" aria-label="Fil d\'Ariane">\n  <div class="wrap">\n    <a href="index.html">Accueil</a>\n    <svg class="ic"><use href="#i-chevron"/></svg>\n    <a href="compte.html">Mon espace client</a>\n    <svg class="ic"><use href="#i-chevron"/></svg>\n    <span class="here">Suivi de commande</span>\n  </div>\n</nav>\n\n<section class="phead">\n  <div class="wrap">\n    <h1>Suivi de commande</h1>\n    <p>Confirmée → en préparation → expédiée → livrée : voyez où en est votre colis.</p>\n  </div>\n</section>\n\n<section>\n  <div class="wrap" id="suivi"></div>\n</section>'

CONTENU_ADMIN = '<!-- ══════════════════════ Administration (démo) ══════════════════════ -->\n<nav class="crumb" aria-label="Fil d\'Ariane">\n  <div class="wrap">\n    <a href="index.html">Accueil</a>\n    <svg class="ic"><use href="#i-chevron"/></svg>\n    <span class="here">Administration</span>\n  </div>\n</nav>\n\n<section class="phead">\n  <div class="wrap">\n    <h1>Tableau de bord — Administration</h1>\n    <p>Ventes, commandes, stocks et clients. Les statuts et les stocks sont modifiables (démo front-end).</p>\n  </div>\n</section>\n\n<section>\n  <div class="wrap" id="admin"></div>\n</section>'

# ─────────────────────────── Écriture des fichiers ───────────────────────────
cibles = [
    ("produits.html", page(
        "Produits — Boutique en ligne",
        "Catalogue complet : téléphones, électroménager, audio. Filtres, tri et recherche.",
        CONTENU_LISTE, page_id="liste")),
    ("produit.html", page(
        "Détail produit — Boutique en ligne",
        "Fiche produit détaillée : galerie, options, caractéristiques, avis et ajout au panier.",
        CONTENU_DETAIL, classe_body="has-buybar", page_id="detail")),
    ("panier.html", page(
        "Panier — Boutique en ligne",
        "Panier et commande : quantités, code promo, livraison et paiement Mobile Money.",
        CONTENU_PANIER, page_id="panier")),
    ("compte.html", page(
        "Mon espace client — Boutique en ligne",
        "Tableau de bord client : commandes, suivi, favoris, informations et fidélité.",
        CONTENU_COMPTE, page_id="compte")),
    ("suivi.html", page(
        "Suivi de commande — Boutique en ligne",
        "Suivez votre commande étape par étape : confirmée, en préparation, expédiée, livrée.",
        CONTENU_SUIVI, page_id="suivi")),
    ("admin.html", page(
        "Administration — Boutique en ligne",
        "Tableau de bord admin : chiffre d'affaires, commandes, statuts, stocks et clients.",
        CONTENU_ADMIN, page_id="admin")),
]

for nom, contenu in cibles:
    (RACINE / nom).write_text(contenu, encoding="utf-8")
    print("✓ %-26s %6d octets" % (nom, len(contenu.encode("utf-8"))))

print("\nTerminé — template repris : CSS (%d o), en-tête, nav, bandeau de confiance, pied de page."
      % len(style))
