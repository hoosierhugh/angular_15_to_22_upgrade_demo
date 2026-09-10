import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const nameRe = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
        const valid = nameRe.test(control.value);
        return !valid ? {'forbiddenName': {value: control.value}} : null;
    };
}
