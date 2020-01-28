export function polyfill() {
  if (window.TextEncoder) {
    return Promise.resolve();
  } else {
    // Needed for older versions of Edge (so could probably soon be skipped):
    return import('text-encoding-utf-8').then(encoding => {
      window.TextEncoder = encoding.TextEncoder;
      window.TextDecoder = encoding.TextDecoder;
    });
  }
}
