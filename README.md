# todo-app

Application de gestion de tâches — module **E-P_DB_165** (ETML).

---

## 1. Description du projet

C’est une appli web où l’on peut créer un compte, se connecter et gérer ses todos (texte, date, complété ou pas). On peut aussi chercher dans ses tâches et modifier son profil. Le front est responsive avec un thème clair / sombre.

Le projet de base fourni par le client tournait avec **MySQL**. Pour ce module j’ai dû passer sur **MongoDB** (base document) et ajouter **Redis** pour le cache côté API.

---

## 2. Technologies

| Partie | Outils |
|--------|--------|
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, Vue Router |
| Backend | Node.js 20+, Express, Mongoose |
| Base de données | MongoDB 8 |
| Cache | Redis Stack 7 |
| Auth API | JWT (RS256), bcrypt |
| Conteneurs | Docker Compose |

Flux simple : **Vue** → **API Express** → **MongoDB** (+ **Redis** pour la liste des todos).

---

## 3. Installation locale

**Prérequis :** Node.js 20+, npm, Docker.

**Backend**

```sh
cd backend
cp .env.example .env
npm install
npm run dev
```

API sur `http://localhost:3000`

**Frontend** (autre terminal)

```sh
cd frontend
npm install
npm run dev
```

Ouvrir l’URL affichée par Vite (souvent `http://localhost:5173`).

> MongoDB et Redis doivent déjà tourner (voir section Docker).

---

## 4. Docker

À la **racine** du projet :

```sh
cp .env.example .env
docker compose up -d
```

Services lancés :
- **mongo** — port `27017`
- **redis** — port `6379` (interface Redis Insight sur `8001`)

Arrêter :

```sh
docker compose down
```

Tout supprimer (données comprises) :

```sh
docker compose down -v
```

Le script `docker-entrypoint-initdb.d/mongo-init.js` ne tourne qu’au **premier** création du volume Mongo. Si les users n’existent pas : `docker compose down -v` puis `docker compose up -d`.

Volumes utiles :
- `mongo_data` — données MongoDB
- `redis_data` — données Redis
- `./data/mongo` — dossier pour les backups (monté en `/backupdb` dans le conteneur)

---

## 5. Variables d’environnement

### Racine — `.env` (Docker Compose)

Copier depuis `.env.example` :

| Variable | Valeur par défaut | Usage |
|----------|-------------------|--------|
| `MONGO_ROOT_USERNAME` | `admin_user` | Admin MongoDB (conteneur) |
| `MONGO_ROOT_PASSWORD` | `admin_pwd` | Mot de passe admin MongoDB |
| `REDIS_PASSWORD` | `admin_pwd` | Mot de passe Redis |

### Backend — `backend/.env`

Copier depuis `backend/.env.example` :

| Variable | Exemple | Usage |
|----------|---------|--------|
| `MONGO_URI` | `mongodb://app_backend:app_password@localhost:27017/db_todoapp?authSource=db_todoapp` | Connexion Mongoose |
| `REDIS_URL` | `redis://:admin_pwd@localhost:6379` | Client Redis |
| `PORT` | `3000` | Port du serveur (optionnel) |

Ne pas committer les fichiers `.env` (déjà dans `.gitignore`).

---

## 6. MongoDB — utilisateurs et permissions

Fichier : `docker-entrypoint-initdb.d/mongo-init.js`  
Première ligne obligatoire :

```js
db = db.getSiblingDB("db_todoapp");
```

### `app_backend` / `app_password`

- Rôles : `readWrite`, `dbAdmin` sur `db_todoapp`
- Utilisé par le backend (`MONGO_URI`)
- CRUD complet, collections, index

### `admin_app` / `admin_password`

- Rôles : `userAdmin`, `dbAdmin` sur `db_todoapp`
- Admin limité à la base de l’app : stats, index, schémas
- Peut créer des utilisateurs **uniquement** sur `db_todoapp`

### `backup_user` / `backup_password`

- Rôle : `readAnyDatabase` (défini sur `admin`)
- Lecture seule sur toutes les bases
- Pour `mongodump` / `mongoexport`, pas d’écriture

### Root Docker

- `admin_user` / `admin_pwd` — administration serveur, restore, etc.

Vérification :

```sh
docker exec mongo mongosh -u admin_user -p admin_pwd --authenticationDatabase admin --eval "db.getSiblingDB('db_todoapp').getUsers()"
```

---

## 7. Backup / Restore

### Backup (fichier compact)

```sh
docker exec mongo mongodump \
  --uri="mongodb://backup_user:backup_password@localhost:27017/?authSource=admin" \
  --db=db_todoapp \
  --gzip \
  --archive=/backupdb/db_todoapp-backup.gz
```

Fichier généré : `data/mongo/db_todoapp-backup.gz`

- `--gzip` : compresse les données
- `--archive` : un seul fichier (moins lourd qu’un dossier dump classique)
- `backup_user` : compte lecture seule prévu pour ça

### Restore

```sh
docker exec mongo mongorestore \
  --uri="mongodb://admin_user:admin_pwd@localhost:27017/?authSource=admin" \
  --gzip \
  --archive=/backupdb/db_todoapp-backup.gz \
  --drop
```

`--drop` supprime les collections existantes avant l’import. Il faut le compte **admin**, pas `backup_user`.

---

## 8. Usage de l’IA

L'IA a été d'une grande aide pour peaufiner le rapport. (Pas le contenu mais le visuel de ce dernier pour qu'il soit plus agréable à lire). 

En ce qui concerne le code, l'IA m'a servi lors des situations où je devais réaliser des tâches redondantes comme supprimé le code lié à MySQL devenu inutile mais aussi pour régler des problèmes mineures dans le code comme des fautes de synthaxe. Le moment où l'IA m'a vraiment aidé c'est pour lier mon mongo-init.js à mon conteneur docker car j'avais fini le fichier pour créer les users mais docker ne reconnaissait pas le fichier donc l'IA m'a aidé pour ce problème en me signalant que le problème venait d'une ligne dans mon docker compose.
---

## 9. Conclusion

Le projet était assez intéressant en soit car il nous a permis de mettre en pratique les connaissances du module car personnellement, bien que j'ai eu une bonne note au test du module, je n'étais pas sûr de pouvoir appliquer ces connaissances. Ce projet était donc parfait pour vraiment voir l'utilité de mongodb et comment s'en servir en situation réel. 
Le seul point négatif que j'aurais pour le projet est que le projet demande de réaliser pas mal de tâches qui sont assez pénibles pour enlever MySQL et ses dépendences donc je pense que j'aurais préféré juste faire le projet sans toute la partie "Supression de MySQL" car c'était une tâche qui serait vraiment lente sans l'IA. 

Docs complémentaires : [docs/README.md](./docs/README.md) · [backend](./backend/README.md) · [frontend](./frontend/README.md)

---

## Captures d’écran

![Todos](./img/tasks.png)

![Login](./img/login.png)

![Register](./img/register.png)

![Profile](./img/profile.png)
