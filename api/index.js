const express = require('express');
const apiRouter = express.Router();
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');

apiRouter.use(async (req, res, next) => {

   const prefix = 'Bearer ';
   const auth = req.header('Authorization');

   if (!auth) {
      next();
   } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);

      try {
         const { id } = jwt.verify(token, process.env.JWT_SECRET);

         if (id) {
            req.user = await getUserById(id);

            next();
         }
      } catch ({ name, message }) {
         next({ name, message });
      }
   } else {
      next({
         name: 'AuthorizationHeaderError',
         message: `Authorization token must start with ${prefix}`,
      });
   }

});

// GET /api/health
apiRouter.get('/health', async (req, res) => {

   const message = 'All is well, enjoy the 200!';
   res.send({ message });

});

// ROUTER: /api/users
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
apiRouter.use('/routine_activities', routineActivitiesRouter);

apiRouter.use((req, res, next) => {

   next({
      error: 'Error!',
      name: 'PageNotFound',
      message: 'The page you are looking for is not here',
      status: 404,
   });

});

// eslint-disable-next-line no-unused-vars
apiRouter.use((error, req, res, next) => {

   let errorStatus = 400;
   if (error.status) {
      errorStatus = error.status;
   }

   res.status(errorStatus).send({
      message: error.message,
      name: error.name,
      error: error.error,
   });
});

module.exports = apiRouter;
