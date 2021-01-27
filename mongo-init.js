db.createUser(
  {
      user: "oclock",
      pwd: "oclock",
      roles: [
          {
              role: "readWrite",
              db: "memory"
          }
      ]
  }
);