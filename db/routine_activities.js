const client = require('./client')

async function getRoutineActivityById(id){
  const {
		rows: [routine],
	} = await client.query(`
            SELECT *
            FROM routine_activities
            WHERE id=${id};
        `);
	return routine;
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  const {
		rows: [routine_activity],
	} = await client.query(
		`
  INSERT INTO routine_activities("routineId", "activityId", count, duration)
  VALUES($1,$2,$3,$4)
  ON CONFLICT ("routineId", "activityId") DO NOTHING
  RETURNING *;
`,
		[routineId, activityId, count, duration]
	);

	return routine_activity;
    
}

async function getRoutineActivitiesByRoutine({id}) {
  const { rows: routines } = await client.query(`
            SELECT *
            FROM routine_activities
            WHERE "routineId" = ${id};
        `);

	return routines;
}

async function updateRoutineActivity ({id, count, duration}) {
  const {
		rows: [activity],
	} = await client.query(
		`
            UPDATE routine_activities
            SET count=$1, duration=$2
            WHERE id=${id}
            RETURNING *;
        `,
		[count, duration]
	);

	return activity;
}

async function destroyRoutineActivity(id) {
  const {
		rows: [routine],
	} = await client.query(
		`
        DELETE
        FROM routine_activities
        WHERE id=$1
        RETURNING *;
    `,
		[id]
	);
	return routine;
}

async function canEditRoutineActivity(routineActivityId, userId) {
  const {
    rows: [canEdit],
  } = await client.query(`
    SELECT * FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id
    AND routine_activities.id = $1;
  `, [routineActivityId]);

  return canEdit.creatorId === userId;
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
