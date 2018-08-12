const express = require("express");
const router = express.Router();
router.get("/helper", (req, res) => {
    res.render("helper", {
        title: "Helpers",
    })
});

module.exports = router;