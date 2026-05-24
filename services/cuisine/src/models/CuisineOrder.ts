import mongoose, { Schema, Document } from 'mongoose';
import { StatutCommande, StatutLigneCommande } from 'shared-types';

export interface ILigneCuisineDoc {
  platId: string;
  nom: string;
  prix: number;
  quantite: number;
  statut: StatutLigneCommande;
  notes?: string;
}

export interface ICommandeCuisineDocument extends Document {
  idCommande: string;
  numeroTable: number;
  serveurId: string;
  serveurNom: string;
  lignes: ILigneCuisineDoc[];
  statut: StatutCommande;
  total: number;
  commandeRecueA: Date;
}

const schemaLigneCuisine = new Schema<ILigneCuisineDoc>(
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

const schemaCommandeCuisine = new Schema<ICommandeCuisineDocument>(
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

export default mongoose.model<ICommandeCuisineDocument>('CommandeCuisine', schemaCommandeCuisine);
