import { InjectModel } from '@nestjs/mongoose';
import BaseRepository from './base.repo';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Category } from '../DB/models/category.model';

@Injectable()
export class CategoryRepo extends BaseRepository<Category> {
  constructor(@InjectModel(Category.name) protected categoryModel: Model<Category>) {
    super(categoryModel);
  }
}
