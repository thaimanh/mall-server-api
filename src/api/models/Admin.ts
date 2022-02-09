import { Exclude } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import crypto from "crypto";

@Entity("m_admin")
export class Admin {
  public static hashPassword(str: string, salt?: string): string {
    return crypto
      .createHash("md5")
      .update(String(str || "") + String(salt || ""))
      .digest("hex");
  }

  @PrimaryColumn({ name: "admin_id", nullable: false })
  public adminId: string;

  @IsNotEmpty()
  @Column({ name: "surname", nullable: false })
  public surname: string;

  @IsNotEmpty()
  @Column()
  @Exclude()
  public password: string;

  @IsNotEmpty()
  @Column()
  public lastname: string;

  @IsNotEmpty()
  @Column()
  public birthday: string;

  @IsNotEmpty()
  @Column({ unique: true })
  public mail: string;

  @Column({ nullable: true })
  public gender: number;

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  public updatedAt: Date;

  public toString(): string {
    return `${this.surname} ${this.lastname}`;
  }

  @BeforeInsert()
  public async hashPassword(): Promise<void> {
    this.password = Admin.hashPassword(this.password);
  }
}
