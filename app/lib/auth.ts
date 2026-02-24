import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: number;
  role: string;
}

export function createToken(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

export function verifyToken(bearerToken: string): JwtPayload {
  if (!bearerToken.startsWith("Bearer ")) {
    throw new Error("Invalid token format");
  }

  const token = bearerToken.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}