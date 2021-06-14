import getVideoSize from './get-video-size';

const defaults = {
  videoClass: 'video',
  controlsClass: 'video-controller',
  toggleButtonClass: 'button--toggle',
  loadedClass: 'is-loaded',
  mutedClass: 'is-muted',
  pausedClass: 'is-paused',
  ratio: null
};

export default class VideoController {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    const { root } = options;

    this.options = options;
    this.root;
    this.video;
    this.loaded;
    this.width;
    this.height;
    this.stop;
    if (typeof root === 'string') {
      this.root = document.querySelector(root);
    } else if (root instanceof Element) {
      this.root = root;
    }

    if (root && !this.root) {
      return;
    }

    const video = root.querySelector(`.${options.videoClass}`);
    const controller = root.querySelector(`.${options.controlsClass}`);
    const toggleButton =
      controller && controller.querySelector(`.${options.toggleButtonClass}`);

    getVideoSize(video).then((info) => {
      this.video = video;
      this.loaded = true;
      this.width = info.width;
      this.height = info.height;

      this.mute();
      this.pause();

      if(options.ratio && options.ratio > info.height / info.width) {
        video.classList.add(`${options.videoClass}--w`);
      }

      root.classList.add(options.loadedClass);

      // if (volumnButton) {
      //   volumnButton.addEventListener('click', () => {
      //     if (video.muted) {
      //       this.unmute();
      //     } else {
      //       this.mute();
      //     }
      //   });
      // }

      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          if (video.paused) {
            this.play(false);
          } else {
            this.pause(false);
          }
        });
      }
    });
  }

  play(force = true) {
    const { root, video, loaded, options } = this;
    if (loaded) {
      if (force) {
        this.mute();
      }
      video.play();
      root.classList.remove(options.pausedClass);
    }
  }

  pause() {
    const { root, video, options } = this;
    if(this.loaded && video.paused === false){
      video.pause();
      root.classList.add(options.pausedClass);
    }
  }

  mute() {
    const { root, video, options } = this;
    video.muted = true;
    root.classList.add(options.mutedClass);
  }

  unmute() {
    const { root, video, options } = this;
    video.muted = false;
    root.classList.remove(options.mutedClass);
  }
}
