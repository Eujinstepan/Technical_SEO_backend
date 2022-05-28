const router = require("express").Router();
const controllers = require("../controllers/controllers");

router.get("/insight", controllers.testApi);

module.exports = router;
