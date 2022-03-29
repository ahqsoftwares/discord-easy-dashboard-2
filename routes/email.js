const { Router } = require("express");

const Email = Router().get("/start", async (req, res) => {
    req.session.user.data.email = true;
    return await res.redirect("/alert/Successfully updated!");
})
.get("/stop", async (req, res) => {
    req.session.user.data.email = false;
    return await res.redirect("/alert/Successfully Updated!");
})

module.exports.Router = Email;

module.exports.name = "/emails";
