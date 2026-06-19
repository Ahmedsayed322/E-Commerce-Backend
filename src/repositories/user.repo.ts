import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from '../DB/models/user.model';
import BaseRepository from './base.repo';
import { Model, model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepo extends BaseRepository<User> {
  constructor(@InjectModel(User.name) protected userModel: Model<User>) {
    super(userModel);
  }
}
