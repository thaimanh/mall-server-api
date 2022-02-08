import { Exclude } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("m_token")
export class Token {
  @PrimaryColumn({ name: "serial", nullable: false })
  public serial: string;

  @Column({ name: "member_cd", nullable: false })
  public memberCd: string;

  @IsNotEmpty()
  @Column({ name: "token", nullable: false })
  public token: string;

  @IsNotEmpty()
  @Column({ name: "member_type", nullable: false })
  @Exclude()
  public memberType: number;

  @IsNotEmpty()
  @Column({ name: "status", nullable: false })
  public status: number;

  @IsNotEmpty()
  @Column({ name: "expires_at", nullable: false })
  public expiresAt: Date;

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  public updatedAt: Date;
}
