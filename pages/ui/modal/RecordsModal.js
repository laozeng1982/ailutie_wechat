/**
 * modal控制器
 * 接收主控页面的实例作为输入
 * 响应用户控制Modal的操作，包括关闭，确定等
 * 只在确认增加、修改时，返回对应的Movement，或者删除的Movement ID
 * 所有对最终数据的操作，都放到主控页面中
 */

import util from '../../../utils/util.js'
import Controller from '../../../utils/Controller.js'
import Movement from '../../../datamodel/Movement.js'
import RecordFactory from '../../../datamodel/RecordFactory.js'

const app = getApp();
const CONTROLLER = new Controller.Controller();

class RecordsModal {

    constructor() {
        // 初始化一个缓存，用来存放Modal编辑的动作
        this.buffMovement = new Movement.Movement();

        // 临时变量，在修改时，存取上一次的动作数据汇总（Amount）
        this.tmpMovement = new Movement.Movement();

        // 3D 数组，用来存放动作次数、重量和评分
        this.movementScoreMultiArray = app.globalData.movementScoreMultiArray;
        // 数量选择索引
        this.multiScoreNoIndex = [7, 4, 6];

        this.totalScoreArray = app.globalData.totalScoreArray;
        this.totalScoreIndex = 6;
    }


    /**
     * 通过host来初始化buffMovement，用来存放准备编辑的动作
     * 接收movement的同时，根据movement来设置Picker的值
     */
    setBuffMovement(movement, host) {
        console.log("in setBuffMovement, movement: ", movement);
        this.buffMovement.fullCopyFrom(movement);
        console.log("in setBuffMovement, this.buffMovement: ", this.buffMovement);
        this.tmpMovement.fullCopyFrom(movement);
        this.setPickerIndex(movement, host);
    }

    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove() {
    }

    /**
     * 隐藏模态对话框
     */
    hideModal(e, host) {
        host.setData({
            showMvScoreModal: false
        });
    }

    /**
     * 对话框取消按钮点击事件
     */
    cancel(e, host) {
        this.hideModal(e, host);
    }

    /**
     * 对话框确认按钮点击事件，处理添加或修改业务
     */
    confirm(e, host) {
        // 缓存回去
        this.tmpMovement.fullCopyFrom(this.buffMovement);
        console.log("in confirm, this.buffMovement: ", this.buffMovement);
        var finished = 0;
        for (var item of this.buffMovement.contents.details) {
            // console.log("item, ", item);
            if (item.groupFeeling > 0) {
                finished++;
            }
        }
        console.log("finished!!!!!!!!!!!!", finished);
        this.buffMovement.contents.curFinishedGpCount = finished;

        // 保存，save
        CONTROLLER.modifyMovement(this.buffMovement, true, host);

        this.hideModal(e, host);

    }


    /**
     * 数字选择Picker监听
     */
    numberChange(e, host) {

        console.log('in numberChange, picker发送选择改变，携带值为', e.detail.value);
        console.log(e);

        // 选中动作的序号
        var selectedMvIndex = e.currentTarget.id - 1;
        // 选中数据的索引
        var selectedRowArr = e.detail.value;
        console.log("in numberChange, selectedMvIndex", selectedMvIndex);
        this.buffMovement.contents.details[selectedMvIndex].actualCount = this.movementScoreMultiArray[0][selectedRowArr[0]];
        this.buffMovement.contents.details[selectedMvIndex].actualWeight = this.movementScoreMultiArray[1][selectedRowArr[1]];
        this.buffMovement.contents.details[selectedMvIndex].groupFeeling = this.movementScoreMultiArray[2][selectedRowArr[2]];

        console.log("in numberChange, this.buffMovement ", this.buffMovement);
        this.updateToHost(host);
        console.log(
            '次数：', this.buffMovement.contents.details[selectedMvIndex].actualCount, ', ',
            '重量：', this.buffMovement.contents.details[selectedMvIndex].actualWeight, ', ',
            '分数：', this.buffMovement.contents.details[selectedMvIndex].groupFeeling);
    }

    scoreChange(e, host) {
        console.log('in numberChange, picker发送选择改变，携带值为', e.detail.value);
        console.log(e);

        // 选中动作的序号
        var selectedMvIndex = e.currentTarget.id - 1;
        // 选中数据的索引
        var selectedRowArr = e.detail.value;
        console.log("in numberChange, selectedMvIndex", selectedMvIndex);
        this.buffMovement.contents.mvFeeling = this.totalScoreArray[selectedRowArr[0]];

        console.log("in numberChange, this.buffMovement ", this.buffMovement);
        this.updateToHost(host);
        console.log('分数：', this.buffMovement.contents.mvFeeling);
    }

    /**
     *
     */
    setSeperatingSelect(e, host) {

        // console.log(e);
        //点一次就反置，逻辑搞简单点
        this.buffMovement.controller.seperateMake = !this.buffMovement.controller.seperateMake;

        this.updateToHost(host);

        console.log(this.buffMovement.contents.planGpCount);

        var abc = this.buffMovement.contents.planGpCount;
        this.setAmount(abc, host);

        console.log("seperateMake: ", this.buffMovement.seperateMake);
    }


    /**
     * 根据当前选中的数据，设置动作索引，方便用户根据历史选择
     */
    setPickerIndex(movement, host) {
        var partName, movementName, gCount, mCount, mWeight;
        gCount = movement.contents.planGpCount;
        mCount = movement.contents.details[0].planCount;
        mWeight = movement.contents.details[0].planWeight;
        var partIdx;  // 部位索引
        var movementIndx; // 动作索引
        var gCountIdx;  // 组数索引
        var mCountIdx;  // 次数索引
        var mWeightIdx; // 重量索引

        // 置索引

        // 组数，次数和重量
        for (var idx = 0; idx < this.movementScoreMultiArray[0].length; idx++) {
            if (gCount <= this.movementScoreMultiArray[0][0]) {
                // 重量小于起始重量，索引设置到头上
                gCountIdx = 0;
                break;
            } else if (gCount === this.movementScoreMultiArray[0][idx]) {
                // 正好相等，索引就是idx
                console.log("match", gCount);
                gCountIdx = idx;
                break;
            } else if (gCount >= this.movementScoreMultiArray[0][this.movementScoreMultiArray[0].length - 1]) {
                // 大于最大索引

            }
        }

        for (var idx = 0; idx < this.movementScoreMultiArray[0].length; idx++) {
            if (this.movementScoreMultiArray[0][idx] === gCount) {
                console.log("match", gCount);
                gCountIdx = idx;
            }
        }

        //暂时手动置在中间
        this.multiMovementNoIndex = [5, 6, 8];

        this.updateToHost(host);
    }

    /**
     * 检查输入的合法性
     */
    checkParameter(host) {
        // 部位不能为空
        if (typeof (this.buffMovement.mvInfo.partName) == "undefined" || this.buffMovement.mvInfo.partName == '') {
            util.showToast('请选择部位...', host, 2000);
            return false;
        }

        // 动作不能为空
        if (typeof (this.buffMovement.mvInfo.mvName) == "undefined") {
            util.showToast('请选择动作...', host, 2000);
            return false;
        }
        // 动作组数不能为空或0
        if (typeof (this.buffMovement.contents.planGpCount) == "undefined" ||
            this.buffMovement.contents.planGpCount <= 0) {
            util.showToast('动作组数不能为空或0...', host, 2000);
            return false;
        }

        // 次数为数组，肯定不会是undefined，要判断数组中每个是不是空
        for (var item of this.buffMovement.contents.details) {
            if (typeof (item.planCount) == "undefined" ||
                item.planCount <= 0) {
                util.showToast('动作次数不能为空或0...', host, 2000);
                return false;
            }
        }

        // 重量为数组，肯定不会是undefined，要判断数组中每个是不是空
        for (var item of this.buffMovement.contents.details) {
            if (typeof (item.planWeight) == "undefined" ||
                item.planWeight <= 0) {
                util.showToast('动作重量不能为空或0...', host, 2000);
                return false;
            }
        }

        return true;
    }

    /**
     * 更新主页面Modal数据，否则Modal界面不能刷新
     */
    updateToHost(host) {
        host.setData({
            MVSCOREMODAL: host.data.MVSCOREMODAL
        });
    }
}


module.exports = {
    RecordsModal: RecordsModal
}