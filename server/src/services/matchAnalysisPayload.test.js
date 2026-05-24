const test = require('node:test');
const assert = require('node:assert/strict');

const { formatMatchForAI } = require('./matchAnalysisPayload');

test('includes Free Fire individual kills in AI payload', () => {
  const payload = formatMatchForAI({
    modality: 'Free Fire',
    team_placement: 2,
    booyah: false,
    team_eliminations: 11,
    stats: [{ nick: 'Alpha', role: 'Capitao', free_fire_kills: 7 }],
  });

  assert.equal(payload.jogadores[0].kills, 7);
});
