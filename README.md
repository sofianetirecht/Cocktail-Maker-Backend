# 🍹 Cocktail Maker — Backend

API REST pour l'application Cocktail Maker. Gère la recherche de cocktails, le matching par ingrédients, les cocktails surprise et la génération de recettes par IA.

## Présentation

Ce backend sert d'intermédiaire entre l'application mobile et l'API TheCocktailDB, en y ajoutant une couche de logique métier : traduction FR/EN des ingrédients, algorithme de matching avec scoring, conversion des unités impériales vers le métrique, et génération de recettes originales via l'API OpenAI.

**Projet personnel** développé en complément de ma formation à La Capsule.

## Fonctionnalités

- **Recherche par nom** — Proxy vers TheCocktailDB avec résultats traduits
- **Recherche par ingrédient** — Système de variantes englobantes (ex: "citron" cherche aussi "lemon juice", "lemon peel", "lemon zest")
- **Matching multi-ingrédients** — Algorithme de scoring qui classe les cocktails par pourcentage de correspondance avec les ingrédients fournis
- **Cocktail surprise** — Sélection aléatoire avec filtre alcool/sans alcool, système de cache (TTL 10 min), mode batch pour le swipe
- **Génération IA** — Endpoint POST qui envoie un prompt structuré à l'API OpenAI (GPT-4.1-mini) pour créer des recettes originales
- **Traduction FR ↔ EN** — Dictionnaire de 100+ ingrédients avec normalisation Unicode
- **Conversion d'unités** — oz → cl, tbsp → cl, tsp → cl, cups → cl, fractions → décimales

## Stack technique

- **Node.js** + **Express**
- **API OpenAI** (GPT-4.1-mini) pour la génération de recettes
- **TheCocktailDB** comme source de données cocktails
- Déployé sur **Render**

## Installation

```bash
git clone https://github.com/sofianetirecht/Kebapp-Backend.git
cd cocktail-maker-backend
yarn install
```

Créer un fichier `.env` à la racine :

```
OPENAI_API_KEY=ta_clé_openai
```

Lancer le serveur :

```bash
yarn start
# ou avec nodemon pour le développement
npx nodemon
```

Le serveur démarre sur `http://localhost:3000`.

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/cocktail/searchByName?name=...` | Recherche par nom |
| GET | `/cocktail/searchByIngredient?ingredient=...` | Recherche par ingrédient |
| GET | `/cocktail/match?ingredients=...` | Matching multi-ingrédients avec scoring |
| GET | `/cocktail/ingredients` | Liste de tous les ingrédients (traduits en FR) |
| GET | `/cocktail/surprise?alcohol=with/without` | Cocktail aléatoire |
| GET | `/cocktail/surprise/batch?count=4&alcohol=...` | Batch de cocktails aléatoires |
| GET | `/cocktail/:id` | Détails d'un cocktail par ID |
| POST | `/ai/original-recipe` | Génération de recette IA |

## Architecture du projet

```
├── app.js                 # Configuration Express, routes, middlewares
├── bin/www                # Point d'entrée serveur
├── routes/
│   ├── cocktail.js        # Routes cocktails (recherche, matching, surprise)
│   └── IA.js              # Route génération IA
└── models/
    └── connection.js      # (réservé pour une future base de données)
```

## Auteur

**Sofiane Tirecht** — Développeur Web & Mobile Fullstack
