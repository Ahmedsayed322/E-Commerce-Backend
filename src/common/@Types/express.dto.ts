import { UserDocument } from '../../DB/models/user.model';
import { TokenPayload } from '../service/token/token.service';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      decoded: TokenPayload;
    }
  }
}
