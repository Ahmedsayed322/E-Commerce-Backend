import { Body, Controller, Get, Next, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { type NextFunction, type Response, type Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/uploads/*path')
  async getUploads(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    await this.appService.previewUpload(req, res, next);
  }
}
