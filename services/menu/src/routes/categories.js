import { Router } from 'express';
import {
  obtenirCategories,
  obtenirCategorieParId,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
} from '../controllers/categoryController.js';
import { verifierToken, exigerRole } from '../middleware/auth.js';
import { UserRole } from 'shared-types';

const routeur = Router();

// Routes publiques (lecture)
routeur.get('/', obtenirCategories);
routeur.get('/:id', obtenirCategorieParId);

// Routes protégées (gérant uniquement)
routeur.post('/', verifierToken, exigerRole(UserRole.GERANT), creerCategorie);
routeur.put('/:id', verifierToken, exigerRole(UserRole.GERANT), modifierCategorie);
routeur.delete('/:id', verifierToken, exigerRole(UserRole.GERANT), supprimerCategorie);

export default routeur;
