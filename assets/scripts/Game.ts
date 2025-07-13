import {
    _decorator,
    Component,
    instantiate,
    LabelComponent,
    Node,
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

    private userData: any = null;
    private jiange: number = 0;
    private itemWH: number = 0;
    private itemParentWh: number = 0;
    private array: number[][] = [];

    start() {
        this.initPanel();
        this.startPanel.active = true;
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
        this.startPanel.active = true;
    }

    private onOverBtnRePlayClick() {
        this.overPanel.active = false;
    }

    private onOverBtnHomeClick() {
        this.initPanel();
        this.startPanel.active = true;
    }
}
