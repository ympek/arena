import { movingAttr } from './interface/IHero';
import Animation from './interface/Animation';
import Hero from './Hero';

// important things from global scope
// * window
// * document
// * console

export default function GraphicsEngine(canvasToAttachItselfTo : HTMLCanvasElement) {
    const canvas = canvasToAttachItselfTo;
    const ctx = canvas.getContext("2d")!;

    let currentPlayerId = -1;

    let heroes: Hero[] = [];

    let activeAnimations: Animation[] = [];

    // FPS section
    let currFps = 0;
    let frameCount = 0;
    let timeToUpdateFps = false;

    const getCurrentHero = function () {
        return heroes[0];
    };

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
        window.requestAnimationFrame(tick);
    };


    const loadImages = function () {
        // this is to change TODO
        let image = <HTMLImageElement>document.getElementById('bg00');
        console.log("Duh", image);
        image.onload = function () {
            console.log("Background loaded. Could not be visible, cant find out why.");
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
        // if (heroes[0].isMoving) {
        //     heroes[0].movingAttr.moveX();
        //     heroes[0].movingAttr.moveY();
        //     // i sprawdzanie konca
        // }
    };

    var tick = function () {
        // w sumie od arka bede mial zawsze dokladna pozycje - nie porzebuje
        // velocity i tym podobnych - to jest dobrze.
        if (heroes[0]) {
            ++frameCount;

            // draw bg
            if (bg.loaded) {
                ctx.drawImage(<HTMLImageElement>document.getElementById('bg00'), 0, 0);
            }

            heroes.forEach((hero) => {
                hero.draw();
            })

            updatePlayer();
            updateAnimations();

            updateAndDrawFps();
        }

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

    const noop = function () { };


    var handleRightClick = function (mousePos) {
        console.log("right click");

        playClickAnimation(mousePos.x, mousePos.y);

        heroes[0].targetPosX = mousePos.x;
        heroes[0].targetPosY = mousePos.y;

        heroes[0].isMoving = true; // is this bool neccessary 

        var movingAttr: movingAttr = {
            moveX: noop,
            moveY: noop
        }; // wektor
        var tx = heroes[0].targetPosX - heroes[0].posX;
        var ty = heroes[0].targetPosY - heroes[0].posY;
        var distance = Math.sqrt(tx * tx + ty * ty);
        var thrust = 3;
        heroes[0].velocityX = (tx / distance) * thrust;
        heroes[0].velocityY = (ty / distance) * thrust;
        if (heroes[0].posX > heroes[0].targetPosX) {

            movingAttr.moveX = function () {
                heroes[0].posX += heroes[0].velocityX;

                if (heroes[0].posX <= heroes[0].targetPosX) {
                    heroes[0].isMoving = false;
                }
            }
        } else if (heroes[0].posX < heroes[0].targetPosX) {

            movingAttr.moveX = function () {
                heroes[0].posX += heroes[0].velocityX;
                if (heroes[0].posX >= heroes[0].targetPosX) {
                    heroes[0].isMoving = false;
                }
            }
        }

        //y
        if (heroes[0].posY > heroes[0].targetPosY) {

            movingAttr.moveY = function () {
                heroes[0].posY += heroes[0].velocityY;
                if (heroes[0].posY <= heroes[0].targetPosY) {
                    heroes[0].isMoving = false;
                }
            }
        } else if (heroes[0].posY < heroes[0].targetPosY) {
            movingAttr.moveY = function () {

                heroes[0].posY += heroes[0].velocityY;
                if (heroes[0].posY >= heroes[0].targetPosY) {
                    heroes[0].isMoving = false;
                }
            }
        }

        heroes[0].movingAttr = movingAttr;
    };

    var addPlayer = function (id: number, posX: number, posY: number, health: number) {
        console.log('Adding player at position: ', posX, posY);

        console.log("porownanie idkow:", id, currentPlayerId);

        let newHero = new Hero(id, posX, posY, health);

        // adding draw function:
        newHero.draw = function (this: Hero) {
            ctx.fillStyle = 'magenta';
            ctx.fillRect(this.posX, this.posY, 32, 32);
        };

        if (id === currentPlayerId) {
            // needs to be on players[0]
            if (heroes.length === 0) {
                heroes.push(newHero);
                console.log('no co pushuje i co');
                console.log(heroes.length);
            } else {
                heroes.unshift(newHero);
                console.log('co mam shiftowac?');
                console.log(heroes.length);
            }
        } else {
            heroes.push(newHero);
        }
    };

    const saveCurrentPlayerId = function (id: number) {
        if (currentPlayerId == -1) {
            currentPlayerId = id;
        } else {
            console.error("Current player was set up already!");
        }
    };

    const updatePlayerPosition = function(
        id: number, 
        posX: number, 
        posY: number,
        targetPosX: number,
        targetPosY: number,
        speed: number 
    ) {
        // first we need to find proper player idx.
        let i : number = -1;
        for (let hero of heroes) {
            if (hero.id === id) {
                i = id;
                break;
            }
        }

        // our player is heroes[i]. now lets continue
        if (i === -1) {
            console.error("WRong hero ID.")
        } else {
            heroes[i].posX = posX;
            heroes[i].posY = posY;
            heroes[i].targetPosX = targetPosX;
            heroes[i].targetPosY = targetPosY;
            // speed??!!?
        }

        return true;
    };

    return {
        run: run,
        addPlayer: addPlayer,
        adjustCanvasToWindow: adjustCanvasToWindow,
        saveCurrentPlayerId: saveCurrentPlayerId,
        handleRightClick: handleRightClick,
        updatePlayerPosition: updatePlayerPosition
    }
}