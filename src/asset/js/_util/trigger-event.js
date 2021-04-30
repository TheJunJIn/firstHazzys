if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(type, params) {
    const init = {
      bubbles: false,
      cancelable: false,
      detail: null,
      ...params
    };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      type,
      init.bubbles,
      init.cancelable,
      init.detail
    );
    return evt;
  }

  window.CustomEvent = CustomEvent;
}

/**
 * 이벤트를 바로 생성해서 발생시키기 위한 헬퍼
 *
 * @param {string} type - 이벤트 타입명
 * @param {object} [options]
 * @param {EventTarget} [options.target=document] - 이벤트를 발생 시킬 대상 객체
 * @param {*} [options.detail] - 이벤트와 같이 전달할 데이터
 */
function triggerEvent(type, { target = document, detail } = {}) {
  const eventInit = detail !== undefined ? { detail } : undefined;
  const event = new CustomEvent(type, eventInit);

  if (event && typeof target?.dispatchEvent === 'function') {
    target.dispatchEvent(event);
  }
}

export default triggerEvent;
