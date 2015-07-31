var cheerio = require('cheerio');
var got = require('got');
var express = require('express');
var app = express();

var sendWithStatus = function (res, status, data) {
	res.status(status).json(data);
};

var status = require('http-status');

app.set('port', (process.env.PORT || 5000));

app.get('/:username', function(req, res) {
	got('https://github.com/' + req.params.username, function (err, data, gres) {
		if (err) {
			sendWithStatus(res, err.statusCode, {
				status: err.statusCode || 500,
				message: status[err.statusCode]
			});
			return;
		}

		var $ = cheerio.load(data);
		var $calendar = $('#contributions-calendar > div').get(3);
		var $streak = $($calendar).children('span').get(1);

		sendWithStatus(res, 200, {
			status: 200,
			streak: $($streak).text() || '0 days'
		});
	});
});

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    sendWithStatus(res, {
        status: err.status,
        message: err.message || status[err.status]
    });
});


app.listen(app.get('port'), function() {
  console.log('Github-Streak App is running on port', app.get('port'));
});
