import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { IssueService } from '../../application/issue.service';
import { TYPES } from '../../di/types';
import { handleSuccess } from '../../utils/responseHandler';

@injectable()
export class IssueController {
  constructor(
    @inject(TYPES.IssueService) private readonly service: IssueService,
  ) {}

  async getById(req: Request, res: Response) {
    const issue = await this.service.getIssueById(req.params.id);
    handleSuccess(req, res, issue);
  }
}
