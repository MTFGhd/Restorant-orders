import jwt from 'jsonwebtoken';
import { UserRole } from 'shared-types';

/**
 * Middleware pour vérifier le jeton JWT
 */
export const verifierToken = (req, res, next) => {
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
    );
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
export const exigerRole = (...roles) => {
  return (req, res, next) => {
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
