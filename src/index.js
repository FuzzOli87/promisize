import _ from 'lodash';

function defaultResolver(resolve, reject, resultProcessor) {
  function callback(err, data) {
    if (err) {
      reject(err);
    } else {
      let modifiedData;

      if (resultProcessor) {
      console.log('huh', resultProcessor);
        modifiedData = resultProcessor(data);
      }

      resolve(modifiedData || data);
    }
  }

  return callback;
}

function createModifiedFn(fn, resultProcessor) {
  console.log('fn', fn);
  return (...args) => {
    return new Promise((resolve, reject) => {
      const callback = defaultResolver(resolve, reject, resultProcessor);

      fn(...[...args, callback]);
    });
  };
}

function customModifiedFn(fn) {
  return resultProcessor => (
    (...args) => {
      return new Promise((resolve, reject) => {
        const callback = defaultResolver(resolve, reject, resultProcessor);

        fn(...[...args, callback]);
      });
    }
  );
}

export default function promisize({ target, resultProcessor, methods = [] }) {
  if (typeof target === 'function') {
    return createModifiedFn(target, resultProcessor);
  }

  const copyOfClient = _.cloneDeep(target);

  methods.forEach(method => {
    const existingFn = copyOfClient[method];
    let promisizedFn;

    if (typeof existingFn === 'function') {
      promisizedFn = customModifiedFn(existingFn);

      copyOfClient[method] = promisizedFn;
    }
  });

  return copyOfClient;
}
