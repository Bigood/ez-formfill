# Installation

**Prérequis : [Node.js / npm](https://nodejs.org/en/download/)**

```bash
# Installation des modules
npm i
# Copie du fichier d'environnement
cp .env.example .env
# Configurer le fichier .env, puis
npm start
```

# Configuration .env

| Option | Description | Défaut |
| ------ | ----------- | ------ |
| `URL`   | Adresse cible, contenant un formulaire | *null* |
| `USE_PROXY_GENERATOR` | Utiliser un générateur de proxy inclus. Souvent bloqué par Cloudflare | *false* |
| `USE_PROXY_URL` | Utiliser un proxy manuel | *null* |
| `FAKER_LOCALE` | Régionnalité des données générées | *"fr"* |
| `ITERATIONS` | Nombre d'éxecutions du script | *1* |
| `PARALLEL_ITERATIONS` | Nombre d'éxecutions en parallèles | *3* |
| `MIN_SECONDS_TIMEOUT_BETWEEN_ITERATION` | Temps minimum à attendre entre deux iterations | *0* |
| `RANDOM_SECONDS_TIMEOUT_BETWEEN_ITERATION` | Temps maximum, aléatoire, ajouté au temps minimum | *180* |

