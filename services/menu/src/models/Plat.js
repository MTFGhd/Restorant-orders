import mongoose from 'mongoose';

const { Schema } = mongoose;

const schemaPlat = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du plat est requis'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix doit être positif'],
    },
    categorie: {
      type: Schema.Types.ObjectId,
      ref: 'Categorie',
      required: [true, 'La catégorie est requise'],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Plat', schemaPlat);
