// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Collision from "./Collision";
import { CollisType } from "./Enum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Scene extends cc.Component {
    ground: cc.Node = null;
    box: cc.Node = null;
    init() {
        this.ground = this.node.getChildByName("ground");
        this.box = this.node.getChildByName("box");
        Collision.on(CollisType.quiet, this.ground, this.collisground, this);
        Collision.on(CollisType.quiet, this.box, this.collisbox, this);
    }
    collisground(data: any) {
        console.log("scene-ground collision");
    }
    collisbox(data: any) {
        console.log("scene-box collision");
    }
}
