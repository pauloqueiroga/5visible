var chip0;
var chip1;
var board = {
    canvas : document.createElement("canvas"),
    start : function () {
        this.canvas.height = 480;
        this.canvas.width = 640;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        chip0.update();
        chip1.update();
    },
    clear : function () {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
}

function startGame() {
    chip0 = new chip(100,100,"0");
    chip1 = new chip(30, 30, "1");
    board.start();
}

function chip(x, y, imageName) {
    this.x = x;
    this.y = y;
    this.image = document.getElementById(imageName);
    this.update = function() {
        c = board.context;
        c.drawImage(this.image, this.x, this.y, 100, 50)
    }
}

