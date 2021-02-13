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
<textarea type="textarea" name="data" style="width:100%;height:20%" placeholder="Omni inputXML"></textarea>
   <button type="submit">Submit</button>
</form>

</body>



`)

})


app.post('/post', function(req, res) {

    var child = spawn('/root/edid/edid-decode/edid-decode', ["-c", "--skip-sha", "-"]);

    child.stdin.setEncoding('utf-8');

var outputdata = "<html><body style='word-wrap: break-word;white-space: pre-wrap;'>"

outputdata += `
<form action="/post" method="POST">
<textarea type="textarea" name="data" style="width:100%;height:20%" placeholder="Omni inputXML"></textarea>
   <button type="submit">Submit</button>
</form>

`


var inputdata = req.body.data;
inputdata = Buffer.from(inputdata, 'base64').toString('utf-8')
//outputdata += inputdata + "<br /><br />";

    var a = inputdata.indexOf("<edid>");
    var b = inputdata.indexOf("</edid>", a+1);

inputdata = inputdata.substr(a+6, b-a-6);
outputdata += inputdata + "<br /><br />"

inputdata = Buffer.from(inputdata, 'base64')

console.log(inputdata)

//outputdata += inputdata + "<br /><br />";




    child.stdin.write(inputdata);

    child.stdin.end();

    var databuf;

    child.stdout.on('data', function(data) {
        console.log(data)
        databuf += data;

    })

    child.stdout.on('end', function(data) {
        console.log(databuf);

outputdata += databuf + "</body></html>";

        res.send(outputdata)
    })


})

app.listen(2005)
