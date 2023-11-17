import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import {Observable, throwError} from 'rxjs';
import { map, catchError, switchMap} from 'rxjs/operators';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {Reflector} from "@nestjs/core";
import { Response } from 'express';



@Injectable()
export class JourneyInterceptor implements NestInterceptor {
    private journeyConfig = require('./journey-config.json'); // Path to your JSON configuration
    private userProgress = new Map(); // Map to track user progress
    private reflector: Reflector;

    constructor(reflector: Reflector) {
        this.reflector = reflector;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse<Response>();
        const session = request.session;
        const currentStep = request.headers['current-step'];

        return this.validateResponse(currentStep, request.body).pipe(
            switchMap(validationResult => {
                if (validationResult.length > 0) {
                    // If validation fails, render the same step with errors
                    return this.renderStep(response, currentStep, request.body, validationResult);
                }

                // Store valid data in session and proceed
                session.userData = { ...(session.userData || {}), ...request.body };
                return next.handle();
            }),
            catchError(err => {
                // Handle and format errors
                return throwError(err);
            })
        );
    }

    private updateUserProgress(userId: string, currentStep: string, userResponse: any) {
        const progress = this.userProgress.get(userId) || {};
        progress[currentStep] = userResponse;
        this.userProgress.set(userId, progress);
    }

    private determineNextStep(userId: string, currentStep: string, userResponse: any): string {
        const stepConfig = this.journeyConfig.journeySteps[currentStep];

        switch(stepConfig.type) {
            case 'section':
                return stepConfig.nextStep;
            case 'conditional':
                return this.handleConditionalStep(userId, stepConfig, userResponse);
            case 'end':
                return null; // Journey completed
            default:
                throw new Error('Unknown step type');
        }
    }

    private handleConditionalStep(userId: string, stepConfig: any, userResponse: any): string {
        if (stepConfig.repeatForEach) {
            const progress = this.userProgress.get(userId);
            const remainingBranches = this.getRemainingBranches(stepConfig.repeatForEach, progress);

            if (remainingBranches.length > 0) {
                return stepConfig.branchDetails[remainingBranches[0]];
            }
        }
        return stepConfig.defaultNextStep;
    }

    private checkCondition(userResponse: any, condition: any): boolean {
        return Object.keys(condition).every(key => {
            return userResponse[key] && condition[key].includes(userResponse[key]);
        });
    }

    private getRemainingBranches(field: string, progress: any): string[] {
        const selectedBranches = progress['serviceBackground']?.[field] || [];
        const completedBranches = Object.keys(progress).filter(key => selectedBranches.includes(key));
        return selectedBranches.filter(branch => !completedBranches.includes(branch));
    }

    private async validateResponse(step: string, userResponse: any): Promise<any> {
        const stepConfig = this.journeyConfig.journeySteps[step];
        if (stepConfig && stepConfig.validationDTO) {
            const dtoClass = require(`./dtos/${stepConfig.validationDTO}`).default;
            const validationDTO = plainToClass(dtoClass, userResponse);
            return validate(validationDTO);
        }
        return [];
    }

    private async renderStep(response: Response, step: string, data: any, errors: any) {
        const stepConfig = this.journeyConfig.journeySteps[step];
        const template = stepConfig.template;
        const questions = stepConfig.questions;
        response.render(template, { questions, data, errors });
        return response;
    }

}
