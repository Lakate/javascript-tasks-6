'use strict';

var moment = require('./moment');
var WEEK_DAY = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
var TWENTY_FOUR_HOURS = 86400000;
var MINUTE = 60000;

/**
 *  Выбирает подходящий ближайший момент начала ограбления
 *
 * @param {JSON} json Список грабителей
 * @param {number} minDuration Минимальное время ограбления
 * @param {Object} workingHours Время работы банка
 * @returns {moment} Новый объект moment
 */
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var sheduleOfFriends = JSON.parse(json);
    var friends = Object.keys(sheduleOfFriends);

    /** Для каждого из ребят, устанавливаем их расписания */
    friends.forEach(function (person) {
        sheduleOfFriends[person].forEach(function (workTime) {
            this.setMs(workTime, 'from');
            this.setMs(workTime, 'to');
        }, this);
    }, this);

    var freeMinutes = 0;
    var currentTime;
    var currentAnswerTime = null;

    /** Так как работаем только с ПН по ЧТ */
    for (var i = 2; i < 5; i++) {
        if (freeMinutes === minDuration) {
            break;
        }
        /** устанавливаем рабочее время банка */
        this.setWorkingHours(workingHours, i);
        currentTime = workingHours.msfrom;
        currentAnswerTime = currentTime;
        while (currentTime <= workingHours.msto && freeMinutes < minDuration) {
            var isFreeMinute = true;
            /** Для каждого из ребят смотрим по их расписаниям
             *  свободны ли они в текущее время или нет */
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
            currentTime += MINUTE;
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

/**
 * Устанавливает время работы банка в заданный день
 *
 * @param {Object} workTime
 * @param {number} date
 */
module.exports.setWorkingHours = function (workTime, date) {
    /** Переводим время в миллисекунды */
    this.setMs(workTime, 'from', '0' + date);
    /** Если есть переход через 12 ночи, ставим следующий день */
    if (Number(workTime['from'].substring(0, 2)) >
        Number(workTime['to'].substring(0, 2))) {
        this.setMs(workTime, 'to', '0' + (date + 1));
    } else {
        this.setMs(workTime, 'to', '0' + date);
    }
    /** Учитывая часовые пояса можем дата может сдвинуться, тогда устанавливаем нужную */
    if ((new Date(workTime.msfrom)).getDate() > date &&
        ((new Date(workTime.msto)).getDate() > date)) {
        workTime.msfrom -= TWENTY_FOUR_HOURS;
        workTime.msto -= TWENTY_FOUR_HOURS;
    }
};

/**
 * Переводим время в миллисекунды
 *
 * @param {Object} workTime
 * @param {string} type Тип поля: 'from' или 'to'
 * @param {number} weekDay Номер дня недели
 */
module.exports.setMs = function (workTime, type, weekDay) {
    var stringTime = (typeof (weekDay) === 'undefined') ?
        this.getDateString(workTime, workTime[type]) :
        this.getDateString(workTime, workTime[type], weekDay);
    workTime['ms' + type] = Date.parse(stringTime);
};

/**
 * Из переданной строковой даты делает строку, представляющую дату в формате,
 * распознаваемом Date.parse()
 *
 * @param {Object} workTime
 * @param {number} date Дата
 * @param {number} day
 * @returns {string}
 */
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

/**
 * Возвращает статус ограбления
 *
 * @param {moment} moment Текущее время
 * @param {moment} robberyMoment Время ограбления
 * @returns {*}
 */
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
