import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';

export default class SamplerGUI {
  
  constructor(engine, elementIds) {
    this.engine = engine; // The audio engine
    
    // Get all DOM elements
    this.presetMenu = document.getElementById(elementIds.presetMenuId);
    this.deletePresetButton = document.getElementById(elementIds.deletePresetButtonId);
    this.padsContainer = document.getElementById(elementIds.padsContainerId);
    this.waveformCanvas = document.getElementById(elementIds.waveformCanvasId);
    this.trimbarsCanvas = document.getElementById(elementIds.trimbarsCanvasId);
    this.recordButton = document.getElementById(elementIds.recordButtonId);
    this.stopButton = document.getElementById(elementIds.stopButtonId);
    this.audioPlayer = document.getElementById(elementIds.audioPlayerId);

    if (!this.presetMenu || !this.padsContainer || !this.deletePresetButton || !this.waveformCanvas || !this.trimbarsCanvas || !this.recordButton || !this.stopButton || !this.audioPlayer) {
      throw new Error("Could not find all required DOM elements for GUI.");
    }
    
    this.SERVER_URL = 'http://localhost:3000';
    this.allPresetsData = {};
    this.pads = []; // To store pad DOM elements
    this.selectedSoundIndex = -1;

    // Initialize visualizers
    this.waveformDrawer = new WaveformDrawer();
    this.trimbarsDrawer = null; // Will be created when a sound is selected
    
    this._registerTrimbarEvents();
    this._registerDeleteEvent();
    this._registerRecordEvents();
    this._animate(); // Start the animation loop
  }

  /**
   * Starts the GUI by fetching presets and setting up listeners.
   */
  async init() {
    await this._fetchAndBuildPresets();
    this.presetMenu.addEventListener('change', (event) => {
      this._onPresetChange(event.target.value);
    });
  }

  /**
   * Fetches preset list from the server and builds the dropdown.
   */
  async _fetchAndBuildPresets() {
    try {
      const response = await fetch(`${this.SERVER_URL}/api/presets`);
      if (!response.ok) throw new Error(`Server: ${response.status}`);
      this.allPresetsData = await response.json();
      
      console.log('GUI: Presets loaded:', this.allPresetsData);

      this.presetMenu.innerHTML = '';

      // Build dropdown
      for (const key in this.allPresetsData) {
        const preset = this.allPresetsData[key];
        const option = document.createElement('option');
        option.value = key; // The array index (0, 1, ...)
        option.text = preset.name; // The display name
        this.presetMenu.appendChild(option);
      }
      
      // Auto-load the first preset
      const firstPresetKey = Object.keys(this.allPresetsData)[0];
      if (firstPresetKey) {
        this.presetMenu.value = firstPresetKey;
        await this._onPresetChange(firstPresetKey);
      } 
    } catch (error) {
      console.error('Error fetching presets:', error);
      alert('Could not load presets from server.');
    }
  }

  /**
   * Handles loading sounds when the dropdown menu changes.
   */
  async _onPresetChange(presetIndex) {
    console.log(`GUI: Preset changed to index: ${presetIndex}`);
    
    this._clearPads();
    this._clearVisualizers();

    const preset = this.allPresetsData[presetIndex];
    if (!preset) return; 

    const presetFolderName = preset.key;
    if (!presetFolderName || !preset.samples) {
      console.error("GUI: Preset object is invalid.", preset);
      return;
    }

    // Build URLs for the engine
    const urls = preset.samples.map(sound => {
      const filename = sound.url.split('/').pop(); 
      return `${this.SERVER_URL}/presets/${presetFolderName}/${filename}`;
    });
    
    // Tell the engine to load the new sounds
    const loadedBuffers = await this.engine.loadPreset(urls, this.waveformCanvas.width);
    
    // Now create the GUI pads
    this._createPads(loadedBuffers, urls);
    this.selectSound(0); // Select first sound by default
  }

  _registerDeleteEvent() {
    this.deletePresetButton.addEventListener('click', async () => {
      const selectedIndex = this.presetMenu.value;
      const preset = this.allPresetsData[selectedIndex];
      
      if (!preset) {
        alert("No preset selected to delete.");
        return;
      }

      // The server route uses the preset *name*, not its key/folder
      const presetName = preset.name; 

      if (!confirm(`Are you sure you want to delete the preset: "${presetName}"?`)) {
        return;
      }
      
      try {
        const response = await fetch(`${this.SERVER_URL}/api/presets/${presetName}`, {
          method: 'DELETE'
        });

        if (response.ok) { // 204 No Content is 'ok'
          alert(`Preset "${presetName}" deleted successfully.`);
          // Refresh the entire preset list
          await this._fetchAndBuildPresets(); 
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting preset:', error);
        alert(`Could not delete preset: ${error.message}`);
      }
    });
  }

  _registerRecordEvents() {
    this.recordButton.addEventListener('click', () => {
      this.engine.startRecording();
      // Update button states
      this.recordButton.disabled = true;
      this.stopButton.disabled = false;
    });

    this.stopButton.addEventListener('click', () => {
      // Pass a callback function to stopRecording
      this.engine.stopRecording((audioURL) => {
        // This code runs when the engine is done
        this.audioPlayer.src = audioURL;
      });
      
      // Update button states
      this.recordButton.disabled = false;
      this.stopButton.disabled = true;
    });
  }

  _clearPads() {
    this.padsContainer.innerHTML = '';
    this.pads = [];
    this.selectedSoundIndex = -1;
  }

  _clearVisualizers() {
    this.waveformCanvas.getContext('2d').clearRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
    if (this.trimbarsDrawer) this.trimbarsDrawer.clear();
  }

  _createPads(buffers, urls) {
    buffers.forEach((buffer, index) => {
      if (!buffer) return;

      const pad = document.createElement('button');
      pad.classList.add('pad');
      pad.innerText = urls[index].split('/').pop().replace('.wav', '').replace('.mp3', '');

      pad.addEventListener('click', () => {
        this._onPadClick(index);
      });

      this.padsContainer.appendChild(pad);
      this.pads.push(pad);
    });
  }

  _onPadClick(index) {
    this.selectSound(index);      // Update the GUI
    this.engine.playSound(index); // Tell the engine to play
  }

  /**
   * Public method to visually select a sound (can be called by MIDI).
   */
  selectSound(index) {
    const buffer = this.engine.getBuffer(index);
    const settings = this.engine.getSettings(index);

    if (!buffer || !settings) return;
    
    this.selectedSoundIndex = index;
    
    // Update pad visuals
    this.pads.forEach((pad, i) => {
      pad.classList.toggle('selected', i === index);
    });

    // 1. Draw Waveform
    const waveformCtx = this.waveformCanvas.getContext('2d');
    waveformCtx.clearRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
    this.waveformDrawer.init(buffer, this.waveformCanvas, "white");
    this.waveformDrawer.drawWave(0, this.waveformCanvas.height);

    // 2. Draw Trimbars
    if (!this.trimbarsDrawer) {
      this.trimbarsDrawer = new TrimbarsDrawer(this.trimbarsCanvas, settings.trimStart, settings.trimEnd);
    } else {
      this.trimbarsDrawer.leftTrimBar.x = settings.trimStart;
      this.trimbarsDrawer.rightTrimBar.x = settings.trimEnd;
    }
  }

  _registerTrimbarEvents() {
    const getMousePos = (canvas, evt) => {
      const rect = canvas.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    };

    this.trimbarsCanvas.addEventListener('mousedown', (evt) => {
      if (this.trimbarsDrawer) this.trimbarsDrawer.startDrag();
    });

    this.trimbarsCanvas.addEventListener('mouseup', (evt) => {
      if (!this.trimbarsDrawer || this.selectedSoundIndex === -1) return;
      this.trimbarsDrawer.stopDrag();
      
      // Save new trims to the engine
      this.engine.updateTrim(
        this.selectedSoundIndex, 
        this.trimbarsDrawer.leftTrimBar.x, 
        this.trimbarsDrawer.rightTrimBar.x
      );
    });

    this.trimbarsCanvas.addEventListener('mousemove', (evt) => {
      if (!this.trimbarsDrawer) return;
      const mousePos = getMousePos(this.trimbarsCanvas, evt);
      this.trimbarsDrawer.moveTrimBars(mousePos);
    });
    
    this.trimbarsCanvas.addEventListener('mouseleave', (evt) => {
      if (this.trimbarsDrawer) this.trimbarsDrawer.stopDrag();
    });
  }

  _animate() {
    if (this.trimbarsDrawer) {
      this.trimbarsDrawer.clear();
      this.trimbarsDrawer.draw();
    }
    requestAnimationFrame(this._animate.bind(this));
  }
}