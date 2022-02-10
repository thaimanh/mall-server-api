import { decode } from "jsonwebtoken";
import { Action } from "routing-controllers";
import { getCustomRepository } from "typeorm";
import { UserRepository } from "../repositories/User";

export async function currentUserChecker(action: Action) {
  const token = action.request.headers["authorization"];
  const decodedUser: any = decode(token);
  const userRepository = getCustomRepository(UserRepository);
  const currentUser = await userRepository.findOne({
    where: {
      userId: decodedUser.memberCd,
    },
  });
  return currentUser;
}
