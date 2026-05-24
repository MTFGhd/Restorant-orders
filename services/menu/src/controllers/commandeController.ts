import { Request, Response } from 'express';
import Commande from '../models/Order';
import Plat from '../models/Dish';
import { publierDansFile } from '../config/rabbitmq';
import { ReponseApi, MessageCommande, StatutCommande, StatutLigneCommande } from 'shared-types';

/**
 * POST /api/commandes
 * Créer une commande pour une table (serveur/gérant)
 * Corps: { numeroTable, lignes: [{ platId, quantite, notes? }] }
 */
export const creerCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numeroTable, lignes } = req.body;

    if (!numeroTable || !lignes || !Array.isArray(lignes) || lignes.length === 0) {
      res.status(400).json({
        succes: false,
        message: 'Numéro de table et au moins un plat sont requis.',
      } as ReponseApi);
      return;
    }

    // Récupérer les détails des plats et vérifier la disponibilité
    const lignesCommande = [];
    let total = 0;

    for (const ligne of lignes) {
      const plat = await Plat.findById(ligne.platId);
      if (!plat) {
        res.status(404).json({
          succes: false,
          message: `Plat avec l'ID ${ligne.platId} non trouvé.`,
        } as ReponseApi);
        return;
      }

      if (!plat.disponible) {
        res.status(400).json({
          succes: false,
          message: `Le plat "${plat.nom}" n'est pas disponible actuellement.`,
        } as ReponseApi);
        return;
      }

      const sousTotal = plat.prix * (ligne.quantite || 1);
      total += sousTotal;

      lignesCommande.push({
        platId: plat._id as any,
        nom: plat.nom,
        prix: plat.prix,
        quantite: ligne.quantite || 1,
        statut: StatutLigneCommande.EN_ATTENTE,
        notes: ligne.notes || undefined,
      });
    }

    // Créer la commande
    const commande = await Commande.create({
      numeroTable,
      serveurId: req.utilisateur!.id,
      serveurNom: req.utilisateur!.email,
      lignes: lignesCommande,
      statut: StatutCommande.EN_ATTENTE,
      total,
    });

    // Publier la commande dans RabbitMQ pour la cuisine
    const messageCommande: MessageCommande = {
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
      message: 'Commande créée et transmise à la cuisine.',
      donnees: commande,
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * GET /api/commandes
 * Lister les commandes (avec filtre optionnel par statut et table)
 */
export const obtenirCommandes = async (req: Request, res: Response): Promise<void> => {
  try {
    const filtre: Record<string, any> = {};

    if (req.query.statut) {
      filtre.statut = req.query.statut;
    }
    if (req.query.table) {
      filtre.numeroTable = Number(req.query.table);
    }

    const commandes = await Commande.find(filtre).sort({ createdAt: -1 });
    res.json({ succes: true, donnees: commandes } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * GET /api/commandes/:id
 * Obtenir une commande par ID
 */
export const obtenirCommandeParId = async (req: Request, res: Response): Promise<void> => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvée.' } as ReponseApi);
      return;
    }
    res.json({ succes: true, donnees: commande } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * GET /api/commandes/:id/addition
 * Générer l'addition d'une commande
 */
export const obtenirAddition = async (req: Request, res: Response): Promise<void> => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvée.' } as ReponseApi);
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

    res.json({ succes: true, donnees: addition } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * PATCH /api/commandes/:id/statut
 * Mettre à jour le statut d'une commande
 */
export const mettreAJourStatutCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    const { statut } = req.body;

    if (!statut || !Object.values(StatutCommande).includes(statut)) {
      res.status(400).json({
        succes: false,
        message: `Statut invalide. Valeurs autorisées: ${Object.values(StatutCommande).join(', ')}`,
      } as ReponseApi);
      return;
    }

    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );

    if (!commande) {
      res.status(404).json({ succes: false, message: 'Commande non trouvée.' } as ReponseApi);
      return;
    }

    res.json({
      succes: true,
      message: 'Statut de la commande mis à jour.',
      donnees: commande,
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};
