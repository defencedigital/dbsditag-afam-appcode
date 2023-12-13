import { Provider } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export const SessionProvider: Provider = {
  provide: 'SESSION',
  useFactory: (req) => req.session,
  inject: [REQUEST],
};
