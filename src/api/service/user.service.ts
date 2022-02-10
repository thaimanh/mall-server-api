import { validate, ValidationError } from "class-validator";
import STT from "http-status";
import { HttpError } from "routing-controllers";
import { Service } from "typeDI";
import { ILike } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as uuid from "uuid";
import { MEMBER_TYPE, TOKEN_STATUS } from "../../shared/constant";
import { compareHash } from "../../shared/function";
import { IUserOrder, USER_SORT_MODE } from "../Interface/Order";
import { IResponseCommon } from "../Interface/ResponseCommon";
import { CreateUserBody, LoginUserBody, User } from "../models/User";
import { TokenRepository } from "../repositories/Token";
import { UserRepository } from "../repositories/User";

const USER_PERPAGE = 100;
const order: { [id: string]: IUserOrder } = {
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
    @OrmRepository() private tokenRepository: TokenRepository
  ) { }
  public async registerUser(body: CreateUserBody): Promise<User> {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

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

    const user: User = await this.userRepository.findOneOrFail({
      mail: String(body.mail).trim().toLowerCase(),
    });

    if (!user) {
      throw new HttpError(STT.BAD_REQUEST, "Login failed");
    }

    if (!compareHash(body.password, user.password)) {
      throw new HttpError(STT.BAD_REQUEST, "Login failed");
    }

    return this.tokenRepository.newToken(user.userId, MEMBER_TYPE.ADMIN);
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
        { memberCd: user.userId, memberType: MEMBER_TYPE.ADMIN },
        this.tokenRepository.create({ status: TOKEN_STATUS.INVALID })
      );
      return { success: true };
    } catch (error) {
      console.error(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Logout failed");
    }
  }

  public async resetPassword(userId: string) {
    
  }

  public async sendMail(email: string) {

  }

  public async changePassword(userId: string) {

  }

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
}
