'use strict';

var WEEK_DAY = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

module.exports = function () {
    return {
        // А здесь часовой пояс
        currentTimezone: (-new Date().getTimezoneOffset()) / 60,
        oldTimezone: null,
        dateTime: null,

        get date() {
            return this.dateTime;
        },

        set date(value) {
            if (value === null) {
                return;
            }
            if (typeof (value) === 'number') {
                this.dateTime = new Date(value);
            } else {
                var utc = (value.substr(9).length > 1) ? value.substr(9) :
                value.substr(8, 1) + '0' + value.substr(9);
                this.timezone = Number(utc);
                var day = '0' + (WEEK_DAY.indexOf(value.substr(0, 2)) + 1);
                this.dateTime = new Date('2015-11-' + day +
                    'T' + value.substr(3, 5) + utc + ':00');
            }
        },

        get timezone() {
            return this.timeOffset;
        },

        set timezone(value) {
            this.oldTimezone = this.currentTimezone;
            this.currentTimezone = value;
            if (this.dateTime !== null) {
                this.getCurrentDate();
            }
        },

        // Выводит дату в переданном формате
        format: function (pattern) {
            if (this.dateTime === null) {
                return 'Ограбление не состоится=(';
            }
            var output = pattern.split('%');
            output = output.map(function (sentence, index) {
                if (index === 0) {
                    return sentence;
                }
                return sentence.substring(2);
            });
            return output[0] + WEEK_DAY[this.dateTime.getDay()] + output[1] +
                this.addZero(this.dateTime.getHours()) + output[2] +
                this.addZero(this.dateTime.getMinutes()) + output[3];
        },

        addZero: function (number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        },

        getCurrentDate: function () {
            var offset = (this.currentTimezone - this.oldTimezone) * 60 * 60 * 1000;
            this.dateTime = new Date(Date.parse(this.dateTime.toUTCString()) + offset);
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var robberyMoment = Date.parse(this.dateTime);
            var currentMoment = Date.parse(moment.date);
            var time = robberyMoment - currentMoment;
            var days = Math.floor(time / 60000 / 60 / 24);
            time -= days * 24 * 60 * 60 * 1000;
            var hours = Math.floor(time / 60 / 60 / 1000);
            time -= hours * 60 * 60 * 1000;
            var minutes = Math.floor(time / 60000);
            var answerString;
            if (days === 0) {
                if (hours % 10 === 1 && hours !== 11) {
                    answerString = 'До ограбления остался ';
                } else {
                    answerString = 'До ограбления осталось ';
                }
            } else {
                answerString = (days === 1) ?
                    'До ограбления остался 1 день ' : 'До ограбления осталось ' + days + ' дня ';
            }
            if (hours % 10 === 1 && hours !== 11) {
                answerString += hours + ' час ';
            } else if (hours === 2 || hours === 3 || hours === 4 || hours === 22 || hours === 23) {
                answerString += hours + ' часа ';
            } else {
                answerString += hours + ' часов ';
            }
            if (minutes % 10 === 1 && minutes !== 11) {
                answerString += minutes + ' минута';
            } else if (minutes % 10 === 2 & minutes !== 12 ||
                minutes % 10 === 3 && minutes !== 13 ||
                minutes % 10 === 4 && minutes !== 14) {
                answerString += minutes + ' минуты';
            } else {
                answerString += minutes + ' минут';
            }
            return answerString;
        }
    };
};
