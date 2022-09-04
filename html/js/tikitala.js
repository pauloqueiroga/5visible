var game = {
    chipFaceNone : $('#chipface-none').clone(),
    chipFace0 : $('#chipface-0').clone(),
    chipFace1 : $('#chipface-1').clone(),
    start : function () {
        this.turn = 0;
        this.winner = "none";
        this.stash = [6, 6];
        this.stackCount = [ 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.stackTop =   ["none", 1,"none", 1,"none", 0,"none", 0,"none"];
        this.stackCanPop = [false,true,false,true,false,true,false,true,false];
        this.stackCanPush = [true,true,true,true,true,true,true,true,true];
        this.updateViewModel();
        this.refreshView();
    },
    updateViewModel : function () {
        // if there's a winner, communicate and bail out
        if (this.winner != "none") {
            $('#message').html($('#msgWinner-'+ this.winner));
            return;
        }

        // update player turn
        $('#message').html($('#msgTurn-'+ this.turn).clone());

        // update stashes
        $('#hidden-0-0').removeClass().addClass('tall-'+this.stash[0]);
        $('#hidden-0-1').removeClass().addClass('tall-'+this.stash[1]);

        if (this.stash[0] > 0) {
            $('#visible-0-9').removeClass().addClass('top-chip-0');
        } else {
            $('#visible-0-9').removeClass().addClass('top-chip-none');
        }

        if (this.stash[1] > 0) {
            $('#visible-1-9').removeClass().addClass('top-chip-1');
        } else {
            $('#visible-1-9').removeClass().addClass('top-chip-none');
        }

        // update stacks
        for (let i = 0; i < 9; i++) {
            $('#hidden-'+i).removeClass().addClass('tall-' + this.stackCount[i]);
            $('#visible-'+i).removeClass().addClass('top-chip-' + this.stackTop[i]);
            if (this.stackCanPop[i]) {
                $('#visible-'+i).attr("draggable", "true");
                $('#visible-'+i).attr("ondragstart", "drag(event)");
            } else {
                $('#visible-'+i).attr("draggable", "false");
                $('#visible-'+i).attr("ondragstart", "");
            }
            if (this.stackCanPush[i]) {
                $('#stack-'+i).attr("ondrop", "drop(event)");
                $('#stack-'+i).attr("ondragover", "allowDrop(event)");
            } else {
                $('#stack-'+i).attr("ondrop", "");
                $('#stack-'+i).attr("ondragover", "");
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
            this.stash[this.turn]--;
            who = this.turn;
        } else {
            this.stackCount[from]--;
            who = this.stackTop[from]--;
        }
        this.stackCount[to]++;
        this.stackTop[to] = who;
        this.stackCanPop[to] = false;
        this.updateViewModel();
        this.refreshView();
    }
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