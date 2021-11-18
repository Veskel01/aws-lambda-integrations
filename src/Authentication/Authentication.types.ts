export const enum AuthModuleProviders {
  AUTH_SERVICE = 'auth_service',
  AUTH_JWT_SERVICE = 'auth_jwt_service',
}

export type AuthJwtPayload = {
  github_name: string;
  isAdmin: boolean;
};
