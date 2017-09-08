var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var conf = require('./conf');


conf.MONGOOSE(mongoose);


conf.MW(app, morgan, cors);


conf.ROUTES(app);


app.listen(conf.PORT);
console.log('Server running on ' + conf.IP + ':' + conf.PORT);
