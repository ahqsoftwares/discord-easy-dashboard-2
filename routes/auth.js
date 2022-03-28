const { Router } = require("express");
const CheckAuth = (req, res, next) => req.session.user ? next() : res.status(401).redirect("/auth/login");
const btoa = require("btoa");
const fetch = require("node-fetch");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nodemailer = require("nodemailer");
let transporter = "";

const Auth = Router()
    .get("/login", async (req, res) => {
        if (req.dashboardConfig.email_user !== null) {
            transporter = nodemailer.createTransport({
                host: "smtp-mail.outlook.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: req.dashboardConfig.email_user, // generated ethereal user
                  pass: req.dashboardConfig.email_pwd, // generated ethereal password
                },
            });
        }
        if (req.query.code) {
            /* Obtain token - used to fetch user guilds and user informations */
            const params = new URLSearchParams();
            params.set("grant_type", "authorization_code");
            params.set("code", req.query.code);
            params.set(
                "redirect_uri",
                `${req.dashboardConfig.baseUrl}${req.dashboardConfig.noPortIncallbackUrl ? '' : ':' + req.dashboardConfig.port}/auth/login`
            );
            let response = await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                body: params.toString(),
                headers: {
                    Authorization: `Basic ${btoa(
                        `${req.client.user.id}:${req.dashboardConfig.secret}`
                    )}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            // Fetch tokens (used to fetch user informations)
            const tokens = await response.json();
            // If the code isn't valid
            
            if (tokens.error || !tokens.access_token) return res.redirect("/auth/login");
            const userData = {
                infos: null,
                guilds: null,
            };
            while (!userData.infos || !userData.guilds) {
                /* User infos */
                if (!userData.infos) {
                    response = await fetch("http://discordapp.com/api/users/@me", {
                        method: "GET",
                        headers: { Authorization: `Bearer ${tokens.access_token}` },
                    });
                    const json = await response.json();
                    if (json.retry_after) await delay(json.retry_after);
                    else userData.infos = json;
                }
                /* User guilds */
                if (!userData.guilds) {
                    response = await fetch("https://discordapp.com/api/users/@me/guilds", {
                        method: "GET",
                        headers: { Authorization: `Bearer ${tokens.access_token}` },
                    });
                    const json = await response.json();
                    if (json.retry_after) await delay(json.retry_after);
                    else userData.guilds = json;
                }
            }
            // if ((typeof(req.file_old)) == undefined) {
            //     req.file_old = {
            //         email: true,
            //         filter: false
            //     }
            // }
            // Update session
            req.session.user = Object.assign(userData.infos, {
                guilds: Object.values(userData.guilds),
                token: tokens,
                data: {
                    email: true,
                    filter: false
                }
            });
            res.cookie("auth", {
                token: tokens.access_token,
                email: true,
                address: userData.infos.email,
                filter: false
            });
            if (req.dashboardConfig.email_user !== null && (req.session.user.data.email == null || req.session.user.data.email == true)) {
                let data = await transporter.sendMail({
                    from: req.dashboardConfig.email_user, // sender address
                    to: userData.infos.email, // list of receivers
                    subject: `Login Alert!`, // Subject line
                    text: `Successfully loggged in to dashboard`, // plain text body
                  });
            }
            
            if (req.dashboardConfig.test) {
                console.log(req.session.user);
                console.log(userData.infos.email);
                console.log(req.dashboardConfig.email_user);
            }
            req.dashboardEmit("newUser", req.session.user);
            res.status(200).redirect("/");
            req.dashboardConfig.mode[userData.infos.id] = "dark";
        } else {
            res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${req.client?.user?.id}&scope=email%20identify%20guilds&response_type=code&redirect_uri=${encodeURIComponent(`${req.dashboardConfig.baseUrl}${req.dashboardConfig.noPortIncallbackUrl ? '' : ':' + req.dashboardConfig.port}/auth/login`)}`);
        }
    })
    .get("/logout", [CheckAuth], function (req, res) {
        //req.file_old = req.session.user.data;
        req.session.destroy();
        res.status(200).redirect("/");
    })
    .get("/reset", [CheckAuth], function(req, res) {
        res.status(200).redirect("/auth/relog");
    })
    .get("/relog", [CheckAuth], async (req, res) => {
            // Fetch tokens (used to fetch user informations)
            const tokens = req.session.user.token;
            // If the code isn't valid
            
            if (tokens.error || !tokens.access_token) return res.redirect("/auth/login");
            const userData = {
                infos: null,
                guilds: null,
            };
            while (!userData.infos || !userData.guilds) {
                /* User infos */
                try {
                if (!userData.infos) {
                    response = await fetch("http://discordapp.com/api/users/@me", {
                        method: "GET",
                        headers: { Authorization: `Bearer ${tokens.access_token}` },
                    });
                    const json = await response.json();
                    if (json.retry_after) await delay(json.retry_after);
                    else userData.infos = json;
                }
                /* User guilds */
                if (!userData.guilds) {
                    response = await fetch("https://discordapp.com/api/users/@me/guilds", {
                        method: "GET",
                        headers: { Authorization: `Bearer ${tokens.access_token}` },
                    });
                    const json = await response.json();
                    if (json.retry_after) await delay(json.retry_after);
                    else userData.guilds = json;
                }
                } catch (e) {
                    console.log(e);
                    return res.redirect("./auth/login");
                }
            }
            let updated_user = Object.assign(userData.infos, {
                guilds: Object.values(userData.guilds),
                token: tokens,
                data: {
                    email: req.session.user.email || true,
                    filter: req.session.user.filter || false
                }
            });
            // Update session
            req.session.user = updated_user;
            res.status(200).redirect("/selector");
    });
module.exports.Router = Auth;

module.exports.name = "/auth";
