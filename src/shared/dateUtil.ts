import {
  Day,
  format,
  formatISO9075,
  getDay,
  isBefore as fnsIsBefore,
  nextDay as fnsNextDay,
  parse,
  subMonths,
} from "date-fns";
import { IObject } from "./constant";

const ONE_SEC = 1000;
const ONE_MIN = ONE_SEC * 60;
const ONE_HOUR = ONE_MIN * 60;
const ONE_DATE = ONE_HOUR * 24;

export const isDate = (date: any): boolean => {
  if (typeof date === "string") {
    return !isNaN(new Date(date).getTime());
  }
  return date instanceof Date && !isNaN(date.getTime());
};

export const isBefore = (date1: string, date2: string): boolean => {
  return fnsIsBefore(
    parse(date1, "yyyy-MM-dd", new Date()),
    parse(date2, "yyyy-MM-dd", new Date())
  );
};

export const nextDate = (date: any): Date | null => {
  const dateNext = new Date(date);
  if (!isDate(date)) {
    return null;
  }
  dateNext.setDate(dateNext.getDate() + 1);
  return dateNext;
};

export const previousDate = (date: any): Date | null => {
  return isDate(date)
    ? new Date(parse(date, "yyyy-MM-dd", new Date()).getTime() - ONE_DATE)
    : null;
};

export const nextWeekDay = (date: any, weekDay: Day): Date | null => {
  return isDate(date)
    ? fnsNextDay(parse(date, "yyyy-MM-dd", new Date()), weekDay)
    : null;
};

export const getWeekDay = (date: any): Day => {
  return isDate(date) ? getDay(parse(date, "yyyy-MM-dd", new Date())) : 1;
};

const REPEAT_INTERVAL_KEYS: IObject<Day> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};
export const parseRepeatIntervalToWeekDay = (repeatInterval: any): Day[] => {
  const days: Day[] = [];
  if (repeatInterval instanceof Object) {
    for (const key in REPEAT_INTERVAL_KEYS) {
      if (repeatInterval[key]) {
        days.push(REPEAT_INTERVAL_KEYS[key]);
      }
    }
  }
  return days;
};

// date parser for validate shape by lib yup
export const yupParserDateString = (value: any, originalValue: any) => {
  const parsedDate = isDate(originalValue)
    ? originalValue
    : parse(originalValue, "yyyy-MM-dd", new Date());

  return parsedDate;
};

// Format date as format db accepted
export const dateToDbStr = (date: Date | number) => {
  return formatISO9075(new Date(date));
};

// Get timestring format HH:mm | HH:mm:ss
export const dateToTimeStr = (
  date: Date | number,
  includingSeconds = false
) => {
  return format(new Date(date), includingSeconds ? "HH:mm:ss" : "HH:mm");
};

export const dateToUTCTimeStr = (date: Date | number) => {
  return (
    new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "") + "(UTC)"
  );
};

// Add minutes with string format HH:mm
export const addMinutesTimeStr = (hourStr: string, minutes: number) => {
  const dt = new Date();
  const hour = +hourStr.split(":")[0] || 0;
  const minuteAdded = (+hourStr.split(":")[1] || 0) + minutes;
  dt.setHours(hour);
  dt.setMinutes(minuteAdded);
  return dateToTimeStr(dt);
};

// Get datestring format yyyy-MM-dd
export const dateToDateStr = (date: Date | number) => {
  return format(new Date(date), "yyyy-MM-dd");
};

export const getMMdd = (date: Date) => {
  return format(new Date(date), "MM-dd");
};

// Get datestring format yyyy-MM-dd HH:mm:ss | yyyy-MM-dd HH:mm
export const dateToDatetimeStr = (
  date: Date | number,
  includingSeconds = false
) => {
  return format(
    new Date(date),
    includingSeconds ? "yyyy-MM-dd HH:mm:ss" : "yyyy-MM-dd HH:mm"
  );
};

export const dayToMilliseconds = (day: number) => {
  return day * 1000 * 86400;
};

// Generate raw condition start, end date sql
export const generateRawDateSql = (
  column_name: string,
  startDate?: Date,
  endDate?: Date,
  checkHourFlg: boolean = false
) => {
  let dateRawCondition = "";
  if (startDate) {
    dateRawCondition = `${column_name} >= '${
      checkHourFlg
        ? new Date(startDate).toISOString()
        : dateToDateStr(new Date(startDate))
    }'`;
  }
  if (startDate && endDate) {
    dateRawCondition = `${column_name} between '${
      checkHourFlg
        ? new Date(startDate).toISOString()
        : dateToDateStr(new Date(startDate))
    }' and '${
      checkHourFlg
        ? new Date(startDate).toISOString()
        : dateToDateStr(new Date(endDate))
    }'`;
  }
  if (!startDate && endDate) {
    dateRawCondition = `${column_name} <= '${
      checkHourFlg
        ? new Date(endDate).toISOString()
        : dateToDateStr(new Date(endDate))
    }'`;
  }
  return dateRawCondition;
};

// Get nearest segment
export const getNearestSegment = (
  start: string,
  timeMark: string,
  segment: number
) => {
  const startTime = new Date();
  const date = startTime.getDate();
  const hour = +start.split(":")[0];
  const minute = +start.split(":")[1];
  startTime.setHours(hour, minute, 0);
  while (startTime.getDate() === date) {
    if (dateToTimeStr(startTime) >= timeMark) {
      return dateToTimeStr(startTime);
    }
    startTime.setMinutes(startTime.getMinutes() + segment);
  }
  return timeMark;
};

// Regex Date YYYY/MM/DD
export const REGEX_DATE =
  /^(19|20)\d\d([-\/])(((0?[13578]|10|12)([-\/])((0[1-9])|([12])([0-9]?)|(3[01]?)))|((0?[469]|11)([-\/])((0[1-9])|([12])([0-9]?)|(30)))|((02)(-)((0[1-9])|([12])([0-9]?))))$/;

// Regex Date MM/DD
export const REGEX_DATE_MMDD =
  /^(((0?[13578]|10|12)(-)((0[1-9])|([12])([0-9]?)|(3[01]?)))|((0?[469]|11)(-)((0[1-9])|([12])([0-9]?)|(30)))|((02)(-)((0[1-9])|([12])([0-9]?))))$/;

// Regex time
export const REGEX_TIME_HHMM = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;

export const checkTimeIsSooner = (
  target: Date | string,
  dayFromTarget: number = 0
) => {
  const now = new Date();
  const dt = new Date(target);
  dt.setDate(dt.getDate() - dayFromTarget);
  return dateToDateStr(now) <= dateToDateStr(dt);
};

// Sub month
export const subMonth = (date: Date | number, amount: number) => {
  return subMonths(date, amount);
};

export const DATE_MAX = new Date(9999, 11, 31);

export const dateToLocaleString = (date: Date, lang: "jp" | "en") => {
  if (lang === "jp") {
    return format(new Date(date), `yyyy年MM月dd日`);
  }
  return dateToDateStr(date);
};

export const getNearestPaymentDate = (date: Date) => {
  // while (date.getDay() !== 0 && date.getDay() !== 6) {
  //   date.setDate(date.getDate() + 1)
  // }
  return date;
};

export const diffMinutes = (from: Date, to: Date) => {
  let diff = (from.getTime() - to.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
};

export const diffDays = (from: Date, to: Date) => {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const utc2 = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

export const getWeeksInMonth = (date: Date) => {
  return Math.floor(date.getDate() / 7) + 1;
};

export const genDateDistanceStringJa = (from: Date, to: Date) => {
  let dayCount = diffDays(from, to);
  let day = 0;
  let week = 0;
  let month = 0;
  if (dayCount >= 30) {
    month = Math.floor(dayCount / 30);
    dayCount = dayCount % 30;
  }
  if (dayCount >= 7) {
    week = Math.floor(dayCount / 7);
    dayCount = dayCount % 7;
  }
  if (dayCount < 7) {
    day = dayCount;
  }

  let dateStr = "";
  if (month > 0) {
    dateStr += `${month}ヵ月`;
  }
  if (week > 0) {
    dateStr += `${week}週間`;
  }
  if (day > 0) {
    dateStr += `${day}日`;
  }
  return dateStr;
};

export const getDateCrossing = (dateArr: { from: Date; to: Date }[]) => {
  const fromDate = new Date(Math.max(...dateArr.map((i) => +i.from)));
  const toDate = new Date(Math.min(...dateArr.map((i) => +i.to)));
  for (let index = 0; index < dateArr.length; index++) {
    const element = dateArr[index];
    if (
      !(
        fromDate >= element.from &&
        fromDate <= element.to &&
        toDate >= element.from &&
        toDate <= element.to
      )
    ) {
      return null;
    }
  }
  return { fromDate, toDate };
};

export const isBetweenTime = (
  timeCheck: string,
  fromTime: string,
  toTime: string
) => {
  return timeCheck >= fromTime && timeCheck <= toTime;
};

export const DATE_OF_WEEK = {
  SUN: 1,
  MON: 2,
  TUE: 3,
  WED: 4,
  THU: 5,
  FRI: 6,
  SAT: 7,
};
