import { NgModule } from '@angular/core';

import { LocalStorageProgressRepository, ProgressRepository } from './repositories/progress.repository';
import { AuthRepository } from './repositories/contracts/auth.repository';
import { UserRepository } from './repositories/contracts/user.repository';
import { LocalStorageAuthRepository } from './repositories/implementations/local-storage-auth.repository';
import { LocalStorageUserRepository } from './repositories/implementations/local-storage-user.repository';
import { LearningRepository } from './repositories/learning.repository';
import { LocalStorageLearningRepository } from './repositories/implementations/local-storage-learning.repository';

@NgModule({
  providers: [
    LocalStorageProgressRepository,
    { provide: ProgressRepository, useExisting: LocalStorageProgressRepository },
    { provide: UserRepository, useExisting: LocalStorageUserRepository },
    { provide: AuthRepository, useExisting: LocalStorageAuthRepository },
    { provide: LearningRepository, useExisting: LocalStorageLearningRepository }
  ]
})
export class CoreModule {}
