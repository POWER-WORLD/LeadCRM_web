declare module 'bcryptjs' {
  export function hash(s: string, salt: number | string): Promise<string>;
  export function hashSync(s: string, salt?: number | string): string;
  export function compare(s: string, hash: string): Promise<boolean>;
  export function compareSync(s: string, hash: string): boolean;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
}

declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    audience?: string | string[];
    issuer?: string;
    subject?: string;
    algorithm?: string;
  }
  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string | RegExp>;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
  }
  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string | Buffer, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string | Buffer, options?: VerifyOptions): any;
  export function decode(token: string, options?: any): any;
  export class JsonWebTokenError extends Error {}
  export class TokenExpiredError extends JsonWebTokenError {
    expiredAt: Date;
  }
}

