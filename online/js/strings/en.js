// English: the source for every other language. Keys are grouped by screen.
//
// For translators (the full guide is docs/online/translation.md in 5visible):
// - Keep every key and every {placeholder}. {p} is a player, always 0 or 1; {n}, {a} and {b} are counts.
// - [display] marks Bebas Neue headlines and button labels: capitals only, big, best on one line.
//   Aim for no more than about 20% longer than the English.
// - [label] marks Roboto Mono tags and counters: shown in capitals, tiny, never wrap. Keep them short.
// - A string can be { zero, one, other } where the language needs plural forms for {n}.

export default {
  // page
  'meta.title': 'TIKITALA Online',
  'meta.description': 'Play TIKITALA online free, a 2-player strategy and memory game. No download or signup required, just click and play in your browser.',

  // home
  'home.tagline': 'Five on top wins',                               // [display] the game's catchphrase
  'home.sub': 'A 2-player game of strategy and sharp memory.',
  'home.computer': 'Play the computer',                             // [display]
  'home.computer.sub': 'Offline. No connection needed.',
  'home.computer.continue': 'Continue your {level} game · {a}–{b}',
  'home.computer.new': 'New game against the computer',
  'home.pass': 'Pass & play',                                       // [display]
  'home.pass.sub': 'Two players on this device',
  'home.pass.continue': 'Continue: Player {p}’s move · {a}–{b}',
  'home.pass.new': 'New pass & play game',
  'home.learn': 'New here? Learn in four moves',
  'home.better': 'Better on a real table.',
  'home.getChips': 'Get the chips at tikitala.com',
  'language': 'Language',

  // moving around
  'nav.back': 'Back to home',
  'nav.menu': 'Menu: back to home. Your game is saved',
  'nav.help': 'How to play',

  // choosing a computer level
  'levels.title': 'Play the computer',                              // [display]
  'levels.sub': 'You play 0 and go first. The computer sees what you see, and remembers buried chips the way people do: some better than others.',
  'levels.last': 'LAST PLAYED',                                     // [label]
  'level.friendly.name': 'Friendly',                                // [display] also used in "the {level} computer"
  'level.friendly.about': 'Forgets buried chips often and plays casually. Good for a first game.',
  'level.clever.name': 'Clever',                                    // [display]
  'level.clever.about': 'Plays well, but loses track of buried chips now and then, like most people.',
  'level.ruthless.name': 'Ruthless',                                // [display]
  'level.ruthless.about': 'Remembers almost every chip and thinks a move ahead.',

  // the game screen: header and panels
  'game': 'Game',
  'head.computer': 'vs Computer · {level}',
  'head.pass': 'Pass & play',
  'panel.other': 'Other player',
  'panel.me': 'Your turn',
  'panel.otherStash': { zero: 'No chips left in stash', one: '{n} chip left in stash', other: '{n} chips left in stash' },
  'name.you': 'You · {p}',                                          // [display]
  'name.them': 'Them · {p}',                                        // [display]
  'name.computer': 'Computer · {p}',                                // [display]
  'name.player': 'Player {p}',                                      // [display]
  'score': '{n} / 5 ON TOP',                                        // [label]

  // whose turn it is, and what to do
  'turn.you': 'Your move',                                          // [display]
  'turn.player': 'Player {p}’s move',                               // [display]
  'turn.computer': 'Computer’s move',                               // [display]
  'turn.thinking': 'Thinking…',
  'turn.place': 'Place it',                                         // [display]
  'turn.pick': 'Pick up a chip: any top chip on the table or a new one from your stash.',
  'turn.pickNoStash': 'Pick up any top chip on the table. Your stash is empty.',
  'turn.placeAny': 'Tap a ringed spot. A stack holds 3 chips at most.',
  'turn.placeLifted': 'You lifted it off a stack and saw what was under it, so it can’t go back. Tap a ringed spot.',
  'passed.you': 'You had no legal move.',
  'passed.computer': 'The computer had no legal move.',
  'passed.player': 'Player {p} had no legal move.',

  // your stash, and the chip in your hand
  'stash': 'Stash',                                                 // [display]
  'stash.left': '{n} left',
  'stash.leftTap': '{n} left · tap for a new chip',
  'stash.none': 'None left',
  'stash.label': 'Stash, {n} left',
  'stash.labelTap': 'Stash, {n} left. Tap to pick up a new chip',
  'stash.labelNone': 'Stash, none left',
  'hand': 'In your hand',                                           // [display]
  'hand.label': 'In your hand: {chip}',
  'hand.fromStash': 'A new {p} from your stash',
  'hand.yoursFromTable': 'Your {p} from the table',
  'hand.yoursFromStack': 'Your {p} from a stack',
  'hand.theirsFromTable': 'Their {p} from the table',
  'hand.theirsFromStack': 'Their {p} from a stack',
  'hand.putBack': 'Put it back',
  'hand.noTakebacks': 'No take-backs',

  // the table: tags on stacks, and what screen readers say about each spot
  'tag.uncovered': 'UNCOVERED',                                     // [label]
  'tag.full': 'FULL',                                               // [label]
  'spot.yours': 'your {p}',
  'spot.theirs': 'their {p}',
  'spot.empty': 'Empty spot',
  'spot.emptyTarget': 'Empty spot. Place your chip here',
  'spot.stack': 'Stack of {n}, {owner} on top',
  'spot.target': '{spot}. Place your chip here',
  'spot.locked': 'Locked: their last move. {spot}',
  'spot.origin': 'Where the chip in your hand came from',
  'spot.originTop': 'Where the chip in your hand came from, {owner} now on top',
  'spot.tapPutBack': '{spot}. Tap to put it back',

  // the end of a game, before the reveal opens
  'end.five': 'Five on top!',                                       // [display]
  'end.computerFive': 'The computer has five',                      // [display]
  'end.flip': 'Every stack is about to flip open.',
  'end.youWin': 'You win. Every stack is about to flip open.',
  'end.playerWins': 'Player {p} wins. Every stack is about to flip open.',

  // announced to screen readers after every move
  'live.putBack': 'Chip put back. {turn}.',
  'live.moved.you': 'You moved a chip.',
  'live.moved.computer': 'The computer moved a chip.',
  'live.moved.player': 'Player {p} moved a chip.',
  'live.uncovered.you': 'You moved a chip and uncovered one.',
  'live.uncovered.computer': 'The computer moved a chip and uncovered one.',
  'live.uncovered.player': 'Player {p} moved a chip and uncovered one.',
  'live.win.you': 'You have five on top and win.',
  'live.win.computer': 'The computer has five on top and wins.',
  'live.win.player': 'Player {p} has five on top and wins.',
  'live.next.you': 'Your move.',
  'live.next.computer': 'The computer’s move.',
  'live.next.player': 'Player {p}’s move.',

  // lessons
  'lesson.count': 'LESSON {n} OF {total}',                          // [label]
  'lesson.skip': 'Skip',
  'lesson.onTop': 'ON TOP',                                         // [label]
  'lesson.you': 'You',
  'lesson.them': 'Them',
  'lesson.next': 'Next lesson',                                     // [display]
  'lesson.toComputer': 'Play the computer',                         // [display]

  'lesson.win.title': 'Five on top wins',                           // [display]
  'lesson.win.body': 'Only the top chip of each stack counts. You have 4 on top. Take a new 0 from your stash and start a stack on an empty spot.',
  'lesson.win.pick': 'Tap your stash to pick up a new 0.',
  'lesson.win.place': 'Tap a ringed empty spot.',
  'lesson.win.doneTitle': 'Five on top!',                           // [display]
  'lesson.win.doneText': 'That is a win. The first player with five chips on top wins the game.',

  'lesson.bury.title': 'Bury their chip',                           // [display]
  'lesson.bury.body': 'Covering a chip takes it off the count. Pick up your 0 and drop it on their 1.',
  'lesson.bury.pickBubble': 'Pick up this 0',
  'lesson.bury.placeBubble': 'Drop it here',
  'lesson.bury.pick': 'Tap your 0 to pick it up.',
  'lesson.bury.place': 'Tap their ringed 1 to bury it.',
  'lesson.bury.doneTitle': 'Buried',                                // [display]
  'lesson.bury.doneText': 'Their 1 no longer counts. It is still there under your 0, so remember where it is.',

  'lesson.stack.title': 'Three high, no peeking',                   // [display]
  'lesson.stack.body': 'A stack holds 3 chips at most, and only the top one shows. Your 0 is buried under their 1 here. Lift their 1 to uncover it.',
  'lesson.stack.tag': 'YOUR 0 IS UNDER',                            // [label]
  'lesson.stack.pick': 'Tap their 1 to lift it.',
  'lesson.stack.doneTitle': 'Uncovered',                            // [display]
  'lesson.stack.doneText': 'Your 0 is back on top. Lifting a chip shows what was under it, so a lifted chip cannot go back.',

  'lesson.lock.title': 'Hands off their last move',                 // [display]
  'lesson.lock.body': 'They just moved a 1 onto your 0. The chip they moved last is locked: you cannot touch it this turn. Make any other move.',
  'lesson.lock.doneTitle': 'That is the game',                      // [display]
  'lesson.lock.doneText': 'One chip per turn, from your stash or off any stack. Bury theirs, remember yours, and get five on top.',

  // game over, and the big reveal
  'over.tag': 'GAME OVER · {n} MOVES',                              // [label]
  'over.youWin': 'You win',                                         // [display] very big
  'over.computerWins': 'Computer wins',                             // [display] very big
  'over.playerWins': 'Player {p} wins',                             // [display] very big
  'over.youWinSub': '{a} on top. The computer had {b}.',
  'over.computerWinsSub': 'The computer got {a} on top. You had {b}.',
  'over.playerWinsSub': '{a} on top. Player {p} had {b}.',
  'reveal.title': 'The big reveal',                                 // [display]
  'reveal.topInFront': 'Top chip in front',
  'reveal.stack': 'Stack, top to bottom: {chips}',
  'reveal.youBuried': 'You buried {n} of their chips.',
  'reveal.theyBuried': 'They buried {n} of yours.',
  'reveal.passBuried': '{a} of Player 0’s chips and {b} of Player 1’s ended up buried.',
  'reveal.remember': 'Did you remember them all?',
  'over.rematch': 'Rematch',                                        // [display] shares a row with Share
  'over.share': 'Share',                                            // [display]
  'promo.alt': 'TIKITALA chips on a wooden table',
  'promo.title': 'Play it on a real table',                         // [display]
  'promo.link': 'Get TIKITALA →',
  'kofi': 'Buy me a coffee',

  // sharing a result: adapt freely, it is a boast to a friend
  'share.youWon': 'I beat the {level} computer at TIKITALA, {a} to {b}. Five on top wins.',
  'share.computerWon': 'The {level} computer beat me at TIKITALA, {a} to {b}. Five on top wins.',
  'share.playerWon': 'Player {p} won TIKITALA {a} to {b} in {n} moves. Five on top wins.',
  'share.copied': 'Copied. Paste it anywhere.',
  'share.link': 'Share this link: {url}'
};
