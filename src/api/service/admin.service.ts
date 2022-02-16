import { validate, ValidationError } from "class-validator";
import STT from "http-status";
import { HttpError } from "routing-controllers";
import { Service } from "typeDI";
import { ILike } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as uuid from "uuid";
import { MEMBER_TYPE, TOKEN_STATUS } from "../../shared/constant";
import { compareHash } from "../../shared/function";
import { ADMIN_SORT_MODE, IOrder, USER_SORT_MODE } from "../Interface/Order";
import { IResponseCommon } from "../Interface/ResponseCommon";
import {
  CreateAdminBody,
  UpdateAdminBody,
  LoginAdminBody,
  Admin,
} from "../models/Admin";
import { TokenRepository } from "../repositories/Token";
import { AdminRepository } from "../repositories/Admin";

const ADMIN_PER_PAGE = 10;
const order: { [id: string]: IOrder } = {
  [ADMIN_SORT_MODE.LAST_NAME_ASC.toString()]: {
    lastname: "ASC",
    createdAt: "ASC",
  },

  [ADMIN_SORT_MODE.LAST_NAME_DESC.toString()]: {
    lastname: "DESC",
    createdAt: "ASC",
  },
};
@Service()
export class AdminService {
  constructor(
    @OrmRepository() private adminRepository: AdminRepository,
    @OrmRepository() private tokenRepository: TokenRepository
  ) {}
  public async registerAdmin(body: CreateAdminBody): Promise<Admin> {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    // Check exist admin
    const admin = await this.adminRepository.findOne({
      where: { mail: body.mail },
    });
    if (admin) {
      throw new HttpError(STT.BAD_REQUEST, "Admin have already exist");
    }

    try {
      const admin = await this.adminRepository.save(
        this.adminRepository.create({
          surname: body.surname,
          lastname: body.lastname,
          birthday: body.birthday,
          mail: body.mail,
          password: body.password,
          adminId: uuid.v1(),
          gender: body.gender,
        })
      );
      return admin;
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Register failed");
    }
  }

  public async loginAdmin(
    body: LoginAdminBody
  ): Promise<{ accessToken: string }> {
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;

    const admin: Admin = await this.adminRepository.findOneOrFail({
      mail: String(body.mail).trim().toLowerCase(),
    });

    if (!admin) {
      throw new HttpError(STT.BAD_REQUEST, "Login failed");
    }

    if (!compareHash(body.password, admin.password)) {
      throw new HttpError(STT.BAD_REQUEST, "Login failed");
    }

    return this.tokenRepository.newToken(admin.adminId, MEMBER_TYPE.ADMIN);
  }

  public async logoutAdmin(adminId: string) {
    try {
      const admin = await this.adminRepository.findOne({
        where: { adminId: adminId },
      });

      if (!admin) {
        throw new HttpError(STT.BAD_REQUEST, "Admin not found");
      }

      await this.tokenRepository.update(
        { memberCd: admin.adminId, memberType: MEMBER_TYPE.ADMIN },
        this.tokenRepository.create({ status: TOKEN_STATUS.INVALID })
      );
      return { success: true };
    } catch (error) {
      console.error(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Logout failed");
    }
  }

  public async getDetailAdmin(adminId: string) {
    const admin = await this.adminRepository.findOne({ adminId: adminId });
    if (!admin) {
      throw new HttpError(STT.BAD_REQUEST, "Admin not found");
    }
    return admin;
  }

  public async getListAdmin(
    name?: string,
    mail?: string,
    limit?: number,
    offset?: number,
    sortMode?: number
  ): Promise<IResponseCommon<Admin[]>> {
    limit = limit || ADMIN_PER_PAGE;
    offset = offset || 0;

    const whereCondition = {};
    if (name) {
      whereCondition["lastname"] = ILike(`%${name}%`);
    }
    if (mail) {
      whereCondition["mail"] = ILike(`%${mail}%`);
    }

    const orders =
      sortMode && order[sortMode] ? order[sortMode] : { createdAt: "ASC" };

    const admins = await this.adminRepository.find({
      where: { ...whereCondition },
      order: orders,
      skip: offset,
      take: limit,
    });
    const total = await this.adminRepository.count({ ...whereCondition });

    return { result: admins, meta: { total, offset, limit } };
  }

  public async updateAdmin(
    body: UpdateAdminBody,
    adminId: string
  ): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ adminId: adminId });
    if (!admin) {
      throw new HttpError(STT.BAD_REQUEST, "Admin not found");
    }

    try {
      this.adminRepository.merge(admin, body);
      const result = await this.adminRepository.save(admin);
      return result;
    } catch (error) {
      console.log(error);
      throw new HttpError(STT.INTERNAL_SERVER_ERROR, "Update admin error");
    }
  }
}
