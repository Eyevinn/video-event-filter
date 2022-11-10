import { EmitterBaseClass } from "./EmitterBaseClass";

export enum PlayerState {
  Idle = "idle",
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

enum NetworkState {
  NETWORK_EMPTY,
  NETWORK_IDLE,
  NETWORK_LOADING,
  NETWORK_NO_SOURCE,
}

enum ReadyState {
  HAVE_NOTHING,
  HAVE_METADATA,
  HAVE_CURRENT_DATA,
  HAVE_FUTURE_DATA,
  HAVE_ENOUGH_DATA,
}

function getInitialState(videoElement: HTMLVideoElement): PlayerState {
  if (
    videoElement.readyState === ReadyState.HAVE_NOTHING &&
    videoElement.networkState === NetworkState.NETWORK_EMPTY
  ) {
    return PlayerState.Idle;
  } else if (videoElement.networkState === NetworkState.NETWORK_LOADING) {
    return PlayerState.Loading;
  } else if (!videoElement.ended) {
    return videoElement.paused ? PlayerState.Paused : PlayerState.Playing;
  }
  return PlayerState.Ended;
}

export class VideoEventFilter extends EmitterBaseClass {
  private videoElement: HTMLVideoElement;
  private listeners: {
    type: string;
    handler: () => void;
  }[] = [];

  private state: PlayerState;
  private lastState: PlayerState;
  private pauseDebounce: number;

  constructor(videoElement: HTMLVideoElement) {
    super();
    this.videoElement = videoElement;
    if (typeof videoElement === "string") {
      this.videoElement = document.querySelector(videoElement);
    }

    this.state = getInitialState(videoElement);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.addListener("loadstart", this.onLoading);
    this.addListener("loadeddata", this.onLoaded);
    this.addListener("playing", this.onPlaying);
    this.addListener("pause", this.onPause);
    this.addListener("seeking", this.onSeeking);
    this.addListener("seeked", this.onSeeked);
    this.addListener("waiting", this.onBuffering);
    this.addListener("ratechange", this.onRateChange);
    this.addListener("timeupdate", this.onTimeUpdate);
    this.addListener("error", this.onError);
    this.addListener("ended", this.onEnded);
  }

  private addListener(type: string, handler: () => void) {
    const boundHandler = handler.bind(this);
    this.videoElement.addEventListener(type, boundHandler);
    this.listeners.push({
      type,
      handler: boundHandler,
    });
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
    this.pauseDebounce = window.setTimeout(() => {
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

  private onRateChange(): void {
    if (this.videoElement.playbackRate > 0) return;
    const isBuffering =
      this.videoElement.playbackRate === 0 &&
      this.videoElement.paused === false;
    if (isBuffering) {
      this.onBuffering();
    }
  }

  private onTimeUpdate(): void {
    if (
      this.videoElement.seeking ||
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

  private onError(): void {
    if (this.state === PlayerState.Ended) return;
    this.emit(PlayerEvents.Error, this.videoElement.error);
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

  public destroy() {
    this.listeners.forEach(({ type, handler }) => {
      this.videoElement.removeEventListener(type, handler);
    });
    super.destroy();
  }
}
