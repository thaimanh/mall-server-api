import { IsNotEmpty } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrderDetail } from "./OderDetail";

@Entity("m_item")
export class Item {
  @PrimaryColumn({ name: "item_id", nullable: false })
  public itemId: string;

  @Column()
  public title: string;

  @Column({ type: "decimal" })
  public price: number;

  @Column({ name: "available_item", default: 100 })
  public availableItem: number;

  @Column()
  public provider: string;

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

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.item)
  public orderDetail: OrderDetail[];
}

/**
 * Validate property
 */

export class BaseItemBody {
  @IsNotEmpty()
  public title: string;

  @IsNotEmpty()
  public price: number;

  @IsNotEmpty()
  public provider: string;

  @IsNotEmpty()
  public availableItem: number;
}

export class CreateItemBody extends BaseItemBody {}

export class UpdateItemBody extends BaseItemBody {}
