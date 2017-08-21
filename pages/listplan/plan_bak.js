/**
 * plan.js
 * 计划页面，响应各种操作
 */

import util from '../../utils/util.js'
import controller from '../../utils/Controller.js'
import DataType from '../../datamodel/DataType.js'
import SingleDayRecords from '../../datamodel/SingleDayRecords.js'
import Movement from '../../datamodel/Movement.js'
import Record from '../../datamodel/Record.js'
import MovementModal from '../ui/modal/MovementModal.js'

//全局变量
var app = getApp();
const DATATYPE = new DataType.DataType();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 用来保存当前选中的日期，初始进程序，显示当天
        selectedDate: util.formatDateToString(new Date()),

        // 存放选中日期的计划和记录
        curRecords: '',

        // 初始化，这些数据一是用来显示初始化设置

        // 指定当前修改的记录ID
        curSelectedMovementId: '',

        // 组件控制
        scrollY: true,
        scrollHeight: 850,
        actionName: '',

        // Modal控制器，传数据用
        MOVEMENTMODAL: '',
        showModal: false,

        tipMvCount: '', //如果固定次数，tipMvCount为“每组”，否则为“共”
        //列表中显示的值
        showGpCount: '',
        showMvCount: '',
        showMvWeight: '',
        tipMvWeight: '', //如果固定重量，tipMvWeight为“每组”，否则为“最大”

    },

    MODAL: '',   //控制用
    swipeCheckX: 35, //激活检测滑动的阈值
    swipeCheckState: 0, //0未激活 1激活
    maxMoveLeft: 185, //消息列表项最大左滑距离
    correctMoveLeft: 175, //显示菜单时的左滑距离
    thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
    lastShowMovementId: '', //记录上次显示菜单的消息id
    moveX: 0,  //记录平移距离
    showState: 0, //0 未显示菜单 1显示菜单
    touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
    swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动

    //------------------------------------------------------
    //以下是监听函数，及其对应的处理操作

    /**
     * 响应往前一天的操作
     */
    onLastDate: function () {
        util.moveDay(false, this);
    },

    /**
     * 响应往前一天的操作
     */
    onNextDate: function () {
        util.moveDay(true, this);
    },

    /**
     * 响应点击日期按钮，跳转日历页面
     */
    onSelectDate: function () {
        //TODO 增加读取数据功能
        //离开页面前，先保存
        console.log("select date");
        // controller.saveData( this.data.selectedDate, DATATYPE.SingleDayRecords, this.data.curRecords);
        wx.navigateTo({
            url: '../ui/calender/calender',
        });
    },

    /**
     * 响应界面调用的函数
     */
    onAddMovement: function () {
        if (util.isExpired(this.data.selectedDate)) {
            console.log("isExpired!!!!!!!!!!");
            return;
        } else {
            this.setData({
                actionName: "添加动作",
                showModal: true
            });
        }
    },

    /**
   * 具体处理添加动作的业务
   * 参数：movement，在Modal中生成的数据
   */
    addMovement: function (movement) {
        var success = false;
        // console.log("in addMovement, this.data.curRecords: ", this.data.curRecords);

        var toBeAdd = new Movement.Movement();

        // 必须要使用copyfrom，否则添加的都是一样的。不能使用：toBeAdd = movement
        toBeAdd.fullCopyFrom(movement);

        // console.log("in addMovement, toBeAdd is: ", toBeAdd);

        toBeAdd.date = this.data.selectedDate;

        // 这样逻辑简单，仅在此一处产生ID，其他地方都不修改ID
        toBeAdd.id = this.data.curRecords.movementList.length + 1;
        // console.log("in addMovement, this.data.tmpMovement is: ", movement);
        // console.log("in addMovement, toBeAdd is: ", toBeAdd);
        if (!this.data.curRecords.add(toBeAdd)) {
            util.showToast('您已添加该动作。', this, 2000);
            success = false;
            return success;
        } else {
            console.log("add a new movement: ", toBeAdd);
        }

        this.setData({
            curRecords: this.data.curRecords
        });
        // console.log("in addMovement, this.data.curRecords.movementList.length",
        // this.data.curRecords.movementList.length);
        // console.log("in addMovement, after add: ", this.data.curRecords);
        success = true;
        controller.saveData(this.data.selectedDate,
            DATATYPE.SingleDayRecords,
            this.data.curRecords);
        return success;
    },

    /**
     * 响应处理修改动作的业务
     */
    onModifyMovement: function (e) {
        if (util.isExpired(this.data.selectedDate)) {
            console.log("isExpired!!!!!!!!!!");
            return;
        }

        // 把这个Modify界面重置到该动作的参数
        console.log("in onModifyMovement, e.currentTarget.id: ", e.currentTarget.id);
		
		// 取得正在编辑的动作，传给Modal
        var tmp = this.data.curRecords.movementList[e.currentTarget.id - 1];
		this.data.MOVEMENTMODAL.setBuffMovement(tmp,this);

        this.setData({
			MOVEMENTMODAL: this.data.MOVEMENTMODAL,
            curSelectedMovementId: e.currentTarget.id,
            actionName: "修改动作",
            showModal: true
        });
		
    },

    /**
     * 具体处理修改动作的业务
     */
    modifyMovement: function (movement,refresh) {
        var success = false;

        //准备修改的数据
		var toBeModify = new Movement.Movement();
		toBeModify.fullCopyFrom(movement);
        
        console.log("in modifyMovement, new modify movement is: ", toBeModify);

        success = this.data.curRecords.modify(this.data.curSelectedMovementId, refresh,toBeModify);

        if (!success) {
            util.showToast('动作重复了...', this, 2000);
        } else {
            this.setData({
                curRecords: this.data.curRecords
            });
            console.log('modify completed!');
        }

        return success;
    },

    /**
    * 
    */
    removeMovement: function (id) {

        var curRecords = this.data.curRecords;
        console.log("in removeMovement, before delele, this.data.curRecords: ", curRecords);
        curRecords.remove(id);

        this.setData({
            curRecords: curRecords,
        });

        //很奇怪，没找到原因，必须要这么一下，才能刷新
        controller.saveData(this.data.selectedDate,
            DATATYPE.SingleDayRecords,
            this.data.curRecords);

        console.log("in removeMovement, after delele, this.data.curRecords, ", this.data.curRecords);
        // console.log('remove', e.detail.value)
    },

    // ---------------------------------------------
    // 响应Modal界面控制
    /**
     * 
     */
    onPreventTouchMove: function (e) {
        this.data.MOVEMENTMODAL.preventTouchMove(e);
    },

    onHideModal: function (e) {
        this.data.MOVEMENTMODAL.hideModal(e, this);
    },

    onCancel: function (e) {
        this.data.MOVEMENTMODAL.cancel(e, this);
    },

    onConfirm: function (e) {
        this.data.MOVEMENTMODAL.confirm(e, this);
    },

    onRemove: function (e) {
        this.data.MOVEMENTMODAL.removeMovement(e, this);

        // host.removeMovement(host.data.curSelectedMovementId);
    },

    // ---------------------------------------------
    // 响应Modal界面组件控制
    // 因为Modal必须内嵌在plan页面里，数据就必须挂在页面中，
    // 所以需要把实例传过去，方便更新界面数据和交互

    onMovementChange: function (e) {
        this.data.MOVEMENTMODAL.movementChange(e, this);
    },

    onMovementColumnChange: function (e) {
        this.data.MOVEMENTMODAL.movementColumnChange(e, this);
    },

    onNumberChange: function (e) {
        this.data.MOVEMENTMODAL.numberChange(e, this);
    },

    onSeperatingSelect: function (e) {
        this.data.MOVEMENTMODAL.setSeperatingSelect(e, this);
    },

    onSameMvCount: function (e) {
        this.data.MOVEMENTMODAL.setSameMvCount(e, this);
    },

    onInputGroupChange: function (e) {
        this.data.MOVEMENTMODAL.inputGroupChange(e, this);
    },

    onInputMvCountChange: function (e) {
        this.data.MOVEMENTMODAL.inputMvCountChange(e, this);
    },

    onInputWeightChange: function (e) {
        this.data.MOVEMENTMODAL.inputWeightChange(e, this);
    },

    //--------------------------------------------------------
    //for left swipe delete

    onTouchStart: function (e) {
        if (util.isExpired(this.data.selectedDate)) {
            return;
        }
        if (this.showState === 1) {
            this.touchStartState = 1;
            this.showState = 0;
            this.moveX = 0;
            this.translateXMovementItem(this.lastShowMovementId, 0, 200);
            this.lastShowMovementId = "";
            return;
        }
        this.firstTouchX = e.touches[0].clientX;
        this.firstTouchY = e.touches[0].clientY;
        if (this.firstTouchX > this.swipeCheckX) {
            this.swipeCheckState = 1;
        }
        this.lastMoveTime = e.timeStamp;
    },

    onTouchMove: function (e) {
        if (this.swipeCheckState === 0) {
            return;
        }
        //当开始触摸时有菜单显示时，不处理滑动操作
        if (this.touchStartState === 1) {
            return;
        }
        var moveX = e.touches[0].clientX - this.firstTouchX;
        var moveY = e.touches[0].clientY - this.firstTouchY;
        //已触发垂直滑动，由scroll-view处理滑动操作
        if (this.swipeDirection === 2) {
            return;
        }
        //未触发滑动方向
        if (this.swipeDirection === 0) {
            // console.log(Math.abs(moveY));
            //触发垂直操作
            if (Math.abs(moveY) > 4) {
                this.swipeDirection = 2;

                return;
            }
            //触发水平操作，同时禁用垂直滚动
            if (Math.abs(moveX) > 4) {
                this.swipeDirection = 1;
                this.setData({ scrollY: false });
            }
            else {
                return;
            }
        }
        this.lastMoveTime = e.timeStamp;
        //处理边界情况
        if (moveX > 0) {
            moveX = 0;
        }
        //检测最大左滑距离
        if (moveX < -this.maxMoveLeft) {
            moveX = -this.maxMoveLeft;
        }
        this.moveX = moveX;
        this.translateXMovementItem(e.currentTarget.id, moveX, 0);
    },

    onTouchEnd: function (e) {
        this.swipeCheckState = 0;
        var swipeDirection = this.swipeDirection;
        this.swipeDirection = 0;
        if (this.touchStartState === 1) {
            this.touchStartState = 0;
            this.setData({ scrollY: true });
            return;
        }
        //垂直滚动，忽略
        if (swipeDirection !== 1) {
            return;
        }
        if (this.moveX === 0) {
            this.showState = 0;
            //不显示菜单状态下,激活垂直滚动
            this.setData({ scrollY: true });
            return;
        }
        if (this.moveX === this.correctMoveLeft) {
            this.showState = 1;
            this.lastShowMovementId = e.currentTarget.id;
            return;
        }
        if (this.moveX < -this.thresholdMoveLeft) {
            this.moveX = -this.correctMoveLeft;
            this.showState = 1;
            this.lastShowMovementId = e.currentTarget.id;
        }
        else {
            this.moveX = 0;
            this.showState = 0;
            //不显示菜单,激活垂直滚动
            this.setData({ scrollY: true });
        }
        this.translateXMovementItem(e.currentTarget.id, this.moveX, 500);

    },

    /**
     * 响应删除操作，需弹窗确认
     */
    onDeleteMovementTap: function (e) {
        var vm = this;
        wx.showModal({
            title: '确认删除',
            content: '此操作将删除该动作，确认否？',
            cancelText: "取消",
            confirmText: "确定",
            success: function (res) {
                if (res.confirm) {
                    console.log('用户删除数据')
                    vm.deleteMovementItem(e);
                } else if (res.cancel) {
                    console.log('用户取消删除')
                }
            }
        });

    },

    /**
     * 响应去锻炼操作，准备数据
     */
    onTrainTap: function (e) {
        console.log("e.currentTarget.id ", e.currentTarget.id);
        //TODO 准备锻炼数据，考虑使用checked属性，明天再思考，或许干脆不要这个按钮
        wx.switchTab({
            url: '../training/training',
        })
    },


    getItemIndex: function (id) {
        // console.log("left id: ", id);
        var curRecords = this.data.curRecords;
        // console.log("getItemIndex:", curRecords);

        for (var i = 0; i < curRecords.movementList.length; i++) {
            // console.log("getItemIndex:", curRecords.movementList[i].id, String(curRecords.movementList[i].id) === String(id));
            if (String(curRecords.movementList[i].id) === String(id)) {
                // console.log("getItemIndex:", i);
                return i;
            }
        }
        return -1;
    },

    deleteMovementItem: function (e) {
        var animation = wx.createAnimation({ duration: 200 });
        animation.height(0).opacity(0).step();
        this.animationMovementWrapItem(e.currentTarget.id, animation);
        var s = this;
        setTimeout(function () {
            console.log("in deleteMovementItem, e.currentTarget.id: ", e.currentTarget.id);

        }, 200);
        var index = s.getItemIndex(e.currentTarget.id);
        console.log("deleteMovementItem, delete id: ", index);
        this.removeMovement(index + 1);
        this.showState = 0;
        this.setData({ scrollY: true });
    },

    translateXMovementItem: function (id, x, duration) {
        var animation = wx.createAnimation({ duration: duration });
        animation.translateX(x).step();
        this.animationMovementItem(id, animation);
    },

    animationMovementItem: function (id, animation) {
        var index = this.getItemIndex(id);
        var param = {};
        var indexString = 'curRecords.movementList[' + index + '].animation';
        param[indexString] = animation.export();
        this.setData(param);
        // console.log("in animationMovementItem, param: ", param);
    },

    animationMovementWrapItem: function (id, animation) {
        var index = this.getItemIndex(id);
        var param = {};
        var indexString = 'curRecords.movementList[' + index + '].wrapAnimation';
        param[indexString] = animation.export();
        this.setData(param);
        // console.log("in animationMovementWrapItem, param: ", param);
    },


    //-------------------------------------------------------------------------------
    //生命周期函数，页面跳转等等

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化

        var modal = new MovementModal.MovementModal(this);

        this.data.curRecords = new SingleDayRecords.SingleDayRecords();

        this.setData({
            MOVEMENTMODAL: modal,

        });
        console.log("plan page onLoad, this.data.curRecords: ", this.data.curRecords);
  
        console.log("plan page onLoad call");
        console.log("this.data.MOVEMENTMODAL", this.data.MOVEMENTMODAL);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log("plan page onReady call");
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.log("plan page onShow call");
        this.setData({
            selectedDate: util.formatDateToString(app.globalData.selectedDate),
        });

        this.setData({
            curRecords: controller.loadData(this.data.selectedDate, DATATYPE.SingleDayRecords)
        });


        if (util.isExpired(this.data.selectedDate)) {
            util.showToast('历史数据不能修改哦^_^', this, 2000);
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        controller.saveData(this.data.selectedDate,
            DATATYPE.SingleDayRecords,
            this.data.curRecords);
        console.log("plan page onHide call: data saved");
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log("plan page onUnload call");
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log("plan page onPullDownRefresh call");
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log("plan page onReachBottom call");
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
