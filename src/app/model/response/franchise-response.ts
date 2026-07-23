export interface FranchiseResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  logo: FileResponse;
}

export interface FileResponse {
  id: string;
  filename: string;
  url: string;
  urlThumb: string;
  type: string;
  extension: string;
  createdAt: string;
  updatedAt: string;
}