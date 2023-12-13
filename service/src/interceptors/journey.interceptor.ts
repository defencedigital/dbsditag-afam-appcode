import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Reflector } from '@nestjs/core';
import {
  IRenderStepArgs,
  IRequest,
  IResponse,
  ISession,
  UserData,
} from 'src/types/interfaces';
import { ConfigService } from 'src/services';

type IConditions = {
  if: Record<string, string[]>;
  then: string;
};

@Injectable()
export class JourneyInterceptor implements NestInterceptor {
  private journeyConfig = require('../../journey-config.json'); // Path to your JSON configuration
  private reflector: Reflector;

  private addErrors(request: IRequest, validationErrors) {
    const { session, body } = request ?? {};
    session.flash = {};
    session.flash.errors = validationErrors.reduce(
      (acc, { property, constraints }) => {
        acc[property] = {
          text: constraints[Object.keys(constraints)[0]],
          id: property,
        };
        return acc;
      },
      {},
    );

    session.flash.errorList = validationErrors.map(
      ({ property, constraints }) => {
        return {
          text: constraints[Object.keys(constraints)[0]],
          href: `#${property}`,
        };
      },
    );

    session.flash.oldUserData = body;
    delete session.flash.oldUserData._csrf;
  }

  private getStepConfig(currentStepString: string): {
    stepConfig: any;
    template: string;
    questions: any[];
    requiredSections: string[];
  } {
    const stepConfig = this.journeyConfig.journeySteps[currentStepString];
    const template = stepConfig?.template;
    const questions = stepConfig?.questions;
    const requiredSections = stepConfig?.requiredSections ?? [];

    return { stepConfig, template, questions, requiredSections };
  }
  private getUserProgressMap(session) {
    const userProgressMap = session.userProgress
      ? new Map(Object.entries(session.userProgress))
      : new Map();
    return userProgressMap;
  }

  updateUserSessionData({
    currentStep,
    requestBody,
    session,
  }: {
    currentStep: string;
    requestBody: UserData;
    session: ISession;
  }) {
    // add the form answers
    session.userData = { ...(session.userData || {}), ...requestBody };
    const userProgressMap = this.getUserProgressMap(session);
    userProgressMap.set(currentStep, true);

    const objectFromMap = Object.fromEntries(userProgressMap);
    session.userProgress = objectFromMap;
  }

  constructor(reflector: Reflector) {
    this.reflector = reflector;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<IRequest>();
    const params = request.params;
    const response = ctx.getResponse<IResponse>();
    const session = request.session;
    const currentStep = params.node ?? null;
    const stepConfig = this.journeyConfig.journeySteps[currentStep];
    const questions = stepConfig?.questions;
    const userProgress = this.getUserProgressMap(session);

    if (request.method === 'POST') {
      this.validateBody(currentStep, request.body).then((validationErrors) => {
        if (validationErrors.length > 0) {
          this.addErrors(request, validationErrors);
          request.gotoNext = `${ConfigService.FORM_BASE_PATH}/${currentStep}`;
        } else {
          const nextStep = this.determineNextStep({
            currentStep,
            userResponse: { ...request.session.userData, ...request.body },
            session,
          });

          this.updateUserSessionData({
            session,
            requestBody: request.body,
            currentStep,
          });

          request.gotoNext = `${ConfigService.FORM_BASE_PATH}/${nextStep}`;
        }
      });
    }

    return next.handle().pipe(
      map(async (data) => {
        if (request.method === 'GET') {
          const { userData } = session ?? null;
          const { errors, errorList } = response.locals ?? {};
          const { requiredSections } = this.getStepConfig(currentStep);

          const firstMissingRequiredSection = requiredSections.find(
            (requiredSection) => {
              const userProgressMap = Object.fromEntries(userProgress);
              return !userProgressMap[requiredSection];
            },
          );
          if (firstMissingRequiredSection) {
            response.redirect(`${ConfigService.FORM_BASE_PATH}/${firstMissingRequiredSection}`);
          } else {
            this.renderStep({
              response,
              step: currentStep,
              data: { node: currentStep, questions, errorList },
              userData,
              errors,
            });
          }
          return data;
        }
      }),
    );
  }

  private determineNextStep({
    userId,
    currentStep,
    userResponse,
    session,
  }: {
    userId?: string;
    currentStep: string;
    userResponse: any;
    session: ISession;
  }): string {
    const stepConfig = this.journeyConfig.journeySteps[currentStep];
    switch (stepConfig.type) {
      case 'section': {
        if (stepConfig.conditionalNextStep) {
          return (
            this.checkConditions(
              userResponse,
              stepConfig.conditionalNextStep,
            ) ?? stepConfig.defaultNextStep
          );
        } else {
          return stepConfig.nextStep;
        }
      }
      case 'conditional': {
        return this.handleConditionalStep(
          userId,
          stepConfig,
          userResponse,
          session,
        );
      }
      case 'end':
        return null; // Journey completed
      default:
        throw new Error('Unknown step type');
    }
  }

  private handleConditionalStep(
    userId: string,
    stepConfig: any,
    userResponse: any,
    session: ISession,
  ): string {
    if (stepConfig.repeatForEach) {
      const progress = this.getUserProgressMap(session);

      const remainingBranches = this.getRemainingBranches(
        stepConfig.repeatForEach,
        progress,
      );

      if (remainingBranches.length > 0) {
        return stepConfig.branchDetails[remainingBranches[0]];
      }
    }
    return stepConfig;
  }

  private checkAllMatch(
    conditions: IConditions['if'],
    answers: Record<string, string>,
  ) {
    return Object.entries(conditions).every(([key, conditions]) => {
      const userAnswer = answers[key];
      if (!userAnswer) return false;
      return conditions.includes(userAnswer);
    });
  }

  private checkConditions(
    userResponses: UserData,
    conditions: IConditions[],
  ): string | undefined {
    // find the matching conditon from the config file
    const matchingCondition = Object.entries(conditions).find(
      ([, conditionValues]) =>
        // ensure all parts of the if condition match the users answers
        this.checkAllMatch(conditionValues.if, userResponses),
    )?.[0];

    return conditions[matchingCondition]?.then;
  }

  private getRemainingBranches(field: string, progress: any): string[] {
    const selectedBranches = progress['serviceBackground']?.[field] || [];
    const completedBranches = Object.keys(progress).filter((key) =>
      selectedBranches.includes(key),
    );
    return selectedBranches.filter(
      (branch) => !completedBranches.includes(branch),
    );
  }

  private async validateBody(step: string, userResponse: any): Promise<any> {
    const stepConfig = this.journeyConfig.journeySteps[step];
    if (stepConfig?.validationDTO) {
      const dtoKebab = stepConfig.validationDTO
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      const dtoPath = '../dto/' + dtoKebab + '.dto';
      const { default: dtoClass } = await import(dtoPath);
      const validationDTO = plainToInstance(dtoClass, userResponse);
      return validate(validationDTO);
    }
    return [];
  }

  private async renderStep({
    response,
    step,
    data,
    userData,
    errors,
  }: IRenderStepArgs) {
    const stepConfig = this.journeyConfig.journeySteps[step];

    const template = stepConfig?.template;
    const questions = stepConfig?.questions;
    try {
      response.render(`form-pages/${template}`, {
        questions,
        node: step,
        data: data,
        userData,
        errors,
      });
    } catch (err) { }
  }
}
