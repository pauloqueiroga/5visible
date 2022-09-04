var game = {
    chipFaceNone : $('#chipface-none').clone(),
    chipFace0 : $('#chipface-0').clone(),
    chipFace1 : $('#chipface-1').clone(),
    board : {},
    start : function () {
        this.board.turn = 0;
        this.board.winner = "none";
        this.board.stash = [6, 6];
        this.board.stackCount = [ 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board.stackTop =   ["none", 1,"none", 1,"none", 0,"none", 0,"none"];
        this.board.stackCanPop = [false,true,false,true,false,true,false,true,false];
        this.board.stackCanPush = [true,true,true,true,true,true,true,true,true];
        this.updateViewModel();
        this.refreshView();
    },
    updateViewModel : function () {
        // if there's a winner, communicate and bail out
        if (this.board.winner != "none") {
            $('#message').html($('#msgWinner-'+ this.board.winner));
            return;
        }

        // update player turn
        $('#message').html($('#msgTurn-'+ this.board.turn).clone());

        // update stashes
        singleClass('#hidden-0-0', 'tall-'+this.board.stash[0]);
        singleClass('#hidden-0-1', 'tall-'+this.board.stash[1]);

        if (this.board.stash[0] > 0 && this.board.turn == 0) {
            makeDraggable('#visible-0-9', 'top-chip-0');
        } else {
            makeNotDraggable('#visible-0-9', 'top-chip-none');
        }

        if (this.board.stash[1] > 0 && this.board.turn == 1) {
            makeDraggable('#visible-1-9', 'top-chip-1');
        } else {
            makeNotDraggable('#visible-1-9', 'top-chip-none');
        }

        // update stacks
        for (let i = 0; i < 9; i++) {
            singleClass('#hidden-'+i, 'tall-' + this.board.stackCount[i]);

            if (this.board.stackCanPop[i]) {
                makeDraggable('#visible-'+i, 'top-chip-' + this.board.stackTop[i]);
            } else {
                makeNotDraggable('#visible-'+i, 'top-chip-' + this.board.stackTop[i]);
            }

            if (this.board.stackCanPush[i]) {
                makeDroppable('#stack-'+i);
            } else {
                makeNotDroppable('#stack-'+i);
            }
        }
    },
    refreshView : function () {
        $(".top-chip-none").html(this.chipFaceNone)
        $(".top-chip-0").html(this.chipFace0)
        $(".top-chip-1").html(this.chipFace1)
        $(".tall-0").html("")
        for (let i = 1; i <= 8; i++) {
            $(".tall-" + i).html(pileUp(i))
        }
    },
    move : function (from, to) {
        var who = 0;
        if (from == 9) {
            this.board.stash[this.board.turn]--;
            who = this.board.turn;
        } else {
            this.board.stackCount[from]--;
            who = this.board.stackTop[from]--;
        }
        this.board.stackCount[to]++;
        this.board.stackTop[to] = who;
        this.board.stackCanPop[to] = false;
        this.updateViewModel();
        this.refreshView();
    }
}

function makeDraggable(elementId, topChipName) {
    singleClass(elementId, topChipName);
    $(elementId).attr("draggable", "true");
    $(elementId).attr("ondragstart", "drag(event)");
}

function makeNotDraggable(elementId, topChipName) {
    singleClass(elementId, topChipName);
    $(elementId).attr("draggable", "false");
    $(elementId).attr("ondragstart", "");
}

function makeDroppable(elementId) {
    $(elementId).attr("ondrop", "drop(event)");
    $(elementId).attr("ondragover", "allowDrop(event)");
}

function makeNotDroppable(elementId) {
    $(elementId).attr("ondrop", "");
    $(elementId).attr("ondragover", "");
}

function singleClass(elementId, className) {
    $(elementId).removeClass().addClass(className);
}

function pileUp(quantity) {
    var output = $('<div>');
    for (let index = 0; index < quantity; index++) {
        output.append($('#stack-side').clone());
    }
    return output.html();
}
    
function startGame() {
    game.start();
    $('.stack-add-button').click(function () {
        var toIndex = $(this).attr('id').slice(-1);
        game.move(0,toIndex);
    });
}

$( startGame() )

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("from", ev.target.id.slice(-1));
}

function drop(ev) {
    ev.preventDefault();
    var from = ev.dataTransfer.getData("from");
    var to = ev.target.id.slice(-1);
    game.move(from, to);
}