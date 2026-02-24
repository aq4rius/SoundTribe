/**
 * Genre types — mirrors server/src/models/Genre.ts
 */

export interface IGenre {
  _id: string;
  name: string;
  description?: string;
}
