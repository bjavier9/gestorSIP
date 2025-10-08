// src/infrastructure/persistence/firebaseIssueRepository.adapter.ts
import { injectable } from 'inversify';
import { IssueRepository } from '../../domain/ports/issueRepository.port';
import { Issue } from '../../domain/entities/issue';
import { db } from '../../config/firebase'; // Debe exportar una instancia de Firestore Admin

@injectable()
export class FirebaseIssueRepository implements IssueRepository {
  private readonly collection = db.collection('issues');

  async findById(id: string): Promise<Issue | null> {
    const snap = await this.collection.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...(snap.data() as Omit<Issue, 'id'>) };
  }
  
}
