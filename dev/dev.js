var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use(express.static('../app'));
app.use(express.static('../lib'))
app.use(express.static('../'))

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Nobel nomiation app running at http://localhost:%s/laureates.html', port);
});