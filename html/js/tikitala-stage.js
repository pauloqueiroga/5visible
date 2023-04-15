function Game(ui) {
  var stacks = [];
  var turn = -1;
  var from = -1;
  var step = 'pick';
  var turnStepLabel = null;

  this.ready = function() {
    return turn >= 0 && turn <= 1;
  };

  this.init = function() {
    console.log('initializing board');
    stacks = [];
    turnStepLabel = ui.turnStepLabel();

    // create 11 stacks (0 is player 0's stash, 1 is player 1's stash, 2-10 are the game board)
    for (var i = 0; i < 11; i++) {
      var stack = stacks[i] = {
        i : i,
        chips : [],
        canDo : function(turn, step) {
          if (step == 'pick') {
            return this.canGive(turn);
          }
          if (step = 'place') {
            return this.canTake();
          }
        },
        canGive : function(turn) {
          return this.chips.length > 0 && (this.i == turn || this.i >= 2) ;
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
    stacks[4].add(stacks[0].remove());
    stacks[5].add(stacks[0].remove());
    stacks[6].add(stacks[1].remove());
    stacks[7].add(stacks[1].remove());
    
    // player 0 starts
    turn = 0;
    step = 'pick';

    // update the UI
    for (var i = 0; i < 11; i++) {
      stacks[i].ui.update(turn, step);
    }

    turnStepLabel.update(turn, step);
  };

  this.click = function(stack) {
    console.log('player clicked');
    
    if (turn < 0 || turn > 1 || !stack.canDo(turn, step)) {
      return;
    }

    if (step == 'pick' && stack.canGive(turn)) {
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
      turnStepLabel.update(turn, step);
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
      s.ui.update(turn, step);
    });
    turnStepLabel.update(turn, step);

    if (count0 >= 5) {
      return '0';
    }

    if (count1 >= 5) {
      return '1';
    }
  }
}

// Set visual coordinates for each stack
stackX = [-8, 8, 
          -8, 8, 
          0, 
          -8, 8, 
          0,
          -8, 8, 
          0];
stackY = [8, 8,
          -19, -19,
          -15, 
          -11, -11,
          -7,
          -3, -3, 
          1];

// Stage.js stuff
Stage(function(stage) {
  stage.viewbox(30, 35).pin({
    handleX : -0.5,
    handleY : -0.6
  });

  Stage.image('bg').pin({
    offsetX : 0,
    offsetY : -7,
    handle : 0.5
  }).appendTo(stage);

  var game = new Game({
    turnStepLabel : function() {
      console.log('ui new turn step label');
      var label = Stage.image('0-pick').appendTo(stage).pin({
        offsetX : 0,
        offsetY : 8,
        handle : 0.5
      });
      return {
        update : function(turn, step) {
          console.log('ui update turn step label');
          label.image(turn + '-' + step).tween(250).pin({
            scale : 0.0125
          });
        }
      }
    },
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
        update : function(turn, step) {
          console.log('ui update stack');
          var img = obj.peek() + '-' + obj.chips.length;
          var a = obj.canDo(turn, step) ? 1 : 0.3;
          top.image(img).tween(250).pin({
            alpha : a,
            scale : 0.025
          });
        },
        win : function() {
          top.tween(1000).pin({
            alpha : 1,
            scale : 0.023,
          }).ease('elastic-out');
          top.tween(1000).pin({
            alpha : 1,
            scale : 0.03,
          }).ease('bounce');
        },
        lose : function() {
          top.tween(1000).pin({
            alpha : 0.3,
            scale : 0.02
          }).ease('bounce');
        }
      };
    },
    win : function(winner, stacks) {
      console.log('ui update winner');
      stacks.forEach(s => {
        if (s.peek() == winner) {
          s.ui.win();
        } else {
          s.ui.lose();
        }
      });
    }
  });

  game.start();
});

Stage({
  image : {
    src : 'tikitala-turn-step-sprites.png',
  },
  textures : {
    '0-pick' : { x : 396, y : 0, width : 395, height : 376 },
    '0-place' : { x : 0, y : 0, width : 395, height : 376 },
    '1-pick' : { x : 396, y : 376, width : 395, height : 376 },
    '1-place' : { x : 0, y : 376, width : 395, height : 376 }
  }
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
      this.size(30, 40, ratio);
      ctx.scale(ratio, ratio);
      var g = ctx.createRadialGradient(15, 20, 2, 15, 20, 10);
      g.addColorStop(0, '#999');
      g.addColorStop(1, '#fff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 30, 30);
      ctx.moveTo(2, 32);
      ctx.lineTo(28, 32);
      ctx.strokeStyle = "#999";
      ctx.lineCap = "round";
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }),
    '-' : Stage.canvas(function(ctx) {
      var ratio = 20;
      this.size(100, 115, ratio);
      ctx.scale(ratio, ratio);
      ctx.arc(50, 85, 24, 0, 2 * Math.PI);
      ctx.lineWidth = 10;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#0a0';
      ctx.stroke();
    }),
    '-0' : '-'
  }
});