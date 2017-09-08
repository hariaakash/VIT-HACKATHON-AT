var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var cmd = require('node-cmd');


app.use(bodyParser.json({
	limit: '50mb'
}));
app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
}));


app.get('/*', function (req, res) {
	res.json('haha')
})

app.post('/detect', function (req, res) {
	if (req.body.url) {
		var query = 'python emotion_recognition.py poc ' + req.body.url;
		cmd.get(query, function (err, data, stderr) {
			res.json({
				status: true,
				data: data,
				err: err,
				stderr: stderr
			});
		});
	} else {
		res.json({
			status: false,
			msg: 'Image not found !!'
		})
	}
})


app.listen('3000');
console.log('Server running !!');
