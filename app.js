// 依赖包
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var session = require('express-session');
var FileStore = require('session-file-store')(session);


// 自定义
var indexRouter = require('./routes/index');
var catalogRouter = require('./routes/catalog');
var contactRouter = require('./routes/contact');
var examRouter = require('./routes/exam');
var loginRouter = require('./routes/login');
var simulatorRouter = require('./routes/simulator')
var feedbackRouter = require('./routes/feedback');
var fileRouter = require('./routes/file');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

//basics
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

//session
app.use(session({
  name: 'usersession',
  secret: 'testing',
  store: new FileStore(),
  saveUninitialized: false,
  resave: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 3
  }
}));

//自定义
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/catalog', catalogRouter);
app.use('/contact', contactRouter);
app.use('/exam', examRouter);
app.use('/simulator', simulatorRouter);
app.use('/feedback', feedbackRouter);
app.use('/file', fileRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = app;
