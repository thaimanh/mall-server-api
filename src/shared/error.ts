import { HttpError } from "routing-controllers";
export class Error extends HttpError {
  public operationName: string;
  public args: any[];

  constructor(operationName: string, args: any[] = []) {
    super(500);
    Object.setPrototypeOf(this, Error.prototype);
    this.operationName = operationName;
    this.args = args; // can be used for internal logging
  }

  log() {
    return `${this.httpCode} + ${this.operationName}`;
  }
}
