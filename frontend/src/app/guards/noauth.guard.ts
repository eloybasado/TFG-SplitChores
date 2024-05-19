import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuariosService } from '../services/usuarios.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoauthGuard implements CanActivate {

  constructor( private usuariosService: UsuariosService,
                private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      return this.usuariosService.validarNoToken()
              .pipe(
                tap( resp => {
                  if (!resp) {
                    switch (this.usuariosService.rol) {
                      case 'ADMIN':
                        this.router.navigateByUrl('/admin/dashboard-admin');
                        break;
                      case 'USUARIO':
                        this.router.navigateByUrl('/usuario/inicio');
                        break;
                      case 'SUBORDINADO':
                        this.router.navigateByUrl('/usuario/inicio');
                        break;
                    }
                  }
                })
              );
  }
}
