//app.js
/**
 * 小程序总入口
 */
import util from './utils/Util'
import StorageType from './datamodel/SystemSetting'
import PlanSet from './datamodel/PlanSet'

const STORAGETYPE = new StorageType.StorageType();

App({
    onLaunch: function () {

        // 全局变量
        this.planSet = util.loadData(STORAGETYPE.PlanSet);

        this.currentPlan = new PlanSet.Plan();

        console.log("app onLoad, currentPlan", this.currentPlan);

        //调用微信登录接口，获取OpenId
        this.getOpenId();

        // 查询用户是否注册
        this.checkRegister();

        console.log("app onLoad done");
    },

    // 提供获取微信信息的结构
    getWechatUserInfo: function (cb) {
        let that = this;
        if (this.wechatUserInfo) {
            typeof cb === "function" && cb(this.wechatUserInfo)
        } else {
            //调用登录接口
            wx.getUserInfo({
                withCredentials: false,
                success: function (res) {
                    that.wechatUserInfo = res.userInfo;
                    typeof cb === "function" && cb(that.wechatUserInfo)
                }
            })
        }
    },

    /**
     * 获取OpenId
     */
    getOpenId: function () {
        let that = this;
        wx.login({
            success: function (res) {
                if (res.code) {
                    //获取openId
                    wx.request({
                        url: 'https://api.weixin.qq.com/sns/jscode2session',
                        data: {
                            //小程序唯一标识
                            appid: 'wxbea378c38515347c',
                            //小程序的 app secret
                            secret: 'cca9244dc17c06c3ab91ac9ee158c9d0',
                            grant_type: 'authorization_code',
                            js_code: res.code
                        },
                        method: 'GET',
                        header: {'content-type': 'application/json'},
                        success: function (openIdRes) {
                            console.info("登录成功返回的openId：", openIdRes.data);
                            // weChatUserInfo.openId = openIdRes.data.openid;
                            // 判断openId是否获取成功
                            if (openIdRes.data.openid != null && typeof openIdRes.data.openid !== 'undefined') {
                                // 有一点需要注意，询问用户是否授权，那提示是这API发出的
                                wx.getUserInfo({
                                    success: function (data) {
                                        // 自定义操作
                                        // 绑定数据，渲染页面
                                        console.info("登录成功返回的openId：" + openIdRes.data.openid);
                                    },
                                    fail: function (failData) {
                                        // TODO，二次授权
                                        wx.showModal({
                                            title: 'Warining',
                                            content: '如果不授权，将无法远程保存您的数据，“取消”不授权，“确定”授权',
                                            success: function (res) {
                                                if (res.confirm) {
                                                     that.getInfoAgain();
                                                    console.log('用户点击确定')
                                                } else if (res.cancel) {
                                                    console.log('用户点击取消')
                                                }
                                            }
                                        });
                                        console.info("用户拒绝授权");
                                    }
                                });
                            } else {
                                console.info("获取用户openId失败");
                            }
                        },
                        fail: function (error) {
                            console.info("获取用户openId失败");
                            console.info(error);
                        }
                    })
                }
            }
        });
    },

    /**
     * 手动打开微信授权
     */
    getInfoAgain: function () {
        let that = this;
        wx.openSetting({
            success: function (data) {
                //判断 用户是否同意授权
                if (data.authSetting["scope.userInfo"] === true) {
                    // 同意授权
                    wx.login({
                        success: function (res) {
                            if (res.code) {
                                console.info("登录成功返回的CODE：" + res.code);
                                //获取openId
                                wx.request({
                                    url: 'https://api.weixin.qq.com/sns/jscode2session',
                                    data: {
                                        // 小程序唯一标示
                                        appid: 'wxbea378c38515347c',
                                        // 小程序的 app secret
                                        secret: 'cca9244dc17c06c3ab91ac9ee158c9d0',
                                        grant_type: 'authorization_code',
                                        js_code: res.code
                                    },
                                    method: 'GET',
                                    header: {'content-type': 'application/json'},
                                    success: function (openIdRes) {
                                        // 获取到 openId
                                        console.log(openIdRes.data.openid);
                                        // 判断openId是否为空
                                        if (openIdRes.data.openid != null && typeof openIdRes.data.openid !== 'undefined') {
                                            wx.getUserInfo({
                                                success: function (data) {
                                                }
                                            })
                                        } else {
                                            // openId为空
                                        }
                                    }
                                })
                            }
                        }
                    });
                } else {
                    // 手动 开启 是否授权提示框后 拒绝
                }
            }
        });
    },



    // 检查是否系统注册
    checkRegister: function () {
        console.log("check register");

        wx.showLoading({
            title: '获取登录信息',
        });

        let that = this;
        console.log(typeof this.wechatUserInfo);

        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            that.wechatUserInfo = res.userInfo;
                            console.log("app onLoad, res.userInfo: ", res.userInfo);
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (that.userInfoReadyCallback) {
                                that.userInfoReadyCallback(res);
                            }
                        }
                    })
                }
            }
        });

        // 验证是否是首次使用爱撸铁，首次登陆，录入用户基本信息
        this.userInfo = util.loadData(STORAGETYPE.UserInfo);
        console.log("userInfo: ", this.userInfo);
        let userUID = this.userInfo.userUID;

        if (typeof (userUID) === 'undefined' || userUID === -1) {
            // 去注册
            console.log("in app, go to User information record page!");
            wx.redirectTo({
                url: 'pages/settings/userinfo/userinfo?model=newUser',
            });
        }

        // sleep 2 seconds
        setTimeout(function () {
            wx.hideLoading();
        }, 2000);

        console.log(this.wechatUserInfo);

        // ;

    },

    // 提供工具类的统一接口，方便其他的JS通过app调用
    StorageType: STORAGETYPE,
    Util: util,

    requestUrl: 'https://www.newpictown.com/',

    // 定义一些全局变量，在页面跳转的时候判断，方便其他的JS通过app调用
    wechatUserInfo: {},

    makingNewPlan: true,    // 操作计划的模式：如制定新计划为真，否则为假，在首页里两个操作互斥
    planMakeModel: 3,  // 用户对计划来源的选择，1代表使用推荐计划，2代表使用历史计划，3代表使用自定义计划，默认是三
    planStartDate: '',
    planEndDate: '',
    lastPlanSaved: false,

    globalData: {

        userInfo: null,


        isLogin: false,// 登陆状态记录

        selectedDateString: util.formatDateToString(new Date()),
        selectedDate: new Date(),
    },

})
