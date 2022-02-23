import { Exclude } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Item } from "./Item";
import { Order } from "./Order";

@Entity("t_order_detail")
export class OrderDetail {
  @PrimaryColumn({ name: "order_detail_id" })
  public orderDetailId: string;

  @Column({ name: "item_id", nullable: true })
  public itemId: string;

  @Column({ name: "order_id", nullable: true })
  public orderId: string;

  @Column()
  public quantity: number;

  @Column({ type: "decimal" })
  public price: number;

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  public updatedAt: Date;

  @ManyToOne(() => Item, (item) => item.orderDetail, {
    createForeignKeyConstraints: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "item_id" })
  public item: Item;

  @ManyToOne(() => Order, (order) => order.orderDetail, {
    createForeignKeyConstraints: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  public order: Order;
}

/**
 * Validate property
 */

export class BaseOrderDetailBody {
  @IsNotEmpty()
  public quantity: number;

  @IsNotEmpty()
  public price: number;
}

export class CreateOrderDetailBody {
  @IsNotEmpty()
  public itemId: string;

  @IsNotEmpty()
  public quantity: number;

  @IsNotEmpty()
  public price: number;
}

export class UpdateOrderDetailBody extends BaseOrderDetailBody {}

export class StatisticItemByTimeData extends BaseOrderDetailBody {
  @Exclude()
  public price: number;
  @IsNotEmpty()
  public title: string;
  @IsNotEmpty()
  public provider: string;
  @IsNotEmpty()
  public item_id: string;
}
