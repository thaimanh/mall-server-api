import crypto from "crypto";
import express from "express";
import { IObject } from "./constant";
import { dateToDateStr } from "./dateUtil";

export const compareHash = (password: string = "", strHash: string) => {
  const hashed = hashMd5(password);
  return hashed === strHash;
};

export const hashMd5 = (str: string, salt?: string): string => {
  return crypto
    .createHash("md5")
    .update(String(str || "") + String(salt || ""))
    .digest("hex");
};

// bind some locals data (ex: decode data token ...) to request
export const bindLocals = (req: express.Request, data = {}): void => {
  const locals = req.res?.locals || {};
  for (const key of Object.keys(data)) {
    locals[key] = (<IObject>data)[key];
  }
};

// get some locals data from request
export const getLocals = (req: express.Request, key?: string): any => {
  const locals = req.res?.locals || {};
  return key ? locals[String(key)] : locals;
};

export const objArrToDict = <T>(arr: T[], indexKey: keyof T) => {
  const normalizedObject: any = {};
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i][indexKey];
    if (typeof value === "string" || typeof value === "number") {
      normalizedObject[value.toString()] = arr[i];
    }
    if (value instanceof Date) {
      normalizedObject[dateToDateStr(value)] = arr[i];
    }
  }
  return normalizedObject as { [key: string]: T };
};
