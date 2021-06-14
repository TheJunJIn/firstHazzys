export default function videoLoadPromise(videoElement) {
  return new Promise((resolve, reject) => {
    if (videoElement.readyState) {
      resolve({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      });
    } else {
      videoElement.addEventListener('loadedmetadata', () => {
        if (videoElement.videoWidth !== 0 && videoElement.videoHeight !== 0) {
          resolve({
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
          });
        } else {
          reject(Error('(' + videoElement + ' )비디오 메타데이터 오류'));
        }
      });
      videoElement.addEventListener('error', () => {
        reject(Error('(' + videoElement + ' )비디오 메타데이터 오류'));
      });
    }
  });
}