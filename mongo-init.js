use memory
db.createUser(
  {
      user: "bob",
      pwd: "bob",
      roles: [
          {
              role: "readWrite",
              db: "memory"
          }
      ]
  }
);