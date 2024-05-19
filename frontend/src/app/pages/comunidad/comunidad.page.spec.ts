import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComunidadPage } from './comunidad.page';

describe('ComunidadPage', () => {
  let component: ComunidadPage;
  let fixture: ComponentFixture<ComunidadPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ComunidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
