import UIModule from '../ui-module';
const anime = window.anime;

const defaults = {
  root: '#category',
  containerSelector: '.category-inner',
  mainCategorySelector: '.category__main',
  categoryItemsSelector: '.category-list__item',
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
    const mainMenuItems = mainMenuRoot.querySelectorAll(options.categoryItemsSelector);
    const mainMenuButtons = mainMenuRoot.querySelectorAll('.anchor.menu');
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
    this.activeSubMenu;

    this.indicator = mainMenuRoot.querySelector(options.indicatorSelector);
    this.viewType = null;
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
        if (this.viewType === 'mobile') {
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
        if (this.viewType === 'mobile') {
          const { currentTarget: button } = e;
          const category = button.closest('.category-depth');
          this.out(category);
        }
      });
    });

    this.report('viewType').then(({ viewType }) => {
      this.viewType = viewType;
    });

    this.listen('viewTypeChanged', async ({ value, oldValue }) => {
      this.viewType = value;
      this.reset(oldValue);
    });


    const menuDelayOpen = (e) => {
      if(this.viewType === 'desktop') {
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
      if(this.viewType === 'desktop') {
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

    // Indicator
    const mainMenuCategory = mainMenuRoot.querySelector('.category-list')
    mainMenuCategory.addEventListener('mouseenter', (e) => {
      this.indicator.classList.remove('is-hidden');
    })
    root.addEventListener('mouseleave', (e) => {
      this.indicator.classList.add('is-hidden');
    })
    mainMenuItems.forEach((menu) => {
      menu.addEventListener('mouseenter', (e) => {
        if (this.viewType === 'desktop') {
          const { currentTarget: button } = e;
          this.activeIndicator(button);
        }
      });
    });
    mainMenuButtons.forEach((menu) => {
      menu.addEventListener('mouseenter', async (e) => {
        if (this.viewType === 'desktop') {
          const { currentTarget: button } = e;
          const element = subMenuRoot.querySelector(button.dataset.category);
          await this.select(element);
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

    const list = element.closest('.category-list');
    if(list){
      const listContainer = list.closest('.category-depth');
      const siblings = Array.prototype.filter.call(listContainer.querySelectorAll('.category-list'), (element) => {
        return element.parentNode === listContainer;
      });
      siblings.forEach((sibling)=> {
        if(sibling === list) {
          sibling.classList.remove('is-hidden');
        } else {
          sibling.classList.add('is-hidden');
        }
      })
    }

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

    if(!isMainCategory) {
      const siblings = Array.prototype.filter.call(panel.querySelectorAll('.category-list'), (element) => {
        return element.parentNode === panel;
      });
      siblings.forEach((sibling)=> {
        sibling.classList.remove('is-hidden');
      })
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

  // PC 카테고리 선택
  async select(element) {
    const { subMenuItems, states, options } = this;

    // 하위 메뉴 변경
    subMenuItems.forEach((menu) => {
      if (menu === element) {
        menu.classList.add(options.activeClass);
        this.activeSubMenu = menu;
        const { height } = menu.getBoundingClientRect();

        this.states.desktop.height = height + 100;

        if(states.desktop.opened){
          this.subMenuRoot.style.height = `${height + 100}px`;

          // 빠른변경으로 인해 일시적으로 높이 값이 다를 경우 체크
          window.clearTimeout(this.states.desktop.selectTimer);
          this.states.desktop.selectTimer = window.setTimeout(()=> {
            const { height } = this.subMenuRoot.getBoundingClientRect();
            if(height !== this.states.desktop.height) {
              this.subMenuRoot.style.height = `${this.states.desktop.height}px`;
            }
          }, 100);
        }
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
    await anime({
      targets: subMenuRoot,
      height: 0,
      easing: 'easeOutCubic',
      duration: 400
    }).finished;
    this.activeSubMenu = null;
    if(!this.states.desktop.opened) {
      subMenuRoot.style.visibility = 'hidden';
    }
  }

  // PC 인디케이터
  activeIndicator(button){
    const { indicator, options } = this;

    // 인디케이터
    const { width: indicatorWidth, left: indicatorLeft } = getDemensions(
      button
    );
    if(button.classList.contains('category-list__item--hilite')){
      indicator.classList.add('hilite');
    } else {
      indicator.classList.remove('hilite');
    }

    indicator.style.width = `${indicatorWidth - 20}px`;
    indicator.style.left = `${indicatorLeft + 10}px`;

  }

  async reset(viewType){
    const { subMenuRoot, states } = this;
    const { mobile } = states;
    if(viewType === 'mobile') {
      if(mobile.opened.length){
        for (const item of mobile.opened) {
          await this.out(item);
        }
      }
    } else {
      await this.close();
      subMenuRoot.style.height = '';
      subMenuRoot.style.visibility = '';
    }
  }

  destroy() {
    super.destroy();
  }
}
