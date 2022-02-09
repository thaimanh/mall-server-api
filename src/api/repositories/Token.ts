import { verify } from "jsonwebtoken";
import { BadRequestError } from "routing-controllers";
import { EntityRepository, getCustomRepository, Repository } from "typeorm";
import * as uuid from "uuid";
import { env } from "../../env";
import {
  IObject,
  JWT_EXPIRES_IN,
  JWT_EXPIRES_IN_ADMIN,
  MEMBER_TYPE,
  TOKEN_STATUS,
} from "../../shared/constant";
import { hashMd5 } from "../../shared/function";
import { JwtService } from "../../shared/jwtService";
import { Token } from "../models/Token";
import { AdminRepository } from "./Admin";
import { UserRepository } from "./User";

interface VerifyTokenResult {
  memberType: number;
  member: IObject;
}
@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {
  private jwtServiceUser: JwtService;
  private jwtServiceAdmin: JwtService;
  constructor() {
    super();

    this.jwtServiceUser = new JwtService(
      this.getSecret(),
      String(JWT_EXPIRES_IN)
    );

    this.jwtServiceAdmin = new JwtService(
      this.getSecret(),
      String(JWT_EXPIRES_IN_ADMIN)
    );
  }

  private mapExpiresTokenWithMember(memberType: number) {
    const obj = {
      [MEMBER_TYPE.ADMIN.toString()]: JWT_EXPIRES_IN_ADMIN,
      [MEMBER_TYPE.USER.toString()]: JWT_EXPIRES_IN,
    };
    return obj[memberType] ?? 0;
  }

  private getService(memberType: number) {
    const obj = {
      [MEMBER_TYPE.ADMIN.toString()]: this.jwtServiceAdmin,
      [MEMBER_TYPE.USER.toString()]: this.jwtServiceUser,
    };
    return obj[memberType];
  }

  private getSecret() {
    return env.app.secretJwt;
  }

  public async newToken(memberCd: string, memberType: number) {
    const expiresIn = this.mapExpiresTokenWithMember(memberType);
    let service = this.getService(memberType);
    const token = await service.getJwt({
      memberCd: memberCd,
    });
    const expriesAt = new Date(Date.now() + expiresIn);
    const tokenHash = hashMd5(token);
    const tokenData = this.create({
      token: tokenHash,
      expiresAt: expriesAt,
      memberType,
      memberCd,
      serial: uuid.v1(),
      status: TOKEN_STATUS.VALID,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.save(tokenData);
    return { accessToken: token };
  }

  public async verifyToken(token: string, memberType: number) {
    try {
      const secret = env.app.secretJwt;
      if (!verify(token, secret)) {
        throw new BadRequestError("Token invalid");
      }
      const tokenHash = hashMd5(token);
      const item = await this.getService(memberType).decodeJwt(token);
      const tokenData = await this.findOne({
        where: {
          memberCd: item.memberCd,
          memberType: memberType,
          token: tokenHash,
        },
      });

      if (
        tokenData &&
        tokenData.status === TOKEN_STATUS.VALID &&
        new Date(tokenData.expiresAt).getTime() > Date.now()
      ) {
        const { codeName, repo } = this.getRepositoryByMembertype(memberType);
        if (!codeName && !repo) {
          throw new BadRequestError("Member type not found");
        }

        const memberData = await repo.find({
          where: {
            [codeName]: tokenData.memberCd,
          },
        });

        if (!memberData) {
          throw new BadRequestError(
            `Not found member with code: '${tokenData.memberCd}' - type: '${tokenData.memberType}'`
          );
        }

        return { memberType: tokenData.memberType, memberData };
      }
      throw new BadRequestError("Invalid token");
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public getRepositoryByMembertype(memberType: number) {
    const obj: { [id: string]: { codeName: string; repo: Repository<any> } } = {
      [MEMBER_TYPE.USER.toString()]: {
        codeName: "userId",
        repo: getCustomRepository(UserRepository),
      },
      [MEMBER_TYPE.ADMIN.toString()]: {
        codeName: "adminId",
        repo: getCustomRepository(AdminRepository),
      },
    };
    return obj[memberType];
  }
}
