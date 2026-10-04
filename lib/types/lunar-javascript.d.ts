/* Minimal typings for the parts of lunar-javascript (MIT) this site uses. */
declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    getLunar(): Lunar;
    toYmd(): string;
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
