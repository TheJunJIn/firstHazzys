/**
 * @param {{[x:string]: any}} obj
 * @param {string} key
 * @returns {any}
 */
function getDeep(obj, key) {
  if (typeof key === 'string') {
    if (key.indexOf('.') > 0) {
      const props = key.split('.');
      return props.reduce((o, prop) => o[prop], obj);
    } else {
      return obj[key];
    }
  }
}

/**
 * @param {{[key:string]: any}} obj
 * @param {string} key
 * @param {any} value
 * @returns {{[key:string]: any}}
 */
function setDeep(obj, key, value) {
  if (typeof key === 'string') {
    const newObj = { ...obj };
    if (key.indexOf('.') > 0) {
      const props = key.split('.');
      const lastIndex = props.length - 1;
      let pointer = newObj;
      props.forEach((prop, i) => {
        if (i === lastIndex) {
          pointer[prop] = value;
        } else {
          if (!(prop in pointer)) {
            pointer[prop] = {};
          }
          pointer = pointer[prop];
        }
      });
    } else {
      newObj[key] = value;
    }
    return newObj;
  }
}

/**
 * @param {{[moduleName:string]: StateSetterMap}} setters
 * @param {string} key
 * @returns {Setter}
 */
function getSetter(setters, key) {
  const setter = getDeep(setters, key);

  if (typeof setter === 'function') {
    return setter;
  } else {
    return function setter(state, value) {
      const oldValue = getDeep(state, key);

      if (value !== oldValue) {
        const newState = setDeep(state, key, value);
        return newState;
      }
    };
  }
}

/**
 * @typedef {{[stateProp:string]: any}} State
 * @typedef {{[moduleName:string]: State}} StateMap
 * @typedef {(states:StateMap, value:any) => StateMap} Setter
 * @typedef {(states:StateMap, value:any) => void} Handler
 * @typedef {() => void} Cancel
 * @typedef {{[stateProp:string]: Setter}} StateSetterMap
 * @typedef {{[stateProp:string]: Handler}} StateHandlerMap
 *
 * @typedef {Object} StoreInit
 * @property {StateMap} states
 * @property {{[moduleName:string]: StateSetterMap}} setters
 * @property {{[moduleName:string]: StateHandlerMap}} handlers
 *
 * @typedef {Object} Module
 * @property {string} name
 * @property {State} state
 * @property {StateSetterMap} setters
 * @property {StateHandlerMap} handlers
 *
 * @typedef {Object} Store
 * @property {{[moduleName:string]: {[stateProp:string]: State}}} states
 * @property {(module:Module) => void} register
 * @property {(key:string, handler:Handler) => Cancel} on
 * @property {(key:string, handler?:Handler) => void} off
 * @property {(key:string, handler:Handler) => void} once
 */

/** @type {StoreInit} */
const DEFAULT_INIT = {
  states: {},
  setters: {},
  handlers: {}
};

/**
 * @param {StoreInit} init
 * @returns {Store}
 */
export default function createStore(init) {
  /** @type {StoreInit} */
  const _init = { ...DEFAULT_INIT, ...init };

  /** @type {StateMap} */
  let _states = { ..._init.states };

  /** @type {{[moduleName:string]: StateSetterMap}} */
  let _setters = { ..._init.setters };

  /** @type {{[moduleName:string]: StateHandlerMap}} */
  let _handlers = { ..._init.handlers };

  /**
   * @param {Module} module
   */
  function register(module) {
    const { name, state, setters, handlers } = module;

    if (typeof name !== 'string') {
      return;
    }

    if (state) {
      _states[name] = state;
    }

    if (setters) {
      _setters[name] = setters;
    }

    if (handlers) {
      _handlers[name] = handlers;
    }
  }

  /**
   * @param {StateMap} states
   * @param {string} key
   * @param {any} value
   */
  function onChange(states, key, value) {
    /** @type {Handler[]} */
    const handlers = getDeep(_handlers, key);

    if (Array.isArray(handlers)) {
      handlers.forEach((handler) => {
        handler(states, value);
      });
    }
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  function set(key, value) {
    const setter = getSetter(_setters, key);
    const newStates = setter(_states, value);

    if (newStates) {
      const oldValue = getDeep(_states, key);
      const newValue = getDeep(newStates, key);

      if (oldValue !== newValue) {
        _states = newStates;
        onChange(_states, key, value);
      }
    }
  }

  /**
   * @param {string} key
   * @param {Handler} handler
   * @returns {Cancel}
   */
  function on(key, handler) {
    const handlers = getDeep(_handlers, key);

    if (Array.isArray(handlers)) {
      if (handlers.indexOf(handler) === -1) {
        handlers.push(handler);
      }
    } else {
      _handlers = setDeep(_handlers, key, [handler]);
    }

    return function cancel() {
      off(key, handler);
    };
  }

  /**
   * @param {string} key
   * @param {Handler} [handler]
   */
  function off(key, handler) {
    const handlers = getDeep(_handlers, key);

    if (Array.isArray(handlers)) {
      if (handler) {
        const index = handlers.indexOf(handler);
        handlers.splice(index, 1);
      } else {
        _handlers = setDeep(_handlers, key, []);
      }
    }
  }

  /**
   * @param {string} key
   * @param {Handler} handler
   */
  function once(key, handler) {
    const cancel = on(key, (states, value) => {
      cancel();
      handler(states, value);
    });
  }

  /** @type {Store} */
  const store = {
    get states() {
      return { ..._states };
    },
    register,
    set,
    on,
    off,
    once
  };

  return store;
}
