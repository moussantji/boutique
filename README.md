# Boutique en ligne — démo front-end (Mali)

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
