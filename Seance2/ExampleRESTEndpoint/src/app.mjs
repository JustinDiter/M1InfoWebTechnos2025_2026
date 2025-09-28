// src/app.mjs 
import express from "express";
import fs from "node:fs/promises"; // equivalent to : import fs from "fs/promises";
                              // The "node:..." prefix is the explicit form introduced in 
                              // Node.js 14+. It makes it clear you’re importing a 
                              // built-in core module, not something from node_modules.
import path from "path";


export const app = express();
app.use(express.json({ limit: "2mb" }));

// PUBLIC_DIR default for static files -> ../public
export let PUBLIC_DIR = process.env.DATA_DIR || new URL("../public", import.meta.url).pathname;
// directory for storing presets (can be set with DATA_DIR env var), useful for deployment with docker
export let DATA_DIR = process.env.DATA_DIR || PUBLIC_DIR + "/presets";
// clean path names
PUBLIC_DIR = decodeURIComponent(PUBLIC_DIR);
DATA_DIR = decodeURIComponent(DATA_DIR);


// Defines where static files are located, for example the file data/presets/Basic Kit/kick.wav
// will be accessible at http://localhost:3000/presets/Basic%20Kit/kick.wav
// The file PUBLIC_DIR/index.html will be served at http://localhost:3000/ or http://localhost:3000/index.html
app.use(express.static(PUBLIC_DIR));

// Ensure data dir exists at startup (best-effort)
await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => { });

// ------- Helpers / utility functions -------
// normalize, slugify, safePresetPath, fileExists, readJSON, writeJSON, listPresetFiles, validatePreset

// normalize a value to a string, if null or undefined returns empty string
const normalize = (s) => (s ?? "").toString();

// slugify a string to be URL-friendly: lowercase, no accents, no special chars, spaces to dashes
const slugify = (s) =>
  normalize(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .toLowerCase();

// Get the full path of a preset JSON file from its name or slug. slug means a URL-friendly version of the name
const safePresetPath = (nameOrSlug) => {
  const slug = slugify(nameOrSlug);
  return path.join(DATA_DIR, `${slug}.json`);
};

const fileExists = async (p) => {
  try { await fs.access(p); return true; } catch { return false; }
};

// Read and parse a JSON file, returns a JS object
const readJSON = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));

// Stringify and write a JS object to a JSON file
const writeJSON = async (filePath, data) => fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

// Returns an array of preset JSON filenames (not full path) in the DATA_DIR
const listPresetFiles = async () => {
  console.log("Reading DATA_DIR:", DATA_DIR);

  const items = await fs.readdir(DATA_DIR).catch(() => []);
  console.log(items);
  return items.filter((f) => f.endsWith(".json"));
};



// ------- Routes -------
// This is where we define the API endpoints (also called web services or routes)
// Each route has a method (get, post, put, patch, delete) and a path (e.g., /api/presets)
// The handler function takes the request (req), response (res), and next (for error handling) as parameters

// Simple health check endpoint, this is generally the first endpoint to test
app.get("/api/health", (_req, res) => res.json({ ok: true, now: new Date().toISOString() }));

// GET list/search
// the second parameter is an async function that will be called
// when a GET request is received on this endpoint. async means that in the body
// of the function we can use the await keyword to wait for a promise to be resolved
// example: http://localhost:3000/api/presets
// example with parameters (filters): http://localhost:3000/api/presets?q=Basic&type=Drumkit&factory=true
app.get("/api/presets", async (req, res, next) => {
  try {
    // TODO
    // First get the list of preset files and return it as a JSON array of objects
    
    // In a second step, implement filtering based on optional parameters passed in the
    // URI after the ? character. These parameters are in the req.query object.
    // req.query contains optional parameters: q (text search), type (filter by type), factory (true/false)
    // Check in the DATA_DIR folder for the structure of the JSON files
    // You can use Array.filter and String.includes for text search
    // For boolean parameters, consider that if the parameter is present and true,
    // it means we want only factory presets, if not present or false, we want all presets
    // Example of a request with parameters:
    // that appear in the URI like that : /api/presets?q=kick&type=drum&factory=true
    // You can test directly in the browser, enter for example:
    // http://localhost:3000/api/presets?q=Basic&type=Drumkit&factory=true
    // It should return only the Basic Kit preset
    
    // Return the filtered list. the.json method sets the Content-Type header and stringifies the object
    //res.json(items);
    res.json(`THIS FEATURE IS TO BE DONE. You should return the list of JSON preset files located in the folder ${DATA_DIR}as a JSON array of objects`);
  } catch (e) { next(e); }
});

// GET one preset by name (optionnaly: or slug. slug means a URL-friendly version of the 
// name. Check the safePresetPath and slugify functions above, in the hem)
app.get("/api/presets/:name", async (req, res, next) => {
  const presetName = req.params.name;
  try {

    // TODO
    res.json(`THIS FEATURE IS TO BE DONE. This should return the content of the preset JSON file ${DATA_DIR}/${req.params.name} as a JSON object`);
    //res.json(await readJSON(file));
  } catch (e) { next(e); }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});
