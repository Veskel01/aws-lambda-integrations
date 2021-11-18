// imports
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import sha1 from 'sha1';

// helpers
import getFieldIdBasedOnRoadmapID from '../Helpers/GetFieldIdFromRoadmapId';

// modules

// errors
import ErrorHandler from '../Helpers/Error.handler';

import {
  ICreateRoadmapOwner,
  ICrmResponse,
  ICreateNewStudent,
  ICreatedContact,
  IContact,
  HandleBoughtType,
} from './Crm.types';
import additionalFieldsIDConfig from '../utils/AdditionalFieldsId.config';
import { CrmHelperService } from './CrmHelper.service';
import getGroupForUserBasedOnProductID from 'src/Helpers/GetGroupForUser';

@Injectable()
export class CrmService {
  private logger: Logger = new Logger(CrmService.name);

  private readonly _crmApiUrl = this.configService.get<string>('CRM_API_URL');

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private readonly crmHelperService: CrmHelperService,
  ) {}

  private async _getInitialSettings() {
    const authLink = `${this._crmApiUrl}/_Api/auth_call/_api_method/getToken`;

    const apiKey = this.configService.get('API_KEY');
    const apiSecret = this.configService.get('API_SECRET');

    try {
      const result = await firstValueFrom(
        this.http.post(authLink, null, {
          params: { _api_auth: 'key', _api_key: apiKey },
        }),
      );
      const { token, session_id } = result.data.data;
      const _api_sha = sha1(`${apiKey}${token}${apiSecret}`);

      return {
        _api_auth: 'key',
        _api_key: apiKey,
        _api_sha,
        _api_session: session_id,
      };
    } catch (err) {
      ErrorHandler(
        'Wystąpił Błąd uwierzytelniania z Livespace',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async crmRequest(endpoint: string, body: Record<string, unknown>) {
    const initialSettings = await this._getInitialSettings();

    try {
      const url = `${this._crmApiUrl}${endpoint}`;

      const {
        data: { data, error },
      } = await firstValueFrom(
        this.http.post<ICrmResponse>(url, {
          ...initialSettings,
          ...body,
        }),
      );

      if (error !== null) {
        this.logger.log(error);
        ErrorHandler('Wystąpił błąd w zapytaniu CRM', HttpStatus.BAD_REQUEST);
      }

      return data;
    } catch (e) {
      this.logger.warn(e);
      ErrorHandler('Wystąpił błąd w zapytaniu CRM', HttpStatus.BAD_REQUEST);
    }
  }

  public async getSingleContact({ email }: { email: string }) {
    const requestBody = {
      type: 'contact',
      emails: email,
    };

    const { contact } = await this.crmRequest('/Contact/getAll', requestBody);

    return Array.isArray(contact) && contact.length > 0
      ? (contact[0] as unknown as IContact)
      : null;
  }

  public async getAllStudents() {
    const { studentsGroupId } = additionalFieldsIDConfig;

    const requestBody = {
      type: 'contact',
      created: {
        from: '2021-01-01 12:00',
        to: '2100-01-01 12:00',
      },
    };

    try {
      const { contact: allContacts } = (await this.crmRequest(
        '/Contact/getAll',
        {
          ...requestBody,
        },
      )) as unknown as { contact: IContact[] };

      return allContacts.filter((contact) =>
        contact.groups_id.includes(studentsGroupId),
      );
    } catch (e) {
      ErrorHandler('Wystąpił błąd', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  public async createNewRoadmapOwner({
    firstName,
    githubName,
    groupIdForCustomer,
    email,
    lastName,
    productID,
  }: ICreateRoadmapOwner) {
    const { githubFieldID } = additionalFieldsIDConfig;

    const productFieldID = getFieldIdBasedOnRoadmapID(productID);

    const requestBody = {
      firstname: firstName,
      lastname: lastName,
      emails: [email],
      groups: [groupIdForCustomer],
      dataset: {
        [githubFieldID]: githubName,
        ...this.crmHelperService.prepareFieldsIDforRoadmaps(productFieldID),
      },
    };

    const { contact } = await this.crmRequest('/Contact/addContact', {
      contact: {
        ...requestBody,
      },
    });

    return contact;
  }

  public async createNewStudent(createNewStudentDto: ICreateNewStudent) {
    const requestBody =
      this.crmHelperService.prepareNewStudentRequestBody(createNewStudentDto);

    const { contact } = await this.crmRequest('/Contact/addContact', {
      contact: {
        ...requestBody,
      },
    });

    return contact as unknown as ICreatedContact;
  }

  async handleBought({
    contact,
    order,
    productID,
    productType,
  }: HandleBoughtType) {
    const {
      customer_note: githubName,
      billing: { first_name: firstName, last_name: lastName, email },
    } = order;

    const { githubFieldID } = additionalFieldsIDConfig;

    const { groupIdForCustomer } = getGroupForUserBasedOnProductID(productID);

    const { email: contactEmail, id } = contact;

    const productId = getFieldIdBasedOnRoadmapID(productID);

    const purcharsedFields = this.crmHelperService.prepareFieldsForBought({
      order,
      productId,
      productType,
      contact,
    });

    function detectEmail() {
      return contactEmail && contactEmail.includes('@');
    }

    await this.crmRequest('/Contact/editContact', {
      contact: {
        id,
        firstname: firstName,
        lastname: lastName,
        emails: !detectEmail() ? [email] : null,
        groups: [groupIdForCustomer],
        dataset: {
          [githubFieldID]: githubName,
          ...purcharsedFields,
        },
      },
    });
  }
}