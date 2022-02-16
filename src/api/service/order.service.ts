import { validate, ValidationError } from "class-validator";
import STT from "http-status";
import { HttpError } from "routing-controllers";
import { Service } from "typeDI";
import { ILike } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as uuid from "uuid";
import { FLG_VALUE } from "../../shared/constant";
import { IResponseCommon, IResponseSuccess } from "../Interface/ResponseCommon";
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

  public async getListOrder(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<IResponseCommon<Order[]>> {
    limit = limit || ORDER_PERPAGE;
    offset = offset || 0;

    const orders = await this.orderRepository.find({
      where: { userId: userId, delFlg: FLG_VALUE.OFF },
      skip: offset,
      take: limit,
    });
    const total = await this.orderRepository.count({
      userId: userId,
      delFlg: FLG_VALUE.OFF,
    });

    return { result: orders, meta: { total, offset, limit } };
  }

  public async getOrderDetail(userId: string, orderId: string) {
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderDetail", "orderDetail")
      .leftJoinAndSelect("orderDetail.item", "item")
      .where("order.userId = :userId", { userId })
      .andWhere("order.orderId = :orderId", { orderId })
      .andWhere("order.delFlg = :delFlg", { delFlg: FLG_VALUE.OFF })
      .getOne();

    return { result: result, meta: {} };
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
