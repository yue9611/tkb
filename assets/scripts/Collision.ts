// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CollisType } from "./Enum";


class DataCollis {
    y: number[] = [0, 0];
    //x-z坐标系点
    dot: Dot[] = [];
    type: CollisType = null;
    func: Function;
    tag: any;
    node: any;
    ID: number;
    _baseDot: Dot[] = [new Dot(0.5, 0.5), new Dot(0.5, -0.5), new Dot(-0.5, -0.5), new Dot(-0.5, 0.5)];
    constructor() {
        this.resetY_Dot();
    }
    resetY_Dot() {
        this.y = [0, 0];
        this.dot = [new Dot(0.5, 0.5), new Dot(0.5, -0.5), new Dot(-0.5, -0.5), new Dot(-0.5, 0.5)];
    }
    setY(mean: number, leng: number) {
        this.y[0] = mean - leng / 2;
        this.y[1] = mean + leng / 2;
    }
}

export default class Collision {
    private static motionlessBox: DataCollis[] = [];
    private static motionBox: DataCollis[] = [];
    private static collisEvent: {
        one: DataCollis,
        two: DataCollis,
        oneDot: number[],
        twoDot: number[],
    }[] = [];
    private static nextId: number = 0;
    static on(type: CollisType, node: any, func: Function, tag: any) {
        if (node != null) {
            let newdata = new DataCollis;
            newdata.ID = this.nextId++;
            newdata.type = type;
            newdata.node = node;
            newdata.tag = tag;
            newdata.func = func;
            if (type == CollisType.quiet) {
                this.dataUp(newdata);
                this.motionlessBox.push(newdata);
            }
            if (type == CollisType.mobile) {
                this.motionBox.push(newdata);
            }
        } else {
            console.log("注册失败，节点为空");
        }
    }
    //更新某一碰撞结构的数据，静态体仅注册时更新一次，动态物体每次检测前更新
    static dataUp(data: DataCollis) {
        if (data.node) {//旋转-》缩放-》转换
            data.resetY_Dot();
            let node = data.node;
            let leng = data.dot.length;
            let yAndScale = new Dot(0, 1);
            while (node.name != "Canvas") {
                let scale = new Dot(node.scaleX, node.scaleZ);
                let angle = node.eulerAngles.y;
                let coord = new Dot(node.x, node.z);
                for (let i = 0; i < leng; i++) {
                    //节点旋转
                    this.vectorRotate(data.dot[i], angle);
                    //节点缩放
                    this.vectorScale(data.dot[i], scale);
                    //节点转换（坐标系转换）
                    data.dot[i].addself(coord);
                }
                yAndScale.x *= node.scaleY;
                yAndScale.x += node.y;
                yAndScale.y *= node.scaleY;
                node = node.parent;
            }
            data.setY(yAndScale.x, yAndScale.y);
        } else {
            console.log("'DataCollis' is null.");
        }
    }
    static update(dt) {
        //更新动态数据
        for (let i = 0; i < this.motionBox.length; i++) {
            this.dataUp(this.motionBox[i]);
        }
        //扫描碰撞事件
        this.stepDetection();
        //碰撞事件处理
        this.eventManage();
    }
    //全扫描（静态之间不扫描）
    static stepDetection() {
        let lengM = this.motionBox.length;
        let lengML = this.motionlessBox.length;
        for (let i = 0; i < lengM; i++) {
            for (let j = i + 1; j < lengM; j++) {
                this.judgeColli(this.motionBox[i], this.motionBox[j]);
            }
            for (let j = 0; j < lengML; j++) {
                this.judgeColli(this.motionBox[i], this.motionlessBox[j]);
            }
        }
    }
    //事件处理，调用回调
    static eventManage() {
        while (this.collisEvent.length > 0) {
            let event = this.collisEvent.pop();
            event.one.func.call(event.one.tag);
            event.two.func.call(event.two.tag);
        }
    }


    //两个碰撞体检测，碰撞时调用相关函数
    static judgeColli(one: DataCollis, two: DataCollis) {
        if (one.y[1] < two.y[0] || one.y[0] > two.y[1]) {

        } else {
            let lengo = one.dot.length;
            let lengt = two.dot.length
            for (let i = 0; i < lengo; i++) {
                let flag = this.dotInPolygon(one.dot[i], two.dot);
                if (flag) {
                    let data = {
                        me: one,
                        it: two,
                        dotIndex: i,
                    }
                    this.eventOn(data);
                }
            }
            for (let i = 0; i < lengt; i++) {
                let flag = this.dotInPolygon(two.dot[i], one.dot);
                if (flag) {
                    let data = {
                        me: two,
                        it: one,
                        dotIndex: i,
                    }
                    this.eventOn(data);
                }
            }
        }

    }
    static eventOn(data: {
        me: DataCollis;
        it: DataCollis;
        dotIndex: number;
    }) {
        let flag: boolean = false;
        for (let i = 0; i < this.collisEvent.length; i++) {
            let DC = this.collisEvent[i];
            if (data.me.ID == DC.one.ID && data.it.ID == DC.two.ID) {
                DC.oneDot.push(data.dotIndex);
                flag = true;
                break;
            } else if (data.me.ID == DC.two.ID && data.it.ID == DC.one.ID) {
                DC.twoDot.push(data.dotIndex);
                flag = true;
                break;
            }
        }
        if (!flag) {
            this.collisEvent.push({
                one: data.me,
                two: data.it,
                oneDot: [data.dotIndex],
                twoDot: [],
            });
        }
    }


    static dotInPolygon(dot: Dot, polygon: Dot[]): boolean {
        let flag = false;
        let leng = polygon.length;
        for (let i = 0, last = leng - 1; i < leng; last = i, i++) {
            //点在顶点
            if (dot.equa(polygon[i])) {
                return true;
            }
            //点在边上或内部
            if ((polygon[i].y >= dot.y && polygon[last].y < dot.y) || (polygon[i].y <= dot.y && polygon[last].y > dot.y)) {
                let x = (((dot.y - polygon[i].y) * (polygon[last].x - polygon[i].x)) / (polygon[last].y - polygon[i].y)) + polygon[i].x;
                if (x > dot.x) {
                    flag = !flag;
                } else if (x == dot.x) {
                    return true;
                }
            } else if (polygon[i].y == polygon[last].y && dot.y == polygon[i].y) {//点在水平线段上
                if ((dot.x >= polygon[i].x && dot.x < polygon[last].x) || dot.x <= polygon[i].x && dot.x > polygon[last].x) {
                    return true;
                } else if (dot.x < polygon[i].x) {
                    flag = !flag;
                }
            }
        }
        return flag;
    }
    static angleToRad(angle: number): number {
        if (angle != null) {
            while (Math.abs(angle) > 180) {
                angle -= angle / Math.abs(angle) * 360;
            }
            return angle * Math.PI / 180;
        } else {
            console.log("angle is 'null',error!");
        }
    }
    static radToAngle(rad: number): number {
        if (rad != null) {
            while (Math.abs(rad) > Math.PI) {
                rad -= rad / Math.abs(rad) * Math.PI;
            }
            return rad * 180 / Math.PI;
        } else {
            console.log("rad is 'null',error!");
        }
    }
    /**x-y坐标系中向量vector以x轴向y轴偏转angle（弧度制需设置第三参数为true）后结果 */
    static vectorRotate(vector: Dot, angle: number, isRad: boolean = false): Dot {
        //角度转换为弧度，便于三角运算
        if (!isRad) {
            angle = this.angleToRad(angle);
        }
        //向量转变为x-y坐标系，便于旋转计算
        let v0 = new Dot(vector.x, -vector.y,);
        //旋转运算

        vector.x = v0.x * Math.cos(angle) - v0.y * Math.sin(angle);
        vector.y = v0.x * Math.sin(angle) + v0.y * Math.cos(angle);
        //返回转化为原来x-z坐标系的向量
        vector.y *= -1;
        return vector;
    }
    static vectorScale(vector: Dot, scale: Dot): Dot {
        if (vector != null && scale != null) {
            vector.x *= scale.x;
            vector.y *= scale.y;
        }
        return vector;
    }
}
export class Dot {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    equa(dot: Dot): boolean {
        if ((this.x == dot.x) && (this.y == dot.y)) {
            return true;
        }
        return false;
    }
    addself(dot: Dot) {
        if (dot != null) {
            this.x += dot.x;
            this.y += dot.y;
        } else {
            console.log("dot is null");
        }
    }
}