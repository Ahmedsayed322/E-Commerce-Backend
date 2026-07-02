import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createProductDto } from './dto/product.dto';
import { UserDocument } from '../../DB/models/user.model';
import { ProductRepo } from '../../repositories/product.repo';
import { CategoryRepo } from '../../repositories/category.repo';
import { BrandRepo } from '../../repositories/brand.repo';
import { S3Service } from '../../common/service/s3/s3.service';
import { file } from 'zod';
import { randomUUID } from 'crypto';
import { ProductDocument } from '../../DB/models/product.model';
import { successfulResponse } from '../../common/utils/response/successResponse';
import { Types } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepo,
    private readonly categoryRepo: CategoryRepo,
    private readonly brandRepo: BrandRepo,
    private readonly s3: S3Service,
  ) {}
  async createProduct(
    body: createProductDto,
    user: UserDocument,
    files: {
      main_image: Express.Multer.File[];
      sub_images: Express.Multer.File[];
    },
  ) {
    const { title, brand, category, discount, price, stock, description } =
      body;
    const isExist = await this.productRepo.findOne({
      title,
    });
    if (isExist) throw new ConflictException('product already exist');
    if (
      !(await this.categoryRepo.findById(
        Types.ObjectId.createFromHexString(category),
      ))
    ) {
      throw new NotFoundException('category not found');
    }
    if (brand) {
      if (
        !(await this.brandRepo.findById(
          Types.ObjectId.createFromHexString(brand),
        ))
      ) {
        throw new NotFoundException('category not found');
      }
    }
    const [main, sub] = await Promise.all([
      this.s3.uploadFile({
        file: files.main_image[0],
        key: `${randomUUID()}`,
        subFolder: `${title}/main`,
        baseFolder: 'products',
      }),
      this.s3.uploadFiles({
        files: files.sub_images as Express.Multer.File[],
        subFolder: `${title}/sub`,
        baseFolder: 'products',
      }),
    ]);
    let product: ProductDocument;
    try {
      product = await this.productRepo.create({
        title,
        brand: brand ? Types.ObjectId.createFromHexString(brand) : undefined,
        stock,
        category: Types.ObjectId.createFromHexString(category),
        description,
        discount,
        images: sub,
        mainImage: main,
        price,
      });
    } catch (e) {
      await this.s3.deleteFiles([...sub, main]);
      console.log(e);

      throw new InternalServerErrorException('failed to create a product');
    }
    return successfulResponse('product has been created', 201, { product });
  }
}
