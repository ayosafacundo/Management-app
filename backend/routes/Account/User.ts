import { Request, Response } from "express";
// Database @types
import { GetUsersQuery } from "../../db/@types/querys.js";
import { Router } from "express";
import QueryParser from "../../Middleware/Parsers/QueryParser.js";
import { isOk, Option } from "rustic";
import UserServices from "../../Services/Account/UserServices.js";
import Validator from "../../Middleware/Validator.js";
import { User } from "../../db/@types/models/users.js";

const UserRouter = Router();

UserRouter.get('/v1/users', async (req: Request, res: Response) => {
  const queryable: Option<GetUsersQuery> = QueryParser.GetUsers(req.query);
  if (!queryable) {
    res.sendStatus(400)
  }
  const response = await UserServices.getUsers(queryable as GetUsersQuery);
  if (!isOk(response)){
    res.status(500).json(response.data);
  }
  res.json(response.data);
  return;
})

UserRouter.post('/v1/addusers', async (req:Request, res:Response) => {
  let ans;
  if (!Validator.User(req.body)) {
    res.sendStatus(400);  //  Failed to parse body.
    return;
  }
  let query: User = req.body;
  ans = await UserServices.createUser(query)
  if (!isOk(ans)){
    res.status(500).json(ans.data); // Unspecified error in the database.
  }else {
    res.sendStatus(200); // Success!
  }
  return;
})

UserRouter.put('/v1/updateUser', async (req: Request, res: Response) => {
  if (!Validator.User(req.body)) {
    res.status(400);
  }
})


export default UserRouter;