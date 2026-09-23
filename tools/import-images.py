#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
import-images.py — Remplace les visuels de la boutique par TES photos,
sans rien régénérer.

Les pages pointent vers des noms de fichiers fixes : il suffit donc de copier
tes images aux bons emplacements, et le site se met à jour tout seul.

Usage :
    python3 tools/import-images.py --source /chemin/vers/mes/images
    python3 tools/import-images.py --source ./photos --dry-run     # simulation
    python3 tools/import-images.py --source ./photos --liste       # montrer les slots

L'association se fait automatiquement :
  1. par mots-clés dans le nom du fichier  (ex. « machine-a-laver.jpg »)
  2. sinon, par ordre alphabétique si tu fournis des fichiers numérotés (1.jpg, 2.jpg…)

Les fichiers d'origine ne sont pas modifiés : ils sont copiés (et redimensionnés
à 1 200 px max si Pillow est installé, pour garder le dépôt léger).
"""

import argparse
import pathlib
import shutil
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

# ── Emplacement attendu  →  mots-clés reconnus dans le nom de fichier ──────────
SLOTS = [
    ("img/shop/produits/smartphone-4g.jpg",   ["smartphone-4g", "telephone-4g", "phone-4g", "4g", "telephone", "mobile", "tel"]),
    ("img/shop/produits/smartphone-c.jpg",    ["smartphone-c", "phone-c", "smartphone-2", "smartphone-bleu"]),
    ("img/shop/tile-washer.jpg",              ["machine-a-laver", "machine", "lavage", "washer", "lave-linge"]),
    ("img/shop/produits/smartphone-5g.jpg",   ["smartphone-5g", "phone-5g", "5g", "titane"]),
    ("img/shop/produits/telephone-pro.jpg",   ["telephone-pro", "phone-pro", "pro", "flagship"]),
    ("img/shop/tile-speaker.jpg",             ["ventilateur", "ventilo", "fan"]),
    ("img/shop/produits/casque-audio.jpg",    ["casque", "headphone", "headset", "audio"]),
    ("img/shop/produits/montre-connectee.jpg", ["montre", "watch", "smartwatch", "bracelet"]),
    ("img/shop/produits/haut-parleur.jpg",    ["enceinte", "haut-parleur", "speaker", "bluetooth"]),
    ("img/shop/produits/powerbank.jpg",       ["batterie", "powerbank", "power-bank", "chargeur", "battery"]),
]

# ── Décors du template (optionnels : uniquement si tu fournis les fichiers) ─────
SLOTS_DECOR = [
    ("img/shop/hero-bg.jpg",       ["hero-bg", "hero", "banniere", "banner"]),
    ("img/shop/soldes-bg.jpg",     ["soldes-bg", "soldes", "promo-bg"]),
    ("img/shop/nouveautes-bg.jpg", ["nouveautes-bg", "nouveautes", "nouveau-bg"]),
    ("img/shop/tile-1.jpg",        ["tile-1", "decor-1"]),
    ("img/shop/tile-2.jpg",        ["tile-2", "decor-2"]),
]

EXT = {".jpg", ".jpeg", ".png", ".webp", ".avif"}


def images(source: pathlib.Path):
    fichiers = [f for f in sorted(source.rglob("*")) if f.suffix.lower() in EXT]
    return [f for f in fichiers if f.is_file()]


def classer(fichiers, slots):
    """Associe chaque image à un slot : mots-clés d'abord, puis ordre alphabétique."""
    restants = list(slots)
    paires, libres = [], []
    for f in fichiers:
        nom = f.stem.lower().replace("_", "-").replace(" ", "-")
        trouve = None
        for dest, mots in restants:
            if any(m in nom for m in mots):
                trouve = (dest, mots[0])
                break
        if trouve:
            paires.append((f, trouve[0]))
            restants = [r for r in restants if r[0] != trouve[0]]
        else:
            libres.append(f)

    # Les fichiers non reconnus remplissent les emplacements encore vides, dans l'ordre
    for f in libres:
        if not restants:
            break
        paires.append((f, restants.pop(0)[0]))
    return paires, [r[0] for r in restants]


def ecrire(src: pathlib.Path, dest: pathlib.Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image
        im = Image.open(src)
        im = im.convert("RGB")
        if max(im.size) > 1200:
            im.thumbnail((1200, 1200), Image.LANCZOS)
        im.save(dest, "JPEG", quality=85, optimize=True)
    except Exception:
        shutil.copy2(src, dest)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=False, help="dossier contenant tes photos")
    ap.add_argument("--dry-run", action="store_true", help="afficher sans copier")
    ap.add_argument("--liste", action="store_true", help="montrer la correspondance attendue")
    ap.add_argument("--decor", action="store_true", help="inclure aussi les décors (hero, soldes, tuiles)")
    a = ap.parse_args()

    if a.liste or not a.source:
        print("Emplacements attendus (les pages les utilisent déjà) :\n")
        for dest, mots in SLOTS + (SLOTS_DECOR if a.decor else []):
            etat = "✓ fourni" if (RACINE / dest).exists() else "· vide (image provisoire)"
            print("  %-42s %-16s %s" % (dest, etat, "mots-clés : " + ", ".join(mots[:4])))
        if not a.source:
            print("\nPuis : python3 tools/import-images.py --source /chemin/vers/mes/images")
        return

    source = pathlib.Path(a.source).expanduser()
    if not source.is_dir():
        sys.exit("Dossier introuvable : %s" % source)

    slots = SLOTS + (SLOTS_DECOR if a.decor else [])
    fichiers = images(source)
    if not fichiers:
        sys.exit("Aucune image (%s) dans %s" % (", ".join(sorted(EXT)), source))

    paires, vides = classer(fichiers, slots)

    print("Source : %s — %d image(s)\n" % (source, len(fichiers)))
    print("%-38s →  %s" % ("FICHIER FOURNI", "EMPLACEMENT UTILISÉ PAR LE SITE"))
    print("─" * 88)
    for src, dest in paires:
        print("%-38s →  %s" % (src.name, dest))
    if vides:
        print("\nEmplacements sans image (les visuels actuels restent en place) :")
        for v in vides:
            print("  · " + v)

    if a.dry_run:
        print("\n(simulation — aucune copie effectuée)")
        return

    for src, dest in paires:
        ecrire(src, RACINE / dest)
    print("\n✓ %d visuel(s) remplacé(s). Relance les tests : node tools/test-shop-pages.js" % len(paires))


if __name__ == "__main__":
    main()
