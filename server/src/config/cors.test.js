const test = require('node:test');
const assert = require('node:assert/strict');

const { corsOptions } = require('./cors');

function checkOrigin(origin) {
  let result;
  let error;

  corsOptions.origin(origin, (err, allowed) => {
    error = err;
    result = allowed;
  });

  return { error, result };
}

test('allows local development origins', () => {
  assert.deepEqual(checkOrigin('http://localhost:5173'), { error: null, result: true });
  assert.deepEqual(checkOrigin('http://localhost:3000'), { error: null, result: true });
});

test('allows configured and preview Vercel origins', () => {
  assert.deepEqual(checkOrigin('https://losclaude-m5jr-90nxo6eyb-licordosprimo-s-projects.vercel.app'), {
    error: null,
    result: true,
  });
  assert.deepEqual(checkOrigin('https://losclaude-preview.vercel.app'), { error: null, result: true });
});

test('allows requests without an origin header', () => {
  assert.deepEqual(checkOrigin(undefined), { error: null, result: true });
});

test('rejects non configured origins', () => {
  const { error, result } = checkOrigin('https://example.com');

  assert.equal(result, undefined);
  assert.equal(error.message, 'Not allowed by CORS');
});
