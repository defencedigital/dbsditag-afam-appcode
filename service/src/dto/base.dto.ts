import { Inject, Module, Session } from '@nestjs/common';
import { SessionProvider } from '../providers/session.provider';
import { Request } from 'express';
export class BaseDTO {
    public session: Record<string, any>;

    constructor(
        @Session() session: Record<string, any> = {},
    ) {
        this.session = session;
    }
}
