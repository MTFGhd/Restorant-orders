import { Router } from 'express';
import { inscription, connexion, obtenirProfil } from '../controllers/authController';
import { verifierToken } from '../middleware/auth';

const routeur = Router();

// Routes publiques
routeur.post('/inscription', inscription);
routeur.post('/connexion', connexion);

// Routes protégées
routeur.get('/profil', verifierToken, obtenirProfil);

export default routeur;
