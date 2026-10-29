// The four lessons of "Learn by playing". Each one sets up a table, limits which moves are allowed,
// and explains what just happened once the player has made the move.
//
// spots: chips on each spot, bottom chip first ('0' is you, '1' is them)
// allowFrom / allowTo: the spots (or stash 0) the lesson lets you use; null means any legal move
// last: a move they "just made", shown with its trail and lock

export const LESSONS = [
  {
    title: 'Five on top wins',
    body: 'Only the top chip of each stack counts. You have 4 on top. Take a new 0 from your stash and start a stack on an empty spot.',
    spots: { 2: ['0'], 3: ['1'], 4: ['1', '0'], 5: ['0'], 6: ['1'], 7: ['0', '1'], 8: ['0'] },
    allowFrom: [0],
    allowTo: [9, 10],
    pickText: 'Tap your stash to pick up a new 0.',
    placeText: 'Tap a ringed empty spot.',
    doneTitle: 'Five on top!',
    doneText: 'That is a win. The first player with five chips on top wins the game.'
  },
  {
    title: 'Bury their chip',
    body: 'Covering a chip takes it off the count. Pick up your 0 and drop it on their 1.',
    spots: { 4: ['0'], 5: ['0'], 6: ['1'], 7: ['1'] },
    allowFrom: [5],
    allowTo: [6],
    pickBubble: { spot: 5, text: 'Pick up this 0' },
    placeBubble: { spot: 6, text: 'Drop it here' },
    pickText: 'Tap your 0 to pick it up.',
    placeText: 'Tap their ringed 1 to bury it.',
    doneTitle: 'Buried',
    doneText: 'Their 1 no longer counts. It is still there under your 0, so remember where it is.'
  },
  {
    title: 'Three high, no peeking',
    body: 'A stack holds 3 chips at most, and only the top one shows. Your 0 is buried under their 1 here. Lift their 1 to uncover it.',
    spots: { 4: ['0', '1', '0'], 5: ['0', '1'], 6: ['1'], 7: ['0'] },
    tags: { 5: 'YOUR 0 IS UNDER' },
    allowFrom: [5],
    allowTo: null,
    pickText: 'Tap their 1 to lift it.',
    doneTitle: 'Uncovered',
    doneText: 'Your 0 is back on top. Lifting a chip shows what was under it, so a lifted chip cannot go back.'
  },
  {
    title: 'Hands off their last move',
    body: 'They just moved a 1 onto your 0. The chip they moved last is locked: you cannot touch it this turn. Make any other move.',
    spots: { 2: ['1'], 3: ['1'], 4: ['0'], 5: ['0'], 7: ['0', '1'] },
    last: { from: 6, to: 7 },
    allowFrom: null,
    allowTo: null,
    doneTitle: 'That is the game',
    doneText: 'One chip per turn, from your stash or off any stack. Bury theirs, remember yours, and get five on top.'
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
