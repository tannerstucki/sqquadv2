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
import { CheckBox } from 'react-native-elements';
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
      showResultsCard: false,
      checked: [],
      checked_test: 'first',
      single: '',
      organizer_id: '',
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const curpoll = params.curpoll;
    const responses = Object.entries(curpoll.responses);

    if (curpoll.responded) {
      responses.sort(function(response1, response2) {
        return response1[1].votes < response2[1].votes;
      });
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

    var squad_ref = firebase.database().ref('squads/' + curpoll.squad_id);
    squad_ref.on('value', snapshot => {
      this.setState({ organizer_id: snapshot.val().organizer_id });
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

  radioClick(item) {
    if (this.state.curpoll.poll_type === 'single') {
      this.state.checked.splice(
        this.state.checked.findIndex(element => element === item[0]),
        1,
        item[0]
      );
    } else {
      if (this.state.checked.findIndex(element => element === item[0]) !== -1) {
        this.state.checked.splice(
          this.state.checked.findIndex(element => element === item[0]),
          1
        );
      } else {
        this.state.checked.unshift(item[0]);
      }
    }
    this.setState({ showDetailsCard: false });
  }

  onSubmit() {
    if (this.state.checked.length > 0) {
      const rootRef = firebase.database().ref();
      const pollRef = rootRef.child('polls/' + this.state.curpoll.key);
      const userRef = rootRef
        .child('users/' + firebase.auth().currentUser.uid)
        .child('polls/' + this.state.curpoll.key);
      var userUpdateData = {
        responded: true,
      };
      var updatedPoll = '';

      pollRef.on('value', snapshot => {
        updatedPoll = snapshot.val();
      });

      var responses = updatedPoll.responses;
      for (let i = 0; i < this.state.checked.length; i++) {
        responses[this.state.checked[i]].votes =
          responses[this.state.checked[i]].votes + 1;
      }

      var pollUpdateDate = {
        createdAt: updatedPoll.createdAt,
        creator_id: updatedPoll.creator_id,
        creator_name: updatedPoll.creator_name,
        poll_type: updatedPoll.poll_type,
        question: updatedPoll.question,
        responses: responses,
        squad_id: updatedPoll.squad_id,
        status: updatedPoll.status,
        total_votes: updatedPoll.total_votes + 1,
      };

      userRef.update(userUpdateData);
      pollRef.update(pollUpdateDate);
      NavigationService.navigate('MyPollsScreen');
      alert('Thanks for voting!');
    } else {
      alert('You need to vote for an option before submitting.');
    }
  }

  closeOpenPoll() {
    const rootRef = firebase.database().ref();
    const pollRef = rootRef.child('polls/' + this.state.curpoll.key);
    var pollUpdateDate = '';

    if (this.state.curpoll.status === 'open') {
      pollUpdateDate = {
        createdAt: this.state.curpoll.createdAt,
        creator_id: this.state.curpoll.creator_id,
        creator_name: this.state.curpoll.creator_name,
        poll_type: this.state.curpoll.poll_type,
        question: this.state.curpoll.question,
        responses: this.state.curpoll.responses,
        squad_id: this.state.curpoll.squad_id,
        status: 'closed',
        total_votes: this.state.curpoll.total_votes,
      };
      alert('You have closed this poll');
    } else {
      pollUpdateDate = {
        createdAt: this.state.curpoll.createdAt,
        creator_id: this.state.curpoll.creator_id,
        creator_name: this.state.curpoll.creator_name,
        poll_type: this.state.curpoll.poll_type,
        question: this.state.curpoll.question,
        responses: this.state.curpoll.responses,
        squad_id: this.state.curpoll.squad_id,
        status: 'open',
        total_votes: this.state.curpoll.total_votes,
      };
      alert('You have reopened this poll');
    }

    pollRef.update(pollUpdateDate);
    NavigationService.navigate('MyPollsScreen');
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
                  <Text
                    style={[
                      styles.info,
                      { marginBottom: Dimensions.get('window').height * 0.01 },
                    ]}>
                    {this.state.curpoll.question}
                  </Text>
                  <Text style={styles.pollTypeInfo}>
                    {this.state.curpoll.poll_type} response question
                  </Text>
                  <View style={styles.line} />
                  <FlatList
                    style={{ padding: 10 }}
                    extraData={this.state.checked}
                    data={this.state.responses}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <React.Fragment>
                        <TouchableOpacity
                          onPress={this.radioClick.bind(this, item)}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <RadioButton
                              onPress={this.radioClick.bind(this, item)}
                              color="#5B4FFF"
                              value={item[0]}
                              status={
                                this.state.checked.findIndex(
                                  element => element === item[0]
                                ) !== -1
                                  ? 'checked'
                                  : 'unchecked'
                              }
                            />
                            <Text style={styles.responseInfo}>
                              {item[1].text}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <View style={styles.greyLine} />
                      </React.Fragment>
                    )}
                  />
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={this.onSubmit.bind(this)}>
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
                        firebase.auth().currentUser.uid ||
                      this.state.organizer_id ===
                        firebase.auth().currentUser.uid ? (
                        <TouchableOpacity
                          onPress={this.closeOpenPoll.bind(this)}>
                          <View style={styles.customButton}>
                            {this.state.curpoll.status === 'open' ? (
                              <Text style={styles.buttonText}>Close Poll</Text>
                            ) : (
                              <Text style={styles.buttonText}>Reopen Poll</Text>
                            )}
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
                  <React.Fragment>
                    <Card style={styles.resultsCard}>
                      <Text
                        style={[
                          styles.info,
                          {
                            marginBottom:
                              Dimensions.get('window').height * 0.01,
                          },
                        ]}>
                        {this.state.curpoll.question}
                      </Text>
                      {this.state.curpoll.creator_id ===
                        firebase.auth().currentUser.uid ||
                      this.state.organizer_id ===
                        firebase.auth().currentUser.uid ? (
                        <Text style={styles.pollTypeInfo}>Results</Text>
                      ) : (
                        <React.Fragment>
                          <Text style={styles.pollTypeInfo}>
                            You have completed this poll.
                          </Text>
                          <Text style={styles.pollTypeInfo}>
                            The poll creator or squad organizer can share the
                            results with you.
                          </Text>
                        </React.Fragment>
                      )}
                      <View style={styles.line} />
                      <FlatList
                        style={{ padding: 10 }}
                        extraData={this.state}
                        data={this.state.responses}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <React.Fragment>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              {this.state.curpoll.creator_id ===
                                firebase.auth().currentUser.uid ||
                              this.state.organizer_id ===
                                firebase.auth().currentUser.uid ? (
                                <Text style={styles.responseInfo}>
                                  {item[1].text}: {item[1].votes} Votes
                                </Text>
                              ) : (
                                <Text style={styles.responseInfo}>
                                  {item[1].text}
                                </Text>
                              )}
                            </View>
                            <View style={styles.greyLine} />
                          </React.Fragment>
                        )}
                      />
                    </Card>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={this.switchDetailsCard.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>See Details</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
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
  pollTypeInfo: {
    color: '#5B4FFF',
    textAlign: 'center',
    textAlignVertical: 'bottom',
  },
  responseInfo: {
    fontSize: 18,
    marginVertical: Dimensions.get('window').height * 0.01,
    marginLeft: Dimensions.get('window').width * 0.025,
    color: '#5B4FFF',
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
    width: Dimensions.get('window').width * 0.6,
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
