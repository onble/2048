import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Game")
export class Game extends Component {
    @property(Node)
    startPanel: Node = null!;
    @property(Node)
    gamePanel: Node = null!;
    @property(Node)
    overPanel: Node = null!;

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

    // 点击事件
    private onBtnStartClick() {
        this.initPanel();
        this.gamePanel.active = true;
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
