import { pixelToSeconds } from './utils.js';

export default class SamplerEngine {
  
  constructor() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      alert('Web Audio API is not supported in this browser');
      throw new Error('Web Audio API not supported.');
    }
    
    this.audioBuffers = [];
    this.soundSettings = [];
    
    // --- NEW AUDIO ROUTING ---
    // Create a "master" output gain node
    this.masterOut = this.audioContext.createGain();
    
    // Create a destination for the recorder
    this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
    
    // Connect master out to both speakers AND the recorder stream
    this.masterOut.connect(this.audioContext.destination);
    this.masterOut.connect(this.mediaStreamDestination);
    
    // --- RECORDER PROPERTIES ---
    this.mediaRecorder = null;
    this.chunks = []; // To store recorded audio chunks
  }

  // ... (loadSound method is unchanged)
  async loadSound(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`File not found: ${url}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound from ${url}:`, error);
      return null;
    }
  }

  // ... (loadPreset method is unchanged)
  async loadPreset(urls, canvasWidth) {
    console.log('Engine: Loading preset...');
    this.audioBuffers = [];
    this.soundSettings = [];
    
    this.audioBuffers = await Promise.all(urls.map(url => this.loadSound(url)));
    
    this.soundSettings = this.audioBuffers.map(() => {
      return {
        trimStart: 0,
        trimEnd: canvasWidth,
        volume: 1,
        pan: 0,
        canvasWidth: canvasWidth
      };
    });
    
    console.log(`Engine: Loaded ${this.audioBuffers.length} sounds.`);
    return this.audioBuffers;
  }
  
  /**
   * Plays the sound at a specific index, respecting ALL settings.
   */
  playSound(index) {
    const buffer = this.audioBuffers[index];
    const settings = this.soundSettings[index];
    
    if (!buffer || !settings) return;

    const canvasWidth = settings.canvasWidth; 
    const startTime = pixelToSeconds(settings.trimStart, buffer.duration, canvasWidth);
    const endTime = pixelToSeconds(settings.trimEnd, buffer.duration, canvasWidth);
    const duration = endTime - startTime;

    if (duration <= 0) return; 

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = settings.volume;

    const pannerNode = this.audioContext.createStereoPanner();
    pannerNode.pan.value = settings.pan;

    // --- UPDATE THIS CONNECTION ---
    // Connect to the master output, not the final destination
    source.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.masterOut); 
    // --- END UPDATE ---
    
    source.start(0, startTime, duration);
  }
  
  // ... (updateTrim, updateSoundSetting, getBuffer, getSettings are unchanged)
  updateTrim(index, startPixel, endPixel) { /* ... */ }
  updateSoundSetting(index, setting, value) { /* ... */ }
  getBuffer(index) { return this.audioBuffers[index]; }
  getSettings(index) { return this.soundSettings[index]; }

  // --- ADD NEW RECORDING METHODS ---

  startRecording() {
    if (this.mediaRecorder) return; // Already recording
    
    this.chunks = []; // Clear old chunks
    // Use the stream from the destination node
    this.mediaRecorder = new MediaRecorder(this.mediaStreamDestination.stream);
    
    // When data is available (e.g., a chunk of audio is ready)
    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    
    this.mediaRecorder.start();
    console.log("Engine: Recording started.");
  }

  stopRecording(onRecordingStopCallback) {
    if (!this.mediaRecorder) return; // Not recording

    // This event listener will fire *after* stop() is called
    this.mediaRecorder.onstop = () => {
      // Combine all the recorded chunks into one blob
      const blob = new Blob(this.chunks, { 'type' : 'audio/webm; codecs=opus' });
      
      // Create a URL for the blob
      const audioURL = window.URL.createObjectURL(blob);
      
      // Call the callback function from the GUI, passing it the URL
      if (onRecordingStopCallback) {
        onRecordingStopCallback(audioURL);
      }
      
      // Reset for next recording
      this.mediaRecorder = null;
      this.chunks = [];
      console.log("Engine: Recording stopped.");
    };
    
    // Stop the recorder
    this.mediaRecorder.stop();
  }
}