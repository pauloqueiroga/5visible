enum Player {
    Zero,
    One,
    None,
}

class Board {
    turn: Player;
    winner: Player;
    blocked: number;
    stash: Stack[];
    stack: Stack[];

    constructor(firstTurn: Player) {
        this.turn = firstTurn;
        this.winner = Player.None;
        this.blocked = -1;
        this.stash = [
            new Stack(8, Player.Zero), new Stack(8, Player.One)];
        this.stack = [
            new Stack(3), new Stack(3), new Stack(3),
            new Stack(3), new Stack(3), new Stack(3),
            new Stack(3), new Stack(3), new Stack(3)];
        this.play(9, 1);
        this.play(9, 3);
        this.play(9, 5);
        this.play(9, 7);
    }

    peek(stackId: number) {
        return this.stack[stackId].peek();
    }

    stashHeight(player: Player) {
        if (player == Player.None) {
            return 0;
        }

        return this.stash[player].height();
    }

    height(stackId: number) {
        if (stackId == 9) {
            return this.stashHeight(this.turn);
        }

        return this.stack[stackId].height();
    }

    play(from: number, to: number) {
        if (from == to) {
            throw "to and from are the same";
        }

        if (this.winner != Player.None) {
            throw "no more plays, winner is " + this.winner;
        }

        if (from < 0 || from > 9 || to < 0 || to > 8) {
            throw "to or from out of range";
        }

        var stackFrom = this.getFrom(from);
        var stackTo = this.getTo(to);
        var chip = stackFrom.pop();
        stackTo.push(chip);
        this.prepNextTurn(to);
    }

    private getFrom(id: number) {
        if (id == 9) {
            return this.stash[this.turn];
        }

        return this.stack[id];
    }

    private getTo(id: number) {
        return this.stack[id];
    }

    private prepNextTurn(stackToBlock: number) {
        this.blocked = stackToBlock;
        var count0 = 0;
        var count1 = 0;

        this.stack.forEach(s => {
            switch (s.peek()) {
                case Player.Zero:
                    count0++;
                    break;
                case Player.One:
                    count1++;
                    break;
            }
        });

        if (count0 >= 5) {
            this.winner = Player.Zero;
            this.turn = Player.None;
        } else if (count1 >= 5) {
            this.winner = Player.One;
            this.turn = Player.None;
        } else {
            this.winner = Player.None;
            this.turn = (this.turn == Player.Zero) ? Player.One : Player.Zero;
        }
    }
}

class Stack {
    capacity: number;
    private storage: Player[] = [];

    constructor(capacity: number, player: Player = Player.None) {
        this.capacity = capacity;
        if (player != Player.None) {
            for (let i = 0; i < capacity; i++) {
                this.storage.push(player);
            }
        }
    }

    peek() {
        if (this.height() == 0) {
            return Player.None;
        }

        return this.storage[this.height() - 1];
    }

    pop(): Player {
        var popped = this.storage.pop();
        return popped as Player;
    }

    push(chip: Player) {
        if (this.height() == this.capacity) {
            throw new Error("stack if full, can't add");
        }

        this.storage.push(chip);
    }

    height() {
        return this.storage.length;
    }
}

var game = {
    chipFaceNone: $('#chipface-2').clone(),
    chipFace0: $('#chipface-0').clone(),
    chipFace1: $('#chipface-1').clone(),
    board: new Board(0),
    start: function () {
        this.waitingForPlayer(this.board.turn);
    },
    waitingForPlayer: function (player: Player) {
        if (player == Player.None) {
            this.gameOver();
        }

        // update player turn
        $('#message').html($('#msgTurn-' + player).text());

        // update stashes' heights
        singleClass('#hidden-0-9', 'tall-' + this.board.stashHeight(Player.Zero));
        singleClass('#hidden-1-9', 'tall-' + this.board.stashHeight(Player.One));

        // reset both to Not Draggable to be sure
        makeNotDraggable('#visible-0-9', 'top-chip-0');
        makeNotDraggable('#visible-1-9', 'top-chip-1');

        // and reset the proper one
        if (this.board.stashHeight(player)) {
            makeDraggable('#visible-' + player + '-9', 'top-chip-' + player);
        }

        for (let i = 0; i < 9; i++) {
            // update stack's height
            singleClass('#hidden-' + i, 'tall-' + this.board.height(i));

            // block empty and blocked stacks from dragging
            if (this.board.height(i) == 0 || this.board.blocked == i) {
                makeNotDraggable('#visible-' + i, 'top-chip-' + this.board.peek(i));
            } else {
                makeDraggable('#visible-' + i, 'top-chip-' + this.board.peek(i));
            }

            makeNotDroppable('#stack-' + i);
        }

        this.refreshView();
    },
    chipInTheAir: function (from: number) {
        // reset both to Not Draggable
        makeNotDraggable('#visible-0-9', 'top-chip-0');
        makeNotDraggable('#visible-1-9', 'top-chip-1');

        for (let i = 0; i < 9; i++) {
            // nothing is draggable when the ship is airborne
            makeNotDraggable('#visible-' + i, 'top-chip-' + this.board.peek(i));

            if (from < 9 
                && this.board.height(from) == 1 
                && this.board.height(i) == 0) {  // avoid moving a stack-of-one
                makeNotDroppable('#stack-' + i);
            } else if (this.board.height(i) == 3) {  // avoid dropping on a stack that is full
                makeNotDroppable('#stack-' + i);
            } else if (i == from) {  // avoid dropping on the origin
                makeNotDroppable('#stack-' + i);
            } else {              // otherwise, go for it
                makeDroppable('#stack-' + i);
            }
        }
    },
    communicatingError: function () {
        // reset both to Not Draggable
        makeNotDraggable('#visible-0-9', 'top-chip-0');
        makeNotDraggable('#visible-1-9', 'top-chip-1');

        for (let i = 0; i < 9; i++) {
            // block any chance to drag and drop
            makeNotDraggable('#visible-' + i, 'top-chip-' + this.board.peek(i));
            makeNotDroppable('#stack-' + i);
        }
    },
    gameOver: function () {
        $('#message').html($('#msgWinner-' + this.board.winner).text);
        // reset both to Not Draggable
        makeNotDraggable('#visible-0-9', 'top-chip-0');
        makeNotDraggable('#visible-1-9', 'top-chip-1');

        for (let i = 0; i < 9; i++) {
            // block any chance to drag and drop
            makeNotDraggable('#visible-' + i, 'top-chip-' + this.board.peek(i));
            makeNotDroppable('#stack-' + i);
        }

        this.refreshView();
    },
    refreshView: function () {
        $(".top-chip-2").empty().append(this.chipFaceNone);
        $(".top-chip-0").empty().append(this.chipFace0);
        $(".top-chip-1").empty().append(this.chipFace1);
        $(".tall-0").html("");
        for (let i = 1; i <= 8; i++) {
            $(".tall-" + i).html(pileUp(i));
        }
    },
    move: function (from: number, to: number) {
        try {
            this.board.play(from, to);
            this.waitingForPlayer(this.board.turn);
        } catch (e: any) {
            $('#message').html(e);
            this.communicatingError();
        }
    }
}

function makeDraggable(elementId: string, topChipName: string) {
    singleClass(elementId, topChipName);
    $(elementId).attr("draggable", "true");
    $(elementId).attr("ondragstart", "drag(event)");
}

function makeNotDraggable(elementId: string, topChipName: string) {
    singleClass(elementId, topChipName);
    $(elementId).attr("draggable", "false");
    $(elementId).attr("ondragstart", "");
}

function makeDroppable(elementId: string) {
    $(elementId).attr("ondrop", "drop(event)");
    $(elementId).attr("ondragover", "allowDrop(event)");
}

function makeNotDroppable(elementId: string) {
    $(elementId).attr("ondrop", "");
    $(elementId).attr("ondragover", "");
}

function singleClass(elementId: string, className: string) {
    $(elementId).removeClass().addClass(className);
}

function pileUp(quantity: number) {
    var output = $('<div>');
    for (let index = 0; index < quantity; index++) {
        output.append($('#stack-side').clone());
    }
    return output.html();
}

function startGame() {
    game.start();
    // $('.stack-add-button').click(function () {
    //     var toIndex = $(this).attr('id').slice(-1);
    //     game.move(0,toIndex);
    // });
}

startGame()

function allowDrop(ev: any) {
    ev.preventDefault();
}

function drag(ev: any) {
    var from = ev.target.id.slice(-1)
    ev.dataTransfer.setData("from", from);
    game.chipInTheAir(from);
}

function drop(ev: any) {
    ev.preventDefault();
    var from = ev.dataTransfer.getData("from");
    var to = ev.target.closest("[id^='stack']").id.slice(-1);
    game.move(from, to);
}