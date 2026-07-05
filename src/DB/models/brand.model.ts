import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { User } from '../../common/decorators/user.decorator';

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  virtuals: true,
})
export class Brand {
  @Prop({
    type: Date,
    required: false,
  })
  deletedAt: Date;
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
    default: function (this: Brand) {
      return slugify(this.name, {
        replacement: '_',
        lower: true,
        strict: true,
      });
    },
  })
  slug: string;
  @Prop({ type: String, required: true })
  logo: string;
  @Prop({
    maxLength: 500,
  })
  description?: string;

  @Prop({
    default: true,
  })
  isActive: boolean;
  @Prop({
    createdBy: { type: Types.ObjectId, ref: User.name, required: true },
  })
  createdBy: Types.ObjectId;
  @Prop({
    updatedBy: { type: Types.ObjectId, ref: User.name, required: true },
  })
  updatedBy: Types.ObjectId;
}

export const brandSchema = SchemaFactory.createForClass(Brand);
export type BrandDocument = HydratedDocument<Brand>;
export const BrandModel = MongooseModule.forFeatureAsync([
  {
    name: Brand.name,
    useFactory: () => {
      const schema = brandSchema;
      schema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
        const update = this.getUpdate() as UpdateQuery<Brand>;
        if (update?.name) {
          update.slug = slugify(update.name, {
            replacement: '_',
            lower: true,
            strict: true,
          });
        }
      });
      schema.pre(['find', 'findOne', 'countDocuments'], function () {
        const query = this.getQuery();
        if (query.paranoid !== true) {
          delete query.paranoid;
          this.setQuery({
            ...query,
            deletedAt: { $exists: false },
          });
        } else {
          delete query.paranoid;
          this.setQuery(query);
        }
      });
      return schema;
    },
  },
]);
