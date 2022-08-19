const client = require('./client');
const {attachActivitiesToRoutines} = require('./activities')
const {getRoutineActivityById} = require('./routine_activities')

async function getRoutineById(id){
  const {
		rows: [routine],
	} = await client.query(
		`
      SELECT *
      FROM routines
      WHERE id=${id},
    `
	);
 
	return routine;
}


async function getRoutinesWithoutActivities(){
  const { rows } = await client.query(`
  SELECT *
  FROM routines;
`);
	return rows;
}

async function getAllRoutines() {
  try {
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines 
  INNER JOIN users
  ON routines."creatorId"=users.id;
`);

	return await attachActivitiesToRoutines(routines)
  } catch (error){console.error(error)
  }
}

async function getAllRoutinesByUser({username}) {
  try {
  const { rows: routines } = await client.query(
		`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines 
        INNER JOIN users
        ON routines."creatorId"=users.id
        WHERE users.username=$1;
        `,
		[username]
	);
	return attachActivitiesToRoutines(routines);
  }catch(error){console.error(error)}
}

async function getPublicRoutinesByUser({username}) {
  try {
  const { rows: routines } = await client.query(
		`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines 
            INNER JOIN users
            ON routines."creatorId"=users.id
            WHERE routines."isPublic"=true
            AND users.username=$1;
        `,
		[username]
	);
	return attachActivitiesToRoutines(routines);
  }catch(error){console.error(error)}
}

async function getAllPublicRoutines() {
  try {
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines 
  INNER JOIN users
  ON routines."creatorId"=users.id
  WHERE routines."isPublic"=true;
`);

	return await attachActivitiesToRoutines(routines);
  }catch(error){console.error(error)}
}

async function getPublicRoutinesByActivity({id}) {
  try {
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines 
  JOIN users
  ON routines."creatorId"=users.id
  JOIN routine_activities ON routine_activities."routineId"=routines.id
  WHERE routine_activities."activityId"=${id} AND routines."isPublic"=true
`);

	const { rows: routine_activities } = await client.query(`
SELECT * 
FROM routine_activities;
`);

	routines.map((routine) => {
		routine.activities = [];

		routine_activities.map((activity) => {
			let workoutData = {
				id: activity.id,
				activityId: activity.activityId,
				count: activity.count,
				duration: activity.duration,
			};
			if (activity.routineId === routine.id) {
				if (activity.activityId === id);
				routine.activities.push(workoutData);
			}
		});
	});

	return attachActivitiesToRoutines(routines);
}catch(error){console.error(error)}
}

async function createRoutine({creatorId, isPublic, name, goal}) {
  try{
  const {
		rows: [routine]
	} = await client.query(
		`
        INSERT INTO routines("creatorId", "isPublic", name, goal) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
      `,
		[creatorId, isPublic, name, goal]
	);

	return routine;
  }catch(error){console.error(error)}
}

async function updateRoutine({id, isPublic, name, goal}) {
  const routine = await createRoutine(id);

if (!isPublic) {
  isPublic = routine.isPublic;
}

if (!name) {
  name = routine.name;
}

if (!goal) {
  goal = routine.goal;
}

const {
  rows: [routines],
} = await client.query(
  `
UPDATE routines
SET "isPublic"=$1, name=$2, goal=$3
WHERE id=${id}
RETURNING *;
`,
  [isPublic, name, goal]
);

// console.log(routines);

return routines;
}

async function destroyRoutine(id) {
  const {
		rows: [routine],
	} = await client.query(
		`
            DELETE FROM routines
            WHERE id=$1
            RETURNING *;
        `,
		[id]
	);

	await client.query(
		`
            DELETE FROM routine_activities
            WHERE "routineId"=$1
            RETURNING *;
        `,
		[id]
	);

	return routine;
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}