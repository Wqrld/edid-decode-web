'use strict';
const express = require('express')
const bodyParser = require('body-parser');

const app = express();
var exec = require('child_process').exec;

var spawn = require('child_process').spawn




app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send(`
<body>

<form action="/post" method="POST">
<textarea type="textarea" name="data" style="width:100%;height:50%" placeholder="raw edid bytes"></textarea>
   <button type="submit">Submit</button>
</form>

</body>



`)

})


app.post('/post', function(req, res) {

    var child = spawn('/root/edid/edid-decode/edid-decode', ["-c", "--skip-sha", "-"]);

    child.stdin.setEncoding('utf-8');

    child.stdin.write(req.body.data);

    child.stdin.end();

    var databuf;

    child.stdout.on('data', function(data) {
        console.log(data)
        databuf += data;

    })

    child.stdout.on('end', function(data) {
        console.log(databuf);
        res.send("<html><body style='word-wrap: break-word;white-space: pre-wrap;'>" + databuf + "</body></html>")
    })


})

app.listen(2005)
