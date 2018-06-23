import { IntentHandler } from './../handlers/handler.abstract';
import { ContextIntentHandler } from '../handlers/handler.context';
import { IIntentFactory } from './factory.interface';
import { Injectable } from '@nestjs/common';
import IntentConfig from './../IntentConfig';

/**
 * A Factory to handle a specific intent
 */
@Injectable()
export class ContextFactory implements IIntentFactory {

    constructor(private contextIntentHandler: ContextIntentHandler) {
    }

    /**
     * Gets the IntentHandler
     * @returns {IntentHandler} The IntentHandler instance
     */
    createIntentHandler(): IntentHandler {
        return this.contextIntentHandler;
    }

    /**
     * Whether this IntentFactory applies to the intent
     * @param {string} intentID The intent's ID
     * @returns {boolean} Returns whether this factory applies
     */
    appliesTo(intentID: string): boolean {
        return (intentID === IntentConfig.INTENT_PREFIX + '39611549-cad9-4152-9130-22ed7879e700');
    }
}