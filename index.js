'use strict';
const express = require('express')
const bodyParser = require('body-parser');

const app = express();
var exec = require('child_process').exec;

var spawn = require('child_process').spawn

var format;

var formhtml = `
<form action="/post" method="POST">
<textarea type="textarea" name="data" style="width:100%;height:20%" placeholder="inputXML or raw EDID"></textarea>
   <button type="submit">Submit</button>
</form>

`


app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send(formhtml)

})


app.post('/post', function (req, res) {

    var child = spawn('/root/edid/edid-decode/edid-decode', ["-c", "--skip-sha", "-"]);
    child.stdin.setEncoding('utf-8');

    var outputdata = "<html><body style='word-wrap: break-word;white-space: pre-wrap;'>"
    outputdata += formhtml

    var inputdata = req.body.data;

    if (inputdata.indexOf("</edid>") > -1) { // has <edid>
        format = "UEI";
    }
    console.log("INPUT")
    console.log(inputdata[2])
    //hex 00 FF FF
    if (inputdata[2] == " " || inputdata[4] == " ") {
        format = "normalhex"
    }

    if(inputdata.startsWith("AP//")){
        format = "AP"
     //   inputdata = inputdata.slice(7)
    }

    if (format != "UEI" && format != "normalhex" && format != "AP") {
        inputdata = Buffer.from(inputdata, 'base64').toString('utf-8') //b64 decode
    }
    console.log("format:" + format)
    console.log("inputdata: " + inputdata)

    //outputdata += inputdata + "<br /><br />";

    //remove edids
    var edidXMLstart = inputdata.indexOf("<edid");
    var edidXMLend = inputdata.indexOf("</edid>", edidXMLstart + 1);
    if (edidXMLstart != -1 && edidXMLend != -1) {

            console.log("start: ", inputdata);

            if (format == "UEI") {
                inputdata = inputdata.substr(edidXMLstart, edidXMLstart + edidXMLend);
                var edidend = inputdata.indexOf('>')
                inputdata = inputdata.slice(edidend + 1)
                console.log("POSTUEI: " + inputdata);
            } else {
                // Probably unreachable.
                inputdata = inputdata.substr(edidXMLstart + 6, edidXMLend - edidXMLstart - 6);
            }
    }


    //base64, what was inside of <edid></edid>
    outputdata += inputdata + "<br /><br />" //
    if (format == "normalhex") {
        let inputbytes = req.body.data.replace(/[\n\t\r]/g, "").replace(/0x/g, "").replace(/ /g, "").padEnd(2 * 256, "00")
        console.log("inputbytes")
        console.log(inputbytes)
        inputdata = Buffer.from(inputbytes, 'hex')
    } else {
        inputdata = Buffer.from(inputdata, 'base64')
    }

    console.log("debug prewrite")
    console.log(inputdata)
    console.log("debug postwrite")

    child.stdin.write(inputdata);

    child.stdin.end();

    var databuf;

    child.stdout.on('data', function (data) {
        console.log(data)
        if (data != undefined) {
            databuf += data;
        }

    })

    child.stdout.on('end', function (data) {
        console.log(databuf); // response buffer

        outputdata += databuf.substr(9) + "</body></html>";//substr undefined from response

        res.send(outputdata)
    })


})

app.listen(2005)
