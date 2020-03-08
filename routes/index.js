var express = require('express');
var router = express.Router();
var process = require("process");
const indexController = require('../controller/index');

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/



router.get('/index', indexController.getIndexPage);

router.get('/query',(req,res,next) =>{
    next()
},
    indexController.sanitize,
    indexController.getQuery);

router.get('/catagories', indexController.getCatagoriesPage);

module.exports = router;
