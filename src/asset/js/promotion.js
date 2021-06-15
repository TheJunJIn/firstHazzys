import AOS from 'aos';
import rangesliderJs from 'rangeslider-js'
import CategoryNavigation from '../../components/navigation/list-category';

window.AOS = AOS;
window.rangesliderJs = rangesliderJs;

AOS.init({ delay: 100, offset: 10 });
const $ = window.jQuery;

new CategoryNavigation();

function makeListItem(item) {
  const $root = $(
    `<span class="filter-tag" data-filter="${item.key}" data-filter-value="${item.value}" data-filter-name="${item.name}"></span>`
  );
  const $name = $(`<span class="name">${item.name}</span>`);
  const $button = $(
    '<button type="button" class="button button--remove" data-filter-remove><i class="sprite-icon sprite-common sprite-common-remove">삭제</i></button'
  );
  $root.append($button).prepend($name);
  return $root;
}

const defaults = {
  rootSelector: '.shell-sidebar--product-filter .sidebar',
  contentSelector: '.sidebar__content',
  footerSelector: '.sidebar__footer',
  listSelector: '[data-filter-list]'
};
class Filter {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    const root = document.querySelector(options.rootSelector);
    const content = root.querySelector(options.contentSelector);
    const footer = root.querySelector(options.footerSelector);
    const list = footer.querySelector(options.listSelector);
    this.root = root;
    this.content = content;
    this.footer = footer;
    this.list = list;
    this.data = [
    // { key: 'gender', value: 'F', name: '여성' }
    ];

    const tags = list.querySelectorAll('[data-filter]');
    if (tags.length) {
      tags.forEach((tag) => {
        const key = tag.dataset.filter;
        const value = tag.dataset.filterValue;
        const name = tag.dataset.filterName;
        this.add({ key, value, name }, tag);
      });
    } else {
      this.update();
    }
  }

  add(info, tag) {
    const { data, list } = this;
    const { key, value } = info;
    const exists = data.find(
      (item) => item.key === key && item.value === value
    );
    if (!exists) {
      if (!tag) {
        const item = makeListItem(info);
        list.appendChild(item[0]);
        tag = item[0];
      }
      info.element = tag;
      data.push(info);
      this.update();
    }
  }

  remove(info) {
    const { data } = this;
    const { key, value } = info;
    const matchedIndex = data.findIndex(
      (item) => item.key === key && item.value === value
    );
    if (matchedIndex > -1) {
      const newData = data.slice();
      const revmoveItem = newData[matchedIndex];
      newData.splice(matchedIndex, 1);
      this.data = newData;
      if (revmoveItem.element) {
        revmoveItem.element.remove();
      }
    }
    this.update();
  }

  reset() {
    const { list } = this;
    list.innerHTML = '';
    this.data = [];
    this.update();
  }

  update() {
    const { root, content, footer } = this;
    if (this.data.length) {
      const { height } = footer.getBoundingClientRect();
      root.classList.add('is-active');
      content.style.paddingBottom = `${height}px`;
    } else {
      root.classList.remove('is-active');
      content.style.paddingBottom = '';
    }
  }
}

window.filter = new Filter();

// 이미지 fixed
const states = {
  viewType: null,
  header: {
    isHidden: false,
    height: 60,
    options: {}
  }
};

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
const container = document.querySelector('.promotion-wrap');
const imageBlock = document.querySelector('.slide-contents');
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