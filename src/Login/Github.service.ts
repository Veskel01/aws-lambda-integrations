import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

// utils
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { checkIfGithubUserExistTypeGuard } from '../TypeGuards/Github.typeGuards';

// errors
import {
  GithubBadVerificationCodeException,
  GithubRequestException,
  GithubUserNotExistException,
} from '../CustomErrors/Github.errors';

// types
import {
  GithubTokenResponse,
  GithubErrorResponse,
  GithubDataResponse,
  IGithubUserExistResponse,
} from './Github.types';

@Injectable()
export class GithubService {
  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {}

  private async getAccessToken(code: string): Promise<GithubTokenResponse> {
    const clientId = this.configService.get<string>('GITHUB_CLIEN_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');

    const url = `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`;

    const headers = {
      accept: 'application/json',
    };

    try {
      const { data } = await firstValueFrom(
        this.http.post<GithubTokenResponse>(url, null, {
          headers,
        }),
      );
      return data;
    } catch (e) {
      const { error } = e.data as GithubErrorResponse;
      if (error === 'bad_verification_code') {
        throw new GithubBadVerificationCodeException();
      }
      throw new GithubRequestException();
    }
  }

  public async checkIfGithubUserExist(githubName: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get<IGithubUserExistResponse | { message: string }>(
          `https://api.github.com/users/${githubName}`,
        ),
      );

      const isGithubUser = checkIfGithubUserExistTypeGuard(data);

      if (isGithubUser) {
        return true;
      }
      throw new GithubUserNotExistException();
    } catch (e) {
      if (e instanceof GithubUserNotExistException) {
        throw e;
      }
      throw new GithubRequestException();
    }
  }

  public async getGithubData(code: string): Promise<GithubDataResponse> {
    const { access_token } = await this.getAccessToken(code);

    const url = 'https://api.github.com/user';

    const headers = {
      Authorization: `token ${access_token}`,
    };

    try {
      const { data } = await firstValueFrom(
        this.http.get<GithubDataResponse>(url, {
          headers,
        }),
      );
      return data;
    } catch (e) {
      throw new GithubRequestException();
    }
  }
}
