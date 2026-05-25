import axios from 'axios';
import Commande from '../models/Order.js';
import { publierDansFile } from '../config/rabbitmq.js';
import { StatutCommande, StatutLigneCommande } from 'shared-types';

const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://menu-service:3002';

const chargerPlat = async (platId) => {
  const url = `${MENU_SERVICE_URL}/api/menu/${platId}`;

  try {
    const response = await axios.get(url, { timeout: 5000 });
    if (!response.data?.succes || !response.data.donnees) {
      throw new Error('Plat non trouve.');
    }
    return response.data.donnees;
  } catch (erreur) {
    if (axios.isAxiosError(erreur)) {
      const message =
        erreur.response?.data?.message ||
        'Erreur lors de la recuperation du plat.';
      const err = new Error(message);
      err.statusCode = erreur.response?.status || 502;
      throw err;
    }
    throw erreur;
  }
};

export const creerCommande = async (req, res) => {
  try {
    const { numeroTable, lignes } = req.body;

    if (!numeroTable || !lignes || !Array.isArray(lignes) || lignes.length === 0) {
      res.status(400).json({
        succes: false,
        message: 'Numero de table et au moins un plat sont requis.',
      });
      return;
    }

    const lignesCommande = [];
    let total = 0;

    for (const ligne of lignes) {
      let plat;
      try {
        plat = await chargerPlat(ligne.platId);
      } catch (erreur) {
        const statusCode = erreur?.statusCode || 500;
        res.status(statusCode).json({
          succes: false,
          message: erreur.message || 'Erreur lors de la validation du plat.',
        });
        return;
      }

      if (!plat.disponible) {
        res.status(400).json({
          succes: false,
          message: `Le plat "${plat.nom}" n'est pas disponible actuellement.`,
        });
        return;
      }

      const quantite = ligne.quantite || 1;
      const sousTotal = plat.prix * quantite;
      total += sousTotal;

      lignesCommande.push({
        platId: String(plat._id),
        nom: plat.nom,
        prix: plat.prix,
        quantite,
        statut: StatutLigneCommande.EN_ATTENTE,
        notes: ligne.notes || undefined,
      });
    }

    const commande = await Commande.create({
      numeroTable,
      serveurId: req.utilisateur.id,
      serveurNom: req.utilisateur.email,
      lignes: lignesCommande,
      statut: StatutCommande.EN_ATTENTE,
      total,
    });

    const messageCommande = {
      idCommande: commande._id.toString(),
      numeroTable: commande.numeroTable,
      serveurId: commande.serveurId,
      serveurNom: commande.serveurNom,
      lignes: lignesCommande.map((ligne) => ({
        ...ligne,
        platId: ligne.platId.toString(),
      })),
      total: commande.total,
      creeA: commande.createdAt.toISOString(),
    };

    await publierDansFile(messageCommande);

    res.status(201).json({
      succes: true,
      message: 'Commande creee et transmise a la cuisine.',
      donnees: commande,
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const obtenirCommandes = async (req, res) => {
  try {
    const filtre = {};

    if (req.query.statut) {
      filtre.statut = req.query.statut;
    }
    if (req.query.table) {
      filtre.numeroTable = Number(req.query.table);
    }

    const commandes = await Commande.find(filtre).sort({ createdAt: -1 });
    res.json({ succes: true, donnees: commandes });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const obtenirCommandeParId = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvee.' });
      return;
    }
    res.json({ succes: true, donnees: commande });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const obtenirAddition = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvee.' });
      return;
    }

    const addition = {
      numeroCommande: commande._id.toString(),
      numeroTable: commande.numeroTable,
      serveur: commande.serveurNom,
      date: commande.createdAt,
      lignes: commande.lignes.map((ligne) => ({
        nom: ligne.nom,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prix,
        sousTotal: ligne.prix * ligne.quantite,
      })),
      total: commande.total,
      statut: commande.statut,
    };

    res.json({ succes: true, donnees: addition });
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
        message: `Statut invalide. Valeurs autorisees: ${Object.values(StatutCommande).join(', ')}`,
      });
      return;
    }

    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );

    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvee.' });
      return;
    }

    res.json({
      succes: true,
      message: 'Statut de la commande mis a jour.',
      donnees: commande,
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};
