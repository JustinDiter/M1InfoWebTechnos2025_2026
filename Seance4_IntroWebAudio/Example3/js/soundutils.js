async function loadAndDecodeSound(url, ctx) {
   const response = await fetch(url);
   const sound = await response.arrayBuffer();

    console.log("Sound loaded as arrayBuffer    ", url);
    
    // Let's decode it. This is also asynchronous
    const decodedSound = await ctx.decodeAudioData(sound);
    console.log("Sound decoded", url);

    return decodedSound;
  };

// This function builds the audio graph for playing the sound
// In this simple case, it is just a buffer source connected to the destination
// (the audio card)
// We return the created buffer source node
function buildAudioGraph(ctx, buffer) {
  let bufferSource = ctx.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.connect(ctx.destination);
  return bufferSource;  
}

// play portion of buffer (startTime, endTime in seconds)
function playSound(ctx, buffer, startTime = 0, endTime = buffer.duration) {
  if (!ctx || !buffer) return null;

  // clamp times
  if (startTime < 0) startTime = 0;
  if (endTime > buffer.duration) endTime = buffer.duration;
  if (endTime <= startTime) return null;

  // create a one-shot BufferSource
  const source = buildAudioGraph(ctx, buffer);

  // start immediately, playing buffer between startTime and endTime
  try {
    source.start(ctx.currentTime, startTime, endTime - startTime);
  } catch (e) {
    console.error("BufferSource start failed", e);
    source.disconnect();
    return null;
  }

  // cleanup after playback ends
  source.onended = () => {
    try { source.disconnect(); } catch (e) {}
  };

  return source;
}

// export the function
export { loadAndDecodeSound, playSound };