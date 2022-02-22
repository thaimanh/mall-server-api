import {
  Authorized,
  Body,
  Controller,
  CurrentUser,
  Get,
  JsonController,
  Post,
  QueryParam,
  Req,
} from "routing-controllers";
import {
  IResponseCommon,
  IResponseSuccess,
} from "src/api/Interface/ResponseCommon";
import express from "express";
import {
  Admin,
  CreateAdminBody,
  LoginAdminBody,
  UpdateAdminBody,
} from "../models/Admin";
import { AdminService } from "../service/admin.service";
import { getLocals } from "../../shared/function";
import { OpenAPI } from "routing-controllers-openapi";

@OpenAPI({
  security: [{ authorization: [] }],
})
@JsonController("/admin")
export class AdminController {
  constructor(private adminService: AdminService) {}
  @Post("/auth/login")
  public loginAdmin(
    @Body() body: LoginAdminBody
  ): Promise<{ accessToken: string }> {
    return this.adminService.loginAdmin(body);
  }

  @Post("/auth/register")
  public async registerAdmin(@Body() body: CreateAdminBody): Promise<Admin> {
    return this.adminService.registerAdmin(body);
  }

  @Post("/auth/logout")
  public logoutAdmin(@Req() req: express.Request): Promise<IResponseSuccess> {
    const admin: Admin = getLocals(req, "member");
    return this.adminService.logoutAdmin(admin.adminId);
  }

  @Authorized(["ADMIN"])
  @Get("/detail")
  getDetailAdmin(@Req() req: express.Request): Promise<Admin> {
    const admin: Admin = getLocals(req, "member");
    return this.adminService.getDetailAdmin(admin.adminId);
  }

  @Authorized(["ADMIN"])
  @Get("/")
  getListUser(
    @QueryParam("limit") limit: number,
    @QueryParam("offset") offset: number,
    @QueryParam("mail") mail: string,
    @QueryParam("name") name: string,
    @QueryParam("sortMode") sortMode: number
  ): Promise<IResponseCommon<Admin[]>> {
    return this.adminService.getListAdmin(name, mail, limit, offset, sortMode);
  }

  @Authorized(["ADMIN"])
  @Get("/")
  updateAdmin(
    @Req() req: express.Request,
    @Body() body: UpdateAdminBody
  ): Promise<Admin> {
    const admin: Admin = getLocals(req, "member");
    return this.adminService.updateAdmin(body, admin.adminId);
  }
}
