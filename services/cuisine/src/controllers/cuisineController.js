import CommandeCuisine from '../models/CuisineOrder.js';
import { StatutCommande, StatutLigneCommande } from 'shared-types';

export const obtenirCommandes = async (req, res) => {
  try {
    const filtre = {};
    if (req.query.statut) filtre.statut = req.query.statut;
    if (req.query.table) filtre.numeroTable = Number(req.query.table);
    const commandes = await CommandeCuisine.find(filtre).sort({ commandeRecueA: -1 });
    res.json({ succes: true, donnees: commandes });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const obtenirCommandeParId = async (req, res) => {
  try {
    const commande = await CommandeCuisine.findById(req.params.id);
    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvée.' });
      return;
    }
    res.json({ succes: true, donnees: commande });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const mettreAJourStatutLigne = async (req, res) => {
  try {
    const { id, ligneId } = req.params;
    const { statut } = req.body;
    if (!statut || !Object.values(StatutLigneCommande).includes(statut)) {
      res.status(400).json({
        succes: false,
        message: `Statut invalide. Valeurs: ${Object.values(StatutLigneCommande).join(', ')}`,
      });
      return;
    }
    const commande = await CommandeCuisine.findById(id);
    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvée.' });
      return;
    }
    const ligne = commande.lignes.find((a) => a._id.toString() === ligneId);
    if (!ligne) {
      res.status(404).json({ succes: false, message: 'Ligne de commande non trouvée.' });
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
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const mettreAJourStatutCommande = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!statut || !Object.values(StatutCommande).includes(statut)) {
      res.status(400).json({
        succes: false,
        message: `Statut invalide. Valeurs: ${Object.values(StatutCommande).join(', ')}`,
      });
      return;
    }
    const commande = await CommandeCuisine.findByIdAndUpdate(req.params.id, { statut }, { new: true });
    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvée.' });
      return;
    }
    res.json({ succes: true, message: `Statut mis à jour: ${statut}`, donnees: commande });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const obtenirStatistiques = async (_req, res) => {
  try {
    const [enAttente, enPreparation, pret, total] = await Promise.all([
      CommandeCuisine.countDocuments({ statut: StatutCommande.EN_ATTENTE }),
      CommandeCuisine.countDocuments({ statut: StatutCommande.EN_PREPARATION }),
      CommandeCuisine.countDocuments({ statut: StatutCommande.PRET }),
      CommandeCuisine.countDocuments(),
    ]);
    res.json({ succes: true, donnees: { enAttente, enPreparation, pret, total } });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};
