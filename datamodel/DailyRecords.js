/**
 * 数据原型：每天的记录
 * 内容：
 * 1、date：记录的日期
 * 2、source：计划的来源，目前考虑：自己，教练，朋友分享
 * 3、movementList：动作列表，以组为单位
 */

/**
 *
 * @param date 记录的日期
 * @constructor
 */
class DailyRecords {
    constructor(date) {
        this.date = date;
        this.recordId = '';   //时段记录，备用
        this.title = '';
        this.source = ''; //计划来源
        this.movementList = [];
    }

    fullCopyFrom(records) {
        this.date = records.date;
        this.recordId = records.recordId;   //时段记录，备用
        this.title = records.title;
        this.source = records.source; //计划来源
        this.movementList = records.movementList;
    }

    hasMovement(movement, fullEqual) {
        for (var item of this.movementList) {
            if (movement.equals(item, fullEqual)) {
                return true;
            }
        }
        return false;
    };

    add(obj) {
        var sucess = false;
        if (!this.hasMovement(obj, false)) {
            this.movementList.push(obj);
            sucess = true;
        }

        return sucess;
    }

    remove(index) {
        // console.log("in DailyRecords.remove, remove ", index);
        var tempList = this.movementList;

        var removedId = index + '';
        for (var idx = 0; idx < tempList.length; idx++) {
            var tempString = tempList[idx].mvId;
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
            if (tempList[idx].mvId > 0) {
                tempList[idx].mvId = String(idx + 1);
                // console.log(tempList[idx].id);
                resetList.push(tempList[idx]);
            }
        }

        //清空选中列表，重置index
        console.log("after deleted: ", resetList);

        this.movementList = resetList;
        console.log("tempList", tempList);
    }

    // 检查是否重复，不重复的话，根据序号找到并且替换
    // 如果计划已经练了一部分了，应当保存已经锻炼的部分，这个改变的计划，就变成了新增
    modify(index, refresh, obj) {
        var sucess = false;
        console.log("in DailyRecords.modify: index", index, "ffff: obj ", obj);
        if (obj.contents.mvFeeling != "" || obj.contents.curFinishedGpCount != 0) {
            console.log("ffffffffffffffff11111111111111");
            if (!this.hasMovement(obj, false)) {
                console.log("ffffffffffffffff");
                obj.mvId = this.movementList.length + 1;
                // obj.clearActualDetails();
                this.movementList.push(obj);
                sucess = true;
            } else {
                console.log("this.movementList", this.movementList);
                this.movementList.splice(index - 1, 1, obj);
                sucess = true;
            }

        } else {
            if (!this.hasMovement(obj, true)) {
                console.log("this.movementList", this.movementList);
                this.movementList.splice(index - 1, 1, obj);
                sucess = true;
            }
            if (refresh) {
                console.log("this.movementList", this.movementList);
                this.movementList.splice(index - 1, 1, obj);
                sucess = true;
            }
        }

        return sucess;
    }

    clearClicked() {
        for (var idx = 0; idx < this.movementList.length; idx++)
            this.movementList[idx].clicked = false;
    }
}

module.exports = {
    DailyRecords: DailyRecords,

}