import triggerEvent from '../../asset/js/_util/trigger-event';

const defaults = {
  rootSelector: '[data-form-text]',
  inputSelector: '.form-text',
  passwordToggleSelector: '[data-form-text-toggle]',
  passwordShowClass: 'visible',
  qtyButtonSelector: '[data-form-qty]',
  qtyButtonMethod: 'formQty'
};

export default class FormController {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.options = options;

    document.addEventListener('click', (e) => {
      const { target } = e;

      const passwordToggleButton = target.closest(
        options.passwordToggleSelector
      );
      const qtyButton = target.closest(options.qtyButtonSelector);

      // 비밀번호 보이기/숨기기
      if (passwordToggleButton) {
        e.preventDefault();
        const root = passwordToggleButton.closest(options.rootSelector);
        const input = root.querySelector(options.inputSelector);
        if (root.classList.contains(options.passwordShowClass)) {
          root.classList.remove(options.passwordShowClass);
          passwordToggleButton.innerText = '비밀번호 보이기';
          input.setAttribute('type', 'password');
        } else {
          root.classList.add(options.passwordShowClass);
          passwordToggleButton.innerText = '비밀번호 숨기기';
          input.setAttribute('type', 'text');
        }
      } else if (qtyButton) {
        e.preventDefault();
        const root = qtyButton.closest(options.rootSelector);
        const input = root.querySelector(options.inputSelector);
        const method = qtyButton.dataset[options.qtyButtonMethod];
        let newValue;

        if (method === 'decrease') {
          newValue = parseInt(input.value, 10) - 1;
        } else if (method === 'increase') {
          newValue = parseInt(input.value, 10) + 1;
        }

        const min = input.getAttribute('min') || 1;
        const max = input.getAttribute('max') || 9999;

        if( min > newValue || max < newValue ) {
          triggerEvent('error', {
            target: root,
            detail: {
              value: parseInt(input.value, 10),
              min,
              max,
              newValue
            },
          });
          return false;
        }
        newValue = Math.max(newValue, 0);
        input.value = newValue;
      }
    });
  }
}
