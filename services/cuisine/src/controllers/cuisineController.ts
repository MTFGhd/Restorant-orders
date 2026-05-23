import { Request, Response } from 'express';
import CommandeCuisine from '../models/CuisineOrder';
import { ReponseApi, StatutCommande, StatutArticle } from 'shared-types';

export const obtenirCommandes = async (req: Request, res: Response): Promise<void> => {
  try {
    const filtre: Record<string, any> = {};
    if (req.query.statut) filtre.statut = req.query.statut;
    if (req.query.table) filtre.numeroTable = Number(req.query.table);
    const commandes = await CommandeCuisine.find(filtre).sort({ commandeRecueA: -1 });
    res.json({ succes: true, donnees: commandes } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

export const obtenirCommandeParId = async (req: Request, res: Response): Promise<void> => {
  try {
    const commande = await CommandeCuisine.findById(req.params.id);
    if (!commande) { res.status(404).json({ succes: false, message: 'Commande non trouvée.' } as ReponseApi); return; }
    res.json({ succes: true, donnees: commande } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

export const mettreAJourStatutArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, articleId } = req.params;
    const { statut } = req.body;
    if (!statut || !Object.values(StatutArticle).includes(statut)) {
      res.status(400).json({ succes: false, message: `Statut invalide. Valeurs: ${Object.values(StatutArticle).join(', ')}` } as ReponseApi);
      return;
    }
    const commande = await CommandeCuisine.findById(id);
    if (!commande) { res.status(404).json({ succes: false, message: 'Commande non trouvée.' } as ReponseApi); return; }
    const article = commande.articles.find((a: any) => a._id.toString() === articleId);
    if (!article) { res.status(404).json({ succes: false, message: 'Plat non trouvé dans la commande.' } as ReponseApi); return; }
    article.statut = statut;
    const toutPret = commande.articles.every((a) => a.statut === StatutArticle.PRET);
    const certainsEnPrep = commande.articles.some((a) => a.statut === StatutArticle.EN_PREPARATION || a.statut === StatutArticle.PRET);
    if (toutPret) commande.statut = StatutCommande.PRET;
    else if (certainsEnPrep) commande.statut = StatutCommande.EN_PREPARATION;
    await commande.save();
    res.json({ succes: true, message: `Statut du plat "${article.nom}" mis à jour: ${statut}`, donnees: commande } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

export const mettreAJourStatutCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    const { statut } = req.body;
    if (!statut || !Object.values(StatutCommande).includes(statut)) {
      res.status(400).json({ succes: false, message: `Statut invalide. Valeurs: ${Object.values(StatutCommande).join(', ')}` } as ReponseApi);
      return;
    }
    const commande = await CommandeCuisine.findByIdAndUpdate(req.params.id, { statut }, { new: true });
    if (!commande) { res.status(404).json({ succes: false, message: 'Commande non trouvée.' } as ReponseApi); return; }
    res.json({ succes: true, message: `Statut mis à jour: ${statut}`, donnees: commande } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

export const obtenirStatistiques = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [enAttente, enPreparation, pret, total] = await Promise.all([
      CommandeCuisine.countDocuments({ statut: StatutCommande.EN_ATTENTE }),
      CommandeCuisine.countDocuments({ statut: StatutCommande.EN_PREPARATION }),
      CommandeCuisine.countDocuments({ statut: StatutCommande.PRET }),
      CommandeCuisine.countDocuments(),
    ]);
    res.json({ succes: true, donnees: { enAttente, enPreparation, pret, total } } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};
