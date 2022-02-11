import { IsNotEmpty } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("m_item")
export class Item {
  @PrimaryColumn({ name: "item_id", nullable: false })
  public itemId: string;

  @Column()
  public title: string;

  @Column()
  public price: number;

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
}

export class CreateItemBody extends BaseItemBody {}

export class UpdateItemBody extends BaseItemBody {}
