db = db.getSiblingDB("db_todoapp");

/**
 * Utilisateur 1 : app_backend
 * Accès limité à la base de l’application uniquement, l’autorisant à :
 * - Créer la base de données (automatique lors de l'insertion) ;
 * - Ajouter des collections à cette base de données ;
 * - Créer/modifier des indexes ;
 * - Insérer/mettre à jour/supprimer des données .
 */
db.createUser({
  user: "app_backend",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "db_todoapp" },
    { role: "dbAdmin", db: "db_todoapp" }
  ]
});

/**
 * Utilisateur 2 : admin_app
 * Administrateur limité à la base de données de l’application :
 * - Peut créer des index, voir les stats, gérer les schémas ;
 * - Peut aussi créer des utilisateurs dans la base de l’application uniquement.
 */
db.createUser({
  user: "admin_app",
  pwd: "admin_password",
  roles: [
    { role: "userAdmin", db: "db_todoapp" },
    { role: "dbAdmin", db: "db_todoapp" }
  ]
});

/**
 * Utilisateur 3 : backup_user
 * Accès lecture seule global :
 */
db.getSiblingDB("admin").createUser({
  user: "backup_user",
  pwd: "backup_password",
  roles: [
    { role: "readAnyDatabase", db: "admin" }
  ]
});
