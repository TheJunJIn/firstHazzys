const supportsBroadcastChannel = 'BroadcastChannel' in window;

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
     * 메시지를 외치기 위해 사용할 `postMessage()` 대상 객체
     *
     * - BroadcastChannel을 지원하면 이를 사용
     * - 지원하지 않으면(IE, Safari) Window를 사용
     *
     * @member {(BroadcastChannel|Window)}
     * @see https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
     */
    this.messageTarget = supportsBroadcastChannel
      ? new BroadcastChannel('ui')
      : window.top;

    /** @type {string} */
    const origin = supportsBroadcastChannel ? null : window.top.location.origin;

    /** @type {{[key:string]: ((data)=>void)[]}} */
    const listeners = {};

    const instance = this;

    /** @type {(event:MessageEvent) => void} */
    const messageEventListener = (event) => {
      if (!event.data || (origin && origin !== event.origin)) {
        return;
      }

      const { data } = event;

      // TODO: 배포 전 삭제
      // console.group('messageEventListener');
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

    this.messageTarget.addEventListener('message', messageEventListener);
    this.__internal__ = {
      supportsBroadcastChannel,
      origin,
      listeners,
      messageEventListener
    };
  }

  /**
   * 메시지를 외칩니다
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
    } else if (!detail) {
      data = { ...message };
    }

    if (!data) {
      return;
    }

    if (this.__internal__.supportsBroadcastChannel) {
      this.messageTarget.postMessage(data);
    } else {
      this.messageTarget.postMessage(data, this.__internal__.origin);
    }
  }

  /**
   * @param {string} to
   * @param {UIMessageCallback} callback
   * @example
   * module.listen("hideHeader", () => {
   *   header.hide();
   * });
   * module.listen("viewTypeChanged", ({ oldValue, value }) => {
   *   console.log(`${oldValue} => ${value}`);
   * });
   */
  listen(to, callback) {
    if (!(to in this.__internal__.listeners)) {
      this.__internal__.listeners[to] = [];
    }
    if (typeof callback === 'function') {
      this.__internal__.listeners[to].push(callback);
    }
  }

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
