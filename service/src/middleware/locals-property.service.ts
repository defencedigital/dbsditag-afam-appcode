import { Injectable, NestMiddleware } from '@nestjs/common';
import { shouldShowCookieBanner } from '../utils/utils';
import { IRequest, IResponse } from 'src/types/interfaces';
@Injectable()
export class LocalsPropertyMiddleware implements NestMiddleware {
  use(req: IRequest, res: IResponse, next: () => void) {
    let showCookie = true;
    const hideBackLink =
      req.originalUrl === '/' || req.originalUrl === '/check-answers';

    showCookie = shouldShowCookieBanner(req);
    const userAnswers = req.session?.userData;
    if (userAnswers?._csrf) delete userAnswers._csrf;

    res.locals = {
      ...res.locals,
      showCookieBanner: showCookie,
      hideBackLink: hideBackLink,
      session: req.session,
      userData: userAnswers,
    };

    if (req.method === 'GET') {
      res.locals.csrfToken = req.csrfToken?.();
    }

    if (req.session?.flash?.oldUserData) {
      const flashOld: Record<string, string> = req.session?.flash?.oldUserData;

      for (const property in flashOld) {
        if (property !== '_csrf')
          res.locals.userData[property] = flashOld[property] ?? null;
      }
      delete req.session?.flash?.oldUserData;
    }
    if (req.session?.flash?.errors) {
      res.locals.errors = req.session?.flash?.errors;

      delete req.session?.flash?.errors;
    }

    if (req.session?.flash?.errorList) {
      res.locals.errorList = req.session?.flash?.errorList;
      delete req.session?.flash?.errorList;
    }

    next();
  }
}
