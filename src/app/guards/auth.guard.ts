import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '@app/services';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
    private router = inject(Router);
    private authenticationService = inject(AuthenticationService);


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser) {
            return true;
        }

        this.router.navigate([{
            outlets: { primary: null, system: 'login'}
        }], {
            queryParams: {
                returnUrl: state.url
            }
        });
        return false;
    }
}