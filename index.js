var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000); 
 
app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

app.listen(3000);
