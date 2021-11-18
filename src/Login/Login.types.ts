export type LoginRequest = {
  code: string;
};

export enum LoginModuleProviders {
  LOGIN_SERVICE = 'login_service',
  GITHUB_SERVICE = 'github_service',
}
