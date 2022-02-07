import { Service } from "typeDI";
import { UserRepository } from "../repositories/User";
import { OrmRepository } from "typeorm-typedi-extensions";
import { User } from "../model/User";
import * as uuid from "uuid";
import { BadRequestError, InternalServerError } from "routing-controllers";
import { compareHash } from "../../shared/function";
import { TokenRepository } from "../repositories/Token";

@Service()
export class UserService {
  constructor(
    @OrmRepository() private userRepository: UserRepository,
    @OrmRepository() private tokenRepository: TokenRepository
  ) {}
  public async registerUser(body: User): Promise<User> {
    try {
      body.userId = uuid.v1();
      body.createdAt = new Date();
      body.updatedAt = new Date();
      const user = await this.userRepository.save(body);
      return user;
    } catch (error) {
      throw new InternalServerError("System error");
    }
  }

  public async loginUser(body: User) {
    const user: User = await this.userRepository.findOneOrFail({
      mail: String(body.mail).trim().toLowerCase(),
    });
    if (!user) {
      throw new BadRequestError("Login Failed");
    }
    if (!compareHash(body.password, user.password)) {
      throw new BadRequestError("Login Failed");
    }
  }

  public logoutUser() {}

  public getDetailUser() {}

  public getAllUser() {
    return this.userRepository.find();
  }
}
