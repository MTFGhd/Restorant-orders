import { Request, Response } from 'express';
import Plat from '../models/Dish';
import { ReponseApi } from 'shared-types';

/**
 * GET /api/menu
 * Lister tous les plats (avec filtre optionnel par catégorie et disponibilité)
 */
export const obtenirPlats = async (req: Request, res: Response): Promise<void> => {
  try {
    const filtre: Record<string, any> = {};

    if (req.query.categorie) {
      filtre.categorie = req.query.categorie;
    }
    if (req.query.disponible !== undefined) {
      filtre.disponible = req.query.disponible === 'true';
    }

    const plats = await Plat.find(filtre)
      .populate('categorie', 'nom description')
      .sort({ nom: 1 });

    res.json({ succes: true, donnees: plats } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * GET /api/menu/:id
 * Obtenir un plat par ID
 */
export const obtenirPlatParId = async (req: Request, res: Response): Promise<void> => {
  try {
    const plat = await Plat.findById(req.params.id).populate('categorie', 'nom description');
    if (!plat) {
      res.status(404).json({ succes: false, message: 'Plat non trouvé.' } as ReponseApi);
      return;
    }
    res.json({ succes: true, donnees: plat } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * POST /api/menu
 * Créer un plat (gérant uniquement)
 */
export const creerPlat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, description, prix, categorie, disponible, image } = req.body;
    const plat = await Plat.create({
      nom,
      description,
      prix,
      categorie,
      disponible: disponible !== undefined ? disponible : true,
      image,
    });

    const platComplet = await plat.populate('categorie', 'nom description');

    res.status(201).json({
      succes: true,
      message: 'Plat créé avec succès.',
      donnees: platComplet,
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * PUT /api/menu/:id
 * Modifier un plat (gérant uniquement)
 */
export const modifierPlat = async (req: Request, res: Response): Promise<void> => {
  try {
    const plat = await Plat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categorie', 'nom description');

    if (!plat) {
      res.status(404).json({ succes: false, message: 'Plat non trouvé.' } as ReponseApi);
      return;
    }

    res.json({
      succes: true,
      message: 'Plat modifié avec succès.',
      donnees: plat,
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * DELETE /api/menu/:id
 * Supprimer un plat (gérant uniquement)
 */
export const supprimerPlat = async (req: Request, res: Response): Promise<void> => {
  try {
    const plat = await Plat.findByIdAndDelete(req.params.id);
    if (!plat) {
      res.status(404).json({ succes: false, message: 'Plat non trouvé.' } as ReponseApi);
      return;
    }
    res.json({
      succes: true,
      message: 'Plat supprimé avec succès.',
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};
