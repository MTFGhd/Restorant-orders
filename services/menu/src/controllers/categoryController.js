import Categorie from '../models/Category.js';

/**
 * GET /api/categories
 * Lister toutes les catégories
 */
export const obtenirCategories = async (_req, res) => {
  try {
    const categories = await Categorie.find().sort({ nom: 1 });
    res.json({ succes: true, donnees: categories });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * GET /api/categories/:id
 * Obtenir une catégorie par ID
 */
export const obtenirCategorieParId = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      res.status(404).json({ succes: false, message: 'Catégorie non trouvée.' });
      return;
    }
    res.json({ succes: true, donnees: categorie });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * POST /api/categories
 * Créer une catégorie (gérant uniquement)
 */
export const creerCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;
    const categorie = await Categorie.create({ nom, description });
    res.status(201).json({
      succes: true,
      message: 'Catégorie créée avec succès.',
      donnees: categorie,
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * PUT /api/categories/:id
 * Modifier une catégorie (gérant uniquement)
 */
export const modifierCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!categorie) {
      res.status(404).json({ succes: false, message: 'Catégorie non trouvée.' });
      return;
    }
    res.json({
      succes: true,
      message: 'Catégorie modifiée avec succès.',
      donnees: categorie,
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * DELETE /api/categories/:id
 * Supprimer une catégorie (gérant uniquement)
 */
export const supprimerCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findByIdAndDelete(req.params.id);
    if (!categorie) {
      res.status(404).json({ succes: false, message: 'Catégorie non trouvée.' });
      return;
    }
    res.json({
      succes: true,
      message: 'Catégorie supprimée avec succès.',
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};
