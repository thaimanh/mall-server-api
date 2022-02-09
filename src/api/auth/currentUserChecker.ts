import { decode } from "jsonwebtoken";
import { Action } from "routing-controllers";
import { getCustomRepository } from "typeorm";
import { User } from "../models/User";
import { UserRepository } from "../repositories/User";

export async function currentUserChecker(action: Action, role: string[]) {
  const token = action.request.headers["authorization"];
  const decodedUser: Partial<User> = decode(token);
  const userRepository = getCustomRepository(UserRepository);
  return await userRepository.findOne({
    where: {
      userId: decodedUser.userId,
    },
  });
}
