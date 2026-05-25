import mongoose from 'mongoose';

const { Schema } = mongoose;

const schemaCategorie = new Schema(
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

export default mongoose.model('Categorie', schemaCategorie);
