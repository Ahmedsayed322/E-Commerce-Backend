import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { CategoryRepo } from '../../repositories/category.repo';
import { S3Service } from '../../common/service/s3/s3.service';
import { successfulResponse } from '../../common/utils/response/successResponse';
import { CategoryDocument } from '../../DB/models/category.model';
import { randomUUID } from 'crypto';
import { UserDocument } from '../../DB/models/user.model';
import { createCategoryDto, updateCategoryDto } from './dto/Category.dto';
import { BrandRepo } from '../../repositories/brand.repo';
import { Types } from 'mongoose';
import { DeleteQueryDto } from '../products/dto/product.dto';

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
    const modifiedBrands = [...new Set(body.brands || [])].map((id) =>
      Types.ObjectId.createFromHexString(id),
    );

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

  async getCategories(query: any) {
    const Categories = await this.categoryRepo.paginate({
      limit: query.limit,
      page: query.page,
      search: query.search
        ? {
            $or: [
              { name: { $regex: query.search, $options: 'i' } },
              {
                description: {
                  $regex: query.search,
                  $options: 'i',
                },
              },
            ],
          }
        : {},
    });
    return successfulResponse('Categories fetched successfully', 200, {
      Categories,
    });
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepo.findById(
      Types.ObjectId.createFromHexString(id),
    );
    if (!category) throw new NotFoundException('category not found.');
    return successfulResponse('category retrieved successfully', 200, {
      category,
    });
  }
  async updateCategoryImage(
    id: string,
    user: UserDocument,
    image: Express.Multer.File,
  ) {
    try {
      const mdId = Types.ObjectId.createFromHexString(id);
      const category = await this.categoryRepo.findById(mdId);
      if (!category) throw new NotFoundException('category not found');
      const oldKey = category.image;
      const [base, sub] = category.image.split('/');
      const url = await this.s3Service.uploadFile({
        file: image,
        baseFolder: base,
        subFolder: sub,
        key: randomUUID(),
      });

      const updatedCategory = await this.categoryRepo.findOneAndUpdate(
        { _id: mdId },
        { image: url },
        { new: true },
      );
      await this.s3Service.deleteFile(oldKey);
      return successfulResponse('category updated successfully', 200, {
        brand: updatedCategory,
      });
    } catch {
      throw new InternalServerErrorException('error occurred ');
    }
  }

  async updateCategory(
    id: string,
    body: updateCategoryDto,
    user: UserDocument,
  ) {
   
    const categoryId = Types.ObjectId.createFromHexString(id);

    const category = await this.categoryRepo.findOne({ _id: categoryId });
    if (!category) {
      throw new BadRequestException('category not found');
    }

    if (body?.name) {
      const isExistingCategory = await this.categoryRepo.findOne({
        name: body.name,
        _id: { $ne: categoryId },
      });
      if (isExistingCategory) {
        throw new BadRequestException('category already exists');
      }
    }

    let brands: Types.ObjectId[] | undefined;

    if (body.brands) {
      const uniqueBrandStrings = [...new Set(body.brands)];
      const newBrands = uniqueBrandStrings.map((bId) =>
        Types.ObjectId.createFromHexString(bId),
      );

      const currentBrandStrings = new Set(
        (category.brands || []).map((b) => b.toString()),
      );
      const newBrandStrings = new Set(newBrands.map((b) => b.toString()));

      const isSame =
        currentBrandStrings.size === newBrandStrings.size &&
        [...currentBrandStrings].every((b) => newBrandStrings.has(b));

      if (isSame) {
        throw new BadRequestException(
          "you don't make any updates to brand list",
        );
      }
      if (newBrands.length) {
        const existingBrands = await this.brandRepo.find({
          _id: { $in: newBrands },
        });
        if (existingBrands.length !== newBrands.length) {
          throw new BadRequestException('One or more brand IDs are invalid');
        }
      }
      brands = newBrands;
    }
    const updateData: Record<string, any> = { updatedBy: user._id };
    if (body?.name) updateData.name = body.name;
    if (brands?.length) updateData.brands = brands;
    const updatedCategory = await this.categoryRepo.findOneAndUpdate(
      { _id: categoryId },
      updateData,
      { new: true },
    );
    return successfulResponse('category updated successfully', 200, {
      brand: updatedCategory,
    });
  }

  async deleteCategory(id: string, user: UserDocument, query: DeleteQueryDto) {
    if (query.method === 'hard') {
      const category = await this.categoryRepo.deleteOne({
        _id: Types.ObjectId.createFromHexString(id),
      });
      if (!category) throw new NotFoundException('Category Not Found');
      await this.s3Service.deleteFile(category.image);
      return successfulResponse(
        'category has been deleted(hard) successfully',
        200,
        { category },
      );
    } else if (query.method === 'soft') {
      const category = await this.categoryRepo.softDeleteOne({
        _id: Types.ObjectId.createFromHexString(id),
      });
      if (!category) throw new NotFoundException('Category Not Found');
      return successfulResponse(
        'category has been deleted(soft)  successfully',
        200,
        { category },
      );
    }
  }
}
