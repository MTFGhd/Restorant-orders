// ========================
// Utilisateur & Authentification
// ========================

export const UserRole = {
  SERVEUR: 'serveur',
  GERANT: 'gerant',
  CUISINIER: 'cuisinier',
};

// ========================
// Commandes
// ========================

export const StatutCommande = {
  EN_ATTENTE: 'en_attente',
  EN_PREPARATION: 'en_preparation',
  PRET: 'pret',
  SERVIE: 'servie',
};

export const StatutLigneCommande = {
  EN_ATTENTE: 'en_attente',
  EN_PREPARATION: 'en_preparation',
  PRET: 'pret',
};

// Rétro-compatibilité (alias)
export const OrderStatus = StatutCommande;
export const OrderItemStatus = StatutLigneCommande;
