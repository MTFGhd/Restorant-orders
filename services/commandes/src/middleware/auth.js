import jwt from 'jsonwebtoken';
import { UserRole } from 'shared-types';

export const verifierToken = (req, res, next) => {
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
    );
    req.utilisateur = decodage;
    next();
  } catch (erreur) {
    res.status(401).json({
      succes: false,
      message: 'Jeton invalide ou expire.',
    });
  }
};

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
        message: 'Acces interdit. Role insuffisant.',
      });
      return;
    }

    next();
  };
};
