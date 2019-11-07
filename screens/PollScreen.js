import React from 'react';
import * as firebase from 'firebase';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import NavigationService from '../navigation/NavigationService';

export default class PollScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('pollName', 'Poll'),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      curpoll: '',
      responses: [],
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const curpoll = params.curpoll;
    var responses = [];

    for (let i = 0; i < Object.keys(curpoll.responses).length; i++){
      responses.push(Object.values(curpoll.responses)[i])
    }

    this.setState({
      curpoll: curpoll,
      responses: responses,
    });

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });
    this.setState({ loading: false });
  }

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#51FFE8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            <Card style={styles.resultsCard}>
              <Text style={styles.info}>{this.state.curpoll.question}</Text>
              <View style={styles.line} />
              {/*<FlatList
                style={{ padding: 10 }}
                data={this.state.responses}
                renderItem={({ item }) => (
                  <React.Fragment>
                    console.log(item);
                    <Text style={styles.info}>{item}</Text>
                    <View style={styles.line} />
                  </React.Fragment>
                )}
              />*/}
            </Card>
          </View>
        </LinearGradient>
        <BottomMenu curuser={this.state.curuser} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  info: {
    fontSize: 15,
    marginVertical: Dimensions.get('window').height * 0.02,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: '#5B4FFF',
    textAlign: 'center',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
  },
});
