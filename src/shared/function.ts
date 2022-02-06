import bcrypt from "bcrypt";
export const compareHash = async (password: string = "", strHash: string) => {
  const hashed = await hashMd5(password);
  return hashed === strHash;
};
export const hashMd5 = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return reject(err);
      }
      resolve(hash);
    });
  });
};
