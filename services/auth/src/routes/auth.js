import { Router } from 'express';
import { inscription, connexion, obtenirProfil } from '../controllers/authController.js';
import { verifierToken } from '../middleware/auth.js';

const routeur = Router();

// Routes publiques
routeur.post('/inscription', inscription);
routeur.post('/connexion', connexion);

// Routes protégées
routeur.get('/profil', verifierToken, obtenirProfil);

export default routeur;
