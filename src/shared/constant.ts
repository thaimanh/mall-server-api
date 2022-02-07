import { dayToMilliseconds } from "./dateUtil";
import { env } from "../env";

export interface IObject<T = unknown> {
  [key: string]: T;
}

export const MEMBER_TYPE = {
  ADMIN: 1,
  USER: 2,
} as const;

// common
export const JWT_EXPIRES_IN = dayToMilliseconds(Number(env.app.expiresIn));
export const JWT_EXPIRES_IN_ADMIN = dayToMilliseconds(
  Number(env.app.expiresInAdmin)
);

export const TOKEN_STATUS = {
  INVALID: 0,
  VALID: 1,
} as const;
