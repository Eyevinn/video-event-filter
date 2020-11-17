Video Element Filter
===

A simple module to filter the events sent from the video element in a way that align with what is, most probably, expected from an analytics perspective.

### Difference vs default events

The main differences that this filtering brings is

- No `pause` is triggered while not playing. I.e. for seek, buffering or similar.
- Instead of `waiting` event we have a proper **`buffering`** and `buffered` event flow.
- `timeupdate` is only triggered during ongoing playback.
- A `play` event after `pause` is now called **`resume`** to differ from the `play` event.

## Implementation

```js
const videoElement = document.querySelector("video");

const videoElementFilter = new VideoElementFilter(videoElement);
videoElementFilter.addEventListener("*", (event) => {
  console.log("Event: ", event);
});
```

### Events

- `loading`
- `loaded`, video have loaded, but not started
- `play`, video have started to play
- `pause`
- `resume`, video have started to play after a `pause`
- `seeking`
- `seeked`, video is done seeking. Continue in the state that existed before.
- `buffering`
- `buffered`, video is done buffering. Continue in the state that existed before.
- `timeupdate`
- `ended`
- `error`
