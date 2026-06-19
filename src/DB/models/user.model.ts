import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { string } from 'zod';
import { GenderEnum } from '../../common/enum/gender.enum';
import { RoleEnum } from '../../common/enum/role.enum';
import { hash } from '../../common/utils/security/hash.service';
import { encrypt } from '../../common/utils/security/encrypt.service';

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  virtuals: true,
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;
  @Prop({ required: true, select: false })
  password: string;
  @Prop({ required: true, trim: true })
  firstName: string;
  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ type: String, required: true, trim: true })
  phone?: string;
  @Prop({
    enum: RoleEnum,
    default: RoleEnum.user,
  })
  role: string;
  @Prop({
    enum: GenderEnum,
    required: true,
  })
  gender: string;
  @Prop({ type: String })
  avatar?: string;
  @Prop({ type: Date })
  lastLoginAt?: Date;
  @Prop({
    type: [
      {
        title: String,
        country: String,
        city: String,
        street: String,
        building: String,
        postalCode: String,
        isDefault: Boolean,
      },
    ],
    default: [],
  })
  addresses: {
    title: string;
    country: string;
    city: string;
    street: string;
    building: string;
    postalCode: string;
    isDefault: boolean;
  }[];

  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name, 
    useFactory: () => {
      const schema = UserSchema;
      schema.pre('save', async function () {
        if (this.isModified('password')) {
          this.password = await hash(this.password);
        }
        if (this.isModified('phone')) {
          this.phone = await encrypt(this.phone!);
        }
      });
      schema.virtual('fullName').get(function () {
        return `${this.firstName} ${this.lastName}`;
      });
      return schema;
    },
  },
]);
