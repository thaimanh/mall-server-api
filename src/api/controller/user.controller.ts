import {
  OpenAPI,
  ResponseSchema,
  routingControllersToSpec,
} from "routing-controllers-openapi";
import {
  Body,
  Controller,
  Get,
  getMetadataArgsStorage,
  JsonController,
  Post,
} from "routing-controllers";
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  Min,
  validate,
  ValidationError,
} from "class-validator";
import { Type } from "class-transformer";
import { User } from "../model/User";

import { UserService } from "../service/user.service";

class BaseUser {
  @IsNotEmpty()
  public surname: string;

  @IsNotEmpty()
  public lastname: string;

  @IsNotEmpty()
  @IsEmail()
  public mail: string;

  @IsNotEmpty()
  public birthday: string;

  @IsNumber()
  public gender: number;
}

class CreateUserBody {
  @IsNotEmpty()
  public password: string;
  @IsNotEmpty()
  public surname: string;

  @IsNotEmpty()
  public lastname: string;

  @IsNotEmpty()
  @IsEmail()
  public mail: string;

  @IsNotEmpty()
  public birthday: string;

  @IsNumber()
  public gender: number;
}

class LoginUserBody {
  @IsNotEmpty()
  @IsEmail()
  public mail: string;
  @IsNotEmpty()
  public password: string;
}
@OpenAPI({})
@Controller("/user")
export class UserController {
  constructor(private userService: UserService) {}
  @Post("/auth/login")
  loginUser(@Body() body: LoginUserBody): Promise<{ accessToken: string }> {
    const user = new User();
    user.mail = body.mail;
    user.password = body.password;

    return this.userService.loginUser(user);
  }

  @Post("/auth/register")
  public async registerUser(@Body() body: CreateUserBody): Promise<User> {
    console.log(body.mail);
    const validationRes: Array<ValidationError> = await validate(body);
    if (validationRes.length > 0) throw validationRes;
    const user = new User();
    user.surname = body.surname;
    user.lastname = body.lastname;
    user.birthday = body.birthday;
    user.gender = body.gender;
    user.mail = body.mail;
    user.password = body.password;

    return this.userService.registerUser(user);
  }

  @Get("/:id")
  getDetailUser() {}

  @Get("/")
  getUsers() {
    return this.userService.getAllUser();
  }
}
