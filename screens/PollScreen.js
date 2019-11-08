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
  ScrollView,
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
      responses: ['intitialize'],
      showDetailsCard: false,
      checked: '',
      checked_test: 'first',
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const curpoll = params.curpoll;
    const responses = params.responses;

    this.setState({
      curpoll: curpoll,
      responses: Object.entries(curpoll.responses),
    });

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });
    this.setState({ loading: false });
  }

  switchDetailsCard() {
    if (this.state.showDetailsCard === true) {
      this.setState({ showDetailsCard: false });
    } else {
      this.setState({ showDetailsCard: true });
    }
  }

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#51FFE8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            {this.state.curpoll.status === 'open' &&
            this.state.curpoll.responded === false &&
            this.state.showDetailsCard === false ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <Text style={styles.info}>{this.state.curpoll.question}</Text>
                  <View style={styles.line} />
                  <FlatList
                    style={{ padding: 10 }}
                    data={this.state.responses}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <React.Fragment>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignContent: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            paddingBottom: 10,
                          }}>
                          <RadioButton
                            onPress={() => {
                              this.setState({ checked: item[0] });
                            }}
                            color="#5B4FFF"
                            value={item[0]}
                            status={
                              this.state.checked === item[0]
                                ? 'checked'
                                : 'unchecked'
                            }
                          />
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({ checked: item[0] });
                            }}>
                            <Text style={styles.responseInfo}>{item[1].text}</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.greyLine} />
                      </React.Fragment>
                    )}
                  />
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Submit</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.switchDetailsCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>See Details</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {this.state.showDetailsCard ? (
                  <React.Fragment>
                    <Card style={styles.resultsCard}>
                      <ScrollView>
                        <Text style={styles.detailsInfo}>
                          {this.state.curpoll.creator_name}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Creator</Text>
                        <Text style={styles.detailsInfo}>
                          {new Date(
                            parseInt(this.state.curpoll.createdAt)
                          ).toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Created At</Text>
                        <Text style={styles.detailsInfo}>
                          {this.state.curpoll.status}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Status</Text>
                        <Text style={styles.detailsInfo}>
                          {this.state.curpoll.total_votes}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Number of Responses</Text>
                      </ScrollView>
                    </Card>
                    <View style={styles.buttonRow}>
                      {this.state.curpoll.creator_id ===
                      firebase.auth().currentUser.uid ? (
                        <TouchableOpacity>
                          <View style={styles.customButton}>
                            <Text style={styles.buttonText}>Close Poll</Text>
                          </View>
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        onPress={this.switchDetailsCard.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>Close Details</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ) : (
                  <Text>Poll Closed/Responded.</Text>
                )}
              </React.Fragment>
            )}
          </View>
        </LinearGradient>
        <BottomMenu curuser={this.state.curuser} />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  info: {
    fontSize: 18,
    marginVertical: Dimensions.get('window').height * 0.02,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: '#5B4FFF',
    textAlign: 'center',
    textAlignVertical: 'bottom',
  },
  responseInfo: {
    fontSize: 18,
    marginVertical: Dimensions.get('window').height * 0.01,
    paddingHorizontal: 15,
    fontWeight: 'bold',
    color: '#5B4FFF',
    textAlign: 'center',
    textAlignVertical: 'bottom',
  },
  detailsInfo: {
    fontSize: 18,
    marginTop: Dimensions.get('window').height * 0.04,
    marginBottom: Dimensions.get('window').height * 0.005,
    marginLeft: Dimensions.get('window').width * 0.025,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  generic: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.025,
    color: '#8F8F8F',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.55,
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
  greyLine: {
    backgroundColor: '#B8B8B8',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.4,
  },
  customButton: {
    backgroundColor: 'black',
    width: Dimensions.get('window').width * 0.375,
    height: Dimensions.get('window').height * 0.075,
    borderRadius: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Dimensions.get('window').height * 0.05,
    marginBottom: Dimensions.get('window').height * -0.01,
    marginHorizontal: Dimensions.get('window').width * 0.05,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
    marginBottom: Dimensions.get('window').height * -0.005,
  },
});
