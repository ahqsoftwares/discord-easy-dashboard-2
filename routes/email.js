const { Router } = require("express");
const localStorage = require('localStorage');

const Email = Router().get("/start", async (req, res) => {
    await localStorage.setItem("email", true);
    return await res.redirect("/a/Successfully updated!");
})
.get("/stop", async (req, res) => {
    await localStorage.setItem("email", false);
    return await res.redirect("/a/Successfully Updated!");
})

module.exports.Router = Email;

module.exports.name = "/emails";
