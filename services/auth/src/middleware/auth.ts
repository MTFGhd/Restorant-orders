import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from 'shared-types';

// Étend l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      utilisateur?: JwtPayload;
    }
  }
}

/**
 * Middleware pour vérifier le jeton JWT
 */
export const verifierToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const enteteAuth = req.headers.authorization;

  if (!enteteAuth || !enteteAuth.startsWith('Bearer ')) {
    res.status(401).json({
      succes: false,
      message: 'Accès refusé. Jeton non fourni.',
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
      message: 'Jeton invalide ou expiré.',
    });
  }
};

/**
 * Middleware pour vérifier le rôle de l'utilisateur
 */
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
        message: 'Accès interdit. Rôle insuffisant.',
      });
      return;
    }

    next();
  };
};
