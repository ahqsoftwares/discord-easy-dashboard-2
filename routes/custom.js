const { Router } = require("express");
const CheckAuth = (req, res, next) =>
    req.session.user ? next() : res.status(401).redirect("/auth/login");

const Commands = Router().get("/*", [CheckAuth], function (req, res) {
    const path = req.baseUrl.split("/").pop();
    if (!req.dashboardConfig.theme[path]) {
        let file = req.dashboardConfig.theme["404"] || "404.ejs";

        if (req.dashboardConfig.mode[req.user.id] == "light") {
            file = req.dashboardConfig.theme["405"] || "404l.ejs";
        }
        let err_type = "404";
        if (path == "ahq_dash_perms_error") {
            err_type = path;
        } else if (path == "ahq_dash_error") {
            err_type = path;
        } else if (path == "404") {
            err_type = "404";
        } else {
            err_type = "404";
        }
        return res.status(404).render(file, {
            bot: req.client,
            user: req.user,
            is_logged: Boolean(req.session.user),
            dashboardDetails: req.dashboardDetails,
            dashboardConfig: req.dashboardConfig,
            baseUrl: req.dashboardConfig.baseUrl,
            port: req.dashboardConfig.port,
            hasClientSecret: Boolean(req.dashboardConfig.secret),
            commands: req.dashboardCommands,
            err: err_type,
            email: Boolean(req.cookies.auth.email),
            hasemail: Boolean(req.dashboardConfig.user)
        });
    }
    res.status(200).render(req.dashboardConfig.theme[path], {
        bot: req.client,
        user: req.user,
        is_logged: Boolean(req.session.user),
        dashboardDetails: req.dashboardDetails,
        dashboardConfig: req.dashboardConfig,
        baseUrl: req.dashboardConfig.baseUrl,
        port: req.dashboardConfig.port,
        hasClientSecret: Boolean(req.dashboardConfig.secret),
        commands: req.dashboardCommands,
        email: Boolean(req.cookies.auth.email),
        hasemail: Boolean(req.dashboardConfig.user)
    });
});
module.exports.Router = Commands;

module.exports.name = "/*";
