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

export const OTP_STATUS = {
  INVALID: 0,
  VALID: 1,
} as const;

export const OTP_EXPIRES_IN = Number(process.env.OTP_EXPIRES_IN);

export const OTP_LENGTH = 6;

export const FLG_VALUE = {
  OFF: 0,
  ON: 1,
};

export const INTERVAL_DATE = {
  MONTH: 1,
  YEAR: 2,
};

export const ORDER = {
  ASC: 1,
  DESC: 2,
};

export const NON_CAMEL_SPLIT_REGEX = /([-_][a-z0-9])/gi;
export const NON_SNAKE_SPLIT_REGEX = /[A-Z]/g;
