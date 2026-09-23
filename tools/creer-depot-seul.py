#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
vers-boutique.py — Reconstruit le dépôt « boutique » autonome à partir d'un extrait
du dépôt portfolio (branche `arena/01a0c9dc-portfolio`, où vivent les pages e-commerce).

    python3 vers-boutique.py --source /tmp/portfolio-boutique --cible /home/user/boutique
    python3 vers-boutique.py --source ... --cible ... --git     # + git init + commit

Ce que fait le script :
  1. renomme les pages (ecommerce-web.html → index.html, …) et réécrit tous les liens ;
  2. adapte l'en-tête (icône compte → lien vers l'espace client) et le pied de page ;
  3. rend le générateur `tools/build-shop-pages.py` idempotent et prend `index.html` comme
     source du design, puis le lance pour régénérer les 6 pages filles ;
  4. écrit .nojekyll, .gitignore et README.md ;
  5. (option --git) initialise un dépôt git avec un premier commit.

Aucune dépendance : bibliothèque standard uniquement. Idempotent.
"""
import argparse
import pathlib
import shutil
import subprocess
import sys

RENOM = {
    "ecommerce-web.html": "index.html",
    "ecommerce-produit.html": "produit.html",
    "ecommerce-panier.html": "panier.html",
    "ecommerce-compte.html": "compte.html",
    "ecommerce-suivi.html": "suivi.html",
    "ecommerce-admin.html": "admin.html",
    "produits.html": "produits.html",
}
ASSETS = ["css/shop-pages.css", "js/shop-data.js", "js/shop-pages.js"]
OUTILS = [
    "tools/build-shop-pages.py",
    "tools/test-shop-pages.js",
    "tools/tests-dashboards.js",
    "tools/serve-boutique.py",
    "tools/import-images.py",
]
PAGES_ATTENDUES = ["index.html", "produits.html", "produit.html", "panier.html",
                   "compte.html", "suivi.html", "admin.html"]

# ── Bloc d'en-tête idempotent à installer dans le générateur ──────────────────
GENERATEUR_ENTETE = '''# ─────────────── Adaptation de l'en-tête (idempotent : le template peut déjà être adapté) ───────────────
header = header.replace('aria-label="Mes favoris"', 'aria-label="Mes favoris" data-fav-count')
header = header.replace('aria-label="Mon panier"', 'aria-label="Mon panier" data-bag')
header = header.replace('aria-label="Mon compte"', 'aria-label="Mon espace client" data-user')
if '<a class="acc"' not in header:
    # 1) nom du client affiché à côté de l'icône compte
    header = header.replace(
        '</svg></button>\\n    </div>\\n  </div>\\n</header>',
        '</svg><span class="nm" style="font-size:11px;font-weight:700;margin-left:4px"></span></button>\\n    </div>\\n  </div>\\n</header>',
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

'''

README = """# Boutique en ligne — démo front-end (Mali)

Boutique e-commerce complète, **100 % statique** : aucune installation, aucun build,
aucune dépendance npm. Ouvrez `index.html` ou publiez le dépôt tel quel sur GitHub Pages.

## Les pages

| Page | Contenu |
|---|---|
| `index.html` | Accueil : offres flash, catégories, bandeau de confiance, recherche, tiroir panier |
| `produits.html` | Catalogue : filtres par catégorie, tri, recherche, pagination (8 produits / page) |
| `produit.html?p=<slug>` | Fiche produit : galerie, choix (couleur / capacité), onglets, avis, précédent · suivant |
| `panier.html` | Panier + tunnel de commande en 4 étapes (livraison, paiement Mobile Money, confirmation) |
| `compte.html` | Espace client : connexion démo, KPI (commandes, en cours, dépensé, fidélité), commandes, favoris |
| `suivi.html` | Suivi de commande : recherche par n° ou par email, frise des 4 étapes, détail livraison |
| `admin.html` | Tableau de bord admin : chiffre d'affaires, panier moyen, clients, alertes stock, statuts, stocks, top ventes |

## Compte de démonstration

* Espace client : **demo@boutique.ml** / **demo1234** (bouton « Remplir automatiquement »)
* Suivi de commande : un n° de commande démo, ex. `CMD-2026-0002`, ou l'email du compte
* Administration : `admin.html` — statuts et stocks modifiables, « Réinitialiser les données de démo »

Les données (panier, favoris, commandes, comptes, stocks) sont stockées **dans le navigateur**
(`localStorage`, clés préfixées `bt_`). Rien n'est envoyé à un serveur : c'est une démonstration
d'interface.

## Structure

```
index.html                 accueil (template : c'est aussi la source du design)
produits.html              catalogue
produit.html               fiche produit
panier.html                panier + commande
compte.html                espace client
suivi.html                 suivi de commande
admin.html                 administration (démo)
css/shop-pages.css         styles des pages filles (pagination, tableaux de bord, tableaux)
js/shop-data.js            catalogue : 10 produits, catégories, promos
js/shop-pages.js           logique : liste, détail, panier, compte, suivi, admin
img/shop/                  visuels de la boutique (bannières + 8 produits)
img/demo/                  maquettes des applications (dossier de présentation)
tools/build-shop-pages.py  régénère les 6 pages filles depuis index.html (source unique du design)
tools/test-shop-pages.js   49 tests automatiques (Node, sans dépendance)
tools/serve-boutique.py    serveur d'aperçu local : python3 tools/serve-boutique.py
tools/import-images.py     importe vos photos dans les emplacements produits
```

## Aperçu local

```bash
python3 tools/serve-boutique.py            # http://localhost:8001
python3 tools/serve-boutique.py --port 9000
```

## Tests

```bash
node tools/test-shop-pages.js              # 49 tests — attendu : 0 échec
```

## Modifier les pages

`index.html` est la source unique du design. Après l'avoir modifié, régénérez les pages filles :

```bash
python3 tools/build-shop-pages.py          # réécrit les 6 pages filles avec le même template
```

## Remplacer les visuels par vos photos

```bash
python3 tools/import-images.py --liste                       # emplacements attendus
python3 tools/import-images.py --source /chemin/photos --dry-run   # simulation
python3 tools/import-images.py --source /chemin/photos             # import
```

## Publier sur GitHub Pages

1. Pousser ce dépôt sur GitHub.
2. *Settings → Pages* → **Source : Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Le site est en ligne à `https://<compte>.github.io/<dépôt>/` au bout d'une minute environ.

Le fichier `.nojekyll` est déjà présent (il évite tout traitement Jekyll du site).
"""


def reecrire(txt):
    """Réécrit les noms de pages du portfolio vers les URLs propres du dépôt boutique."""
    for vieux, neuf in RENOM.items():
        if vieux != neuf:
            txt = txt.replace(vieux, neuf)
    return txt


def lire(chemin):
    return chemin.read_text(encoding="utf-8")


def ecrire(chemin, txt):
    chemin.parent.mkdir(parents=True, exist_ok=True)
    chemin.write_text(txt, encoding="utf-8")


def adapter_index(texte):
    """En-tête (brand + icônes cliquables) et pied de page de la page d'accueil. Idempotent."""
    t = texte
    t = t.replace('<a class="brand" href="/"', '<a class="brand" href="index.html"')
    t = t.replace('Reproduction de img/projects/ecommerce-web-ultra.jpg',
                  'Reproduction des maquettes img/demo/ (applications e-commerce)')
    # icônes : favoris → espace client, panier → panier, compte → espace client
    t = t.replace(
        '<button type="button" aria-label="Mes favoris"><svg class="ic"><use href="#i-heart"/></svg></button>',
        '<a class="acc" href="compte.html" aria-label="Mes favoris" data-fav-count><svg class="ic"><use href="#i-heart"/></svg></a>')
    t = t.replace(
        '<button type="button" aria-label="Mon panier">',
        '<a class="acc" href="panier.html" aria-label="Mon panier" data-bag>')
    t = t.replace(
        '''        <svg class="ic"><use href="#i-bag"/></svg>
        <span class="dot">3</span>
      </button>''',
        '''        <svg class="ic"><use href="#i-bag"/></svg>
        <span class="dot">3</span>
      </a>''')
    t = t.replace(
        '<button type="button" aria-label="Mon compte"><svg class="ic"><use href="#i-user"/></svg></button>',
        '<a class="acc" href="compte.html" aria-label="Mon espace client" data-user>'
        '<svg class="ic"><use href="#i-user"/></svg>'
        '<span class="nm" style="font-size:11px;font-weight:700;margin-left:4px"></span></a>')
    # pied de page → pages réelles
    for vieux, neuf in [('href="#nouveautes"', 'href="produits.html"'),
                        ('href="#promos"', 'href="produits.html?promo=1"'),
                        ('href="#marques"', 'href="produits.html"'),
                        ('href="#suivi"', 'href="suivi.html"'),
                        ('href="#livraison"', 'href="suivi.html"'),
                        ('href="#retours"', 'href="suivi.html"')]:
        t = t.replace(vieux, neuf)
    if 'Admin (démo)</a>' not in t:
        t = t.replace('<div class="bot">',
                      '<div class="bot"><span style="display:flex;gap:14px;flex-wrap:wrap">'
                      '<a href="suivi.html">Suivre ma commande</a>'
                      '<a href="compte.html">Mon espace client</a>'
                      '<a href="admin.html">Admin (démo)</a></span>')
    return t


def adapter_generateur(texte):
    """Rend le bloc d'en-tête idempotent (le template peut déjà être adapté)."""
    marque_debut = "# ─────────────────────────── Adaptation de l'en-tête"
    marque_fin = "# ─────────────────────────── Navigation → pages filles"
    if marque_debut in texte and marque_fin in texte:
        debut = texte.index(marque_debut)
        fin = texte.index(marque_fin)
        texte = texte[:debut] + GENERATEUR_ENTETE + texte[fin:]
    # pied de page : ne pas doubler les liens si le template les a déjà
    vieux = "footer = footer.replace(\n    '<div class=\"bot\">',"
    neuf = ("if 'Admin (démo)</a>' not in footer:\n"
            "    footer = footer.replace(\n    '<div class=\"bot\">',")
    if vieux in texte and "'Admin (démo)</a>' not in footer" not in texte:
        texte = texte.replace(vieux, neuf)
    return texte


def main():
    a = argparse.ArgumentParser(description="Reconstruit le dépôt boutique autonome.")
    a.add_argument("--source", required=True, help="extrait du dépôt portfolio (branche boutique)")
    a.add_argument("--cible", default="/home/user/boutique", help="dossier de destination")
    a.add_argument("--git", action="store_true", help="initialiser un dépôt git + premier commit")
    opt = a.parse_args()

    src, dst = pathlib.Path(opt.source).resolve(), pathlib.Path(opt.cible).resolve()
    if not (src / "ecommerce-web.html").exists() and not (src / "index.html").exists():
        sys.exit("Source invalide : ni ecommerce-web.html ni index.html dans %s" % src)
    dst.mkdir(parents=True, exist_ok=True)
    print("source : %s\ncible  : %s\n" % (src, dst))

    # 1) pages (renommées + liens réécrits)
    for nom_src, nom_dst in RENOM.items():
        chemin = src / nom_src
        if not chemin.exists():
            sys.exit("Fichier manquant dans la source : %s" % nom_src)
        ecrire(dst / nom_dst, reecrire(lire(chemin)))
        print("  page   %-16s → %s" % (nom_src, nom_dst))

    # 2) assets
    for f in ASSETS:
        ecrire(dst / f, reecrire(lire(src / f)))
        print("  asset  %s" % f)

    # 3) images de la boutique + maquettes des projets
    nb = 0
    for img in sorted((src / "img/shop").rglob("*.jpg")):
        rel = img.relative_to(src / "img/shop")
        (dst / "img/shop" / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(img, dst / "img/shop" / rel)
        nb += 1
    print("  images img/shop      : %d" % nb)
    nb = 0
    for img in sorted((src / "img/projects").glob("ecommerce*.jpg")):
        (dst / "img/demo").mkdir(parents=True, exist_ok=True)
        shutil.copy2(img, dst / "img/demo" / img.name)
        nb += 1
    print("  images img/demo      : %d" % nb)

    # 4) outils
    for f in OUTILS:
        ecrire(dst / f, reecrire(lire(src / f)))
    print("  outils : %d scripts" % len(OUTILS))

    # 5) page d'accueil : en-tête et pied de page réellement cliquables
    ecrire(dst / "index.html", adapter_index(reecrire(lire(src / "ecommerce-web.html"))))
    print("  index.html : en-tête + pied de page adaptés")

    # 6) générateur idempotent, puis régénération des 6 pages filles
    gen = dst / "tools/build-shop-pages.py"
    ecrire(gen, adapter_generateur(lire(gen)))
    r = subprocess.run([sys.executable, str(gen)], cwd=str(dst), capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())
    if r.returncode != 0:
        sys.exit("Le générateur a échoué (code %d)." % r.returncode)

    # 7) fichiers de service
    (dst / ".nojekyll").write_text("", encoding="utf-8")
    ecrire(dst / ".gitignore", "*.pyc\n__pycache__/\n.DS_Store\n")
    ecrire(dst / "README.md", README)

    # 8) contrôles
    manquants = [p for p in PAGES_ATTENDUES if not (dst / p).exists()]
    if manquants:
        sys.exit("Pages manquantes après génération : %s" % manquants)
    print("\n✓ 7 pages, %d fichiers au total" %
          len([f for f in dst.rglob("*") if f.is_file() and ".git" not in f.parts]))

    # 9) dépôt git
    if opt.git:
        identite = ["-c", 'user.name=Moussa N\'tji Diallo',
                    "-c", "user.email=Moussantjidiallo@gmail.com"]
        subprocess.run(["git", "init", "-q", "-b", "main"], cwd=str(dst), check=False)
        subprocess.run(["git", "symbolic-ref", "HEAD", "refs/heads/main"], cwd=str(dst), check=False)
        subprocess.run(["git", "add", "-A"], cwd=str(dst), check=True)
        message = ("Boutique en ligne — démo front-end complète (accueil, catalogue, fiche produit, "
                   "panier, espace client, suivi, admin)\n\n"
                   "- 7 pages, même template que l'accueil (source unique du design)\n"
                   "- panier, favoris, commandes, statuts et stocks persistés dans le navigateur\n"
                   "- espace client (demo@boutique.ml / demo1234), suivi par n° ou email, admin\n"
                   "- 100 % statique : publiable tel quel sur GitHub Pages")
        subprocess.run(["git"] + identite + ["commit", "-q", "-m", message], cwd=str(dst), check=True)
        print("✓ dépôt git initialisé (branche main) :",
              subprocess.run(["git", "log", "--oneline", "-1"], cwd=str(dst),
                             capture_output=True, text=True).stdout.strip())


if __name__ == "__main__":
    main()
