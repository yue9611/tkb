import Collision, { CollisType } from "./Collision";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    //NV
    normalVector: cc.Vec2 = cc.v2();
    speed: number = 2;
    speedR: number = 2;
    originaDirec: cc.Vec3 = cc.v3(0, 0, -1);
    runing: SportState = SportState.stop;
    rotateing: SportState = SportState.stop;
    leap: SportState = SportState.stop;
    jumpData = {
        _canJump: false,
        _jumping: false,
        _jumpSpeed: 200,
        _nowYSpeed: 0,
        _a: 320,
    }
    init() {
        this.node.setPosition(cc.v3(0, 100, 0));
        this.resetNV();
        Collision.on(CollisType.mobile, this.node, this.collis, this);
    }
    updateStep(dt) {
        this.resetNV();
        this.sport(dt);
    }
    resetNV() {
        this.normalVector = this.vectorRotate(this.originaDirec, this.node.eulerAngles.y);
    }
    collis(data: any) {
        // console.log(data);
        console.log("player collising");
    }
    sport(dt) {
        //前后运动
        switch (this.runing) {
            case SportState.goAhead: {
                this.goAhead();
                break;
            }
            case SportState.goBack: {
                this.goBack();
                break;
            }
            default: {
                break;
            }
        }
        //左右旋转
        switch (this.rotateing) {
            case SportState.leftRotate: {
                this.turnToL();
                break;
            }
            case SportState.rightRotate: {
                this.turnToR();
                break;
            }
            default: {
                break;
            }
        }
        //上下跳动
        this.jump(dt);
    }
    //前进
    goAhead() {
        this.node.x += this.normalVector.x * this.speed;
        this.node.z += this.normalVector.y * this.speed;
    }
    //后退
    goBack() {
        this.node.x -= this.normalVector.x * this.speed;
        this.node.z -= this.normalVector.y * this.speed;
    }
    jump(dt) {
        if (this.leap == SportState.jump) {
            this.leap = SportState.stop;
            if (this.jumpData._canJump) {
                this.jumpData._nowYSpeed = this.jumpData._jumpSpeed;
                this.jumpData._jumping = true;
            }
        }
        if (this.jumpData._jumping) {
            this.node.y += this.jumpData._nowYSpeed * dt;
            this.jumpData._nowYSpeed -= this.jumpData._a * dt;
        }
        if (this.node.y <= 0) {
            this.jumpData._canJump = true;
            this.node.y = 0;
            this.jumpData._nowYSpeed = 0;
            this.jumpData._jumping = false;
        } else {
            this.jumpData._canJump = false;
            this.jumpData._jumping = true;
        }
    }
    //左转
    turnToL() {
        this.node.eulerAngles = cc.v3(0, this.node.eulerAngles.y + this.speedR, 0);
    }
    //右转
    turnToR() {
        this.node.eulerAngles = cc.v3(0, this.node.eulerAngles.y - this.speedR, 0);
    }
    angleToRad(angle: number): number {
        if (angle != null) {
            while (Math.abs(angle) > 180) {
                angle -= angle / Math.abs(angle) * 360;
            }
            return angle * Math.PI / 180;
        } else {
            console.log("angle is 'null',error!");
        }
    }
    radToAngle(rad: number): number {
        if (rad != null) {
            while (Math.abs(rad) > Math.PI) {
                rad -= rad / Math.abs(rad) * Math.PI;
            }
            return rad * 180 / Math.PI;
        } else {
            console.log("rad is 'null',error!");
        }
    }
    vectorRotate(vector: cc.Vec3, angle: number, isRad: boolean = false): cc.Vec2 {
        //角度转换为弧度，便于三角运算
        if (!isRad) {
            angle = this.angleToRad(angle);
        }
        //向量转变为x-y坐标系，便于旋转计算
        let v0 = cc.v2(vector.x, -vector.z,);
        //旋转运算
        let v = cc.v2();
        v.x = v0.x * Math.cos(angle) - v0.y * Math.sin(angle);
        v.y = v0.x * Math.sin(angle) + v0.y * Math.cos(angle);
        //返回转化为原来坐标系的向量
        return cc.v2(v.x, -v.y);
    }
}
export enum SportState {
    "begin" = 0,
    "stop",
    "goAhead",
    "goBack",
    "leftRotate",
    "rightRotate",
    "jump",
}
