'use strict';

var moment = require('./moment');
var WEEK_DAY = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

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

    var minute = 60000;
    var freeMinutes = 0;
    var currentTime;
    var currentAnswerTime = null;

    for (var i = 2; i < 5; i++) {
        if (freeMinutes === minDuration) {
            break;
        }
        this.setMs(workingHours, 'from', '0' + i);
        if (Number(workingHours['from'].substring(0, 2)) >
            Number(workingHours['to'].substring(0, 2))) {
            this.setMs(workingHours, 'to', '0' + (i + 1));
        } else {
            this.setMs(workingHours, 'to', '0' + i);
        }
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

    currentAnswerTime = (freeMinutes === minDuration) ? currentAnswerTime : null;
    var appropriateMoment = moment();
    appropriateMoment.date = currentAnswerTime;
    appropriateMoment.timezone = workingHours.offset;
    //appropriateMoment.timezone = 5;
    return appropriateMoment;
};

// переводим время в миллисекунды
module.exports.setMs = function (workTime, type, weekDay) {
    var stringTime = (typeof (weekDay) === 'undefined') ?
        this.getDateString(workTime, workTime[type]) :
        this.getDateString(workTime, workTime[type], weekDay);
    workTime['ms' + type] = Date.parse(stringTime);
};

module.exports.getDateString = function (workTime, date, day) {
    if (typeof (day) === 'undefined') {
        day = '0' + (WEEK_DAY.indexOf(date.split(' ')[0]) + 1);
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
    if (robberyMoment.date === null) {
        return 'Ограбление не состоится';
    }
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }
    return 'Ограбление уже идёт!';
};
