# Mission_7: Measure Temperature with Arduino
>Capstone Design Mission in Sogang Univ.

## Preview
![Sorry, We cannot found Img](https://raw.github.com/LamFSangUk/Capstone-Design-1/master/nodeMCU_Mission/Mission_7/_VAP_.gif "ScreenShot")

## Description
>The program to measure temperature in some place.<br />Arduino Send temperature data to your private server with http call.<br />You can heck your place's temperature in two ways.<br /><br />First, You can read data with your web-client. Just type this on your web browser's url bar.
```
[Server IP addr(or domain):3000]/dump
```
![Sorry, We cannot found Img](https://raw.github.com/LamFSangUk/Capstone-Design-1/master/nodeMCU_Mission/Mission_7/Sample.png "ScreenShot")

>Second, You can use thingspeak service to save your data. Just visit your thingspeak account.
<center><img src="https://raw.github.com/LamFSangUk/Capstone-Design-1/master/nodeMCU_Mission/Mission_7/ThingSpeak.png" align="middle" width="500"></center>

## Installation
>Just Download these code files to your local machine.You need Two files.
>* Mission_7.ino : Arduino file to run nodeMCU measuring temperature.
>* Mission_7.js : Javascript file to run webserver for saving temperature data.

## Execution
>You need Arduino Sketch and Node.js on your server.<br />Mission_7.ino Upload to your Arduino using Arduino Sketch.<br />Mission_7.js Execute on your private server. Type the following command.
```
node Mission_7.js
```
>If you want to run this program on background and to read log. Type the following command.
```
nohup node Mission_7.js
tail -f nohup.out
```
>But I recommend to use Forever tool to run node.js program on your server. To Install,
```
npm install forever
```
>To run your node.js program,
```
forever start Mission_7.js
```
>To Check your log file, (log file is created ramdomly default and saved ~/.forever/ directory)
```
forever list
```
```
tail -f ~/.forever/[your log file]
```

## Author
>SangUk Park - [LamFSangUk](https://github.com/LamFSangUk)
