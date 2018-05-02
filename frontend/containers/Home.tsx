import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';
import Logo from '../components/Logo';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import globalStyles from '../global_styles';

interface IProps {
  navigation: any
}

export default class Home extends Component<IProps> {

  public render() {
    return (
      <View style={globalStyles.container}>
        <TopBar navigation={this.props.navigation} />
        <View style={globalStyles.content}>
          <Text style={styles.welcome}>
            Home
          </Text>
        </View>
        <BottomBar />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
