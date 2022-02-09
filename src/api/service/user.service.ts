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

  public logoutUser() {}

  public getDetailUser() {}

  public getAllUser() {
    return this.userRepository.find();
  }
}
