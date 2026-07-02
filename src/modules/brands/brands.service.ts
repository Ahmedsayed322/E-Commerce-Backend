import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { BrandRepo } from '../../repositories/brand.repo';
import { createBrandDto, QueryDto, updateBrandDto } from './dto/brands.dto';
import { successfulResponse } from '../../common/utils/response/successResponse';
import { S3Service } from '../../common/service/s3/s3.service';
import { BrandDocument } from '../../DB/models/brand.model';
import { randomUUID } from 'crypto';
import { type UserDocument } from '../../DB/models/user.model';
import { Types } from 'mongoose';

@Injectable()
export class BrandsService {
  constructor(
    private readonly brandRepo: BrandRepo,
    private readonly s3Service: S3Service,
  ) {}
  async createBrand(
    body: createBrandDto,
    file: Express.Multer.File,
    user: UserDocument,
  ) {
    const isExistingBrand = await this.brandRepo.findOne({ name: body.name });
    if (isExistingBrand) {
      throw new BadRequestException('Brand already exists');
    }
    console.log(file);

    const url = await this.s3Service.uploadFile({
      file,
      key: randomUUID(),
      subFolder: body.name,
      baseFolder: 'brands',
    });
    if (!url) {
      throw new InternalServerErrorException('Failed to upload logo');
    }

    let brand: BrandDocument;
    try {
      brand = await this.brandRepo.create({
        name: body.name,
        description: body.description,
        logo: url,
        createdBy: user._id,
      });
    } catch {
      await this.s3Service.deleteFile(url);
      throw new InternalServerErrorException('Failed to create brand');
    }

    return successfulResponse('Brand created successfully', 201, { brand });
  }
  async updateBrand(
    id: string,
    body: updateBrandDto,

    user: UserDocument,
  ) {
    const brand = await this.brandRepo.findOne({
      _id: Types.ObjectId.createFromHexString(id),
    });
    if (!brand) {
      throw new BadRequestException('Brand not found');
    }
    if (body?.name) {
      const isExistingBrand = await this.brandRepo.findOne({
        name: body?.name,
        _id: { $ne: Types.ObjectId.createFromHexString(id) },
      });
      if (isExistingBrand) {
        throw new BadRequestException('Brand already exists');
      }
    }
    const updatedBrand = await this.brandRepo.findOneAndUpdate(
      { _id: Types.ObjectId.createFromHexString(id) },
      { ...body, updatedBy: user._id },
      { new: true },
    );
    return successfulResponse('Brand updated successfully', 200, {
      brand: updatedBrand,
    });
  }
  async updateBrandLogo(
    id: string,
    file: Express.Multer.File,
    user: UserDocument,
  ) {
    const brand = await this.brandRepo.findOne({
      _id: Types.ObjectId.createFromHexString(id),
    });
    if (!brand) {
      throw new BadRequestException('Brand not found');
    }
    const urlFragments = brand.logo.split('/');
    console.log(brand.logo.split('/'));

    const url = await this.s3Service.uploadFile({
      file,
      key: urlFragments[urlFragments.length - 1].split('.')[0],
      subFolder: urlFragments[1],
      baseFolder: 'brands',
    });
    if (!url) {
      throw new InternalServerErrorException('Failed to upload logo');
    }
    const updatedBrand = await this.brandRepo.findOneAndUpdate(
      { _id: Types.ObjectId.createFromHexString(id) },
      { logo: url, updatedBy: user._id },
      { new: true },
    );
    return successfulResponse('Brand logo updated successfully', 200, {
      brand: updatedBrand,
    });
  }
  async getBrands(query: QueryDto) {
    const brands = await this.brandRepo.paginate({
      limit: query.limit,
      page: query.page,
      search: query.search
        ? {
            $or: [
              { name: { $regex: query.search, $options: 'i' } },
              { description: { $regex: query.search, $options: 'i' } },
            ],
          }
        : {},
    });
    return successfulResponse('Brands fetched successfully', 200, { brands });
  }
}
