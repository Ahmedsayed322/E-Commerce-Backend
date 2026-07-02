import { InjectModel } from '@nestjs/mongoose';
import BaseRepository from './base.repo';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Brand } from '../DB/models/brand.model';

@Injectable()
export class BrandRepo extends BaseRepository<Brand> {
  constructor(@InjectModel(Brand.name) protected brandModel: Model<Brand>) {
    super(brandModel);
  }
}
