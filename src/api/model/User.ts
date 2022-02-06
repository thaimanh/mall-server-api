import { Exclude } from "class-transformer";
import { IsNotEmpty } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  BeforeInsert,
  PrimaryGeneratedColumn,
} from "typeorm";
import bcrypt from "bcrypt";

@Entity("m_user")
export class User {
  public static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return reject(err);
        }
        resolve(hash);
      });
    });
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
  @Column()
  public mail: string;

  @Column()
  public gender?: number;

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
    this.password = await User.hashPassword(this.password);
  }
}
