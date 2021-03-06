'use strict';

let express = require('express');
let router = express.Router();
let UserController = require('../controllers/user_controller');

router.get('/', UserController.getLoginPage);

router.post('/', UserController.postLoginInfo);

router.get('/logout',UserController.getLogout);
module.exports = router;