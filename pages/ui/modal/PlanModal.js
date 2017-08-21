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

var app = getApp()

class PlanModal {

    constructor() {
        // 初始化一个缓存，用来存放Modal编辑的动作
        this.buffMovement = new Movement.Movement();

        // 临时变量，在修改时，存取上一次的动作数据汇总（Amount）
        this.tmpMovement = new Movement.Movement();

        this.initBuffAndTmp();

        this.Controller = new Controller.Controller();

        // 2D 数组，用来存放动作
        this.movementMultiArray = app.globalData.movementMultiArray;
        // 动作索引
        this.multiMovementIndex = [0, 0];

        // 3D 数组，用来存放动作组数，次数和重量
        this.movementNoMultiArray = app.globalData.movementNoMultiArray;
        // 数量选择索引
        this.multiMovementNoIndex = [0, 0, 0];
    }

    initBuffAndTmp(host) {
        this.buffMovement.contents.planGpCount = 6;
        this.buffMovement.contents.details = [];
        for (var idx = 0; idx < this.buffMovement.contents.planGpCount; idx++) {
            //新建单条，加入列表中
            var record = new RecordFactory.DetailRecord(idx + 1, 10, 30, 0, 0,
                app.system.userConfig.measurement);

            this.tmpMovement.contents.details.push(record);
            this.buffMovement.contents.details.push(record);
        }
        // this.updateToHost(host);
        console.log("in initBuffAndTmp, this.buffMovement: ", this.buffMovement);
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
            showModal: false
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
        console.log("in confirm, this.buffMovement: ", this.buffMovement);
        if (host.data.actionName === "修改动作") {
            // this.buffMovement.mvId = host.data.curSelectedMovementId;
            // this.updateToHost(host);
            // console.log("host.data.curSelectedMovementId, ", host.data.curSelectedMovementId);
            if (this.checkParameter(host) && this.Controller.modifyMovement(this.buffMovement, false, host))
                this.hideModal(e, host);
        } else {
            // this.initBuffAndTmp(host);

            console.log("in confirm, this.buffMovement: ", this.buffMovement);
            // 缓存回去
            this.tmpMovement.fullCopyFrom(this.buffMovement);
            console.log("in confirm, this.buffMovement: ", this.tmpMovement);
            this.buffMovement.clearActualDetails();
            // this.buffMovement.contents.mvFeeling = 0;
            // for (var idx = 0; idx < this.buffMovement.contents.details.length; idx++) {
            //     this.buffMovement.contents.details[idx].actualCount = 0;
            //     this.buffMovement.contents.details[idx].actualWeight = 0;
            //     this.buffMovement.contents.details[idx].finished = false;
            //     this.buffMovement.contents.details[idx].groupFeeling = 0;
            // }
            if (this.checkParameter(host) && this.Controller.addMovement(this.buffMovement, host))
                this.hideModal(e, host);
        }
    }

    removeMovement(e, host) {
        var that = this;
        if (host.data.actionName === "修改动作") {
            console.log("in onRemove, host.data.curSelectedMovementId: ", host.data.curSelectedMovementId);
            wx.showModal({
                title: '确定删除该计划？',
                content: '',
                success: function (res) {
                    if (res.confirm) {
                        that.Controller.removeMovement(host.data.curSelectedMovementId, host);
                        host.onHideModal();
                        console.log('用户点击确定')
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            });

        } else {
            util.showToast('您这样让我很为难...', host, 2000);
        }
    }


    //响应的是，picker点确定之后

    movementChange(e) {
        console.log('in movementChange, picker发送选择改变，携带值为', e.detail.value);

        this.multiMovementIndex = e.detail.value;

    }

    /**
     *Picker动作选择的监听，改变部位，其随后的动作会改变
     */

    movementColumnChange(e, host) {
        console.log('in movementColumnChange, 修改的列为', e.detail.column, '，值为', e.detail.value);

        // e.detail.value，是选中的列号
        this.multiMovementIndex[e.detail.column] = e.detail.value;

        switch (e.detail.column) {
            case 0:
                this.movementMultiArray[1] = util.getMovementNamePickerList(this.multiMovementIndex[0]);
                this.multiMovementIndex[1] = 0;
                break;
            case 1: {
                this.multiMovementIndex[1] = e.detail.value;
                break;
            }
        }

        this.buffMovement.mvInfo.partName = this.movementMultiArray[0][this.multiMovementIndex[0]];
        this.buffMovement.mvInfo.mvName = this.movementMultiArray[1][this.multiMovementIndex[1]];

        // 因为索引改变了，必须要在主控里设置
        this.updateToHost(host);

        // console.log(this.buffMovement.partName, this.buffMovement.movementName);

    }

    /**
     * 数字选择Picker监听
     */
    numberChange(e, host) {

        console.log('in numberChange, picker发送选择改变，携带值为', e.detail.value);


        var selectedRowArr = e.detail.value;
        this.buffMovement.contents.planGpCount = this.movementNoMultiArray[0][selectedRowArr[0]];
        this.buffMovement.contents.details = [];

        for (var idx = 0; idx < this.buffMovement.contents.planGpCount; idx++) {
            var record = new RecordFactory.DetailRecord(idx + 1,
                this.movementNoMultiArray[1][selectedRowArr[1]],
                this.movementNoMultiArray[2][selectedRowArr[2]],
                0,
                0);

            this.buffMovement.contents.details.push(record);

        }

        this.updateToHost(host);
        console.log('组数：', this.buffMovement.contents.planGpCount, ', ', '次数：', this.buffMovement.contents.details[0].planCount, ', ', "重量：", this.buffMovement.contents.details[0].planWeight);
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
     *
     */
    setSameMvCount(e, host) {

        this.buffMovement.controller.sameMvCount = !this.buffMovement.controller.sameMvCount;
        //点一次就反置，逻辑搞简单点
        this.updateToHost(host);
        console.log("host.data.sameMvCount: ", this.buffMovement.controller.sameMvCount);
    }

    //for input change in modal

    inputGroupChange(e, host) {

        this.setAmount(e.detail.value, host);
        // console.log("this.buffMovement", this.buffMovement);
    }

    inputMvCountChange(e, host) {

        //分组制定时，给统一值
        if (this.buffMovement.controller.seperateMake) {
            if (this.buffMovement.controller.sameMvCount) {

                for (var idx = 0; idx < this.buffMovement.contents.details.length; idx++) {
                    this.buffMovement.contents.details[idx].planCount = e.detail.value;
                }
                console.log("onInputMvCountChange", this.buffMovement);
            } else {
                this.buffMovement.contents.details[e.target.id - 1].planCount = e.detail.value;

            }
        } else {
            for (var idx = 0; idx < this.buffMovement.contents.details.length; idx++) {
                this.buffMovement.contents.details[idx].planCount = e.detail.value;
            }
        }

        console.log(this.buffMovement);

        this.updateToHost(host);
    }

    inputWeightChange(e, host) {

        //分组设定，分别修改，否则统一修改
        if (this.buffMovement.controller.seperateMake) {
            this.buffMovement.contents.details[e.target.id - 1].planWeight = e.detail.value;
        } else {
            for (var idx = 0; idx < this.buffMovement.contents.details.length; idx++) {
                this.buffMovement.contents.details[idx].planWeight = e.detail.value;
            }
        }

        this.updateToHost(host);
    }

    /**
     * 点击分组制定或者，组数改变的时候，重新计算表格
     */
    setAmount(gpCount, host) {

        console.log("in setAmount, this.tmpMovement", this.tmpMovement);
        console.log("in setAmount, this.buffMovement", this.buffMovement);

        //当为分组制定的时候，改变planGpCount的值，以当前参数制定分组
        //当不分组制定的时候，直接拷贝
        this.buffMovement.contents.details = [];
        this.buffMovement.contents.planGpCount = gpCount;
        if (this.buffMovement.controller.seperateMake) {
            // 清零缓存动作数字数据

            var length = this.tmpMovement.contents.details.length;

            console.log("in setAmount, length: ", length);
            console.log("in setAmount, gpCount: ", gpCount);
            for (var idx = 0; idx < gpCount; idx++) {
                //新建单条，加入列表中，重绘输入表格的，必须分开new，否则关联
                if (idx >= length - 1) {
                    var record = new RecordFactory.DetailRecord(idx + 1,
                        this.tmpMovement.contents.details[length - 1].planCount,
                        this.tmpMovement.contents.details[length - 1].planWeight,
                        0,
                        0);
                } else {
                    var record = new RecordFactory.DetailRecord(idx + 1,
                        this.tmpMovement.contents.details[idx].planCount,
                        this.tmpMovement.contents.details[idx].planWeight,
                        0,
                        0);
                }

                this.buffMovement.contents.details.push(record);
            }
        } else {
            for (var idx = 0; idx < gpCount; idx++) {
                var record = new RecordFactory.DetailRecord(idx + 1,
                    this.tmpMovement.contents.details[0].planCount,
                    this.tmpMovement.contents.details[0].planWeight,
                    0,
                    0);
                this.buffMovement.contents.details.push(record);
            }

        }

        this.updateToHost(host);
        console.log("in setAmount, this.buffMovement: ", this.buffMovement);
    }

    /**
     * 根据当前选中的数据，设置动作索引，方便用户根据历史选择
     */
    setPickerIndex(movement, host) {
        var partName, movementName, gCount, mCount, mWeight;
        partName = movement.mvInfo.partName;
        movementName = movement.mvInfo.mvName;
        gCount = movement.contents.planGpCount;
        mCount = movement.contents.details[0].planCount;
        mWeight = movement.contents.details[0].planWeight;
        var partIdx;  // 部位索引
        var movementIndx; // 动作索引
        var gCountIdx;  // 组数索引
        var mCountIdx;  // 次数索引
        var mWeightIdx; // 重量索引
        //部位搜索
        for (var idx = 0; idx < this.movementMultiArray[0].length; idx++) {
            if (this.movementMultiArray[0][idx] === partName) {
                console.log("in setPickerIndex, match partName: ", partName);
                partIdx = idx;
                break;
            }
        }

        //动作搜索
        var movementNamePickerList = util.getMovementNamePickerList(partIdx);
        for (var idx = 0; idx < movementNamePickerList.length; idx++) {
            if (movementNamePickerList[idx] === movementName) {
                console.log("in setPickerIndex, match movementName: ", movementName);
                movementIndx = idx;
                break;
            }
        }

        // 置索引
        this.movementMultiArray[1] = movementNamePickerList;
        this.multiMovementIndex = [partIdx, movementIndx];

        // 组数，次数和重量
        for (var idx = 0; idx < this.movementNoMultiArray[0].length; idx++) {
            if (gCount <= this.movementNoMultiArray[0][0]) {
                // 重量小于起始重量，索引设置到头上
                gCountIdx = 0;
                break;
            } else if (gCount === this.movementNoMultiArray[0][idx]) {
                // 正好相等，索引就是idx
                console.log("match", gCount);
                gCountIdx = idx;
                break;
            } else if (gCount >= this.movementNoMultiArray[0][this.movementNoMultiArray[0].length - 1]) {
                // 大于最大索引

            }
        }

        for (var idx = 0; idx < this.movementNoMultiArray[0].length; idx++) {
            if (this.movementNoMultiArray[0][idx] === gCount) {
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
            PLANMODAL: host.data.PLANMODAL
        });
    }
}


module.exports = {
    PlanModal: PlanModal
}