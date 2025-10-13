// About imports and exports in JavaScript modules
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export

// "named" imports from utils.js and soundutils.js
import { loadAndDecodeSound, playSound } from './soundutils.js';

// The AudioContext object is the main "entry point" into the Web Audio API
let ctx;

const soundURL =
    'https://mainline.i3s.unice.fr/mooc/shoot2.mp3';
let decodedSound;

// The button for playing the sound
let playButton = document.querySelector("#playButton");
// disable the button until the sound is loaded and decoded
playButton.disabled = true;

window.onload = async function init() {
    ctx = new AudioContext();


    // load and decode the sound
    // this is asynchronous, we use await to wait for the end of the loading and decoding
    // before going to the next instruction
    // Note that we cannot use await outside an async function
    // so we had to declare the init function as async
    decodedSound = await loadAndDecodeSound(soundURL, ctx);
 
    // we enable the play sound button, now that the sound is loaded and decoded
    playButton.disabled = false;

    // Event listener for the button. When the button is pressed, we play the sound
    playButton.onclick = function (evt) {
         // from utils.js
        playSound(ctx, decodedSound, 0, decodedSound.duration);
    }
}
