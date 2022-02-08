import { Service } from "typeDI";
import { UserRepository } from "../repositories/User";
import { OrmRepository } from "typeorm-typedi-extensions";
import { User } from "../models/User";
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
  public async registerUser(body: User): Promise<User> {
    try {
      body.userId = uuid.v1();
      const user = await this.userRepository.save(body);
      return user;
    } catch (error) {
      console.log(error);
      throw new InternalServerError("System error");
    }
  }

  public async loginUser(body: User): Promise<{ accessToken: string }> {
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
    return this.tokenRepository.find();
  }
}
