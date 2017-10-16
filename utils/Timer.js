class Timer {
    constructor(host, pause_seconds) {
        this.timerRunning = false;
        this.host = host;
        this.pause_seconds = pause_seconds;
    }

    start() {
        if (!this.timerRunning) {
            this.timerRunning = true;
            startTimer(this.host);
            // console.log("Timer Started!");
        }
    }

    stop() {
        stopTimer();
        this.timerRunning = false;

        // console.log("Timer Stopped!");
    }
}

let timer;
let countDownSeconds = 30;

function countTimeDown(that) {
    that.setData({
        clock: countDownSeconds + "  秒"
    });

    if (countDownSeconds <= 0) {
        // timeout则跳出递归
        console.log("to Next");
        that.nextGroup();
        return;
    }

    timer = setTimeout(function () {
        // 放在最后--
        countDownSeconds -= 1;
        countTimeDown(that, countDownSeconds);
    }, 1000);

}

function startTimer(that) {
    countTimeDown(that);
}

function stopTimer() {
    clearTimeout(timer);
}

function setCountDownSeconds(seconds) {
    countDownSeconds = seconds;
}

module.exports = {
    Timer: Timer,
    setCountDownSeconds: setCountDownSeconds,
    pause_seconds: countDownSeconds
}