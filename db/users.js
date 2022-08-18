const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  console.log(username,password);

  
  try {
    const {
      rows: [user]
    } = await client.query(
  `
   INSERT INTO users (username, password)
   VALUES ($1, $2)
   ON CONFLICT (username) DO NOTHING
   RETURNING id, username;
`,
  [username, password]
    );
    console.log({user});
    delete user.password;
    return user;
  } catch (error) {
    console.error(error); 
}
}
  

async function getUser({ username, password }) {
  
  const { rows: [user]} = await client.query(
    `SELECT * FROM users
     WHERE username = $1 AND password = $2
   
    `, [username, password]
    );
     if(!user) {
      return null;
    }
    delete user.password;
    return user;
  
  
  

}

async function getUserById(userId) {
  
  try{
    const { rows: [user] } = await client.query(`
    SELECT *
    FROM users 
    WHERE id = ${userId}
  `);
   
    delete user.password
    return user;
}catch (error){
  console.error(error);
}
}

async function getUserByUsername(userName) {
  
    const { rows: [user] } = await client.query(`
    SELECT *
    FROM users 
    WHERE id = ${userName}
  `)
  return user;
}


module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
