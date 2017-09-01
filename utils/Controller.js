/**
 * MVC分离，这里主要是数据操作部分
 * 1、loadData数据读入
 * 2、saveData数据存储，目前存储在localStorage里
 */

import util from 'util.js'
import UserInfo from '../datamodel/UserInfo.js'
import UserProfile from '../datamodel/UserProfile.js'
import DailyRecords from '../datamodel/DailyRecords.js'
import Movement from '../datamodel/Movement.js'
import SystemSetting from '../datamodel/SystemSetting.js'
import StorageType from '../datamodel/StorageType.js'

var DATATYPE = new StorageType.StorageType();

class Controller {
    //获取一个StrorageType作为全局变量用
    constructor() {
        this.STORAGETYPE = new StorageType.StorageType();
    }

    /**
     * 功能：从选中的日期读取指定内容
     * 参数1：key，要读取的数据
     * 参数2：dataType，数据类型（StrorageType）
     * 返回：请求类型的数据
     * 调用关系：外部函数，开放接口
     */
    loadData(key, dataType) {
        // TODO，判断是否过期？

        // 读取该类型数据已存储的内容
        var readInData = wx.getStorageSync(key);
        // 当天请求的数据
        var requestData = '';

        // 根据类型来抽取需要的数据
        // 如果没有这个记录，取的会是空值，则新建一个对应的项
        if (readInData != "") {
            requestData = readInData;
        } else {
            switch (dataType.id) {
                case 0:
                    // 0. UserInfo
                    requestData = new UserInfo.UserInfo();
                    break;
                case 1:
                    // 1. UserProfile
                    requestData = new UserProfile.UserProfile();
                    break;
                case 2:
                    // 2. DailyRecords

                    if (typeof (requestData.date) !== "undefined" && requestData.date !== "") {
                        console.log("here222222222222222222222222222222");
                    } else {
                        requestData = new DailyRecords.DailyRecords();
                    }

                    break;
                case 3:
                    requestData = new SystemSetting.SystemSetting();
                default:
                    break;
            }
        }

        console.log("in Controller.loadData, after loadData, requestData: ", requestData);

        return requestData;

    }

    /**
     * 功能：存储数据
     * 参数1：key，保存的数据key
     * 参数2：dataType，数据类型（StrorageType）
     * 参数3：dataToSave，要存储的数据
     * 当存储的数据，为DailyRecords的时候，需要更新记录表
     * 调用关系：外部函数，开放接口
     */
    saveData(key, dataType, dataToSave) {

        // 根据类型来判断是否需要替换其中的数据，还是直接覆盖
        switch (dataType.id) {
            case 0:
                // 0. UserInfo
                break;
            case 1:
                // 1. UserProfile
                break;
            case 2:
                // 2. DailyRecords
                // 在这种情况，dataToSave一定是个DailyRecords的类型
                // 读取该类型数据已存储的内容
                var userInfo = wx.getStorageSync(this.STORAGETYPE.UserInfo.value);
                // 如果没有，则新建一个
                if (userInfo == "")
                    userInfo = new UserInfo.UserInfo();
                console.log(userInfo);
                // 如果有，先判断今天的数据情况
                if (dataToSave.movementList.length > 0) {
                    // 有计划数据
                    if (!userInfo.hasPlanDateList.includes(dataToSave.date))
                        userInfo.hasPlanDateList.push(dataToSave.date);
                    // 根据时间和组的感觉来判断是否执行计划
                    // 过了今天的数据，一概不能编辑
                    var isToday = util.formatDateToString(new Date()) === dataToSave.date;

                    if (isToday)
                        for (var item of dataToSave.movementList) {
                            if (typeof (item.contents.mvFeeling) !== "undefined" &&
                                item.contents.mvFeeling !== "" &&
                                !userInfo.hasTrainedDateList.includes(dataToSave.date)) {
                                userInfo.hasTrainedDateList.push(dataToSave.date);
                            }
                        }

                } else {
                    // 如果用户把这天数据删除了，找到记录里对应项删掉
                    var index = userInfo.hasPlanDateList.indexOf(dataToSave.date);
                    console.log(index)
                    if (index != -1)
                        userInfo.hasPlanDateList.splice(index, 1);

                    index = userInfo.hasTrainedDateList.indexOf(dataToSave.date);
                    if (index != -1)
                        userInfo.hasTrainedDateList.splice(index, 1);

                }
                wx.setStorageSync(this.STORAGETYPE.UserInfo.value, userInfo);
                break;
            default:
                break;
        }

        console.log("in saveData, targetToSave: ", dataToSave);

        wx.setStorageSync(key, dataToSave);
    }

    /**
     * 功能：寻找和替换现有记录中的片段
     * 参数1：selectedDate，选中的日期
     * 参数2：dataToSave，要存储的数据
     * 参数3：originData，记录中已经有的数据
     * 返回：经过修改之后的内容
     * 调用关系：内部调用，被saveData调用
     */
    moveDay(isNext, host) {
        // 先保存
        host.collectDataAndSave();
        console.log("in moveDay, host.data.curRecords", host.data.curRecords);
        host.data.Controller.saveData(host.data.selectedDate, DATATYPE.DailyRecords, host.data.curRecords);

        // 改变日期
        var dateAfterMove = util.getMoveDays(host.data.selectedDate, isNext, 1);
        // 需先设置日期
        host.setData({
            selectedDate: dateAfterMove,

        });

        var curRecords = host.data.Controller.loadData(host.data.selectedDate, DATATYPE.DailyRecords);
        console.log("in moveDay: host.data.selectedDate", host.data.selectedDate);
        console.log("in moveDay: DATATYPE.DailyRecords", DATATYPE.DailyRecords);
        console.log("in moveDay: curRecords", curRecords);

        host.setData({
            curRecords: curRecords,
            selectedMovementId: -1
        });

        host.initRecords();

        if (util.dateDirection(host.data.selectedDate) === -1) {
            util.showToast("历史数据不能修改哦^_^", host, 2000);
        }
    }

    /**
     * 具体处理添加动作的业务
     * 参数：movement，在Modal中生成的数据
     */
    addMovement(movement, host) {
        var success = false;
        // console.log("in addMovement, this.data.curRecords: ", this.data.curRecords);

        var toBeAdd = new Movement.Movement();

        // 必须要使用copyfrom，否则添加的都是一样的。不能使用：toBeAdd = movement
        toBeAdd.fullCopyFrom(movement);

        // console.log("in addMovement, toBeAdd is: ", toBeAdd);

        toBeAdd.date = host.data.selectedDate;

        // 这样逻辑简单，仅在此一处产生ID，其他地方都不修改ID
        toBeAdd.mvId = host.data.curRecords.movementList.length + 1;
        // console.log("in addMovement, this.data.tmpMovement is: ", movement);
        // console.log("in addMovement, toBeAdd is: ", toBeAdd);
        if (!host.data.curRecords.add(toBeAdd)) {
            util.showToast('您已添加该动作。', host, 2000);
            success = false;
            return success;
        } else {
            console.log("add a new movement: ", toBeAdd);
        }

        host.setData({
            curRecords: host.data.curRecords
        });
        // console.log("in addMovement, this.data.curRecords.movementList.length",
        // this.data.curRecords.movementList.length);
        // console.log("in addMovement, after add: ", this.data.curRecords);
        success = true;
        this.saveData(host.data.selectedDate, this.STORAGETYPE.DailyRecords, host.data.curRecords);
        return success;
    }

    /**
     * 具体处理修改动作的业务
     */
    modifyMovement(movement, refresh, host) {
        var success = false;

        //准备修改的数据
        var toBeModify = new Movement.Movement();
        toBeModify.fullCopyFrom(movement);

        console.log("in modifyMovement, new modify movement is: ", toBeModify);

        success = host.data.curRecords.modify(host.data.curSelectedMovementId, refresh, toBeModify);

        if (!success) {
            util.showToast('动作重复了...', host, 2000);
        } else {
            host.setData({
                curRecords: host.data.curRecords
            });
            console.log('modify completed!');
        }

        this.saveData(host.data.selectedDate, this.STORAGETYPE.DailyRecords, host.data.curRecords);
        return success;
    }

    /**
     *
     */
    removeMovement(id, host) {

        var curRecords = host.data.curRecords;
        console.log("in removeMovement, before delele, host.data.curRecords: ", curRecords);
        curRecords.remove(id);

        host.setData({
            curRecords: curRecords,
        });

        this.saveData(host.data.selectedDate, this.STORAGETYPE.DailyRecords, host.data.curRecords);

        console.log("in removeMovement, after delele, host.data.curRecords, ", host.data.curRecords);
        // console.log('remove', e.detail.value)
    }
}

module.exports = {
    Controller: Controller
}