/**
 * Body
 */

import PlanSet from './PlanSet'
import Part from './Part'
import Action from './Action'

class Body {
    constructor() {
        this.type = "";
        this.parts = [];

    }

    /**
     * 从内置的动作数据文件中，新建一个默认的身体部位列表及对应的动作信息
     */
    static createDefaultPartList() {
        let partDictionary = new PartDictionary();

        let parts = [];
        let actions = [];
        let partIndex = 1;

        for (let part of partDictionary.data) {
            let bodyPart = new Part.BodyPart();
            bodyPart.id = partIndex;
            bodyPart.bodyPart = part.bodyPart;
            bodyPart.name = part.name;
            bodyPart.imageUrl = part.imageUrl;

            for (let actionIdx = 0; actionIdx < part.actionArray.length; actionIdx++) {

                let action = new Action.Action();
                action.id = actionIdx + 1;
                action.name = part.actionArray[actionIdx].name;
                action.imageUrl = part.actionArray[actionIdx].imageUrl;
                action.equipment = part.actionArray[actionIdx].equipment;
                action.gpMeasurement = part.actionArray[actionIdx].gpmeasurement;
                action.measurement = part.actionArray[actionIdx].measurement;
                action.partSet.push(part.bodyPart);

                actions.push(action);
                bodyPart.actionSet.push(action);
            }


            parts.push(bodyPart);
            partIndex++;
        }

        // 每个大类的最后一个小part增加一个自定义动作
        let lastIdx = parts.length - 1;
        for (let idx = 0; idx < parts.length; idx++) {
            if (idx !== lastIdx && parts[idx].bodyPart !== parts[idx + 1].bodyPart) {
                let action = new Action.Action();
                action.id = parts[idx].actionSet.length + 1;
                action.name = "自定义动作";
                action.imageUrl = 'image/plus_64px1.png';
                action.partSet.push(parts[idx].bodyPart);
                parts[idx].actionSet.push(action);
            } else {
                let action = new Action.Action();
                action.id = parts[lastIdx].actionSet.length + 1;
                action.name = "自定义动作";
                action.imageUrl = 'image/plus_64px1.png';
                action.partSet.push(parts[lastIdx].bodyPart);
                parts[lastIdx].actionSet.push();
            }
        }

        return {parts, actions};
    }

    /**
     * 从一个对象复制数据过来，保留本对象的方法
     * @param obj
     */
    cloneDataFrom(obj) {
        // 递归
        for (let item in obj) {
            if (obj.hasOwnProperty(item)) {
                this[item] = typeof obj[item] === "object" ? deepClone(obj[item]) : obj[item];
            }
        }
    }

    makeDefaultDefaultPartList() {
        let defaultPart = Body.createDefaultPartList();
        this.parts = defaultPart.parts;

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
                this.parts[partIdx].actionSet[actionIdx].groupSet = [];
                for (let idx = 0; idx < 6; idx++) {
                    let group = new PlanSet.GroupSet(idx + 1, 10,
                        30, this.parts[partIdx].actionSet[actionIdx].measurement);

                    this.parts[partIdx].actionSet[actionIdx].groupSet.push(group);
                }
            }
        }
    }

    /**
     * 根据计划内容更改
     * @param exercise
     */
    updateGroupSet(exercise) {
        for (let partIdx = 0; partIdx < this.parts.length; partIdx++) {
            // 先判断大类，即bodyPart是否一样
            if (exercise.action.partSet[0] === this.parts[partIdx].bodyPart) {
                for (let actionIdx = 0; actionIdx < this.parts[partIdx].actionSet.length; actionIdx++) {
                    // 判断具体动作的名字是否一样
                    if (exercise.action.name === this.parts[partIdx].actionSet[actionIdx].name) {
                        this.parts[partIdx].actionSet[actionIdx].selected = true;

                        delete this.parts[partIdx].actionSet[actionIdx].groupSet;
                        this.parts[partIdx].actionSet[actionIdx].groupSet = exercise.groupSet;
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

    getSelectedPartNames() {
        let selectedPartNames = [];
        for (let part of this.parts) {
            for (let action of part.actionSet) {
                if (action.selected && !selectedPartNames.includes(part.bodyPart)) {
                    selectedPartNames.push(part.bodyPart);
                }
            }
        }

        return selectedPartNames;
    }

    hasSelectedAction() {
        let hasSelectedAction = false;
        for (let part of this.parts) {
            for (let action of part.actionSet) {
                hasSelectedAction = hasSelectedAction || action.selected;
            }
        }

        return hasSelectedAction;
    }

    getSelectedAction() {
        let selectedAction = [];

        for (let part of this.parts) {
            for (let action of part.actionSet) {
                if (action.selected) {
                    selectedAction.push(action);
                }
            }
        }

        return selectedAction;
    }

    getSelectedActionByPartName(partName) {
        let selectedAction = [];

        for (let part of this.parts) {
            if (part.bodyPart=== partName) {
                for (let action of part.actionSet) {
                    if (action.selected) {
                        selectedAction.push(action);
                    }
                }
            }
        }

        return selectedAction;
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
        for (let part of this.parts) {
            part.selected = (partName === part.bodyPart);
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
            part.selected = partsArr.includes(part.bodyPart);
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
     *
     * @param partName
     */
    getActionSelectedCountByPart(partName) {
        let selectedActionCount = 0;

        for (let part of this.parts) {

            if (part.bodyPart === partName) {
                selectedActionCount = selectedActionCount + part.selectedActionCount;
            }
        }
        // console.log(partName, selectedActionCount);
        return selectedActionCount;
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
    selectActionByName(actionName) {
        for (let part of this.parts) {
            if (part.selected) {
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
                this.parts[partIdx].actionSet[actionIdx].selected = false;
            }
        }
    }

    /**
     *
     * @param selectedAction
     * @param groupSet
     */
    addGroupSetToAction(selectedAction, groupSet) {
        for (let part of this.parts) {
            if (part.selected) {
                for (let action of part.actionSet) {
                    if (selectedAction.partSet[0] === action.partSet[0] && selectedAction.name === action.name) {
                        delete action.groupSet;
                        action.groupSet = groupSet;
                        // 因为选中picker同时会响应这个外部view的函数，也就是说会响应onSelectAction，所以需要重置一些状态
                        // 重新置为选中，和记数
                        action.selected = true;
                    }
                }
            }
        }

        this.countSelectedAction();
    }


    getSelectedActionGpMeausement(subPartIdx, actionName) {
        for (let part of this.parts) {
            if (part.selected) {
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

class PartDictionary {
    constructor() {
        this.data = [];
        // 0、有氧
        this.data.push({
            bodyPart: "全身", // 'All',
            name: '有氧',
            imageUrl: 'image/bodyparts/aerobic.png',
            actionArray: [
                {
                    name: '慢跑',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/canter.png',
                    measurement: "Km"
                },
                {
                    name: '原地跑步',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/running_on_the_spot.png',
                    measurement: "Km"
                },
                {
                    name: '原地高抬腿',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/place_high_leg_on_the_spot.png',
                    measurement: "Km"
                },
                {
                    name: '快走',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/fast_walking.png',
                    measurement: "Km"
                },
                {
                    name: '椭圆机',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/elliptical_machine.png',
                    measurement: "次"
                },
                {
                    name: '开合跳',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/jumping_jacks.png',
                    measurement: "Km"
                },
                {
                    name: '动感单车',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/spinning.png',
                    measurement: "Km"
                },
                {
                    name: '登山机',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/climbing.png',
                    measurement: "Km"
                },
                {
                    name: '跳绳',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/rope_skipping.png',
                    measurement: "Km"
                },
                {
                    name: '俯身登山',
                    equipment: "",
                    gpmeasurement: "分钟",
                    imageUrl: 'image/actions/aerobic/bend_over_climbing.png',
                    measurement: "Km"
                },
            ]
        });

        // 1、胸部
        this.data.push({
            bodyPart: "胸部", // 'Chest',
            name: '胸上部',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '上斜杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/horizontal_barbell_bench_press.png',
                    measurement: "Kg"
                },
                {
                    name: '上斜哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/incline_dumbbell_bench_press.png',
                    measurement: "Kg"
                },
                {
                    name: '上斜器械推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/incline_machine_press.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "胸部", // 'Chest',
            name: '胸中部',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '平板杠铃卧推',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/horizontal_barbell_bench_press.png',
                    measurement: "Kg"
                },
                {
                    name: '平板哑铃卧推',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/horizontal_dumbbell_bench_press.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿器械推胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/seated_machine_press.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "胸部", // 'Chest',
            name: '胸下部',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '下斜杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/horizontal_barbell_bench_press.png',
                    measurement: "Kg"
                },
                {
                    name: '下斜哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/horizontal_dumbbell_bench_press.png',
                    measurement: "Kg"
                },
                {
                    name: '双杠臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/dip_on_parallel_bars.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "胸部", // 'Chest',
            name: '俯卧撑',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '上斜宽距俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/incline_wide_push_up.png',
                    measurement: "Kg"
                },
                {
                    name: '标准俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/stand_push_up.png',
                    measurement: "Kg"
                },
                {
                    name: '下斜钻石俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/down_incline_diamond_push_up.png',
                    measurement: "Kg"
                },
                {
                    name: '跪姿俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/kneel_push_up.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "胸部", // 'Chest',
            name: '夹胸',
            imageUrl: 'image/bodyparts/chest.png',
            actionArray: [
                {
                    name: '上斜哑铃飞鸟',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/incline_dumbbell_bench_fly.png',
                    measurement: "Kg"
                },
                {
                    name: '平板哑铃飞鸟',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/horizontal_dumbbell_bench_fly.png',
                    measurement: "Kg"
                },
                {
                    name: '蝴蝶机器械夹胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/butterfly_machine_crossover.png',
                    measurement: "Kg"
                },
                {
                    name: '上斜拉索夹胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/incline_able_crossover.png',
                    measurement: "Kg"
                },
                {
                    name: '拉力器十字夹胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/cable_crossover.png',
                    measurement: "Kg"
                },
                {
                    name: '下斜拉索夹胸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/chest/decline_cable_crossover.png',
                    measurement: "Kg"
                },
            ]

        });

        //2、肩部
        this.data.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '前束',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '颈前杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/bar_military_press.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑单臂铃前平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/standing_one_arm_dumbbell_front_press.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃前平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/standing_dumbbells_front_press.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '中束',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '器械推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/machine_press.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/seated_dumbbell_press.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/standing_dumbbell_press.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/standing_dumbbell_lateral_raise.png',
                    measurement: "Kg"
                },
                {
                    name: 'L侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/L_lateral_raise.png',
                    measurement: "Kg"
                },
                {
                    name: '阿诺德哑铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/arnold_press.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '后束',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '颈后杠铃推举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/overhead_bar_press.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身拉索侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/cable_rear_lateral_raise.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身哑铃侧平举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/dumbbell_rear_lateral_raise.png',
                    measurement: "Kg"
                },
                {
                    name: '哑铃反向飞鸟',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/dumbbell_reverse_fly.png',
                    measurement: "Kg"
                },
            ],
        });

        this.data.push({
            bodyPart: "肩部", // 'Shoulder',
            name: '斜方肌',
            imageUrl: 'image/bodyparts/shoulder.png',
            actionArray: [
                {
                    name: '站姿耸肩',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/shoulder/stand_shrug.png',
                    measurement: "Kg"
                },
            ],
        });

        //3、背部
        this.data.push({
            bodyPart: "背部", // 'Back',
            name: '背部',
            imageUrl: 'image/bodyparts/back.png',
            actionArray: [
                {
                    name: '反握宽距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/reverse_neutral_grip_pull_up.png',
                    measurement: "Kg"
                },
                {
                    name: '反握窄距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/reverse_narrow_pull_up.png',
                    measurement: "Kg"
                },
                {
                    name: '正握宽距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/neutral_grip_pull_up.png',
                    measurement: "Kg"
                },
                {
                    name: '正握窄距引体向上',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/narrow_pull_up.png',
                    measurement: "Kg"
                },
                {
                    name: '标准高位下拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/stand_machine_pull_up.png',
                    measurement: "Kg"
                },
                {
                    name: '反握高位下拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/reverse_cable_pull_up.png',
                    measurement: "Kg"
                },
                {
                    name: '器械反握下拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/reverse_machine_pull_up.png',
                    measurement: "Kg"
                },
                {
                    name: '反向器械飞鸟',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/reverse_machine_fly.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身单臂哑铃划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/bent_over_one_arm_row.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿器械对握划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/seated_cable_close_row.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身反握杠铃划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/bent_over_reverse_barbell_row.png',
                    measurement: "Kg"
                },
                {
                    name: '俯身反握哑铃划船',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/bent_over_reverse_dumbbell_row.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃罗马尼亚硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/romanian_barbell_deadlift.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃直腿硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/back/straight_leg_barbell_deadlift.png',
                    measurement: "Kg"
                },
            ]
        });

        //4、腰部
        this.data.push({
            bodyPart: "腰部",// 'Waist',
            name: '腰部',
            imageUrl: 'image/bodyparts/waist.png',
            actionArray: [
                {
                    name: '杠铃罗马尼亚硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/waist/romanian_barbell_deadlift.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃直腿硬拉',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/waist/straight_leg_barbell_deadlift.png',
                    measurement: "Kg"
                },
                {
                    name: '平板支撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/waist/plank.png',
                    measurement: "Kg"
                },
                {
                    name: '山羊挺身',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/waist/back_hyperextension.png',
                    measurement: "Kg"
                },
                {
                    name: '十字挺身',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/waist/cross_lift.png',
                    measurement: "Kg"
                },
            ]
        });

        //5、腹部
        this.data.push({
            bodyPart: "腹部",// 'Abdomen',
            name: '腹部',
            imageUrl: 'image/bodyparts/abs.png',
            actionArray: [
                {
                    name: '下斜仰卧起坐',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/decline_sit_up.png',
                    measurement: "Kg"
                },
                {
                    name: '屈膝卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/bent_leg_crunch.png',
                    measurement: "Kg"
                },
                {
                    name: '反向卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/reverse_crunch.png',
                    measurement: "Kg"
                },
                {
                    name: '器械卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/machine_crunch.png',
                    measurement: "Kg"
                },
                {
                    name: '悬垂卷腹',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/hanging_crunch.png',
                    measurement: "Kg"
                },
                {
                    name: '悬垂举腿',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/hanging_leg_raise.png',
                    measurement: "Kg"
                },
                {
                    name: '负重俄罗斯转体',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/weighted_russian_twist.png',
                    measurement: "Kg"
                },
                {
                    name: '空中单车',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/sky_bike.png',
                    measurement: "Kg"
                },
                {
                    name: '自重臀桥',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/self_weighted_hip_bridge.png',
                    measurement: "Kg"
                },
                {
                    name: '平板支撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/plank.png',
                    measurement: "Kg"
                },
                {
                    name: 'V型平衡',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/abs/v_balance.png',
                    measurement: "Kg"
                },
            ]
        });

        //6、手臂
        this.data.push({
            bodyPart: "手臂",   // 'Arm',
            name: '肱二头',
            imageUrl: 'image/bodyparts/arm.png',
            actionArray: [
                {
                    name: '站姿杠铃弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/standing_barbell_biceps_curl.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿重锤弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/standing_hammer_curl.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿哑铃集中弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/seated_dumbbell_focus_curl.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿重锤弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/seated_hammer_curl.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿哑铃弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/seated_dumbbell_biceps_curl.png',
                    measurement: "Kg"
                },
                {
                    name: '托板哑铃弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/incline_dumbbell_curl.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿拉索弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/standing_cable_curl.png',
                    measurement: "Kg"
                },

            ]
        });

        this.data.push({
            bodyPart: "手臂",   // 'Arm',
            name: '肱三头',
            imageUrl: 'image/bodyparts/arm.png',
            actionArray: [
                {
                    name: '仰卧杠铃颈后臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/lying_barbell_dip.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿单臂颈后臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/standing_one_arm_dip.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿哑铃颈后屈臂伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/standing_dumbbell_dip.png',
                    measurement: "Kg"
                },
                {
                    name: '站姿拉索下压',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/standing_cable_triceps_push_down.png',
                    measurement: "Kg"
                },
                {
                    name: '双杠臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/parallel_bar_dip.png',
                    measurement: "Kg"
                },
                {
                    name: '器械直臂下压',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/machine_push_down.png',
                    measurement: "Kg"
                },
                {
                    name: '器械臂屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/machine_dip.png',
                    measurement: "Kg"
                },
                {
                    name: '标准俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/standard_push_up.png',
                    measurement: "Kg"
                },
                {
                    name: '钻石俯卧撑',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/arm/diamond_push_up.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "手臂",   // 'Arm',
            name: '小臂',
            imageUrl: 'image/bodyparts/arm.png',
            actionArray: [
                {
                    name: '卷重物',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '哑铃腕弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃背后腕腕举',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃腕弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/arm/aerobic.png',
                    measurement: "Kg"
                },
                {
                    name: '引体悬挂',
                    equipment: "",
                    gpmeasurement: "次",
                    // imageUrl: 'image/actions/arm/aerobic.png',
                    measurement: "Kg"
                },
            ]
        });

        //7、腿部
        this.data.push({
            bodyPart: "腿部", // 'Leg',
            name: '股二头',
            imageUrl: 'image/bodyparts/legs.png',
            actionArray: [
                {
                    name: '俯卧器械腿弯举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/bent_over_machine_leg_curl.png',
                    measurement: "Kg"
                },
                {
                    name: '器械腿后展',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/cable_hamstring_curl.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "腿部", // 'Leg',
            name: '股四头',
            imageUrl: 'image/bodyparts/legs.png',
            actionArray: [
                {
                    name: '杠铃深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/barbell_overhead_squat.png',
                    measurement: "Kg"
                },
                {
                    name: '颈前杠铃深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/barbell_before_neck_squat.png',
                    measurement: "Kg"
                },
                {
                    name: '器械哈克深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/machine_hack_squat.png',
                    measurement: "Kg"
                },
                {
                    name: '哑铃深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/dumbbell_squat.png',
                    measurement: "Kg"
                },
                {
                    name: '徒手深蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/none_weighted_squat.png',
                    measurement: "Kg"
                },
                {
                    name: '靠墙马步蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/firm_stance.png',
                    measurement: "Kg"
                },
                {
                    name: '器械腿举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/machine_leg_lift.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿单腿腿举',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/seated_one_leg_lift.png',
                    measurement: "Kg"
                },
                {
                    name: '杠铃翘臀分腿蹲',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/barbell_one_leg_squat.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿腿屈伸',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/seated_leg_dip.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿器械腿外展',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/seated_machine_leg_split.png',
                    measurement: "Kg"
                },
            ]
        });

        this.data.push({
            bodyPart: "腿部", // 'Leg',
            name: '小腿',
            imageUrl: 'image/bodyparts/legs.png',
            actionArray: [
                {
                    name: '站姿负重提踵',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/standing_calf_raise.png',
                    measurement: "Kg"
                },
                {
                    name: '坐姿提踵',
                    equipment: "",
                    gpmeasurement: "次",
                    imageUrl: 'image/actions/leg/seated_calf_raise.png',
                    measurement: "Kg"
                },
            ]
        });

    }
}

/**
 * 深度克隆数据的方法
 * @param obj
 * @returns {*}
 */
function deepClone(obj) {

    let clone = obj.constructor === Array ? [] : {};

    // 递归
    for (let item in obj) {
        if (obj.hasOwnProperty(item)) {
            clone[item] = typeof obj[item] === "object" ? deepClone(obj[item]) : obj[item];
        }
    }

    return clone;
}

module.exports = {
    Body: Body,
};