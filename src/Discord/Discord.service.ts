// imports
import { DateTime } from 'luxon';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

// types
import { ISendDiscordMsg } from './Discord.types';

// utils
import getProductType from '../Helpers/GetProductType';

const messages = {
  firstRoadmapPurchase: 'Właśnie została zakupiona nowa roadmapa!',
  mentoringReneval: 'Student przedłużył mentoring!',
  createStudent: 'W Akademii pojawił się nowy student',
  roadmapBought: 'Właśnie została zakupiona nowa Roadmapa!',
  defaultMsg: 'Wykonano nowy zakup',
};

@Injectable()
export class DiscordService {
  private readonly discordWebhookUrl: string;

  private readonly logger: Logger = new Logger(DiscordService.name);

  private readonly apiUrl =
    'https://lha.livespace.io/Contact/contact/details/api_id';

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.discordWebhookUrl = configService.get('MENTORS_DISCORD_HOOK');
  }

  async sendDiscordMessage({ msgType, contactID, order }: ISendDiscordMsg) {
    const {
      total,
      billing: { first_name: firstName, last_name: lastName, email },
      date_completed,
      customer_note: githubName,
      coupon_lines: { '0': coupon },
      line_items: productList,
      currency_symbol,
    } = order;

    const paymentDate = date_completed
      ? date_completed
      : DateTime.local().toISO();

    const contactUrl = `${this.apiUrl}/${contactID}`;

    const { name: productName, quantity, product_id } = productList[0];

    const { productType } = getProductType(product_id);

    const content = messages[msgType];

    const allRoadmapsProductID = 1783;

    const withRoadmaps =
      (productType === 'roadmap' && productList.length > 1) ||
      product_id === allRoadmapsProductID;

    try {
      await firstValueFrom(
        this.http.post(this.discordWebhookUrl, {
          content,
          embeds: [
            {
              title: 'Livespace - Link do konta użytkownika',
              url: contactUrl,
              fields: [
                {
                  name: 'Data zakupu:',
                  value: DateTime.fromISO(paymentDate).toFormat(
                    'dd/LL/yyyy HH:mm:ss',
                  ),
                },
                {
                  name: 'Imię i Nazwisko kupującego:',
                  value: `${firstName} ${lastName}`,
                },
                {
                  name: 'Konto Github:',
                  value: githubName
                    ? `https://github.com/${githubName}`
                    : 'Konto Github nie zostało podane',
                },
                {
                  name: 'Adres E-mail:',
                  value: email,
                },
                {
                  name:
                    productType === 'mentoring'
                      ? 'Typ wykupionego Mentoringu:'
                      : 'Nazwa wykupionej roadmapy:',
                  value: productName,
                },
                {
                  name:
                    productType === 'mentoring'
                      ? 'Ilość wykupionych miesięcy nauki:'
                      : 'Roadmapa z rozwiązaniami?:',
                  value:
                    productType === 'mentoring'
                      ? quantity
                      : withRoadmaps
                      ? 'Tak'
                      : 'Nie',
                },
                {
                  name: 'Użyty kupon rabatowy:',
                  value: coupon ? coupon.code : 'Żaden kupon nie został użyty',
                },
                {
                  name: 'Wartość kuponu:',
                  value: coupon
                    ? `${Number(coupon.discount).toFixed(2)} ${currency_symbol}`
                    : 'Nie została naliczona żadna zniżka',
                },
                {
                  name: 'Wartość zamówienia:',
                  value: `${Number(total).toFixed(2)} ${currency_symbol}`,
                },
              ],
            },
          ],
        }),
      );

      return {
        message: 'Wiadomość została wysłana!',
      };
    } catch (e) {
      this.logger.warn(e);
    }
  }
}
