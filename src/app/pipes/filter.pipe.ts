import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    pure: false,
    standalone: false
})

export class FilterPipe implements PipeTransform {
    transform<T extends { name: string }>(value: T[], filterBy: string): T[] {
        filterBy = filterBy ? filterBy.toLocaleLowerCase() : null;
        return filterBy ? value.filter((item: T) =>
            item.name.toLocaleLowerCase().indexOf(filterBy) !== -1) : value;
    }
}
