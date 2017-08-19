/**
 * 数据原型：每天的记录
 * 内容：
 * 1、date：记录的日期
 * 2、source：计划的来源，目前考虑：自己，教练，朋友分享
 * 3、movementList：动作列表，以组为单位
 */
function DailyRecords() {
    this.date = '';
    this.id = '';   //时段记录，备用
    this.title = '';
    this.source = ''; //计划来源
    this.movementList = [];

    this.hasPlan = function (obj) {
        for (var item of this.movementList) {
            // console.log("obj  in hasPlan ", obj);
            // console.log("item in hasPlan ", item);
            // console.log("in hasPlan ", this.movementList);
            if (obj.id != item.id &&
                obj.partName === item.partName &&
                obj.movementName === item.movementName) {
                return true;
            }
        }
        return false;
    };

    this.add = function (obj) {
        var sucess = false;
        if (!this.hasPlan(obj)) {
            this.movementList.push(obj);
            sucess = true;
        }

        return sucess;
    }

    this.remove = function (index) {
        // console.log("in DailyRecords.remove, remove ", index);
        var tempList = this.movementList;

        var removedId = index + '';
        for (var idx = 0; idx < tempList.length; idx++) {
            var tempString = tempList[idx].id;
            // console.log("in DailyRecords.remove, input id: ", removedId, ", current id: ", tempString, ", ", removedId === tempString);
            if (String(tempString) === String(removedId)) {
                tempList.splice(idx, 1);
                // console.log("in DailyRecords.remove, deleted!");
                break;
            }
        }

        //生成新数组，并重新排序
        var resetList = [];
        for (var idx = 0; idx < tempList.length; idx++) {
            // console.log(tempList[idx]);
            if (tempList[idx].id > 0) {
                tempList[idx].id = String(idx + 1);
                // console.log(tempList[idx].id);
                resetList.push(tempList[idx]);
            }
        }

        //清空选中列表，重置index
        console.log("after deleted: ", resetList);

        this.movementList = resetList;
        console.log("tempList", tempList);
    }

    //检查是否重复，不重复的话，根据序号找到并且替换
    this.modify = function (index, obj) {
        var sucess = false;
        if (!this.hasPlan(obj)) {
            console.log("this.movementList", this.movementList);
            this.movementList.splice(index - 1, 1, obj);
            sucess = true;
        }

        return sucess;
    }
}

module.exports = {
    DailyRecords: DailyRecords,

}