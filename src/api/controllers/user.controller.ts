import { OpenAPI } from "routing-controllers-openapi";
import { Authorized, Body, Controller, Get, Post } from "routing-controllers";
import { CreateUserBody, LoginUserBody, User } from "../models/User";

import { UserService } from "../service/user.service";
import { MEMBER_TYPE } from "src/shared/constant";

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

  @Get("/:id")
  getDetailUser() {}

  @Authorized([MEMBER_TYPE.USER])
  @Get("/")
  getUsers() {
    return this.userService.getAllUser();
  }
}
