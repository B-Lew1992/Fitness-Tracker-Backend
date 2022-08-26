const express = require('express');
const activitiesRouter = express.Router();
const { requireUser } = require('./utils');
const {
  getAllActivities,
  getActivityById,
  createActivity,
  getActivityByName,
  updateActivity,
} = require('../db/activities');
const { getPublicRoutinesByActivity } = require('../db/routines');

// GET /api/activities/:activityId/routines
//Get a list of all public routines which feature that activity
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
  const id = req.params.activityId;

  try {
    const response = await getPublicRoutinesByActivity({ id });
    if (!(await getActivityById(id))) {
      next({
        name: 'ActivityNotFoundError',
        message: `Activity ${id} not found`,
        error: 'Error!',
      });
    }
    res.send(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {
  try {
    const response = await getAllActivities();

    res.send(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
//Create a new activity
activitiesRouter.post('/', requireUser, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const response = await createActivity({ name, description });
    if (response) {
      res.send(response);
    } else {
      next({
        name: 'ActivityAlreadyMade',
        message: `An activity with name ${name} already exists`,
        error: 'Error!',
      });
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
//Anyone can update an activity
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const { name, description } = req.body;
    const updateObj = {};
    updateObj.id = activityId;
    if (name) {
      updateObj.name = name;
    }
    if (description) {
      updateObj.description = description;
    }
    if (!(await getActivityById(activityId))) {
      next({
        name: 'ActivityNotFoundError',
        message: `Activity ${activityId} not found`,
        error: 'Error!',
      });
    }
    if (await getActivityByName(name)) {
      next({
        name: 'ActivityAlreadyMade',
        message: `An activity with name ${name} already exists`,
        error: 'Error!',
      });
    } else {
      const response = await updateActivity(updateObj);
      if (response) {
        res.send(response);
      } else {
        next({
          name: 'NoFieldsToUpdate',
          message: `Please provide a name or description to update`,
          error: 'Error!',
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;
