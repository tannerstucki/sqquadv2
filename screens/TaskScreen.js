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

export default class TaskScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('taskName', 'Task'),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      curuser: '',
      loading: true,
      curtask: '',
      users: ['intitialize'],
      showDetailsCard: false,
      showResultsCard: false,
      checked: [],
      checked_test: 'first',
      single: '',
      cursquad: '',
      showAssigneeCard: false,
    };
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const curtask = params.curtask;
    const users = Object.entries(curtask.users);

    this.setState({
      curtask: curtask,
      users: users,
    });

    var data_ref = firebase
      .database()
      .ref('users/' + firebase.auth().currentUser.uid);
    data_ref.on('value', snapshot => {
      this.setState({ curuser: snapshot.val() });
    });

    if (curtask.squad_id !== 'null') {
      var squad_ref = firebase.database().ref('squads/' + curtask.squad_id);
      squad_ref.on('value', snapshot => {
        this.setState({ cursquad: snapshot.val() });
      });
    }

    this.setState({ loading: false });
  }

  switchAssigneeCard() {
    if (this.state.showAssigneeCard === true) {
      this.setState({ showAssigneeCard: false });
    } else {
      this.setState({ showAssigneeCard: true });
    }
  }

  changeStatus(){
    /*Change the status of the task here*/
  }

  render() {
    return (
      <React.Fragment>
        <LinearGradient
          colors={['#5B4FFF', '#51FFE8']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.fill}>
            {this.state.showAssigneeCard === false ? (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <Text
                    style={[
                      styles.info,
                      { marginBottom: Dimensions.get('window').height * 0.01 },
                    ]}>
                    {this.state.curtask.title}
                  </Text>
                  <ScrollView
                    style={{
                      height: Dimensions.get('window').height * 0.45,
                      width: Dimensions.get('window').width * 0.7,
                      marginBottom: Dimensions.get('window').height * 0.025,
                    }}>
                    <Text style={styles.detailsInfo}>
                      {this.state.curtask.description}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Description</Text>
                    {this.state.users.length === 1 ? (
                      <React.Fragment>
                        <Text style={styles.detailsInfo}>
                          {this.state.users[0][1].user_name}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Assignee</Text>
                        <Text style={styles.detailsInfo}>
                          {this.state.users[0][1].status}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Status</Text>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <TouchableOpacity
                          onPress={this.switchAssigneeCard.bind(this)}>
                          <Text style={styles.detailsInfo}>
                            Click to see all assignees
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Assignee</Text>
                      </React.Fragment>
                    )}
                    <Text style={styles.detailsInfo}>
                      {this.state.curtask.creator_name}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Creator</Text>
                    <Text style={styles.detailsInfo}>
                      {new Date(
                        parseInt(this.state.curtask.createdAt)
                      ).toLocaleString('en-US', {
                        timeZone: 'America/Los_Angeles',
                      })}
                    </Text>
                    <View style={styles.line} />
                    <Text style={styles.generic}>Created At</Text>
                    {this.state.cursquad !== '' ? (
                      <React.Fragment>
                        <Text style={styles.detailsInfo}>
                          {this.state.cursquad.name}
                        </Text>
                        <View style={styles.line} />
                        <Text style={styles.generic}>Squad</Text>
                      </React.Fragment>
                    ) : null}
                  </ScrollView>
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={this.changeStatus.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Change Status</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Card style={styles.resultsCard}>
                  <Text>{this.state.users[0].user_name}</Text>
                  <FlatList
                    style={{ padding: 10 }}
                    data={this.state.users}
                    renderItem={({ item }) => (
                      <React.Fragment>
                        <Text style={styles.assigneesInfo}>{item[1].status}</Text>
                        <View style={styles.line} />
                        <Text style={styles.assigneesGeneric}>{item[1].user_name}</Text>
                      </React.Fragment>
                    )}
                  />
                </Card>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={this.switchAssigneeCard.bind(this)}>
                    <View style={styles.customButton}>
                      <Text style={styles.buttonText}>Close List</Text>
                    </View>
                  </TouchableOpacity>
                </View>
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
  taskTypeInfo: {
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
    marginLeft: Dimensions.get('window').width * 0.075,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  assigneesInfo: {
    fontSize: 18,
    marginTop: Dimensions.get('window').height * 0.04,
    marginBottom: Dimensions.get('window').height * 0.005,
    marginLeft: Dimensions.get('window').width * 0.025,
    fontWeight: 'bold',
    color: '#5B4FFF',
  },
  generic: {
    fontSize: 12,
    marginLeft: Dimensions.get('window').width * 0.075,
    color: '#8F8F8F',
  },
  assigneesGeneric: {
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
