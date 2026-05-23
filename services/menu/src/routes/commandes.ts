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

// Toutes les routes de commandes nécessitent une authentification
routeur.use(verifierToken);

// Créer une commande (serveur ou gérant)
routeur.post('/', exigerRole(UserRole.SERVEUR, UserRole.GERANT), creerCommande);

// Lister les commandes
routeur.get('/', obtenirCommandes);

// Obtenir une commande par ID
routeur.get('/:id', obtenirCommandeParId);

// Générer l'addition
routeur.get('/:id/addition', obtenirAddition);

// Mettre à jour le statut d'une commande
routeur.patch('/:id/statut', mettreAJourStatutCommande);

export default routeur;
