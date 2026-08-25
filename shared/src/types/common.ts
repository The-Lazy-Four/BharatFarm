export type DataStatus = 'LIVE' | 'CACHED' | 'OFFLINE' | 'MOCK';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
