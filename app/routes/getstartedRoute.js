var express = require('express');
var http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');
var router = express.Router();
var pool = require('./connectionroutes');
var async = require('async');
var fun = require('./getFunctions');
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google'
  };
var geocoder = NodeGeocoder(options);
var Validator = require('./methods.js');


module.exports = function(io){



function getUserPicture (pool, username) {
  return query(pool, 'SELECT new_path FROM photos WHERE username = ? LIMIT 5', [username])
}


function getUserprofile (pool, username) {
  return query(pool, 'SELECT username, age, sex, orientation, bio, first_name, last_name, email FROM usersinfo WHERE username = ?', [username])
}


function checkforTags (pool, username) {
  return query(pool, 'SELECT tags.tags FROM tags INNER JOIN user_tags ON user_tags.tag_id = tags.id WHERE user_tags.username = ?', [username])
}


function getUserTagsForProfilePage2 (pool) {
  return query(pool, 'SELECT id, tags FROM tags')
}


function getUserTagsForProfilePage (pool, username) {
  return query(pool, 'SELECT tag_id FROM user_tags WHERE username = ?', [username])
}

router.get('/', function (req, res) {
  // var session = req.session;
  let username = session.uniqueID;
  let userInfosForPug;
  let dataUserTagsLoop = [];
  let count = 0;
  let Ustags;
  let taglen;
  let piclen;
  let countPic = 0;
  let dataUserPictures = [];
  let blocked = [];
  checkIfBlocked(pool, username)
  .then(function(rows){
    if (rows.length > 0){
      blocked = rows;
    }
  })
  fun.getUserprofile(username, function (err, callback) {
    if (err) {
      res.redirect('/login');
    } else {
      userInfosForPug = callback;
      fun.getUserTags(username, function (err, callback) {
        let  dataUserTags = [];
        if (err) {
          //console.log(err);
        } else {
          dataUserTags = callback;
          async.each(dataUserTags, function(drdre, callback){
            // console.log("about to look for the tags");
            pool.getConnection(function (err, connection) {
              connection.query('SELECT * FROM tags WHERE id = ?', drdre.tag_id , function (err, rows, fields) {
                if (err) {
                  // console.log(err);
                  connection.release();
                  callback(err);
                } else {
                  // console.log("we have the tags");
                  /*console.log(rows[0]);*/
                  dataUserTagsLoop[count] = rows[0].tags;
                  count++;
                  connection.release();
                  callback(null, dataUserTagsLoop);
                }
              });
            });
          }),
          fun.getUserPicturesMofo(username, function (err, callback){
            // console.log("about to look for the  pictures");
            if (err){
              // console.log("err");
            } else {
              dataUserPictures = callback;
              /*console.log(dataUserPictures);*/
              // console.log("we have the pictures");
              async.each(dataUserPictures, function(biggie, callback){
                dataUserPictures[countPic] = dataUserPictures[countPic].new_path;
                countPic++;
                callback(null, dataUserPictures);
              },
              function (err, results) {
              /*console.log(dataUserTagsLoop);*/
              taglen = dataUserTagsLoop.length;
              piclen = dataUserPictures.length;
              return res.render('./profile.pug', {userinfo: userInfosForPug, tags: dataUserTagsLoop, taglen: taglen, piclen: piclen, dataUserPictures: dataUserPictures, blocked :blocked});
            })
            }
          });
        }
      })
    }
  })
});







router.post('/profile', function (req, res) {
  val = new Validator({
        dataSource: req.body,
        constraints: [{
                name: 'firstname',
                min: 3,
                regex: /^[a-zA-Z]*$/
            },
            {
                name: 'lastname',
                min: 3,
                regex: /^[a-zA-Z]*$/
            },
            {
                name: 'username',
                min: 4,
                max: 12,
                regex: /^[a-zA-Z0-9]*$/
            },
            {
                name: 'age',
                regex: /^[0-9]*$/
            },
            {
                name: 'Email',
                regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            },
            {
                name: 'bioBox',
                regex: /^[a-zA-Z .!?]*$/
              }
        ]
    })
    if (!val.validate()) {
        return res.send('wrong profile informations')
    }



  username = session.uniqueID;
  var bio = req.body.bioBox;
  var sex = req.body.sex;
  var orientation = req.body.orientation_filter;
  var age = req.body.age;
  var first_name = req.body.firstName;
  var last_name = req.body.lastName;
  var email = req.body.userEmail;
  if (parseInt(req.body.age) < 18 || parseInt(req.body.age) > 100) {
    return res.send('wrong age')
    // return res.redirect('/profile')
  }

  function UserStart(username, callback) {
    async.waterfall([
      function(cb) {
        pool.getConnection(function (err, connection) {

          var data = {
            bio: bio,
            username: username,
            sex: sex,
            orientation: orientation,
            age: age,
            first_name: first_name,
            last_name: last_name,
            email: email,
          };
          connection.query('UPDATE IGNORE usersinfo SET ?', data , function (err, rows, fields) {
            if (err) {
              //console.log("error 1" + err);
              connection.release();
            } else {
              connection.release();
            }
            callback(null, "");
          });
        });
      }
    ],
    function (err, bio) {
      if (err) {
        //console.log(err);
        callback(err);
      } else {
        callback(null, bio);
      }
    })
  }
  UserStart(username, function (err, callback) {
    if (err) {
      res.send('wrong profile informations')
    } else {
      return res.status(201).send('test')
    }
  })
});



router.post('/tagsPost', function(req, res) {
  // console.log('/tagsPost function');
  username = session.uniqueID;
  var tags;
  tags = req.body['userTags[]'];
  function UserStart(username, callback) {
    async.waterfall([
      function (cb) {
        async.each(tags, function(tags, callback){
          var data = {
            tags: tags,
          };
            pool.getConnection(function (err, connection) {
              if (err) {
                //console.log(err);
                callback(err);
              }
              connection.query('SELECT * FROM tags WHERE tags = ?', [tags], function(err, rows, fields) {
                if (rows.length == 0) {
                  connection.query('INSERT INTO tags SET ?', data , function (err, rows, fields) {
                    connection.release();
                    callback();
                  });
                } else {
                  connection.release();
                  callback();
                }
              });
            });
        },
        function (err) {
          if (err) {
            //console.log(err);
            cb(err);
          } else {
            cb(null, null);
          }
        });
      },
      function (results, cb) {
        async.each(tags, function(tags, callback){
          var data = {
            tags: tags,
          };
            pool.getConnection(function (err, connection) {
              if (err) {
                //console.log(err);
                callback(err);
              }
              connection.query('SELECT * FROM tags WHERE tags = ?', [tags], function(err, rows, fields) {
                if (rows.length > 0) {
                  var usertagInsert = {
                    username: username,
                    tag_id: rows[0].id
                  };
                  connection.query('INSERT INTO user_tags SET ?', usertagInsert, function (err, result) {
                    if (err) {
                      //console.log(err);
                      connection.release();
                      callback(err);
                    } else {
                      connection.release();
                      callback();
                    }
                  });
                } else {
                  connection.release();
                  callback("error");
                }
              });
            });
        },
        function (err) {
          if (err) {
            //console.log(err);
            cb(err);
          } else {
            cb(null, null);
          }
        });
      }
    ],
    function (err, results) {
      if (err) {
        //console.log(err);
        callback(err);
      } else {
        callback(null, null);
      }
    });
  }
  UserStart(username, function (err, callback) {
      res.redirect(err ? 401 : 200, '/profile');
  })
});



router.post('/userPhoto', function(req, res) {
  let username = session.uniqueID;
  // console.log('userphoto function');
  checkForNumberOfPics(pool, username)
  .then(function(rows){
    if (rows.length > 5) {
      console.log("lenght is ", rows.length);
      return res.render('/profile')
    } else {
      username = session.uniqueID;
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
        if (files.file.type == 'image/jpeg' || files.file.type == 'image/jpg' || files.file.type == 'image/png'){
          var old_path = files.file.path,
              file_size = files.file.size,
              file_ext = files.file.name.split('.').pop(),
              upload_name = Date.now() + '.' + username + '.' + file_ext;
              new_path = path.join(process.env.PWD, '/public/uploads/', upload_name);
          fs.readFile(old_path, function(err, data) {
              fs.writeFile(new_path, data, function(err) {
                function UserUpload(username, callback) {
                  async.waterfall([
                    function(cb) {
                      pool.getConnection(function (err, connection) {
                        if (err) {
                          //console.log(err + "error in db connection");
                          cb(err);
                        }
                        var photoUpload = {
                          username: username,
                          new_path: upload_name
                        }
                        connection.query('INSERT INTO photos SET ?', photoUpload , function (err, rows, fields) {
                          if (err) {
                            //console.log("error in db : " + err);
                            connection.release();
                            cb(err);
                          } else {
                            cb(null, photoUpload);
                          }
                        });
                      });
                    }
                  ],
                  function (err, photoUpload) {
                    if (err) {
                      //console.log(err);
                      callback(err);
                    } else {
                      callback(null, photoUpload);
                    }
                  })
                }
                UserUpload(username, function (err, callback) {
                  if (err) {
                    //console.log("There was an error uploading you photo");
                  } else {
                    fs.unlink(old_path, function(err) {
                      var pageData = {
                        new_path: upload_name
                      }
                      /*console.log(pageData);*/
                        if (err) {
                            console.log(err);
                            console.log('error in here');
                            // res.status(500);
                            res.json({'success': false});
                        } else {
                        console.log("redirect if is good ");
                        //  res.status(201);
                         return res.redirect('/profile');
                        }
                    });
                  }
                })
              });
            });
        } else {
          res.send("wrong format")
        }
        });
    }
  })
});


router.post('/changeTags', function (req, res) {
  val = new Validator({
        dataSource: req.body,
        constraints: [{
                name: 'userTags',
                regex: /^[a-zA-Z ]*$/
              }]
        })
        if (!val.validate()) {
            return res.redirect('/profile')
        }
  username = session.uniqueID;
  var tags;
  tags = req.body['userTags[]'];
  function UserChangeTags(username, callback) {
    async.waterfall([
      function(cb) {
        pool.getConnection(function (err, connection) {

          connection.query('DELETE FROM user_tags WHERE username = ?', username , function (err, rows, fields) {
            if (err) {
              // console.log(err);
              connection.release();
            } else {
              connection.query('SELECT * FROM tags WHERE tags = ?', [tags], function(err, rows, fields) {
                  connection.query('INSERT INTO tags SET ?', [tags]  , function (err, rows, fields) {
                    connection.release();
                    /*callback(null, tags);*/
                  });
              });
            }
          });
        });
      }
    ],
    function (err, tags) {
      if (err) {
        callback(err);
      } else {
        callback(null, tags);
      }
    })
  }
  UserChangeTags(username, function (err, callback) {
    if (err) {
      res.send("error")
      res.redirect('/profile');

    } else {
      return res.redirect('/profile');
      return res.status(201).send('test');
    }
  })
});


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


function checkForNumberOfPics (pool, username) {
  return query(pool, 'SELECT * FROM photos WHERE username = ?', [username])
}

function InsertLocation (pool, username, userLocationDataPush) {
  return query(pool, 'INSERT INTO userlocation (username, latitude, longitude, country, city, zipcode) VALUES (?, ?, ?, ?, ?, ?)', [[username], [userLocationDataPush.latitude], [userLocationDataPush.longitude], [userLocationDataPush.country], [userLocationDataPush.city], [userLocationDataPush.zipcode]])
}


function updateUserLocation (pool, locationPush) {
  return query(pool, 'UPDATE userlocation SET ? WHERE username = ?', [locationPush])
}


function checkfForLocationInRows(pool, username) {
  return query(pool, 'SELECT * FROM userlocation WHERE username = ?', username)
}


function InsertLocationOnDeny (pool, username, userLocationDataDeniedPush) {
  return query(pool, 'INSERT INTO userlocation (username, latitude, longitude, country, city, zipcode) VALUES (?, ?, ?, ?, ?, ?)', [[username], [userLocationDataDeniedPush.latitude], [userLocationDataDeniedPush.longitude], [userLocationDataDeniedPush.country], [userLocationDataDeniedPush.city], [userLocationDataDeniedPush.zipcode]])
}


function UpdateLocationOnDeny (pool, userLocationDataDeniedPush, username) {
  return query(pool, 'UPDATE userlocation SET ? WHERE username = ?', [[userLocationDataDeniedPush], [username]])
}

function checkforTags (pool, username) {
  return query(pool, 'SELECT tags.tags FROM tags INNER JOIN user_tags ON user_tags.tag_id = tags.id WHERE user_tags.username = ?', [username])
}

function checkTag (pool, tags) {
  return (pool, 'SELECT * FROM tags WHERE tags = ?', [tags])
}


function insertTagsInTags (pool, tags) {
  return query(pool, 'INSERT INTO tags SET ?', [tags])
}


function getTheUserTags (pool, tags) {
  return query(pool, 'SELECT * FROM tags WHERE tags = ?' [tags])
}


function getLocation (pool, username) {
  return query(pool, 'SELECT * FROM userlocation WHERE username = ?', [username])
}


function insertLocationSearch (pool, username, latitude, longitude, country, city) {
  return query(pool, 'INSERT INTO userlocation (username, latitude, longitude, country, city) VALUES (?, ?, ?, ?, ?)', [[username],[latitude], [longitude], [country], [city]])
}


function getRidofTheRows (pool, username) {
  return query(pool, 'DELETE FROM userlocation WHERE username = ? ', [username])
}

function getTheTags (pool, tags) {
  return query(pool, 'SELECT * FROM tags WHERE tags = ?', [tags])
}


// function insertTagsInDb2 ()


router.post('/userLocation', function (req, res){

  username = session.uniqueID;
  var long;
  var lat;
  lat = req.body.latitude;
  long = req.body.longitude;
  var userLocationData;
  var latitude;
  var longitude;
  var country;
  var city;
  var zipcode;
  var userLocationDataPush = {};
  geocoder.reverse({lat:lat, lon:long}, function(err, result){
    userLocationData = result;
    latitude = userLocationData[0].latitude;
    longitude = userLocationData[0].longitude;
    country = userLocationData[0].country;
    city = userLocationData[0].city;
    zipcode = userLocationData[0].zipcode;
    userLocationDataPush = {
      latitude,
      longitude,
      country,
      city,
      zipcode,
      username
    };

    checkfForLocationInRows(pool, username)
    .then(function(rows){
      if (rows.length == 0){
        InsertLocation(pool, username, userLocationDataPush)
      } else if (rows.length > 0) {
        // console.log("error here");
        // var locationPush = [userLocationDataPush, username];
        // updateUserLocation(pool, locationPush)
        pool.getConnection(function (err, connection) {
          var location = [userLocationDataPush, username];
          connection.query('UPDATE userlocation SET ? WHERE username = ?', location, function(err, rows, fields){
            connection.release();
          })
        })
      }
    })
  });
});


router.post('/userLocationDenied', function (req, res){
  username = session.uniqueID;
  var longitude;
  var latitude;
  var city;
  var userLocationData;
  var country;
  var zipcode;
  latitude = req.body.lat;
  longitude = req.body.lon;
  country = req.body.country;
  city = req.body.city;
  zipcode = req.body.zip;
  userLocationDataDeniedPush = {
    username,
    latitude,
    longitude,
    country,
    city,
    zipcode
  };

  checkfForLocationInRows(pool, username)
  .then(function(rows){
    if (rows.length == 0){
      InsertLocationOnDeny(pool, username, userLocationDataDeniedPush)
    } else if (rows.length > 0) {
      pool.getConnection(function (err, connection) {
        var locationDeniedPush = [userLocationDataDeniedPush, username];
        connection.query('UPDATE userlocation SET ? WHERE username = ?', locationDeniedPush, function(err, rows, fields){
          connection.release();
        })
      })
    }
  })
});


router.post('/userLocationSearch', function (req, res){
  console.log("hola mami");
  val = new Validator({
        dataSource: req.body,
        constraints: [{
                name: 'search',
                regex: /^[a-zA-Z ]*$/
            }
        ]
    })
    if (!val.validate()) {
      var response = {
        status  : 400,
        success : 'Wrong input'
      }
      return res.status(200).send(JSON.stringify(response));
    }
  let username = session.uniqueID;
  let search = req.body.search;
  let locationGranted = false
  console.log("search" , search);
  geocoder.geocode(search)
  .then(function(searcRes) {
    console.log("searcRes" ,searcRes);
    if (searcRes.length == 0){
      console.log("searcRes length" , searcRes);
      locationGranted = false
      var response = {
        status  : 400,
        success : 'Wrong input'
      }
      return res.status(200).send(JSON.stringify(response));
    }
    let latitude = searcRes[0].latitude;
    let longitude = searcRes[0].longitude;
    let city = searcRes[0].city;
    let country = searcRes[0].country
    searcRes.forEach(elem =>{
      if (typeof elem.city === 'undefined'){
        locationGranted = false

      } else if (typeof elem.city == 'string'){
        locationGranted = true
      }
    })
    if (locationGranted == false){
      var response = {
        status  : 400,
        success : 'Wrong input'
      }
      return res.status(200).send(JSON.stringify(response));
    } else if (locationGranted == true) {
      getLocation (pool, username)
      .then(function(rows){
        if (rows.length > 0) {
          getRidofTheRows(pool, username)
          insertLocationSearch(pool, username, latitude, longitude, country, city)
          console.log("location has been inserted");
        } else {
          insertLocationSearch(pool, username, latitude, longitude, country, city)
          console.log("location has been inserted");
        }
      })
      var response = {
        status  : 200,
        success : 'Location has been updated'
      }
      return res.status(200).send(JSON.stringify(response));
    }
  })
  .catch(function(err) {
    console.log(err);
  });
});



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

function suggestUsers (pool, username) {
  return query(pool, 'SELECT sex, orientation, latitude, longitude, city, country FROM usersinfo, userlocation WHERE usersinfo.username = userlocation.username AND usersinfo.username = ?', [username])
}


function lookForSF (pool, username) {
  return query(pool, 'SELECT usersinfo.username, usersinfo.age, usersinfo.popularity, userlocation.city, userlocation.country, userlocation.latitude, userlocation.longitude FROM usersinfo, userlocation WHERE usersinfo.sex = "f" AND usersinfo.orientation = "s" AND usersinfo.username = userlocation.username AND usersinfo.username != ?', [username])
}


function lookForbothCauseImB (pool, username) {
  return query(pool, 'SELECT usersinfo.username, usersinfo.age, usersinfo.popularity, userlocation.city, userlocation.country, userlocation.latitude, userlocation.longitude FROM usersinfo, userlocation WHERE (usersinfo.sex =  "f" OR usersinfo.sex =  "m") AND (usersinfo.orientation =  "b" OR usersinfo.orientation =  "s" OR usersinfo.orientation =  "g") AND usersinfo.username = userlocation.username AND usersinfo.username != ?', [username])
}


function lookForSM (pool, username) {
  return query(pool, 'SELECT usersinfo.username, usersinfo.age, usersinfo.popularity, userlocation.city, userlocation.country, userlocation.latitude, userlocation.longitude FROM usersinfo, userlocation WHERE usersinfo.sex = "m" AND usersinfo.orientation = "s" AND usersinfo.username = userlocation.username AND usersinfo.username != ?', [username])
}


function lookForGM (pool, username) {
  return query(pool, 'SELECT usersinfo.username, usersinfo.age, usersinfo.popularity, userlocation.city, userlocation.country, userlocation.latitude, userlocation.longitude FROM usersinfo, userlocation WHERE usersinfo.sex = "m" AND usersinfo.orientation = "g" AND usersinfo.username = userlocation.username AND usersinfo.username != ?', [username])
}


function lookforGF (pool, username) {
  return query(pool, 'SELECT usersinfo.username, usersinfo.age, usersinfo.popularity, userlocation.city, userlocation.country, userlocation.latitude, userlocation.longitude FROM usersinfo, userlocation WHERE usersinfo.sex = "f" AND usersinfo.orientation = "g" AND usersinfo.username = userlocation.username AND usersinfo.username != ?', [username])
}


function checkIfBlocked (pool, username) {
  return query(pool, 'SELECT blocked FROM blocked WHERE blocker = ?', [username])
}


function matchaSearch (pool, username) {
  return suggestUsers(pool, username)
      .then((searcherInfos) => {
         const userData = [...searcherInfos]
         if (userData.length === 0){
           return res.render('/shrug')
         } else {
           if (userData[0].sex === 'm' && userData[0].orientation === 's') {
             return lookForSF(pool, username)
           } else if ((userData[0].sex) && userData[0].orientation === 'b') {
             return lookForbothCauseImB(pool, username)
           } else if ((userData[0].sex) === 'f' && userData[0].orientation === 's') {
             return lookForSM(pool, username)
           } else if ((userData[0].sex) === 'm' && userData[0].orientation === 'g') {
             return lookForGM(pool, username)
           } else if ((userData[0].sex) === 'f' && userData[0].orientation === 'g') {
             return lookforGF(pool, username)
           }
         }
      })
}

router.post('/matchaSearch', function (req, res) {
  username = session.uniqueID;
  let blocked = [];
  checkIfBlocked(pool, username)
  .then(function(rows){

    if (rows.length > 0){
      blocked = rows;
    }
  })

  matchaSearch(pool, session.uniqueID)
    .then((potentials) => {
      userData = suggestUsers(pool, username)
        .then((rows) => {
          res.render('./userMatch', {potentials, rows, blocked :blocked})
        })

    })
    .catch((err) => {
      // console.error('error', err)
      return res.render('./shrug')
      // res.status(500).send("we don't have any suggestions for you so far")
    })
})





return router;
}
