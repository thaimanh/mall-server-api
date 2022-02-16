import { EntityRepository, Repository } from "typeorm";
import { OrderDetail } from "../models/OderDetail";

@EntityRepository(OrderDetail)
export class OrderDetailRepository extends Repository<OrderDetail> {}
