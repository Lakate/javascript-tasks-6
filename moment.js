'use strict';

var WEEK_DAY = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
var TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
var HOUR = 60 * 60 * 1000;
var MINUTE = 60 * 1000;

/**
 *  ВЫбирает правильное соответствие для числа и слова
 *
 * @param {number} number
 * @param {array} variants массив слов
 * @returns {string}
 */
function establishMatching(number, variants) {
    if (number === 0) {
        return '';
    }
    if (number % 10 === 1 && number !== 11) {
        return number + variants[0];
    }
    if (number === 2 || number === 3 || number === 4 ||
        number === 22 || number === 23) {
        return number + variants[1];
    }
    return number + variants[2];
};

/**
 *  Создает экземпляр moment
 *
 * @constructor
 */
module.exports = function () {
    return {
        currentTimezone: (-new Date().getTimezoneOffset()) / 60,
        oldTimezone: null,
        dateTime: null,

        get date() {
            return this.dateTime;
        },

        /** Устанавливает dateTime - строка, представляющую дату в формате,
         *  распознаваемом Date.parse() */
        set date(value) {
            if (value === null) {
                return;
            }
            if (typeof (value) === 'number') {
                this.dateTime = new Date(value);
                return;
            }
            var utc = (value.substr(9).length > 1) ? value.substr(9) :
            value.substr(8, 1) + '0' + value.substr(9);
            this.timezone = Number(utc);
            var day = '0' + (WEEK_DAY.indexOf(value.substr(0, 2)) + 1);
            this.dateTime = new Date('2015-11-' + day +
                'T' + value.substr(3, 5) + utc + ':00');
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

        /**
         * Выводит дату в переданном формате
         *
         * @param {string }pattern Формат
         * @returns {string}
         */
        format: function (pattern) {
            if (this.dateTime === null) {
                return 'Ограбление не состоится=(';
            }
            var output = pattern.split('%');
            /** Избавляемся от аббревиатур HH, DD, MM */
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

        /**
         * Добавляет 0 перед однозначным числом
         *
         * @param {number} number
         * @returns {string}
         */
        addZero: function (number) {
            return ('0' + number).slice(-2);
        },

        /** Устанавливает новое значение dateTime, в соответствии с текущим часовым поясом */
        getCurrentDate: function () {
            var offset = (this.currentTimezone - this.oldTimezone) * 60 * 60 * 1000;
            this.dateTime = new Date(Date.parse(this.dateTime.toUTCString()) + offset);
        },

        /**
         * Возвращает кол-во времени между текущей датой и переданной `moment`
         * в человекопонятном виде
         *
         * @param {string} moment
         * @returns {string}
         */
        fromMoment: function (moment) {
            var robberyMoment = Date.parse(this.dateTime);
            var currentMoment = Date.parse(moment.date);
            var time = robberyMoment - currentMoment;
            var days = Math.floor(time / TWENTY_FOUR_HOURS);
            time -= days * TWENTY_FOUR_HOURS;
            var hours = Math.floor(time / HOUR);
            time -= hours * HOUR;
            var minutes = Math.floor(time / MINUTE);
            var answerString = 'До ограбления ';
            if (days === 0) {
                if (hours % 10 === 1 && hours !== 11) {
                    answerString += 'остался ';
                } else {
                    answerString += 'осталось ';
                }
            } else {
                answerString = (days === 1) ?
                    'До ограбления остался 1 день ' : 'До ограбления осталось ' + days + ' дня ';
            }

            answerString += establishMatching(hours, [' час ', ' часа ', ' часов ']);
            answerString += establishMatching(minutes, [' минута ', ' минуты ', ' минут ']);
            return answerString;
        }
    };
};
