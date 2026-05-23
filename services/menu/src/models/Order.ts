import mongoose, { Schema, Document } from 'mongoose';
import { StatutCommande, StatutArticle } from 'shared-types';

export interface IArticleCommandeDoc {
  platId: mongoose.Types.ObjectId;
  nom: string;
  prix: number;
  quantite: number;
  statut: StatutArticle;
  notes?: string;
}

export interface ICommandeDocument extends Document {
  numeroTable: number;
  serveurId: string;
  serveurNom: string;
  articles: mongoose.Types.DocumentArray<IArticleCommandeDoc & mongoose.Document>;
  statut: StatutCommande;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const schemaArticleCommande = new Schema<IArticleCommandeDoc>(
  {
    platId: {
      type: Schema.Types.ObjectId,
      ref: 'Plat',
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
      enum: Object.values(StatutArticle),
      default: StatutArticle.EN_ATTENTE,
    },
    notes: {
      type: String,
    },
  },
  { _id: true }
);

const schemaCommande = new Schema<ICommandeDocument>(
  {
    numeroTable: {
      type: Number,
      required: [true, 'Le numéro de table est requis'],
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
    articles: {
      type: [schemaArticleCommande],
      required: true,
      validate: {
        validator: (v: IArticleCommandeDoc[]) => v.length > 0,
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

export default mongoose.model<ICommandeDocument>('Commande', schemaCommande);
