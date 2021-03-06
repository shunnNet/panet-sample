var express = require('express');
var router = express.Router();
const controller = require('../controller/media');
const customUtil = require('../controller/customUtil');
const multer = require('multer');
const upload = multer({ dest: './upload' });
const uploadField = [{ name: 'cover', maxCount: 1 }, { name: 'medias', maxCount: 1 }];

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
    .post(upload.fields(uploadField), // FIX : Handle Error when upexpected field
        controller.sanitize_form,
        controller.postCreate)


module.exports = router;
