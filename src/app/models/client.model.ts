export enum ClientType {
  Individual = 0,
  Organization = 1
}

export interface Client {
  id: number;
  name: string;
  type: string; // Returned as string ("Individual" | "Organization") from GET APIs
  birthDate: string | null;
}

export interface CreateClientDto {
  name: string;
  type: number; // 0 = Individual, 1 = Organization
  birthDate: string | null;
}

export interface UpdateClientDto {
  id: number;
  name: string;
  type: number;
  birthDate: string | null;
}
