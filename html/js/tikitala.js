var board = {
    chipFaceNone : $('#chipface-none').clone(),
    chipFace0 : $('#chipface-0').clone(),
    chipFace1 : $('#chipface-1').clone(),
    start : function () {
        this.stash = [8, 8];
        this.stackCount = [ 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.stackTop =   [-1,-1,-1,-1,-1,-1,-1,-1,-1];
        stackLock = [false,false,false,false,false,false,false,false,false];

        for (let i = 1; i <= 9; i++) {
        }
        this.updateViewModel();
        this.refreshView();
    },
    updateViewModel : function () {
        $('#hidden-0-0').removeClass().addClass('tall-'+this.stash[0]);
        $('#hidden-0-1').removeClass().addClass('tall-'+this.stash[1]);

        if (this.stash[0] > 0) {
            $('#visible-0-0').removeClass().addClass('top-chip-0');
        } else {
            $('#visible-0-0').removeClass().addClass('top-chip-none');
        }

        if (this.stash[1] > 0) {
            $('#visible-0-1').removeClass().addClass('top-chip-1');
        } else {
            $('#visible-0-1').removeClass().addClass('top-chip-none');
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
    clear : function () {
    }
}

function pileUp(quantity) {
    var output = '';
    for (let index = 0; index < quantity; index++) {
        output += '<div class="stack"></div>';
    }
    return output;
}
    
function startGame() {
    board.start();
}