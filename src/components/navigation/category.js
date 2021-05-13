import anime from 'animejs/lib/anime.es.js';
import UIModule from '../ui-module';

const defaults = {
  root: '#category',
  containerSelector: '.category-inner',
  mainCategorySelector: '.category__main',
  subCategorySelector: '.category__sub',
  subCategoryItemsClass: 'category-depth--2',
  indicatorSelector: '.category__indicator',
  activeClass: 'active',
  delay: [100, 200]
};

function getDemensions(element) {
  const style = window.getComputedStyle
    ? getComputedStyle(element, null)
    : el.currentStyle;
  const width = element.clientWidth;

  const paddingLeft = parseInt(style.paddingLeft) || 0;
  const paddingRight = parseInt(style.paddingRight) || 0;

  return {
    width: width - paddingLeft - paddingRight,
    left: element.offsetLeft + paddingLeft
  };
}

export default class Category extends UIModule {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    super(options);

    const { root } = this;

    if (!root) {
      this.destroy();
      return;
    }

    const mainMenuRoot = root.querySelector(options.mainCategorySelector);
    const mainMenuButons = mainMenuRoot.querySelectorAll('.anchor.menu');
    const menuButtons = root.querySelectorAll('.anchor.menu');
    const backButtons = root.querySelectorAll('.category-depth__back');
    const subMenuRoot = root.querySelector(options.subCategorySelector);
    const subMenuItems = subMenuRoot.querySelectorAll(
      `.${options.subCategoryItemsClass}`
    );
    this.container = root && root.querySelector(options.containerSelector);
    this.mainMenuRoot = mainMenuRoot;
    this.subMenuRoot = subMenuRoot;
    this.subMenuItems = subMenuItems;

    this.indicator = mainMenuRoot.querySelector(options.indicatorSelector);
    this.mode = null;
    this.states = {
      mobile: {
        opened: []
      },
      desktop: {
        focused: false,
        height: 288,
        opened: false,
        activeMenu: null,
        timer: null
      }
    };

    menuButtons.forEach((menuButton) => {
      menuButton.addEventListener('click', (e) => {
        const { currentTarget: button } = e;
        if (this.mode === 'mobile') {
          // 1depth -> 2depth
          if (button.closest(options.mainCategorySelector)) {
            const element =
              button.dataset.category &&
              root.querySelector(button.dataset.category);
            if (element) {
              e.preventDefault();
              this.in(element);
            } else {
              console.log(
                `${button.dataset.category} 메뉴를 찾을 수 없습니다.`
              );
            }
            return;
          } else {
            // 2depth -> 3depth -> 4depth ...
            const nextDepthElement = button.nextElementSibling;
            if (
              nextDepthElement &&
              nextDepthElement.classList.contains('category-depth')
            ) {
              e.preventDefault();
              this.in(nextDepthElement);
            } else {
              console.log(
                `${button.textContent} 하위 메뉴를 찾을 수 없습니다.`
              );
            }
            return;
          }
        }
      });
    });

    backButtons.forEach((backButton) => {
      backButton.addEventListener('click', (e) => {
        if (this.mode === 'mobile') {
          const { currentTarget: button } = e;
          const category = button.closest('.category-depth');
          this.out(category);
        }
      });
    });

    this.report('viewType').then(({ viewType }) => {
      this.mode = viewType;
    });

    this.listen('viewTypeChanged', async ({ value, oldValue }) => {
      this.mode = value;
      this.reset(oldValue);
    });


    const menuDelayOpen = (e) => {
      if(this.mode === 'desktop') {
        const { desktop } = this.states;
        desktop.focused = true;
        window.clearTimeout(desktop.timer);
        desktop.timer = null;
        desktop.timer = window.setTimeout(() => {
          const { desktop } = this.states;
          if(desktop.focused && !desktop.opened) {
            this.open();
          }
        }, options.delay[0]);
      }
    }
    const menuDelayClose = (e) => {
      if(this.mode === 'desktop') {
        const { desktop } = this.states;
        desktop.focused = false;
        window.clearTimeout(desktop.timer);
        desktop.timer = null;
        desktop.timer = window.setTimeout(() => {
          const { desktop } = this.states;
          if(!desktop.focused && desktop.opened) {
            this.close();
          }
        }, options.delay[1]);
      }
    }

    mainMenuButons.forEach((menu) => {
      menu.addEventListener('mouseenter', (e) => {
        if (this.mode === 'desktop') {
          const { currentTarget: button } = e;
          const element = subMenuRoot.querySelector(button.dataset.category);
          this.select(element, button);
        }
      });
      menu.addEventListener('mouseenter', menuDelayOpen, false);
      menu.addEventListener('mouseleave', menuDelayClose, false);
    });
    subMenuRoot.addEventListener('mouseenter', menuDelayOpen, false)
    subMenuRoot.addEventListener('mouseleave', menuDelayClose, false)
  }
  states(){
    return this.states;
  }

  // 모바일 선택한 카테고리로 이동
  in(element) {
    const { mobile } = this.states;
    const isMainCategory = !element?.previousElementSibling?.classList?.contains(
      'menu'
    );
    let panel = element?.previousElementSibling?.closest('.category-depth');
    if (isMainCategory) {
      panel = this.container;
    }
    element.style.display = 'block';
    anime({
      targets: panel,
      translateX: [
        { value: 0, easing: 'linear', duration: 10 },
        { value: '-100%', easing: 'easeOutCubic', duration: 300 }
      ]
    });
    mobile.opened.push(element);
  }

  // 모바일 이전 카테고리로 이동
  async out(element) {
    const { options, states } = this;
    const { mobile } = states;
    element = element || mobile.opened[mobile.opened.length-1];
    const isMainCategory = element?.classList.contains(
      options.subCategoryItemsClass
    );
    let panel = element?.previousElementSibling?.closest('.category-depth');

    if (isMainCategory) {
      panel = this.container;
    }

    await anime({
      targets: panel,
      translateX: [
        { value: '-100%', easing: 'linear', duration: 10 },
        { value: 0, easing: 'easeOutCubic', duration: 200 }
      ]
    }).finished;
    element.style.display = '';
    element.style.transform = '';
    if(mobile.opened.length && mobile.opened[mobile.opened.length-1] === element) {
      mobile.opened.pop();
    }
  }

  async select(element, button) {
    const { subMenuItems, indicator, options } = this;

    // 인디케이터
    const { width: indicatorWidth, left: indicatorLeft } = getDemensions(
      button
    );
    indicator.style.width = `${indicatorWidth + 10}px`;
    indicator.style.left = `${indicatorLeft - 5}px`;

    // 하위 메뉴 변경
    subMenuItems.forEach((menu) => {
      if (menu === element) {
        menu.classList.add(options.activeClass);
      } else {
        menu.classList.remove(options.activeClass);
      }
    });
  }

  // PC 네비게이션 열림
  async open() {
    const { subMenuRoot, states } = this;
    const { desktop } = states;
    desktop.opened = true;
    subMenuRoot.style.visibility = 'visible';
    this.indicator.classList.remove('is-hidden');

    await anime({
      targets: subMenuRoot,
      height: desktop.height,
      easing: 'easeOutCubic',
      duration: 400,
    }).finished;
    subMenuRoot.style.visibility = 'visible';
  }

  // PC 네비게이션 닫기
  async close() {
    const { subMenuRoot, states } = this;
    const { desktop } = states;
    desktop.opened = false;
    this.indicator.classList.add('is-hidden');
    await anime({
      targets: subMenuRoot,
      height: 0,
      easing: 'easeOutCubic',
      duration: 400
    }).finished;
    if(!this.states.desktop.opened) {
      subMenuRoot.style.visibility = 'hidden';
    }
  }

  async reset(mode){
    const { subMenuRoot, states } = this;
    const { mobile } = states;
    if(mode === 'mobile') {
      if(mobile.opened.length){
        for (const item of mobile.opened) {
          await this.out(item);
        }
      }
    } else if (mode === 'desktop') {
      await this.close();
      subMenuRoot.style.height = '';
      subMenuRoot.style.visibility = '';
    }
  }

  destroy() {
    super.destroy();
  }
}
