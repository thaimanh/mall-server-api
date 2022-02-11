import { Exclude } from "class-transformer";
import { IsEmail, IsNotEmpty, Min } from "class-validator";
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

  @Column({ name: "surname", nullable: false })
  public surname: string;

  @Column()
  @Exclude()
  public password: string;

  @Column()
  public lastname: string;

  @Column()
  public birthday: string;

  @Column()
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

const PASSWORD_MIN_LENGTH = 7;
export class BaseUser {
  @IsNotEmpty()
  public surname: string;

  @IsNotEmpty()
  public lastname: string;

  @IsNotEmpty()
  @IsEmail()
  public mail: string;

  @IsNotEmpty()
  public birthday: string;
}

export class CreateAdminBody extends BaseUser {
  @IsNotEmpty()
  @Min(PASSWORD_MIN_LENGTH)
  public password: string;
}

export class LoginAdminBody {
  @IsNotEmpty()
  @IsEmail()
  public mail: string;
  @IsNotEmpty()
  public password: string;
}

export class UpdateAdminBody extends BaseUser {}
