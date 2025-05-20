// src/types/AuthTypes.ts
export interface DecodedToken {
    userId: number;
    clientCode: string;
    role: string;
    iat: number;
    exp: number;
  }
  