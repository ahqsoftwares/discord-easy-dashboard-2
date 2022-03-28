const { Router } = require("express");

const Email = Router().get("/start", async (req, res) => {
    let cook = req.cookies;
    res.clearCookie("auth");
    cook.auth.email = true;
    res.cookie("auth", cook);
    return await res.redirect("/a/Successfully updated!");
})
.get("/stop", async (req, res) => {
    let cook = req.cookies;
    res.clearCookie("auth");
    cook.auth.email = false;
    res.cookie("auth", cook);
    return await res.redirect("/a/Successfully Updated!");
})

module.exports.Router = Email;

module.exports.name = "/emails";
