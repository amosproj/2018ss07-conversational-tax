import { Component } from '@nestjs/common';
import * as dialogflow from 'dialogflow';
import * as fs from 'fs';

const KEYFILE_PATH = 'dialogflowKey.json';
const PROJECT_ID = 'test-c7ec0';
const SESSION_ID = 'I_am_a_ran_string';
const LANG_CODE = 'de-DE';

/**
 * A wrapper class around the dialogflow sdk.
 */
@Component()
export class DialogFlowService {
    private sessionPath: any;
    private sessionClient: any;

    constructor() {
        this.validateKeyfileExists();
        this.sessionClient = new dialogflow.SessionsClient({ keyFilename: KEYFILE_PATH});
        this.sessionPath = this.sessionClient.sessionPath(PROJECT_ID, SESSION_ID);
    }

    private validateKeyfileExists(): void {
        if (!fs.existsSync(KEYFILE_PATH)) {
            throw new Error('Credential file for DialogFlow is missing. The keyfile is expected to be named dialogflowKey.json.');
        }
    }

    /**
     * Sends a request to detect the intent to DialogFlow
     *
     * @param {string} inputText
     * The user input as a text
     *
     * @returns {Promise<DetectIntentResponse>}
     * The answer of DialogFlow's API as a Promise
     */
    public detectTextIntent(inputText: string): Promise<DetectIntentResponse> {
        const request: DetectIntentRequest = {
            queryInput: {
                text: {
                    text: inputText,
                    languageCode: LANG_CODE,
                },
            },
        };
        return this.sessionClient.detectIntent({ session: this.sessionPath, ...request });
    }

    /**
     * Sends a request to detect the intent to DialogFlow
     *
     * @param {string} encoding
     * The encoding of the audio. See DialogFlow docs
     *
     * @param {number} sampleRate
     * SampleRate of the audio
     *
     * @param {string} inputAudio
     * The user input as an base64 audio string
     *
     * @returns {Promise<DetectIntentResponse>}
     * The answer of DialogFlow's API as a Promise
     */
    public detectAudioIntent(encoding: string, sampleRate: number, inputAudio: string): Promise<DetectIntentResponse> {
        const request: DetectIntentRequest = {
            queryInput: {
                audioConfig: {
                    audioEncoding: encoding,
                    sampleRateHertz: sampleRate,
                    languageCode: LANG_CODE,
                },
            },
            inputAudio,
        };
        return this.sessionClient.detectIntent({ session: this.sessionPath, ...request });
    }
}