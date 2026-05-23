import { Router } from 'express';
import { obtenirCommandes, obtenirCommandeParId, mettreAJourStatutArticle, mettreAJourStatutCommande, obtenirStatistiques } from '../controllers/cuisineController';
import { verifierToken, exigerRole } from '../middleware/auth';
import { UserRole } from 'shared-types';

const routeur = Router();
routeur.use(verifierToken);

routeur.get('/statistiques', obtenirStatistiques);
routeur.get('/commandes', obtenirCommandes);
routeur.get('/commandes/:id', obtenirCommandeParId);
routeur.patch('/commandes/:id/articles/:articleId', exigerRole(UserRole.CUISINIER, UserRole.GERANT), mettreAJourStatutArticle);
routeur.patch('/commandes/:id/statut', exigerRole(UserRole.CUISINIER, UserRole.GERANT), mettreAJourStatutCommande);

export default routeur;
