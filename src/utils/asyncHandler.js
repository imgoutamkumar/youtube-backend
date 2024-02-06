//using try catche
const asyncHandler = (func) => {
  return async (req, res, next) => {
    try {
      await func(req, res, next);
    } catch (error) {
      throw error;
    }
  };
};
/* 
//using Promises
const asyncHandler = (func) => {
  (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((err) => next(err));
  };
};
 */
module.exports = asyncHandler;
