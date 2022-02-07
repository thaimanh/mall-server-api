import { EntityRepository, Repository } from "typeorm";
import { Token } from "../model/Token";
import { JwtService } from "../../shared/jwtService";
import { env } from "../../env";
import {
  JWT_EXPIRES_IN,
  JWT_EXPIRES_IN_ADMIN,
  MEMBER_TYPE,
  TOKEN_STATUS,
} from "../../shared/constant";
import { hashMd5 } from "../../shared/function";
import uuid from "uuid";

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
      expiresIn: expiresIn,
    });
    const expriesAt = new Date(Date.now() + expiresIn);
    const tokenHash = await hashMd5(token);
    const tokenData = await this.create({
      token: tokenHash,
      expiresAt: expriesAt,
      memberType,
      memberCd,
      serial: uuid.v1(),
      status: TOKEN_STATUS.VALID,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // let tokenData: Token = new Token();
    // tokenData.memberType = memberType;
    // tokenData.expiresAt = expriesAt;
    // tokenData.memberCd = memberCd;
    // tokenData.serial = uuid.v1();
    // tokenData.token = tokenHash;
    // tokenData.createdAt = new Date();
    // tokenData.updatedAt = new Date();
    const tokenSave = await this.save(tokenData);
  }

  public async verifyToken() {}
}
