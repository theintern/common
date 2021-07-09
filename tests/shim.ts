// IE11 doesn't have a proper URL object
// import 'core-js-pure/modules/web.url';
if (
  typeof window.URL === 'undefined' ||
  window.navigator.userAgent.indexOf('MSIE') !== -1
) {
  window.URL = require('core-js-pure/features/url');
}

if (typeof window.Promise === 'undefined') {
  window.Promise = require('core-js-pure/features/promise');
}

if (typeof window.Symbol === 'undefined') {
  window.Symbol = require('core-js-pure/features/symbol');
}

if (typeof window.Set === 'undefined') {
  window.Set = require('core-js-pure/features/set');
}
