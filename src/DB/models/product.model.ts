import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import { Brand } from './brand.model';
import slugify from 'slugify';
import { Category } from './category.model';

@Schema({ timestamps: true })
export class Product {
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200,
  })
  title: string;

  @Prop({
    unique: true,
    lowercase: true,
    trim: true,
    default: function (this: Product) {
      return slugify(this.title, {
        replacement: '_',
        lower: true,
        strict: true,
      });
    },
  })
  slug: string;

  @Prop({
    maxlength: 2000,
  })
  description?: string;

  @Prop({
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    default: 0,
    min: 0,
  })
  discount: number;

  @Prop({
    required: true,
    min: 0,
  })
  stock: number;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: Types.ObjectId;

  // @Prop({
  //   type: [Types.ObjectId],
  //   ref: 'SubCategory',
  //   default: [],
  // })
  // subCategories: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId,
    ref: Brand.name,
  })
  brand: Types.ObjectId;
  @Prop({
    type: String,
    required: true,
  })
  mainImage: String;
  @Prop({
    type: [String],
    default: [],
  })
  images: String[];

  @Prop({
    default: 0,
  })
  sold: number;

  @Prop({
    default: 0,
  })
  ratingAverage: number;

  @Prop({
    default: 0,
  })
  ratingCount: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = HydratedDocument<Product>;
export const ProductModel = MongooseModule.forFeatureAsync([
  {
    name: Product.name,
    useFactory: () => {
      const schema = ProductSchema;
      schema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
        const update = this.getUpdate() as UpdateQuery<Product>;
        if (update?.title) {
          update.slug = slugify(update.title, {
            replacement: '_',
            lower: true,
            strict: true,
          });
        }
      });
      return schema;
    },
  },
]);
