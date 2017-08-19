/**
 * modal控制器
 * 接收主控页面的实例作为输入
 * 响应用户控制Modal的操作，包括关闭，确定等
 * 只在确认增加、修改时，返回对应的Movement，或者删除的Movement ID
 * 所有对最终数据的操作，都放到主控页面中
 */

import util from '../../../utils/util.js'
import controller from '../../../utils/controller.js'
import Movement from '../../../datamodel/Movement.js'
import Record from '../../../datamodel/Record.js'

var app = getApp()

function PlanModal() {

    // 初始化一个缓存，用来存放Modal编辑的动作
    this.buffMovement = new Movement.Movement();

    this.initBuff = function () {
        this.buffMovement.planGpCount = 6;
        this.buffMovement.movementAmount = [];
        for (var idx = 0; idx < this.buffMovement.planGpCount; idx++) {
            //新建单条，加入列表中
            var record = new Record.Record(idx + 1, 10, 30, 0, 0);

            this.buffMovement.movementAmount.push(record);

        }
        this.buffMovement.selected = false;
        this.buffMovement.measurement = app.system.userConfig.measurement;
    }


    // 临时变量，在修改时，存取上一次的动作数据汇总（Amount）
    this.tmpMovement = new Movement.Movement();

    // 2D 数组，用来存放动作
    this.movementMultiArray = app.globalData.movementMultiArray;
    // 动作索引
    this.multiMovementIndex = [0, 0];

    // 3D 数组，用来存放动作组数，次数和重量
    this.movementNoMultiArray = app.globalData.movementNoMultiArray;
    // 数量选择索引
    this.multiMovementNoIndex = [0, 0, 0];

	/**
	 * 通过host来初始化buffMovement，用来存放准备编辑的动作
	 * 接收movement的同时，根据movement来设置Picker的值
	 */
    this.setBuffMovement = function (movement, host) {
        console.log("in setBuffMovement, movement: ", movement);
        this.buffMovement.fullCopyFrom(movement);
        console.log("in setBuffMovement, this.buffMovement: ", this.buffMovement);
        this.tmpMovement.fullCopyFrom(movement);
        this.setPickerIndex(movement, host);
    }

    /**
     * 弹出框蒙层截断touchmove事件
     */
    this.preventTouchMove = function () {
    }

    /**
     * 隐藏模态对话框
     */
    this.hideModal = function (e, host) {
        host.setData({
            showModal: false
        });
    }

    /**
     * 对话框取消按钮点击事件
     */
    this.cancel = function (e, host) {
        this.hideModal(e, host);
    }

    /**
     * 对话框确认按钮点击事件，处理添加或修改业务
     */
    this.confirm = function (e, host) {
        console.log("in confirm, this.buffMovement: ", this.buffMovement);
        if (host.data.actionName === "修改动作") {
            if (this.checkParameter(host) && controller.modifyMovement(this.buffMovement, host))
                this.hideModal(e, host);
        } else {
            this.initBuff();
			this.tmpMovement.fullCopyFrom(this.buffMovement);
            if (this.checkParameter(host) && controller.addMovement(this.buffMovement, host))
                this.hideModal(e, host);
        }
    }

    this.removeMovement = function (e, host) {
        if (host.data.actionName === "修改动作") {
            console.log("in onRemove, host.data.curSelectedMovementId: ", host.data.curSelectedMovementId);
            wx.showModal({
                title: '确定删除该计划？',
                content: '',
                success: function (res) {
                    if (res.confirm) {
                        controller.removeMovement(host.data.curSelectedMovementId, host);
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
    this.movementChange = function (e) {
        console.log('in movementChange, picker发送选择改变，携带值为', e.detail.value);

        this.multiMovementIndex = e.detail.value;

    }

    /**
     *Picker动作选择的监听，改变部位，其随后的动作会改变
     */
    this.movementColumnChange = function (e, host) {
        console.log('in movementColumnChange, 修改的列为', e.detail.column, '，值为', e.detail.value);

        this.multiMovementIndex[e.detail.column] = e.detail.value;
        var columnIdx = e.detail.column;
        var rowIdx = e.detail.value;

        switch (e.detail.column) {
            case 0:
                this.movementMultiArray[1] = util.getMovementNamePickerList(this.multiMovementIndex[0]);
                this.multiMovementIndex[1] = 0;
                break;
            case 1:
                {
                    this.multiMovementIndex[1] = e.detail.value;
                    break;
                }
        }

        this.buffMovement.partName = this.movementMultiArray[0][this.multiMovementIndex[0]];
        this.buffMovement.movementName = this.movementMultiArray[1][this.multiMovementIndex[1]];

        // 因为索引改变了，必须要在主控里设置
        this.updateToHost(host);

        // console.log(this.buffMovement.partName, this.buffMovement.movementName);

    }

    /**
     * 数字选择Picker监听
     */
    this.numberChange = function (e, host) {

        console.log('in numberChange, picker发送选择改变，携带值为', e.detail.value);


        var selectedRowArr = e.detail.value;
        this.buffMovement.planGpCount = this.movementNoMultiArray[0][selectedRowArr[0]];
        this.buffMovement.movementAmount = [];

        for (var idx = 0; idx < this.buffMovement.planGpCount; idx++) {
            var record = new Record.Record(idx + 1,
                this.movementNoMultiArray[1][selectedRowArr[1]],
                this.movementNoMultiArray[2][selectedRowArr[2]],
                0,
                0);

            this.buffMovement.movementAmount.push(record);

        }

        this.updateToHost(host);
        console.log('组数：', this.buffMovement.planGpCount, ', ', '次数：', this.buffMovement.movementAmount[0].planCount, ', ', "重量：", this.buffMovement.movementAmount[0].planWeight);
    }

    /**
     * 
     */
    this.setSeperatingSelect = function (e, host) {

        // console.log(e);
        //点一次就反置，逻辑搞简单点
        this.buffMovement.seperateMake = !this.buffMovement.seperateMake;

        this.updateToHost(host);

        console.log(this.buffMovement.planGpCount);

        var abc = this.buffMovement.planGpCount;
        this.setAmount(abc, host);

        console.log("seperateMake: ", this.buffMovement.seperateMake);
    }

    /**
     * 
     */
    this.setSameMvCount = function (e, host) {

        this.buffMovement.sameMvCount = !this.buffMovement.sameMvCount;
        //点一次就反置，逻辑搞简单点
        this.updateToHost(host);
        console.log("host.data.sameMvCount: ", this.buffMovement.sameMvCount);
    }

    //for input change in modal
    this.inputGroupChange = function (e, host) {

        this.setAmount(e.detail.value, host);
        // console.log("this.buffMovement", this.buffMovement);
    }

    this.inputMvCountChange = function (e, host) {

        //分组制定时，给统一值
        if (this.buffMovement.seperateMake) {
            if (this.buffMovement.sameMvCount) {

                for (var idx = 0; idx < this.buffMovement.movementAmount.length; idx++) {
                    this.buffMovement.movementAmount[idx].planCount = e.detail.value;
                }
                console.log("onInputMvCountChange", this.buffMovement);
            } else {
                this.buffMovement.movementAmount[e.target.id - 1].planCount = e.detail.value;

            }
        } else {
            for (var idx = 0; idx < this.buffMovement.movementAmount.length; idx++) {
                this.buffMovement.movementAmount[idx].planCount = e.detail.value;
            }
        }

        console.log(this.buffMovement);

        this.updateToHost(host);
    }

    this.inputWeightChange = function (e, host) {

        //分组设定，分别修改，否则统一修改
        if (this.buffMovement.seperateMake) {
            this.buffMovement.movementAmount[e.target.id - 1].planWeight = e.detail.value;
        } else {
            for (var idx = 0; idx < this.buffMovement.movementAmount.length; idx++) {
                this.buffMovement.movementAmount[idx].planWeight = e.detail.value;
            }
        }

        this.updateToHost(host);
    }

    /**
     * 点击分组制定或者，组数改变的时候，重新计算表格
     */
    this.setAmount = function (gpCount, host) {

        console.log("in setAmount, this.tmpMovement", this.tmpMovement);
        console.log("in setAmount, this.buffMovement", this.buffMovement);

        //当为分组制定的时候，改变planGpCount的值，以当前参数制定分组
        //当不分组制定的时候，只修改组的值
        if (this.buffMovement.seperateMake) {
            // 清零缓存动作数字数据
            this.buffMovement.planGpCount = gpCount;
            this.buffMovement.movementAmount = [];
            var length = this.tmpMovement.movementAmount.length;

            console.log("in setAmount, gpCount: ", gpCount);
            for (var idx = 0; idx < gpCount; idx++) {
                //新建单条，加入列表中，重绘输入表格的，必须分开new，否则关联
                if (idx >= length - 1) {
                    var record = new Record.Record(idx + 1,
                        this.tmpMovement.movementAmount[length - 1].planCount,
                        this.tmpMovement.movementAmount[length - 1].planWeight,
                        0,
                        0);
                } else {
                    var record = new Record.Record(idx + 1,
                        this.tmpMovement.movementAmount[idx].planCount,
                        this.tmpMovement.movementAmount[idx].planWeight,
                        0,
                        0);
                }

                this.buffMovement.movementAmount.push(record);
            }
        } else {
            this.buffMovement.planGpCount = gpCount;
        }

        this.updateToHost(host);
        console.log("in setAmount, this.buffMovement: ", this.buffMovement);
    }

    /**
     * 根据当前选中的数据，设置动作索引，方便用户根据历史选择
     */
    this.setPickerIndex = function (movement, host) {
        var partName, movementName, gCount, mCount, mWeight;
        partName = movement.partName;
        movementName = movement.movementName;
        gCount = movement.planGpCount;
        mCount = movement.movementAmount[0].planCount;
        mWeight = movement.movementAmount[0].planWeight;
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
    this.checkParameter = function (host) {
        // 部位不能为空
        if (typeof (this.buffMovement.partName) == "undefined" || this.buffMovement.partName == '') {
            util.showToast('请选择部位...', host, 2000);
            return false;
        }

        // 动作不能为空
        if (typeof (this.buffMovement.movementName) == "undefined") {
            util.showToast('请选择动作...', host, 2000);
            return false;
        }
        // 动作组数不能为空或0
        if (typeof (this.buffMovement.planGpCount) == "undefined" ||
            this.buffMovement.planGpCount <= 0) {
            util.showToast('动作组数不能为空或0...', host, 2000);
            return false;
        }

        // 次数为数组，肯定不会是undefined，要判断数组中每个是不是空
        for (var item of this.buffMovement.movementAmount) {
            if (typeof (item.planCount) == "undefined" ||
                item.planCount <= 0) {
                util.showToast('动作次数不能为空或0...', host, 2000);
                return false;
            }
        }

        // 重量为数组，肯定不会是undefined，要判断数组中每个是不是空
        for (var item of this.buffMovement.movementAmount) {
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
    this.updateToHost = function (host) {
        host.setData({
            PLANMODAL: host.data.PLANMODAL
        });
    }
}



module.exports = {
    PlanModal: PlanModal
}