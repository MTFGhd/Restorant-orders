import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from 'shared-types';

declare global {
  namespace Express {
    interface Request {
      utilisateur?: JwtPayload;
    }
  }
}

export const verifierToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const enteteAuth = req.headers.authorization;

  if (!enteteAuth || !enteteAuth.startsWith('Bearer ')) {
    res.status(401).json({
      succes: false,
      message: 'Acces refuse. Jeton non fourni.',
    });
    return;
  }

  const jeton = enteteAuth.split(' ')[1];

  try {
    const decodage = jwt.verify(
      jeton,
      process.env.JWT_SECRET || 'default_secret'
    ) as JwtPayload;
    req.utilisateur = decodage;
    next();
  } catch (erreur) {
    res.status(401).json({
      succes: false,
      message: 'Jeton invalide ou expire.',
    });
  }
};

export const exigerRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.utilisateur) {
      res.status(401).json({
        succes: false,
        message: 'Authentification requise.',
      });
      return;
    }

    if (!roles.includes(req.utilisateur.role)) {
      res.status(403).json({
        succes: false,
        message: 'Acces interdit. Role insuffisant.',
      });
      return;
    }

    next();
  };
};
