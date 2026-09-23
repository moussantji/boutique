#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
serve-boutique.py — Petit serveur de prévisualisation de la boutique.

    python3 tools/serve-boutique.py            # http://localhost:8001
    python3 tools/serve-boutique.py --port 9000

Différence avec `python3 -m http.server` lancé à la racine du dépôt :
    la racine « / » ouvre directement la boutique (index.html)
    au lieu du portfolio, et les autres pages sont accessibles en un clic :

        /                        → accueil boutique (redirige)
        /index.html      → accueil boutique
        /produits.html           → catalogue (filtres, tri, pagination)
        /produit.html?p=... → fiche produit
        /panier.html   → panier + commande
        /index.html              → portfolio (site principal)

Aucune dépendance : bibliothèque standard uniquement.
"""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import pathlib

RACINE = pathlib.Path(__file__).resolve().parent.parent
ACCUEIL = "/index.html"

PAGES = [
    ("/", "Accueil boutique"),
    ("/produits.html", "Catalogue (filtres, tri, pagination)"),
    ("/produit.html?p=telephone-mobile-4g", "Fiche produit"),
    ("/panier.html", "Panier + commande"),
    ("/index.html", "Portfolio (site principal)"),
]


class Handler(SimpleHTTPRequestHandler):
    """Sert le dépôt, mais renvoie la boutique sur « / »."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(RACINE), **kwargs)

    def do_GET(self):
        if self.path in ("/", "/index.htm"):
            self.send_response(302)
            self.send_header("Location", ACCUEIL)
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        # évite tout cache pendant la prévisualisation
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print("  %s — %s" % (self.address_string(), fmt % args), flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8001)
    ap.add_argument("--host", default="0.0.0.0")
    a = ap.parse_args()

    os.chdir(RACINE)
    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    print("Boutique servie depuis %s" % RACINE)
    print("→ http://localhost:%d%s\n" % (a.port, ACCUEIL))
    print("Pages :")
    for url, libelle in PAGES:
        print("   %-46s %s" % (url, libelle))
    print("\nCtrl+C pour arrêter.\n")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté.")


if __name__ == "__main__":
    main()
