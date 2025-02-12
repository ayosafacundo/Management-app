import { Request, Response, Router } from "express";
import Validator from "../Middleware/Validator.js";



const Common = Router();


Common.post('/v1/login', (req: Request, res: Response) => {
  if (Validator.Email(req.body.email) && Validator.Password(req.body.password)) {
    
  }
  res.sendStatus(401);
})

