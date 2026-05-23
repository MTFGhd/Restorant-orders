import { Request, Response } from 'express';
import Categorie from '../models/Category';
import { ReponseApi } from 'shared-types';

/**
 * GET /api/categories
 * Lister toutes les catégories
 */
export const obtenirCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Categorie.find().sort({ nom: 1 });
    res.json({ succes: true, donnees: categories } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * GET /api/categories/:id
 * Obtenir une catégorie par ID
 */
export const obtenirCategorieParId = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      res.status(404).json({ succes: false, message: 'Catégorie non trouvée.' } as ReponseApi);
      return;
    }
    res.json({ succes: true, donnees: categorie } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * POST /api/categories
 * Créer une catégorie (gérant uniquement)
 */
export const creerCategorie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, description } = req.body;
    const categorie = await Categorie.create({ nom, description });
    res.status(201).json({
      succes: true,
      message: 'Catégorie créée avec succès.',
      donnees: categorie,
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * PUT /api/categories/:id
 * Modifier une catégorie (gérant uniquement)
 */
export const modifierCategorie = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!categorie) {
      res.status(404).json({ succes: false, message: 'Catégorie non trouvée.' } as ReponseApi);
      return;
    }
    res.json({
      succes: true,
      message: 'Catégorie modifiée avec succès.',
      donnees: categorie,
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};

/**
 * DELETE /api/categories/:id
 * Supprimer une catégorie (gérant uniquement)
 */
export const supprimerCategorie = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!categorie) {
      res.status(404).json({ succes: false, message: 'Catégorie non trouvée.' } as ReponseApi);
      return;
    }
    res.json({
      succes: true,
      message: 'Catégorie supprimée avec succès.',
    } as ReponseApi);
  } catch (erreur: any) {
    res.status(500).json({ succes: false, message: erreur.message } as ReponseApi);
  }
};
