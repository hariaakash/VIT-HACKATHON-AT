var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hat = require('hat');
var bcrypt = require('bcryptjs');
var request = require('request');
var User = require('../models/user');


app.use(bodyParser.json({
	limit: '50mb'
}));
app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
}));


function uniR(res, status, msg) {
	res.json({
		status: status,
		msg: msg
	})
}


function sendImage(image, callback) {
	request({
		url: 'https://api.imgur.com/3/image',
		method: "POST",
		json: true,
		headers: {
			'Authorization': 'Client-ID a8cf7beef2a8602',
			'content-type': 'application/json',
		},
		body: {
			image: image,
			type: "base64"
		}
	}, function (error, response, body) {
		callback(body.data.link);
	});
}


function detectEmotion(url, emotions, callback) {
	var data = [];
	var final1 = [0, 0, 0, 0, 0, 0, 0];
	var final = [0, 0, 0, 0, 0, 0, 0];
	final1[0] = emotions.anger;
	final1[1] = emotions.disgust;
	final1[2] = emotions.fear;
	final1[3] = emotions.happiness;
	final1[4] = emotions.sadness;
	final1[5] = emotions.surprise;
	final1[6] = emotions.neutral;
	var max = 0,
		index = 0;
	request.post('http://192.168.43.126:3000/detect', {
		json: {
			url: url
		}
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			//			console.log(final1)
			var array = body.data.replace('[', '').replace(']', '').split(' ').map(Number);
			var final2 = array.filter(function (element) {
				return element !== 0;
			});
			//			console.log(final2)
			for (i = 0; i < final.length; i++) {
				final[i] = (final1[i] + final2[i]) / 2;
				if (max < final[i]) {
					max = final[i];
					index = i;
				}
				if (i == final.length - 1)
					callback(final, max, index);
			}
		} else {
			callback(0, 0, 0)
		}
	});
}

function findEmotion(link, callback) {
	request({
		url: 'https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize',
		method: "POST",
		json: true,
		headers: {
			'Ocp-Apim-Subscription-Key': 'f1c9d66c654247acbdd968b2c506e744',
			'content-type': 'application/json',
		},
		body: {
			url: link
		}
	}, function (err, res, body) {
		if (body[0])
			callback(body[0].scores);
		else
			callback(0)
	});
}


app.get('/', function (req, res) {
	if (req.query.authKey) {
		User.findOne({
				authKey: req.query.authKey
			})
			.then(function (user) {
				if (user) {
					res.json({
						status: true,
						data: {
							email: req.body.email,
							images: user.images.reverse()
						}
					})
				} else {
					uniR(res, false, 'User not found !!')
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying !!')
			})
	} else {
		uniR(res, false, 'Invalid entries !!')
	}
})

app.post('/register', function (req, res) {
	if (req.body.email && req.body.password) {
		User.findOne({
				email: req.body.email
			})
			.then(function (users) {
				if (!users) {
					bcrypt.hash(req.body.password, 10, function (err, hash) {
						var user = new User();
						user.email = req.body.email;
						user.password = hash;
						user.authKey = hat();
						user.save();
						uniR(res, true, 'User registered successfully !!')
					})
				} else {
					uniR(res, false, 'User already registered !!')
				}
			})
			.catch(function (err) {
				uniR(res, false, 'Error when querying !!')
			})
	} else {
		uniR(res, false, 'Invalid entries !!')
	}
})

app.post('/login', function (req, res) {
	if (req.body.email && req.body.password) {
		User.findOne({
				email: req.body.email
			})
			.then(function (user) {
				if (user) {
					bcrypt.compare(req.body.password, user.password, function (err, resp) {
						if (resp == true) {
							res.json({
								status: true,
								msg: 'Logged in successfully !!',
								authKey: user.authKey
							})
						} else {
							uniR(res, false, 'Password is wrong !!')
						}
					})
				} else {
					uniR(res, false, 'User not found !!')
				}
			})
			.catch(function (err) {
				console.log(err);
				uniR(res, false, 'Error when querying !!')
			})
	} else {
		uniR(res, false, 'Invalid entries !!')
	}
})

app.post('/detect', function (req, res) {
	if (req.body.authKey && req.body.image) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					sendImage(req.body.image, function (link) {
						console.log(link)
						uniR(res, true, 'Image received')
						//						findEmotion(link, function (emotion) {
						//							if (emotion != 0) {
						//								console.log('face')
						//								detectEmotion(link, emotion, function (data, final, index) {
						//									if (data != 0) {
						//										//										console.log(data)
						//										console.log('Image analyzed: ' + link)
						//										user.images.push({
						//											url: link,
						//											emotion: data,
						//											final: final,
						//											label: index
						//										});
						//										user.save();
						//										res.json({
						//											status: true,
						//											url: link,
						//											emotion: data,
						//											final: final,
						//											label: index
						//										});
						//									} else {
						//										console.log('Python is not working')
						//										uniR(res, false, 'Python not working')
						//									}
						//								})
						//							} else {
						//								console.log('no face')
						//								uniR(res, false, 'No face found !!')
						//							}
						//						});
					})
				} else {
					console.log(req.body.authKey)
					uniR(res, false, 'User not found !!')
				}
			})
			.catch(function (err) {
				console.log(err);
				uniR(res, false, 'Error when querying !!')
			})
	} else {
		uniR(res, false, 'Invalid entries !!')
	}
})

app.post('/addAction', function (req, res) {
	if (req.body.authKey && req.body.type && req.body.name && req.body.emotion) {
		User.findOne({
				authKey: req.body.authKey
			})
			.then(function (user) {
				if (user) {
					console.log(req.body)
					user.settings.push({
						status: true,
						type: req.body.type,
						name: req.body.name,
						emotion: req.body.emotion
					});
					user.save();
					uniR(res, true, 'Action added successfully !!')
				} else {
					uniR(res, false, 'User not found !!')
				}
			})
			.catch(function (err) {
				console.log(err);
				uniR(res, false, 'Error when querying !!')
			})
	} else {
		uniR(res, false, 'Invalid entries !!')
	}
})


module.exports = app;
