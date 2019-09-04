export function debounce(fn,delay) {
  let handle;
  return function (e) {
    // 取消之前的延时调用
    clearTimeout(handle);
    handle = setTimeout(() => {
      fn(e);
    }, delay);
  }
}
