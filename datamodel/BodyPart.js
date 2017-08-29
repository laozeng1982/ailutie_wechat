/**
 * Bod
 */

class BodyPartList {
    constructor(type) {
        this.type = type;
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
                action.actionName = item[idx];
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
            '跑步',
            '游泳',
            '跳绳',
            '自行车',
            '椭圆机',
            '划船机',
            '动感单车',

        ];
        //0、胸部
        this.movementNameArrayPectorales = [
            '胸部',
            '上斜杠铃推举',
            '上斜哑铃推举',
            '平卧杠铃推举',
            '平卧哑铃推举',
            '下斜杠铃推举',
            '下斜哑铃推举',
            '双杠臂屈伸',
            '拉力器十字夹胸',
            '哑铃飞鸟夹胸',
            '蝴蝶机器械夹胸',
            '窄距俯卧撑',
            '标准俯卧撑',
            '宽距俯卧撑',];

        //1、肩部
        this.movementNameArrayShoulder = [
            '肩部',
            '坐姿杠铃劲前推举',
            '站姿哑铃前平举',
            '站姿绳索前平举',
            '站姿哑铃侧平举',
            '站姿杠铃划船',
            '阿诺德推肩',
            '坐姿杠铃劲后推举',
            '坐姿器械反式飞鸟',
            '俯身哑铃飞鸟',
            '俯身绳索侧平举',
            '俯身杠铃提拉',];

        //2、背部
        this.movementNameArrayDorsal = [
            '背部',
            '宽握引体向上',
            '窄握引体向上',
            '横杠缆绳下拉',
            '杠铃划船',
            '杠铃硬拉',
            '哑铃硬拉',
            '坐姿划船',
            '单臂哑铃划船',
            '弹力绳背拉',
            '杠铃反斜拉',];

        //3、腰部
        this.movementNameArrayWaist = [
            '腰部',
            '杠铃硬拉',
            '山羊挺身',
            '坐姿杠铃挺身',
            '平板支撑',
            '侧平板支撑',
            '俯卧异侧起',
        ];

        //4、腹部
        this.movementNameArrayAbdomen = [
            '腹部',
            '仰卧起坐',
            '仰卧卷腹',
            '仰卧屈膝两头起',
            '仰卧举腿',
            '悬垂举腿',
            '平板支撑',
            '侧身卷腹',
            '负重体侧屈',
            '空中蹬车',
            '侧平板支撑',
        ];

        //5、肱二头
        this.movementNameArrayArmBiceps = [
            '肱二头',
            '站姿杠铃弯举',
            '坐姿哑铃弯举',
            '托板弯举',
            '拉力器弯举',
        ];

        //6、肱三头
        this.movementNameArrayArmTriceps = [
            '肱三头',
            '杠铃颈后臂屈伸',
            '哑铃颈后臂屈伸',
            '双杆臂屈伸',
            '仰卧杠铃臂屈伸',
            '哑铃俯身臂屈伸',
            '拉力器屈臂下压',
            '凳上反屈伸',
            '窄握杠铃推举',
            '窄距俯卧撑',
        ];

        //7、小臂
        this.movementNameArrayForeArm = [
            '小臂',
            '卷重物',
            '哑铃腕弯举',
            '杠铃背后腕腕举',
            '杠铃腕弯举',
            '绳索腕弯举',
            '引体悬挂',
        ];

        //8、股二头
        this.movementNameArrayFemorisBiceps = [
            '股二头',
            '俯卧腿弯举',
            '单腿山羊挺身',
            '杠铃直腿硬拉',
            '反向腿弯举',
            '跪姿髋部伸展',
        ];

        //9、股四头
        this.movementNameArrayFemorisQuadriceps = [
            '股四头',
            '杠铃深蹲',
            '史密斯深蹲',
            '哈克深蹲',
            'T杠深蹲',
            '哑铃深蹲',
            '负重箭步蹲',
            '单腿前蹲',
            '箭步蹲',
            '斜卧负重腿举',
            '坐姿水平蹬腿',
            '坐姿腿屈伸',
        ];

        //10、小腿
        this.movementNameArrayShank = [
            '小腿',
            '站姿杠铃提踵',
            '站姿单腿哑铃提踵 ',
            '坐姿杠铃负重提踵',
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
    BodyPart: BodyPart
}