const vosk = require("vosk");
const mic = require("mic");
const fs = require("fs");

const MODEL_PATH = "C:\\Users\\sheet\\Downloads\\vosk-model-small-en-us-0.15"; // change path
const SAMPLE_RATE = 16000;

if (!fs.existsSync(MODEL_PATH)) {
    console.error("Model not found at", MODEL_PATH);
    process.exit();
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);

const microphone = mic({
    rate: String(SAMPLE_RATE),
    channels: "1",
    debug: false,
    device: "default"
});

const micInputStream = microphone.getAudioStream();
const recognizer = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE });

micInputStream.on("data", (data) => {
    if (recognizer.acceptWaveform(data)) {
        console.log("📝", recognizer.result().text);
    }
});

micInputStream.on("error", (err) => {
    console.error("Error:", err);
});

micInputStream.on("startComplete", () => {
    console.log("🎤 Speak into your microphone...");
});

microphone.start();

process.on("SIGINT", function () {
    console.log("\nStopping...");
    microphone.stop();
    recognizer.free();
    model.free();
    process.exit();
});
console.log("🟢 Vosk Speech Recognition is running. Press Ctrl+C to stop.");