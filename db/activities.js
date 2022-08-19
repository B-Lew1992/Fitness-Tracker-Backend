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
const routinesToReturn = [...routines];
const bind = routines.map((_,index) => `$${index + 1}`).join(',');
const routineIds = routines.map((routine) => routine.id);
if(!routineIds?.length) return [];

try {
  const { rows: activities } = await client.query(`
    SELECT activities.*, routine_activities.duration,
    routine_activities.count, routine_activities.id AS "routineActitivyId",
    routine_activities."routineId"
    FROM activities
    JOIN routine_activities ON routine_activities."activityId" = activities.id
    WHERE routine_activities."routineId" IN (${ binds });
  `, routineIds);

  // loop over the routines 
  for (const routine of routinesToReturn) {
    // filter the activities to only include those that have this routineId
    const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
    // attach activities to each single routine
    routine.activities = activitiesToAdd;
  }
  
  return routinesToReturn;
} catch (error) {
  console.error(error);
}

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
async function updateActivity({ id, ...fields}) {
  const setString = Object.keys(fields).map((key, index) =>
  `"${key}"=$${index + 1}`).join(",");
  try {
    const {rows: [activities]} = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields));

    return activities;
  } catch (error) {
    console.error(error, 'Activities did not update');
  }

}


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
