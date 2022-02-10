import { EntityRepository, Repository } from "typeorm";
import { Otp } from "../models/Otp";
import randomString from "randomstring";
import { hashMd5 } from "../../shared/function";
import { OTP_STATUS, OTP_LENGTH, OTP_EXPIRES_IN } from "../../shared/constant";

@EntityRepository(Otp)
export class OtpRepository extends Repository<Otp> {
  public async newOtp(memberCd: string, memberType: number) {
    const otp = randomString.generate({
      length: OTP_LENGTH,
      charset: "numeric",
    });

    const otpHash = hashMd5(otp);
    const optData = await this.save(
      this.create({
        memberCd,
        memberType,
        expiresAt: new Date(Date.now() + OTP_EXPIRES_IN),
        status: OTP_STATUS.VALID,
        otp: otpHash,
      })
    );

    return {
      ...optData,
      otp,
    };
  }

  public async verifyOtp(otp: string, memberCd: string, memberType: number) {
    try {
      const otpHash = hashMd5(otp);
      const otpData = await this.findOne({
        where: {
          memberCd,
          memberType,
          otp: otpHash,
        },
      });

      if (
        !otpData ||
        otpData.status !== OTP_STATUS.VALID ||
        new Date(otpData.expiresAt).getTime() < Date.now()
      ) {
        return null;
      }
      return otpData;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async revokeOtp(otpSerial: number) {
    await this.update(
      {
        serial: otpSerial,
      },
      this.create({
        status: OTP_STATUS.INVALID,
      })
    );
  }
}
