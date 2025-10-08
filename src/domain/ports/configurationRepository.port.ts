
import { Configuration } from '../entities/configuration';

export interface ConfigurationRepository {
    findAll(): Promise<Configuration[]>;
    findById(id: string): Promise<Configuration | null>;
    create(configuration: Configuration): Promise<Configuration>;
    update(id: string, configuration: Partial<Configuration>): Promise<Configuration | null>;
}
