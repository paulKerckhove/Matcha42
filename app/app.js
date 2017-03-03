var express = require('express'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');

// var favicon = require('serve-favicon');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.clients = [];



var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require('express-session');
var mysql = require('mysql');
var sendmail = require('sendmail')();



var router = express.Router();
var async = require('async');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var jsonParser = bodyParser.json();
var formidable = require('formidable');
var Promise = require("bluebird");
var Validator = require('./routes/methods.js');






// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/static', express.static('public'));
app.use(express.static(__dirname + '/public'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessions({
    secret: process.env.SESSION_SECRET || "secret",
    proxy: true,
    resave: true,
    saveUninitialized: true
    }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
server.listen(3000);


// mysql -u root -p
// p : root

// /Applications/MAMP/Library/bin/mysql --host=localhost -uroot -proot




var pool = require('./routes/connectionroutes');

var getStarted = require('./routes/getstartedRoute')(io);

var getFun = require('./routes/getFunctions.js');

var usersViews = require('./routes/usersViews.js')(io);

var usersActions = require('./routes/likeUser.js')(io);

var userNotif = require('./routes/notif.js');

var chattingVar = require('./routes/chatting.js')(io);



io.sockets.on('connection', function(socket) {

  socket.on('init', function(username){
    io.clients[username] = socket.id;
  })

});



app.use('/profile', function (req, res, next) {
  session = req.session;
  if (session.uniqueID == undefined) {
    res.redirect('/login');
  }  else {
    next();
  }
}, getStarted);


app.use('/users', function (req, res, next) {
  session = req.session;
  if (session.uniqueID == undefined) {
    res.redirect('/login');
  } else {
    next();
  }
}, usersViews);


app.use('/likeUser', function (req, res, next) {
  session = req.session;
  next();
}, usersActions);


app.use('/notif', function(req, res, next){
  session = req.session;
  if (session.uniqueID == undefined) {
    res.redirect('/login');
  } else {
    next();
  }
}, userNotif);


app.use('/chatting', function(req, res, next){
  session = req.session;
  if (session.uniqueID == undefined) {
    res.redirect('/login');
  } else {
    next();
  }
}, chattingVar);


app.get('/signup', function(req, res) {
  session = req.session;
  if(session.uniqueID) {
    return res.redirect('/redirect');
  } else {
    return res.render('signup.pug');
  }

});


app.get('/login', function(req, res) {
  session = req.session;
  if(session.uniqueID) {
    return res.redirect('/redirect');
  }
  return res.render('login.pug');
});


app.get('/resetP', function(req, res, next){
  res.render('resetP.pug');
});


app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/shrug', function(req, res) {
  return res.render('shrug.pug');
})


app.get('/admin', function(req, res) {
  session = req.session;
  if(session.uniqueID != 'admin') {
    res.send('Unauthorized acces <a href="/logout"> Please login here </a>');
  } else {
  res.send('You are the administrator <a href="/logout">KILL SESSION </a>');
  }
});


app.get('/chat', function(req, res){
  session = req.session;
  if (session.uniqueID == undefined) {
    res.redirect('/login');
  } else {
  res.render('./chat.pug');
  }
});



app.all('*', function findLastVisit(req, res, next) {
  if (req.session.user) {
    if (req.session.visited) {
      req.lastVisit = req.session.visited;
    }
    var date = new Date().toISOString().substr(0, 10);
    var time = new Date().toISOString().substr(11, 13).slice(0, -8);
    req.session.visited = 'Last seen on ' + date + ', at ' + time;
    query.editObject('users', req.session.user.id, { lastSeen: req.lastVisit || req.session.visited });
    // console.log('lastvisit: ', req.lastVisit)
  }
  next();
});



app.post('/signup', function(req, res){
  val = new Validator({
        dataSource: req.body,
        constraints: [{
                name: 'firstname',
                min: 3,
                regex: /^[a-zA-Z ]*$/
            },
            {
                name: 'lastname',
                min: 3,
                regex: /^[a-zA-Z ]*$/
            },
            {
                name: 'username',
                min: 4,
                max: 12,
                regex: /^[a-zA-Z0-9 ]*$/
            },
            {
                name: 'password',
                regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/g
            },
            {
                name: 'Email',
                regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            }
        ]
    })
    if (!val.validate()) {
        return res.redirect('/shrug')
    }
    if (!req.body.username || !req.body.password || !req.body.Email || !req.body.firstname || !req.body.lastname){
      return res.redirect('/signup')
    }

  var userExists;
  var emailExists;
  var user = {
    username: req.body.username,
    email: req.body.Email,
    first_name: req.body.firstname,
    last_name: req.body.lastname,
    password: req.body.password,

  };
  var age = 18;
  var sex = "m";
  var orientation = "b";
  var bio = "this is my bio !"

  var UserStartPackage = {
    username: req.body.username,
    age : age,
    sex : sex,
    orientation: orientation,
    bio : bio,
    first_name: req.body.firstname,
    last_name: req.body.lastname,
    email: req.body.Email,
  };


  function userSignup(user, callback){
    async.waterfall([
      function(cb) {
        pool.getConnection(function (err, connection) {
          var enteredUsername = req.body.username;
          connection.query('SELECT * FROM usersmain WHERE username = ?', enteredUsername , function (err, rows, fields) {

            // We check if we have the enteredUsername in the db

            if (rows.length < 1) {
              //console.log("Username does not exist");
              userExists = false;
              cb(null, userExists);
            } else {
            //  console.log("Username already taken");
              userExists = true;
              cb(null, userExists);
            }
          });
        });
      },

      // Now that we have checked the user we can use it as a parameter to check the email

      function (userExists, cb) {
        pool.getConnection(function (err, connection) {
          var enteredEmail = req.body.Email;
          // Error check
          connection.query('SELECT * FROM usersmain WHERE email = ?', enteredEmail , function (err, rows, fields) {
            // We check if we have the enteredEmail in the db
            if (rows.length < 1) {
              //console.log("Email is not already used");
              emailExists = false;
              cb(null, userExists, emailExists);
            } else {
              //console.log("This email is already used");
              emailExists = true;
              cb("");
            }
          });
        });
      }
    ],
    function (err, userExists, emailExists) {
      if (userExists == false && emailExists == false) {
        var desiredPassword = bcrypt.hashSync(user.password, salt);
        user.password = desiredPassword;
        pool.getConnection(function (err, connection) {
          connection.query('INSERT INTO usersmain SET ?', user, function (err, result) {
            if (err) {
              callback(err, "Signup failed please try again");
            } else {
              connection.query('INSERT INTO usersinfo SET ?', UserStartPackage, function (err, result){
                if (err){
                  //console.log(err);
                } else {
                  //console.log("UserStartPackage has been inserted");
                  /*callback(null, "Signup ok");*/
                }
              })
              //console.log("user has been inserted");
              callback(null, "Signup ok");
            }
          });
        });
      } else {
        callback(err, "Username and/or Email already exist")
      }
    }
  )};
  userSignup(user, function (err, callback) {
    if (err) {
      res.redirect('/shrug');
    } else {
      res.redirect('/login');
    }
  })
});



// Now we login with the informations in the db


function query (pool, sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      var query = sql
      connection.query(query, values, (err, rows) => {
        connection.release()
        err ? reject(err) : resolve(rows)
      })
    })
  })
}



app.post('/login', function(req, res) {

  val = new Validator({
        dataSource: req.body,
        constraints: [{
                name: 'username',
                min: 4,
                max: 12,
                regex: /^[a-zA-Z0-9 ]*$/
            }//,
            // {
            //     name: 'password',
            //     regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/g
            // }
        ]
    })
    if (!val.validate()) {
        return res.redirect('/login')
    }

  if (!req.body.username || !req.body.password){
    return res.redirect('/login')
  } else {
    let username = req.body.username;
    let password = req.body.password;
    loginUserifOk(pool, username)
    .then(function(rows){
      if (rows) {
        if (rows[0].username === username && bcrypt.compareSync(password, rows[0].password) == true) {
          req.session.uniqueID = rows[0].username;
          return res.redirect('/profile');
        } else {
          return res.render('shrug');
        }
      } else {
        return res.render('/shrug');
      }
    })
  }

});

function loginUserifOk (pool, username) {
  return query(pool, 'SELECT * FROM usersmain WHERE username = ?', [username])
}

app.post('/resetP', function (req, res){
  val = new Validator({
        dataSource: req.body,
        constraints: [{
                name: 'Email',
                regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            }
        ]
    })
    if (!val.validate()) {
        return res.redirect('/signup')
    }
    if (!req.body.email){
      return res.redirect('/resetP')
    }
	var mail = req.body.email;

	 if (mail == undefined) {
	 	return res.redirect('/resetP');
	 }

   lookForEmailToResetP(pool, mail)
   .then(function(rows){
     if (rows.length > 0){
       var pwd = Math.random().toString(36).slice(2);
       rows[0].password = pwd;

        sendmail({
          from: 'no-reply@matcha.com',
          to: rows[0].email,
          subject: 'Your password reset',
          html: 'Here is you new password ' + pwd,
        }, function(err, reply) {
          //console.log(err);
        });
        updateNewPassword(pool, pwd, mail)
        return res.redirect('/login')
     } else {
       return res.redirect('/signup')
     }
   })
})



/*                      /*
         Querys
/*                      */



function query (pool, sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      var query = sql
      connection.query(query, values, (err, rows) => {
        connection.release()
        err ? reject(err) : resolve(rows)
      })
    })
  })
}


function lookForEmailToResetP (pool, mail) {
  return query(pool, 'SELECT email, username, password FROM usersmain WHERE email = ?', [mail])
}


function updateNewPassword (pool, pwd, mail) {
  return query(pool, 'UPDATE usersmain SET password = ? WHERE email = ?', [[bcrypt.hashSync(pwd, salt)], [mail]])
}





app.get('/redirect', function(req, res) {
  session = req.session;
  if(session.uniqueID == 'admin') {
    res.redirect('/admin');
  } else {
    res.redirect('/profile')
    /*res.send(req.session.uniqueID + ' not found  <a href="/logout">KILL SESSION </a>');*/
  }
});

app.use(cookieParser());

app.get('/', function(req, res) {
  res.cookie("myFirstCookie", "looks Good");
  res.render('./main.pug');
});


// To remvove the cookie
app.get('/removeCookie', function(req, res) {
  res.cookie("myFirstCookie");
  res.render('./main.pug');
});
