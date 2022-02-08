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
import bcrypt from "bcrypt";

@Entity("m_admin")
export class Admin {
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
    this.password = await Admin.hashPassword(this.password);
  }
}
