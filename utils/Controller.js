/**
 * MVC分离，这里主要是数据操作部分
 * 1、loadData数据读入
 * 2、saveData数据存储，目前存储在localStorage里
 */

import util from 'Util.js'
import User from '../datamodel/User'
import SystemSetting from '../datamodel/SystemSetting.js'
import StorageType from '../datamodel/StorageType.js'
import PlanSet from '../datamodel/PlanSet.js'

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
    loadData(dataType) {
        // 读取该类型数据已存储的内容
        var readInData = wx.getStorageSync(dataType.key);
        // 当天请求的数据
        var requestData = '';

        // 根据类型来抽取需要的数据
        // 如果没有这个记录，取的会是空值，则新建一个对应的项
        if (readInData !== "") {
            requestData = readInData;
        } else {
            switch (dataType.id) {
                case 0:
                    // 0. UserInfo
                    requestData = new User.UserInfo();
                    break;
                case 1:
                    // 1. UserProfile
                    requestData = new User.UserProfile();
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
                    break;
                case 4:
                    requestData = [];
                    break;
                default:
                    break;
            }
        }

        // console.log("in Controller.loadData, after loadData, requestData: ", requestData);

        return requestData;
    }

    /**
     *
     * @returns {*}
     */
    loadPlan() {
        let planSet = this.loadData(this.STORAGETYPE.PlanSet);
        let currentPlan = '';

        console.log("planSet:", planSet);

        for (let plan of planSet) {
            if (plan.currentUse) {
                currentPlan = plan;
            }
        }

        return (currentPlan === '') ? new PlanSet.Plan() : currentPlan;
    }

    /**
     * 功能：存储数据
     * 参数1：key，保存的数据key
     * 参数2：dataType，数据类型（StrorageType）
     * 参数3：dataToSave，要存储的数据
     * 当存储的数据，为DailyRecords的时候，需要更新记录表
     * 调用关系：外部函数，开放接口
     */
    saveData(dataType, dataToSave) {

        // 根据类型来判断是否需要替换其中的数据，还是直接覆盖
        console.log("in saveData, targetToSave: ", dataToSave);

        wx.setStorageSync(dataType.key, dataToSave);
    }

}

module.exports = {
    Controller: Controller
}