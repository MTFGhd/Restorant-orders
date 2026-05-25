import mongoose from 'mongoose';
import { StatutCommande, StatutLigneCommande } from 'shared-types';
const { Schema } = mongoose;

const schemaLigneCommande = new Schema(
  {
    platId: {
      type: String,
      required: true,
    },
    nom: {
      type: String,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    quantite: {
      type: Number,
      required: true,
      min: 1,
    },
    statut: {
      type: String,
      enum: Object.values(StatutLigneCommande),
      default: StatutLigneCommande.EN_ATTENTE,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const schemaCommande = new Schema(
  {
    numeroTable: {
      type: Number,
      required: [true, 'Le numero de table est requis'],
      min: 1,
    },
    serveurId: {
      type: String,
      required: true,
    },
    serveurNom: {
      type: String,
      required: true,
    },
    lignes: {
      type: [schemaLigneCommande],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'La commande doit contenir au moins un plat.',
      },
    },
    statut: {
      type: String,
      enum: Object.values(StatutCommande),
      default: StatutCommande.EN_ATTENTE,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Commande', schemaCommande);
