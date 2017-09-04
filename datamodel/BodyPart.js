/**
 * Bod
 */

class BodyPartList {
    constructor() {
        this.type = "";
        this.partList = this.createDefaultPartList();
    }

    /**
     *
     */
    createDefaultPartList() {
        var orgType = new OrgType();

        // console.log("in createDefaultPartList, orgType", orgType);

        var partList = [];
        var partIndex = 1;
        var partName;

        for (var item of orgType.DefaultActionName) {
            // console.log(item);
            var bodyPart = new BodyPart();
            partName = item[0];
            bodyPart.partId = partIndex;
            bodyPart.partName = partName;
            for (var idx = 1; idx < item.length; idx++) {
                var action = new Action();
                action.actionId = idx;
                action.actionName = item[idx].name;
                action.actionEquipment = item[idx].equipment;
                action.actionGpMeasurement = item[idx].gpmeasurement;
                action.actionMeasurement = item[idx].measurement;
                action.actionPartId = partIndex;
                action.actionPart = partName;
                bodyPart.actionList.push(action);
            }

            var action = new Action();
            action.actionId = item.length;
            action.actionName = "自定义动作";
            action.actionPartId = partIndex;
            action.actionPart = partName;
            bodyPart.actionList.push(action);

            partList.push(bodyPart);
            partIndex++;
        }

        return partList;
    }

    fullCopyFrom(bodyPartList) {
        this.type = bodyPartList.type;
        this.partList = bodyPartList.partList;
    }

    /**
     * 清楚选中项
     */
    clearSelection() {
        for (var partIdx = 0; partIdx < this.partList.length; partIdx++) {
            this.partList[partIdx].selected = false;

            for (var mvIdx = 0; mvIdx < this.partList[partIdx].actionList.length; mvIdx++)
                this.partList[partIdx].actionList[mvIdx].actionSelected = false;
        }
        // console.log("in BodyPartList.clearSelection, ", this.partList);
    }
}

class BodyPart {
    constructor() {
        this.partId = '';
        this.partName = '';
        this.partPictureSrc = '';
        this.partDescription = '';
        this.selected = false;
        this.actionList = [];
    }

}

class Action {
    constructor() {
        this.actionId = '';
        this.actionName = '';
        this.actionPart = '';
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

        // 有氧
        this.movementNameArrayAerobic = [
            '有氧',
            {name: '跑步', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
            {name: '游泳', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
            {name: '跳绳', equipment: "", gpmeasurement: "分钟", measurement: "次"},
            {name: '自行车', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
            {name: '椭圆机', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
            {name: '划船机', equipment: "", gpmeasurement: "分钟", measurement: "Km"},
            {name: '动感单车', equipment: "", gpmeasurement: "分钟", measurement: "Km"},

        ];
        //0、胸部
        this.movementNameArrayPectorales = [
            '胸部',
            {name: '上斜杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '上斜哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '平卧杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '平卧哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '下斜杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '下斜哑铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '双杠臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '拉力器十字夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '哑铃飞鸟夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '蝴蝶机器械夹胸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '窄距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '标准俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '宽距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
        ];

        //1、肩部
        this.movementNameArrayShoulder = [
            '肩部',
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
        ];

        //2、背部
        this.movementNameArrayDorsal = [
            '背部',
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
        ];

        //3、腰部
        this.movementNameArrayWaist = [
            '腰部',
            {name: '杠铃硬拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '山羊挺身', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '坐姿杠铃挺身', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '平板支撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '侧平板支撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '俯卧异侧起', equipment: "", gpmeasurement: "次", measurement: "Kg"},
        ];

        //4、腹部
        this.movementNameArrayAbdomen = [
            '腹部',
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
        ];

        //5、肱二头
        this.movementNameArrayArmBiceps = [
            '肱二头',
            {name: '站姿杠铃弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '坐姿哑铃弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '托板弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '拉力器弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
        ];

        //6、肱三头
        this.movementNameArrayArmTriceps = [
            '肱三头',
            {name: '杠铃颈后臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '哑铃颈后臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '双杆臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '仰卧杠铃臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '哑铃俯身臂屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '拉力器屈臂下压', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '凳上反屈伸', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '窄握杠铃推举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '窄距俯卧撑', equipment: "", gpmeasurement: "次", measurement: "Kg"},
        ];

        //7、小臂
        this.movementNameArrayForeArm = [
            '小臂',
            {name: '卷重物', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '哑铃腕弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '杠铃背后腕腕举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '杠铃腕弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '绳索腕弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '引体悬挂', equipment: "", gpmeasurement: "次", measurement: "Kg"},
        ];

        //8、股二头
        this.movementNameArrayFemorisBiceps = [
            '股二头',
            {name: '俯卧腿弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '单腿山羊挺身', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '杠铃直腿硬拉', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '反向腿弯举', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '跪姿髋部伸展', equipment: "", gpmeasurement: "次", measurement: "Kg"},
        ];

        //9、股四头
        this.movementNameArrayFemorisQuadriceps = [
            '股四头',
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
        ];

        //10、小腿
        this.movementNameArrayShank = [
            '小腿',
            {name: '站姿杠铃提踵', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '站姿单腿哑铃提踵 ', equipment: "", gpmeasurement: "次", measurement: "Kg"},
            {name: '坐姿杠铃负重提踵', equipment: "", gpmeasurement: "次", measurement: "Kg"},
        ];

        this.DefaultActionName = [
            this.movementNameArrayAerobic,
            this.movementNameArrayPectorales,
            this.movementNameArrayShoulder,
            this.movementNameArrayDorsal,
            this.movementNameArrayWaist,
            this.movementNameArrayAbdomen,
            this.movementNameArrayArmBiceps,
            this.movementNameArrayArmTriceps,
            this.movementNameArrayForeArm,
            this.movementNameArrayFemorisBiceps,
            this.movementNameArrayFemorisQuadriceps,
            this.movementNameArrayShank

        ];
    }
}

module.exports = {
    BodyPartList: BodyPartList,
    BodyPart: BodyPart,
    Action: Action
}