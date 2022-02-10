import {
  Authorized,
  Body,
  Controller,
  CurrentUser,
  Get,
  Post,
  QueryParam,
} from "routing-controllers";
import {
  IResponseCommon,
  IResponseSuccess,
} from "src/api/Interface/ResponseCommon";
import {
  CreateUserBody,
  LoginUserBody,
  ResetPasswordBody,
  SendMailForgotPasswordBody,
  User,
} from "../models/User";
import { UserService } from "../service/user.service";

// @OpenAPI({
//   security: [{ authorization: [] }],
// })
@Controller("/user")
export class UserController {
  constructor(private userService: UserService) {}
  @Post("/auth/login")
  public loginUser(
    @Body() body: LoginUserBody
  ): Promise<{ accessToken: string }> {
    return this.userService.loginUser(body);
  }

  @Post("/auth/register")
  public async registerUser(@Body() body: CreateUserBody): Promise<User> {
    return this.userService.registerUser(body);
  }

  @Post("/auth/logout")
  public logoutUser(@CurrentUser() user: User): Promise<IResponseSuccess> {
    return this.userService.logoutUser(user.userId);
  }

  @Post("/auth/send-mail-forgot-password")
  public sendMailForgotPassword(@Body() body: SendMailForgotPasswordBody) {
    return this.userService.sendMailForgotPassword(body);
  }

  @Post("/auth/reset-password")
  public resetPassword(@Body() body: ResetPasswordBody) {
    return this.userService.resetPassword(body);
  }

  @Authorized(["USER"])
  @Get("/detail")
  getDetailUser(@CurrentUser() user: User): Promise<User> {
    return this.userService.getDetailUser(user.userId);
  }

  @Authorized(["USER"])
  @Get("/")
  getListUser(
    @QueryParam("limit") limit: number,
    @QueryParam("offset") offset: number,
    @QueryParam("mail") mail: string,
    @QueryParam("name") name: string,
    @QueryParam("sortMode") sortMode: number
  ): Promise<IResponseCommon<User[]>> {
    return this.userService.getListUser(name, mail, limit, offset, sortMode);
  }
}
