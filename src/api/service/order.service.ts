import { validate, ValidationError } from "class-validator";
import STT from "http-status";
import { HttpError } from "routing-controllers";
import { Service } from "typeDI";
import { ILike } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as uuid from "uuid";
import { FLG_VALUE } from "../../shared/constant";
import { IResponseSuccess } from "../Interface/ResponseCommon";
import { CreateOrderDetailBody } from "../models/OderDetail";
import { Order } from "../models/Order";
import { ItemRepository } from "../repositories/Item";
import { OrderRepository } from "../repositories/Order";
import { OrderDetailRepository } from "../repositories/OrderDetail";
import { UserRepository } from "../repositories/User";

const ORDER_PERPAGE = 10;
@Service()
export class OrderService {
  constructor(
    @OrmRepository() private itemRepository: ItemRepository,
    @OrmRepository() private orderRepository: OrderRepository,
    @OrmRepository() private orderDetailRepository: OrderDetailRepository,
    @OrmRepository() private userRepository: UserRepository
  ) {}
  public async createOrder(
    body: CreateOrderDetailBody[],
    userId: string
  ): Promise<IResponseSuccess> {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    try {
      const total = body.reduce((pV, cV) => {
        return cV.price * cV.quantity + pV;
      }, 0);
      const arrOrderDetail = body.map((i) => {
        return {
          orderDetailId: uuid.v1(),
          price: i.price,
          quantity: i.quantity,
          item: this.itemRepository.create({ itemId: i.itemId }),
        };
      });
      const instanceArrOrderDetail =
        this.orderDetailRepository.create(arrOrderDetail);

      const instanceOrder = this.orderRepository.create({
        orderId: uuid.v1(),
        orderDetail: instanceArrOrderDetail,
        total: total,
        delFlg: FLG_VALUE.OFF,
      });

      const instanceUser = this.userRepository.create({
        userId: userId,
        orders: [instanceOrder],
      });
      await this.userRepository.save(instanceUser);

      return { success: true };
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Create order failed");
    }
  }

  public async getOrderByUser(
    userId: string,
    title?: string,
    limit?: number,
    offset?: number,
    sortMode?: number
  ) {
    limit = limit || ORDER_PERPAGE;
    offset = offset || 0;

    const whereCondition = {};
    if (title) {
      whereCondition["title"] = ILike(`%${title}%`);
    }

    const builder = this.orderDetailRepository
      .createQueryBuilder("orderDetail")
      .leftJoinAndSelect("orderDetail.item", "item")
      .leftJoinAndSelect("orderDetail.order", "order")
      .where("order.userId = :userId", { userId })
      .andWhere("order.delFlg = :delFlg", { delFlg: FLG_VALUE.OFF });

    whereCondition[title] && builder.andWhere("item.title = :title", { title });

    const builderClone = builder.clone();

    const result = await builder
      .orderBy("orderDetail.price", "DESC")
      .limit(limit)
      .offset(offset)
      .getMany();
    const total = await builderClone.getCount();
    return { result: result, meta: { total, offset, limit } };
  }

  public async cancelOrder(
    orderId: string,
    userId: string
  ): Promise<IResponseSuccess> {
    const order = await this.orderRepository.find({
      where: { orderId: orderId, userId: userId, delFlg: FLG_VALUE.OFF },
    });
    if (!order) {
      throw new HttpError(STT.BAD_REQUEST, "Order not found");
    }
    try {
      await this.orderRepository.update(
        { userId: userId, orderId: orderId },
        { delFlg: FLG_VALUE.ON }
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Cancel order error");
    }
  }
}
