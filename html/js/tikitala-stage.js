function Game(ui) {
  var stacks = [];
  var turn = -1;
  var from = -1;
  var step = 'pick';

  this.ready = function() {
    return turn >= 0 && turn <= 1;
  };

  this.init = function() {
    console.log('initializing board');
    stacks = [];

    // create 11 stacks (0 is player 0's stash, 1 is player 1's stash, 2-10 are the game board)
    for (var i = 0; i < 11; i++) {
      var stack = stacks[i] = {
        i : i,
        chips : [],
        canDo : function(step) {
          if (step == 'pick') {
            return this.canGive();
          }
          if (step = 'place') {
            return this.canTake();
          }
        },
        canGive : function() {
          return this.chips.length > 0;
        },
        canTake : function() {
          return this.chips.length < 3 && this.i != 0 && this.i != 1;
        },
        peek : function() {
          if (this.chips.length == 0) {
            return '';
          }

          return this.chips[this.chips.length - 1].player;
        },
        add: function(chip) {
          this.chips.push(chip);
        },
        remove: function() {
          return this.chips.pop();
        }
      };

      stack.ui = ui.newStack(stack);
    }
  };

  this.start = function() {
    console.log('starting game');

    if (stacks.length == 0) {
      this.init();
    }

    for (var i = 0; i < 11; i++) {
      stacks[i].chips = [];
    }

    // add 8 pieces to each player's stash
    for (var i = 0; i < 8; i++) {
      stacks[0].add({
        player : '0',
      });
      stacks[1].add({
        player : '1',
      });
    }

    // each player adds 2 pieces to the game board
    stacks[3].add(stacks[0].remove());
    stacks[9].add(stacks[0].remove());
    stacks[4].add(stacks[1].remove());
    stacks[8].add(stacks[1].remove());
    
    // player 0 starts
    turn = 0;
    step = 'pick';

    // update the UI
    for (var i = 0; i < 11; i++) {
      stacks[i].ui.update(step);
    }
  };

  this.click = function(stack) {
    console.log('player clicked');
    
    if (turn < 0 || turn > 1 || !stack.canDo(step)) {
      return;
    }

    if (step == 'pick' && stack.canGive()) {
      from = stack.i;
      step = 'place';
    } else if (step == 'place' && stack.canTake()) {
      var to = stack.i;
      stacks[to].add(stacks[from].remove());
      from = -1;
      step = 'pick';
      turn = (turn == 0) ? 1 : 0;
    }

    var winner = checkState();
    if (winner) {
      turn = -1;
      ui.win(winner, stacks);
    } 
  };

  function checkState() {
    console.log('checking state');
    count0 = count1 = 0;
    stacks.forEach(s => {
      var top = s.peek();
      if (top == '0' && s.i != 0) { count0++; }
      if (top == '1' && s.i != 1) { count1++; }
      s.ui.update(step);
    });

    if (count0 >= 5) {
      return '0';
    }

    if (count1 >= 5) {
      return '1';
    }
  }
}

// Set visual coordinates for each stack
stackX = [-16, 16, 
          0, 
          -5, 5, 
          -10, 0, 10,
          -5, 5, 
          0];
stackY = [8, -8,
          -8, 
          -4, -4,
          0, 0, 0,
          4, 4, 
          8];

// Stage.js stuff
Stage(function(stage) {
  stage.viewbox(50, 50).pin('handle', -0.5);

  Stage.image('bg').pin('handle', 0.5).appendTo(stage);

  var game = new Game({
    newStack : function(obj) {
      console.log('ui new stack');
      var top = Stage.image('-').appendTo(stage).pin({
        offsetX : stackX[obj.i],
        offsetY : stackY[obj.i],
        handle : 0.5
      }).on('click', function() {
        if (game.ready()) {
          game.click(obj);
        } else {
          game.start();
        }
      });
      return {
        update : function(step) {
          console.log('ui update stack');
          var img = obj.peek() + '-' + obj.chips.length;
          var a = obj.canDo(step) ? 1 : 0.3;
          top.image(img).pin({
            alpha : a,
            scale : 0.0225
          });
        },
        win : function() {
          top.tween(200).pin({
            alpha : 1,
            scale : 0.03,
          });
        }
      };
    },
    win : function(winner, stacks) {
      console.log('ui update winner');
      stacks.forEach(s => {
        if (s.peek() == winner) {
          s.ui.win();
        }
      });
    }
  });

  game.start();
});

Stage({
  image : {
    src : 'tikitala-sprites.png',
  },
  textures : {
    '0-1' : { x : 0, y : 0, width : 385, height : 283 },
    '0-2' : { x : 385, y : 0, width : 385, height : 283 },
    '0-3' : { x : 770, y : 0, width : 385, height : 283 },
    '0-4' : { x : 1155, y : 0, width : 385, height : 283 },
    '0-5' : { x : 1540, y : 0, width : 385, height : 283 },
    '0-6' : { x : 1925, y : 0, width : 385, height : 283 },
    '0-7' : { x : 2310, y : 0, width : 385, height : 283 },
    '0-8' : { x : 2695, y : 0, width : 385, height : 283 },
    '1-1' : { x : 0, y : 284, width : 385, height : 283 },
    '1-2' : { x : 385, y : 284, width : 385, height : 283 },
    '1-3' : { x : 770, y : 284, width : 385, height : 283 },
    '1-4' : { x : 1155, y : 284, width : 385, height : 283 },
    '1-5' : { x : 1540, y : 284, width : 385, height : 283 },
    '1-6' : { x : 1925, y : 284, width : 385, height : 283 },
    '1-7' : { x : 2310, y : 284, width : 385, height : 283 },
    '1-8' : { x : 2695, y : 284, width : 385, height : 283 },
    'bg' : Stage.canvas(function(ctx) {
      var ratio = 20;
      this.size(24, 24, ratio);
      ctx.scale(ratio, ratio);
      ctx.moveTo(1, 12);
      ctx.lineTo(12, 1);
      ctx.lineTo(23, 12);
      ctx.lineTo(12, 23);
      ctx.lineTo(1,12);
      ctx.lineWidth = 0.3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#777';
      ctx.stroke();    
    }),
    '-' : Stage.canvas(function(ctx) {
      var ratio = 20;
      this.size(100, 100, ratio);
      ctx.scale(ratio, ratio);
      ctx.arc(50, 50, 24, 0, 2 * Math.PI);
      ctx.lineWidth = 10;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#f00';
      ctx.stroke();
    }),
    '-0' : '-'
  }
});