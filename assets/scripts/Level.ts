// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Scene from "./Scene";
import Player, { SportState } from "./Player";
import Collision, { Dot } from "./Collision";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level extends cc.Component {
    scene: Scene = null;
    player: Player = null;
    init() {
        this.scene = this.node.getChildByName("scene").getComponent(Scene);
        this.scene.init();
        this.player = this.node.getChildByName("player").getComponent(Player);
        this.player.init();
    }

    updateStep(dt) {
        this.collision();
        this.player.updateStep(dt);
    }
    keyDown(e: cc.Event.EventKeyboard) {
        switch (e.keyCode) {
            case cc.macro.KEY.w: {
                this.player.runing = SportState.goAhead;
                break;
            }
            case cc.macro.KEY.a: {
                this.player.rotateing = SportState.leftRotate;
                break;
            }
            case cc.macro.KEY.d: {
                this.player.rotateing = SportState.rightRotate;
                break;
            }
            case cc.macro.KEY.s: {
                this.player.runing = SportState.goBack;
                break;
            }
            case cc.macro.KEY.space: {
                this.player.leap = SportState.jump;
                break;
            }
            default: {
                break;
            }
        }
    }
    keyUp(e: cc.Event.EventKeyboard) {
        switch (e.keyCode) {
            case cc.macro.KEY.w: {
                this.player.runing = SportState.stop;
                break;
            }
            case cc.macro.KEY.a: {
                this.player.rotateing = SportState.stop;
                break;
            }
            case cc.macro.KEY.d: {
                this.player.rotateing = SportState.stop;
                break;
            }
            case cc.macro.KEY.s: {
                this.player.runing = SportState.stop;
                break;
            }
            case cc.macro.KEY.space: {
                this.player.leap = SportState.stop;
                break;
            }
            default: {
                break;
            }
        }
    }
    collision() {

    }

}
