// ========================
// Utilisateur & Authentification
// ========================

export enum UserRole {
  SERVEUR = 'serveur',
  GERANT = 'gerant',
  CUISINIER = 'cuisinier',
}

export interface IUtilisateur {
  _id?: string;
  nom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface ReponseAuth {
  jeton: string;
  utilisateur: {
    id: string;
    nom: string;
    email: string;
    role: UserRole;
  };
}

// ========================
// Menu — Catégories & Plats
// ========================

export interface ICategorie {
  _id?: string;
  nom: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPlat {
  _id?: string;
  nom: string;
  description?: string;
  prix: number;
  categorie: string;
  disponible: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Commandes
// ========================

export enum StatutCommande {
  EN_ATTENTE = 'en_attente',
  EN_PREPARATION = 'en_preparation',
  PRET = 'pret',
  SERVIE = 'servie',
}

export enum StatutArticle {
  EN_ATTENTE = 'en_attente',
  EN_PREPARATION = 'en_preparation',
  PRET = 'pret',
}

export interface IArticleCommande {
  platId: string;
  nom: string;
  prix: number;
  quantite: number;
  statut: StatutArticle;
  notes?: string;
}

export interface ICommande {
  _id?: string;
  numeroTable: number;
  serveurId: string;
  serveurNom: string;
  articles: IArticleCommande[];
  statut: StatutCommande;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ========================
// Messages RabbitMQ
// ========================

export interface MessageCommande {
  idCommande: string;
  numeroTable: number;
  serveurId: string;
  serveurNom: string;
  articles: IArticleCommande[];
  total: number;
  creeA: string;
}

// ========================
// Réponse API
// ========================

export interface ReponseApi<T = unknown> {
  succes: boolean;
  message?: string;
  donnees?: T;
}

// Rétro-compatibilité (alias)
export type ApiResponse<T = unknown> = ReponseApi<T>;
export type AuthResponse = ReponseAuth;
export type OrderStatus = StatutCommande;
export const OrderStatus = StatutCommande;
export type OrderItemStatus = StatutArticle;
export const OrderItemStatus = StatutArticle;
export type OrderMessage = MessageCommande;
