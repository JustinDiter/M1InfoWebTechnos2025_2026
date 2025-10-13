### Exercise 1
 1. Look at example 1, study the code. Try to replace the single URI of the sound by an array of sounds like this one : 
 ```js
 const soundURLs = [
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3'
]
 ```
 ... and load and decode the sounds using Promise.all (see course about JavaScript Promises). For each sound, generate a PLAY button on the fly.

### Exercise 2
Study Example2. Take some time looking at the different files... Play with the trim bars...

Your Work : make it work with a set of sound samples instead of just one simple sound.
1. Modify the example by adding the array of sounds + code from the previous exercice.
1. When a PLAY button for a sound is clicked, show its waveform and trimbars.
1. Try to store for each sound  the trim bar positions before playing each sound. When another sound is played, the stored position of its trim bars should be seen.
1. Think about a better design... maybe with a class for each sound?

### Exercise 3
Look at Example2 that is a simple solution to Exercice1.

You will start from your solution to Exercise 2.

Your work : instead of having the soundURLs array hard coded, run the nodeJS application from Seance 1/2 that can send a list of presets from its REST Web Services, build the URIs of the sound files from the results, and load them.
You will need:
1. to run the server, take any version from Seance1 or 2. Run with "npm run start", then open the URI "localhost:3000/api/presets" and check that you get a JSON description of all the presets.
1. Modify main.js to fetch this URI in order to fill properly the soundURLs array. YOU WILL START with just the files from the first preset. Remember to use the browser devtools (ctrl-shift-i or cmd-option-i on Mac), with the "network" tab open, show only fetch/XhR requests. Look that the data coming from the server in the debugger. This will help you verify the server response format.
1. Your example should work now with the presets from your server.
1. Try to build a drop down menu with the names of the preset. When an preset is selected in the drop down menu,then fill the soundURLs array with the URIs of the audio files corresponding to this preset. ChatGPT/Copilot in agent mode can help, or any good tutorial on HTML drop down menus.

### Exercise 4

Look at Example4: it is the same as Example2 except that it shows a WAM Sampler at the end of the page. See it as an possible example of what you are going to develop during this course. Play with it, look at how it has been loaded in the page (see file host.js). See how the GUI and the processing part are clearly separated. See how it behaves like any simple AudioNode from the Web Audio API (it can be connected the same way to the audio graph), while obviously, it is made of its own Web Audio graph with dozens of nodes... Did this reminds you a Design Pattern?
Start looking at the examples in Exercise 5.

### Exercise 5
I asked chat GPT to help me display progress bars while using fetch for downloading sounds... Your work here is to look, and try to guess what is done in the examples :

- [First example](https://jsbin.com/gaqibak/edit?html,console,output): **Displaying progress bars during the download when fetching a large file"**. This example shows how to fetch a large example file, show a progress bar, then display a button for downloading it. See how the file is downloading in "chunks" and how chunks are merged together at the end. Notice that we are not loading specifically audio files here, nor use the web audio API.

- [Second example](https://jsbin.com/qemipec/edit?html,output): **Loading multiple sounds with progress bars, how to implement a "download all" button, etc.** This example is more complicated: I asked chat GPT to load a set of sound samples, with a possibility to load them individually or all at once, with a progress bar for each sound, and a play button, a save button (for saving to a file) etc...

- [Third example](https://jsbin.com/xivadeb/edit?html,output): **Load sounds in parallel using a variant of Promise.all called Promise.allSettled, generate clickable pads in a 4x4 matrix**. [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) is the same as Promise.all except that instead of failing at first error, it will not fail but can produces a report at the end. In this example I asked chatGPT to load all the sounds in parallel, and generate Sampler PADS in a 4x4 matrix, like on real samplers like the [Akai MPC Live](https://www.akaipro.com/mpcliveii), a "load all button" that will start the download and enable the pads when the sounds arrive, with progress bars on each pad. Also, something important: **samples will follow the order of their URIs in the array**, and will be set to pads from bottom to top, from left to right, meaning : not in the sequential order of the pad array indexes.... See comments.

- [Last example](https://jsbin.com/hubatox/edit?html): **Separate the GUI from the Sampler audio engine, add MIDI control (use of external MIDI devices to trigger the sounds)**. This example needs to be run with jsbin in "standalone mode" (press small black arrow on top right of the jsbin output tab). I asked chat GPT to separate the GUI from the Sampler Engine, and to integrate some tests for running it without a GUI. I also asked to include a drop down menu with the list of MIDI controllers available, so that, with the "without GUI/headless" example we can test it...

### ASSIGNMENT FOR NEXT WEEK

Spend some time on the last example. Learn from it. Be ready to reuse / refactor some code from this example and use it in your own project.
Your work is to start making a sampler inspired by the WAM plugin sampler you saw in Example4 in this folder.

What I'm expecting:
1. A real project split into files with some design work (classes etc.)
1. Start from your solution to Exercice 3 and try to merge what you saw in the last example of Exercice 5 : use of a Sampler Engine class, SamplerGUI class, keep in mind that your sampler should be usable without a GUI or with a GUI.
1. Integrate the waveform visualizer with trim bars...

### Description of the folder :

You will find several examples:
 - Example1: uses the fetch API to load a sound sample from a URI (a .wav sound, but could be .mp3, .ogg etc.), then decode it in memory and play it using the Web Audio API. For this, a very simple Web Audio Graph is built using an [AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode). I also recommend you to visit my [Web Audio API presentation](https://docs.google.com/presentation/d/16UbjX2P0uRtaej9FnH0ByjB5yyxW64bvJGCWkOpCQuA/edit?usp=sharing): 

- Example2: shows how to display the waveform corresponding to the audio sample in an HTML5 canvas. It also uses a second canvas (overlay canvas) positionned on top of the waveform one, that will allow positionning two "trimbars" for selecting the region of the sample we want to play. To learn about how to draw and animate in an HTML5 canvas, see modules 3 and 4 of my MOOC [HTML5 Coding Essentials and Best Practices](https://www.edx.org/learn/html5/the-world-wide-web-consortium-w3c-html5-coding-essentials-and-best-practices)

- Example 3: shows how to use Promise.all (we saw that in the course about JavaScript promises) in order to load and decode in parallel multiple sounds. Once decoded, for each sound a PLAY button is generated, and once clicked, a small audio graph is built for playing the sound.

- Example 4: is the same of Example3 except that we loaded a WAM Sampler (a web audio plugin, simular to VST plugins but for the Web). WAM means "Web Audio Modules". Play with this sampler (use the drop down menu, activate the keyboard, use trim bars and effects etc.).
Look at the code used to load this plugin (host.js), to get an idea of how inter-operable plugins are designed. Noticed how the sampler is connected to the Web Audio Graph: like any AudioNode... However it is composed internally of multiple audio nodes. What is this design pattern?

