import mongoose from 'mongoose';

const connecterBD = async () => {
  try {
    const uriMongo = process.env.MONGO_URI || 'mongodb://localhost:27017/menu_db';
    await mongoose.connect(uriMongo);
    console.log('✅ Service Menu — MongoDB connecté');
  } catch (erreur) {
    console.error('❌ Erreur de connexion MongoDB:', erreur);
    process.exit(1);
  }
};

export default connecterBD;
