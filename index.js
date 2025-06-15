'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const { exec, spawn } = require('child_process');

const app = express();

const FORM_HTML = `
<form action="/post" method="POST">
<textarea type="textarea" name="data" style="width:100%;height:20%" placeholder="inputXML or raw EDID"></textarea>
   <button type="submit">Submit</button>
</form>
`;

const detectFormat = (inputData) => {
    if (inputData.includes('</edid>')) {
        return 'UEI';
    }
    if (inputData[2] === ' ' || inputData[4] === ' ') {
        return 'normalhex';
    }
    if (inputData.startsWith('AP//')) {
        return 'AP';
    }
    return 'base64';
};

const processInputData = (inputData, format) => {
    if (format === 'UEI') {
        const edidXMLstart = inputData.indexOf('<edid');
        const edidXMLend = inputData.indexOf('</edid>', edidXMLstart + 1);
        if (edidXMLstart !== -1 && edidXMLend !== -1) {
            inputData = inputData.substr(edidXMLstart, edidXMLstart + edidXMLend);
            const edidend = inputData.indexOf('>');
            inputData = inputData.slice(edidend + 1);
        }
    }
    return inputData;
};

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(FORM_HTML);
});

app.post('/post', (req, res) => {
    const child = spawn('./edid-decode', ['-c', '--skip-sha', '-']);
    child.stdin.setEncoding('utf-8');

    let outputData = '<html><body style=\'word-wrap: break-word;white-space: pre-wrap;\'>';
    outputData += FORM_HTML;

    let inputData = req.body.data;
    let format;

    if (inputData.indexOf('</edid>') > -1) {
        format = 'UEI';
    }
    console.log('INPUT');
    console.log(inputData[2]);
    
    if (inputData[2] === ' ' || inputData[4] === ' ') {
        format = 'normalhex';
    }

    if (inputData.startsWith('AP//')) {
        format = 'AP';
    }

    console.log('Format:', format);
    console.log('Input data:', inputData);

    if (format !== 'UEI' && format !== 'normalhex' && format !== 'AP') {
        inputData = Buffer.from(inputData, 'base64').toString('utf-8');
    }

    inputData = processInputData(inputData, format);
    outputData += inputData + '<br /><br />';

    let processedInput;
    if (format === 'normalhex') {
        const inputBytes = req.body.data
            .replace(/[\n\t\r]/g, '')
            .replace(/0x/g, '')
            .replace(/ /g, '')
            .padEnd(2 * 256, '00');
        processedInput = Buffer.from(inputBytes, 'hex');
    } else {
        processedInput = Buffer.from(inputData, 'base64');
    }

    child.stdin.write(processedInput);
    child.stdin.end();

    let dataBuffer = '';

    child.stdout.on('data', (data) => {
        if (data) {
            dataBuffer += data;
        }
    });

    child.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
    });

    child.on('error', (error) => {
        console.error(`Failed to start process: ${error}`);
        res.status(500).send('Internal server error');
    });

    child.stdout.on('end', () => {
        outputData += dataBuffer.substr(9) + '</body></html>';
        res.send(outputData);
    });
});

if (require.main === module) {
    app.listen(2005);
}

module.exports = app;
