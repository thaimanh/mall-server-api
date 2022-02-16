import { IsNotEmpty } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrderDetail } from "./OderDetail";
import { User } from "./User";

@Entity("t_order")
export class Order {
  @PrimaryColumn({ name: "order_id", nullable: false })
  public orderId: string;

  @Column({ name: "user_id", nullable: true })
  public userId: string;

  @Column()
  public total: number;

  @Column({ name: "del_flg" })
  public delFlg: number;

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  public updatedAt: Date;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
    cascade: true,
  })
  public orderDetail: OrderDetail[];

  @ManyToOne(() => User, (user) => user.orders, {
    createForeignKeyConstraints: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  public user: User;
}

/**
 * Validate property
 */

export class BaseOrderBody {
  @IsNotEmpty()
  public orderId: string;

  @IsNotEmpty()
  public userId: string;

  @IsNotEmpty()
  public total: number;
}

export class CreateOrderBody extends BaseOrderBody {}

export class UpdateOrderBody extends BaseOrderBody {}
