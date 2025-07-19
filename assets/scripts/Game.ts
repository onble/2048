import {
    _decorator,
    Component,
    EventTouch,
    instantiate,
    LabelComponent,
    Node,
    NodeEventType,
    Prefab,
    sys,
    tween,
    UITransform,
    v2,
    v3,
    Vec2,
    warn,
} from "cc";
import { Tile } from "./Tile";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
    @property(Node)
    startPanel: Node = null!;

    @property(Node)
    gamePanel: Node = null!;

    @property(Node)
    overPanel: Node = null!;

    @property(LabelComponent)
    txtLv: LabelComponent = null!;

    @property(LabelComponent)
    txtScore: LabelComponent = null!;

    @property(LabelComponent)
    txtBestScore: LabelComponent = null!;

    @property(LabelComponent)
    txtBack: LabelComponent = null!;

    @property(Node)
    ndParent: Node = null!;

    @property(UITransform)
    ndParentTransform: UITransform = null!;

    @property(Prefab)
    item: Prefab = null!;

    @property(Prefab)
    itemBg: Prefab = null!;

    private userData: {
        score: number;
        array: number[][];
        arr_histroy: number[][][];
        backNum: number;
        bestScore: number;
        lv: number;
    } = null;
    private jiange: number = 0;
    private itemWH: number = 0;
    private itemParentWh: number = 0;
    private array: number[][] = [];

    private posStart: Vec2;
    private posEnd: Vec2;
    private gameType: number = 0;

    start() {
        this.initPanel();
        this.startPanel.active = true;
        this.addTouch();
    }

    private addTouch() {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onTouchStart(event: EventTouch) {
        if (this.gameType != 1) return;
        this.posStart = event.getLocation();
    }
    private onTouchMove(event: EventTouch) {
        if (this.gameType != 1) return;
    }
    private onTouchEnd(event: EventTouch) {
        if (this.gameType != 1) return;
        this.posEnd = event.getLocation();
        let xx = this.posEnd.x - this.posStart.x;
        let yy = this.posEnd.y - this.posStart.y;
        if (Math.abs(xx) < 10 && Math.abs(yy) < 10) return;
        if (Math.abs(xx) > Math.abs(yy)) {
            if (xx > 0) {
                this.moveItem("you");
                console.log("右移动");
            } else {
                this.moveItem("zuo");
                console.log("左移动");
            }
        } else {
            if (yy > 0) {
                this.moveItem("shang");
                console.log("上移动");
            } else {
                this.moveItem("xia");
                console.log("下移动");
            }
        }
    }

    /**
     * 移动游戏方块并处理合并逻辑
     * @param type 移动方向类型（目前仅实现"you"方向）
     * @description
     * 1. 根据指定方向移动所有可移动方块
     * 2. 相邻相同数字方块会合并并计分
     * 3. 移动后会清理并重新创建所有方块
     * 4. 如果可以移动，会在空白位置生成新方块
     */
    private moveItem(type: string) {
        let canMove: boolean = false;
        let isGetScore: boolean = false;
        switch (type) {
            case "you":
                for (let j = this.array.length - 2; j >= 0; j--) {
                    // i从0开始，j从array.length-2(=3)开始，因为array.length-1是边界，不需要移动
                    for (let i = 0; i < this.array.length; i++) {
                        // k从0开始
                        for (let k = 0; k < this.array.length; k++) {
                            if (
                                // j=3,k=0,1; j=2,k=0,1,2; j=1,k=0,1,2,3;j=0,k=0,1,2,3,4。
                                // && 且取两个连续的方块，靠右的方块为0，靠左的方块有值
                                j + 1 + k < this.array.length &&
                                this.array[i][j + 1 + k] == 0 &&
                                this.array[i][j + k] > 0
                            ) {
                                // i行，最后两个方块，最后一个方块为0，前一个方块不为0->前一个方块变为0，最后一个方块变为前一个方块的值，标记移动过。
                                // i行，最后三个方块，两两从后面取出，然后这两个执行上面逻辑。就是后三个，为0的时候，就被向右移动。
                                // i行，后4个方块。
                                // i行，全部5个方块，进行移动。
                                this.array[i][j + 1 + k] = this.array[i][j + k];
                                this.array[i][j + k] = 0;
                                canMove = true;
                            } else if (
                                // && 且取两个连续的方块，两方块值相等，且不为0；
                                j + 1 + k < this.array.length &&
                                this.array[i][j + 1 + k] == this.array[i][j + k] &&
                                this.array[i][j + k] > 0
                            ) {
                                // i行，最后两个方块，两个方块值相等，右边方块变为2倍，左边方块变为0，标记移动过。
                                // i行，最后三个方块，两两从后面取出，然后这两个执行上面逻辑。就是后三个，有两两相邻相等的，就被向右合并。
                                // i行，后4个方块。
                                // i行，全部5个方块，进行检查合并。
                                this.array[i][j + 1 + k] = this.array[i][j + 1 + k] * 2;
                                this.array[i][j + k] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore(this.array[i][j + 1 + k]);
                            }
                        }
                    }
                }
                break;
            case "zuo":
                for (let j = 1; j < this.array.length; j++) {
                    for (let i = 0; i < this.array[j].length; i++) {
                        for (let k = 0; k < this.array.length; k++) {
                            if (j - 1 - k >= 0 && this.array[i][j - 1 - k] == 0 && this.array[i][j - k] > 0) {
                                // 可以移动
                                this.array[i][j - 1 - k] = this.array[i][j - k];
                                this.array[i][j - k] = 0;
                                canMove = true;
                            } else if (
                                j - 1 - k >= 0 &&
                                this.array[i][j - 1 - k] == this.array[i][j - k] &&
                                this.array[i][j - k] > 0
                            ) {
                                // 可以合成
                                this.array[i][j - 1 - k] = this.array[i][j - 1 - k] * 2;
                                this.array[i][j - k] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore(this.array[i][j - 1 - k]);
                            }
                        }
                    }
                }
                break;
            case "shang":
                for (let i = this.array.length - 2; i >= 0; i--) {
                    for (let j = 0; j < this.array[i].length; j++) {
                        for (let k = 0; k < this.array.length; k++) {
                            if (
                                i + 1 + k < this.array.length &&
                                this.array[i + 1 + k][j] == 0 &&
                                this.array[i + k][j] > 0
                            ) {
                                // 可移动
                                this.array[i + 1 + k][j] = this.array[i + k][j];
                                this.array[i + k][j] = 0;
                                canMove = true;
                            } else if (
                                i + 1 + k < this.array.length &&
                                this.array[i + 1 + k][j] == this.array[i + k][j] &&
                                this.array[i + k][j] > 0
                            ) {
                                // 可以合成
                                this.array[i + 1 + k][j] = this.array[i + 1 + k][j] * 2;
                                this.array[i + k][j] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore(this.array[i + 1 + k][j]);
                            }
                        }
                    }
                }
                break;
            case "xia":
                for (let i = 1; i < this.array.length; i++) {
                    for (let j = 0; j < this.array[i].length; j++) {
                        for (let k = 0; k < this.array.length; k++) {
                            if (i - 1 - k >= 0 && this.array[i - 1 - k][j] == 0 && this.array[i - k][j] > 0) {
                                // 可以移动
                                this.array[i - 1 - k][j] = this.array[i - k][j];
                                this.array[i - k][j] = 0;
                                canMove = true;
                            }
                            if (
                                i - 1 - k >= 0 &&
                                this.array[i - 1 - k][j] == this.array[i - k][j] &&
                                this.array[i - k][j] > 0
                            ) {
                                // 可以合成
                                this.array[i - 1 - k][j] = this.array[i - 1 - k][j] * 2;
                                this.array[i - k][j] = 0;
                                canMove = true;
                                isGetScore = true;
                                this.updateScore(this.array[i - 1 - k][j]);
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
        if (canMove) {
            this.cleanAllItem();
            for (let i = 0; i < this.array.length; i++) {
                for (let j = 0; j < this.array[i].length; j++) {
                    if (this.array[i][j] > 0) {
                        let pos = v2(i, j);
                        this.createItem(pos, this.array[i][j]);
                    }
                }
            }
            this.addRandomArray();
        }
    }
    private onTouchCancel(event: EventTouch) {
        if (this.gameType != 1) return;
    }
    /**
     * 清理所有Tile子节点
     * 从父节点的子节点列表中移除所有带有Tile组件的子节点
     * 注意：从后向前遍历以避免数组索引问题
     */
    private cleanAllItem() {
        let children = this.ndParent.children;
        for (let i = children.length - 1; i > 0; i--) {
            let tile = children[i].getComponent(Tile);
            if (tile) {
                this.ndParent.removeChild(children[i]);
            }
        }
    }

    private updateScore(score: number) {
        this.userData.score += score;
        if (this.userData.score > this.userData.bestScore) {
            this.userData.bestScore = this.userData.score;
        }

        this.txtScore.string = this.userData.score + "";
        this.txtBestScore.string = this.userData.bestScore + "";
        this.saveUserInfo();
    }
    private saveUserInfo() {
        sys.localStorage.setItem("userData", JSON.stringify(this.userData));
    }

    update(deltaTime: number) {}

    private initPanel() {
        this.startPanel.active = false;
        this.gamePanel.active = false;
        this.overPanel.active = false;
    }

    // 初始化
    private init() {
        this.getUserInfo();
        this.updateView();
    }

    // 获取用户信息
    private getUserInfo() {
        this.userData = JSON.parse(sys.localStorage.getItem("userData"));
        if (this.userData == null) {
            this.userData = {
                lv: 5,
                score: 0,
                bestScore: 0,
                array: [],
                arr_histroy: [],
                backNum: 3,
            };
        }
    }

    private updateView() {
        this.gameType = 1;
        let lv = this.userData.lv;
        this.jiange = 5;
        this.itemWH = Math.round(640 / lv);
        this.itemParentWh = this.itemWH * lv + this.jiange * (lv + 1);
        this.ndParentTransform.width = this.itemParentWh;
        this.ndParentTransform.height = this.itemParentWh;
        this.addItemBg(lv);

        this.txtLv.string = lv + "x" + lv;
        this.txtScore.string = this.userData.score.toString();
        this.txtBestScore.string = this.userData.bestScore + "";
        this.txtBack.string = "撤回(" + this.userData.backNum + ")";

        this.initArray(lv);
        this.addRandomArray();
    }

    // 初始化数组
    private initArray(lv: number) {
        this.array = [];
        for (let i = 0; i < lv; i++) {
            this.array[i] = [];
        }

        for (let i = 0; i < lv; i++) {
            for (let j = 0; j < lv; j++) {
                this.array[i][j] = 0;
            }
        }
    }

    // 在空格子上随机添加数字
    private addRandomArray() {
        let arr_0: Vec2[] = [];
        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array[i].length; j++) {
                if (this.array[i][j] == 0) {
                    arr_0.push(v2(i, j));
                }
            }
        }
        if (arr_0.length != 0) {
            let i_random = Math.floor(Math.random() * arr_0.length);
            let ii = arr_0[i_random].x;
            let jj = arr_0[i_random].y;
            let randomNum = Math.random() * 10;
            if (randomNum < 2) {
                this.array[ii][jj] = 4;
            } else {
                this.array[ii][jj] = 2;
            }
            this.createItem(arr_0[i_random], this.array[ii][jj], true);
            this.onCheckOver();
        }
    }

    private createItem(pos: Vec2, num: number, isAction = false) {
        let posStart = v2(
            -this.itemParentWh / 2 + this.itemWH / 2 + this.jiange,
            -this.itemParentWh / 2 + this.itemWH / 2 + this.jiange
        );
        let item = instantiate(this.item);
        let tile = item.getComponent(Tile);
        if (tile) {
            tile.init(num);
        }
        item.parent = this.ndParent;
        let itemTf: UITransform = item.getComponent(UITransform);
        itemTf.width = this.itemWH;
        itemTf.height = this.itemWH;
        let _x = posStart.x + (itemTf.width + this.jiange) * pos.y;
        let _y = posStart.y + (itemTf.height + this.jiange) * pos.x;
        item.position = v3(_x, _y, 0);
        if (isAction) {
            item.scale = v3(0, 0, 0);
            tween(item)
                .to(0.15, { scale: v3(1, 1, 1) }, { easing: "sineInOut" })
                .start();
        }
    }

    addItemBg(lv: number) {
        let posStart = v2(
            -this.itemParentWh / 2 + this.itemWH / 2 + this.jiange,
            -this.itemParentWh / 2 + this.itemWH / 2 + this.jiange
        );
        for (let i = 0; i < lv; i++) {
            for (let j = 0; j < lv; j++) {
                let itemBg = instantiate(this.itemBg);
                itemBg.parent = this.ndParent;
                let itemBgTf: UITransform = itemBg.getComponent(UITransform);
                itemBgTf.width = this.itemWH;
                itemBgTf.height = this.itemWH;
                let posX = posStart.x + (itemBgTf.width + this.jiange) * j;
                let posY = posStart.y + (itemBgTf.height + this.jiange) * i;
                itemBg.position = v3(posX, posY, 0);
            }
        }
    }

    // 点击事件
    private onBtnStartClick() {
        this.initPanel();
        this.gamePanel.active = true;
        this.init();
    }

    private onBtnRePlayClick() {}

    private onBtnBackClick() {}

    private onBtnHomeClick() {
        this.initPanel();
        this.gameType = 0;
        this.startPanel.active = true;
    }

    private onOverBtnRePlayClick() {
        this.overPanel.active = false;
    }

    private onOverBtnHomeClick() {
        this.initPanel();
        this.gameType = 0;
        this.startPanel.active = true;
    }

    private onCheckOver() {
        let isOver = true;
        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array[i].length; j++) {
                if (this.array[i][j] == 0) {
                    isOver = false;
                }
            }
        }

        for (let i = 0; i < this.array.length; i++) {
            for (let j = 0; j < this.array[i].length; j++) {
                if (j + 1 < this.array.length && this.array[i][j] == this.array[i][j + 1]) {
                    // 横向有相邻可合并
                    isOver = false;
                } else if (i + 1 < this.array.length && this.array[i][j] == this.array[i + 1][j]) {
                    // 纵向有相邻可合并
                    isOver = false;
                }
            }
        }

        if (isOver) {
            this.gameType = 2;
            this.overPanel.active = true;
            let gameOverScore = this.userData.score;
            this.userData.score = 0;
            this.userData.array = [];
            this.userData.arr_histroy = [];
            this.userData.backNum = 3;
            this.saveUserInfo();
        } else {
            this.userData.arr_histroy.push(this.array);
            this.userData.array = this.array;
            let len = this.userData.arr_histroy.length - 1;
            if (len > 10) {
                this.userData.arr_histroy.shift();
            }
            if (len > this.userData.backNum) {
                len = this.userData.backNum;
            }
            this.txtBack.string = "撤回(" + len + ")";
            this.saveUserInfo();
        }
    }
}
