import { Exclude } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import crypto from "crypto";

@Entity("m_user")
export class User {
  public static hashPassword(str: string, salt?: string): string {
    return crypto
      .createHash("md5")
      .update(String(str || "") + String(salt || ""))
      .digest("hex");
  }

  @PrimaryColumn({ name: "user_id", nullable: false })
  public userId: string;

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
    this.password = User.hashPassword(this.password);
  }
}

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

  @IsNumber()
  public gender: number;
}

export class CreateUserBody extends BaseUser {
  @IsNotEmpty()
  public password: string;
}

export class LoginUserBody {
  @IsNotEmpty()
  @IsEmail()
  public mail: string;
  @IsNotEmpty()
  public password: string;
}
