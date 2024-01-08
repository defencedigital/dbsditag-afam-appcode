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
interface IApplicationTypes {
  applyingForSelf: boolean;
  applyingForAServiceperson: boolean;
  applyingForADeceasedRelative: boolean;
}

@Injectable()
export class JourneyInterceptor implements NestInterceptor {
  private journeyConfig = require('../../journey-config.json'); // Path to your JSON configuration
  private reflector: Reflector;

  private addErrors(request: IRequest, validationErrors) {
    const { session, body } = request ?? {};

    session.flash = {};
    session.flash.errors = validationErrors.reduce(
      (acc, { property, constraints }) => {
        // TODO move this into the config service as a const
        // const SERVICEPERSON_NAME_CONFIG_VARIABLE = '$servicePersonName';
        acc[property] = {
          text: this.replaceServicepersonName(
            constraints[Object.keys(constraints)[0]],
            request.session,
          ),
          id: property,
        };
        return acc;
      },
      {},
    );

    session.flash.errorList = validationErrors.map(
      ({ property, constraints }) => {
        return {
          text: this.replaceServicepersonName(
            constraints[Object.keys(constraints)[0]],
            request.session,
          ),
          href: `#${property}`,
        };
      },
    );

    session.flash.oldUserData = body;
    delete session.flash.oldUserData._csrf;
  }

  private replaceServicepersonName(errorMessage: string, session: ISession) {
    // TODO move this into the config service as a const
    const SERVICEPERSON_NAME_CONFIG_VARIABLE = '$servicePersonName';

    const doesIncludeKeyword = errorMessage?.includes?.(
      SERVICEPERSON_NAME_CONFIG_VARIABLE,
    );
    if (errorMessage && doesIncludeKeyword) {
      // if the error message contains the variable in the string replace with the servicepersons name from the session if available
      return errorMessage.replace(
        SERVICEPERSON_NAME_CONFIG_VARIABLE,
        this.getServicepersonName(session),
      );
    } else {
      return errorMessage;
    }
  }

  private getServicepersonName(session: ISession) {
    return session?.userData?.servicepersonFirstName ?? 'the serviceperson';
  }
  private getQuestionData(questions: any[] = [], request: IRequest) {
    //if there are no pathway dependent data then just return the questions as they are
    if (questions.every((question) => !question.pathwayDependentData))
      return questions;
    const updatedQuestions = [];
    questions.map((question) => {
      if (question.pathwayDependentData) {
        const matchingCondition = this.checkConditions(
          { ...request.session.userData, ...request.body },
          question.pathwayDependentData.conditions,
        );
        if (
          matchingCondition &&
          (this.applyingForAServiceperson(request.session) ||
            this.applyingForADeceasedRelative)
        ) {
          //  include any question data that may be different based on the pathway, comes from the config.json
          updatedQuestions.push({ ...question, ...matchingCondition });
        } else updatedQuestions.push(question);
      }
    });

    return updatedQuestions;
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

  private applyingForSelf(session: ISession) {
    return session?.userData?.whoseMedals === ConfigService.MY_OWN;
  }

  private applyingForAServiceperson(session: ISession) {
    return (
      session?.userData?.whoseMedals === ConfigService.A_LIVING_SERVICEPERSON
    );
  }
  private applyingForADeceasedRelative(session: ISession) {
    return session?.userData?.whoseMedals === ConfigService.A_DECEASED_RELATIVE;
  }
  // functions to determine the current pathway
  private getApplicantType(session: ISession) {
    return {
      applyingForSelf: this.applyingForSelf(session),
      applyingForAServiceperson: this.applyingForAServiceperson(session),
      applyingForADeceasedRelative: this.applyingForADeceasedRelative(session),
    };
  }

  private addServicepersonName(
    matchingCondition: {
      fieldset?: {
        legend?: {
          text?: string;
        };
      };
    },
    session: ISession,
  ) {
    const fieldSetName = matchingCondition.fieldset.legend.text;
    if (typeof fieldSetName !== 'string') return matchingCondition;
    // TODO move this into the config service as a const
    const SERVICEPERSON_NAME_CONFIG_VARIABLE = '$servicePersonName';
    const doesIncludeKeyword = fieldSetName?.includes?.(
      SERVICEPERSON_NAME_CONFIG_VARIABLE,
    );
    if (fieldSetName && doesIncludeKeyword) {
      // replace the question title with the servicepersons name if it is in the session
      matchingCondition.fieldset.legend.text = fieldSetName.replace(
        SERVICEPERSON_NAME_CONFIG_VARIABLE,
        this.getServicepersonName(session),
      );
      return matchingCondition;
    } else return matchingCondition;
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
    if (requestBody._csrf) delete requestBody._csrf;
    session.userData = { ...(session.userData || {}), ...requestBody };
    const userProgressMap = this.getUserProgressMap(session);
    userProgressMap.set(currentStep, requestBody);

    const objectFromMap = Object.fromEntries(userProgressMap);
    session.userProgress = objectFromMap;
  }

  constructor(reflector: Reflector) {
    this.reflector = reflector;
  }

  addSessionDataToText(obj, session) {
    for (var currentKey in obj) {
      if (typeof obj[currentKey] === "object" && obj[currentKey] !== null) {
        this.addSessionDataToText(obj[currentKey], session);
      } else {
        if (typeof obj[currentKey] === 'string') {
          const regexp = new RegExp('{(.*?)}');

          if (regexp.test(obj[currentKey])) {
            obj[currentKey] = obj[currentKey].replace(
              // /\{[^\}]+\}/g,
              /\{{2}[^\}]+\}{2}/g,
              function (string) {
                const fieldNames = string
                  .split('|')
                  .map((fieldName) =>
                    fieldName.replace('{{', '').replace('}}', '').trim(),
                  );

                const sessionAnswer = fieldNames.find(
                  (currentKey) => session?.userData?.[currentKey],
                );

                const replacementText =
                  session?.userData?.[sessionAnswer] ?? fieldNames.at(-1);
                return replacementText;
              },
            );
          }

        }
      }
    }
  }


  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<IRequest>();
    const params = request.params;
    const response = ctx.getResponse<IResponse>();
    const session = request.session;
    const currentStep = params.node ?? null;
    const stepConfig = this.journeyConfig.journeySteps[currentStep];
    const userProgress = this.getUserProgressMap(session);
    const questionsOriginal = this.getQuestionData(stepConfig?.questions, request);

    const applicantType = this.getApplicantType(session);

    if (request.method === 'POST') {
      this.validateBody(currentStep, request.body).then((validationErrors) => {
        if (validationErrors.length > 0) {
          // format errors here if appropriate
          this.addErrors(request, validationErrors);
          request.gotoNext = `${ConfigService.FORM_BASE_PATH}/${currentStep}`;
        } else {
          this.updateUserSessionData({
            session,
            requestBody: request.body,
            currentStep,
          });

          const nextStep = this.determineNextStep({
            currentStep,
            userResponse: session.userData,
            session,
          });

          request.gotoNext = `${ConfigService.FORM_BASE_PATH}/${nextStep}`;
        }
      });
    }


    let questions = JSON.parse(JSON.stringify(questionsOriginal))
    // TODO use the below deep clone function for node 17+ and remove the json.parse above
    // let questions = structuredClone(questionsOriginal)
    this.addSessionDataToText(questions, session);

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
            response.redirect(
              `${ConfigService.FORM_BASE_PATH}/${firstMissingRequiredSection}`,
            );
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
    //  TODO finalise logic to allow the questions to loop for each selected service before returning to the main flow
    if (stepConfig.repeatForEach) {
      const progress = this.getUserProgressMap(session);

      const remainingBranches = this.getRemainingBranches(
        stepConfig.repeatForEach,
        Object.fromEntries(progress),
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
  ): any {
    // find the matching conditon from the config file
    const matchingCondition = Object.entries(conditions).find(
      ([, conditionValues]) =>
        // ensure all parts of the if condition match the users answers
        this.checkAllMatch(conditionValues.if, userResponses),
    )?.[0];

    return conditions[matchingCondition]?.then;
  }

  private getRemainingBranches(field: string, progress: any): string[] {
    const selectedBranches = progress['which-services']?.[field] || [];
    // TODO complete logic to update the completed branches when all the questions in the current service loop have been completed
    const completedBranches = Object.keys(progress).filter((key) => {
      // TODO fix bug where array methods fail if one checkbox has been selected and saved to the session as it is not saved as an array
      return selectedBranches.includes(key);
    });
    return selectedBranches.filter(
      (branch) => !completedBranches.includes(branch),
    );
  }

  private async validateBody(
    step: string,
    userResponse: any,
    dtoGroup?: string,
  ): Promise<any> {
    // return []
    const stepConfig = this.journeyConfig.journeySteps[step];
    if (stepConfig?.validationDTO) {
      const dtoKebab = stepConfig.validationDTO
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      const dtoPath = '../dto/' + dtoKebab + '.dto';
      const { default: dtoClass } = await import(dtoPath);
      console.log('DTO Path == ', dtoPath)
      const validationDTO = plainToInstance(dtoClass, userResponse);

      return await validate(validationDTO);
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
    try {
      response.render(`form-pages/${template}`, {
        questions: data.questions,
        node: step,
        data: data,
        userData,
        errors,
      });
    } catch (err) { }
  }
}
