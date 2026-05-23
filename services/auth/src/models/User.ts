import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from 'shared-types';

export interface IUtilisateurDocument extends Document {
  nom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
  comparerMotDePasse(motDePasseCandidat: string): Promise<boolean>;
}

const schemaUtilisateur = new Schema<IUtilisateurDocument>(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.SERVEUR,
    },
  },
  {
    timestamps: true,
  }
);

// Hacher le mot de passe avant la sauvegarde
schemaUtilisateur.pre('save', async function () {
  if (!this.isModified('motDePasse')) return;
  const sel = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, sel);
});

// Méthode pour comparer les mots de passe
schemaUtilisateur.methods.comparerMotDePasse = async function (
  motDePasseCandidat: string
): Promise<boolean> {
  return bcrypt.compare(motDePasseCandidat, this.motDePasse);
};

export default mongoose.model<IUtilisateurDocument>('Utilisateur', schemaUtilisateur);
