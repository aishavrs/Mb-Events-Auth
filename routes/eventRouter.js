const router = require("express").Router();
const {createEvent, getHostingEvents} = require("../controllers/eventcontroller");
const {upload} = require('../config/cloudinaryConfig')


router.post("/createevent", upload.single("photo"), createEvent)
router.get("/hosting/:userId", getHostingEvents);

module.exports = router