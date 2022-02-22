import { INTERVAL_DATE } from "../../shared/constant";
import { Service } from "typedi";
import { getConnection } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { StatisticItemByTimeData } from "../models/OderDetail";
import { OrderRepository } from "../repositories/Order";
import { OrderDetailRepository } from "../repositories/OrderDetail";

@Service()
export class StatisticService {
  constructor(
    @OrmRepository() private orderDetailRepository: OrderDetailRepository
  ) {}
  public async statisticItemByDate(
    interval: string,
    order: string,
    value: number
  ) {
    const queryRunner = getConnection().createQueryRunner();

    await queryRunner.connect();

    const result: StatisticItemByTimeData[] = await queryRunner.query(`
      SELECT item_id, i.title, i.provider, SUM(quantity) as quantity
      FROM "t_order_detail" as od 
      INNER JOIN m_item as i 
      USING(item_id) 
      WHERE EXTRACT(${interval} from od.created_at) = ${value}
      GROUP BY item_id, title, provider
      ORDER BY quantity ${order}
       `);
    return result;
  }

  public getIntervalDate() {
    return INTERVAL_DATE;
  }
}
