'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var sheduleOfFriends = JSON.parse(json);
    var friends = Object.keys(sheduleOfFriends);

    friends.forEach(function (person) {
        sheduleOfFriends[person].forEach(function (workTime) {
            this.setMs(workTime, 'from');
            this.setMs(workTime, 'to');
        }, this);
    }, this);

    var currentTime;
    var minute = 60000;
    var freeMinutes = 0;
    var answerTime = null;
    var currentAnswerTime = null;

    for (var i = 2; i < 5; i++) {
        if (freeMinutes === minDuration) {
            break;
        }
        this.setMs(workingHours, 'from', '0' + i);
        this.setMs(workingHours, 'to', '0' + i);
        currentTime = workingHours.msfrom;
        currentAnswerTime = currentTime;
        while (currentTime <= workingHours.msto && freeMinutes < minDuration) {
            var isFreeMinute = true;
            friends.forEach(function (person) {
                sheduleOfFriends[person].forEach(function (workTime) {
                    if (!isFreeMinute) {
                        return;
                    }
                    if (workTime.msfrom < currentTime && currentTime < workTime.msto) {
                        isFreeMinute = false;
                    }
                });
            });
            currentTime += minute;
            if (isFreeMinute) {
                freeMinutes++;
            } else {
                freeMinutes = 0;
                currentAnswerTime = currentTime;
            }
        }
        freeMinutes = (freeMinutes < minDuration) ? 0 : freeMinutes;
    }

    answerTime = (freeMinutes === minDuration) ? currentAnswerTime : null;
    // 1. Читаем json
    // 2. Находим подходящий ближайший момент начала ограбления
    // 3. И записываем в appropriateMoment
    var appropriateMoment = moment();
    appropriateMoment.date = answerTime;
    appropriateMoment.timezone = workingHours.offset;
    return appropriateMoment;
};

// переводим время в UTC
module.exports.setMs = function (workTime, type, weekDay) {
    var stringTime = (typeof (weekDay) === 'undefined') ?
        this.getDateString(workTime, workTime[type]) :
        this.getDateString(workTime, workTime[type], weekDay);
    workTime['ms' + type] = Date.parse(stringTime);
};

module.exports.getDateString = function (workTime, date, day) {
    var weekDay = {'ПН': '02', ВТ: '03', СР: '04'};
    if (typeof (day) === 'undefined') {
        day = weekDay[date.split(' ')[0]];
        date = date.substring(3);
    }
    var utc = (date.substr(6).length > 1) ? date.substr(5) :
    date.substr(5, 1) + '0' + date.substr(6);
    workTime.offset = Number(utc);
    var dateString = '2015-11-' + day + 'T' + date.substr(0, 5) + utc + ':00';
    return dateString;
};


// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }
    return 'Ограбление уже идёт!';
};
