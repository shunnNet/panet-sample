var express = require('express');
var router = express.Router();
const controller = require('../controller/user');
const customUtil = require('../controller/customUtil');
const multer = require('multer')
const upload = multer({dest:'./upload'})

/* GET users listing. */


router.get('/:id',
    customUtil.urlSanitizer,
    controller.isOwner,
    controller.getPage); // FIX : modify controller name

router.route('/edit/my')
    .all(customUtil.redirectIfNotLogin)
    .get(controller.getEditPage)
    .post(upload.single('cover'),
        controller.sanitize_form,
        controller.postEditPage);


module.exports = router;
