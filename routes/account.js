const process = require("process");
const express = require('express');
const router = express.Router();
const accountController = require("../controller/account")




router.route("/login")
    .all(accountController.ifLogin)
    .get(accountController.track_referer, 
        accountController.get_login)
    .post(accountController.login_validation,
        accountController.login,
        accountController.login_distribution);

router.all("/logout", accountController.logout)

router.route("/registry")
    .all(accountController.ifLogin)
    .get(accountController.get_registry)
    .post(accountController.registry_validation,
        accountController.registry_distribution,
        accountController.registry);

router.route("/activate")
    .get(accountController.activate_distribution,
        accountController.activate);

router.route("/forgetpassword")
    .all(accountController.ifLogin)
    .get(accountController.get_forgetps)
    .post(accountController.forgetps_validation,
        accountController.forgetps);

router.get("/forgetpassword_active", accountController.forgetpassword_active);

router.route("/resetpassword")
    .get(accountController.get_resetps)
    .post(accountController.resetps_validation,
        accountController.resetPassword)


module.exports = router;
