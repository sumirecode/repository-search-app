import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,
    AppState,
    } from 'react-native';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
    android:
        'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});


export default class App extends React.Component <{}> {
    state = {
        items: [],
        refreshing: false,
        text: '',
    }
    page = 0;

    onPressFetch(refreshing = false) {
        const newPage = refreshing ? 1 : this.page + 1;
        fetch(`https://api.github.com/search/repositories?q=${this.state.text}&page=${newPage}`)
            .then(response => response.json())
            .then(({ items }) => {
                this.page = newPage;
                if(refreshing) {
                    this.setState({ items, refreshing: false })
                } else {
                    this.setState({ items: [...this.state.items, ...items], refreshing: false })
                }
            });
    }

    navigateToDetail(item) {
        this.props.navigation.navigate('Detail', { item });
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onChangeState)
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.onChangeState)
    }

    onChangeState = (appState) => {
        if(appState === 'active') {
            this.onPressFetch(true);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} onChangeText={(text) => this.setState({ text })}/>
                    <TouchableOpacity onPress={() => this.onPressFetch(true)}>
                        <Text style={styles.searchText}>Search</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={this.state.items}
                    renderItem={({ item }) =>
                        <TouchableOpacity style={{padding: 10}} onPress={() => this.navigateToDetail(item) }>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>{item.name}</Text>
                            <View style={{ flexDirection: 'row'}}>
                                <Image style={styles.ownerIcon}source={{ uri: item.owner.avatar_url }}/>
                                <Text style={styles.ownerName}>{item.owner.login}</Text>
                            </View>
                        </TouchableOpacity>}
                    keyExtractor={(item) => item.id}
                    onEndReached={() => this.onPressFetch()}
                    onEndReachedThreshold={0.1}
                    onRefresh={() => this.onPressFetch(true)}
                    refreshing={this.state.refreshing}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    inputWrapper: {
        padding: 20,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: 10,
        backgroundColor: '#EEE',
        borderRadius: 3,
    },
    searchText: {
        padding: 10,
    },
    ownerIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 5,
    },
    ownerName: {
        fontSize: 14
    },
});
