import { EntityRepository, Repository } from "typeorm";
import { Admin } from "../models/Admin";

@EntityRepository(Admin)
export class AdminRepository extends Repository<Admin> {}
