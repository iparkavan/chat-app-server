// types.d.ts

declare global {
  namespace Express {
    interface Request {
      userId?: string | undefined; // Allow both string and DecodedIdToken types
    }
  }
}
