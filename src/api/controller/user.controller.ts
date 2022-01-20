import "reflect-metadata";
import { Controller, Get, Post } from "routing-controllers";

@Controller("/user")
export class UserController {
  @Post("/")
  createUser() {
    return "hello world!";
  }

  @Get("/:id")
  getDetailUser() {}

  @Get("/")
  getUsers() {}
}
