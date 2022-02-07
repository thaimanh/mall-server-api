import jsonwebtoken, { VerifyErrors } from "jsonwebtoken";
import { IObject } from "./constant";

interface IClientData extends IObject {
  memberCd: string;
}

interface IOptions {
  expiresIn: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly options: IOptions;

  constructor(secret: string, expiresIn: string) {
    this.secret = secret;
    this.options = { expiresIn };
  }

  public getJwt(data: IClientData): Promise<string> {
    return new Promise((resolve, reject) => {
      jsonwebtoken.sign(data, this.secret, this.options, (err, token) => {
        err ? reject(err) : resolve(token || "");
      });
    });
  }

  public decodeJwt(jwt: string): Promise<IClientData> {
    return new Promise((res, rej) => {
      jsonwebtoken.verify(
        jwt,
        this.secret,
        (err: VerifyErrors | null, decoded?: object) => {
          return err
            ? rej("Json-WebToken validate error")
            : res(decoded as IClientData);
        }
      );
    });
  }
}
