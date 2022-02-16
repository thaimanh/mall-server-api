import {
  Authorized,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  QueryParam,
  Req,
} from "routing-controllers";
import express from "express";
import {
  IResponseCommon,
  IResponseSuccess,
} from "src/api/Interface/ResponseCommon";
import { OrderService } from "../service/order.service";
import { getLocals } from "../../shared/function";
import { User } from "../models/User";
import { CreateOrderDetailBody, OrderDetail } from "../models/OderDetail";

// @OpenAPI({
//   security: [{ authorization: [] }],
// })
@Controller("/order")
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Authorized(["USER"])
  @Get("/order-by-user")
  getOrderByUser(
    @Req() req: express.Request,
    @QueryParam("title") title?: string,
    @QueryParam("limit") limit?: number,
    @QueryParam("offset") offset?: number
  ): Promise<IResponseCommon<OrderDetail[]>> {
    const user: User = getLocals(req, "member");
    return this.orderService.getOrderByUser(user.userId, title, limit, offset);
  }

  @Authorized(["USER"])
  @Post("/create")
  createOrder(
    @Req() req: express.Request,
    @Body() body: CreateOrderDetailBody[]
  ): Promise<IResponseSuccess> {
    const user: User = getLocals(req, "member");
    return this.orderService.createOrder(body, user.userId);
  }

  @Authorized(["USER"])
  @Delete("/:orderId")
  cancelOrder(
    @Req() req: express.Request,
    @Param("orderId") orderId: string
  ): Promise<IResponseSuccess> {
    const user: User = getLocals(req, "member");
    return this.orderService.cancelOrder(orderId, user.userId);
  }
}
