global.ENUMS = {
    TYPES : ["戲劇", "舞蹈", "音樂", "音樂劇", "歌舞劇", "展覽", "設計", "講座", "兒童劇","戶外演出","課程", "其他"],
    SKILLS : ["演員", "導演", "編劇", "製作人", "其他",
        "舞者", "翻譯", "劇照", "舞台設計", "燈光設計", "音響設計", "音響技術", "音效設計", "音樂設計",
        "影像設計", "影像技術", "舞台監督", "舞監助理", "導演助理", "排練助理",
        "編舞", "行政人員", "前台管理", "後台管理", "後台工作人員", "前台工作人員", "行政管理", "影像導演", "主持人",
        "服裝設計", "彩妝師", "科技藝術", "舞台技術設計", "平面設計", "表演教學", "舞蹈教學", "音樂教學", "歌唱教學", "武術指導"],
    WORK_PAY_FORM : ["天", "月", "小時", "CASE", "場", "排練"],
    MEDIA_FILE_STORAGE_TYPE : ["local", "youtube"],
    SEX : ["男", "女", "跨性別"],
    CITY : ["基隆市", "嘉義市", "台北市", "嘉義縣", "新北市", "台南市", "桃園縣", "高雄市", "新竹市", "屏東縣", "新竹縣", "台東縣", "苗栗縣", "花蓮縣", "台中市", "宜蘭縣", "彰化縣", "澎湖縣", "南投縣", "金門縣", "雲林縣", "連江縣"]
}

var createError = require('http-errors');
var express = require('express');
//var cors = require('cors');
var path = require('path');
const session = require('express-session')
var helmet = require('helmet');
var compression = require('compression');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
const customUtil = require('./controller/customUtil')
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const accountRouter = require('./routes/account')
const mediaRouter = require('./routes/media');
const ideaRouter = require('./routes/idea');
const eventRouter = require('./routes/event');
const workRouter = require('./routes/work');

const mongoose = require("mongoose")


const db_name = "********";
const user = "******";
const ps = "*******";
const mongodb__production = `mongodb+srv://${user}:${ps}@demo-r799k.gcp.mongodb.net/${db_name}?retryWrites=true&w=majority`;
const mongodb__development= 'mongodb://localhost/artnexus';


// DEVLOPMENT
var mongoDB =  global.ENV === "production" ? mongodb__production : mongodb__production;
/*
var mongoDB = process.env.NODE_ENV === "production" ? 
              mongodb__production : mongodb__development;
console.log(`Run in ${process.env.NODE_ENV} mode.`);*/
// set NODE_ENV=production(or development)

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!")
});

global.hostname = global.ENV === "production" ? 
                 "https://panet.herokuapp.com" : "https://localhost:3000"
var app = express();
/*
var corsOptions = {
    origin: 'https://mozilla.github.io',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }*/

app.locals.moment = require('moment');
app.locals.hostname = global.ENV === "production" ? 
                        "https://panet.herokuapp.com" : "https://localhost:3000"


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.use(cors())
app.use(helmet());
app.use(compression())


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // I have some question about it.

app.set('trust proxy',1)
//app.use(cors(corsOptions))
app.use(session({
    name: "atnx",
    resave: false,
    saveUninitialized: false,
    secret: "atnx",
    cookie: {
        maxAge: 10000000,
        secure: true
    }
}));
app.use(customUtil.loginStatus) // need fix , or it will fire every req
app.use(customUtil.addDataObj) // need fix , or it will fire every req


//app.use(cookieParser());


app.use("/static", express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/account', accountRouter);
app.use('/media', mediaRouter);
app.use('/work', workRouter);
app.use('/idea', ideaRouter);
app.use('/event', eventRouter);





// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
