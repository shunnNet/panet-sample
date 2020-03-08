var express = require('express');
var router = express.Router();
const controller = require('../controller/idea');
const customUtil = require('../controller/customUtil');
const multer = require('multer')
const upload = multer({dest:'./upload'})

router.get('/:id',
    customUtil.urlSanitizer,
    controller.isOwner,
    controller.getPage);

router.route('/edit/:id')
    .all(customUtil.redirectIfNotLogin, 
        controller.isOwner,
        customUtil.redirectIfNotOwner)
    .get(controller.getEditPage)
    .post(upload.single('cover'),
        controller.sanitize_form,
        controller.postEditPage);

router.get('/edit/:id/delete',
    customUtil.redirectIfNotLogin,
    controller.isOwner,
    customUtil.redirectIfNotOwner,
    controller.validateDelete,
    controller.delete)

router.route('/create/new')
    .all(customUtil.redirectIfNotLogin)
    .get(controller.getCreatePage)
    .post(upload.single('cover'),
        controller.sanitize_form,
        controller.postCreate)

module.exports = router;
