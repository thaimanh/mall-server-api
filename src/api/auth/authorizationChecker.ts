import { Action } from "routing-controllers";
import { MEMBER_TYPE } from "../../shared/constant";
import { Container } from "typedi";
import { TokenRepository } from "../repositories/Token";
import { getCustomRepository } from "typeorm";

export async function authorizationChecker(action: Action): Promise<boolean> {
  try {
    const token = action.request.headers["authorization"];
    const tokenRepository = getCustomRepository(TokenRepository);
    const result = await tokenRepository.verifyToken(token, MEMBER_TYPE.USER);
    if (!result) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
