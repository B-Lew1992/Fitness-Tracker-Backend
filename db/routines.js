const client = require('./client');

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
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines 
  INNER JOIN users
  ON routines."creatorId"=users.id;
`);

	return routines;
}

async function getAllRoutinesByUser({username}) {
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
	return routines;
}

async function getPublicRoutinesByUser({username}) {
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
	return routines;
}

async function getAllPublicRoutines() {
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines 
  INNER JOIN users
  ON routines."creatorId"=users.id
  WHERE routines."isPublic"=true;
`);

	return routines;
}

async function getPublicRoutinesByActivity({id}) {
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines 
  INNER JOIN users
  ON routines."creatorId"=users.id
  WHERE routines."isPublic"=true
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

	return routines;
}

async function createRoutine({creatorId, isPublic, name, goal}) {
  const {
		rows: [routine],
	} = await client.query(
		`
        INSERT INTO routines("creatorId", "isPublic", name, goal) 
        VALUES($1, $2, $3, $4) 
        RETURNING *;
      `,
		[creatorId, isPublic, name, goal]
	);

	return routine;
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