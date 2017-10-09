function deepClone(obj) {

    let clone = obj.constructor === Array ? [] : {};

    for (let item in obj) {

        if (obj.hasOwnProperty(item)) {

            clone[item] = typeof obj[item] === "object" ? deepClone(obj[item]) : obj[item];
        }
    }

    return clone;
}

var oPerson = {
    oName: "rookiebob",
    oAge: "18",
    oAddress: {
        province: "beijing"
    },
    ofavorite: [
        "swimming",
        {reading: "history book"}
    ],
    skill: function () {
        console.log("bob is coding");
    }
};
//深度克隆一个对象
var oNew = cloneObject(oPerson);

oNew.ofavorite[1].reading = "picture";
console.log(oNew.ofavorite[1].reading);//picture
console.log(oPerson.ofavorite[1].reading);//history book

oNew.oAddress.province = "shanghai";
console.log(oPerson.oAddress.province);//beijing
console.log(oNew.oAddress.province);//shanghai