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
          'https://apis.google.com/_/scs/abc-static/_/js/',
          'unsafe-inline',
        ],
        'object-src': ['none'],
        'base-uri': ['none'],
      },
    },
  },
};

export default config;
