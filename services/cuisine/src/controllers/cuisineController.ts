import { Request, Response } from 'express';
import CommandeCuisine from '../models/CuisineOrder';
import { ReponseApi, StatutCommande, StatutLigneCommande } from 'shared-types';

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

export const mettreAJourStatutLigne = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, ligneId } = req.params;
    const { statut } = req.body;
    if (!statut || !Object.values(StatutLigneCommande).includes(statut)) {
      res.status(400).json({
        succes: false,
        message: `Statut invalide. Valeurs: ${Object.values(StatutLigneCommande).join(', ')}`,
      } as ReponseApi);
      return;
    }
    const commande = await CommandeCuisine.findById(id);
    if (!commande) { res.status(404).json({ succes: false, message: 'Commande non trouvée.' } as ReponseApi); return; }
    const ligne = commande.lignes.find((a: any) => a._id.toString() === ligneId);
    if (!ligne) {
      res.status(404).json({ succes: false, message: 'Ligne de commande non trouvée.' } as ReponseApi);
      return;
    }
    ligne.statut = statut;
    const toutPret = commande.lignes.every((a) => a.statut === StatutLigneCommande.PRET);
    const certainsEnPrep = commande.lignes.some(
      (a) => a.statut === StatutLigneCommande.EN_PREPARATION || a.statut === StatutLigneCommande.PRET
    );
    if (toutPret) commande.statut = StatutCommande.PRET;
    else if (certainsEnPrep) commande.statut = StatutCommande.EN_PREPARATION;
    await commande.save();
    res.json({
      succes: true,
      message: `Statut du plat "${ligne.nom}" mis à jour: ${statut}`,
      donnees: commande,
    } as ReponseApi);
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
