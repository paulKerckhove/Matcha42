var express = require('express');
var path = require('path');

module.exports = function (app, io) {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.use('/static', express.static('public'));
  app.set('port', process.env.PORT || 3000);
  app.use(express.static(path.join(__dirname, 'public')));
}
