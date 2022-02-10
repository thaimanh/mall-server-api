export interface IUserOrder {
  [id: string]: string;
}

export const USER_SORT_MODE = {
  LAST_NAME_ASC: 1,
  LAST_NAME_DESC: 2,
};

export interface IAdminOrder {
  [id: string]: string;
}

export const ADMIN_SORT_MODE = {
  LAST_NAME_ASC: 1,
  LAST_NAME_DESC: 2,
};
