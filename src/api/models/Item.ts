import { Exclude } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, Min } from "class-validator";
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

  @Column()
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
