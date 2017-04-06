#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS D4   

const char* host = "api.thingspeak.com";
const char* private_server = "163.239.78.71:3000";
String url = "/update?api_key=A3TRZ5PA6YSSRLHR";   // Your Own Key here
const int httpPort = 80;
int interval = 60000;

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>

const char* ssid     = "ReleaseWifi";
const char* password = "10161016";

/********************************************************************/
// Setup a oneWire instance to communicate with any OneWire devices  
// (not just Maxim/Dallas temperature ICs) 
OneWire oneWire(ONE_WIRE_BUS); 

/********************************************************************/
// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);
/********************************************************************/ 

String working() { 
  double temperature;
  
  Serial.print(" Requesting temperatures..."); 
  sensors.requestTemperatures(); // Send the command to get temperature readings 
  Serial.println("DONE"); 

/********************************************************************/
 Serial.print("Temperature is: "); 
 temperature=sensors.getTempCByIndex(0);
 Serial.println(temperature); // Why "byIndex"?  
   // You can have more than one DS18B20 on the same bus.  
   // 0 refers to the first IC on the wire 
  return String(temperature);
}

void delivering(String payload) { 
  WiFiClient client;
  Serial.print("connecting to ");
  Serial.println(host);
  if (!client.connect(host, httpPort)) {
    Serial.print("connection failed: ");
    Serial.println(payload);
    return;
  }
  String getheader = "GET "+ String(url) +"&field1="+ String(payload) +" HTTP/1.1";
  client.println(getheader);
  client.println("User-Agent: ESP8266 Sang Uk");  
  client.println("Host: " + String(host));  
  client.println("Connection: close");  
  client.println();

  Serial.println(getheader);
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
  }

  if(!client.connect(private_server,httpPort)){
    Serial.print("connection failed: ");
    Serial.println(payload);
    return;
  }
  getheader = "GET /?temp="+ String(payload);
  client.println(getheader);
  Serial.println(getheader);

  while (client.connected()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
  }
  
  Serial.println("Done cycle.");
}

void connect_ap() {
  Serial.println();
  Serial.print("connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("\n Got WiFi, IP address: ");
  Serial.println(WiFi.localIP());  
}

void setup() {
  Serial.begin(115200);
  connect_ap();

  Serial.println("Arduino ThinkSpeak Test"); 
  
  Serial.println("Dallas Temperature IC Control Library Demo"); 
  // Start up the library 
  sensors.begin(); 
}

unsigned long mark = 0;
void loop() {
  if (millis() > mark ) {
     mark = millis() + interval;
     String payload = working();
     delivering(payload);
  }
}
