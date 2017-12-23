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

    onPickerChange: function (e) {
        console.log(e);
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

    onOK: function () {
        // 根据入口不同，选择切换不同的Tab

        let tabUrl = '';

        if (this.data.option === "newUser") {
            tabUrl = '../../index/index';
        } else {
            tabUrl = '../../settings/settings';
        }

        // 保存并跳转页面
        app.Util.saveData(app.StorageType.UserInfo, this.data.userInfo);
        wx.switchTab({
            url: tabUrl,
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
        let userInfo = app.Util.loadData(app.StorageType.UserInfo);
        let genderIdx = 0;

        // 默认值
        if (userInfo.birthday === "") {
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

        let heightArray = [];
        let weightArray = [];
        for (let idx = 1; idx <= 220; idx++) {
            heightArray.push(idx + " cm");
        }

        for (let idx = 1; idx <= 200; idx++) {
            weightArray.push(idx + " Kg");
        }

        this.setData({
            genderIdx: genderIdx,
            userInfo: userInfo,
            heightArray: heightArray,
            weightArray: weightArray
        });

        if (this.data.option === "newUser") {
            // 查询用户
            wx.showLoading({
                title: '获取登录信息',
            });

            // sleep 2 seconds
            setTimeout(function () {
                console.log("loading closed");
                console.log("app.openId: ", app.openId);
                console.log("resUserData is: ", app.userInfoFromServer);
                wx.hideLoading();
            }, 5000);

            // 创建用户
            let userUID = '';
            if (typeof app.userInfoFromServer.wechatMPOpenId === 'undefined') {
                try {
                    let gender, birthday;
                    if (this.data.userInfo.gender === '男') {
                        gender = 'Male';
                    } else if (this.data.userInfo.gender === '女') {
                        gender = 'Female';
                    } else {
                        gender = 'Unknown';
                    }
                    birthday = this.data.userInfo.birthday;

                    let new_user_data = {
                        accountNonExpired: true,
                        accountNonLocked: true,
                        gender: gender,
                        dateOfBirth: birthday,
                        username: app.wechatUserInfo.nickName,
                        nickName: app.wechatUserInfo.nickName,
                        wechatMPOpenId: app.openId,
                        wechatUnionId: app.openId
                    };
                    console.log("new user: ", new_user_data);
                    // 后台创建
                    // wx.request({
                    //         url: app.requestUrl + "user",
                    //         method: 'POST',
                    //         data: new_user_data,
                    //         success: function (res) {
                    //             console.log(res.data);
                    //             userUID = res.data.id;
                    //         },
                    //         fail: function (res) {
                    //             console.log(res.data)
                    //         }
                    //     }
                    // );
                }
                catch (err) {
                    console.log(err)
                }
            } else {
                userUID = app.userInfoFromServer.id;
            }

            console.log("userUID: ", userUID);
            // 等5秒钟，等获取到数据再写入本地
            let host = this;
            setTimeout(function () {
                if (userUID !== '') {
                    host.data.userInfo.userUID = parseInt(userUID);
                }
            }, 5000);

            console.log("userInfo: ", this.data.userInfo);
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
        console.log("onUnload");
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