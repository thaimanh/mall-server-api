import { validate, ValidationError } from "class-validator";
import STT from "http-status";
import { HttpError } from "routing-controllers";
import { Service } from "typeDI";
import { ILike } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as uuid from "uuid";
import { FLG_VALUE } from "../../shared/constant";
import { IOrder, ITEM_SORT_MODE } from "../Interface/Order";
import { IResponseCommon, IResponseSuccess } from "../Interface/ResponseCommon";
import { CreateItemBody, Item, UpdateItemBody } from "../models/Item";
import { ItemRepository } from "../repositories/Item";

const ITEM_PERPAGE = 100;
const order: { [id: string]: IOrder } = {
  [ITEM_SORT_MODE.TITLE_ASC.toString()]: {
    title: "ASC",
    createdAt: "ASC",
  },

  [ITEM_SORT_MODE.TITLE_DESC.toString()]: {
    title: "DESC",
    createdAt: "ASC",
  },
};
@Service()
export class ItemService {
  constructor(@OrmRepository() private itemRepository: ItemRepository) {}
  public async createItem(body: CreateItemBody): Promise<Item> {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    try {
      const item = await this.itemRepository.save(
        this.itemRepository.create({
          itemId: uuid.v1(),
          title: body.title,
          price: body.price,
          provider: body.provider,
          availableItem: body.availableItem,
          delFlg: FLG_VALUE.OFF,
        })
      );
      return item;
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Create item failed");
    }
  }

  public async getDetailItem(itemId: string) {
    const item = await this.itemRepository.findOne({
      itemId: itemId,
      delFlg: FLG_VALUE.OFF,
    });
    if (!item) {
      throw new HttpError(STT.BAD_REQUEST, "Item not found");
    }
    return item;
  }

  public async getListItem(
    title?: string,
    price?: number,
    limit?: number,
    offset?: number,
    sortMode?: number
  ): Promise<IResponseCommon<Item[]>> {
    limit = limit || ITEM_PERPAGE;
    offset = offset || 0;

    const whereCondition = {};
    if (title) {
      whereCondition["title"] = ILike(`%${title}%`);
    }
    if (price) {
      whereCondition["price"] = price;
    }

    const orders =
      sortMode && order[sortMode] ? order[sortMode] : { createdAt: "ASC" };

    const users = await this.itemRepository.find({
      where: { ...whereCondition, delFlg: FLG_VALUE.OFF },
      order: orders,
      skip: offset,
      take: limit,
    });
    const total = await this.itemRepository.count({
      ...whereCondition,
      delFlg: FLG_VALUE.OFF,
    });

    return { result: users, meta: { total, offset, limit } };
  }

  public async updateItem(
    body: UpdateItemBody,
    itemId: string
  ): Promise<IResponseSuccess> {
    const item = await this.itemRepository.findOne({ itemId: itemId });
    if (!item) {
      throw new HttpError(STT.BAD_REQUEST, "Item not found");
    }

    try {
      this.itemRepository.merge(item, body);
      await this.itemRepository.save(item);
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Update item error");
    }
  }

  public async deleteItem(itemId: string): Promise<IResponseSuccess> {
    try {
      await this.itemRepository.update(
        { itemId: itemId },
        this.itemRepository.create({ delFlg: FLG_VALUE.ON })
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Delete item error");
    }
  }
}
