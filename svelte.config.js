import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    inlineStyleThreshold: 1024,
    csp: {
      mode: 'auto',
      directives: {
        'script-src': [
          'self',
          'sha256-o92fbhqsc3TjFajrat1E9BW6KGyt6RdOl/IFHamzrxY=',
          'https://apis.google.com/js/api.js',
          'https://apis.google.com/_/scs/abc-static/_/js/k=gapi.lb.en.NnK9YPjtg-w.O/m=gapi_iframes/rt=j/sv=1/d=1/ed=1/rs=AHpOoo9KePDGVlGjp-rlXwDM1kUO2Eh4gg/cb=gapi.loaded_0',
          'unsafe-inline',
        ],
        'object-src': ['none'],
        'base-uri': ['none'],
      },
    },
  },
};

export default config;
