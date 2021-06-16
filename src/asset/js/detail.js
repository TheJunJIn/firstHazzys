import rangesliderJs from 'rangeslider-js'
import ShoutAndListen from './_util/shout-and-listen';

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
  },
  productImage: {
    isFixed: false
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

});
listen('resize', () => {
  productDetailSticky.updateTop();
  productDetailSticky.showIfNeeded();
});

listen('scroll', ({ scrollY }) => {
  productDetailSticky.showIfNeeded(scrollY);
});

listen('viewTypeChanged', ({ value }) => {
  onViewTypeChange(value);
});

report('viewType').then(({ viewType }) => {
  onViewTypeChange(viewType);
});

report('header').then((state) => {
  states.header = Object.assign({}, state);
});


let scrollDirection = 'down';
let scrollY = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
window.addEventListener('scroll', () => {
    const newScrollY = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
    const oldScrollY = scrollY;
    if (newScrollY > scrollY) {
      scrollDirection = 'down';
    } else {
      scrollDirection = 'up';
    }
    scrollY = newScrollY <= 0 ? 0 : newScrollY;
    onDynamicScroll(oldScrollY, scrollY);
    scrollY = newScrollY;
  },
  false,
);


let fixedTop = 0;
const main = document.querySelector('.shell-main');
const container = document.querySelector('.product-detail');
const imageBlock = document.querySelector('.product-detail__image');
function onDynamicScroll(oldScrollY, scrollY){
  const { height: containerHeight } = container.getBoundingClientRect();
  const { height: imageBlockHeight } = imageBlock.getBoundingClientRect();
  let smallerThanWindow = 0;

  if(scrollY < 1){
    return false;
  }

  // 스크롤이 헤더의 높이값보다 크거나 같을경우 고정
  if (scrollY >= states.header.height) {
    main.classList.add('is-fixed');
  } else {
    main.classList.remove('is-fixed');
    imageBlock.style.top = '';
  }

  smallerThanWindow = imageBlockHeight - $(window).height();
  if(scrollDirection === 'down') {
    fixedTop = Math.min(fixedTop + scrollY - oldScrollY, Math.max(smallerThanWindow, 0));
  } else {
    fixedTop = Math.max(fixedTop + scrollY - oldScrollY, 0);
  }
  imageBlock.style.top = `${-(fixedTop)}px`;
  const breakPoint = containerHeight + states.header.height - imageBlockHeight + fixedTop;
  if(scrollY > breakPoint){
    imageBlock.style.top = `${-(scrollY - breakPoint + fixedTop)}px`;
  }
}
