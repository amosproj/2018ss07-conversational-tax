import React, { Component } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableHighlight
} from 'react-native';
import autobind from 'autobind-decorator';
import Expo, { Audio, Permissions, FileSystem } from 'expo';
import { isUndefined } from 'util';

interface IProps {
}

export default class Microphone extends Component<IProps> {

    // Private attributes
        // Status of the recording permissions - false for no permissions, true for permissions
        private recordingPermissions: boolean;
        // Recording object
        private recordingObject: Audio.Recording;
        // Recording status - true for recording, false for no recording 
        private recordingStatus: boolean;
        // Is the button being pressed - true is pressed, false is not pressed
        private buttonPressed: boolean;

    // Main constructor of the Microphone button
    constructor(props: any) {
        super(props);

        // Recording object is generated on the fly
        this.recordingObject = null;

        // There is no recording going on at the beginning
        this.recordingStatus = false;

        // Button is not pressed by default
        this.buttonPressed = false;

        // Ask for recording permissions for the first time
        this.askForPermissions();

    }

    // Rendering function of React Native
    public render() {
        return (
            <View style={styles.view}>
                <TouchableWithoutFeedback 
                    onPressIn={this.onPressIn} 
                    onPressOut={this.onPressOut}
                    >
                    <View style={this.buttonPressed ? styles.circlePressed : styles.circle}>
                        <Ionicons name="md-mic" size={75} color="#000" />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }

    // Recording is in need of seperate permissions - This function asks for them
    @autobind
    private async askForPermissions()
    {
        const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);

        if(response.status == 'granted')
        {
            this.recordingPermissions = true;
        }
    }

    // Handler for the PressIn Event on the Microphone button
    // Starts a new recording (if there is no unfinisched other recording)
    @autobind
    private async onPressIn() {
        console.log('In');

        // If there are no recording permissions ask for them before recording
        if(this.recordingPermissions == false)
        {
            this.askForPermissions();
        }

        // Button is started to being pressed
        this.buttonPressed = true;
        this.render();

        // Check whether there is an recording being processed at the moment or not
        if(this.recordingStatus) {

            // No action should be triggered while an other recording is being processed

        } else {

            // Custom audio settings for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            });

            // Create a new object
            let recording = new Audio.Recording();
        
            // Expo Audio requires to prepare before recording audio
            await recording.prepareToRecordAsync(JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY)));

            // Send status updates to recordingStatusUpdate()
            recording.setOnRecordingStatusUpdate(this.recordingStatusUpdate);

            // Save object into class attributes
            this.recordingObject = recording;

            // Start recording audio
            await this.recordingObject.startAsync();

        }
    }

    // Handler for the PressOut Event on the Microphone button
    // Stops a new recording (It might take some time for the recording to be processed)
    @autobind
    private async onPressOut() {
        console.log(`Out`);

        // Button is not pressed any more
        this.buttonPressed = false;
        this.render();

        // Stop the recording
        try {

            // Finish the recording
            // We still have to wait for some time till the recording is processed after that
            // RecordingStatusUpdate() is meant to handle the finished recording
            await this.recordingObject.stopAndUnloadAsync();

        } catch (error) {

            // Do nothing -- we are already unloaded.

        }         
    }

    // Handler for a status change at the recording
    // Is called several times, but is used to process the finished recording
    @autobind
    private async recordingStatusUpdate() {
        // Get current status of the recording
        var status = await this.recordingObject.getStatusAsync();

        if (status.isDoneRecording && this.recordingStatus) {

            // Print the file path to the recording und other information
            var info = await FileSystem.getInfoAsync(this.recordingObject.getURI());
            console.log(`Info: ${JSON.stringify(info)}`);

            // Custom settings for the output
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                playsInSilentLockedModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            });

            // Create the final sound
            const { sound, state } = await this.recordingObject.createNewLoadedSound(
                {
                    isLooping: false,
                    isMuted: false,
                    volume: 1.0,
                    rate: 1.0,
                    shouldCorrectPitch: true,
                },
                true
            ); 

            // Set the recording status to false again and clean up the objects
            if (this.recordingObject !== null) {
                this.recordingObject.setOnRecordingStatusUpdate(null);
                this.recordingObject = null;
            }

            this.recordingStatus = false;
        }
    }
}

const styles = StyleSheet.create({
    view: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    circle: {
        borderRadius: 75,
        width: 150,
        height: 150,
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ddd',
    },
    circlePressed: {
        borderRadius: 75,
        width: 150,
        height: 150,
        paddingTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#999',
    }
});