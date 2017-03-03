var express = require('express');
var http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');
var router = express.Router();
var pool = require('./connectionroutes');
var async = require('async');






var getUserprofile = function getUserprofile(username, callback){
  console.log("we got the usersinfo here");
      pool.getConnection(function (err, connection) {
        var dataUser = [];

        // Error check
        connection.query('SELECT username, age, sex, orientation, bio, email, first_name, last_name FROM usersinfo WHERE username = ?', username , function (err, rows, fields) {
          if (err) {
            console.log("error 1" , err);
            connection.release();
            cb(err);
          } else {
            console.log("we have the data" , rows[0]);
            connection.release();
            callback(null, rows[0]);
          }
        });
      });
}


var getUserTags = function getUserTags(username, callback){
  console.log("we get the tags here");
      pool.getConnection(function (err, connection) {
        var dataUserTags = [];

        connection.query('SELECT * FROM user_tags WHERE username = ?', username , function (err, rows, fields) {
          if (err){
            console.log("error 2 " , err);
          } else if (rows.length < 1) {
            console.log("no tags for the moment");
            callback(null, rows);
          } else {
            console.log(rows);
            connection.release();
            callback(null, rows);
          }
        });
      });
}

var getUserPicturesMofo = function getUserPicturesMofo(username, callback){
  console.log("we get the pictures here");
  pool.getConnection(function (err, connection){
    connection.query('SELECT * FROM photos WHERE username = ?', username , function (err, rows, fields){
      if (err){
        console.log("error 3" , err);
        connection.release();
        cb(err);
      } else {
        console.log(rows);
        connection.release();
        callback(null, rows);
      }
    });
  });
}


var UserChangeTags = function UserChangeTags(username, callback){
  pool.getConnection(function (err, connection){

    connection.query('DELETE * FROM userTags WHERE username = ?' , username , function (err, rows, fields){

      connection.release();
      callback(null, rows)
    });
  });
}









module.exports = {
  getUserprofile : getUserprofile,
  getUserTags : getUserTags,
  getUserPicturesMofo : getUserPicturesMofo,
  UserChangeTags : UserChangeTags

}
