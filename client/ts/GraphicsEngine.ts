import Hero from './interface/Hero';
import { movingAttr } from './interface/Hero';
import Animation from './interface/Animation';

// important things from global scope
// * window
// * document
// * console

export default function GraphicsEngine() {
    const canvas = <HTMLCanvasElement> document.getElementById("arena-canvas");
    const ctx = canvas.getContext("2d")!;
    
    let playerHero : Hero = {
        id: -1,
        posX: 0,
        posY: 0,
        targetPosX: 0,
        targetPosY: 0,
        isMoving: false,
        velocityX: 0,
        velocityY: 0,
        draw: () => {},
        movingAttr: {
            moveX: () => {},
            moveY: () => {}
        } 
    };

    let activeAnimations : Animation[] = [];

    var players = [];

    // FPS section
    let currFps = 0;
    let frameCount = 0;
    let timeToUpdateFps = false;
   
    const drawFps = function () {
        ctx.fillStyle = "blue";
        ctx.font = "30px Arial";
        ctx.fillText("fps: " + currFps, 10, 30);
    };

    const updateFps = function () {
        if (timeToUpdateFps) {
            timeToUpdateFps = false;
            currFps = frameCount;
            frameCount = 0;
        }
    };

    const updateAndDrawFps = function () {
        updateFps();
        drawFps();
    };

    const triggerFpsUpdate = function () {
        timeToUpdateFps = true;
        setTimeout(triggerFpsUpdate, 1000);
    };
    // end fps

    var bg = {
        loaded: false
    };
    var adjustCanvasToWindow = function () {
        console.log("handleResize");
        // TODO: implement.
        var CANVAS_W = document.body.clientWidth;
        var CANVAS_H = document.body.clientHeight;
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;

    };

    const run = function () {
        console.log("Running!");
        adjustCanvasToWindow();
        // now load images
        // dont really know how to solve this properly,
        // i need a loader of some kind.
        loadImages(); // or load assets?
        triggerFpsUpdate();
        // Come on, start the machine!
        canvas.oncontextmenu = handleRightClick;
        window.requestAnimationFrame(tick);
    };


    const loadImages = function () {
        // this is to change TODO
        let image = <HTMLImageElement> document.getElementById('bg00');
        console.log("Duh", image);
        image.onload = function () {
            console.log("Background loaded.");
            bg.loaded = true;
        };
        // create a generic loader for images. (later)
        // need to check 'complete' property which is true if image is fetched.
        // because i might add onload later and there we have problem.
        if (image.complete) {
            bg.loaded = true;
        }
    };

    var updatePlayer = function () {
        if (playerHero.isMoving) {
            playerHero.movingAttr.moveX();
            playerHero.movingAttr.moveY();
            // i sprawdzanie konca

        }
    };

    var tick = function () {
        // w sumie od arka bede mial zawsze dokladna pozycje - nie porzebuje
        // velocity i tym podobnych - to jest dobrze.
        ++frameCount;

        // draw bg
        if (bg.loaded) {
            ctx.drawImage(<HTMLImageElement> document.getElementById('bg00'), 0, 0);
        }

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
                // delete does not reorder elements or update length. I think i want this, but not sure.
                delete activeAnimations[index]; 
            }
        });
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

    const noop = function () {};

    
    var handleRightClick = function (ev) {
        ev.preventDefault();
        console.log("right click");
        var mousePos = getMousePos(ev);

        playClickAnimation(mousePos.x, mousePos.y);

        playerHero.targetPosX = mousePos.x;
        playerHero.targetPosY = mousePos.y;

        playerHero.isMoving = true; // is this bool neccessary 

        var movingAttr : movingAttr = {
            moveX: noop,
            moveY: noop
        }; // wektor
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

    var addPlayer = function (id : number, posX : number, posY : number) {
        console.log('Adding player at position: ', posX, posY);
        playerHero.id = id;
        playerHero.posX = posX;
        playerHero.posY = posY;

        // adding draw function:
        playerHero.draw = function(this: Hero) {
            ctx.fillStyle = 'magenta';
            ctx.fillRect(this.posX, this.posY, 32, 32);
        };
    };

    return {
        run: run,
        addPlayer: addPlayer,
        adjustCanvasToWindow: adjustCanvasToWindow
    }
}