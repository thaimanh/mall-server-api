import { Action } from "routing-controllers";
import { IObject, MEMBER_TYPE } from "../shared/constant";
import { TokenRepository } from "../api/repositories/Token";
import { getCustomRepository } from "typeorm";
import { bindLocals } from "../shared/function";

export async function authorizationChecker(
  action: Action,
  role: string[]
): Promise<boolean> {
  try {
    const memberType = parseScopesToMemberTypes(role);
    const token = action.request.headers["authorization"];
    const tokenRepository = getCustomRepository(TokenRepository);
    const result = await tokenRepository.verifyToken(token, memberType[0]);
    if (!result) {
      return false;
    }
    bindLocals(action.request, result)
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function parseScopesToMemberTypes(scopes: string[]): number[] {
  return <number[]>scopes
    .map((s) => s.toUpperCase())
    .map((s) => s in MEMBER_TYPE && (<IObject>MEMBER_TYPE)[s])
    .filter(Boolean);
}
