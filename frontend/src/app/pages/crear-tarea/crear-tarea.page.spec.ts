import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearTareaPage } from './crear-tarea.page';

describe('CrearTareaPage', () => {
  let component: CrearTareaPage;
  let fixture: ComponentFixture<CrearTareaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CrearTareaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
