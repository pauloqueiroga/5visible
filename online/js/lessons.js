// The four lessons of "Learn by playing". Each one sets up a table, limits which moves are allowed,
// and explains what just happened once the player has made the move.
//
// id: the lesson's words are under lesson.<id>.* in the string tables (js/strings)
// spots: chips on each spot, bottom chip first ('0' is you, '1' is them)
// allowFrom / allowTo: the spots (or stash 0) the lesson lets you use; null means any legal move
// pickBubble / placeBubble / tag: the spot a bubble points at, or a tag sits on
// last: a move they "just made", shown with its trail and lock

export const LESSONS = [
  {
    id: 'win',
    spots: { 2: ['0'], 3: ['1'], 4: ['1', '0'], 5: ['0'], 6: ['1'], 7: ['0', '1'], 8: ['0'] },
    allowFrom: [0],
    allowTo: [9, 10]
  },
  {
    id: 'bury',
    spots: { 4: ['0'], 5: ['0'], 6: ['1'], 7: ['1'] },
    allowFrom: [5],
    allowTo: [6],
    pickBubble: { spot: 5 },
    placeBubble: { spot: 6 }
  },
  {
    id: 'stack',
    spots: { 4: ['0', '1', '0'], 5: ['0', '1'], 6: ['1'], 7: ['0'] },
    tag: { spot: 5 },
    allowFrom: [5],
    allowTo: null
  },
  {
    id: 'lock',
    spots: { 2: ['1'], 3: ['1'], 4: ['0'], 5: ['0'], 7: ['0', '1'] },
    last: { from: 6, to: 7 },
    allowFrom: null,
    allowTo: null
  }
];

// builds a game in the shape of rules.js from a lesson's spots
export function lessonGame(lesson) {
  const ROT = [-14, 22, -6, 18, -26, 9, -19, 27, 4, -9, 15, -23, 12, -3, 25, -17];
  let id = 0;
  const chip = (p) => ({ id: id, p, r: ROT[id++ % ROT.length] });
  const stacks = Array.from({ length: 11 }, () => []);
  const used = { 0: 0, 1: 0 };
  for (const [i, chips] of Object.entries(lesson.spots)) {
    for (const p of chips) { stacks[Number(i)].push(chip(p)); used[p]++; }
  }
  for (const p of ['0', '1']) for (let k = used[p]; k < 8; k++) stacks[Number(p)].push(chip(p));
  const g = { v: 1, stacks, turn: 0, blocked: -1, last: null, moves: 0, winner: null, passed: false };
  if (lesson.last) {
    const to = lesson.last.to;
    g.blocked = to;
    g.last = { from: lesson.last.from, to, by: 1, chip: stacks[to][stacks[to].length - 1].id, uncovered: false };
  }
  return g;
}
