export type RegistryItem = {
  type: string;
  name: string;
  title?: string;
  description?: string;
  files: RegistryFile[];
};

export interface RegistryFile {
  path: string;
  type: string;
  props?: PropInfo[];
}

export type PropInfo = {
  name: string;
  type: string;
  default: string;
  description?: string;
};
