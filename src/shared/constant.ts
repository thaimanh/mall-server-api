import { dayToMilliseconds } from "./dateUtil";

export interface IObject<T = unknown> {
  [key: string]: T;
}

export const MEMBER_TYPE = {
  ADMIN: 1,
  USER: 2,
} as const;

// common
export const JWT_EXPIRES_IN = dayToMilliseconds(
  Number(process.env.JWT_EXPIRES_IN)
);
export const JWT_EXPIRES_IN_ADMIN = dayToMilliseconds(
  Number(process.env.JWT_EXPIRES_IN_ADMIN)
);
export const JWT_EXPIRES_IN_SALON = dayToMilliseconds(
  Number(process.env.JWT_EXPIRES_IN_SALON)
);
export const JWT_EXPIRES_IN_STYLIST = dayToMilliseconds(
  Number(process.env.JWT_EXPIRES_IN_STYLIST)
);

export const TOKEN_STATUS = {
  INVALID: 0,
  VALID: 1,
} as const;
