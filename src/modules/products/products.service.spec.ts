import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductRepo } from '../../repositories/product.repo';
import { CategoryRepo } from '../../repositories/category.repo';
import { BrandRepo } from '../../repositories/brand.repo';
import { S3Service } from '../../common/service/s3/s3.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: {
    findById: jest.Mock;
    updateOne: jest.Mock;
  };
  let s3Service: {
    uploadFile: jest.Mock;
    uploadFiles: jest.Mock;
    deleteFiles: jest.Mock;
  };

  beforeEach(async () => {
    productRepo = {
      findById: jest.fn(),
      updateOne: jest.fn(),
    };
    s3Service = {
      uploadFile: jest.fn(),
      uploadFiles: jest.fn(),
      deleteFiles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductRepo, useValue: productRepo },
        { provide: CategoryRepo, useValue: { findById: jest.fn() } },
        { provide: BrandRepo, useValue: { findById: jest.fn() } },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updates product images and removes old ones from storage', async () => {
    productRepo.findById.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      mainImage: 'old-main',
      images: ['old-sub-1', 'old-sub-2'],
    });
    s3Service.uploadFile.mockResolvedValue('new-main');
    s3Service.uploadFiles.mockResolvedValue(['new-sub-1', 'new-sub-2']);
    s3Service.deleteFiles.mockResolvedValue(undefined);
    productRepo.updateOne.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      mainImage: 'new-main',
      images: ['new-sub-1', 'new-sub-2'],
    });

    const result = await service.updateProductImages(
      '507f1f77bcf86cd799439011',
      {
        main_image: [{ originalname: 'main.jpg', buffer: Buffer.from('a') }],
        sub_images: [{ originalname: 'sub.jpg', buffer: Buffer.from('b') }],
      } as any,
    );

    expect(s3Service.deleteFiles).toHaveBeenCalledWith([
      'old-main',
      'old-sub-1',
      'old-sub-2',
    ]);
    expect(productRepo.updateOne).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      {
        mainImage: 'new-main',
        images: ['new-sub-1', 'new-sub-2'],
      },
    );
    expect(result.message).toBe('product images updated successfully');
  });
});
