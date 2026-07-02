import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CategoryRepo } from '../../repositories/category.repo';
import { S3Service } from '../../common/service/s3/s3.service';
import { successfulResponse } from '../../common/utils/response/successResponse';
import { CategoryDocument } from '../../DB/models/category.model';
import { randomUUID } from 'crypto';
import { UserDocument } from '../../DB/models/user.model';
import { createCategoryDto } from './dto/Category.dto';
import { BrandRepo } from '../../repositories/brand.repo';
import { Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoryRepo,
    private readonly s3Service: S3Service,
    private readonly brandRepo: BrandRepo,
  ) {}
  async createCategory(
    body: createCategoryDto,
    file: Express.Multer.File,
    user: UserDocument,
  ) {
    const isExistingCategory = await this.categoryRepo.findOne({
      name: body.name,
    });
    if (isExistingCategory) {
      throw new BadRequestException('Category already exists');
    }
    const modifiedBrands = 
      [...new Set(body.brands || [])].map((id) =>
        Types.ObjectId.createFromHexString(id),
      )
    
    console.log(modifiedBrands);

    const existingBrands = await this.brandRepo.find({
      _id: { $in: modifiedBrands },
    });
    if (existingBrands.length !== modifiedBrands.length) {
      throw new BadRequestException('One or more brand IDs are invalid');
    }
    const url = await this.s3Service.uploadFile({
      file,
      key: randomUUID(),
      subFolder: body.name,
      baseFolder: 'Category',
    });
    if (!url) {
      throw new InternalServerErrorException('Failed to upload image');
    }

    let category: CategoryDocument;
    try {
      category = await this.categoryRepo.create({
        name: body.name,
        image: url,
        brands: modifiedBrands,

        createdBy: user._id,
      });
    } catch {
      await this.s3Service.deleteFile(url);
      throw new InternalServerErrorException('Failed to create Category');
    }

    return successfulResponse('Category created successfully', 201, {
      category,
    });
  }
}
