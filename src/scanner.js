export class Scanner {
  constructor(videoElement, outputCanvas, scannerLine) {
    this.videoElement = videoElement;
    this.outputCanvas = outputCanvas;
    this.outputCtx = this.outputCanvas.getContext("2d");
    this.scannerLine = scannerLine;
    this.direction = "vertical";
    this.scanPosition = 0;
    this.isScanning = false;
  }

  setDirection(direction) {
    this.direction = direction;
    this.reset();
  }

  start(direction) {
    this.setDirection(direction);
    this.isScanning = true;
    this.outputCanvas.width = window.innerWidth;
    this.outputCanvas.height = window.innerHeight;
    this.videoElement.play();
  }

  stop() {
    this.isScanning = false;
  }

  reset() {
    this.scanPosition = 0;
    this.outputCtx.clearRect(
      0,
      0,
      this.outputCanvas.width,
      this.outputCanvas.height
    );
  }

  scan() {
    if (
      !this.isScanning ||
      this.videoElement.paused ||
      this.videoElement.ended
    ) {
      return;
    }

    const videoWidth = this.videoElement.videoWidth;
    const videoHeight = this.videoElement.videoHeight;
    const canvasWidth = this.outputCanvas.width;
    const canvasHeight = this.outputCanvas.height;

    // The video is scaled to "cover" the canvas, so we need to figure out
    // the scale and offset of the video.
    const videoAspectRatio = videoWidth / videoHeight;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, x, y;

    if (videoAspectRatio > canvasAspectRatio) {
      // Video is wider than canvas, so it's scaled to fit height
      drawHeight = canvasHeight;
      drawWidth = drawHeight * videoAspectRatio;
      x = (drawWidth - canvasWidth) / 2;
      y = 0;
    } else {
      // Video is taller than canvas, so it's scaled to fit width
      drawWidth = canvasWidth;
      drawHeight = drawWidth / videoAspectRatio;
      x = 0;
      y = (drawHeight - canvasHeight) / 2;
    }

    if (this.direction === "vertical") {
      const sliceWidth = 1;
      const videoScale = drawWidth / videoWidth;
      const sx = x / videoScale + this.scanPosition / videoScale;

      this.outputCtx.drawImage(
        this.videoElement,
        sx,
        0,
        sliceWidth,
        videoHeight,
        this.scanPosition,
        0,
        sliceWidth,
        canvasHeight
      );

      this.scannerLine.style.width = "5px";
      this.scannerLine.style.height = "100%";
      this.scannerLine.style.left = `${this.scanPosition}px`;
      this.scannerLine.style.top = "0";

      this.scanPosition = this.scanPosition + 1;
      if (this.scanPosition >= canvasWidth) {
        this.stop();
      }
    } else {
      // horizontal
      const sliceHeight = 1;
      const videoScale = drawHeight / videoHeight;
      const sy = y / videoScale + this.scanPosition / videoScale;

      this.outputCtx.drawImage(
        this.videoElement,
        0,
        sy,
        videoWidth,
        sliceHeight,
        0,
        this.scanPosition,
        canvasWidth,
        sliceHeight
      );

      this.scannerLine.style.width = "100%";
      this.scannerLine.style.height = "5px";
      this.scannerLine.style.left = "0";
      this.scannerLine.style.top = `${this.scanPosition}px`;

      this.scanPosition = this.scanPosition + 1;
      if (this.scanPosition >= canvasHeight) {
        this.stop();
      }
    }
  }
}
