import rangesliderJs from 'rangeslider-js';
import ShoutAndListen from './_util/shout-and-listen';
import ZoomCursor from '../../components/zoom-cursor';

window.rangesliderJs = rangesliderJs;
const sal = new ShoutAndListen('detail');
const shout = sal.shout.bind(sal);
const listen = sal.listen.bind(sal);
const report = sal.report.bind(sal);

const { $ } = window;

$(function () {
  $(document)
    // 리뷰상세보기 팝업 > 텍스트 더보기 버튼
    .on('click', '.review-content.is-limit .button-more', function () {
      $(this).closest('.is-limit').removeClass('is-limit');
    });
});

const states = {
  viewType: null,
  header: {
    isHidden: false,
    height: 60,
    options: {}
  }
};

// 플로팅 상품 정보
const productDetailSticky = {
  __cache: {},
  top: 0,
  get element() {
    if (this.__cache.element) {
      return this.__cache.element;
    }

    this.__cache.element = document.querySelector('.product-detail-sticky');
    return this.__cache.element;
  },
  get isEnabled() {
    return states.viewType === 'mobile';
  },
  get isActive() {
    if (!this.element) {
      return false;
    }
    return this.element.classList.contains('is-active');
  },
  set isActive(flag) {
    if (this.element) {
      if (flag) {
        this.element.classList.add('is-active');
      } else {
        this.element.classList.remove('is-active');
      }
    }
  },
  updateTop() {
    if (this.isEnabled && this.element) {
      this.top = $(this.element).offset().top;
    } else {
      this.top = 0;
    }
  },
  showIfNeeded(scrollY = window.scrollY) {
    this.isActive = this.isEnabled && scrollY > this.top;
  }
};

// 이미지영역 고정 정보
const productDetailImageSticky = {
  __cache: {},
  top: 0,
  height: 0,
  containerHeight: 0,
  get container() {
    if (this.__cache.container) {
      return this.__cache.container;
    }
    this.__cache.container = document.querySelector('.product-detail');
    return this.__cache.container;
  },
  get element() {
    if (this.__cache.element) {
      return this.__cache.element;
    }

    this.__cache.element = document.querySelector('.product-detail__image');
    return this.__cache.element;
  },
  get isEnabled() {
    return states.viewType === 'desktop';
  },
  updateHeight() {
    if (this.isEnabled && this.element && this.container) {
      this.height = this.element.getBoundingClientRect().height;
      this.containerHeight = this.container.getBoundingClientRect().height;
    }
  },
  changeStyleTop(scrollY = window.scrollY) {
    if (this.isEnabled && this.element && this.container) {
      let breakPoint = this.containerHeight - this.height + states.header.height;
      if(states.header.isHidden) {
        breakPoint += states.header.height
      }
      if (scrollY > breakPoint) {
        console.log('scrollY > breakPoint')
        this.element.style.top = `${-(scrollY - breakPoint)}px`;
      } else {
        this.element.style.top = '';
      }
    }
    if(!this.isEnabled && this.element){
      this.top = 0;
      this.element.style.top = '';
    }
  },
}


// 대표이미지 확대보기 마우스 커서 
const imageBlock = document.querySelector('.product-detail__image');
const zoomCursor = new ZoomCursor({
  root: imageBlock
});

function setTopButtonOffset() {
  if (states.viewType === 'mobile') {
    const totalAmount = document.querySelector('.total-amount');
    if (totalAmount) {
      const { height } = totalAmount.getBoundingClientRect();
      shout('topButton', ['setBottomOffset', height]);
    }
  } else {
    shout('topButton', ['setBottomOffset', 0]);
  }
}

function onViewTypeChange(viewType) {
  if (typeof viewType !== 'string') {
    return;
  }

  let hideOnScrollAfter;

  states.viewType = viewType;
  productDetailSticky.updateTop();
  productDetailSticky.showIfNeeded();
  hideOnScrollAfter = productDetailSticky.top || states.header.height;

  // zoomCursor
  if(viewType === 'desktop') {
    zoomCursor.enable();
  } else {
    zoomCursor.disable();
  }

  if (typeof hideOnScrollAfter === 'number') {
    shout('header', [
      'setOption',
      'hideOnScrollAfter',
      hideOnScrollAfter + (states.header.height || 0)
    ]);
  }

  setTopButtonOffset();
}


listen('load', () => {
  productDetailSticky.updateTop();
  productDetailSticky.showIfNeeded();
  productDetailImageSticky.updateHeight();
  productDetailImageSticky.changeStyleTop();
});
listen('resize', () => {
  productDetailSticky.updateTop();
  productDetailSticky.showIfNeeded();
  productDetailImageSticky.updateHeight();
  productDetailImageSticky.changeStyleTop();
});

listen('scroll', ({ scrollY }) => {
  productDetailSticky.showIfNeeded(scrollY);
  productDetailImageSticky.changeStyleTop(scrollY);
});

listen('viewTypeChanged', ({ value }) => {
  onViewTypeChange(value);
});

listen('headerIsHidden', (value) => {
  states.header.isHidden = value;
});

report('viewType').then(({ viewType }) => {
  onViewTypeChange(viewType);
});

report('header').then((state) => {
  states.header = Object.assign({}, state);
});