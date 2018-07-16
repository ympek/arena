var GraphicsEngine = (function () {
    var canvas = document.getElementById("arena-canvas");
    var ctx = canvas.getContext('2d');

    var activeAnimations = [];

    var players = [];

    var FPS = 60;
    var currFps = 60;
    var frameCount = 0;
    var timeToUpdateFps = false;

    var playerHero = { // any hero needs a structure like this.
        posX: 600,
        posY: 400,
        isMoving: false,
        targetPosX: 600,
        targetPosY: 400,

        velocityX: 8,
        velocityY: 8,

        draw: function () {
            ctx.fillStyle = '#e267d3';
            ctx.fillRect(this.posX, this.posY, 32, 32);
            // console.log('draw', this.posX, this.posY);
        }
    };

    var bg = {
        loaded: false
    };

    var run = function () {
        var CELL_SIZE = 32;
        var CANVAS_W = document.body.clientWidth;
        var CANVAS_H = document.body.clientHeight;
        // canvas.width = canvas.style.width;
        // canvas.height = canvas.style.height;
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        var cellsInRow = CANVAS_W / CELL_SIZE;
        var cellsInColumn = 10;
        for (var i = 0; i < cellsInColumn; i++) {
            for (var j = 0; j < cellsInRow; j++) {
                ctx.fillStyle = getRandomColorHex();
                ctx.fillRect(CELL_SIZE * j, CELL_SIZE * i, CELL_SIZE, CELL_SIZE);
            }
        }

        console.log('image not loaded');
        var image = document.getElementById('bg00');
        console.log("Duh", image);

        image.onload = function () {
            bg.loaded = true;
            bg.draw = function () {
                ctx.drawImage(document.getElementById('bg00'), 0, 0);
            };
        };

        window.onresize = handleWindowResize;
        document.onkeydown = handleKeyPress;
        canvas.oncontextmenu = handleRightClick;

        setInterval(function () {
            timeToUpdateFps = true;
        }, 1000);

        window.requestAnimationFrame(tick);
    };

    var drawFps = function () {
        ctx.fillStyle = "blue";
        ctx.font = "30px Arial";
        ctx.fillText("fps: " + currFps, 10, 30);
    };

    var updatePlayer = function () {
        if (playerHero.isMoving) {
            playerHero.movingAttr.moveX();
            playerHero.movingAttr.moveY();
            // i sprawdzanie konca

        }
    };


    var tick = function () {
        ++frameCount;

        // draw bg
        if (bg.loaded) {
            bg.draw();
        }
        // I can assume that players[0] will be current player? or no?

        playerHero.draw();

        updatePlayer();
        updateAnimations();

        updateAndDrawFps();

        window.requestAnimationFrame(tick);
    };

    var updateAnimations = function () {
        activeAnimations.forEach(function (anim, index) {
            anim.draw();
            anim.framesTillDone--;
            if (anim.framesTillDone <= 0) {
                delete activeAnimations[index]; // delete does not reorder elements or update length. I think i want this, but not sure.
            }
        });
    };

    var updateAndDrawFps = function () {
        if (timeToUpdateFps) {
            timeToUpdateFps = false;
            currFps = frameCount;
            frameCount = 0;
        }
        drawFps();
    };

    var handleWindowResize = function (ev) {
        console.log("handleResize");
        console.log(CANVAS_H, CANVAS_W);
        // TODO: implement.
    };

    var playClickAnimation = function (posX, posY) {
        // so this is animation like in Warcraft
        // three arrows or sth. Show the target point for a while.
        // its actually enqueue this animation.
        ctx.fillStyle = 'green';
        ctx.fillRect(posX, posY, 32, 32);

        activeAnimations.push({
            id: 'clickTarget',
            framesTillDone: 30,
            draw: function () {
                // console.log('fr', this.framesTillDone)
                ctx.fillStyle = 'green';
                if (this.framesTillDone % 4 == 0) {
                    ctx.fillRect(posX, posY, 32, 32);
                }
            }
        });
    };

    var handleRightClick = function (ev) {
        ev.preventDefault();
        console.log("right click");
        var mousePos = getMousePos(ev);

        playClickAnimation(mousePos.x, mousePos.y);

        playerHero.targetPosX = mousePos.x;
        playerHero.targetPosY = mousePos.y;

        playerHero.isMoving = true; // is this bool neccessary 

        var movingAttr = {}; // wektor
        var tx = playerHero.targetPosX - playerHero.posX;
        var ty = playerHero.targetPosY - playerHero.posY;
        var distance = Math.sqrt(tx * tx + ty * ty);
        var thrust = 3;
        playerHero.velocityX = (tx / distance) * thrust;
        playerHero.velocityY = (ty / distance) * thrust;
        if (playerHero.posX > playerHero.targetPosX) {

            movingAttr.moveX = function () {
                playerHero.posX += playerHero.velocityX;

                if (playerHero.posX <= playerHero.targetPosX) {
                    playerHero.isMoving = false;
                }
            }
        } else if (playerHero.posX < playerHero.targetPosX) {

            movingAttr.moveX = function () {
                playerHero.posX += playerHero.velocityX;
                if (playerHero.posX >= playerHero.targetPosX) {
                    playerHero.isMoving = false;
                }
            }
        }
        //y
        if (playerHero.posY > playerHero.targetPosY) {

            movingAttr.moveY = function () {
                playerHero.posY += playerHero.velocityY;
                if (playerHero.posY <= playerHero.targetPosY) {
                    playerHero.isMoving = false;
                }
            }
        } else if (playerHero.posY < playerHero.targetPosY) {
            movingAttr.moveY = function () {

                playerHero.posY += playerHero.velocityY;
                if (playerHero.posY >= playerHero.targetPosY) {
                    playerHero.isMoving = false;
                }
            }
        }

        playerHero.movingAttr = movingAttr;
    };

    var getMousePos = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }


    var handleKeyPress = function (ev) {
        // console.log(ev.keyCode, ev);
        switch (ev.keyCode) {
            case 37: handleArrowLeft(); break;
            case 38: handleArrowUp(); break;
            case 39: handleArrowRight(); break;
            case 40: handleArrowDown(); break;
        }
    };

    var handleArrowLeft = function (ev) {
        console.log('going left');
    };

    var handleArrowRight = function (ev) {
        console.log('going right');
    };

    var handleArrowDown = function (ev) {
        console.log('going down');
    };

    var handleArrowUp = function (ev) {
        console.log('going up');
    };

    var getRandomColorHex = function () {
        var options = "0123456789ABCDEF";
        var ret = "#";
        while (ret.length < 7) {
            // losujmy miedzy 0 a 15
            var num = Math.floor(Math.random() * 16 - 1);
            ret += options[num];
        }
        return ret;
    };

    var addPlayer = function (posX, posY) {
        console.log('Adding player at position: ', posX, posY);
        playerHero.posX = posX;
        playerHero.posY = posY;
    };

    return {
        run: run,

        addPlayer: addPlayer
    }
})();
