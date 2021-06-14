import videoLoadPromise from './video-load-promise';

export default async function getVideoSize(video) {
  let dimentions = {};
  if (video instanceof Element && video.dataset.videoWidth && video.dataset.videoHeight) {
    dimentions.width = parseInt(video.dataset.videoWidth, 10);
    dimentions.height = parseInt(video.dataset.videoHeight, 10);
  } else {
    dimentions = await videoLoadPromise(video);
  }
  return dimentions;
}