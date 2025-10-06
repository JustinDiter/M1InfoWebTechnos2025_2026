document.addEventListener("DOMContentLoaded", async () => {
    const presetsList = document.getElementById("presets-list");

    try {
      const response = await fetch("/api/presets");
      const presets = await response.json();
    
      if (presets.length === 0) {
        presetsList.textContent = "No presets found.";
        return;
      }

      const ul = document.createElement("ul");
      presets.forEach(preset => {
        const li = document.createElement("li");
        li.textContent = `${preset.name} (${preset.type})`; // <-- fixed here
        li.style.cursor = "pointer";
        li.onclick = async () => {
            // Fetch and display preset details
            const res = await fetch(`/api/presets/${preset.name}`);
            const details = await res.json();
            alert(JSON.stringify(details, null, 2));
        };
        ul.appendChild(li);
      });
      presetsList.appendChild(ul);
    } catch (err) {
        presetsList.textContent = "Error loading presets.";
        console.error(err);
    }
});