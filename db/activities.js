const client = require("./client")

// database functions
async function getAllActivities() {
  const { rows } = await client.query(`
          SELECT *
          FROM activities;
      `);

	return rows;

}

async function getActivityById(activityId) {
  const { rows: [activity] } = await client.query(`
        SELECT * 
        FROM activities
        WHERE id =${activityId};
      `);
	return activity;

  
}

async function getActivityByName(name) {
  const { rows: [activity] } = await client.query(
  `
    SELECT *
    FROM activities 
    WHERE name=$1;
  `,
  [ name ]
);

return activity
  
}

// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {
  
}

// return the new activity
async function createActivity({ name, description }) {
  const {
		rows: [activity],
	} = await client.query(
		`
  INSERT INTO activities (name, description) 
  VALUES($1, $2)
  ON CONFLICT (name) DO NOTHING
  RETURNING *;
  `,
		[name, description]
	);
	return activity;

}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, name, description }) {
  const {
		rows: [activity],
	} = await client.query(
		`
          UPDATE activities
          SET name=$1, description=$2
          WHERE id=$3
          RETURNING *;
      `,
		[name, description, id]
	);

	return activity;

}


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
