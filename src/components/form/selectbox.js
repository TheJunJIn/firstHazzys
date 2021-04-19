// import $ from 'jquery';
// import dropdown from '../dropdown';

const $ = window.jQuery;

/**
 * Selectbox UI
 *
 * @module components/form/selectbox
 */
const defaults = {
  rootClass: 'form-selectbox',
  handlerClass: 'form-select-selected',
  listClass: 'form-selectbox-list',
  itemClass: 'form-selectbox-item',
  selectboxClass: 'select',
  selectedClass: 'is-selected',
  dropdownIsOpenClass: 'is_dropdown-open'
};

export default class Selectbox {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.options = options;

    $(document)
    // 드롭다운 노출 제어
    .on('click', `.${options.rootClass}`, e => {
      const root = $(e.target).closest(`.${options.rootClass}`)[0];
      const selectbox = $(root).find(`.${options.selectboxClass}`)[0];
      if (!selectbox.disabled) {
        this.toggle(selectbox);
      }
    })
    .on('focusin click', `.${options.rootClass} .${options.selectboxClass}`, e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      $('[data-modal-open]').eq(0).click();
      // $(this).blur();
      window.setTimeout(()=> {
        $('#modal').find('[data-modal-close]').focus();
      }, 10)
      console.log($(this));

      // const { target } = e;
      // if (
      //   !$(target).hasClass(options.rootClass) &&
      //   !$(target).closest(`.${options.rootClass}`).length
      // ) {
      //   this.closeAll();
      // } else {
      //   $(this).blur();
      // }
    })
    // .on('click', `.${options.itemClass}`, e => {
    //   e.preventDefault();
    //   const root = $(e.target).closest(`.${options.rootClass}`)[0];
    //   const selectbox = $(root).find(`.${options.selectboxClass}`)[0];
    //   let $li;
    //   if ($(e.target).hasClass(options.itemClass)) {
    //     $li = $(e.target);
    //   } else {
    //     $li = $(e.target).closest(`.${options.itemClass}`);
    //   }

    //   if (!$li.hasClass('dap_is-disabled')) {
    //     this.select(selectbox, $li.index(), true);
    //   }
    // })
    .on('change', `.${options.rootClass} > .${options.selectboxClass}`, e => {
      // const root = $(e.target).closest(`.${options.rootClass}`)[0];
      // const selectbox = $(root).find(`.${options.selectboxClass}`)[0];
      // this.select(selectbox, selectbox.selectedIndex);
    })
    // .on('blur', `.${options.rootClass} > .${options.selectboxClass}`, e => {
    //   const root = $(e.target).closest(`.${options.rootClass}`)[0];
    //   const selectbox = $(root).find(`.${options.selectboxClass}`)[0];
    //   this.close(selectbox);
    // })
    // .on('focusin click', e => {
    //   const { target } = e;
    //   if (
    //     !$(target).hasClass(options.rootClass) &&
    //     !$(target).closest(`.${options.rootClass}`).length
    //   ) {
    //     this.closeAll();
    //   } else {
    //     $(this).blur();
    //   }
    // })
    // .on('keydown', e => {
    //   const { keyCode, target } = e;
    //   const root = $(e.target).closest(`.${options.rootClass}`)[0];
    //   const selectbox = $(root).find(`.${options.selectboxClass}`)[0];

    //   if (keyCode === 27) {
    //     this.closeAll();
    //   } else if (
    //     keyCode === 13 &&
    //     $(target).hasClass(options.selectboxClass) &&
    //     !selectbox.disabled
    //   ) {
    //     this.toggle(target);
    //   }
    // });
  }
  open(element) {
    const { options } = this;
    const root = $(element).closest(`.${options.rootClass}`)[0];
    const $list = $(root).find(`.${options.listClass}`);
    // if (!$list.length) {
    //   const $selectbox = $(root).find(`.${options.selectboxClass}`);
    //   const $ul = $('<ul>')
    //     .addClass(options.listClass)
    //     .addClass('dap_dropdown');
  
    //   if (root.lastChild.nodeName === 'UL') {
    //     $(root.lastChild).remove();
    //   }
    //   $selectbox.find('option').each((index, element) => {
    //     let item = makeListItem(this, element, $(element).prop('selected'));
    //     $ul.append(item);
    //   });
    //   $(root)
    //     .addClass('dap_has_dropdown')
    //     .append($ul);
    // }
    // this.closeAll();
    // dropdown.open(element);
    console.log('dropdown.open');
  }
  close(element) {
    if (element) {
      // dropdown.close(element);
      console.log('dropdown.close');
    } else {
      this.closeAll();
    }
  }
  closeAll(){
    const { options } = this;
    console.log('closeAll');
    $(`.${options.rootClass}.${options.dropdownIsOpenClass}`).each(
      (i, element) => {
        console.log('dropdown.close', i)
        // dropdown.close($(element).find(`.${options.selectboxClass}`)[0]);
      }
    );
  }
  toggle(element){
    const { options } = this;
    const root = $(element).closest(`.${options.rootClass}`)[0];
    if ($(root).hasClass(options.dropdownIsOpenClass)) {
      this.close(element);
    } else {
      this.open(element);
    }
  }
}

function makeListItem(instance, item, selected) {
  const { options } = instance;
  const $li = $(
    `<li><span class="dap_form-selectbox-name">${item.text}</span></li>`
  );

  $li.addClass(options.itemClass);

  if (selected) {
    $li.addClass(options.selectedClass);
  }

  if ($(item).prop('disabled')) {
    $li.addClass('dap_is-disabled');
  }
  if ($(item).data('placeholder')) {
    $li.addClass('dap_is-hidden');
  }
  return $li;
}

export function update(element) {
  const { options } = this;
  const $root = element
    ? $(element).closest(`.${options.rootClass}`)
    : $(`.${options.rootClass}`);

  $root.each((index, root) => {
    const selectbox = $(root).find(`.${options.selectboxClass}`)[0];
    const selectedIndex = selectbox.selectedIndex;
    const selectedItem = $(selectbox).find(`option:eq(${selectedIndex})`)[0];
    const selectedText = $(selectedItem).text();
    const firstOption = $(selectbox).find('option:eq(0)')[0];
    const id = $(selectbox)[0].id;
    const isDisabled = $(selectbox)[0].disabled;
    const disabledStyle = isDisabled
      ? 'background-color: #f6f7fa; color: #9ca6bd'
      : '';
    const spanId = id !== null ? `id="${id}_span"` : '';
    let hasPlaceholder, $handlerElement;

    $handlerElement = $(
      `<span ${spanId} style="white-space: nowrap; overflow: hidden; ${disabledStyle}" class="${
        options.handlerClass
      }">${selectedText}</span>`
    );

    if (
      $(firstOption).attr('value') === '' ||
      $(firstOption).attr('value') === undefined
    ) {
      hasPlaceholder = true;
      $(firstOption)
        .prop('disabled', true)
        .data('placeholder', true);
    }

    if ((selectedIndex < 1 && !hasPlaceholder) || selectedIndex > 0) {
      $handlerElement.addClass(`${options.selectedClass}`);
    }

    $(root)
      .find(`.${options.listClass}`)
      .remove();
    $(root)
      .find(`.${options.handlerClass}`)
      .remove();

    $(root).append($handlerElement);
  });
}

export function open(element) {
  const { options } = this;
  const root = $(element).closest(`.${options.rootClass}`)[0];
  const $list = $(root).find(`.${options.listClass}`);
  if (!$list.length) {
    const $selectbox = $(root).find(`.${options.selectboxClass}`);
    const $ul = $('<ul>')
      .addClass(options.listClass)
      .addClass('dap_dropdown');

    if (root.lastChild.nodeName === 'UL') {
      $(root.lastChild).remove();
    }
    $selectbox.find('option').each((index, element) => {
      let item = makeListItem(this, element, $(element).prop('selected'));
      $ul.append(item);
    });
    $(root)
      .addClass('dap_has_dropdown')
      .append($ul);
  }
  this.closeAll();
  // dropdown.open(element);
}

export function close(element) {
  if (element) {
    // dropdown.close(element);
  } else {
    this.closeAll();
  }
}

export function closeAll() {
  const { options } = this;
  $(`.${options.rootClass}.${options.dropdownIsOpenClass}`).each(
    (i, element) => {
      // dropdown.close($(element).find(`.${options.selectboxClass}`)[0]);
    }
  );
}

export function toggle(element) {
  const { options } = this;
  const root = $(element).closest(`.${options.rootClass}`)[0];
  if ($(root).hasClass(options.dropdownIsOpenClass)) {
    this.close(element);
  } else {
    this.open(element);
  }
}

export function select(element, index, isClose) {
  const { options } = this;
  const root = $(element).closest(`.${options.rootClass}`)[0];
  const $list = $(root).find(`.${options.listClass}`);
  const $newOption = $(element).find(`option:eq(${index})`);
  const $handlerElement = $(root).find(`.${options.handlerClass}`);

  if (element.selectedIndex !== index) {
    $(element)
      .val($newOption.val())
      .change();
  }

  $handlerElement.text($newOption.text()).addClass(`${options.selectedClass}`);

  $list
    .find(`.${options.itemClass}`)
    .eq(index)
    .addClass(options.selectedClass)
    .siblings()
    .removeClass(options.selectedClass);

  if (isClose) {
    this.close(element);
  }
}

export function bind(option) {
  const options = $.extend({}, defaults, option);
  this.options = options;
  this.update();

  $(document)
    // 드롭다운 노출 제어
    .on('click', `.${options.rootClass} > .${options.handlerClass}`, e => {
      const root = $(e.target).closest(`.${options.rootClass}`)[0];
      const selectbox = $(root).find(`.${options.selectboxClass}`)[0];

      if (!selectbox.disabled) {
        this.toggle(selectbox);
      }
    })
    .on('click', `.${options.itemClass}`, e => {
      e.preventDefault();
      const root = $(e.target).closest(`.${options.rootClass}`)[0];
      const selectbox = $(root).find(`.${options.selectboxClass}`)[0];
      let $li;
      if ($(e.target).hasClass(options.itemClass)) {
        $li = $(e.target);
      } else {
        $li = $(e.target).closest(`.${options.itemClass}`);
      }

      if (!$li.hasClass('dap_is-disabled')) {
        this.select(selectbox, $li.index(), true);
      }
    })
    .on('change', `.${options.rootClass} > .${options.selectboxClass}`, e => {
      const root = $(e.target).closest(`.${options.rootClass}`)[0];
      const selectbox = $(root).find(`.${options.selectboxClass}`)[0];

      this.select(selectbox, selectbox.selectedIndex);
    })
    .on('blur', `.${options.rootClass} > .${options.selectboxClass}`, e => {
      const root = $(e.target).closest(`.${options.rootClass}`)[0];
      const selectbox = $(root).find(`.${options.selectboxClass}`)[0];
      this.close(selectbox);
    })
    .on('focusin click', e => {
      const { target } = e;
      if (
        !$(target).hasClass(options.rootClass) &&
        !$(target).closest(`.${options.rootClass}`).length
      ) {
        this.closeAll();
      }
    })
    .on('keydown', e => {
      const { keyCode, target } = e;
      const root = $(e.target).closest(`.${options.rootClass}`)[0];
      const selectbox = $(root).find(`.${options.selectboxClass}`)[0];

      if (keyCode === 27) {
        this.closeAll();
      } else if (
        keyCode === 13 &&
        $(target).hasClass(options.selectboxClass) &&
        !selectbox.disabled
      ) {
        this.toggle(target);
      }
    });
}