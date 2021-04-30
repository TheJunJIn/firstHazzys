import triggerEvent from './trigger-event';

/**
 * @typedef {() => void} MessageCallback
 */
/**
 * @typedef {() => void} ListenerCancelFunction
 */
class ShoutAndListen {
  /**
   * 대상을 특정하지 않고 명령을 전달하기 위한 모듈입니다.
   *
   * `shout()` 메소드로 다른 컴포넌트와 공유할 메시지(정보/명령)를 외치고
   * `listen()` 메소드로 각 컴포넌테에서 관심있는 메시지에 반응합니다.
   *
   * 직접 객체를 생성하여 사용하기보다는 이를 확장하여 사용합니다.
   *
   * @param {string} [name] 컴포넌트 이름
   * @example
   * class UIModule extends ShoutAndListen {}
   */
  constructor(name) {
    /**
     * 컴포넌트 이름
     *
     * - 메시지 데이터에 컴포넌트 이름과 동일한 key가 있는 경우 반응하기 위해 사용합니다.
     * - 기본값은 컴포넌트 클래스 생성자를 camelCase로 변환하여 지정됩니다.
     * @member {string}
     */
    this.name = (name || this.constructor.name).replace(
      /^([A-Z])[a-z]/,
      (match) => match.toLowerCase()
    );

    /**
     * 메시지를 외치기 위해 사용할 대상 객체
     *
     * @member {EventTarget}
     */
    this.messageTarget = window.top.document;

    /** @type {{[key:string]: ((data)=>void)[]}} */
    const listeners = {};

    const instance = this;

    /** @type {(event: Event) => void} */
    const messageEventListener = (event) => {
      if (!event.detail) {
        return;
      }

      const data = event.detail;

      // TODO: 배포 전 삭제
      // console.group(`[${instance.name}]messageEventListener`);
      // console.groupCollapsed('event');
      // console.log(event);
      // console.groupEnd();
      // console.groupCollapsed('this');
      // console.log(this);
      // console.groupEnd();
      // console.log(data);
      // console.groupEnd();

      if (instance.name in data) {
        const value = data[instance.name];
        const method = {
          name: undefined,
          params: []
        };

        if (typeof value === 'string') {
          method.name = value;
        } else if (Array.isArray(value)) {
          const [name, ...params] = value;

          if (typeof name === 'string') {
            method.name = name;
            method.params = params;
          }
        }

        if (method.name && typeof instance[method.name] === 'function') {
          instance[method.name](...method.params);
        }
      }

      Object.entries(listeners).forEach(([key, callbacks]) => {
        if (key in data) {
          const value = data[key];

          callbacks.forEach((callback) => {
            callback(value);
          });
        }
      });
    };

    this.messageTarget.addEventListener('shout', messageEventListener);
    this.__internal__ = {
      listeners,
      messageEventListener
    };
  }

  /**
   * 메시지를 외칩니다.
   *
   * @param {(string|{[key:string]:(string|*[])})} message
   * @param {*} [detail] 상세 내용. 데이터
   * @example
   * // 단순 문자열 메시지. 값 전달이 필요 없는 경우 사용
   * module.shout("toggleHeader");
   *
   * // 값과 함께 메시지 전달
   * module.shout("scroll", window.scrollY);
   * module.shout("viewTypeChanged", {
   *   oldValue: "desktop",
   *   value: "mobile"
   * });
   *
   * // header.toggle() 호출
   * module.shout("header", "toggle");
   * module.shout({
   *   header: "toggle"
   * });
   *
   * // header.setOption("hideAt", 100) 호출
   * module.shout("header", ["setOption", "hideAt", 100]);
   * module.shout({
   *   header: ["setOption", "hideAt", 100]
   * });
   */
  shout(message, detail) {
    let data;

    if (typeof message === 'string') {
      data = {};
      data[message] = typeof detail === undefined ? null : detail;
    } else if (!detail && message) {
      data = { ...message };
    }

    if (!data) {
      return;
    }

    triggerEvent('shout', {
      target: this.messageTarget,
      detail: data
    });
  }

  /**
   * 특정 메시지가 발생하면 콜백을 호출합니다.
   *
   * @param {string} message
   * @param {MessageCallback} callback
   * @returns {ListenerCancelFunction} 더이상 듣지 않도록 리스너를 취소할 수 있는 함수를 반환
   * @example
   * module.listen("hideHeader", () => {
   *   header.hide();
   * });
   * const cancel = module.listen("viewTypeChanged", ({ oldValue, value }) => {
   *   console.log(`${oldValue} => ${value}`);
   * });
   * cancel(); // 더 이상 `viewTypeChanged` 메시지를 듣지 않습니다.
   */
  listen(message, callback) {
    if (!(message in this.__internal__.listeners)) {
      this.__internal__.listeners[message] = [];
    }

    const listeners = this.__internal__.listeners[message];

    if (typeof callback === 'function') {
      const instance = this;
      listeners.push(callback);
      return function cancel() {
        instance.cancel(message, callback);
      };
    }
  }

  /**
   * 메시지 듣기를 중단합니다.
   *
   * @param {string} message
   * @param {MessageCallback} [callback] 지정하지 않으면 `message`에 해당하는 리스너를
   * 모두 제거 합니다.
   */
  cancel(message, callback) {
    if (!(message in this.__internal__.listeners)) {
      return;
    }

    const listeners = this.__internal__.listeners[message];

    if (typeof callback === 'function') {
      const index = listeners.indexOf(callback);

      if (index > -1) {
        listeners.splice(index, 1);
      }

      if (listeners.length === 0) {
        delete this.__internal__.listeners[message];
      }
    } else {
      delete this.__internal__.listeners[message];
    }
  }

  /**
   * 보고하시오!
   *
   * - `target` 모듈에 `reportback` 메소드를 호출하고 그 결과 값을 반환하는 Promise를 반환합니다.
   * - 대상이 되는 모듈에 데이터를 반환하는 `reportback` 메소드가 정의되어 있어야 합니다.
   * @param {string} target
   * @param {number} [wait=500] 데이터 반환을 기다리는 시간(`ms`). 시간 초과 시 `reject` 됩니다.
   * @returns {Promise<*>}
   * @example
   * module.report('viewType').then(({ viewType }) => {
   *   console.log(viewType);
   * });
   */
  report(target, wait = 500) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${target}이(가) 'report'에 반응하지 않습니다.`));
      }, wait);
      const cancel = this.listen(`report:${target}`, (data) => {
        clearTimeout(timeout);
        cancel();
        resolve(data);
      });
      this.shout(target, 'reportback');
    });
  }

  /**
   * 더이상 메시지를 외치거나 듣지 않습니다.
   */
  destroy() {
    this.messageTarget.removeEventListener(
      'message',
      this.__internal__.messageEventListener
    );
    if (typeof this.messageTarget.close === 'function') {
      this.messageTarget.close();
    }
    delete this.__internal__;
  }
}

export default ShoutAndListen;
