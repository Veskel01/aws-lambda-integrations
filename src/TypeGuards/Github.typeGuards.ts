import { IGithubUserExistResponse } from 'src/Login/Github.types';

export const checkIfGithubUserExistTypeGuard = (
  data: IGithubUserExistResponse | { message: string },
): data is IGithubUserExistResponse => {
  return (data as IGithubUserExistResponse).login !== undefined;
};
