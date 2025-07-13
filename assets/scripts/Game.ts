import { _decorator, Component, LabelComponent, Node, sys } from "cc";
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

    private userData: any = null;

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
        this.txtLv.string = lv + "x" + lv;
        this.txtScore.string = this.userData.score.toString();
        this.txtBestScore.string = this.userData.bestScore + "";
        this.txtBack.string = "撤回(" + this.userData.backNum + ")";
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
