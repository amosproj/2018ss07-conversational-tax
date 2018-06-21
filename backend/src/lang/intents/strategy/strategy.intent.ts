import { IIntentFactory } from '../factory/factory.interface';
import { IntentHandler } from '../handlers/handler.abstract';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EndDateFactory } from '../factory/factory.enddate';
import { AddStartDateFactory } from '../factory/factory.addstartdate';
import { ContextFactory } from '../factory/factory.context';
import { HelpFactory } from '../factory/factory.help';
import { CreateContractFactory } from '../factory/factory.createcontract';
import { EndDateOpenFactory } from '../factory/factory.enddateopen';

@Injectable()
export class IntentStrategy {
    private readonly intentFactories: IIntentFactory[];

    constructor(endDateFactory: EndDateFactory,
                addStartDateFactory: AddStartDateFactory,
                contextFactory: ContextFactory,
                helpFactory: HelpFactory,
                createContactFactory: CreateContractFactory,
                endDateOpenFactory: EndDateOpenFactory) {
        this.intentFactories = [endDateFactory, addStartDateFactory, contextFactory, helpFactory, createContactFactory, endDateOpenFactory];
    }

    /**
     * Gets the first IntentHandler that matches the intent
     * @param intentID The intent's ID
     */
    public createIntentHandler(intentID: string): IntentHandler{
        const intentFactory = this.intentFactories.filter((factory) => factory.appliesTo(intentID));

        if (intentFactory.length === 0) {
            throw new InternalServerErrorException('For this Intent no handler has been defined.');
        } else if (intentFactory.length > 1) {
            throw new InternalServerErrorException('More than one IntentHandler is defined for this intent');
        }

        return intentFactory[0].createIntentHandler();
    }
}