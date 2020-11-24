import { VideoElementFilter } from "../index";

document.addEventListener("DOMContentLoaded", () => {
  const videoElement = document.querySelector("video");
  const videoElementFilter = new VideoElementFilter(videoElement);
  videoElementFilter.addEventListener("*", (event, data) => {
    console.log("EVENT:", event);
  });
});
