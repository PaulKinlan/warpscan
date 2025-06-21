export class Camera {
  constructor(videoElement, cameraSelect) {
    this.videoElement = videoElement;
    this.cameraSelect = cameraSelect;
    this.stream = null;
  }

  async populateCameraList() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error("enumerateDevices() not supported.");
      return;
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );

    videoDevices.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Camera ${this.cameraSelect.length + 1}`;
      this.cameraSelect.appendChild(option);
    });

    // Try to select the user-facing camera on mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      const userFacingCamera = videoDevices.find((device) =>
        device.label.toLowerCase().includes("front")
      );
      if (userFacingCamera) {
        this.cameraSelect.value = userFacingCamera.deviceId;
      }
    }
  }

  async start(deviceId) {
    if (this.stream) {
      this.stop();
    }

    const constraints = {
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.videoElement.srcObject = this.stream;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.videoElement.srcObject = null;
      this.stream = null;
    }
  }
}
