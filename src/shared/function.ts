import crypto from "crypto";

export const compareHash = (password: string = "", strHash: string) => {
  const hashed = hashMd5(password);
  console.log(hashed, strHash);
  return hashed === strHash;
};

export const hashMd5 = (str: string, salt?: string): string => {
  return crypto
    .createHash("md5")
    .update(String(str || "") + String(salt || ""))
    .digest("hex");
};
