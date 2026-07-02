import { InjectModel } from '@nestjs/mongoose';
import BaseRepository from './base.repo';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Product } from '../DB/models/product.model';

@Injectable()
export class ProductRepo extends BaseRepository<Product> {
  constructor(
    @InjectModel(Product.name) protected productModel: Model<Product>,
  ) {
    super(productModel);
  }
}
