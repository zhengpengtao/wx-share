var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var shareRouter = require('./routes/share')

var app = express();
// 允许跨域
// app.all('*', function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://192.168.1.41:8089");
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   console.log(req.method, 'req.method')
//   if(req.method === "OPTIONS") res.send(200);/*让options请求快速返回*/
//   else  next();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(
  {
    origin: [
      'http://localhost:8089',
      'http://192.168.1.41:8089',
      'https://app-test.zuhaobao.com.cn/'   // 允许的域名
    ],
    credentials: true,   // 允许cookie
  }
));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/share', shareRouter)

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

module.exports = app;
