
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  path: string;
}

export interface ScaffoldingContext {
  projectName: string;
  description: string;
  useRedis: boolean;
  usePostgres: boolean;
  automationType: string;
}
