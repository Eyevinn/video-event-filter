import { EmitterBaseClass } from "./EmitterBaseClass";

export enum PlayerState {
  Loading = "loading",
  Playing = "playing",
  Paused = "paused",
  Buffering = "buffering",
  Seeking = "seeking",
  Ended = "ended",
}

export enum PlayerEvents {
  Loading = "loading",
  Loaded = "loaded",
  Play = "play",
  Resume = "resume",
  Pause = "pause",
  Seeking = "seeking",
  Seeked = "seeked",
  Buffering = "buffering",
  Buffered = "buffered",
  TimeUpdate = "timeupdate",
  Ended = "ended",
  Error = "error",
}

export class VideoEventFilter extends EmitterBaseClass {
  private videoElement: HTMLVideoElement;
  private state: PlayerState;

  private pauseDebounce;
  private lastState: PlayerState;

  constructor(videoElement: HTMLVideoElement) {
    super();
    this.videoElement = videoElement;
    if (typeof videoElement === "string") {
      this.videoElement = document.querySelector(videoElement);
    }

    this.state = PlayerState.Loading;
    this.lastState;

    this.emit(PlayerEvents.Loading);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.videoElement.addEventListener("loadstart", this.onLoading.bind(this));
    this.videoElement.addEventListener("loadeddata", this.onLoaded.bind(this));
    this.videoElement.addEventListener("playing", this.onPlaying.bind(this));
    this.videoElement.addEventListener("pause", this.onPause.bind(this));
    this.videoElement.addEventListener("seeking", this.onSeeking.bind(this));
    this.videoElement.addEventListener("seeked", this.onSeeked.bind(this));
    this.videoElement.addEventListener("waiting", this.onBuffering.bind(this));
    this.videoElement.addEventListener(
      "timeupdate",
      this.onTimeUpdate.bind(this)
    );
    this.videoElement.addEventListener("error", this.onError.bind(this));
    this.videoElement.addEventListener("ended", this.onEnded.bind(this));
  }

  private onLoading(): void {
    if (this.state === PlayerState.Loading) return;
    this.setState(PlayerState.Loading);
    this.emit(PlayerEvents.Loading);
  }

  private onLoaded(): void {
    if (this.state === PlayerState.Loading) {
      this.emit(PlayerEvents.Loaded);
    }
  }

  private onPlaying(): void {
    if (this.state === PlayerState.Ended) {
      this.setState(PlayerState.Loading);
    }
    if ([PlayerState.Loading, PlayerState.Paused].includes(this.state)) {
      if (this.state === PlayerState.Loading) {
        this.emit(PlayerEvents.Play);
      }
      if (this.state === PlayerState.Paused) {
        this.lastState = PlayerState.Paused;
        this.emit(PlayerEvents.Resume);
      }
      this.setState(PlayerState.Playing, true);
    }
    if (this.state === PlayerState.Buffering) {
      this.onBuffered();
    }
  }

  private onPause(): void {
    if (this.state !== PlayerState.Playing) return;
    clearTimeout(this.pauseDebounce);
    this.pauseDebounce = setTimeout(() => {
      this.emit(PlayerEvents.Pause);
      this.setState(PlayerState.Paused, true);
    }, 200);
  }

  private onSeeking(): void {
    if (
      [PlayerState.Loading, PlayerState.Seeking, PlayerState.Ended].includes(
        this.state
      )
    )
      return;
    clearTimeout(this.pauseDebounce);
    this.setState(PlayerState.Seeking, true);
    this.emit(PlayerEvents.Seeking);
  }

  private onSeeked(): void {
    if (this.state !== PlayerState.Seeking) return;
    this.setState(this.lastState, true);
    this.emit(PlayerEvents.Seeked);
  }

  private onBuffering(): void {
    if (
      [
        PlayerState.Loading,
        PlayerState.Buffering,
        PlayerState.Seeking,
        PlayerState.Ended,
      ].includes(this.state)
    )
      return;
    this.setState(PlayerState.Buffering, true);
    this.emit(PlayerEvents.Buffering);
  }

  private onBuffered(): void {
    if (this.state !== PlayerState.Buffering) return;
    this.setState(this.lastState, true);
    this.emit(PlayerEvents.Buffered);
  }

  private onTimeUpdate(): void {
    if (
      [
        PlayerState.Loading,
        PlayerState.Paused,
        PlayerState.Seeking,
        PlayerState.Buffering,
        PlayerState.Ended,
      ].includes(this.state)
    )
      return;
    this.emit(PlayerEvents.TimeUpdate);
  }

  private onEnded(): void {
    clearTimeout(this.pauseDebounce);
    if (this.state === PlayerState.Ended) return;
    this.setState(PlayerState.Ended);
    this.emit(PlayerEvents.Ended);
  }

  private onError(data): void {
    if (this.state === PlayerState.Ended) return;
    this.emit(PlayerEvents.Error, data);
    this.onEnded();
  }

  public getState(): PlayerState {
    return this.state;
  }

  private setState(state: PlayerState, updateLast?: boolean): void {
    if (updateLast) {
      this.updateLastState(this.state);
    }
    this.state = state;
  }

  private updateLastState(state?: PlayerState): void {
    if (state) {
      this.lastState = state;
    } else {
      this.lastState = this.state;
    }
  }
}
