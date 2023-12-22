import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  static YES = 'Yes';
  static NO = 'No';
  static I_DONT_KNOW = `I don't know`;
  static FORM_BASE_PATH = `/service`;

  static SECTION_WHOSE_MEDAL = 1;
  static SECTION_ACTIVE_SERVICE = 2;

  static SECTION_CANNOT_COMPLETE = 4;
  static SECTION_VETERANS_BADGE = 8;
  static SECTION_WHICH_MEDALS = 16;
  static SECTION_CHECK_ANSWERS = 32;

  static pathText = {
    WHOSE_MEDALS: 'whose-medals',
    ACTIVE_SERVICE: 'active-service',
    CANNOT_COMPLETE: 'cannot-complete',
    VETERANS_BADGE: 'veterans-badge',
    WHICH_MEDALS: 'which-medals',
    CHECK_ANSWERS: 'check-answers',
  };

  static pageUrls = {
    WHOSE_MEDALS: `/${ConfigService.pathText.WHOSE_MEDALS}`,
    ACTIVE_SERVICE: `/${ConfigService.pathText.ACTIVE_SERVICE}`,
    CANNOT_COMPLETE: `/${ConfigService.pathText.CANNOT_COMPLETE}`,
    VETERANS_BADGE: `/${ConfigService.pathText.VETERANS_BADGE}`,
    WHICH_MEDALS: `/${ConfigService.pathText.WHICH_MEDALS}`,
    CHECK_ANSWERS: `/${ConfigService.pathText.CHECK_ANSWERS}`,
  };

  static SECTION_PATHS = {
    [ConfigService.SECTION_WHOSE_MEDAL]: ConfigService.pageUrls.WHOSE_MEDALS,
    [ConfigService.SECTION_ACTIVE_SERVICE]:
      ConfigService.pageUrls.ACTIVE_SERVICE,
    [ConfigService.SECTION_CANNOT_COMPLETE]:
      ConfigService.pageUrls.CANNOT_COMPLETE,
    [ConfigService.SECTION_VETERANS_BADGE]:
      ConfigService.pageUrls.VETERANS_BADGE,
    [ConfigService.SECTION_WHICH_MEDALS]: ConfigService.pageUrls.WHICH_MEDALS,
    [ConfigService.SECTION_CHECK_ANSWERS]: ConfigService.pathText.CHECK_ANSWERS,
  };

  static SECTION_NAMES = Object.entries(ConfigService.SECTION_PATHS).reduce(
    (obj, [key, value]) => ({ ...obj, [value]: key }),
    {},
  );

  static MY_OWN = 'My own';
  static A_LIVING_SERVICEPERSON = 'A living serviceperson';
  static A_DECEASED_RELATIVE = 'A deceased relative';

  static APPLYING_FOR = [
    ConfigService.MY_OWN,
    ConfigService.A_LIVING_SERVICEPERSON,
    ConfigService.A_DECEASED_RELATIVE,
  ];

  static SERVICE_TYPES: [
    'Royal Navy or Royal Marines',
    'Army',
    'Royal Air Force',
    'Royal Fleet Auxilary',
    'Cadets',
    'Ministry of Defence',
    'Home Guard',
    'Other',
  ];

  static MAX_UPLOAD_FILE_SIZE = 10000000;

  get(key: string, obj?: string): string {
    return ConfigService[key] ?? process.env[key] ?? false;
  }

  getSectionPaths() {
    return ConfigService.SECTION_PATHS;
  }

  getSectionFromPath(path: string): string {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    return String(ConfigService.SECTION_NAMES[path]);
  }
}
