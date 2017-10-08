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
        let orgType = new OrgType();

        // console.log("in createDefaultPartList, orgType", orgType);

        let partList = [];
        let partIndex = 1;
        let partName;

        for (let item of orgType.DefaultActionName) {
            let bodyPart = new BodyPart();
            partName = item.partName;
            bodyPart.partId = partIndex;
            bodyPart.partName = partName;
            // bodyPart.subParts = item.subParts;
            for (let subPartIdx = 0; subPartIdx < item.subParts.length; subPartIdx++) {
                let subPart = {name: item.subParts[subPartIdx].name, actionList: []};
                for (let actionIdx = 0; actionIdx < item.subParts[subPartIdx].actionArray.length; actionIdx++) {
                    let action = new Action();
                    action.actionId = actionIdx + 1;
                    action.actionName = item.subParts[subPartIdx].actionArray[actionIdx].name;
                    action.actionEquipment = item.subParts[subPartIdx].actionArray[actionIdx].equipment;
                    action.actionGpMeasurement = item.subParts[subPartIdx].actionArray[actionIdx].gpmeasurement;
                    action.actionMeasurement = item.subParts[subPartIdx].actionArray[actionIdx].measurement;
                    action.actionPartId = subPartIdx + 1;
                    action.actionPartName = item.subParts[subPartIdx].name;
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

    fullCopyFrom(bodyPartList) {
        this.type = bodyPartList.type;
        this.partList = bodyPartList.partList;
    }

    /**
     * 清楚选中项
     */
    clearSelection() {
        for (let partIdx = 0; partIdx < this.partList.length; partIdx++) {
            this.partList[partIdx].selected = false;

            for (let mvIdx = 0; mvIdx < this.partList[partIdx].actionList.length; mvIdx++)
                this.partList[partIdx].actionList[mvIdx].actionSelected = false;
        }
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
        this.movementAerobic = {
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
        this.movementPectorales = {
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
        this.movementShoulder = {
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
        this.movementDorsal = {
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
        this.movementWaist = {
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
        this.movementAbdomen = {
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
        this.movementArms = {
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
        this.movementLegs = {
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
            this.movementAerobic,
            this.movementPectorales,
            this.movementShoulder,
            this.movementDorsal,
            this.movementWaist,
            this.movementAbdomen,
            this.movementArms,
            this.movementLegs
        ];
    }
}

module.exports = {
    BodyPartList: BodyPartList,
    BodyPart: BodyPart,
    Action: Action
}