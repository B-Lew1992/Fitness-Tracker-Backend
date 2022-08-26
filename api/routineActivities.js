const express = require('express');
const routineActivitiesRouter = express.Router();
const {
  updateRoutineActivity,
  canEditRoutineActivity,
  getRoutineActivityById,
  destroyRoutineActivity,
} = require('../db/routine_activities');
const { getRoutineById } = require('../db/routines');
const { requireUser } = require('./utils');

// PATCH /api/routine_activities/:routineActivityId
//Update the count or duration on the routine activity
routineActivitiesRouter.patch(
  '/:routineActivityId',
  requireUser,
  async (req, res, next) => {
    try {
      const { count, duration } = req.body;
      const { routineActivityId } = req.params;
      const { id: currentUserId } = req.user;
      const canEdit = await canEditRoutineActivity(
        routineActivityId,
        currentUserId
      );
      const updateObj = {};

      if (count) {
        updateObj.count = count;
      }
      if (duration) {
        updateObj.duration = duration;
      }
      if (canEdit) {
        updateObj.id = routineActivityId;
        const response = await updateRoutineActivity(updateObj);

        res.send(response);
      } else {
        const error = await getRoutineActivityById(routineActivityId);
        const { name } = await getRoutineById(error.routineId);
        next({
          error: 'Error!',
          name: 'NotCreatorOfRoutine',
          message: `User ${req.user.username} is not allowed to update ${name}`,
          status: 403,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/routine_activities/:routineActivityId
//Remove an activity from a routine, use hard delete
routineActivitiesRouter.delete(
  '/:routineActivityId',
  requireUser,
  async (req, res, next) => {
    try {
      const { routineActivityId } = req.params;
      const { id: currentUserId } = req.user;
      const canEdit = await canEditRoutineActivity(
        routineActivityId,
        currentUserId
      );
      const oldRoutine = await getRoutineActivityById(routineActivityId);
      if (canEdit) {
        await destroyRoutineActivity(routineActivityId);
        res.send(oldRoutine);
      } else {
        const error = await getRoutineActivityById(routineActivityId);
        const { name } = await getRoutineById(error.routineId);
        next({
          error: 'Error!',
          name: 'NotCreatorOfRoutine',
          message: `User ${req.user.username} is not allowed to delete ${name}`,
          status: 403,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = routineActivitiesRouter;
