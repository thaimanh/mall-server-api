import { useContainer as classValidatorUseContainer } from "class-validator";
import { useContainer as routingUseContainer } from "routing-controllers";
import { Container } from "typedi";
import { useContainer as ormUseContainer } from "typeorm";

export const iocLoader = () => {
  routingUseContainer(Container);
  ormUseContainer(Container);
  classValidatorUseContainer(Container);
};
