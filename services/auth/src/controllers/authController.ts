import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/User';
import { UserRole, JwtPayload, ReponseApi, ReponseAuth } from 'shared-types';

/**
 * Génère un jeton JWT pour un utilisateur
 */
const genererToken = (utilisateur: { _id: any; email: string; role: UserRole }): string => {
  const contenu: JwtPayload = {
    id: utilisateur._id.toString(),
    email: utilisateur.email,
    role: utilisateur.role,
  };

  return jwt.sign(contenu, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  } as jwt.SignOptions);
};

/**
 * POST /api/auth/inscription
 * Inscription d'un nouvel utilisateur
 */
export const inscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, email, motDePasse, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) {
      res.status(400).json({
        succes: false,
        message: 'Un utilisateur avec cet email existe déjà.',
      } as ReponseApi);
      return;
    }

    // Valider le rôle
    if (role && !Object.values(UserRole).includes(role)) {
      res.status(400).json({
        succes: false,
        message: `Rôle invalide. Rôles autorisés: ${Object.values(UserRole).join(', ')}`,
      } as ReponseApi);
      return;
    }

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      nom,
      email,
      motDePasse,
      role: role || UserRole.SERVEUR,
    });

    // Générer le jeton
    const jeton = genererToken({
      _id: utilisateur._id,
      email: utilisateur.email,
      role: utilisateur.role,
    });

    res.status(201).json({
      succes: true,
      message: 'Utilisateur créé avec succès.',
      donnees: {
        jeton,
        utilisateur: {
          id: utilisateur._id.toString(),
          nom: utilisateur.nom,
          email: utilisateur.email,
          role: utilisateur.role,
        },
      },
    } as ReponseApi<ReponseAuth>);
  } catch (erreur: any) {
    res.status(500).json({
      succes: false,
      message: erreur.message || 'Erreur lors de l\'inscription.',
    } as ReponseApi);
  }
};

/**
 * POST /api/auth/connexion
 * Connexion d'un utilisateur
 */
export const connexion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      res.status(400).json({
        succes: false,
        message: 'Email et mot de passe sont requis.',
      } as ReponseApi);
      return;
    }

    // Trouver l'utilisateur
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) {
      res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect.',
      } as ReponseApi);
      return;
    }

    // Vérifier le mot de passe
    const correspond = await utilisateur.comparerMotDePasse(motDePasse);
    if (!correspond) {
      res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect.',
      } as ReponseApi);
      return;
    }

    // Générer le jeton
    const jeton = genererToken({
      _id: utilisateur._id,
      email: utilisateur.email,
      role: utilisateur.role,
    });

    res.status(200).json({
      succes: true,
      message: 'Connexion réussie.',
      donnees: {
        jeton,
        utilisateur: {
          id: utilisateur._id.toString(),
          nom: utilisateur.nom,
          email: utilisateur.email,
          role: utilisateur.role,
        },
      },
    } as ReponseApi<ReponseAuth>);
  } catch (erreur: any) {
    res.status(500).json({
      succes: false,
      message: erreur.message || 'Erreur lors de la connexion.',
    } as ReponseApi);
  }
};

/**
 * GET /api/auth/profil
 * Obtenir le profil de l'utilisateur connecté
 */
export const obtenirProfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur?.id).select('-motDePasse');
    if (!utilisateur) {
      res.status(404).json({
        succes: false,
        message: 'Utilisateur non trouvé.',
      } as ReponseApi);
      return;
    }

    res.status(200).json({
      succes: true,
      donnees: {
        id: utilisateur._id.toString(),
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({
      succes: false,
      message: erreur.message || 'Erreur serveur.',
    } as ReponseApi);
  }
};
