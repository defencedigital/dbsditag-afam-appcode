import { Request, Locals, Response } from 'express';
export type Applicant = 'applicant';
export type Serviceperson = 'serviceperson';
export type ApplicantType = Applicant | Serviceperson;

export enum FormKeysEnum {
  WHOSE_MEDALS = 'whoseMedals',
  ARE_YOU_ACTIVE = 'areYouActive',
  VETERANS_BADGE = 'veteransBadge',
  WHICH_MEDALS = 'whichMedals',
  WHICH_SERVICES = 'whichServices',
  SERVICEPERSON_FIRST_NAME = 'servicepersonFirstName',
}

export interface IsDayAfterArgs {
  otherDate: { day: string; month?: string; year?: string };
  thisDate: { day: string; month?: string; year?: string };
}

export interface INotifyEmailTemplate {
  data: {
    personalisation: Record<string, string>;
  };
}

export type UserData = Record<FormKeysEnum, string> & {
  _csrf?: string;
};

interface IErrorListItem {
  href: string;
  text: string;
}

interface IErrorItem {
  text: string;
  id: string;
}

export interface IFlash {
  errorList?: IErrorListItem[];
  oldUserData?: UserData;
  errors?: IErrorItem[];
}

type UserProgressPageData = Partial<UserData> | boolean;

export type UserProgress = {
  string?: UserProgressPageData;
};

export interface ISession extends CookieSessionInterfaces.CookieSessionRequest {
  userData?: UserData;
  userProgress: UserProgress;
  flash: IFlash;
}

interface ILocals extends Locals {
  errorList?: IErrorListItem[];
  oldUserData?: Record<string, string>;
  errors?: IErrorItem[];

  showCookieBanner: boolean;
  hideBackLink: boolean;
  session: ISession;
  userData: UserData;
  csrfToken?: string;
}

export interface IRequest extends Request {
  session: ISession;
  gotoNext?: string;
  csrfToken: () => string;
  cookies: any;
}

export interface IResponse extends Response {
  locals: ILocals;
  cookies: any;
}

export interface IRenderStepArgs {
  response: IResponse;
  step: string;
  data: any;
  userData: UserData;
  errors: any;
}
