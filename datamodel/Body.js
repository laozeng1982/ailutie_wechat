/**
 * Body
 */

import PlanSet from './PlanSet'

class Body {
    constructor() {
        this.type = "";
        this.partList = [];

    }

    /**
     * 从内置的动作数据文件中，新建一个默认的身体部位列表及对应的动作信息
     */
    static createDefaultPartList() {
        let orgType = new OrgType();

        let partList = [];
        let partIndex = 1;
        let partName;

        for (let part of orgType.DefaultActionName) {
            let bodyPart = new BodyPart();
            partName = part.partName;
            bodyPart.partId = partIndex;
            bodyPart.partName = partName;
            // bodyPart.subParts = part.subParts;
            for (let subPartIdx = 0; subPartIdx < part.subParts.length; subPartIdx++) {
                let subPart = {name: part.subParts[subPartIdx].name, actionList: []};
                for (let actionIdx = 0; actionIdx < part.subParts[subPartIdx].actionArray.length; actionIdx++) {
                    let action = new Action();
                    action.actionId = actionIdx + 1;
                    action.actionName = part.subParts[subPartIdx].actionArray[actionIdx].name;
                    action.actionEquipment = part.subParts[subPartIdx].actionArray[actionIdx].equipment;
                    action.actionGpMeasurement = part.subParts[subPartIdx].actionArray[actionIdx].gpmeasurement;
                    action.actionMeasurement = part.subParts[subPartIdx].actionArray[actionIdx].measurement;
                    action.actionPartId = subPartIdx + 1;
                    action.actionPartName = part.subParts[subPartIdx].name;
                    subPart.actionList.push(action);

                }
                bodyPart.subParts.push(subPart);
            }

            let action = new Action();
            action.actionId = bodyPart.subParts.length;
            action.actionName = "自定义动作";
            action.actionPartId = partIndex;
            action.actionPart = partName;

            //最后一个增加一个空的，作为自定义动作
            bodyPart.subParts[bodyPart.subParts.length - 1].actionList.push(action);

            partList.push(bodyPart);
            partIndex++;
        }

        return partList;
    }

    makeDefaultDefaultPartList() {
        this.partList = Body.createDefaultPartList();
    }

    /**
     * 深度克隆数据
     * @param body
     */
    cloneDataFrom(body) {
        this.partList = Body.deepClone(body.partList);
    }


    /**
     * 深度复制目标
     * @param obj
     */
    static deepClone(obj) {

        let clone = obj.constructor === Array ? [] : {};

        // 递归
        for (let item in obj) {
            if (obj.hasOwnProperty(item)) {
                clone[item] = typeof obj[item] === "object" ? deepClone(obj[item]) : obj[item];
            }
        }

        return clone;
    }

    /**
     * 初始化
     * 给每一个动作，增加一个groupSet，方便以后用
     */
    initGroupSet() {
        for (let partIdx = 0; partIdx < this.partList.length; partIdx++) {
            for (let subPatIdx = 0; subPatIdx < this.partList[partIdx].subParts.length; subPatIdx++) {
                for (let actionIdx = 0; actionIdx < this.partList[partIdx].subParts[subPatIdx].actionList.length; actionIdx++) {
                    // 临时增加一个数据项，用以保存数据
                    this.partList[partIdx].subParts[subPatIdx].actionList[actionIdx].groupSets = [];
                    for (let idx = 0; idx < 6; idx++) {
                        let group = new PlanSet.GroupSet(idx + 1, 10,
                            this.partList[partIdx].subParts[subPatIdx].actionList[actionIdx].actionMeasurement, 30);

                        this.partList[partIdx].subParts[subPatIdx].actionList[actionIdx].groupSets.push(group);
                    }
                }
            }
        }
    }

    /**
     *
     * @param partSet
     */
    updateGroupSet(partSet) {
        for (let partIdx = 0; partIdx < this.partList.length; partIdx++) {
            if (partSet.name === this.partList[partIdx].partName) {
                for (let actionItem of partSet.actionSets) {
                    for (let subPartIdx = 0; subPartIdx < this.partList[partIdx].subParts.length; subPartIdx++) {
                        for (let actionIdx = 0; actionIdx < this.partList[partIdx].subParts[subPartIdx].actionList.length; actionIdx++) {
                            if (actionItem.name === this.partList[partIdx].subParts[subPartIdx].actionList[actionIdx].actionName) {
                                this.partList[partIdx].subParts[subPartIdx].actionList[actionIdx].actionSelected = true;

                                delete this.partList[partIdx].subParts[subPartIdx].actionList[actionIdx].groupSets;
                                this.partList[partIdx].subParts[subPartIdx].actionList[actionIdx].groupSets = actionItem.groupSets;
                            }
                        }
                    }

                }
            }
        }
    }

    /**
     *
     * @returns {boolean}
     */
    partSelected() {
        let hasSelectedPart = false;
        for (let part of this.partList) {
            hasSelectedPart = hasSelectedPart || part.selected;
        }

        return hasSelectedPart;
    }

    /**
     * 给定Id，选中目标部位
     * @param partId
     */
    selectPart(partId) {
        for (let idx = 0; idx < this.partList.length; idx++) {
            if (parseInt(partId) === parseInt(this.partList[idx].partId)) {
                this.partList[idx].selected = !this.partList[idx].selected;
                break;
            }
        }
    }

    /**
     * 给定Id，高亮激活目标部位
     * @param partName
     */
    activePart(partName) {
        for (let idx = 0; idx < this.partList.length; idx++) {
            this.partList[idx].active = partName === this.partList[idx].partName;
        }
    }

    /**
     * 选中一组部位（多个）
     * @param partsArr
     */
    selectParts(partsArr) {
        for (let part of this.partList) {
            if (partsArr.length > 0) {
                part.selected = partsArr.includes(part.partName);
            }
        }
    }

    /**
     * 取消选中一组部位
     * @param partsArr
     */
    unSelectParts(partsArr) {
        for (let part of this.partList) {
            if (partsArr.length > 0) {
                if (partsArr.includes(part.partName)) {
                    part.selected = false;
                }
            }
        }
    }

    /**
     * 取消选中一组部位
     */
    unSelectAllParts() {
        for (let part of this.partList) {
            part.selected = false;

        }
    }

    /**
     * 统计已经选择动作的数量
     */
    countSelectedAction() {
        for (let part of this.partList) {
            let selectedActionCount = 0;
            for (let subPart of part.subParts) {
                for (let action of subPart.actionList) {
                    if (action.actionSelected) {
                        selectedActionCount++;
                    }
                }
            }
            part.selectedActionCount = selectedActionCount;
        }
    }

    /**
     * 选中一个动作
     * @param subPartIdx
     * @param actionName
     */
    selectAction(subPartIdx, actionName) {
        for (let part of this.partList) {
            if (part.selected && part.active) {
                for (let action of part.subParts[subPartIdx].actionList) {
                    if (actionName === action.actionName) {
                        action.actionSelected = !action.actionSelected;
                    }
                }
            }
        }

        this.countSelectedAction();
    }

    /**
     * 清除动作选中项
     */
    unSelectAllActions() {
        for (let partIdx = 0; partIdx < this.partList.length; partIdx++) {
            this.partList[partIdx].selected = false;
            for (let subPartIdx = 0; subPartIdx < this.partList[partIdx].subParts.length; subPartIdx++) {
                for (let actionIdx = 0; actionIdx < this.partList[partIdx].subParts[subPartIdx].actionList.length; actionIdx++) {
                    this.partList[partIdx].subParts[subPartIdx].actionList[actionIdx].actionSelected = false;
                }
            }
        }
    }

    /**
     *
     * @param subPartIdx
     * @param selectedActionIdx
     * @param groupSet
     */
    addGroupSetToAction(subPartIdx, selectedActionIdx, groupSet) {
        for (let part of this.partList) {
            if (part.selected && part.active) {
                delete part.subParts[subPartIdx].actionList[selectedActionIdx].groupSets;
                part.subParts[subPartIdx].actionList[selectedActionIdx].groupSets = groupSet;
                // 因为选中picker同时会响应这个外部view的函数，也就是说会响应onSelectAction，所以需要重置一些状态
                // 重新置为选中，和记数
                part.subParts[subPartIdx].actionList[selectedActionIdx].actionSelected = true;
            }
        }

        this.countSelectedAction();
    }


    getSelectedActionGpMeausement(subPartIdx, actionName) {
        for (let part of this.partList) {
            if (part.selected && part.active) {
                for (let action of part.subParts[subPartIdx].actionList) {
                    if (actionName === action.actionName) {
                        return action.actionGpMeasurement;
                    }
                }
            }
        }
    }


    /**
     *
     * @returns {boolean}
     */
    allActionsSelected() {
        let allActionSelected = true;

        for (let part of this.partList) {
            let thisPartActionSelected = true;
            if (part.selected) {
                thisPartActionSelected = false;
                for (let subPart of part.subParts) {
                    for (let action of subPart.actionList) {
                        thisPartActionSelected = thisPartActionSelected || action.actionSelected;
                    }
                }
            }

            allActionSelected = allActionSelected && thisPartActionSelected;
        }

        return this.partSelected() && allActionSelected;
    }


    /**
     * 为每个部位添加选中的日期
     * @param partSet
     * @param cycleLength
     */
    makeLabel(partSet, cycleLength) {
        for (let partIdx = 0; partIdx < this.partList.length; partIdx++) {
            if (partSet.name === this.partList[partIdx].partName) {
                // 两种显示，如果是七天，则显示“周N”，否则显示“第N天”
                if (cycleLength === 7) {

                    let trainDate = [];
                    for (let date of partSet.trainDates) {
                        switch (date) {
                            case 0:
                                trainDate.push("周日");
                                break;
                            case 1:
                                trainDate.push("周一");
                                break;
                            case 2:
                                trainDate.push("周二");
                                break;
                            case 3:
                                trainDate.push("周三");
                                break;
                            case 4:
                                trainDate.push("周四");
                                break;
                            case 5:
                                trainDate.push("周五");
                                break;
                            case 6:
                                trainDate.push("周六");
                                break;
                        }
                    }
                    this.partList[partIdx].trainDateArr = partSet.trainDates;
                    this.partList[partIdx].trainDateStr = "( " + trainDate.join("，") + " )";
                    console.log("partSets.trainDateStr ", this.partList[partIdx].trainDateStr);
                } else {
                    // 需要加1，新建数组，不改变原数组的值
                    let trainDate = [];
                    for (let idx = 0; idx < partSet.trainDates.length; idx++) {
                        trainDate.push(partSet.trainDates[idx] + 1);
                    }
                    this.partList[partIdx].trainDateArr = partSet.trainDates;
                    this.partList[partIdx].trainDateStr = "(第 " + trainDate.join("，") + " 天)";
                }
            }
        }
    }

    /**
     * 把内容重新排序，以便按时间显示，方便直观
     */
    sortListByDate() {
        let orderPartList = []; // 重排序后存储

        // 先排没有计划的，放在前面
        for (let part of this.partList) {
            if (typeof part.trainDateArr === "undefined") {
                orderPartList.push(part);
            }
        }

        let str = [];
        for (let item of orderPartList) {
            str.push(item.partName);
        }
        console.log(str.toString());

        // 再排有计划的，如果计划有多天，按照第一天谁靠前排序
        for (let part of this.partList) {
            if (typeof part.trainDateArr !== "undefined" && part.trainDateArr.length > 0) {
                // 默认加在最后
                let insertPos = -1;
                for (let index = 0; index < orderPartList.length; index++) {
                    // 当训练日期列表第一个小于body.partList列表中某一个trainDate的第一个时，前插

                    if (typeof  orderPartList[index].trainDateArr !== "undefined"
                        && orderPartList[index].trainDateArr.length > 0) {
                        if (Body.arr1_IsFront_arr2(part.trainDateArr, orderPartList[index].trainDateArr)) {
                            insertPos = index;
                            break;
                        }
                    }
                }
                if (insertPos === -1) {
                    orderPartList.push(part);
                } else {
                    orderPartList.splice(insertPos, 0, part);
                }

                let str2 = [];
                for (let item of orderPartList) {
                    str2.push(item.partName);
                }

                // console.log("insertPos:", insertPos, "orderPartList:", str2.toString());
                // console.log("with plan", part.partName);
            }
        }

        this.partList = orderPartList;
    }

    /**
     *
     * @param arr1
     * @param arr2
     */
    static arr1_IsFront_arr2(arr1, arr2) {

        // 得到一个较小的数组长度，用以循环比较
        let loopLength = arr1.length <= arr2.length ? arr1.length : arr2.length;

        let front = true;
        let allSameElement = true;

        for (let idx = 0; idx < loopLength; idx++) {
            if (arr1[idx] < arr2[idx]) {
                allSameElement = false;
                break;
            } else if (arr1[idx] > arr2[idx]) {
                allSameElement = false;
                front = false;
                break;
            }
        }

        if (allSameElement) {
            console.log("same");
            front = arr1.length <= arr2.length;
        }

        return front;
    }
}

/**
 * 身体部位
 */
class BodyPart {
    constructor() {
        this.partId = '';
        this.partName = '';
        this.subParts = []; //{name: "", actionList: []}
        this.partPictureSrc = '';
        this.partDescription = '';
        this.selected = false;
    }
}

class Action {
    constructor() {
        this.actionId = '';
        this.actionName = '';
        this.actionPartName = '';
        this.actionPartId = '';
        this.actionGpMeasurement = '';
        this.actionMeasurement = '';
        this.actionEquipment = '';
        this.actionPictureSrc = '';
        this.actionDescription = '';
        this.actionSelected = false;
    }
}

class OrgType {
    constructor() {

        // 0、有氧
        this.actionArrOfAerobic = {
            partName: '有氧',
            subParts: [
                {
                    name: '有氧', actionArray: [
                    {name: '跑步', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
                    {name: '游泳', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
                    {name: '跳绳', equipment: "", gpmeasurement: "分钟", measurement: "次"},
                    {name: '自行车', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
                    {name: '椭圆机', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
                    {name: '划船机', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
                    {name: '动感单车', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
                ]
                }
            ],
        };

        // 1、胸部
        this.actionArrOfPectorales = {
            partName: '胸部',
            subParts: [
                {
                    name: '胸上部', actionArray: [
                    {name: '上斜杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '上斜哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ]
                },
                {
                    name: '胸中部', actionArray: [
                    {name: '平卧杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '平卧哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ]
                },
                {
                    name: '胸下部', actionArray: [
                    {name: '下斜杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '下斜哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '双杠臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '拉力器十字夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃飞鸟夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '蝴蝶机器械夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '窄距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '标准俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '宽距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},

                ],
                }
            ],
        };

        //2、肩部
        this.actionArrOfShoulder = {
            partName: '肩部',
            subParts: [
                {
                    name: '前束', actionArray: [
                    {name: '坐姿杠铃劲前推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '站姿哑铃前平举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '站姿绳索前平举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '站姿哑铃侧平举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '站姿杠铃划船', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '阿诺德推肩', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿杠铃劲后推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿器械反式飞鸟', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '俯身哑铃飞鸟', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '俯身绳索侧平举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '俯身杠铃提拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ]
                },
                {
                    name: '中束', actionArray: [
                    {name: '平卧杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '平卧哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ]
                },
                {
                    name: '后束', actionArray: [
                    {name: '下斜杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '下斜哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '双杠臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '拉力器十字夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃飞鸟夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '蝴蝶机器械夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '窄距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '标准俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '宽距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ],
                },
                {
                    name: '斜方肌', actionArray: [
                    {name: '下斜杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '下斜哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '双杠臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '拉力器十字夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃飞鸟夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '蝴蝶机器械夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '窄距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '标准俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '宽距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ],
                }
            ],
        };

        //3、背部
        this.actionArrOfDorsal = {
            partName: '背部',
            subParts: [
                {
                    name: '背部', actionArray: [
                    {name: '宽握引体向上', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '窄握引体向上', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '横杠缆绳下拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '杠铃划船', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '杠铃硬拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃硬拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿划船', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '单臂哑铃划船', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '弹力绳背拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '杠铃反斜拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},

                ]
                }
            ],
        };

        //4、腰部
        this.actionArrOfWaist = {
            partName: '腰部',
            subParts: [
                {
                    name: '腰部', actionArray: [
                    {name: '杠铃硬拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '山羊挺身', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿杠铃挺身', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '平板支撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '侧平板支撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '俯卧异侧起', equipment: "", gpmeasurement: "次", measurement: "Kg"},

                ]
                }
            ],
        };

        //5、腹部
        this.actionArrOfAbdomen = {
            partName: '腹部',
            subParts: [
                {
                    name: '腹部', actionArray: [
                    {name: '仰卧起坐', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '仰卧卷腹', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '仰卧屈膝两头起', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '仰卧举腿', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '悬垂举腿', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '平板支撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '侧身卷腹', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '负重体侧屈', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '空中蹬车', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '侧平板支撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},

                ]
                }
            ],
        };

        //6、手臂
        this.actionArrOfArms = {
            partName: '手臂',
            subParts: [
                {
                    name: '肱二头', actionArray: [
                    {name: '站姿杠铃弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿哑铃弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '托板弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '拉力器弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ]
                },
                {
                    name: '肱三头', actionArray: [
                    {name: '杠铃颈后臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃颈后臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '双杆臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '仰卧杠铃臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃俯身臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '拉力器屈臂下压', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '凳上反屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '窄握杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '窄距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ]
                },
                {
                    name: '小臂', actionArray: [
                    {name: '卷重物', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃腕弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '杠铃背后腕腕举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '杠铃腕弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '绳索腕弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '引体悬挂', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ],
                }
            ]
        };

        //7、腿部
        this.actionArrOfLegs = {
            partName: '腿部',
            subParts: [
                {
                    name: '股二头', actionArray: [
                    {name: '俯卧腿弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '单腿山羊挺身', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '杠铃直腿硬拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '反向腿弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '跪姿髋部伸展', equipment: "", gpmeasurement: "次", measurement: "Kg"},

                ]
                },
                {
                    name: '股四头', actionArray: [
                    {name: '杠铃深蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '史密斯深蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哈克深蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: 'T杠深蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '哑铃深蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '负重箭步蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '单腿前蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '箭步蹲', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '斜卧负重腿举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿水平蹬腿', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿腿屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},

                ]
                },
                {
                    name: '小腿', actionArray: [
                    {name: '站姿杠铃提踵', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '站姿单腿哑铃提踵 ', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                    {name: '坐姿杠铃负重提踵', equipment: "", gpmeasurement: "次", measurement: "Kg"},
                ],
                }
            ]
        };

        this.DefaultActionName = [
            this.actionArrOfAerobic,
            this.actionArrOfPectorales,
            this.actionArrOfShoulder,
            this.actionArrOfDorsal,
            this.actionArrOfWaist,
            this.actionArrOfAbdomen,
            this.actionArrOfArms,
            this.actionArrOfLegs
        ];
    }
}

module.exports = {
    Body: Body,
    BodyPart: BodyPart,
    Action: Action
};