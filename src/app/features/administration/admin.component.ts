import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ActivityType, ContentStatus, ModuleRecord, ResourceType, TopicRecord } from '../../core/models/learning.model';
import { CreateUserInput, User, UserRole, UserStatus } from '../../core/models/user.model';
import { LearningRepository } from '../../core/repositories/learning.repository';
import { AuthService } from '../../services/auth.service';

type AdminSection = 'dashboard' | 'modules' | 'topics' | 'resources' | 'activities' | 'users';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AdminComponent implements OnInit {
  section: AdminSection = 'dashboard';
  modules: ModuleRecord[] = [];
  users: User[] = [];
  selectedModuleId = 1;
  selectedTopicId = 1;
  selectedModule: ModuleRecord | null = null;
  selectedTopic: TopicRecord | null = null;
  editingModuleId: number | null = null;
  editingTopicId: number | null = null;
  editingResourceId: string | null = null;
  editingActivityId: string | null = null;
  editingUserId: string | null = null;
  loading = false;
  error = '';
  success = '';

  readonly moduleForm = this.fb.group({
    name: ['', Validators.required], description: ['', Validators.required],
    breadcrumb: [''], image: ['assets/img/b3.png'], order: [1, Validators.required],
    status: ['ACTIVE' as ContentStatus]
  });
  readonly topicForm = this.fb.group({
    title: ['', Validators.required], description: ['', Validators.required],
    image: ['assets/img/tema1.png'], order: [1, Validators.required], status: ['ACTIVE' as ContentStatus]
  });
  readonly resourceForm = this.fb.group({
    title: ['', Validators.required], type: ['video' as ResourceType], url: ['', Validators.required], description: ['']
  });
  readonly activityForm = this.fb.group({
    title: ['', Validators.required], type: ['interactive' as ActivityType],
    description: ['', Validators.required], status: ['ACTIVE' as ContentStatus], configuration: ['{}']
  });
  readonly userForm = this.fb.group({
    name: ['', Validators.required], username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]], password: [''],
    role: ['STUDENT' as UserRole], status: ['ACTIVE' as UserStatus]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: UntypedFormBuilder,
    private readonly learning: LearningRepository,
    public readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.section = (data['section'] || 'dashboard') as AdminSection;
      this.loadData();
    });
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (this.section === 'modules' && id) this.editModule(id);
    });
  }

  get topicOptions(): TopicRecord[] { return this.selectedModule?.topics || []; }
  get resourceRows() { return this.selectedTopic?.resources || []; }
  get activityRows() { return this.selectedTopic?.activities || []; }
  get activeUsers(): number { return this.users.filter(user => user.status === 'ACTIVE').length; }
  get totalTopics(): number { return this.modules.reduce((total, module) => total + module.topics.length, 0); }
  get totalActivities(): number { return this.modules.reduce((total, module) => total + module.topics.reduce((sum, topic) => sum + topic.activities.length, 0), 0); }

  goTo(section: AdminSection): void {
    const paths: Record<AdminSection, string> = {
      dashboard: '/nuevo/admin', modules: '/nuevo/admin/modulos', topics: '/nuevo/admin/temas',
      resources: '/nuevo/admin/recursos', activities: '/nuevo/admin/actividades', users: '/nuevo/admin/usuarios'
    };
    this.router.navigateByUrl(paths[section]);
  }

  async selectModule(value: string | number): Promise<void> {
    this.selectedModuleId = Number(value);
    this.selectedModule = this.modules.find(module => module.id === this.selectedModuleId) || null;
    this.selectedTopicId = this.selectedModule?.topics[0]?.id || 0;
    this.selectedTopic = this.selectedModule?.topics.find(topic => topic.id === this.selectedTopicId) || null;
    if (this.section === 'modules') return;
    this.resetTopicDependentForms();
  }

  selectTopic(value: string | number): void {
    this.selectedTopicId = Number(value);
    this.selectedTopic = this.selectedModule?.topics.find(topic => topic.id === this.selectedTopicId) || null;
    this.resetTopicDependentForms();
  }

  newModule(): void {
    this.editingModuleId = null;
    this.moduleForm.reset({ name: '', description: '', breadcrumb: '', image: 'assets/img/b3.png', order: this.modules.length + 1, status: 'ACTIVE' });
  }

  editModule(id: number): void {
    const item = this.modules.find(module => module.id === id);
    if (!item) return;
    this.editingModuleId = id;
    this.moduleForm.patchValue(item);
  }

  async saveModule(): Promise<void> {
    if (this.moduleForm.invalid) return this.showError('Completa los campos obligatorios del módulo.');
    const data = this.moduleForm.getRawValue();
    this.loading = true;
    try {
      if (this.editingModuleId) await this.learning.update(this.editingModuleId, data);
      else await this.learning.create(data);
      this.newModule();
      await this.loadData();
      this.showSuccess('Módulo guardado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
    finally { this.loading = false; }
  }

  async deleteModule(id: number): Promise<void> {
    if (!confirm('¿Eliminar este módulo y sus temas, recursos y actividades?')) return;
    try {
      await this.learning.delete(id);
      if (this.selectedModuleId === id) this.selectedModuleId = 0;
      await this.loadData();
      this.showSuccess('Módulo eliminado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
  }

  newTopic(): void {
    this.editingTopicId = null;
    this.topicForm.reset({ title: '', description: '', image: 'assets/img/tema1.png', order: this.topicOptions.length + 1, status: 'ACTIVE' });
  }

  editTopic(topic: TopicRecord): void {
    this.editingTopicId = topic.id;
    this.topicForm.patchValue(topic);
  }

  async saveTopic(): Promise<void> {
    if (!this.selectedModule || this.topicForm.invalid) return this.showError('Selecciona un módulo y completa los campos del tema.');
    this.loading = true;
    try {
      const data = this.topicForm.getRawValue();
      if (this.editingTopicId) await this.learning.updateTopic(this.selectedModuleId, this.editingTopicId, data);
      else await this.learning.createTopic(this.selectedModuleId, data);
      this.newTopic();
      await this.loadData();
      this.showSuccess('Tema guardado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
    finally { this.loading = false; }
  }

  async deleteTopic(topic: TopicRecord): Promise<void> {
    if (!this.selectedModule || !confirm('¿Eliminar el tema y su contenido asociado?')) return;
    try {
      await this.learning.deleteTopic(this.selectedModuleId, topic.id);
      await this.loadData();
      this.showSuccess('Tema eliminado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
  }

  newResource(): void {
    this.editingResourceId = null;
    this.resourceForm.reset({ title: '', type: 'video', url: '', description: '' });
  }

  editResource(item: (typeof this.resourceRows)[number]): void {
    this.editingResourceId = item.id;
    this.resourceForm.patchValue(item);
  }

  async saveResource(): Promise<void> {
    if (!this.selectedTopic || this.resourceForm.invalid) return this.showError('Selecciona un tema y completa el recurso.');
    this.loading = true;
    try {
      const data = this.resourceForm.getRawValue();
      if (this.editingResourceId) await this.learning.updateResource(this.selectedModuleId, this.selectedTopicId, this.editingResourceId, data);
      else await this.learning.createResource(this.selectedModuleId, this.selectedTopicId, data);
      this.newResource();
      await this.loadData();
      this.showSuccess('Recurso guardado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
    finally { this.loading = false; }
  }

  async deleteResource(id: string): Promise<void> {
    if (!this.selectedTopic || !confirm('¿Eliminar este recurso?')) return;
    try {
      await this.learning.deleteResource(this.selectedModuleId, this.selectedTopicId, id);
      await this.loadData();
      this.showSuccess('Recurso eliminado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
  }

  newActivity(): void {
    this.editingActivityId = null;
    this.activityForm.reset({ title: '', type: 'interactive', description: '', status: 'ACTIVE', configuration: '{}' });
  }

  editActivity(item: (typeof this.activityRows)[number]): void {
    this.editingActivityId = item.id;
    this.activityForm.patchValue({ ...item, configuration: JSON.stringify(item.configuration, null, 2) });
  }

  async saveActivity(): Promise<void> {
    if (!this.selectedTopic || this.activityForm.invalid) return this.showError('Selecciona un tema y completa la actividad.');
    let configuration: Record<string, unknown>;
    try { configuration = JSON.parse(this.activityForm.value.configuration || '{}'); }
    catch { return this.showError('La configuración de la actividad debe ser JSON válido.'); }
    this.loading = true;
    try {
      const data = { ...this.activityForm.getRawValue(), configuration };
      if (this.editingActivityId) await this.learning.updateActivity(this.selectedModuleId, this.selectedTopicId, this.editingActivityId, data);
      else await this.learning.createActivity(this.selectedModuleId, this.selectedTopicId, data);
      this.newActivity();
      await this.loadData();
      this.showSuccess('Actividad guardada.');
    } catch (error) { this.showError(this.errorMessage(error)); }
    finally { this.loading = false; }
  }

  async deleteActivity(id: string): Promise<void> {
    if (!this.selectedTopic || !confirm('¿Eliminar esta actividad?')) return;
    try {
      await this.learning.deleteActivity(this.selectedModuleId, this.selectedTopicId, id);
      await this.loadData();
      this.showSuccess('Actividad eliminada.');
    } catch (error) { this.showError(this.errorMessage(error)); }
  }

  newUser(): void {
    this.editingUserId = null;
    this.userForm.reset({ name: '', username: '', email: '', password: '', role: 'STUDENT', status: 'ACTIVE' });
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.controls.password.updateValueAndValidity();
  }

  editUser(user: User): void {
    this.editingUserId = user.id;
    this.userForm.patchValue({ name: user.name, username: user.username, email: user.email, password: '', role: user.role, status: user.status });
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();
  }

  async saveUser(): Promise<void> {
    if (this.userForm.invalid) return this.showError('Completa los datos del usuario y verifica el correo.');
    this.loading = true;
    try {
      const value = this.userForm.getRawValue();
      if (this.editingUserId) {
        const { password, ...profile } = value;
        await this.auth.updateUser(this.editingUserId, { ...profile, ...(password ? { password } : {}) });
      } else {
        if (!value.password) return this.showError('La contraseña es obligatoria para crear una cuenta.');
        const input: CreateUserInput = { ...value, password: value.password };
        await this.auth.createUser(input);
      }
      this.newUser();
      await this.loadData();
      this.showSuccess('Usuario guardado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
    finally { this.loading = false; }
  }

  async toggleUserStatus(user: User): Promise<void> {
    try {
      await this.auth.changeUserStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      await this.loadData();
      this.showSuccess('Estado de la cuenta actualizado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
  }

  async changeRole(user: User, role: UserRole): Promise<void> {
    try {
      await this.auth.changeUserRole(user.id, role);
      await this.loadData();
      this.showSuccess('Rol actualizado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
  }

  async deleteUser(user: User): Promise<void> {
    if (!confirm('¿Eliminar la cuenta de ' + user.name + '?')) return;
    try {
      await this.auth.deleteUser(user.id);
      await this.loadData();
      this.showSuccess('Usuario eliminado.');
    } catch (error) { this.showError(this.errorMessage(error)); }
  }

  private async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [modules, users] = await Promise.all([this.learning.getAll(), this.auth.listUsers()]);
      this.modules = modules.sort((a, b) => a.order - b.order);
      this.users = users.sort((a, b) => a.name.localeCompare(b.name));
      if (!this.modules.some(module => module.id === this.selectedModuleId)) this.selectedModuleId = this.modules[0]?.id || 0;
      this.selectedModule = this.modules.find(module => module.id === this.selectedModuleId) || null;
      if (!this.selectedModule?.topics.some(topic => topic.id === this.selectedTopicId)) this.selectedTopicId = this.selectedModule?.topics[0]?.id || 0;
      this.selectedTopic = this.selectedModule?.topics.find(topic => topic.id === this.selectedTopicId) || null;
      const routeId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.section === 'modules' && routeId) this.editModule(routeId);
    } catch (error) { this.showError(this.errorMessage(error)); }
    finally { this.loading = false; }
  }

  private resetTopicDependentForms(): void {
    this.newTopic();
    this.newResource();
    this.newActivity();
  }

  private showError(message: string): void { this.error = message; this.success = ''; }
  private showSuccess(message: string): void { this.success = message; this.error = ''; }
  private errorMessage(error: unknown): string { return error instanceof Error ? error.message : 'Ocurrió un error. Intenta de nuevo.'; }
}
