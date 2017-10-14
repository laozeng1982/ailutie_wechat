/**
 * Body
 */

import PlanSet from './PlanSet'
import Bodypart from './Part'

class Body {
    constructor() {
        this.type = "";
        this.parts = [];
        this.actionSet = [];

        // just for UI control
        this.partsNameArr = [];

    }

    /**
     * 从内置的动作数据文件中，新建一个默认的身体部位列表及对应的动作信息
     */
    static createDefaultPartList() {
        let orgType = new OrgType();

        let parts = [];
        let actions = [];
        let partIndex = 1;

        for (let part of orgType.partData) {
            // console.log("part:", part);
            let bodyPart = new Bodypart.BodyPart();
            bodyPart.id = partIndex;
            bodyPart.bodyPart = part.bodyPart;
            bodyPart.name = part.name;
            bodyPart.imageUrl = part.imageUrl;

            for (let actionIdx = 0; actionIdx < part.actionArray.length; actionIdx++) {

                let action = new Bodypart.Action();
                action.id = actionIdx + 1;
                action.name = part.actionArray[actionIdx].name;
                action.imageUrl = part.actionArray[actionIdx].imageUrl;
                action.equipment = part.actionArray[actionIdx].equipment;
                action.gpMeasurement = part.actionArray[actionIdx].gpmeasurement;
                action.measurement = part.actionArray[actionIdx].measurement;
                action.partSet.push(part.name);

                actions.push(action);
                bodyPart.actionSet.push(action);
            }

            let action = new Bodypart.Action();
            action.id = bodyPart.actionSet.length + 1;
            action.name = "自定义动作";
            action.partSet.push(part.name);
            action.imageUrl = 'image/plus_128px1.png';

            //最后一个增加一个空的，作为自定义动作
            bodyPart.actionSet.push(action);

            parts.push(bodyPart);
            partIndex++;
        }

        return {parts, actions};
    }

    makeDefaultDefaultPartList() {
        let defaultPart = Body.createDefaultPartList();
        this.parts = defaultPart.parts;
        this.actionSet = defaultPart.actionSet;
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

    getPartNameArray() {
        let partNameArray = [];

        for (let part of this.parts) {
            if (!partNameArray.includes(part.bodyPart))
                partNameArray.push(part.bodyPart);
        }

        return partNameArray;
    }

    /**
     * 初始化
     * 给每一个动作，增加一个groupSet，方便以后用
     */
    initGroupSet() {
        for (let partIdx = 0; partIdx < this.parts.length; partIdx++) {
            for (let actionIdx = 0; actionIdx < this.parts[partIdx].actionSet.length; actionIdx++) {
                // 临时增加一个数据项，用以保存数据
                this.parts[partIdx].actionSet[actionIdx].groupSets = [];
                for (let idx = 0; idx < 6; idx++) {
                    let group = new PlanSet.GroupSet(idx + 1, 10,
                        this.parts[partIdx].actionSet[actionIdx].measurement, 30);

                    this.parts[partIdx].actionSet[actionIdx].groupSets.push(group);
                }
            }

        }
    }

    /**
     *
     * @param partSet
     */
    updateGroupSet(partSet) {
        for (let partIdx = 0; partIdx < this.parts.length; partIdx++) {
            if (partSet.name === this.parts[partIdx].name) {
                for (let actionItem of partSet.actionSet) {
                    for (let actionIdx = 0; actionIdx < this.parts[partIdx].actionSet.length; actionIdx++) {
                        if (actionItem.name === this.parts[partIdx].actionSet.name) {
                            this.parts[partIdx].actionSet[actionIdx].selected = true;

                            delete this.parts[partIdx].actionSet[actionIdx].groupSets;
                            this.parts[partIdx].actionSet[actionIdx].groupSets = actionItem.groupSets;
                        }
                    }
                }
            }
        }

        this.countSelectedAction();
    }

    /**
     *
     * @returns {boolean}
     */
    hasSelectedPart() {
        let hasSelectedPart = false;
        for (let part of this.parts) {
            hasSelectedPart = hasSelectedPart || part.selected;
        }

        return hasSelectedPart;
    }

    /**
     * 给定Id，选中目标部位
     * @param partId
     */
    selectPartById(partId) {
        for (let idx = 0; idx < this.parts.length; idx++) {
            if (parseInt(partId) === parseInt(this.parts[idx].id)) {
                this.parts[idx].selected = !this.parts[idx].selected;
                break;
            }
        }
    }

    /**
     * 给定Id，选中目标部位
     * @param partId
     */
    unSelectPartById(partId) {
        for (let idx = 0; idx < this.parts.length; idx++) {
            if (parseInt(partId) === parseInt(this.parts[idx].id)) {
                this.parts[idx].selected = false;
                break;
            }
        }
    }

    /**
     * 给定Id，选中目标部位
     * @param partName
     */
    selectPartByName(partName) {
        for (let idx = 0; idx < this.parts.length; idx++) {
            if (partName === this.parts[idx].bodyPart) {
                this.parts[idx].selected = true;
            }
        }
    }

    /**
     * 给定Id，高亮激活目标部位
     * @param partName
     */
    activePartByName(partName) {
        for (let idx = 0; idx < this.parts.length; idx++) {
            this.parts[idx].active = (partName === this.parts[idx].bodyPart);
        }
    }

    /**
     * 选中一组部位（多个）
     * @param partsArr
     */
    selectPartsByName(partsArr) {
        if (partsArr.length === 0) {
            return;
        }
        for (let part of this.parts) {
            part.selected = partsArr.includes(part.name);
        }
    }

    /**
     * 取消选中一组部位
     * @param partName
     */
    unSelectPartByName(partName) {
        for (let part of this.parts) {
            if (partName === part.bodyPart) {
                part.selected = false;
            }
        }
    }

    /**
     * 取消选中一组部位
     * @param partsArr
     */
    unSelectPartsByNames(partsArr) {
        if (partsArr.length === 0) {
            return;
        }

        for (let part of this.parts) {
            if (partsArr.includes(part.name)) {
                part.selected = false;
            }
        }
    }

    /**
     * 取消所有选中部位
     */
    unSelectAllParts() {
        for (let part of this.parts) {
            part.selected = false;

        }
    }

    /**
     * 统计已经选择动作的数量
     */
    countSelectedAction() {
        for (let part of this.parts) {
            let selectedActionCount = 0;

            for (let action of part.actionSet) {
                if (action.selected) {
                    selectedActionCount++;
                }
            }

            part.selectedActionCount = selectedActionCount;
        }
    }

    /**
     * 选中一个动作
     * @param actionName
     */
    selectAction(actionName) {
        for (let part of this.parts) {
            if (part.selected && part.active) {
                for (let action of part.actionSet) {
                    if (actionName === action.name) {
                        action.selected = !action.selected;
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
        for (let partIdx = 0; partIdx < this.parts.length; partIdx++) {
            this.parts[partIdx].selected = false;
            for (let actionIdx = 0; actionIdx < this.parts[partIdx].actionSet.length; actionIdx++) {
                this.parts[partIdx].action[actionIdx].selected = false;
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
        for (let part of this.parts) {
            if (part.selected && part.active) {
                delete part.actionSet[subPartIdx].groupSet;
                part.actionSet[subPartIdx].groupSet = groupSet;
                // 因为选中picker同时会响应这个外部view的函数，也就是说会响应onSelectAction，所以需要重置一些状态
                // 重新置为选中，和记数
                part.actionSet[subPartIdx].selected = true;
            }
        }

        this.countSelectedAction();
    }


    getSelectedActionGpMeausement(subPartIdx, actionName) {
        for (let part of this.parts) {
            if (part.selected && part.active) {
                for (let action of part.actionSet) {
                    if (actionName === action.name) {
                        return action.gpMeasurement;
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

        for (let part of this.parts) {
            let thisPartActionSelected = true;
            if (part.selected) {
                thisPartActionSelected = false;
                for (let action of part.actionSet) {
                    thisPartActionSelected = thisPartActionSelected || action.selected;
                }
            }

            allActionSelected = allActionSelected && thisPartActionSelected;
        }

        return this.hasSelectedPart() && allActionSelected;
    }

    /**
     * 为每个部位添加选中的日期
     * @param partSet
     * @param cycleLength
     */
    makeLabel(partSet, cycleLength) {
        for (let partIdx = 0; partIdx < this.parts.length; partIdx++) {
            if (partSet.name === this.parts[partIdx].name) {
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
                    this.parts[partIdx].trainDateArr = partSet.trainDates;
                    this.parts[partIdx].trainDateStr = "( " + trainDate.join("，") + " )";
                    console.log("partSets.trainDateStr ", this.parts[partIdx].trainDateStr);
                } else {
                    // 需要加1，新建数组，不改变原数组的值
                    let trainDate = [];
                    for (let idx = 0; idx < partSet.trainDates.length; idx++) {
                        trainDate.push(partSet.trainDates[idx] + 1);
                    }
                    this.parts[partIdx].trainDateArr = partSet.trainDates;
                    this.parts[partIdx].trainDateStr = "(第 " + trainDate.join("，") + " 天)";
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
        for (let part of this.parts) {
            if (typeof part.trainDateArr === "undefined") {
                orderPartList.push(part);
            }
        }

        let str = [];
        for (let item of orderPartList) {
            str.push(item.name);
        }
        console.log(str.toString());

        // 再排有计划的，如果计划有多天，按照第一天谁靠前排序
        for (let part of this.parts) {
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
                    str2.push(item.name);
                }

                // console.log("insertPos:", insertPos, "orderPartList:", str2.toString());
                // console.log("with plan", part.name);
            }
        }

        this.parts = orderPartList;
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

class OrgType {
    constructor() {
        this.partData = [];
        // 0、有氧
        this.partData.push({
            bodyPart: "全身", // 'All',
            name: '有氧',
            imageUrl: 'image/bodyparts/aerobic.png',
            actionArray: [
                {
                    name: '跑步',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/跑步.png',
                    measurement: "Km"
                },
                {
                    name: '原地跑步',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/原地跑步.png',
                    measurement: "Km"
                },
                {
                    name: '原地高抬腿',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/原地高抬腿.png',
                    measurement: "Km"
                },
                {
                    name: '快走',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/快走.png',
                    measurement: "Km"
                },
                {
                    name: '椭圆机',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/椭圆机.png',
                    measurement: "次"
                },
                {
                    name: '开合跳',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/开合跳.png',
                    measurement: "Km"
                },
                {
                    name: '动感单车',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/动感单车.png',
                    measurement: "Km"
                },
                {
                    name: '登山机',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/登山机.png',
                    measurement: "Km"
                },
                {
                    name: '跳绳',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/跳绳.png',
                    measurement: "Km"
                },
                {
                    name: '俯身登山',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/icon/aerobic/俯身登山.png',
                    measurement: "Km"
                },
            ]
        });

        // 1、胸部
        this.partData.push({
            bodyPart: "胸部", // 'Chest',
            name: '胸上部',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '上斜杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/平板杠铃卧推.png',
                    measurement: "Kg"
                },
                {
                    name: '上斜哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/上斜哑铃卧推.png',
                    measurement: "Kg"
                },
                {
                    name: '上斜器械卧推',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/上斜器械卧推.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "胸部", // 'Chest',
            name: '胸中部',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '平卧杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/平板杠铃卧推.png',
                    measurement: "Kg"
                },
                {
                    name: '平卧哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/平板哑铃卧推.png',
                    measurement: "Kg"
                },
                {
                    name: '平板器械卧推',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/平板器械卧推.png',
                    measurement: "Kg"
                },

            ]
        });

        this.partData.push({
            bodyPart: "胸部", // 'Chest',
            name: '胸下部',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '下斜杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/平板杠铃卧推.png',
                    measurement: "Kg"
                },
                {
                    name: '下斜哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/平板哑铃卧推.png',
                    measurement: "Kg"
                },
                {
                    name: '双杠臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/双杠臂屈伸.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "胸部", // 'Chest',
            name: '俯卧撑',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '上斜宽距俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/上斜宽距俯卧撑.png',
                    measurement: "Kg"
                },
                {
                    name: '标准俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/标准俯卧撑.png',
                    measurement: "Kg"
                },
                {
                    name: '下斜钻石俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/下斜钻石俯卧撑.png',
                    measurement: "Kg"
                },
                {
                    name: '跪姿俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/跪姿俯卧撑.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "胸部", // 'Chest',
            name: '夹胸',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '上斜哑铃飞鸟',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/上斜哑铃飞鸟.png',
                    measurement: "Kg"
                },
                {
                    name: '平板哑铃飞鸟',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/平板哑铃飞鸟.png',
                    measurement: "Kg"
                },
                {
                    name: '蝴蝶机器械夹胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/蝴蝶机器械夹胸.png',
                    measurement: "Kg"
                },
                {
                    name: '拉力器十字夹胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/拉索夹胸.png',
                    measurement: "Kg"
                },
                {
                    name: '下斜拉索夹胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/chest/下斜拉索夹胸.png',
                    measurement: "Kg"
                },
            ]

        });

        //2、肩部
        this.partData.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '前束',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '劲前杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/劲前杠铃推举.png',
                    measurement: "Kg"
                },
                {
                    name: '器械推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/器械推举.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑单臂铃前平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/站姿哑单臂铃前平举.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃前平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/站姿哑铃前平举.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '中束',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '器械推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/器械推举.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/坐姿哑铃推举.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/站姿哑铃推举.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/站姿哑铃侧平举.png',
                    measurement: "Kg"
                },
                {
                    name: 'L侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/L侧平举.png',
                    measurement: "Kg"
                },
                {
                    name: '阿诺德哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/阿诺德哑铃推举.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '后束',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '劲后杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/劲后杠铃推举.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身拉索侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/俯身拉索侧平举.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身哑铃侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/俯身哑铃侧平举.png',
                    measurement: "Kg"
                },
            ],
        });

        this.partData.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '斜方肌',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '站姿耸肩',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/shoulder/站姿耸肩.png',
                    measurement: "Kg"
                },
            ],
        });

        //3、背部
        this.partData.push({
            bodyPart: "背部", // 'Back',
            name: '背部',
            imageUrl: 'image/bodyparts/back.png',
            actionArray: [
                {
                    name: '反握宽距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/反握宽距引体向上.png',
                    measurement: "Kg"
                },
                {
                    name: '反握窄距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/反握窄距引体向上.png',
                    measurement: "Kg"
                },
                {
                    name: '正握宽距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/正握宽距引体向上.png',
                    measurement: "Kg"
                },
                {
                    name: '正握窄距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/正握窄距引体向上.png',
                    measurement: "Kg"
                },
                {
                    name: '标准高位下拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/标准高位下拉.png',
                    measurement: "Kg"
                },
                {
                    name: '反握高位下拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/反握高位下拉.png',
                    measurement: "Kg"
                },
                {
                    name: '器械反握下拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/器械反握下拉.png',
                    measurement: "Kg"
                },
                {
                    name: '反向器械飞鸟',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/反向器械飞鸟.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身单臂哑铃划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/俯身单臂哑铃划船.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿器械对握划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/坐姿器械对握划船.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身反握杠铃划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/俯身反握杠铃划船.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身反握哑铃划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/俯身反握哑铃划船.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃罗马尼亚硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/杠铃罗马尼亚硬拉.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃直腿硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/back/杠铃直腿硬拉.png',
                    measurement: "Kg"
                },
            ]
        });

        //4、腰部
        this.partData.push({
            bodyPart: "腰部",// 'Waist',
            name: '腰部',
            imageUrl: 'image/bodyparts/waist.png',
            actionArray: [
                {
                    name: '杠铃罗马尼亚硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/waist/杠铃罗马尼亚硬拉.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃直腿硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/waist/杠铃直腿硬拉.png',
                    measurement: "Kg"
                },
                {
                    name: '平板支撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/waist/平板支撑.png',
                    measurement: "Kg"
                },
                {
                    name: '山羊挺身',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/waist/山羊挺身.png',
                    measurement: "Kg"
                },
                {
                    name: '十字挺身',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/waist/十字挺身.png',
                    measurement: "Kg"
                },
            ]
        });

        //5、腹部
        this.partData.push({
            bodyPart: "腹部",// 'Abdomen',
            name: '腹部',
            imageUrl: 'image/bodyparts/abs.png',
            actionArray: [
                {
                    name: '下斜仰卧起坐',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/下斜仰卧起坐.png',
                    measurement: "Kg"
                },
                {
                    name: '屈膝卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/屈膝卷腹.png',
                    measurement: "Kg"
                },
                {
                    name: '反向卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/反向卷腹.png',
                    measurement: "Kg"
                },
                {
                    name: '器械卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/器械卷腹.png',
                    measurement: "Kg"
                },
                {
                    name: '悬垂卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/悬垂卷腹.png',
                    measurement: "Kg"
                },
                {
                    name: '悬垂举腿',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/悬垂举腿.png',
                    measurement: "Kg"
                },
                {
                    name: '负重俄罗斯转体',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/负重俄罗斯转体.png',
                    measurement: "Kg"
                },
                {
                    name: '空中单车',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/空中单车.png',
                    measurement: "Kg"
                },
                {
                    name: '自重臀桥',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/空中单车.png',
                    measurement: "Kg"
                },
                {
                    name: '平板支撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/平板支撑.png',
                    measurement: "Kg"
                },
                {
                    name: 'V型平衡',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/abs/V型平衡.png',
                    measurement: "Kg"
                },
            ]
        });

        //6、手臂
        this.partData.push({
            bodyPart: "手臂",   // 'Arm',
            name: '肱二头',
            imageUrl: 'image/bodyparts/arm.png',
            actionArray: [
                {
                    name: '站姿杠铃弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/站姿杠铃弯举.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿重锤弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/站姿重锤弯举.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿哑铃集中弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/坐姿哑铃集中弯举.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿重锤弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/坐姿重锤弯举.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿哑铃弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/坐姿哑铃弯举.png',
                    measurement: "Kg"
                },
                {
                    name: '托板哑铃弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/托板哑铃弯举.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿拉索弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/站姿拉索弯举.png',
                    measurement: "Kg"
                },

            ]
        });

        this.partData.push({
            bodyPart: "手臂",   // 'Arm',
            name: '肱三头',
            imageUrl: 'image/bodyparts/arm.png',
            actionArray: [
                {
                    name: '仰卧杠铃劲后臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/仰卧杠铃劲后臂屈伸.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿单臂劲后臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/站姿单臂劲后臂屈伸.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃劲后屈臂伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/站姿哑铃劲后屈臂伸.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿拉索下压',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/站姿拉索下压.png',
                    measurement: "Kg"
                },
                {
                    name: '双杠臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/双杠臂屈伸.png',
                    measurement: "Kg"
                },
                {
                    name: '器械直臂下压',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/器械直臂下压.png',
                    measurement: "Kg"
                },
                {
                    name: '器械臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/器械臂屈伸.png',
                    measurement: "Kg"
                },
                {
                    name: '标准俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/标准俯卧撑.png',
                    measurement: "Kg"
                },
                {
                    name: '钻石俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/arm/钻石俯卧撑.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "手臂",   // 'Arm',
            name: '小臂',
            imageUrl: 'image/bodyparts/arm.png',
            actionArray: [
                {
                    name: '卷重物',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/icon/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '哑铃腕弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/icon/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃背后腕腕举',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/icon/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃腕弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/icon/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '引体悬挂',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/icon/arm/aerobic.png',
                    measurement: "Kg"
                },
            ]
        });

        //7、腿部
        this.partData.push({
            bodyPart: "腿部", // 'Leg',
            name: '股二头',
            imageUrl: 'image/bodyparts/legs.png',
            actionArray: [
                {
                    name: '俯卧器械腿弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/俯卧器械腿弯举.png',
                    measurement: "Kg"
                },
                {
                    name: '器械腿后展',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/器械腿后展.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "腿部", // 'Leg',
            name: '股四头',
            imageUrl: 'image/bodyparts/legs.png',
            actionArray: [
                {
                    name: '杠铃深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/杠铃深蹲.png',
                    measurement: "Kg"
                },
                {
                    name: '劲前杠铃深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/劲前杠铃深蹲.png',
                    measurement: "Kg"
                },
                {
                    name: '器械哈克深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/器械哈克深蹲.png',
                    measurement: "Kg"
                },
                {
                    name: '哑铃深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/哑铃深蹲.png',
                    measurement: "Kg"
                },
                {
                    name: '靠墙马步蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/靠墙马步蹲.png',
                    measurement: "Kg"
                },
                {
                    name: '器械腿举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/器械腿举.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿单腿腿举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/坐姿单腿腿举.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃翘臀分腿蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/杠铃翘臀分腿蹲.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿腿屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/坐姿腿屈伸.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿器械腿外展',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/坐姿器械腿外展.png',
                    measurement: "Kg"
                },
            ]
        });

        this.partData.push({
            bodyPart: "腿部", // 'Leg',
            name: '小腿',
            imageUrl: 'image/bodyparts/legs.png',
            actionArray: [
                {
                    name: '站姿负重提踵',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/站姿负重提踵.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿提踵',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/icon/legs/坐姿提踵.png',
                    measurement: "Kg"
                },
            ]
        });

    }
}

module.exports = {
    Body: Body,
};