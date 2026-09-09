import { PreferenceMappingFieldModel } from './preference-mapping-field.model';

export interface PreferenceMapping {
    guid: string;
    profile: string;
    hepid: number;
    hep_alias: string;
    partid: number;
    version: number;
    retention: number;
    table_name: string;
    apply_ttl_all: boolean;
    partition_step: number;
    create_index: unknown;
    create_table: string;
    correlation_mapping: {
        uuid_field?: { profile?: string };
        [key: string]: unknown;
    }[];
    fields_mapping: PreferenceMappingFieldModel[];
    user_mapping?: PreferenceMappingFieldModel[];
    fields_settings: unknown;
    schema_mapping: unknown;
    schema_settings: unknown;
}
