var express = require('express');
var http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');
var router = express.Router();
var pool = require('./connectionroutes');
var async = require('async');






var getUserprofile = function getUserprofile(username, callback){
      pool.getConnection(function (err, connection) {
        var dataUser = [];

        // Error check
        connection.query('SELECT * FROM usersinfo WHERE username = ?', username , function (err, rows, fields) {
          if (err) {
            connection.release();
            cb(err);

          } else {
            connection.release();
            callback(null, rows[0]);
          }
        });
      });
}


var getUserTags = function getUserTags(username, callback){
      pool.getConnection(function (err, connection) {
        var dataUserTags = [];

        connection.query('SELECT * FROM user_tags WHERE username = ?', username , function (err, rows, fields) {
          if (rows.length < 1) {
            callback(null, rows);
          } else {
            connection.release();
            callback(null, rows);
          }
        });
      });
}

var getUserPicturesMofo = function getUserPicturesMofo(username, callback){
  pool.getConnection(function (err, connection){
    connection.query('SELECT * FROM photos WHERE username = ?', username , function (err, rows, fields){
      if (err){
        connection.release();
        cb(err);

      } else {

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
