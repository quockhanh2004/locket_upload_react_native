export interface User {
  kind?: string;
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  registered?: boolean;
  profilePicture?: string;
  refreshToken: string;
  expiresIn?: string;
  timeExpires?: any;

  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  passwordUpdatedAt?: number;
  providerUserInfo?: ProviderUserInfo[];
  validSince?: string;
  lastLoginAt?: string;
  createdAt?: string;
  customAuth?: boolean;
  phoneNumber?: string;
  customAttributes?: string;
  lastRefreshAt?: Date;
}

export interface ProviderUserInfo {
  providerId: string;
  rawId: string;
  phoneNumber?: string;
  displayName?: string;
  photoUrl?: string;
  federatedId?: string;
  email?: string;
}
