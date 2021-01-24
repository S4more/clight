const getAverageColor = require('fast-average-color-node').getAverageColor;
const TuyAPI = require('tuyapi');
const colorsys = require('colorsys');
const { execSync } = require('child_process');
const color = '24';
const device = new TuyAPI({
  id: 'eb9e12c0535773b584qnaz',
  key: '3fe6640227202dcd',
  version: 3.3
});

function start() {
    execSync('python3 test.py');
    setAvgColor();
}


let avgColor;

async function setAvgColor() {
    const avg = await getAverageColor('./sct.png');
    avgColor = Object.values(colorsys.hex2Hsv(avg.hex));
    avgColor = avgColor.map(x => x.toString(16));
    return avgColor;
};

let lastStatus = {
    '20': '',
    '21': '',
    '22': '',
    '23': '',
    '24': '',
    '25': '',
    '26': '',
}

let stateHasChanged = false;

start();

device.find().then(() => {
  device.connect();
});

device.on('connected', () => {
    console.log('Connected to device!');
});

device.on('disconnected', () => {
  console.log('Disconnected from device.');
});

device.on('error', error => {
  console.log('Error!', error);
});

device.on('data', data => {
    for (let i in data.dps) {
        if (data.dps[i] !== lastStatus[i]) {
            console.log(`${lastStatus[i]} -> ${data.dps[i]}`)
        }
    }
    if (lastStatus !== data.dps) {
        lastStatus = data.dps;
    }
    changeColors();

});

function changeColors() {
    let H = addLeadingZero(avgColor[0]);
    // On Globe Suite RGBW lamp, the S & V are multiplied by 10.
    let S = addLeadingZero(hexaMultiplication(avgColor[1], 10));
    let V = addLeadingZero(hexaMultiplication(avgColor[2], 10));
    device.set({dps: color, set: H + S + V});
    start();
}

function hexaMultiplication(hex, dec) {
    return (parseInt(hex, 16) * dec).toString(16);
}

function addLeadingZero(string) {
    while (string.length < 4) {
        string = "0" + string;
    }
    return string;
}
