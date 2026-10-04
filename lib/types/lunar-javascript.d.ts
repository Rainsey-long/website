/* Minimal typings for the parts of lunar-javascript (MIT) this site uses. */
declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    getLunar(): Lunar;
    toYmd(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    next(days: number): Solar;
  }
  export class Lunar {
    static fromYmd(y: number, m: number, d: number): Lunar;
    getSolar(): Solar;
    getMonth(): number;
    getDay(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDayInGanZhi(): string;
    getYearInGanZhiByLiChun(): string;
    getYearShengXiao(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayChongShengXiao(): string;
    getDayTianShen(): string;
    getDayTianShenLuck(): string;
    getZhiXing(): string;
    getTimes(): LunarTime[];
  }
  export class LunarYear {
    static fromYear(y: number): LunarYear;
    /** The leap month's number, or 0 when the year has none. */
    getLeapMonth(): number;
  }
  export class LunarMonth {
    /** A negative month is the leap month of that number. */
    static fromYm(y: number, m: number): LunarMonth;
    getDayCount(): number;
  }
  export class LunarTime {
    getGan(): string;
    getZhi(): string;
    getMinHm(): string;
    getMaxHm(): string;
    getTianShen(): string;
    getTianShenLuck(): string;
    getChongShengXiao(): string;
  }
}
