import { db } from "../../server.js";



class RoleServices {

  public async getRoles() {
    return db.safeQuery('SELECT r.rolename FROM roles r',[]);
  }
}

export default new RoleServices();