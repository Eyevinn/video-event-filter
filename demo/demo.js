import { VideoEventFilter } from "../index";

document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.querySelector("video");
  const videoEventFilter = new VideoEventFilter(videoElement);
  videoEventFilter.addEventListener("*", (event, data) => {
    console.log("EVENT:", event);
  });
});
