const $ = window.jQuery;
const anime = window.anime;
const defaults = {
  rootId: 'loading',
  duration: 1200,
  repeatDelay: 1500,
  activeClass: 'active'
};

function makeLoadingElement(id) {
  const $element = $(`<div id="${id}" class="loading" />`);
  const $svg = $(`<div class="loading__icon"><svg class="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 111.81 165.34">
    <path class="normal" d="M336.16,712s1.78,4.59,0,11.84,12.54,2.8,10.34-5.92c-2.71-7.34-7.82-14.7-15.39-12.79-10.78,2.72-12.56,5.6-12.65,6.45s-.51,1-.51,1c-2.8,1.74-7.89,3.54-11.14,4.88s-1.08,4.13-1.08,4.13a5.14,5.14,0,0,0,3.89,5.22c2.8.83.89,2,4.2,2.36s4.2-1.85,9.16-1,8.66-1.59,8.85.83,1.4,7.44-1.28,19.28,3.19,35.77,3.19,35.77S339,801.93,342,808.83s6.87,21.41.85,24.29-7.64,3.91-8.15,7.81c7.47,3.14,12.48,1.1,14.85-.25s3.31.33,3.48-13.5-1.78-21.81,0-38.7,19.52-23.08,28.94-20.7c8.88,2.24,10.52,13.75,10,21.82" transform="translate(-304.03 -678.25)"/>
    <path class="reverse" d="M346.93,682a2.74,2.74,0,1,0-4.1,2.36l-4.06,4.2-3.27-4.27a2.74,2.74,0,1,0-3,0l-3.27,4.27-4.07-4.2a2.74,2.74,0,1,0-1.72.34V695.6s2.22,1.91,10.56,1.91,10.57-1.91,10.57-1.91V684.68A2.71,2.71,0,0,0,346.93,682Z" transform="translate(-304.03 -678.25)"/>
    <path class="reverse" d="M392,789.6s5.49,17.13,7.78,23.41,4.58,18-.08,20.11c-5.37,2.44-7.56,1.62-8.49,7.39,1.61,1.52,3.82,2.29,11.12,1.78s7-6.37,7-6.37l-.17-61.61c2.8,2.63,7.89,2,4.75-.34s-1.53-5-8.23-15-17.57-13.07-27.92-12.81-16.89,5.51-21.39,7.72-6.19-2.12-5.94-7.38-.68-11.88-1.7-19.94" transform="translate(-304.03 -678.25)"/>
    <path class="reverse" d="M330.06,841a15.19,15.19,0,0,1-4.64-.73,6,6,0,0,1,3.82-6.53c4.67-1.79,7.55-2.72,7.55-8.15,0-3.63-1.72-14-2.6-25.1" transform="translate(-304.03 -678.25)"/>
    <path class="normal" d="M386.76,840.59a23.6,23.6,0,0,1-4.57-.51s-1.16-5,3.84-6.72,7.18-3,7.6-7c.28-2.61-1.09-14.39-1.7-24.27" transform="translate(-304.03 -678.25)"/>
  </svg></div>`);
  $element.append($svg);
  return $element[0];
}

export default class Loading {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.options = options;
    let root = document.querySelector(`#${options.rootId}`);

    if (!root) {
      root = makeLoadingElement(options.rootId);
      document.body.appendChild(root);
    }

    const animations = [];
    const paths = root.querySelectorAll('path');
    paths.forEach((path, i) => {
      const offset = anime.setDashoffset(path);
      const isReverse = path.classList.contains('reverse');
      let duration = options.duration;
      let delay = 0;

      path.setAttribute('stroke-dashoffset', offset);

      if (i === 1) {
        // 왕관
        delay = duration / 6;
      } else if (i === 3) {
        // FR 다리
        delay = duration / 2;
      } else if (i === 4) {
        // RR 다리
        delay = duration / 1.5;
      }
      if (delay !== 0) {
        duration = duration - delay;
      }
      const animation = anime({
        targets: path,
        strokeDashoffset: isReverse ? [offset, offset * 2] : [offset, 0],
        duration: duration,
        delay: delay,
        endDelay: options.repeatDelay,
        loop: true,
        easing: 'linear',
        autoplay: false
      });
      animations.push(animation);
    });
    this.root = root;
    this.animations = animations;
    this.timer;
    this.isActive;
  }
  show() {
    const { root, animations, isActive, options } = this;
    if (!isActive) {
      root.classList.add(options.activeClass);
      window.clearTimeout(this.timer);
      animations.forEach((animation) => {
        animation.play();
      });
      this.isActive = true;
    }
  }
  hide() {
    const { root, animations, isActive, options } = this;
    if (isActive) {
      root.classList.remove(options.activeClass);
      this.timer = window.setTimeout(() => {
        animations.forEach((animation) => {
          animation.pause();
          animation.seek(0);
        });
      }, 1000);
      this.isActive = false;
    }
  }
}
