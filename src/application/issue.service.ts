// src/application/issue.service.ts
import { inject, injectable } from 'inversify';
import { IssueRepository } from '../domain/ports/issueRepository.port';
import { TYPES } from '../di/types';
import { ApiError } from '../utils/ApiError';

@injectable()
export class IssueService {
  constructor(
    @inject(TYPES.IssueRepository) private readonly repo: IssueRepository,
  ) {}

  async getIssueById(id: string) {
    const issue = await this.repo.findById(id);
    if (!issue) {
      throw new ApiError('ISSUE_NOT_FOUND', `Issue ${id} no encontrado.`, 404);
    }
    return issue;
  }
}