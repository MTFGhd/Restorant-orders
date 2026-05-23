import { Router } from 'express';
import {
  obtenirPlats,
  obtenirPlatParId,
  creerPlat,
  modifierPlat,
  supprimerPlat,
} from '../controllers/menuController';
import { verifierToken, exigerRole } from '../middleware/auth';
import { UserRole } from 'shared-types';

const routeur = Router();

// Routes publiques (lecture)
routeur.get('/', obtenirPlats);
routeur.get('/:id', obtenirPlatParId);

// Routes protégées (gérant uniquement)
routeur.post('/', verifierToken, exigerRole(UserRole.GERANT), creerPlat);
routeur.put('/:id', verifierToken, exigerRole(UserRole.GERANT), modifierPlat);
routeur.delete('/:id', verifierToken, exigerRole(UserRole.GERANT), supprimerPlat);

export default routeur;
