import 'intersection-observer'
// https://github.com/ezekielaquino/Marquee3000
// import Marquee3k from 'marquee3000';
import VideoController from '../../components/videoController';
import UIModule from '../../components/ui-module';

const { $ } = window;

let animationId = 0;

class Marquee3k {
  constructor(element, options) {
    this.element = element;
    this.selector = options.selector;
    this.speed = element.dataset.speed || 0.25;
    this.pausable = element.dataset.pausable;
    this.reverse = element.dataset.reverse;
    this.paused = false;
    this.parent = element.parentElement;
    this.parentProps = this.parent.getBoundingClientRect();
    this.content = element.children[0];
    this.innerContent = this.content.innerHTML;
    this.wrapStyles = '';
    this.offset = 0;

    this._setupWrapper();
    this._setupContent();
    this._setupEvents();

    this.wrapper.appendChild(this.content);
    this.element.appendChild(this.wrapper);
  }

  _setupWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('marquee3k__wrapper');
    this.wrapper.style.whiteSpace = 'nowrap';
  }

  _setupContent() {
    this.content.classList.add(`${this.selector}__copy`);
    this.content.style.display = 'inline-block';
    this.contentWidth = this.content.offsetWidth;

    this.requiredReps = this.contentWidth > this.parentProps.width ? 2 : Math.ceil((this.parentProps.width - this.contentWidth) / this.contentWidth) + 1;

    for (let i = 0; i < this.requiredReps; i++) {
      this._createClone();
    }

    if (this.reverse) {
      this.offset = this.contentWidth * -1;
    }

    this.element.classList.add('is-init');
  }

  _setupEvents() {
    this.element.addEventListener('mouseenter', () => {
      if (this.pausable) this.paused = true;
    });

    this.element.addEventListener('mouseleave', () => {
      if (this.pausable) this.paused = false;
    });
  }

  _createClone() {
    const clone = this.content.cloneNode(true);
    clone.style.display = 'inline-block';
    clone.classList.add(`${this.selector}__copy`);
    this.wrapper.appendChild(clone);
  }

  animate() {
    if (!this.paused) {
      const isScrolled = this.reverse ? this.offset < 0 : this.offset > this.contentWidth * -1;
      const direction = this.reverse ? -1 : 1;
      const reset = this.reverse ? this.contentWidth * -1 : 0;

      if (isScrolled) this.offset -= this.speed * direction;
      else this.offset = reset;

      this.wrapper.style.whiteSpace = 'nowrap';
      this.wrapper.style.transform = `translate(${this.offset}px, 0) translateZ(0)`;
    }
  }

  _refresh() {
    this.contentWidth = this.content.offsetWidth;
  }

  repopulate(difference, isLarger) {
    this.contentWidth = this.content.offsetWidth;

    if (isLarger) {
      const amount = Math.ceil(difference / this.contentWidth) + 1;

      for (let i = 0; i < amount; i++) {
        this._createClone();
      }
    }
  }

  static refresh(index) {
    MARQUEES[index]._refresh();
  }

  static pause(index) {
    MARQUEES[index].paused = true;
  }

  static play(index) {
    MARQUEES[index].paused = false;
  }

  static toggle(index) {
    MARQUEES[index].paused = !MARQUEES[index].paused;
  }

  static refreshAll() {
    for (let i = 0; i < MARQUEES.length; i++) {
      MARQUEES[i]._refresh();
    }
  }

  static pauseAll() {
    for (let i = 0; i < MARQUEES.length; i++) {
      MARQUEES[i].paused = true;
    }
  }

  static playAll() {
    for (let i = 0; i < MARQUEES.length; i++) {
      MARQUEES[i].paused = false;
    }
  }

  static toggleAll() {
    for (let i = 0; i < MARQUEES.length; i++) {
      MARQUEES[i].paused = !MARQUEES[i].paused;
    }
  }

  static init(options = { selector: 'marquee3k' }) {
    if (animationId) window.cancelAnimationFrame(animationId);

    window.MARQUEES = [];
    const marquees = Array.from(document.querySelectorAll(`.${options.selector}`));
    let previousWidth = window.innerWidth;
    let timer;

    for (let i = 0; i < marquees.length; i++) {
      const marquee = marquees[i];
      const instance = new Marquee3k(marquee, options);
      MARQUEES.push(instance);
    }

    animate();

    function animate() {
      for (let i = 0; i < MARQUEES.length; i++) {
        MARQUEES[i].animate();
      }
      animationId = window.requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        const isLarger = previousWidth < window.innerWidth;
        const difference = window.innerWidth - previousWidth;

        for (let i = 0; i < MARQUEES.length; i++) {
          MARQUEES[i].repopulate(difference, isLarger);
        }

        previousWidth = this.innerWidth;
      }, 250);
    });
  }
}


// =============================================================================
// 상단 배너
// =============================================================================
const mainBannerSwiper = new Swiper('.swiper-container--main-banner', {
  speed: 800,
  loop: true,
  init: false,
  spaceBetween: 100,
  slidesPerView: 'auto',
  centeredSlides: true,
  breakpoints: {
    1023: {
      spaceBetween: 0
    }
  },
  autoplay: {
    delay: 8000,
    disableOnInteraction: false
  },
  pagination: {
    el: '.swiper-pagination',
    type: 'fraction'
  },
  observer: true,
  observeParents: true
});
const mainBannerContentSwiper = new Swiper(
  '.swiper-container--main-banner-content',
  {
    effect: 'fade',
    // fadeEffect: {
    //   crossFade: true
    // },
    noSwiping: true,
    noSwipingClass: 'swiper-slide',
    observer: true,
    observeParents: true
  }
);

mainBannerSwiper.on('slideChange', () => {
  mainBannerSwiperChange(mainBannerSwiper);
});
mainBannerSwiper.on('init', () => {
  mainBannerSwiperChange(mainBannerSwiper);
});

mainBannerSwiper.init();

let mainBannerSwiperIndex = 0;
let mainBannerSwiperTimer = null;
function mainBannerSwiperChange(swiper) {
  const { realIndex, el } = swiper;
  clearTimeout(mainBannerSwiperTimer);
  if (mainBannerSwiperIndex !== realIndex) {
    mainBannerSwiperIndex = realIndex;
    mainBannerSwiperTimer = window.setTimeout(function () {
      if (mainBannerSwiperIndex === realIndex) {
        const mainBannerProgress = el.querySelector('.progress-bar__value');
        mainBannerProgress.style.width = `${Math.round(
          ((realIndex + 1) / mainBannerContentSwiper.slides.length) * 100
        )}%`;
        mainBannerContentSwiper.slideTo(realIndex);
      }
    }, 100);
  }
}

// =============================================================================
// 알림 배너 ( 흐르는 배너 )
// =============================================================================
Marquee3k.init({
  selector: 'marquee-banner'
});

window.MARQUEES.forEach((marquee) => {
  const parent = marquee.element.closest('.banner');
  const close = parent.querySelector('.banner__close');
  marquee.root = parent;
  marquee.close = close;
  $(parent).data('marquee', marquee);
  close.addEventListener('click', () => {
    marquee.paused = true;
    $(parent).slideUp('fast', function () {
      $(parent).closest('.banner-block').remove();
    });
  });
});


// =============================================================================
// 카테고리
// =============================================================================
class CategoryBar extends UIModule {
  constructor(params = {}) {
    super({
      root: '.section--category-bar',
      listSelector: '.category-bar__list',
      fixedClass: 'fixed',
      ...params
    });

    if (!this.root) {
      this.destroy();
      return;
    }

    this.list = this.root.querySelector(this.options.listSelector);
    this.isEnabled;
    this.isFixed

    this.report('viewType').then(({ viewType }) => {
      this.isEnabled = viewType === 'mobile';
      this.update();
    });
    this.listen('scroll', () => {
      if(this.isEnabled) {
        this.update();
      }
    });
    this.listen('resize', () => {
      this.update();
    });
    this.listen('viewTypeChanged', ({ value }) => {
      this.isEnabled = value === 'mobile';
      this.update();
    });
  }
  update(){
    const { isEnabled, isFixed } = this;

    if(!isEnabled && isFixed ){
      this.release();
      return;
    }
    if( isEnabled ) {
      const top = $(this.root).offset().top;
      const scrollY = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);

      if(scrollY >= top) {
        if(!this.isFixed) {
          this.lock();
        }
      } else {
        if(this.isFixed) {
          this.release();
        }
      }
    }
  }
  lock() {
    const { root, list, options } = this;
    root.classList.add(options.fixedClass);
    this.isFixed = true;
  }
  release() {
    const { root, list, options } = this;
    root.classList.remove(options.fixedClass);
    this.isFixed = false;
  }
  destroy() {
    super.destroy();
  }
}

// =============================================================================
// MD PICK
// =============================================================================
const mdPickProductSwiper = new Swiper('.swiper-container--md-pick', {
  init: false,
  loop: true,
  slidesOffsetBefore: 175,
  slidesOffsetAfter: 175,
  spaceBetween: 30,
  slidesPerView: 'auto',
  centeredSlides: true,
  breakpoints: {
    1023: {
      slidesOffsetBefore: 10,
      slidesOffsetAfter: 10,
      spaceBetween: 20
    }
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  pagination: {
    el: '.swiper-pagination',
    type: 'progressbar'
  },
  observer: true,
  observeParents: true
});

// =============================================================================
// KEY ITEM
// =============================================================================
const keyItemProductSwiper = new Swiper('.swiper-container--key-item', {
  init: false,
  loop: true,
  slidesOffsetBefore: 115,
  slidesOffsetAfter: 30,
  spaceBetween: 30,
  slidesPerView: 'auto',
  breakpoints: {
    1023: {
      slidesOffsetBefore: 10,
      slidesOffsetAfter: 10,
      spaceBetween: 20
    },
    1440: {
      slidesOffsetBefore: 60,
      slidesOffsetAfter: 30,
      spaceBetween: 30
    }
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  observer: true,
  observeParents: true
});

// =============================================================================
// 비디오 갤러리
// =============================================================================
class VideoGallery {
  constructor(params = {}) {
    const options = {
      rootSelector: '.section--video-gallery',
      swiperRootSelector: '.swiper-container--video-gallery',
      videoRootSelector: '.video-container',
      couterSelector: '.swiper-pagination--count',
      autoPlay: true,
      ...params
    };
    const root = document.querySelector(options.rootSelector);
    const counter = root.querySelector(options.couterSelector);
    const swiper = new Swiper(options.swiperRootSelector, {
      loop: true,
      init: false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'progressbar'
      }
    });
    this.root = root;
    this.swiper = swiper;
    this.counter = counter;
    this.videos = [];

    swiper
      .on('init', () => {
        swiper.slides.each((index, slide) => {
          const videoRoot = slide.querySelector(options.videoRootSelector);
          let videoController;

          if (videoRoot) {
            const { width, height } = videoRoot.getBoundingClientRect();
            videoController = new VideoController({
              root: videoRoot,
              ratio: height / width
            });
          }
          const slideInfo = {
            index,
            realIndex: parseInt(slide.dataset.swiperSlideIndex),
            cloned: slide.classList.contains('swiper-slide-duplicate'),
            controller: videoController
          };
          this.videos.push(slideInfo);
        });
        this.updateCounter();
      })
      .on('slideChange', () => {
        if (options.autoPlay) {
          this.autoPlay();
        }
        this.updateCounter();
      });
    swiper.init();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.autoPlay();
          } else {
            this.autoPause();
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(root);
  }
  autoPlay() {
    const { swiper, videos } = this;
    const { activeIndex } = swiper;
    videos.forEach((videoInfo) => {
      if (videoInfo.index === activeIndex) {
        videoInfo.controller.play();
      } else {
        videoInfo.controller.pause();
      }
    });
  }
  autoPause() {
    const { swiper, videos } = this;
    const { activeIndex } = swiper;
    videos.forEach((videoInfo) => {
      if (videoInfo.index === activeIndex) {
        videoInfo.controller.pause();
      }
    });
  }
  updateCounter() {
    const { swiper, counter } = this;
    const total = swiper.loopedSlides
      ? swiper.slides.length - 2
      : swiper.slides.length;
    const current = swiper.realIndex;
    counter.innerHTML = `<span class="current">${
      current + 1
    }</span><span class="total">${total}</span>`;
  }
}

// =============================================================================
// HOT ISSUE
// =============================================================================

// =============================================================================
// 기획전 (KEY ITEM 동일)
// =============================================================================
const planningProductSwiper = new Swiper('.swiper-container--planning', {
  init: false,
  loop: true,
  slidesOffsetBefore: 115,
  slidesOffsetAfter: 30,
  spaceBetween: 30,
  slidesPerView: 'auto',
  breakpoints: {
    1023: {
      slidesOffsetBefore: 10,
      slidesOffsetAfter: 10,
      spaceBetween: 20
    },
    1440: {
      slidesOffsetBefore: 60,
      slidesOffsetAfter: 30,
      spaceBetween: 30
    }
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  observer: true,
  observeParents: true
});

// =============================================================================
// Weekly Best 10
// =============================================================================

// ScrollProgressbar
class ScrollProgressbar {
  constructor(params = {}) {
    const options = {
      containerSelector: '[data-progress-container]',
      valueSelector: '[data-progress-value]',
      ...params
    };
    const { root, containerSelector, valueSelector } = options;
    this.root = root;
    this.container = root.querySelector(containerSelector);
    this.progress = root.querySelector(valueSelector);

    this.container.addEventListener('scroll', () => {
      this.onScroll();
    });
    window.addEventListener('resize', () => {
      this.update();
    });
  }
  update() {
    const { root, container } = this;
    const { width: rootWidth } = root.getBoundingClientRect();
    this.width = rootWidth;
    const innerWidth = Array.from(container.childNodes).reduce(
      (acc, current) => {
        if (current instanceof Element) {
          acc += current.clientWidth;
        }
        return acc;
      },
      0
    );
    this.scrollWidth = parseInt(innerWidth);
    this.progress.style.visibility = this.scrollWidth > this.width ? 'visible': 'hidden';
  }
  onScroll() {
    const { width, scrollWidth, progress, container } = this;
    if (!scrollWidth) {
      this.update();
      return;
    }
    const percent = (container.scrollLeft / (scrollWidth - width)) * 100;
    progress.style.width = `${Math.max(20, parseInt(percent, 10))}%`;
  }
}


const weeklyProductSwiper = new Swiper('.swiper-container--weekly-product', {
  // freeMode: true,
  init: false,
  spaceBetween: 30,
  slidesPerView: 'auto',
  centeredSlides: true,
  breakpoints: {
    1023: {
      spaceBetween: 45
    }
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  observer: true,
  observeParents: true
});

// =============================================================================
// NEW (MD PICK 과 동일)
// =============================================================================
const newProductSwiper = new Swiper('.swiper-container--new', {
  init: false,
  loop: true,
  slidesOffsetBefore: 175,
  slidesOffsetAfter: 175,
  spaceBetween: 30,
  slidesPerView: 'auto',
  centeredSlides: true,
  breakpoints: {
    1023: {
      slidesOffsetBefore: 10,
      slidesOffsetAfter: 10,
      spaceBetween: 20
    }
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  pagination: {
    el: '.swiper-pagination',
    type: 'progressbar'
  },
  observer: true,
  observeParents: true
});

// =============================================================================
// 쿠폰/이벤트/뉴스/행사 배너
// =============================================================================
const etcBannerSwiper = new Swiper('.swiper-container--banner', {
  init: false,
  loop: true,
  spaceBetween: 30,
  slidesPerView: 'auto',
  centeredSlides: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  observer: true,
  observeParents: true
});


const defaults = {};
class Home extends UIModule {
  constructor(params = {}) {
    super({ ...defaults, ...params });

    const defaultSwiperEvent = {
      resizeUpdate: true,
      mode: 'both'
    };
    this.carousels = [
      {
        ...defaultSwiperEvent,
        swiper: mdPickProductSwiper
      },
      {
        ...defaultSwiperEvent,
        swiper: mdPickProductSwiper
      },
      {
        ...defaultSwiperEvent,
        swiper: keyItemProductSwiper
      },
      {
        ...defaultSwiperEvent,
        swiper: planningProductSwiper
      },
      {
        ...defaultSwiperEvent,
        swiper: weeklyProductSwiper
      },
      {
        ...defaultSwiperEvent,
        swiper: newProductSwiper
      },
      {
        ...defaultSwiperEvent,
        swiper: etcBannerSwiper,
        mode: 'desktop'
      }
    ];

    this.listen('load', () => {
      this.carousels.forEach((carousel) => {
        if (Array.isArray(carousel.swiper)) {
          carousel.swiper.forEach((swiper) => {
            swiper.init();
          });
        } else {
          carousel.swiper.init();
        }
      });

      // 카테고리
      this.categoryBar = new CategoryBar();

      // 비디오 갤러리
      this.videoGallery = new VideoGallery();

      // Weekly Best 10 Scrollbar
      const scrollProgressElements = document.querySelectorAll('[data-progress]');
      scrollProgressElements.forEach((root) => {
        new ScrollProgressbar({
          root
        });
      });

    });
    this.listen('resizeEnd', () => {
      this.onResizeEnd();
    });
    this.listen('viewTypeChanged', ({ value }) => {
      this.onViewTypeChange(value);
    });
    this.report('viewType').then(({ viewType }) => {
      this.onViewTypeChange(viewType);
    });
  }
  onResizeEnd() {
    const { carousels } = this;
    carousels.forEach((carousel) => {
      if (carousel.resizeUpdate) {
        if (Array.isArray(carousel.swiper)) {
          carousel.swiper.forEach((swiper) => {
            swiper.update();
          });
        } else {
          carousel.swiper.update();
        }
      }
    });
  }
  onViewTypeChange(viewType) {
    const { carousels } = this;

    carousels.forEach((carousel) => {
      if (carousel.mode !== 'both') {
        if (carousel.mode === viewType) {
          if (Array.isArray(carousel.swiper)) {
            carousel.swiper.forEach((swiper) => {
              swiper.attachEvents();
            });
          } else {
            carousel.swiper.attachEvents();
          }
        } else {
          if (Array.isArray(carousel.swiper)) {
            carousel.swiper.forEach((swiper) => {
              swiper.detachEvents();
            });
          } else {
            carousel.swiper.detachEvents();
          }
        }
      }
    });
  }
}

const home = new Home();
window.home = home;
