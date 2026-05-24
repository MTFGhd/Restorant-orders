import { Router } from 'express';
import {
  creerCommande,
  obtenirCommandes,
  obtenirCommandeParId,
  obtenirAddition,
  mettreAJourStatutCommande,
} from '../controllers/commandeController';
import { verifierToken, exigerRole } from '../middleware/auth';
import { UserRole } from 'shared-types';

const routeur = Router();

routeur.use(verifierToken);

routeur.post('/', exigerRole(UserRole.SERVEUR, UserRole.GERANT), creerCommande);
routeur.get('/', obtenirCommandes);
routeur.get('/:id', obtenirCommandeParId);
routeur.get('/:id/addition', obtenirAddition);
routeur.patch('/:id/statut', mettreAJourStatutCommande);

export default routeur;
