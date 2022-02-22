import {
  Authorized,
  Controller,
  Get,
  JsonController,
  QueryParam,
} from "routing-controllers";
import { StatisticService } from "../service/statistic.service";
import { StatisticItemByTimeData } from "../models/OderDetail";
import { OpenAPI } from "routing-controllers-openapi";

// @OpenAPI({
//   security: [{ authorization: [] }],
// })
@OpenAPI({
  security: [{ authorization: [] }],
})
@JsonController("/statistic")
export class StatisticController {
  constructor(private statisticService: StatisticService) {}

  @Authorized(["ADMIN"])
  @Get("/item-by-date")
  async statisticItemByTime(
    @QueryParam("interval") interval: string,
    @QueryParam("order") order: string,
    @QueryParam("value") value: number
  ): Promise<StatisticItemByTimeData[]> {
    const result = await this.statisticService.statisticItemByDate(
      interval,
      order,
      value
    );
    return result;
  }
}
