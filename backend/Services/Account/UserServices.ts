import { User } from "../../db/@types/models/users.js";
import bcrypt from 'bcrypt';
import { db } from "../../server.js";
import { GetUsersQuery } from "../../db/@types/querys.js";
import { Err, isOk, Ok, Result } from "rustic";
import UserRepository from "../../Repositories/Account/UserRepository.js";


class UserService {


  async createUser(userData: User): Promise<Result<any[], string>> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    try {
      let usersWithEmail: Result<any[], string> = await db.safeQuery(`SELECT u.email FROM users u WHERE (u.email = $1)`, [userData.email]);
      if (!isOk(usersWithEmail) || usersWithEmail == null || usersWithEmail.data.length > 0) {
        return Err("User with same email already registered.");
      }
      let roleid;
      if (userData.rolename != undefined){
        roleid = await db.safeQuery(`SELECT r.roleid FROM roles r WHERE (r.rolename = $1)`, [userData.rolename]).then((e) => e.data[0]);
      } else {
        roleid = null;
      }
      const userToSave = { 
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        gender: userData.gender,
        roleid: roleid,
        password: hashedPassword
      };
      const ans = await UserRepository.addUser(userToSave);
      return ans;
    } catch (err) {
      return Err("Error in UserService Create User");
    }
  }


  /**
   * Get list of users
   * @param limit Amount of users to get
   * @param offset Amount of users to offset
   * @param role Filter users by role
   * @param email Filter users by email
   * @param gender Filter users by gender
   */
  public async getUsers({ limit, offset, role, email, gender }: GetUsersQuery): Promise<Result<any[], string>> {
    let limitQuery = ""
    let filterQuerys = [];
    if (limit != undefined && limit > 0) {
      limitQuery = `LIMIT ${limit}`;
    }
    if (offset != undefined && offset > 0) {
      limitQuery += ` OFFSET ${offset};`;
    }
    if (role != undefined) {
      filterQuerys.push(`r.rolename = '${role}'`);
    }
    if (email != undefined) {
      filterQuerys.push(`u.email = '${email}'`);
    }
    if (gender != undefined) {
      filterQuerys.push(`u.gender = '${gender.toString()}'`);
    }
    let fullquery = `SELECT   
        u.userid AS id,  
        u.firstname,  
        u.lastname,  
        u.email,  
        u.gender,  
        u.passwordhash,
        r.rolename AS role,  
        ARRAY_AGG(p.permissionname) AS permissions  
    FROM   
        users u  
    LEFT JOIN   
        roles r ON u.roleid = r.roleid  
    LEFT JOIN   
        rolepermissions rp ON r.roleid = rp.roleid  
    LEFT JOIN   
        permissions p ON rp.permissionid = p.permissionid
    `;
    if (filterQuerys.length > 0) {
      fullquery += "WHERE (" + filterQuerys.join(" AND ") + ")"
    }
    fullquery +=`
    GROUP BY   
        u.userid, u.firstname, u.lastname, u.email, u.gender, r.rolename, u.passwordhash
    `;
    fullquery += limitQuery;
    fullquery += `;`;
    let ans;
    try {
      ans = await db.safeQuery(fullquery, []);
      if (isOk(ans)) return Ok(ans.data!);
      return Err("Problem at getting query.");
    } catch (err) {
      console.error(err);
      return Err(""+err);
    }
  }
}


export default new UserService();