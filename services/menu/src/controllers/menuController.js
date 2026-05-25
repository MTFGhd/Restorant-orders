import Plat from '../models/Plat.js';

/**
 * GET /api/menu
 * Lister tous les plats (avec filtre optionnel par catégorie et disponibilité)
 */
export const obtenirPlats = async (req, res) => {
  try {
    const filtre = {};

    if (req.query.categorie) {
      filtre.categorie = req.query.categorie;
    }
    if (req.query.disponible !== undefined) {
      filtre.disponible = req.query.disponible === 'true';
    }

    const plats = await Plat.find(filtre)
      .populate('categorie', 'nom description')
      .sort({ nom: 1 });

    res.json({ succes: true, donnees: plats });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * GET /api/menu/:id
 * Obtenir un plat par ID
 */
export const obtenirPlatParId = async (req, res) => {
  try {
    const plat = await Plat.findById(req.params.id).populate('categorie', 'nom description');
    if (!plat) {
      res.status(404).json({ succes: false, message: 'Plat non trouvé.' });
      return;
    }
    res.json({ succes: true, donnees: plat });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * POST /api/menu
 * Créer un plat (gérant uniquement)
 */
export const creerPlat = async (req, res) => {
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
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * PUT /api/menu/:id
 * Modifier un plat (gérant uniquement)
 */
export const modifierPlat = async (req, res) => {
  try {
    const plat = await Plat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categorie', 'nom description');

    if (!plat) {
      res.status(404).json({ succes: false, message: 'Plat non trouvé.' });
      return;
    }

    res.json({
      succes: true,
      message: 'Plat modifié avec succès.',
      donnees: plat,
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

/**
 * DELETE /api/menu/:id
 * Supprimer un plat (gérant uniquement)
 */
export const supprimerPlat = async (req, res) => {
  try {
    const plat = await Plat.findByIdAndDelete(req.params.id);
    if (!plat) {
      res.status(404).json({ succes: false, message: 'Plat non trouvé.' });
      return;
    }
    res.json({
      succes: true,
      message: 'Plat supprimé avec succès.',
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};
