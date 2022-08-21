/*
            <table id="placeholders">
                <tbody>
                    <tr>
                        <td class="stack zero-tall"></td>
                        <td class="stack one-tall chip-0"></td>
                        <td class="stack two-tall chip-0"></td>
                    </tr>
                    <tr>
                        <td class="stack three-tall chip-1"></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

*/
var board = {
    start : function () {
        $(".top-chip-none").html('')
        var $chipFace0 = $('#chipface-0').clone()
        var $chipFace1 = $('#chipface-1').clone()
        $(".top-chip-0").html($chipFace0)
        $(".top-chip-1").html($chipFace1)
        $(".zero-tall").html("")
        $(".one-tall").html(pileUp(1))
        $(".two-tall").html(pileUp(2))
        $(".three-tall").html(pileUp(3))
        $(".four-tall").html(pileUp(4))
        $(".five-tall").html(pileUp(5))
        $(".six-tall").html(pileUp(6))
        $(".seven-tall").html(pileUp(7))
        $(".eight-tall").html(pileUp(8))
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