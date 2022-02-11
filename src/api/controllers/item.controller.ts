import {
  Authorized,
  Body,
  Controller,
  Get,
  Param,
  Post,
  QueryParam,
} from "routing-controllers";
import {
  IResponseCommon,
  IResponseSuccess,
} from "src/api/Interface/ResponseCommon";
import { CreateItemBody, Item, UpdateItemBody } from "../models/Item";
import { ItemService } from "../service/item.service";

// @OpenAPI({
//   security: [{ authorization: [] }],
// })
@Controller("/item")
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Authorized(["ADMIN", "USER"])
  @Get("/:id")
  getDetailUser(@Param("id") itemId: string): Promise<Item> {
    return this.itemService.getDetailItem(itemId);
  }

  @Authorized(["ADMIN", "USER"])
  @Get("/list")
  getListUser(
    @QueryParam("limit") limit: number,
    @QueryParam("offset") offset: number,
    @QueryParam("title") title: string,
    @QueryParam("price") price: number,
    @QueryParam("sortMode") sortMode: number
  ): Promise<IResponseCommon<Item[]>> {
    return this.itemService.getListItem(title, price, limit, offset, sortMode);
  }

  @Authorized(["ADMIN"])
  @Post("/create")
  createItem(@Body() body: CreateItemBody): Promise<Item> {
    return this.itemService.createItem(body);
  }

  @Authorized(["ADMIN"])
  @Get("/:id")
  updateItem(
    @Body() body: UpdateItemBody,
    @Param("id") itemId: string
  ): Promise<IResponseSuccess> {
    return this.itemService.updateItem(body, itemId);
  }
}
