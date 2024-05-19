import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import { UsuariosService } from '../services/usuarios.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private usuariosService: UsuariosService,
    private router: Router) {}

    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot) {
        return this.usuariosService.validarToken()
                .pipe(
                  tap( resp => {
                    // Si devuelve falso, el token no es bueno, salimos a login
                    if (!resp) {
                      this.router.navigateByUrl('/login');
                    } else {
                      // Si la ruta no es para el rol del token, reenviamos a ruta base de rol del token


                      if ((next.data['rol'] !== '*') && (next.data['rol']) && (!next.data['rol'].includes(this.usuariosService.rol))) {
                        switch (this.usuariosService.rol) {
                          case 'ADMIN':
                            this.router.navigateByUrl('/usuario/tareas');
                            break;
                          case 'USUARIO':
                            this.router.navigateByUrl('/usuario/inicio');
                            break;
                          case 'SUBORDINADO':

                            this.router.navigateByUrl('/usuario/inicio');
                            break;
                        }
                    }
                    }
                  })
                );
    }
  
  }