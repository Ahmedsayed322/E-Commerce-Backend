import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { User } from '../../common/decorators/user.decorator';
import { Brand } from './brand.model';

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  virtuals: true,
})
export class Category {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  name: string;
  @Prop({
    unique: true,
    lowercase: true,
    trim: true,
    default: function (this: Category) {
      return slugify(this.name, {
        replacement: '_',
        lower: true,
        strict: true,
      });
    },
  })
  slug: string;
  @Prop({ type: String, required: true })
  image: string;

  @Prop([{ type: Types.ObjectId, ref: Brand.name }])
  brands: Types.ObjectId[];
  @Prop({
    createdBy: { type: Types.ObjectId, ref: User.name, required: true },
  })
  createdBy: Types.ObjectId;
  @Prop({
    updatedBy: { type: Types.ObjectId, ref: User.name, required: true },
  })
  updatedBy: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
export type CategoryDocument = HydratedDocument<Category>;
export const CategoryModel = MongooseModule.forFeatureAsync([
  {
    name: Category.name,
    useFactory: () => {
      const schema = CategorySchema;
      schema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
        const update = this.getUpdate() as UpdateQuery<Category>;
        if (update?.name) {
          update.slug = slugify(update.name, {
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
