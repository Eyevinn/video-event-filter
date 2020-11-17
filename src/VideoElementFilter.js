import { EmitterBaseClass } from "./EmitterBaseClass";

export class VideoElementFilter extends EmitterBaseClass {
  constructor(videoElement) {
    super();
    this.videoElement = videoElement;
    if (typeof videoElement === "string") {
      this.videoElement = document.querySelector(videoElement);
    }

    this.loading = true;
    this.playing;
    this.paused;
    this.buffering;
    this.seeking;
    this.ended;

    this.emit("loading");
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.videoElement.addEventListener(
      "canplaythrough",
      this.onLoaded.bind(this)
    );
    this.videoElement.addEventListener("playing", this.onPlaying.bind(this));
    this.videoElement.addEventListener("pause", this.onPause.bind(this));
    this.videoElement.addEventListener("seeking", this.onSeeking.bind(this));
    this.videoElement.addEventListener("seeked", this.onSeeked.bind(this));
    this.videoElement.addEventListener("waiting", this.onBuffering.bind(this));
    this.videoElement.addEventListener("buffered", this.onBuffered.bind(this));
    this.videoElement.addEventListener(
      "timeupdate",
      this.onTimeUpdate.bind(this)
    );
    this.videoElement.addEventListener("error", this.onError.bind(this));
    this.videoElement.addEventListener("ended", this.onEnded.bind(this));
  }

  onLoaded() {
    if (!this.playing && this.loading) {
      this.emit("loaded");
    }
  }

  onPlaying() {
    if (this.ended) {
      this.ended = false;
      this.loading = true;
    }
    if (!this.playing && (this.loading || this.paused)) {
      if (this.loading) {
        this.emit("play");
      }
      if (this.paused) {
        this.emit("resume");
      }
      this.loading = false;
      this.paused = false;
      this.playing = true;
    }
  }

  onPause() {
    if (
      this.loading ||
      this.paused ||
      this.buffering ||
      this.seeking ||
      this.ended
    )
      return;
    this.pauseDebounce = setTimeout(() => {
      this.emit("pause");
      this.playing = false;
      this.paused = true;
    }, 200);
  }

  onSeeking() {
    if (this.seeking) return;
    clearTimeout(this.pauseDebounce);
    this.seeking = true;
    this.emit("seeking");
  }

  onSeeked() {
    if (!this.seeking) return;
    this.seeking = false;
    this.emit("seeked");
  }

  onBuffering() {
    if (this.buffering || this.seeking) return;
    this.buffering = true;
    this.emit("buffering");
  }

  onBuffered() {
    if (!this.buffering) return;
    this.buffering = false;
    this.playing = true;
    this.emit("buffered");
  }

  onTimeUpdate() {
    if (this.paused || this.seeking || this.buffering || this.ended) return;
    this.emit("timeupdate");
  }

  onEnded() {
    clearTimeout(this.pauseDebounce);
    if (this.ended) return;
    this.loading = false;
    this.playing = false;
    this.paused = false;
    this.buffering = false;
    this.seeking = false;
    this.ended = true;
    this.emit("ended");
  }

  onError(data) {
    if (this.ended) return;
    this.emit("error", data);
    this.onEnded();
  }
}
