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
  TextInput,
  FlatList,
} from 'react-native';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { default as UUID } from 'uuid';
import NavigationService from '../navigation/NavigationService';

export default class CreatePollScreen extends React.Component {
  static navigationOptions = {
    title: 'New Poll',
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      question: '',
      poll_type: 'Single Response',
      responses: [],
      squads: [],
      noSquads: false,
      selectedSquad: { name: 'Choose Squad' },
      switchCardShow: false,
      responseCardShow: false,
      curresponse: '',
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const squads = params.squads;

    if (squads.length !== 0) {
      if (squads.length === 1) {
        this.setState({ squads: squads, selectedSquad: squads[0] });
      } else {
        this.setState({ squads: squads });
      }
    } else {
      this.setState({ noSquads: true });
    }

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val(), loading: false });
    });
  }

  togglePollType() {
    if (this.state.poll_type === 'Single Response') {
      this.setState({ poll_type: 'Multiple Response' });
    } else {
      this.setState({ poll_type: 'Single Response' });
    }
  }

  switchSelectedSquad() {
    if (this.state.noSquads === true) {
      alert('Sorry, you have no squads. Join or create one to get started!');
    } else {
      if (this.state.squads.length === 1) {
        alert('This is your only squad.');
      } else {
        this.setState({ switchCardShow: true });
      }
    }
  }

  chooseSquad(item) {
    this.setState({
      selectedSquad: item,
      switchCardShow: false,
    });
  }

  toggleResponseCard() {
    if (this.state.responseCardShow === false) {
      this.setState({
        responseCardShow: true,
      });
    } else {
      this.setState({
        responseCardShow: false,
        curresponse: '',
      });
    }
  }

  addResponse() {
    var responses = this.state.responses;
    responses.push({ text: this.state.curresponse.trim(), votes: 0 });
    this.setState({
      responses: responses,
      curresponse: '',
      responseCardShow: false,
    });
  }

  onCreatePress() {
    var poll_type = '';
    if (this.state.poll_type === 'Single Response') {
      poll_type = 'single';
    } else {
      poll_type = 'multiple';
    }

    var poll_post = firebase
      .database()
      .ref('polls/')
      .push({
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        creator_id: firebase.auth().currentUser.uid,
        creator_name:
          this.state.curuser.first_name + ' ' + this.state.curuser.last_name,
        poll_type: poll_type,
        question: this.state.question.trim(),
        responses: this.state.responses,
        squad_id: this.state.selectedSquad.key,
        status: 'open',
        total_votes: 0,
      })
      .then(snapshot => {
        var poll_id = snapshot.key;

        firebase
          .database()
          .ref('squads/' + this.state.selectedSquad.key)
          .child('users')
          .on('value', snapshot => {
            snapshot.forEach(snapshot => {
              firebase
                .database()
                .ref('users/' + snapshot.val().user_id)
                .child('polls')
                .push({
                  poll_id: poll_id,
                  responded: false,
                });
            });
          });

        firebase
          .database()
          .ref('threads')
          .orderByChild('squad_id')
          .equalTo(this.state.selectedSquad.key)
          .once('value', snapshot => {
            firebase
              .database()
              .ref('messages/')
              .push({
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                text:
                  this.state.curuser.first_name +
                  ' ' +
                  this.state.curuser.last_name +
                  ' has opened a new poll: "' +
                  this.state.question.trim() +
                  '" Long hold this message to vote.',
                thread: Object.keys(snapshot.val())[0],
                user: {
                  _id: 'rIjWNJh2YuU0glyJbY9HgkeYwjf1',
                  name: 'Virtual Manager',
                },
                extra_info: 'poll',
                extra_id: poll_id,
              });
          });
      });

    NavigationService.navigate('MyPollsScreen');
    alert('Your poll has been created!');
  }

  render() {
    var isEnabled = 'false';
    var text_color = 'grey';
    if ((this.state.responses.length > 0) & (this.state.question.length > 0)) {
      isEnabled = '';
      text_color = 'white';
    }

    var isOkEnabled = 'false';
    var ok_text_color = 'grey';
    if (this.state.curresponse.length > 0) {
      isOkEnabled = '';
      ok_text_color = '#5B4FFF';
    }

    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#D616CF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            {this.state.loading ? (
              <React.Fragment>
                <Text style={styles.info}>Loading</Text>
                <ActivityIndicator size="large" color="white" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {this.state.noSquads !== true &&
                this.state.switchCardShow === false &&
                this.state.responseCardShow === false ? (
                  <React.Fragment>
                    <TextInput
                      style={styles.question_input}
                      placeholder="Question"
                      placeholderTextColor="#F4F4F4"
                      multiline
                      blurOnSubmit
                      onChangeText={question => this.setState({ question })}
                      value={this.state.question}
                    />
                    <TouchableOpacity onPress={this.togglePollType.bind(this)}>
                      <Text style={styles.info}>{this.state.poll_type}</Text>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <TouchableOpacity
                      onPress={this.switchSelectedSquad.bind(this)}>
                      <Text style={styles.info}>
                        {this.state.selectedSquad.name}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.line} />
                    <Text style={[styles.info, { fontWeight: 'bold' }]}>
                      Responses:
                    </Text>
                    {this.state.responses.length === 0 ? (
                      <Text style={styles.noSquads}>
                        Add responses with the button below!
                      </Text>
                    ) : null}
                    <FlatList
                      style={{ padding: 10 }}
                      data={this.state.responses}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.info]}>{item.text}</Text>
                          </View>
                          <View style={styles.line} />
                        </React.Fragment>
                      )}
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={this.onCreatePress.bind(this)}
                        disabled={isEnabled}>
                        <View style={styles.customButton}>
                          <Text
                            style={[styles.buttonText, { color: text_color }]}>
                            Create Poll
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={this.toggleResponseCard.bind(this)}>
                        <View style={styles.customButton}>
                          <Text style={styles.buttonText}>Add Response</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ) : null}
                {this.state.noSquads === true ? (
                  <React.Fragment>
                    <Text style={styles.noSquads}>
                      Sorry, you have no squads.
                    </Text>
                    <Text style={styles.noSquads}>
                      Polls must be associated with a squad. Create a squad and
                      start sending polls!
                    </Text>
                  </React.Fragment>
                ) : null}
                {this.state.switchCardShow === true ? (
                  <Card style={[styles.resultsCard, {}]}>
                    <FlatList
                      style={{ padding: 10 }}
                      data={this.state.squads}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <React.Fragment>
                          <TouchableOpacity
                            onPress={this.chooseSquad.bind(this, item)}>
                            <Text style={styles.card_info}>{item.name}</Text>
                          </TouchableOpacity>
                          <View style={styles.card_line} />
                        </React.Fragment>
                      )}
                    />
                  </Card>
                ) : null}
                {this.state.responseCardShow === true ? (
                  <React.Fragment>
                    <Card
                      style={[
                        styles.resultsCard,
                        {
                          marginLeft: Dimensions.get('window').width * 0.05,
                          marginTop: Dimensions.get('window').height * 0.125,
                        },
                      ]}>
                      <TextInput
                        style={styles.response_input}
                        placeholder="Response"
                        placeholderTextColor="#B8B8B8"
                        multiline
                        blurOnSubmit
                        onChangeText={curresponse =>
                          this.setState({ curresponse })
                        }
                        value={this.state.curresponse}
                      />
                      <View style={styles.buttonRow}>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.2,
                            textAlign: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={this.addResponse.bind(this)}
                            disabled={isOkEnabled}>
                            <Text
                              style={[
                                styles.info,
                                {
                                  color: ok_text_color,
                                  paddingLeft: 0,
                                  fontWeight: 'bold',
                                },
                              ]}>
                              Ok
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.2,
                            textAlign: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={this.toggleResponseCard.bind(this)}>
                            <Text
                              style={[
                                styles.info,
                                {
                                  color: '#5B4FFF',
                                  paddingLeft: 0,
                                  fontWeight: 'bold',
                                },
                              ]}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  </React.Fragment>
                ) : null}
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
    paddingTop: 16,
    paddingLeft: Dimensions.get('window').width * 0.125,
    color: 'white',
  },
  card_info: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#5B4FFF',
  },
  fill: {
    height: Dimensions.get('window').height * 0.8,
    paddingTop: Dimensions.get('window').height * 0.05,
    alignContent: 'center',
  },
  question_input: {
    height: Dimensions.get('window').height * 0.06,
    width: Dimensions.get('window').width * 0.8,
    borderWidth: 1,
    margin: 10,
    padding: 10,
    alignSelf: 'center',
    borderBottomColor: 'white',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    color: 'white',
    fontSize: 18,
  },
  response_input: {
    height: Dimensions.get('window').height * 0.05,
    width: Dimensions.get('window').width * 0.6,
    borderWidth: 1,
    margin: 10,
    padding: 10,
    alignSelf: 'center',
    borderBottomColor: '#5B4FFF',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    color: '#5B4FFF',
    fontSize: 18,
    marginTop: Dimensions.get('window').height * 0.1,
  },
  line: {
    backgroundColor: 'white',
    height: 1,
    alignSelf: 'center',
    margin: 10,
    width: Dimensions.get('window').width * 0.8,
  },
  card_line: {
    backgroundColor: '#5B4FFF',
    height: 1,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
    width: Dimensions.get('window').width * 0.6,
  },
  resultsCard: {
    width: Dimensions.get('window').width * 0.75,
    height: Dimensions.get('window').height * 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
    margin: Dimensions.get('window').height * 0.15,
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
    marginHorizontal: Dimensions.get('window').width * 0.05,
  },
  buttonRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
    marginBottom: Dimensions.get('window').height * 0.05,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noSquads: {
    fontSize: 20,
    padding: 10,
    marginLeft: Dimensions.get('window').width * 0.045,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
});
