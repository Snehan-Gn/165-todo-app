db = db.getSiblingDB("db_todoapp");

db.createUser({
  user: "app_backend",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "db_todoapp" },
    { role: "dbAdmin", db: "db_todoapp" }
  ]
});

db.createUser({
  user: "admin_app",
  pwd: "admin_password",
  roles: [
    { role: "userAdmin", db: "db_todoapp" },
    { role: "dbAdmin", db: "db_todoapp" }
  ]
});

db.getSiblingDB("admin").createUser({
  user: "backup_user",
  pwd: "backup_password",
  roles: [{ role: "readAnyDatabase", db: "admin" }]
});
