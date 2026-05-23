import mongoose, { Schema, Document } from 'mongoose';
import { StatutCommande, StatutArticle } from 'shared-types';

export interface IArticleCuisineDoc {
  platId: string;
  nom: string;
  prix: number;
  quantite: number;
  statut: StatutArticle;
  notes?: string;
}

export interface ICommandeCuisineDocument extends Document {
  idCommande: string;
  numeroTable: number;
  serveurId: string;
  serveurNom: string;
  articles: IArticleCuisineDoc[];
  statut: StatutCommande;
  total: number;
  commandeRecueA: Date;
}

const schemaArticleCuisine = new Schema<IArticleCuisineDoc>(
  {
    platId: { type: String, required: true },
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    quantite: { type: Number, required: true, min: 1 },
    statut: { type: String, enum: Object.values(StatutArticle), default: StatutArticle.EN_ATTENTE },
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
    articles: { type: [schemaArticleCuisine], required: true },
    statut: { type: String, enum: Object.values(StatutCommande), default: StatutCommande.EN_ATTENTE },
    total: { type: Number, required: true },
    commandeRecueA: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ICommandeCuisineDocument>('CommandeCuisine', schemaCommandeCuisine);
