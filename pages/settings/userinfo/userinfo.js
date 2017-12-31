// userinfo.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        option: '',
        dataCollector: '',
        genderChArray: ["男", "女", "不确定"],
        genderEnArray: ["Male", "Female", "Unknown"],
        genderIdx: 0,
        userInfo: '',
    },

    /**
     * 响应选择，主要是因为要中英文显示性别，要用到genderIdx
     * @param e
     */
    onPickerChange: function (e) {
        // console.log(e);
        let genderIdx = this.data.genderIdx;
        var userInfo = this.data.userInfo;
        switch (e.target.id) {
            case "birthday":
                userInfo.birthday = e.detail.value;
                break;
            case "gender":
                genderIdx = parseInt(e.detail.value);
                userInfo.gender = this.data.genderEnArray[genderIdx];
                break;
            case "height":
                userInfo.height = parseInt(this.data.heightArray[parseInt(e.detail.value)]);
                break;
            case "weight":
                userInfo.weight = parseInt(this.data.weightArray[parseInt(e.detail.value)]);
                break;
            default:
                break;
        }

        this.setData({
            genderIdx: genderIdx,
            userInfo: userInfo
        });
    },

    onFormSubmit: function (e) {
        // TODO 表单校验
        // 根据入口不同，选择切换不同的Tab
        console.log('form发生了submit事件，携带数据为：', e.detail.value);
        let userInfo = this.data.userInfo;

        // 收集信息
        userInfo.wechatOpenId = app.userInfoLocal.wechatOpenId;
        userInfo.nickName = app.wechatUserInfo.nickName;

        if (e.detail.value.mobileNumber !== '') {
            userInfo.mobileNumber = e.detail.value.mobileNumber;
        }

        // 准备跳转页面及保存数据
        let tabUrl = '';

        if (app.userInfoLocal.userUID === -1) {
            // 由新建页面进入，创建用户信息，页面设置完成，跳转到首页
            tabUrl = '../../index/index';
            userInfo.userUID = -1;

        } else {
            // 由更新页面进入，页面设置完成，跳转到设置
            // 应对用户删除本地存储，在获取了用户id之后，更新用户信息，这步必须的。
            tabUrl = '../../settings/settings';
            userInfo.userUID = app.userInfoLocal.userUID;
        }

        let data = this.makeUserInfo(userInfo);

        // 后台创建或更新，并同步保存到本地
        app.Util.syncData(null, "user", data, userInfo);

        wx.switchTab({
            url: tabUrl,
        });
    },

    onFormReset: function () {
        this.setData({
            userInfo: app.Util.loadData(app.StorageType.UserInfo)
        });
    },

    /**
     *
     * @param userInfo
     * @param createNew
     * @returns {{accountNonExpired: boolean, accountNonLocked: boolean, gender: string|*, dateOfBirth: string|*, username: *|string, nickName: *|string, wechatMPOpenId: *|string, wechatUnionId: *|string, mobileNumber: *|string, extendedInfoMap: {height: {value: number|*}, weight: {value: number|*}}}}
     */
    makeUserInfo: function (userInfo) {
        let value = {
            "id": userInfo.userUID,
            "accountNonExpired": true,
            "accountNonLocked": true,
            "gender": userInfo.gender,
            "dateOfBirth": userInfo.birthday,
            "username": app.wechatUserInfo.nickName,
            "nickName": app.wechatUserInfo.nickName,
            "wechatMPOpenId": app.userInfoLocal.wechatOpenId,
            "wechatUnionId": app.userInfoLocal.wechatUnionId,
            "mobileNumber": userInfo.mobileNumber,
            "extendedInfoMap": {
                "height": {
                    "value": userInfo.height
                },
                "weight": {
                    "value": userInfo.weight
                }
            }
        };
        // if (!createNew) {
        //     value.id = userInfo.userUID;
        // }

        return value;
    },

    /**
     * 设置页面的值
     */
    setPageUserInfo: function () {
        let userInfo = app.Util.deepClone(app.userInfoLocal);
        let genderIdx = 0;

        console.log("in setPageUserInfo", userInfo);

        // 根据服务器获取值来初始化界面
        if (app.userInfoLocal.userUID === -1) {
            // 默认值
            if (typeof userInfo.birthday === 'undefined' || userInfo.birthday === "") {
                userInfo.birthday = '1990-08-30';
            }

            if (userInfo.gender === 'Male') {
                genderIdx = 0;
            } else if (userInfo.gender === 'Female') {
                genderIdx = 1;
            } else if (userInfo.gender === 'Unknown') {
                genderIdx = 2;
            } else {
                genderIdx = 0;
                userInfo.gender = 'Male';
            }

            if (userInfo.height === "") {
                userInfo.height = 170;
            } else {
                userInfo.height = parseInt(userInfo.height);
            }

            if (userInfo.weight === "") {
                userInfo.weight = 65;
            } else {
                userInfo.weight = parseInt(userInfo.weight);
            }
        } else {
            // 根据localStorage来初始化
            userInfo.birthday = app.userInfoLocal.birthday;
            userInfo.gender = app.userInfoLocal.gender;
            if (userInfo.gender === 'Male') {
                genderIdx = 0;
            } else if (userInfo.gender === 'Female') {
                genderIdx = 1;
            } else if (userInfo.gender === 'Unknown') {
                genderIdx = 2;
            } else {
                genderIdx = 0;
                userInfo.gender = 'Male';
            }

            userInfo.height = app.userInfoLocal.height;
            userInfo.weight = app.userInfoLocal.weight;

            if (typeof app.userInfoLocal.mobileNumber !== 'undefined' && app.userInfoLocal.mobileNumber !== '') {
                userInfo.mobileNumber = app.userInfoLocal.mobileNumber;
            }
        }

        this.setData({
            genderIdx: genderIdx,
            userInfo: userInfo,
        });
    },

    /**
     * 生命周期函数--监听页面加载
     * 这是非tabBar页面，每次进入都会调用onLoad
     * 每一次进入的入口，初始化在这里进行
     */
    onLoad: function (options) {
        // 初始化入口参数，以备离开页面的时候正确切换,请选择
        console.log("app.wechatUserInfo: ", app.wechatUserInfo);

        this.data.option = options.model;

        this.setPageUserInfo();

        let heightArray = [];
        let weightArray = [];
        for (let idx = 1; idx <= 220; idx++) {
            heightArray.push(idx + " cm");
        }

        for (let idx = 1; idx <= 200; idx++) {
            weightArray.push(idx + " Kg");
        }

        this.setData({
            heightArray: heightArray,
            weightArray: weightArray
        });

        if (this.data.option === "newUser") {
            // 查询用户
            wx.showLoading({
                title: '获取登录信息',
            });

            // sleep 5 seconds waiting get information from server
            let host = this;
            setTimeout(function () {
                console.log("loading closed");
                // console.log("app.openId: ", app.openId);
                // console.log("resUserData is: ", app.userInfo);
                host.setPageUserInfo();
                wx.hideLoading();
            }, 5000);

        } else {

        }

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log("userInfo page onUnload");
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})