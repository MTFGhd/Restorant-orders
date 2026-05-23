import mongoose, { Schema, Document } from 'mongoose';

export interface ICategorieDocument extends Document {
  nom: string;
  description?: string;
}

const schemaCategorie = new Schema<ICategorieDocument>(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICategorieDocument>('Categorie', schemaCategorie);
