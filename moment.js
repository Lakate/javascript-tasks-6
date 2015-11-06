'use strict';

module.exports = function () {
    return {
        // А здесь часовой пояс
        currentTimezone: 5,
        oldTimezone: null,
        dateTime: null,

        get date() {
            return this.dateTime;
        },

        set date(value) {
            if (typeof (value) === 'number') {
                this.dateTime = new Date(value);
            } else {
                var weekDay = {ВС: '01', ПН: '02', ВТ: '03',
                    СР: '04', ЧТ: '05', ПТ: '06', СБ: '07'};
                var utc = (value.substr(9).length > 1) ? value.substr(9) :
                value.substr(8, 1) + '0' + value.substr(9);
                this.timezone = Number(utc);
                this.dateTime = new Date('2015-11-' + weekDay[value.substr(0, 2)] +
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
            //this.getCurrentDate();
            var output = pattern.split('%');
            var weekDay = {0: 'ВС', 1: 'ПН', 2: 'ВТ', 3: 'СР', 4: 'ЧТ', 5: 'ПТ', 6: 'СБ'};
            output = output.map(function (sentence, index) {
                if (index === 0) {
                    return sentence;
                }
                return sentence.substring(2);
            });
            return output[0] + weekDay[this.dateTime.getDay()] + output[1] +
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
            return ('До ограбления осталось дней: ' + days +
                ' , часов: ' + hours + ' , минут: ' + minutes);
        }
    };
};
