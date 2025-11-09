// --- In js/main.js ---
import SamplerEngine from './samplerEngine.js';
import SamplerGUI from './samplerGUI.js';

window.addEventListener('load', () => {
  // --- 1. Create Core Components ---
  const engine = new SamplerEngine();
  
  const gui = new SamplerGUI(engine, {
    presetMenuId: 'preset-menu',
    deletePresetButtonId: 'delete-preset-button',
    padsContainerId: 'pads-container',
    waveformCanvasId: 'waveform-canvas',
    trimbarsCanvasId: 'trimbars-canvas',
    recordButtonId: 'record-button', 
    stopButtonId: 'stop-button',     
    audioPlayerId: 'audio-player'
  });

  // --- 2. Initialize ---
  gui.init(); 
  startMIDI(); 

  // --- 3. MIDI Setup ---
  // ... (all MIDI code remains the same)
  function startMIDI() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("Web MIDI API is not supported in this browser.");
    }
  }

  function onMIDISuccess(midiAccess) {
    console.log("MIDI Access Granted!");
    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      console.log(`MIDI Device found: ${input.value.name}`);
      input.value.onmidimessage = onMIDIMessage; // Listen for messages
    }
  }

  function onMIDIMessage(message) {
    const [command, note, velocity] = message.data;
    
    if (command === 144 && velocity > 0) {
      const padIndex = note - 36; 
      
      if (padIndex >= 0 && padIndex < 16) { 
        console.log(`MIDI Note ${note} triggered pad ${padIndex}`);
        
        engine.playSound(padIndex);
        gui.selectSound(padIndex); 
        gui.lightUpPad(padIndex);
      }
    }
  }

  function onMIDIFailure() {
    console.error("Could not access MIDI devices.");
  }
});