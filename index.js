var express = require('express');
var app = express();
var port = 4444;

app.use(express.static('./'));

app.get('/', function (req, res) {
    res.res('index');
});

app.listen(port, function () {
    console.log('Example app listening on port '+port+'!');
});