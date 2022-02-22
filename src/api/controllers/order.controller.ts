import {
  Authorized,
  Body,
  Controller,
  Delete,
  Get,
  JsonController,
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
import { CreateOrderDetailBody } from "../models/OderDetail";
import { Order } from "../models/Order";
import { OpenAPI } from "routing-controllers-openapi";

@OpenAPI({
  security: [{ authorization: [] }],
})
@JsonController("/order")
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Authorized(["USER"])
  @Get("/d/:orderId")
  getOrderDetail(
    @Req() req: express.Request,
    @Param("orderId") orderId: string
  ): Promise<IResponseCommon<Order>> {
    const user: User = getLocals(req, "member");
    return this.orderService.getOrderDetail(user.userId, orderId);
  }

  @Authorized(["USER"])
  @Get("/")
  getListOrder(
    @Req() req: express.Request,
    @QueryParam("limit") limit?: number,
    @QueryParam("offset") offset?: number
  ): Promise<IResponseCommon<Order[]>> {
    const user: User = getLocals(req, "member");
    return this.orderService.getListOrder(user.userId, limit, offset);
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
