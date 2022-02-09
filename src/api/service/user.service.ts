import { Service } from "typeDI";
import { UserRepository } from "../repositories/User";
import { OrmRepository } from "typeorm-typedi-extensions";
import { CreateUserBody, LoginUserBody, User } from "../models/User";
import { validate, ValidationError } from "class-validator";
import * as uuid from "uuid";
import { BadRequestError, InternalServerError } from "routing-controllers";
import { compareHash } from "../../shared/function";
import { TokenRepository } from "../repositories/Token";
import { MEMBER_TYPE } from "../../shared/constant";
import { IResponseCommon } from "../Interface/ResponseCommon";
import { ILike, Like } from "typeorm";

const USER_PERPAGE = 100;
@Service()
export class UserService {
  constructor(
    @OrmRepository() private userRepository: UserRepository,
    @OrmRepository() private tokenRepository: TokenRepository
  ) {}
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
      throw new InternalServerError("System error");
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
      throw new BadRequestError("Login Failed");
    }
    if (!compareHash(body.password, user.password)) {
      throw new BadRequestError("Login Failed");
    }

    return this.tokenRepository.newToken(user.userId, MEMBER_TYPE.USER);
  }

  // public logoutUser(userId: string) {
  //   try {
  //     await this.tokenRepository.save
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return { success: true }
  // },

  public getDetailUser(userId: string) {}

  public async getAllUser(
    name?: string,
    mail?: string,
    limit?: number,
    offset?: number
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

    const users = await this.userRepository.find({
      where: { ...whereCondition },
      skip: offset,
      take: limit,
    });
    const total = await this.userRepository.count({ ...whereCondition });
    return { result: users, meta: { total, offset, limit } };
  }
}
