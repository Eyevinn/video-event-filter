import { VideoEventFilter } from "../index.ts";

document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.querySelector("video");
  const videoEventFilter = new VideoEventFilter(videoElement);
  videoEventFilter.addEventListener("*", (event, data) => {
    console.log("event", event, "data", data);
  });

  window.videoEventFilter = videoEventFilter;
});
