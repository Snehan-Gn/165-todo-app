db = db.getSiblingDB('db_todoapp');

/**
 * UTILISATEUR 1 : app_backend
 * Rôle : Accès complet pour le fonctionnement de l'API (CRUD, collections, index).
 */
db.createUser({
  user: 'app_backend',
  pwd: 'app_password', 
  roles: [
    { role: 'readWrite', db: 'db_todoapp' }, 
    { role: 'dbAdmin', db: 'db_todoapp' } 
  ]
});

/**
 * UTILISATEUR 2 : admin_app
 * Rôle : Administrateur de la base de données (index, stats, gestion des utilisateurs).
 */
db.createUser({
  user: 'admin_app',
  pwd: 'admin_password',
  roles: [
    { role: 'userAdminInDB', db: 'db_todoapp' }, 
    { role: 'dbStats', db: 'db_todoapp' }, 
    { role: 'dbAdmin', db: 'db_todoapp' } 
  ]
});

/**
 * UTILISATEUR 3 : backup_user
 * Rôle : Accès lecture seule global pour les sauvegardes (mongodump).
 */
db.getSiblingDB('admin').createUser({
  user: 'backup_user',
  pwd: 'backup_password',
  roles: [
    { role: 'readAnyDatabase', db: 'admin' } 
  ]
});

print('Initialisation des utilisateurs MongoDB terminée avec succès !');
