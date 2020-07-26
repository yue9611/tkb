// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Level from "./Level";
import Collision from "./Collision";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    level: Level = null;

    onLoad() {
        this.level = this.node.getChildByName("level").getComponent(Level);
        this.level.init();
    }
    onEnable() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.keyUp, this);
    }
    onDisable() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.keyUp, this);
    }
    update(dt) {
        this.level.updateStep(dt);
        Collision.update(dt);
    }
    keyDown(e: cc.Event.EventKeyboard) {
        this.level.keyDown(e);
    }

    keyUp(e: cc.Event.EventKeyboard) {
        this.level.keyUp(e);
    }
}
