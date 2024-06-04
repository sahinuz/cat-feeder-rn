# Cat Feeder IoT Application

This is a React Native application designed to interact with an ESP8266 microcontroller and ThingSpeak IoT platform to control a cat food dispenser. The application connects to the ESP8266 to submit WiFi credentials and check the server status. It also retrieves data from ThingSpeak to determine if the device is online.

## Features

- Check device status through ThingSpeak API.
- Submit WiFi credentials to the ESP8266.
- Send a timestamp to ThingSpeak to record feeding times.
- User-friendly interface for entering WiFi credentials and interacting with the device.

## **Screenshots**

Enter Credentials Screen |  Home Screen
:--------------------:|:--------------------:
<img src="https://i.hizliresim.com/5127szj.jpeg" width="80%" height="%80">  |  <img src="https://i.hizliresim.com/celhy73.jpeg" width="80%" height="%80">

## Prerequisites

- React Native development environment
- An ESP8266 microcontroller set up to accept WiFi credentials and communicate with ThingSpeak
- ThingSpeak account with an API key and channel ID

### Configuration

1. Open the `HomeScreen.js` file and update the following constants with your own values:
    ```javascript
    const ESP8266_IP = '192.168.4.1'; // IP address of your ESP8266
    const THINGSPEAK_API_KEY = 'YOUR_THINGSPEAK_READ_API_KEY'; // ThingSpeak read API key
    const THINGSPEAK_WRITE_API_KEY = 'YOUR_THINGSPEAK_WRITE_API_KEY'; // ThingSpeak write API key
    const YOUR_CHANNEL_ID = 'YOUR_THINGSPEAK_CHANNEL_ID'; // ThingSpeak channel ID
    ```

### Running the Application

1. Start the React Native application:
    ```bash
    npx react-native run-android
    # or
    npx react-native run-ios
    ```

2. Follow the on-screen instructions to enter your WiFi credentials and interact with the device.
