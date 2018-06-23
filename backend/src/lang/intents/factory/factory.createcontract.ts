import { IntentHandler } from './../handlers/handler.abstract';
import { CreateContractIntentHandler } from '../handlers/handler.createcontract';
import { IIntentFactory } from './factory.interface';
import { Injectable } from '@nestjs/common';
import IntentConfig from './../IntentConfig';

/**
 * A Factory to handle a specific intent
 */
@Injectable()
export class CreateContractFactory implements IIntentFactory {

    constructor(private createContractIntentHandler: CreateContractIntentHandler) {
    }

    /**
     * Gets the IntentHandler
     * @returns {IntentHandler} The IntentHandler instance
     */
    createIntentHandler(): IntentHandler {
        return this.createContractIntentHandler;
    }

    /**
     * Whether this IntentFactory applies to the intent
     * @param {string} intentID The intent's ID
     * @returns {boolean} Returns whether this factory applies
     */
    appliesTo(intentID: string): boolean {
        return (intentID === IntentConfig.INTENT_PREFIX + 'ae4cd4c7-67ea-41e3-b064-79b0a75505c5');
    }
}