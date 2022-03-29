const { Router } = require("express");
const CheckAuth = (req, res, next) =>
    req.session.user ? next() : res.status(401).redirect("/auth/login");
const { Permissions } = require("discord.js");

const Selector = Router().get("/", CheckAuth, async (req, res) => {
    let file = req.dashboardConfig.theme["selector"] || "selector.ejs";

    if (req.dashboardConfig.mode[req.user.id] == "light") {
        file = req.dashboardConfig.theme["selectorl"] || "selectorl.ejs";
    }
    return await res.render(
        file,
        {
            bot: req.client,
            user: req.user,
            guilds: req.user.guilds.sort((a, b) =>
                a.name < b.name ? -1 : Number(a.name > b.name)
            ),
            is_logged: Boolean(req.session.user),
            Perms: Permissions,
            path: req.path,
            baseUrl: req.dashboardConfig.baseUrl,
            port: req.dashboardConfig.port,
            dashboardDetails: req.dashboardDetails,
            dashboardConfig: req.dashboardConfig,
            filter_server: req.session.user.data.filter,
            email: Boolean(req.session.user.email),
            hasemail: Boolean(req.dashboardConfig.user)
        },
        (err, html) => {
            if (err) {
                res.status(500).send(err.message);
                return console.error(err);
            }
            res.status(200).send(html);
        }
    );
})
.get("/filter", [CheckAuth], async (req, res) => {
    let file = req.dashboardConfig.theme["selector"] || "selector.ejs";

    if (req.dashboardConfig.mode[req.user.id] == "light") {
        file = req.dashboardConfig.theme["selectorl"] || "selectorl.ejs";
    }
    req.session.user.data.filter = true;
    
    return await res.redirect("/selector");
})
.get("/filter_false", [CheckAuth], async (req, res) => {
    let file = req.dashboardConfig.theme["selector"] || "selector.ejs";

    if (req.dashboardConfig.mode[req.user.id] == "light") {
        file = req.dashboardConfig.theme["selectorl"] || "selectorl.ejs";
    }
    req.session.user.data.filter = false;

    return await res.redirect("/selector");
});

module.exports.Router = Selector;

module.exports.name = "/selector";
