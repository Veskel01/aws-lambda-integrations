export const enum SummaryModuleProviders {
  SUMMARY_SERVICE = 'summary_service',
}

export type MentorsDataType = {
  name: string;
  numberOfStudents: number;
};

export type PrepareBreakpoints = {
  studentName: string;
  formOfPayment: string;
};

export type PrepareStudentsData = {
  url: string;
  amount: number;
  githubName: string;
  name: string;
  lastPaymentDate: string;
  paidForCurrentMonth: boolean;
  formOfPayment: string;
  prepaidedMonths: number;
  dayOfPayment: number;
  actualMentor: string;
  tookAbreak: boolean;
};

type BillingPeriodType = 'first' | 'fifth' | 'tenth' | 'fifteenth';

export type SinglePaymentType = {
  amount: number;
  billingPeriod: BillingPeriodType;
  paidForCurrentMonth: boolean;
  isActive: boolean;
};

export type SummarizedPaymentsType = {
  first: {
    amount: number;
    payed: number;
    notPayed: number;
  };
  fifth: {
    amount: number;
    payed: number;
    notPayed: number;
  };
  tenth: {
    amount: number;
    payed: number;
    notPayed: number;
  };
  fifteenth: {
    amount: number;
    payed: number;
    notPayed: number;
  };
};
export type ResponseType = {
  summarizedPayments: SummarizedPaymentsType;
  mentorsData: MentorsDataType[];
  studentsData: PrepareStudentsData[];
};
