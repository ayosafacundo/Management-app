import { Validate } from "react-hook-form";
import { Gender, User } from "../db/@types/models/users.js";
import { ROLES } from "../server.js";


/*
Validation Class.
Regexs holds regex for every occasion. Use the one that you need.
  - names: between 1 and 20 characters, lowercase, uppercase or numbers allowed.
  - email: any amount of words or dots, with a @ and then any amount of words or dots, followed by a dot and between 2 to 4 characters. 
  - password: Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character

*/

class Validator {

  constructor () {};
  private Regexs = {
    names: new RegExp(/^([a-z]|[A-Z]|[0-9]){1,20}/),
    email: new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    password: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  }
  /**
   * Validates input.
   * @param str String to validate.
   * @param regex Regex to validate with.
   * @returns true if input is valid, false otherwise
   */
  private input(str: string, regex: RegExp): boolean {
    return regex.test(str);
  }

  public Email(email:string): Boolean {
    if (!this.input(email, this.Regexs.email)) return false;
    return true;
  }

  public Password(password:string): Boolean {
    if (!this.input(password, this.Regexs.password)) return false;
    return true;
  }

  public Name(name:string): Boolean {
    if (!this.input(name, this.Regexs.names)) return false;
    return true;
  }

  public Role(role:string | null): Boolean {
    if (ROLES?.includes(role) || role != null) return false;
    return true;
  }

  public Gender(gender:string): Boolean {
    if (!(Gender[gender as keyof typeof Gender] != undefined)) return false;
    return true;
  }

  public User({firstname, lastname, gender, email, rolename, password}: User): Boolean {
    if (this.Name(firstname) &&
        this.Name(lastname) &&
        this.Gender(gender) &&
        this.Email(email) &&
        this.Role(rolename ? rolename : null) &&
        this.Password(password)) return true;
    return false;
  }
}

export default new Validator();