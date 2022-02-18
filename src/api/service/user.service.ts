import { validate, ValidationError } from "class-validator";
import STT from "http-status";
import { HttpError } from "routing-controllers";
import { sendMail } from "../../shared/mailer";
import { Service } from "typeDI";
import { getConnection, ILike } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as uuid from "uuid";
import { MEMBER_TYPE, TOKEN_STATUS } from "../../shared/constant";
import { compareHash, hashMd5 } from "../../shared/function";
import { IOrder, USER_SORT_MODE } from "../Interface/Order";
import { IResponseCommon } from "../Interface/ResponseCommon";
import {
  CreateUserBody,
  LoginUserBody,
  ResetPasswordBody,
  SendMailForgotPasswordBody,
  UpdateUserBody,
  User,
} from "../models/User";
import { OtpRepository } from "../repositories/Otp";
import { TokenRepository } from "../repositories/Token";
import { UserRepository } from "../repositories/User";
import { Token } from "../models/Token";
import { Otp } from "../models/Otp";

const USER_PERPAGE = 100;
const order: { [id: string]: IOrder } = {
  [USER_SORT_MODE.LAST_NAME_ASC.toString()]: {
    lastname: "ASC",
    createdAt: "ASC",
  },

  [USER_SORT_MODE.LAST_NAME_DESC.toString()]: {
    lastname: "DESC",
    createdAt: "ASC",
  },
};
@Service()
export class UserService {
  constructor(
    @OrmRepository() private userRepository: UserRepository,
    @OrmRepository() private tokenRepository: TokenRepository,
    @OrmRepository() private otpRepository: OtpRepository
  ) {}
  public async registerUser(body: CreateUserBody): Promise<User> {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    // Check exist user
    const user = await this.userRepository.findOne({
      where: { mail: body.mail },
    });
    if (user) {
      throw new HttpError(STT.BAD_REQUEST, "User have already exist");
    }

    try {
      const user = await this.userRepository.save(
        this.userRepository.create({
          surname: body.surname,
          lastname: body.lastname,
          birthday: body.birthday,
          gender: body.gender,
          mail: body.mail,
          password: body.password,
          userId: uuid.v1(),
        })
      );
      return user;
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Register failed");
    }
  }

  public async loginUser(
    body: LoginUserBody
  ): Promise<{ accessToken: string }> {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    const user: User = await this.userRepository.findOne({
      mail: String(body.mail).trim().toLowerCase(),
    });

    if (!user) {
      throw new HttpError(STT.BAD_REQUEST, "Login failed");
    }

    if (!compareHash(body.password, user.password)) {
      throw new HttpError(STT.BAD_REQUEST, "Login failed");
    }

    return this.tokenRepository.newToken(user.userId, MEMBER_TYPE.USER);
  }

  public async logoutUser(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { userId: userId },
      });

      if (!user) {
        throw new HttpError(STT.BAD_REQUEST, "User not found");
      }

      await this.tokenRepository.update(
        { memberCd: user.userId, memberType: MEMBER_TYPE.USER },
        this.tokenRepository.create({ status: TOKEN_STATUS.INVALID })
      );
      return { success: true };
    } catch (error) {
      console.error(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Logout failed");
    }
  }

  public async resetPassword(body: ResetPasswordBody) {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    const mail = body.mail;
    const otp = body.otp;
    const newPassword = body.newPassword;
    const user = await this.userRepository.findOne({
      where: { mail: String(mail).toLowerCase() },
    });
    if (!user) {
      throw new HttpError(STT.BAD_REQUEST, "User not found");
    }

    const otpData = await this.otpRepository.verifyOtp(
      otp,
      user.userId,
      MEMBER_TYPE.USER
    );
    if (!otpData) {
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Otp invalid");
    }

    if (otpData && new Date(otpData.expiresAt).getTime() < Date.now()) {
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Otp invalid");
    }
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await Promise.all([
      queryRunner.manager
        .getRepository(User)
        .update(
          { userId: user.userId },
          this.userRepository.create({ password: hashMd5(newPassword) })
        ),
      queryRunner.manager.getRepository(Token).update(
        {
          memberCd: user.userId,
          memberType: MEMBER_TYPE.USER,
          status: TOKEN_STATUS.VALID,
        },
        { status: TOKEN_STATUS.INVALID }
      ),
      queryRunner.manager
        .getCustomRepository(OtpRepository)
        .revokeOtp(otpData.serial),
    ])
      .then(async () => {
        await queryRunner.commitTransaction();
        const mailContent = `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Reset password success</h4>
            </div>
        </div>
    `;
        sendMail(mail, mailContent);
      })
      .catch(async (err) => {
        await queryRunner.rollbackTransaction();
        throw new HttpError(STT.BAD_REQUEST, "Reset failed");
      })
      .finally(async () => {
        await queryRunner.release();
      });
  }

  public async sendMailForgotPassword(body: SendMailForgotPasswordBody) {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    try {
      const mail = body.mail;
      const user = await this.userRepository.findOne({
        where: { mail: String(mail).toLowerCase() },
      });
      if (!user) {
        throw new HttpError(STT.BAD_REQUEST, "User not found");
      }

      const { otp: otpCode } = await this.otpRepository.newOtp(
        user.userId,
        MEMBER_TYPE.USER
      );
      const mailContent = `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Reset password</h4>
                <span style="color: black">Click link to reset your password: http://localhost:3000/api/user/auth/reset-password?otp=${otpCode}</span>
            </div>
        </div>
    `;
      sendMail(mail, mailContent);
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Send mail failed");
    }
  }

  public async changePassword(userId: string) {}

  public async getDetailUser(userId: string) {
    const user = await this.userRepository.findOne({ userId: userId });
    if (!user) {
      throw new HttpError(STT.BAD_REQUEST, "User not found");
    }
    return user;
  }

  public async getListUser(
    name?: string,
    mail?: string,
    limit?: number,
    offset?: number,
    sortMode?: number
  ): Promise<IResponseCommon<User[]>> {
    limit = limit || USER_PERPAGE;
    offset = offset || 0;

    const whereCondition = {};
    if (name) {
      whereCondition["lastname"] = ILike(`%${name}%`);
    }
    if (mail) {
      whereCondition["mail"] = ILike(`%${mail}%`);
    }

    const orders =
      sortMode && order[sortMode] ? order[sortMode] : { createdAt: "ASC" };

    const users = await this.userRepository.find({
      where: { ...whereCondition },
      order: orders,
      skip: offset,
      take: limit,
    });
    const total = await this.userRepository.count({ ...whereCondition });

    return { result: users, meta: { total, offset, limit } };
  }

  public async updateUser(body: UpdateUserBody, userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ userId: userId });
    if (!user) {
      throw new HttpError(STT.BAD_REQUEST, "User not found");
    }

    try {
      this.userRepository.merge(user, body);
      const result = await this.userRepository.save(user);
      return result;
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Update user error");
    }
  }
}
