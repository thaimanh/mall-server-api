import { EntityRepository, Repository } from "typeorm";
import { Item } from "../models/Item";

@EntityRepository(Item)
export class ItemRepository extends Repository<Item> { }
