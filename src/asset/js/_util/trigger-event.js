/**
 * 이벤트를 바로 생성해서 발생시키기 위한 헬퍼
 *
 * @param {string} type - 이벤트 타입명
 * @param {object} [options]
 * @param {EventTarget} [options.target=document] - 이벤트를 발생 시킬 대상 객체
 * @param {*} [options.detail] - 이벤트와 같이 전달할 데이터
 */
function triggerEvent(type, { target = document, detail } = {}) {
  let event;

  if (CustomEvent) {
    const eventInit = detail !== undefined ? { detail } : undefined;
    event = new CustomEvent(type, eventInit);
  } else {
    event = new Event(type);

    if (detail) {
      event.detail = detail;
    }
  }

  if (event && typeof target?.dispatchEvent === 'function') {
    target.dispatchEvent(event);
  }
}

export default triggerEvent;
