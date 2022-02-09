export interface IResponseSuccess {
  success: boolean | true;
}

export interface IResponseCommon<ResultType> {
  result: ResultType;
  meta:
    | {
        total: number;
        offset: number;
        limit: number;
      }
    | {};
}
