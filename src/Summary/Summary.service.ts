import { Injectable, Logger } from '@nestjs/common';

// imports
import { CrmService } from '../Crm/Crm.service';

// utils
import paymentFieldsIdConfig from '../utils/PaymentsFieldsId.config';

// types
import {
  PrepareStudentsData,
  SinglePaymentType,
  ResponseType,
} from './Summary.types';
import { AccessKeysType } from '../UserAccess/UserAccess.types';

// packages
import { DateTime } from 'luxon';
import additionalFieldsConfig from '../utils/AdditionalFieldsId.config';
import ErrorHandler from '../Helpers/Error.handler';

@Injectable()
export class SummaryService {
  constructor(private readonly crmService: CrmService) {}

  private logger: Logger = new Logger(SummaryService.name);

  async handleRequest({ accessType }: { accessType: AccessKeysType[] }) {
    const { mentorsData, paymentSummary, studentsData } =
      await this._prepareBasicData();

    const summarizedPayments = this.summarizePayments(paymentSummary);

    const { ...responseData } = this._prepareResponse({
      accessKeys: accessType,
      mentorsData,
      studentsData,
      summarizedPayments,
    });

    return responseData;
  }

  private _prepareResponse({
    accessKeys,
    mentorsData,
    studentsData,
    summarizedPayments,
  }: {
    accessKeys: AccessKeysType[];
    mentorsData: {
      mentorName: string;
      numberOfStudents: number;
    }[];
  } & Omit<ResponseType, 'mentorsData'>) {
    return accessKeys.reduce(
      (acc, key) => {
        if (key === 'full_access') {
          acc.mentorsDataAccess = mentorsData;
          acc.studentsDataAccess = studentsData;
          acc.summaryPaymentDataAccess = summarizedPayments;
          return acc;
        }
        if (key === 'mentors') {
          acc.mentorsDataAccess = mentorsData;
        }
        if (key === 'students') {
          acc.studentsDataAccess = studentsData;
        }
        if (key === 'summary') {
          acc.summaryPaymentDataAccess = summarizedPayments;
        }
        if (key === 'questionnaires') {
          acc.questionnairesAccess = true;
        }

        return acc;
      },
      {
        mentorsDataAccess: null,
        studentsDataAccess: null,
        summaryPaymentDataAccess: null,
        questionnairesAccess: false,
      } as {
        questionnairesAccess: boolean;
        studentsDataAccess: ResponseType['studentsData'];
        mentorsDataAccess: {
          mentorName: string;
          numberOfStudents: number;
        }[];
        summaryPaymentDataAccess: ResponseType['summarizedPayments'];
      },
    );
  }

  private async _prepareBasicData() {
    try {
      const {
        lastPaymentDateFieldID,
        paymentAmountFieldID,
        formOfPaymentFieldID,
        prepaidedMonthsFieldID,
        dayOfPaymentFieldID,
      } = paymentFieldsIdConfig;

      const { leadingMentorFieldId, tookAbreak, githubFieldID } =
        additionalFieldsConfig;

      const allStudents = await this.crmService.getAllStudents();

      const daysInMonth = DateTime.local().daysInMonth;

      const lastDayForPayment = DateTime.local().minus({
        days: daysInMonth - 7,
      });

      const arrayOfMentorsWithoutCount: string[] = [];

      const { paymentSummary, studentsData } = allStudents.reduce(
        (acc, { name, dataset, url }) => {
          const lastPaymentDate = dataset[lastPaymentDateFieldID] as string;

          const formOfPayment = dataset[formOfPaymentFieldID] as string;

          const prepaidedMonths = dataset[prepaidedMonthsFieldID] as number;

          const dayOfPayment = Number(dataset[dayOfPaymentFieldID]);

          const githubName = dataset[githubFieldID] as string;

          let didStudentTookAbreak: boolean;

          if (dataset[tookAbreak] !== null) {
            didStudentTookAbreak = Boolean(Number(dataset[tookAbreak]));
          } else {
            didStudentTookAbreak = false;
          }

          const actualMentor = dataset[leadingMentorFieldId] as string;

          const lastPaymentDay = Number(
            DateTime.fromISO(lastPaymentDate).toFormat('dd'),
          );

          const billingPeriod =
            this._preparePaymentPeriodForStudent(lastPaymentDay);
          const amount = Number(dataset[paymentAmountFieldID]);

          let paidForCurrentMonth =
            lastDayForPayment <= DateTime.fromISO(lastPaymentDate);

          if (prepaidedMonths && prepaidedMonths > 0) {
            paidForCurrentMonth =
              DateTime.fromISO(lastPaymentDate).plus({
                months: prepaidedMonths + 1,
              }) > DateTime.local();
          }

          if (actualMentor) {
            arrayOfMentorsWithoutCount.push(actualMentor);
          }

          acc.studentsData.push({
            amount,
            name,
            url,
            githubName,
            lastPaymentDate,
            paidForCurrentMonth,
            formOfPayment,
            prepaidedMonths,
            dayOfPayment,
            actualMentor,
            tookAbreak: didStudentTookAbreak,
          });

          acc.paymentSummary.push({
            amount,
            billingPeriod,
            paidForCurrentMonth,
            isActive: !didStudentTookAbreak,
          });

          return acc;
        },
        {
          studentsData: [] as PrepareStudentsData[],
          paymentSummary: [] as SinglePaymentType[],
        },
      );

      const mentorsCount = {} as Record<string, number>;

      for (const mentor of arrayOfMentorsWithoutCount) {
        mentorsCount[mentor] = mentorsCount[mentor]
          ? mentorsCount[mentor] + 1
          : 1;
      }

      const mentorsArray = Object.entries(mentorsCount).reduce(
        (acc, [mentorName, numberOfStudents]) => {
          acc.push({
            mentorName,
            numberOfStudents,
          });

          return acc;
        },
        [] as {
          mentorName: string;
          numberOfStudents: number;
        }[],
      );

      return {
        studentsData,
        paymentSummary,
        mentorsData: mentorsArray,
      };
    } catch (e) {
      this.logger.warn(e);
      ErrorHandler(e.message, e.status);
    }
  }

  private _preparePaymentPeriodForStudent(dayOfLastPayment: number) {
    if (
      (dayOfLastPayment > 15 && dayOfLastPayment <= 31) ||
      dayOfLastPayment === 1
    ) {
      return 'first';
    }

    if (dayOfLastPayment > 1 && dayOfLastPayment <= 5) {
      return 'fifth';
    }

    if (dayOfLastPayment > 5 && dayOfLastPayment <= 10) {
      return 'tenth';
    }

    return 'fifteenth';
  }

  private summarizePayments(payments: SinglePaymentType[]) {
    return payments.reduce(
      (acc, curr) => {
        const { first, fifth, tenth, fifteenth } = acc;

        const { amount, paidForCurrentMonth, billingPeriod, isActive } = curr;

        if (isActive) {
          if (billingPeriod === 'first') {
            first.amount += amount;
            first.payed += paidForCurrentMonth ? amount : 0;
            first.notPayed += !paidForCurrentMonth ? amount : 0;
          }
          if (billingPeriod === 'fifth') {
            fifth.amount += amount;
            fifth.payed += paidForCurrentMonth ? amount : 0;
            fifth.notPayed += !paidForCurrentMonth ? amount : 0;
          }
          if (billingPeriod === 'tenth') {
            tenth.amount += amount;
            tenth.payed += paidForCurrentMonth ? amount : 0;
            tenth.notPayed += !paidForCurrentMonth ? amount : 0;
          }
          if (billingPeriod === 'fifteenth') {
            fifteenth.amount += amount;
            fifteenth.payed += paidForCurrentMonth ? amount : 0;
            fifteenth.notPayed += !paidForCurrentMonth ? amount : 0;
          }
        } else {
          acc.studentsBreak.amount += amount;
          acc.studentsBreak.numberOfStudens += 1;
        }

        return acc;
      },
      {
        first: {
          amount: 0,
          payed: 0,
          notPayed: 0,
        },
        fifth: {
          amount: 0,
          payed: 0,
          notPayed: 0,
        },
        tenth: {
          amount: 0,
          payed: 0,
          notPayed: 0,
        },
        fifteenth: {
          amount: 0,
          payed: 0,
          notPayed: 0,
        },
        studentsBreak: {
          amount: 0,
          numberOfStudens: 0,
        },
      },
    );
  }
}
