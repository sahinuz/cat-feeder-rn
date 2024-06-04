import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import { NetworkInfo } from 'react-native-network-info';

const ESP8266_IP = '192.168.4.1'; 
const THINGSPEAK_API_KEY = 'YOUR_THINGSPEAK_READ_API_KEY'; 
const THINGSPEAK_WRITE_API_KEY = 'YOUR_THINGSPEAK_WRITE_API_KEY'; 
const YOUR_CHANNEL_ID = 'YOUR_THINGSPEAK_CHANNEL_ID';

const HomeScreen = ({ ...props }) => {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [serverRunning, setServerRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deviceOnline, setDeviceOnline] = useState(false);

    useEffect(() => {
        checkThingSpeakChannel();
    }, []);

    const checkThingSpeakChannel = async () => {
        console.log("checkThingSpeakChannel Device online: ", deviceOnline);
            setLoading(true);

            try {
                const response = await fetch(`https://api.thingspeak.com/channels/${YOUR_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=1`);
                const data = await response.json();
                const lastEntry = data.feeds[0];
                const lastUpdatedField = parseInt(lastEntry.field2, 10); 
                const lastUpdated = new Date(lastUpdatedField * 1000); 
                const now = new Date();
                const timeDiff = Math.abs(now - lastUpdated) / 60000; 

                if (timeDiff < 2) {
                    setDeviceOnline(true);
                } else {
                    setDeviceOnline(false);
                    const checkWifi = await checkWiFiSSID();
                    if (checkWifi) {
                        checkServerStatus();
                    } else {
                        Alert.alert(
                            "Connect to CatFeeder",
                            "Please connect to the CatFeeder network and try again.",
                            [
                                { text: "OK", onPress: () => checkThingSpeakChannel() }
                            ]
                        );
                    }
                }
            } catch (error) {
                console.error("Error connecting to ThingSpeak:", error);
                const checkWifi = await checkWiFiSSID();
                if (checkWifi) {
                    checkServerStatus();
                } 
            } finally {
                setLoading(false);
            }
        
    };

    const checkWiFiSSID = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "This app needs access to your location to get the Wi-Fi SSID",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    const ssid = await NetworkInfo.getSSID();
                    console.log("SSID: ", ssid);
                    if (ssid === 'CatFeeder') {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    console.log("Location permission denied");
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            const ssid = await NetworkInfo.getSSID();
            console.log("SSID: ", ssid);
            if (ssid === 'CatFeeder') {
                return true;
            } else {
                return false;
            }
        }

        return false;
    };

    const checkServerStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://${ESP8266_IP}`);
            if (response.status === 200) {
                console.log("Server is running.");
                setServerRunning(true);
            } else {
                setServerRunning(false);
                console.error(`Server responded with status: ${response.status}`);
            }
        } catch (error) {
            setServerRunning(false);
            console.error("Error connecting to server:", error);
        } finally {
            setLoading(false);
        }
    };

    const submitCredentials = async () => {
        try {
            const response = await fetch(`http://${ESP8266_IP}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `ssid=${ssid}&password=${password}`
            });
            if (response.ok) {
                Alert.alert("Success", "Credentials saved successfully.");
                setDeviceOnline(true);
                console.log("Device set online: ", true);
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                    checkThingSpeakChannel();
                }, 60000);
            } else {
                Alert.alert("Error", `Failed to save credentials. Server responded with status: ${response.status}`);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to save credentials. Error: " + error.message);
        }
    };

    const sendTimestampToThingSpeak = async () => {
        try {
            const currentTimestamp = Math.floor(Date.now() / 1000); 
            const response = await fetch(`https://api.thingspeak.com/update?api_key=${THINGSPEAK_WRITE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `field1=${currentTimestamp}`
            });
            if (response.ok) {
                Alert.alert("Success", "Timestamp sent successfully.");
            } else {
                Alert.alert("Error", `Failed to send timestamp. Server responded with status: ${response.status}`);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to send timestamp. Error: " + error.message);
        }
    };
    

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#1E90FF" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!serverRunning && !deviceOnline) {
        return (
            <View style={styles.centeredContainer}>
                <Text>Server is not running. Please check your ESP8266 setup.</Text>
            </View>
        );
    }

    if (!deviceOnline) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Enter WiFi Credentials</Text>
                <TextInput
                    placeholder="SSID"
                    placeholderTextColor={'#ccc'}
                    value={ssid}
                    onChangeText={setSsid}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor={'#ccc'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />
                <TouchableOpacity style={styles.button} onPress={submitCredentials}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
         <View style={styles.centeredContainer}>
          <Text style={styles.text}>Device is online.</Text>
          
          <TouchableOpacity style={styles.button} onPress={sendTimestampToThingSpeak}>
              <Text style={styles.buttonText}>Feed Cat</Text>
          </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    text:{
        fontSize: 20,
        marginBottom: 20,
        color: '#333',
    }
    ,
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    button: {
        width: '80%',
        padding: 15,
        backgroundColor: '#1E90FF',
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomeScreen;