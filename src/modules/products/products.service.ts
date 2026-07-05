import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  createProductDto,
  DeleteQueryDto,
  updateProductDto,
} from './dto/product.dto';
import { UserDocument } from '../../DB/models/user.model';
import { ProductRepo } from '../../repositories/product.repo';
import { CategoryRepo } from '../../repositories/category.repo';
import { BrandRepo } from '../../repositories/brand.repo';
import { S3Service } from '../../common/service/s3/s3.service';
import { randomUUID } from 'crypto';
import { ProductDocument } from '../../DB/models/product.model';
import { successfulResponse } from '../../common/utils/response/successResponse';
import { Types } from 'mongoose';
import { QueryDto } from '../brands/dto/brands.dto';

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
        throw new NotFoundException('brand not found');
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

  async getProducts(query: QueryDto) {
    const products = await this.productRepo.paginate({
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
    return successfulResponse('products fetched successfully', 200, {
      products,
    });
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findById(
      Types.ObjectId.createFromHexString(id),
    );
    if (!product) throw new NotFoundException('product not found.');
    return successfulResponse('product retrieved successfully', 200, {
      product,
    });
  }

  async updateProduct(id: string, body: updateProductDto, user: UserDocument) {
    const updatedData: Record<string, any> = {};
    const mdId = Types.ObjectId.createFromHexString(id);
    if (!(await this.productRepo.findById(mdId)))
      throw new NotFoundException('product not found');
    if (body.price) updatedData.price = body.price;

    if (body.stock) updatedData.stock = body.stock;

    if (body.title) updatedData.title = body.title;

    if (body.discount) updatedData.discount = body.discount;

    if (body.description) updatedData.description = body.description;

    if (body.category) {
      const categoryId = Types.ObjectId.createFromHexString(body.category);
      const isExist = await this.categoryRepo.findById(categoryId);
      if (!isExist) throw new NotFoundException('category not found');
      updatedData.category = categoryId;
    }
    if (body.brand) {
      const brandId = Types.ObjectId.createFromHexString(body.brand);
      const isExist = await this.brandRepo.findById(brandId);
      if (!isExist) throw new NotFoundException('brand not found');
      updatedData.brand = brandId;
    }
    const updatedProduct = await this.productRepo.findOneAndUpdate(
      {
        _id: mdId,
      },
      { ...updatedData },
      { returnDocument: 'after' },
    );
    return successfulResponse('product images updated successfully', 200, {
      product: updatedProduct,
    });
  }

  async updateProductImages(
    id: string,
    files: {
      main_image?: Express.Multer.File[];
      sub_images?: Express.Multer.File[];
    },
  ) {
    if (!files.main_image && files.sub_images)
      throw new BadRequestException('please provide what you want to change');
    const product = await this.productRepo.findById(
      Types.ObjectId.createFromHexString(id),
    );

    if (!product) {
      throw new NotFoundException('product not found.');
    }
    let mainImage = product.mainImage;
    let images = product.images ?? [];
    const oldKeysToDelete: string[] = [];

    if (files.main_image?.[0]) {
      try {
        oldKeysToDelete.push(product.mainImage);
        mainImage = await this.s3.uploadFile({
          file: files.main_image![0],
          key: `${randomUUID()}`,
          subFolder: `${product.title}/main`,
          baseFolder: 'products',
        });
      } catch {
        throw new InternalServerErrorException(
          'failed to update product main_image',
        );
      }
    }

    if (files.sub_images?.length) {
      try {
        oldKeysToDelete.push(...(product.images ?? []));
        images = await this.s3.uploadFiles({
          files: files.sub_images as Express.Multer.File[],
          subFolder: `${product.title}/sub`,
          baseFolder: 'products',
        });
      } catch {
        throw new InternalServerErrorException(
          'failed to update product images',
        );
      }
    }
    const updatedProduct = await this.productRepo.updateOne(
      { _id: id },
      {
        mainImage,
        images,
      },
    );

    if (oldKeysToDelete.length) {
      await this.s3.deleteFiles(oldKeysToDelete);
    }

    return successfulResponse('product images updated successfully', 200, {
      product: updatedProduct,
    });
  }

  async deleteProduct(id: string, user: UserDocument, query: DeleteQueryDto) {
    if (query.method === 'hard') {
      const product = await this.productRepo.deleteOne({
        _id: Types.ObjectId.createFromHexString(id),
      });
      if (!product) throw new NotFoundException('Product Not Found');
      await this.s3.deleteFiles([product.mainImage, ...product.images]);
      return successfulResponse(
        'product has been deleted(hard) successfully',
        200,
        { product },
      );
    } else if (query.method === 'soft') {
      const product = await this.productRepo.softDeleteOne({
        _id: Types.ObjectId.createFromHexString(id),
      });
      return successfulResponse(
        'product has been deleted(hard) successfully',
        200,
        { product },
      );
    }
  }
}
