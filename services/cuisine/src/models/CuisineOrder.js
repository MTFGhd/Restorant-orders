import mongoose from 'mongoose';
import { StatutCommande, StatutLigneCommande } from 'shared-types';
const { Schema } = mongoose;

const schemaLigneCuisine = new Schema(
  {
    platId: { type: String, required: true },
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    quantite: { type: Number, required: true, min: 1 },
    statut: { type: String, enum: Object.values(StatutLigneCommande), default: StatutLigneCommande.EN_ATTENTE },
    notes: { type: String },
  },
  { _id: true }
);

const schemaCommandeCuisine = new Schema(
  {
    idCommande: { type: String, required: true, unique: true },
    numeroTable: { type: Number, required: true },
    serveurId: { type: String, required: true },
    serveurNom: { type: String, required: true },
    lignes: { type: [schemaLigneCuisine], required: true },
    statut: { type: String, enum: Object.values(StatutCommande), default: StatutCommande.EN_ATTENTE },
    total: { type: Number, required: true },
    commandeRecueA: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('CommandeCuisine', schemaCommandeCuisine);
