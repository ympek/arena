import IHero from './interface/IHero';
import { movingAttr } from './interface/IHero';

export default class Hero implements IHero {

  constructor(id: number, posX: number, posY: number, health: number) {
    this.id = id;
    this.posX = posX;
    this.posY = posY;
    this.health = health;
    this.targetPosX = 0;
    this.targetPosY = 0;
    this.isMoving = false;
    this.velocityX = 0;
    this.velocityY = 0;
    this.draw = () => { };
    this.movingAttr = {
      moveX: () => { },
      moveY: () => { }
    }
  }

  id: number;
  posX: number;
  posY: number;
  health: number;
  targetPosX: number;
  targetPosY: number; 
  isMoving: boolean;
  velocityX: number;
  velocityY: number;
  draw: Function;
  movingAttr: movingAttr;
}