# Memory-node

## Préambule

Ce jeu "memory" est conçu pour présenter une application de type "fullstack".

Le jeu est basé sur une page `html` agrémentée d'un fichier `JavaScript` et deux fichiers `.css`.

Coté arrière-guichet, c'est NodeJS qui orchestre, accompagné d'une base de données MongoDB pour l'enregistrement des parties.

## Installation

### MongoDB

Afin de démarrer l'application, il est nécessaire d'installer MongoDB.

Vous pouvez utiliser une version installable sur votre machine
https://www.mongodb.com/try/download/community

ou créer un compte sur MongoDB Atlas pour disposer d'une base de données accessible en ligne
https://www.mongodb.com/cloud/atlas

Récupérer votre chaine pour la connection, et la renseigner dans le fichier .env (utilisé pour les variables d'environnement)
Celui-ci se situe à la racine du dossier `backend`.

### Front et Back

Dans ces deux dossiers, il est nécessaire d'installer les packages npm. A la racine des deux dossiers frontend et backend...

```
npm install && npm start
```

Rendez-vous sur http://localhost:8700 pour jouer.
