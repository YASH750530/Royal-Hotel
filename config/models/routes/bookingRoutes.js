const express = require("express");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Booking API is working!"
    });
});

module.exports = router;