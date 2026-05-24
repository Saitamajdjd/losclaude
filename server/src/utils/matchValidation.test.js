const test = require('node:test');
const assert = require('node:assert/strict');

const { validateMatchBody } = require('./matchValidation');

test('normalizes Free Fire player kills as free_fire_kills', () => {
  const result = validateMatchBody({
    modality: 'Free Fire',
    team_placement: '1',
    booyah: true,
    team_eliminations: '12',
    stats: [{ player_id: '7', free_fire_kills: '5' }],
  });

  assert.ifError(result.error);
  assert.deepEqual(result.data.stats, [
    {
      player_id: 7,
      kills: 0,
      deaths: 0,
      assists: 0,
      free_fire_kills: 5,
      free_fire_placement: null,
    },
  ]);
});
