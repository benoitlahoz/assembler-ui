export type RegistryItemType =
  | 'registry:ui'
  | 'registry:block'
  | 'registry:hook'
  | 'registry:lib'
  | 'registry:component'
  | 'registry:page'
  | 'registry:file';

export type RegistryItem = {
  type: RegistryItemType;
  name: string;
  author?: string;
  title?: string;
  category?: string;
  description?: string;
  files: RegistryFile[];
};

export interface RegistryFile {
  path: string;
  type: string;
  author?: string;
  props?: PropInfo[];
}

export type PropInfo = {
  name: string;
  type: string;
  default: string;
  description?: string;
};
