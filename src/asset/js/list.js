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
