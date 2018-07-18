export interface movingAttr {
    moveX: Function,
    moveY: Function
}

export default interface Hero {
    posX: number,
    posY: number,
    targetPosX: number
    targetPosY: number
    isMoving: boolean
    velocityX: number
    velocityY: number
    draw: Function
    movingAttr: movingAttr 
};