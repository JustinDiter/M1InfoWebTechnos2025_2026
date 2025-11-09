// About imports and exports in JavaScript modules
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export

// default imports of classes from waveformdrawer.js and trimbarsdrawer.js
import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
// "named" imports from utils.js and soundutils.js
import { loadAndDecodeSound, playSound } from './soundutils.js';
import { pixelToSeconds } from './utils.js';

// The AudioContext object is the main "entry point" into the Web Audio API
let ctx;

const soundURL = [
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3'
];

let decodedSounds = [];

let canvas, canvasOverlay, waveformDrawer, trimbarsDrawer;
let mousePos = {x: 0, y:0};
let trimPositions = soundURL.map(() => ({ left: 100, right: 200 }));
let currentSoundIndex;
let playButton;

window.onload = async function init() {
    ctx = new AudioContext();

    // two canvas : one for drawing the waveform, the other for the trim bars
    canvas = document.querySelector("#myCanvas");
    canvasOverlay = document.querySelector("#myCanvasOverlay");

    playButton = document.querySelector('#playButton');
    if (!playButton) {
        playButton = document.createElement('button');
        playButton.id = 'playButton';
        playButton.textContent = 'Play';
        document.body.appendChild(playButton);
    }
    playButton.disabled = true;
    // create the waveform drawer and the trimbars drawer
    waveformDrawer = new WaveformDrawer();
    trimbarsDrawer = new TrimbarsDrawer(canvasOverlay, 100, 200);

    // Load all sounds
    let promises = soundURL.map(url => loadAndDecodeSound(url, ctx))
    decodedSounds = await Promise.all(promises);

    // Generate each button
    let container = document.createElement("div");
    container.id = "buttonsContainer";
    document.body.prepend(container);

    decodedSounds.forEach((sound, idx) => {
        let btn = document.createElement("button");
        btn.textContent = `Play sound ${idx + 1}`;
        btn.onclick = () => selectSound(idx);
        container.appendChild(btn);
    })

    selectSound(0);

    canvasOverlay.onmousemove = (evt) => {
        let rect = canvas.getBoundingClientRect();
        mousePos.x = (evt.clientX - rect.left);
        mousePos.y = (evt.clientY - rect.top);
        trimbarsDrawer.moveTrimBars(mousePos);
        trimPositions[currentSoundIndex] = {
            left: trimbarsDrawer.leftTrimBar.x,
            right: trimbarsDrawer.rightTrimBar.x
        };
    };
    canvasOverlay.onmousedown = (evt) => trimbarsDrawer.startDrag();
    canvasOverlay.onmouseup = (evt) => trimbarsDrawer.stopDrag();

    requestAnimationFrame(animate);
    };

function selectSound(idx) {
    currentSoundIndex = idx;
    let decodedSound = decodedSounds[idx];
    let trim = trimPositions[idx];

    const ctxMain = canvas.getContext('2d');
    ctxMain.clearRect(0, 0, canvas.width, canvas.height);

    waveformDrawer.init(decodedSound, canvas, '#83E83E');
    waveformDrawer.drawWave(0, canvas.height);

    trimbarsDrawer.leftTrimBar.x = trim.left;
    trimbarsDrawer.rightTrimBar.x = trim.right;

    playButton.disabled = false;
    playButton.onclick = function () {
        let start = pixelToSeconds(trimbarsDrawer.leftTrimBar.x, decodedSound.duration, canvas.width);
        let end = pixelToSeconds(trimbarsDrawer.rightTrimBar.x, decodedSound.duration, canvas.width);
        playSound(ctx, decodedSound, start, end);
    }
}

// Animation loop for drawing the trim bars
// We use requestAnimationFrame() to call the animate function
// at a rate of 60 frames per second (if possible)
// see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
function animate() {

    const ctxOverlay = canvasOverlay.getContext('2d');
    ctxOverlay.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
    // clear overlay canvas;
    trimbarsDrawer.clear();

    // draw the trim bars
    trimbarsDrawer.draw();

    // redraw in 1/60th of a second
    requestAnimationFrame(animate);
}



