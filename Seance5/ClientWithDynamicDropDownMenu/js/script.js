let presets = [];
let presetMenu;

window.onload = () => {
  console.log("Page is loaded");
  start();
}

// URI of the endpoint
const URI_endpoint = "http://localhost:3000/api/presets";


async function getData() {
  // fetch is asynchronous, it returns a Promise
  const response = await fetch(URI_endpoint);
  // this line will be executed only when 
  // the previous one finished
  // .json() is also asynchronous and decodes the JSON response to a JS object
  presets = await response.json();

  // now we can build the preset menu
  buildPresetMenu();

  // More advanced version with "optgroup" HTML elements for categories
  // This is optional, but dropdown menu looks better with groups
  //buildPresetMenuWithGroups();
}

function buildPresetMenu() {
  presetMenu.innerHTML = ""; // clear existing content

  // Build first entry with a disabled option to prompt user to select a preset
  let firstOption = document.createElement("option");
  firstOption.value = ""; // no value
  firstOption.text = "Select a preset";
  firstOption.disabled = true;
  firstOption.selected = true; // selected by default, the menu will display this entry at first
  presetMenu.appendChild(firstOption);

  // build the preset menu options
  presets.forEach((preset, index) => {
    let option = document.createElement("option");
    option.value = index; // we use the index as value
    option.text = preset.name; // display the preset name

    // let's add it to the parent ul element
    presetMenu.appendChild(option);
  });
}

function buildPresetMenuWithGroups() {
  // Build an option group for each category
  const categories = {};
  
  // First, group presets by category
  presets.forEach((preset, index) => {
    const category = preset.type || "Uncategorized";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ preset, index });
  });

  // Create first disabled option
  let firstOption = document.createElement("option");
  firstOption.value = ""; // no value
  firstOption.text = "Select a preset";
  firstOption.disabled = true;
  firstOption.selected = true; // selected by default
  presetMenu.appendChild(firstOption);

  // Now, create a group for each category
  for (const [category, items] of Object.entries(categories)) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = category;

    items.forEach(({ preset, index }) => {
      const option = document.createElement("option");
      option.value = index;
      option.text = preset.name;
      optgroup.appendChild(option);
    });

    presetMenu.appendChild(optgroup);
  }
}


function loadPresetSoundFiles(index) {
  const BASE_PRESET_URI = "http://localhost:3000/presets";
  const soundFileURIs = presets[index].samples.map(sample => {
    return encodeURI(`${BASE_PRESET_URI}/${sample.url}`);
  });
  const sampleNames = presets[index].samples.map(sample => sample.name || sample.url.split('/').pop());

  // Display PLAY buttons
  const btnContainer = document.getElementById('sampleButtons');
  btnContainer.innerHTML = '';
  soundFileURIs.forEach((uri, i) => {
    const btn = document.createElement('button');
    btn.textContent = `Play ${sampleNames[i]}`;
    btn.onclick = () => playAndDrawWaveform(uri);
    btnContainer.appendChild(btn);
  });
}

async function playAndDrawWaveform(url) {
  const audioContext = window._audioContext || (window._audioContext = new (window.AudioContext || window.webkitAudioContext)());
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
  drawWaveform(audioBuffer);
}

function drawWaveform(audioBuffer) {
  const canvas = document.getElementById('waveform');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  ctx.beginPath();
  for (let i = 0; i < canvas.width; i++) {
    const min = Math.min(...data.slice(i * step, (i + 1) * step));
    const max = Math.max(...data.slice(i * step, (i + 1) * step));
    ctx.moveTo(i, (1 + min) * canvas.height / 2);
    ctx.lineTo(i, (1 + max) * canvas.height / 2);
  }
  ctx.strokeStyle = '#0074D9';
  ctx.stroke();
}

function start() {
  // called only when page is loaded
  // and DOM is ready

  presetMenu = document.querySelector("#presetMenu");
  presetMenu.onchange = () => {
    const selectedIndex = presetMenu.value;
    console.log("Selected preset index/name: " + selectedIndex, presets[selectedIndex].name);

    // load the sound files for this preset
    loadPresetSoundFiles(selectedIndex);
  }

  // get the presets from the server
  getData()
}

