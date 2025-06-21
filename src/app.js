import { Camera } from "./camera.js";
import { Scanner } from "./scanner.js";
import { get, set } from "./lib.js";

const videoElement = document.getElementById("video");
const outputCanvas = document.getElementById("output");
const scannerLine = document.getElementById("scanner-line");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const saveButton = document.getElementById("save");
const selectDirButton = document.getElementById("select-dir");
const cameraSelect = document.getElementById("camera-select");
const scanDirectionSelect = document.getElementById("scan-direction");

let camera;
let scanner;
let animationFrameId;
let dirHandle;

async function main() {
  dirHandle = await get("dirHandle");

  if (dirHandle) {
    selectDirButton.textContent = "Change directory";
  }

  camera = new Camera(videoElement, cameraSelect);
  await camera.populateCameraList();

  scanner = new Scanner(videoElement, outputCanvas, scannerLine);

  startButton.addEventListener("click", start);
  stopButton.addEventListener("click", stop);
  saveButton.addEventListener("click", save);
  scanDirectionSelect.addEventListener("change", () => {
    scanner.setDirection(scanDirectionSelect.value);
  });

  selectDirButton.addEventListener("click", async () => {
    try {
      dirHandle = await window.showDirectoryPicker();
      await set("dirHandle", dirHandle);
      selectDirButton.textContent = "Change directory";
    } catch (err) {
      console.error(err);
    }
  });

  setButtonState("initial");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/src/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
}

function setButtonState(state) {
  if (state === "initial") {
    startButton.hidden = false;
    stopButton.hidden = true;
    saveButton.hidden = true;
  } else if (state === "scanning") {
    startButton.hidden = true;
    stopButton.hidden = false;
    saveButton.hidden = true;
  } else if (state === "stopped_manual") {
    startButton.hidden = false;
    stopButton.hidden = true;
    saveButton.hidden = true;
  } else if (state === "stopped_complete") {
    startButton.hidden = false;
    stopButton.hidden = true;
    saveButton.hidden = false;
  }
}

async function start() {
  setButtonState("scanning");

  const deviceId = cameraSelect.value;
  await camera.start(deviceId);

  const direction = scanDirectionSelect.value;
  scanner.start(direction);

  function scan() {
    scanner.scan();
    if (scanner.isScanning) {
      animationFrameId = requestAnimationFrame(scan);
    } else {
      // Scan finished automatically
      camera.stop();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      setButtonState("stopped_complete");
    }
  }
  scan();
}

async function stop() {
  camera.stop();
  scanner.stop();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  setButtonState("stopped_manual");
}

async function save() {
  if (dirHandle) {
    const blob = await new Promise((resolve) =>
      outputCanvas.toBlob(resolve, "image/png")
    );
    const fileHandle = await dirHandle.getFileHandle(
      `warp-scan-${Date.now()}.png`,
      { create: true }
    );
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    const image = outputCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "warp-scan.png";
    link.click();
  }
}

main();
