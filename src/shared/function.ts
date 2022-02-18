import crypto from "crypto";
import express from "express";
import {
  IObject,
  NON_CAMEL_SPLIT_REGEX,
  NON_SNAKE_SPLIT_REGEX,
} from "./constant";
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

type ObjectTransform =
  | unknown
  | IObject<ObjectTransform>
  | Array<ObjectTransform>;

export const objToCamel = (obj: ObjectTransform): ObjectTransform => {
  if (obj instanceof Array) return obj.map(objToCamel);
  if (!(obj instanceof Object)) return obj;
  const newObj: IObject<ObjectTransform> = {};
  Object.keys(obj).forEach((k) => {
    newObj[strToCamel(k)] = objToCamel((<IObject<ObjectTransform>>obj)[k]);
  });
  return newObj;
};

export const objToSnake = (obj: ObjectTransform): ObjectTransform => {
  if (obj instanceof Array) return obj.map(objToSnake);
  if (!(obj instanceof Object)) return obj;
  const newObj: IObject<ObjectTransform> = {};
  Object.keys(obj).forEach((k) => {
    newObj[strToSnake(k)] = objToSnake((<IObject<ObjectTransform>>obj)[k]);
  });
  return newObj;
};

export const strToCamel = (str: string): string => {
  return str.replace(NON_CAMEL_SPLIT_REGEX, (letter) =>
    letter.toUpperCase().replace(/-|_/g, "")
  );
};

export const strToSnake = (str: string): string => {
  return str.replace(
    NON_SNAKE_SPLIT_REGEX,
    (letter) => `_${letter.toLowerCase()}`
  );
};
