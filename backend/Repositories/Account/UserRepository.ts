import { Err, isOk, Ok, Result } from "rustic";
import { db } from "../../server.js";


export interface RepoUser {
  firstname: string,
  lastname: string,
  email: string,
  gender: string,
  roleid: string,
  password: string,
}


class UserRepository {
  /**
   * Adds an user to the DB
   * @param firstname string, firstname
   * @param lastname string, lastname
   * @param email string, email
   * @param gender gender, gender
   * @param rolename string, rolename
   * @param password string, password
   * @returns 
   */
  public async addUser({firstname, lastname, email, gender, roleid, password}:RepoUser): Promise<Result<any[], string>> {
    let ans = await db.safeQuery(`INSERT INTO users (firstname, lastname, email, gender, passwordhash, roleid, active, createdat, updatedat)
        VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP)`, [
          firstname,
          lastname,
          email,
          gender,
          password,
          roleid
        ]);
    if (isOk(ans)) {
      return Ok(ans.data);
    } else {
      return Err("Query returned undefined.")
    }
  }
}

export default new UserRepository();