import { app } from "./src/app.mjs";
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API Presets (squelette) http://localhost:${PORT}`));
