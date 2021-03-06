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
  Easing,
  Animated,
} from 'react-native';
import BottomMenu from '../../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, RadioButton } from 'react-native-paper';
import { CheckBox } from 'react-native-elements';
import Moment from 'moment';
import NavigationService from '../../navigation/NavigationService';

export default class PollScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('pollName', 'Poll'),
      headerStyle: {
        backgroundColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.75,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        color: 'white',
      },
      headerRight: () => (
        <TouchableOpacity onPress={navigation.getParam('toggleDrawer')}>
          <Image
            style={{
              height: 30,
              width: 30,
              marginRight: Dimensions.get('window').width * 0.05,
            }}
            source={require('assets/icons/blue_menu.png')}
          />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.moveAnimation = new Animated.ValueXY({
      x: Dimensions.get('window').width,
      y: 0,
    });
    this.state = {
      curuser: '',
      users: ['intitialize'],
      loading: true,
      curpoll: '',
      responses: ['intitialize'],
      showDetailsCard: false,
      showResultsCard: false,
      showResponsesCard: false,
      checked: [],
      single: '',
      organizer_id: '',
      timeOffset: 0,
      showDrawer: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({ toggleDrawer: this.toggleDrawer });

    const { params } = this.props.navigation.state;
    const poll_id = params.poll_id;
    var curpoll = '';

    firebase
      .database()
      .ref('polls/' + poll_id)
      .on('value', snapshot => {
        var item = snapshot.val();
        item.key = snapshot.key;
        //get the responded status of the current user
        var users = Object.values(item.users);
        var userIndex = users.findIndex(
          obj => obj.user_id === firebase.auth().currentUser.uid
        );
        if (userIndex !== -1) {
          item.responded = users[userIndex].responded;
          item.answers = users[userIndex].answers;
          item.unseen = users[userIndex].unseen;
        } else {
          item.responded = null;
          item.unseen = null;
        }
        curpoll = item;
        if (curpoll.comments === undefined) {
          curpoll.comments = 0;
        }

        const responses = Object.entries(curpoll.responses);
        var pollUsers = Object.entries(curpoll.users);

        var date = new Date();
        var timeOffset = date.getTimezoneOffset();

        if (curpoll.responded) {
          responses.sort(function(response1, response2) {
            return response2[1].votes - response1[1].votes;
          });
        }

        if (curpoll.unseen) {
          firebase
            .database()
            .ref('users/' + firebase.auth().currentUser.uid + '/polls')
            .once('value', snapshot => {
              var total_unseen = snapshot.val().total_unseen - 1;
              if (total_unseen < 0) {
                total_unseen = 0;
              }
              firebase
                .database()
                .ref('users/' + firebase.auth().currentUser.uid + '/polls')
                .child('total_unseen')
                .set(total_unseen);
            });

          var pollUsersArray = Object.values(curpoll.users);
          var pollUserIndex = pollUsersArray.findIndex(
            obj => obj.user_id === firebase.auth().currentUser.uid
          );
          pollUsersArray[pollUserIndex].unseen = false;
          users = Object.entries(pollUsersArray);
          firebase
            .database()
            .ref('polls/' + curpoll.key)
            .child('users')
            .set(pollUsersArray);
        }

        this.setState({
          curpoll: curpoll,
          responses: responses,
          users: pollUsers,
          timeOffset: timeOffset,
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
      });
  }

  switchDetailsCard() {
    if (this.state.showDetailsCard === true) {
      this.setState({ showDetailsCard: false });
    } else {
      this.setState({ showDetailsCard: true });
    }
  }

  switchResponsesCard() {
    if (this.state.showResponsesCard === true) {
      this.setState({
        showResponsesCard: false,
      });
    } else {
      this.setState({ showResponsesCard: true });
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

      var updatedPoll = '';
      pollRef.once('value', snapshot => {
        updatedPoll = snapshot.val();

        var responses = updatedPoll.responses;
        var answers = '';
        for (let i = 0; i < this.state.checked.length; i++) {
          responses[this.state.checked[i]].votes =
            responses[this.state.checked[i]].votes + 1;
          if (i < this.state.checked.length - 1) {
            answers = answers + responses[this.state.checked[i]].text + ', ';
          } else {
            answers = answers + responses[this.state.checked[i]].text;
          }
        }

        responses.sort(function(response1, response2) {
          return response2.votes - response1.votes;
        });

        //get the responded status of the current user
        var users = Object.values(this.state.curpoll.users);
        var userIndex = users.findIndex(
          obj => obj.user_id === firebase.auth().currentUser.uid
        );
        if (userIndex !== -1) {
          users[userIndex].answers = answers;
          users[userIndex].responded = true;
        }

        var pollUpdateData = {
          responses: responses,
          users: users,
          total_votes: updatedPoll.total_votes + 1,
        };

        pollRef.update(pollUpdateData);

        this.setState({
          curpoll: {
            createdAt: this.state.curpoll.createdAt,
            creator_id: this.state.curpoll.creator_id,
            creator_name: this.state.curpoll.creator_name,
            poll_type: this.state.curpoll.poll_type,
            question: this.state.curpoll.question,
            responses: responses,
            squad_id: this.state.curpoll.squad_id,
            status: this.state.curpoll.status,
            total_votes: this.state.curpoll.total_votes + 1,
            responded: true,
            users: users,
            answers: answers,
            key: this.state.curpoll.key,
            comments: this.state.curpoll.comments,
          },
          users: Object.entries(users),
          responses: Object.entries(pollUpdateData.responses),
        });

        //NavigationService.navigate('MyPollsScreen');
      });
      alert('Thanks for voting!');
      this.setState({ showDetailsCard: false });
    } else {
      alert('You need to vote for an option before submitting.');
    }
  }

  closeOpenPoll() {
    const rootRef = firebase.database().ref();
    const pollRef = rootRef.child('polls/' + this.state.curpoll.key);
    var pollUpdateData = '';
    var curpoll = '';

    if (this.state.curpoll.status === 'open') {
      pollUpdateData = {
        createdAt: this.state.curpoll.createdAt,
        creator_id: this.state.curpoll.creator_id,
        creator_name: this.state.curpoll.creator_name,
        poll_type: this.state.curpoll.poll_type,
        question: this.state.curpoll.question,
        responses: this.state.curpoll.responses,
        squad_id: this.state.curpoll.squad_id,
        status: 'closed',
        total_votes: this.state.curpoll.total_votes,
        users: this.state.curpoll.users,
        comments: this.state.curpoll.comments,
      };
      alert('You have closed this poll');
    } else {
      pollUpdateData = {
        createdAt: this.state.curpoll.createdAt,
        creator_id: this.state.curpoll.creator_id,
        creator_name: this.state.curpoll.creator_name,
        poll_type: this.state.curpoll.poll_type,
        question: this.state.curpoll.question,
        responses: this.state.curpoll.responses,
        squad_id: this.state.curpoll.squad_id,
        status: 'open',
        total_votes: this.state.curpoll.total_votes,
        users: this.state.curpoll.users,
        comments: this.state.curpoll.comments,
      };
      alert('You have reopened this poll');
    }

    pollRef.update(pollUpdateData);
    pollUpdateData.key = this.state.curpoll.key;
    this.setState({ curpoll: pollUpdateData });
    //NavigationService.navigate('MyPollsScreen');
  }

  openComments() {
    NavigationService.navigate('CommentScreen', {
      parentName: 'Poll Comments',
      parent: this.state.curpoll.key,
      comment_type: 'polls',
    });
  }

  toggleDrawer = () => {
    if (this.state.showDrawer === false) {
      this.setState({
        showDrawer: true,
      });
      Animated.spring(this.moveAnimation, {
        toValue: { x: 0, y: 0 },
      }).start();
    } else {
      this.setState({
        showDrawer: false,
      });
      Animated.spring(this.moveAnimation, {
        toValue: { x: Dimensions.get('window').width, y: 0 },
      }).start();
    }
  };

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
            this.state.showDetailsCard === false &&
            this.state.showResponsesCard === false ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <Text
                      style={[
                        styles.info,
                        {
                          marginBottom: Dimensions.get('window').height * 0.01,
                        },
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
                  </ScrollView>
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
                      <ScrollView
                        style={{
                          height: Dimensions.get('window').height * 0.45,
                          width: Dimensions.get('window').width * 0.7,
                          marginBottom: Dimensions.get('window').height * 0.025,
                          padding: 0,
                        }}>
                        <Text style={styles.detailsInfo}>
                          {this.state.curpoll.creator_name}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Creator</Text>
                        <Text style={styles.detailsInfo}>
                          {Moment(
                            this.state.curpoll.createdAt + this.state.timeOffset
                          ).format('MM/DD/YYYY, hh:mm A')}
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
                        <TouchableOpacity
                          onPress={this.openComments.bind(this)}>
                          {this.state.curpoll.comments !== 0 ? (
                            <Text style={styles.detailsInfo}>
                              Click to comment ({this.state.curpoll.comments})
                            </Text>
                          ) : (
                            <Text style={styles.detailsInfo}>
                              Click to leave the first comment
                            </Text>
                          )}
                        </TouchableOpacity>
                        <View style={styles.line} />
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
                    {this.state.showResponsesCard === true ? (
                      <React.Fragment>
                        <Card style={styles.resultsCard}>
                          <ScrollView
                            style={{
                              height: Dimensions.get('window').height * 0.45,
                              width: Dimensions.get('window').width * 0.7,
                              marginBottom:
                                Dimensions.get('window').height * 0.025,
                            }}>
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
                            <View style={styles.line} />
                            <FlatList
                              style={{
                                padding: 10,
                                textAlign: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                              }}
                              data={this.state.users}
                              extraData={this.state}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({ item }) => (
                                <React.Fragment>
                                  {item[1].answers !== undefined ? (
                                    <React.Fragment>
                                      <Text style={styles.responseInfo}>
                                        {item[1].answers}
                                      </Text>
                                      <View style={styles.line} />
                                      <Text style={styles.answersGeneric}>
                                        {item[1].user_name}
                                      </Text>
                                    </React.Fragment>
                                  ) : null}
                                </React.Fragment>
                              )}
                            />
                          </ScrollView>
                        </Card>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            onPress={this.switchResponsesCard.bind(this)}>
                            <View style={styles.customButton}>
                              <Text style={styles.buttonText}>Close List</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <Card style={styles.resultsCard}>
                          <ScrollView
                            style={{
                              height: Dimensions.get('window').height * 0.45,
                              width: Dimensions.get('window').width * 0.7,
                              marginBottom:
                                Dimensions.get('window').height * 0.025,
                            }}>
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
                                {this.state.curpoll.responded !== null ? (
                                  <React.Fragment>
                                    {this.state.curpoll.responded === true ? (
                                      <Text style={styles.pollTypeInfo}>
                                        You have completed this poll.
                                      </Text>
                                    ) : (
                                      <Text style={styles.pollTypeInfo}>
                                        This poll is closed.
                                      </Text>
                                    )}
                                    <Text style={styles.pollTypeInfo}>
                                      The poll creator or squad organizer can
                                      share the results with you.
                                    </Text>
                                    <View style={styles.line} />
                                    <Text style={styles.pollTypeInfo}>
                                      You answered: {this.state.curpoll.answers}
                                    </Text>
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment>
                                    <Text style={styles.pollTypeInfo}>
                                      You were not asked to reply to this poll.
                                    </Text>
                                    <Text style={styles.pollTypeInfo}>
                                      The poll creator or squad organizer can
                                      share the results with you.
                                    </Text>
                                  </React.Fragment>
                                )}
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
                          </ScrollView>
                        </Card>
                        <View style={styles.buttonRow}>
                          {this.state.curpoll.creator_id ===
                            firebase.auth().currentUser.uid ||
                          this.state.organizer_id ===
                            firebase.auth().currentUser.uid ? (
                            <TouchableOpacity
                              onPress={this.switchResponsesCard.bind(this)}>
                              <View style={styles.customButton}>
                                <Text style={styles.buttonText}>
                                  See Responses
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ) : null}
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
              </React.Fragment>
            )}
          </View>
        </LinearGradient>
        <Animated.View
          style={[
            {
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height * 0.8,
              position: 'absolute',
            },
            this.moveAnimation.getLayout(),
          ]}>
          <BottomMenu curuser={this.state.curuser} action={this.toggleDrawer} />
        </Animated.View>
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
    marginLeft: Dimensions.get('window').width * 0.05,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  generic: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.05,
    color: '#8F8F8F',
  },
  answersGeneric: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.025,
    marginBottom: Dimensions.get('window').height * 0.025,
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
    shadowOffset: { width: 12, height: 12 },
    shadowColor: 'black',
    shadowOpacity: 0.15,
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
    shadowOffset: { width: 4, height: 4 },
    shadowColor: 'black',
    shadowOpacity: 0.5,
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
