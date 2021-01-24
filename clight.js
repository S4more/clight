const getAverageColor = require('fast-average-color-node').getAverageColor
const TuyAPI = require('tuyapi');
const colorsys = require('colorsys');
const yargs = require('yargs');
const cred = require('./credentials');

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .alias('c', 'color')
    .nargs('c', 1)
    .describe('c', 'specifies the color')

    .alias('i', 'image')
    .nargs('i', 1)
    .describe('i', 'sets the color to the dominant color of an image')
    .example('$0 -c #f0f0f0')

    .alias('b', 'background')
    .nargs('b', 0)
    .describe('b', 'matches the light and your wallpaper')
    .example('$0 -b')

    .help('h')
    .alias('h', 'help').argv;


const COLOR = '24';
const device = new TuyAPI({
  id: cred.id,
  key: cred.key,
  version: 3.3
});


let stateHasChanged = false;

device.find().then(() => {
  device.connect();
});

device.on('connected', () => {
    console.log('Connected to device!');
});

device.on('disconnected', () => {
  //console.log('Disconnected from device.');
});

device.on('error', error => {
  console.log('Error!', error);
});

device.on('data', data => {
    if (stateHasChanged){
        console.log("light changed.");
        device.disconnect();        
    } else {
        changeColors();
        stateHasChanged = true;
    }
});

function changeColors() {
    console.log(color);
    let H = addLeadingZero(color[0]);
    // On Globe Suite RGBW lamp, the S & V are multiplied by 10.
    let S = addLeadingZero(hexaMultiplication(color[1], 10));
    let V = addLeadingZero(hexaMultiplication(color[2], 10));
    device.set({dps: COLOR, set: H + S + V});
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

if ( argv.color ) {
    color = setColor( argv.color );
}
else if ( argv.image ) {
    setColorFromImage( argv.image )
        .then(value => color = value);
} else if ( argv.background ) {
    setColorFromImage( process.env.WALLPAPER)
        .then(value => color = value);
} else {
    yargs.showHelp();
    process.exit(1);
}

async function setColorFromImage(image) {
    const avg = await getAverageColor(image);
    return setColor(avg.hex);
}

function setColor(color) {
    color = Object.values(colorsys.hex2Hsv(color)); 
    color = color.map(x => x.toString(16));
    return color;
}
