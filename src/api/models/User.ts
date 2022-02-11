import { Exclude } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, Min } from "class-validator";
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
    this.password = User.hashPassword(this.password);
  }
}

/**
 * Validate property
 */
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

export class SendMailForgotPasswordBody {
  @IsNotEmpty()
  @IsEmail()
  public mail: string;
}

export class ResetPasswordBody {
  @IsNotEmpty()
  @IsEmail()
  public mail: string;
  @IsNotEmpty()
  public otp: string;
  @IsNotEmpty()
  public newPassword: string;
}

export class UpdateUserBody extends BaseUser {}
