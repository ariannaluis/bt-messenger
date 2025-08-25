const bleno = require('@abandonware/bleno');
const readline = require('readline');

SERVICE_UUID = 'fffffffffffffffffffffffffffffff0'
CHARACTERISTIC_UUID = 'fffffffffffffffffffffffffffffff1'

class DataCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: CHARACTERISTIC_UUID,
      properties: ['read', 'write', 'notify'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Data from Node.js'
        })
      ]
    });

    this.subscribers = [];
    this.data = Buffer.from('Hello from Node.js!', 'utf8');
  }

  onReadRequest(offset, callback) {
    console.log('Read request received');
    callback(this.RESULT_SUCCESS, this.data.slice(offset));
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    console.log('Write request received:', data.toString());
    this.data = data;

    // notify subscribers of new data
    this.notifySubscribers(data);

    callback(this.RESULT_SUCCESS);
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log('Client subscribed to notifications');
    this.subscribers.push(updateValueCallback);
  }

  onUnsubscribe() {
    console.log('Client unsubscribed from notifications');
    this.subscribers = [];
  }

  // send data to all subscribers
  notifySubscribers(data) {
    if (this.subscribers.length > 0) {
      console.log('Notifying subscribers:', data.toString());
      this.subscribers.forEach(callback => {
        callback(data);
      });
    }
  }

  // update and modify
  updateData(newData) {
    this.data = Buffer.from(newData, 'utf8');
    this.notifySubscribers(this.data);
  }
}

// create characteristic instance
const dataCharacteristic = new DataCharacteristic();

// create and start BLE service
const primaryService = new bleno.PrimarySerrvice({
  uuid: SERVICE_UUID,
  characteristics: [dataCharacteristic]
});

// set up bleno event listeners
bleno.on('stateChange', (state) => {
  console.log('Bleno state changed to:', state);

  if (state === 'poweredOn') {
    console.log('Starting advertising...');
    bleno.startAdvertising('NodeJS-BLE-Server', [SERVICE_UUID]);
  } else{
    console.log('Stopping advertising...');
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', (error) => {
  if(error) {
    console.error('Failed to start advertising:', error);
  } else {
    console.log('Advertising started successfully');
    console.log('Service UUID:', SERVICE_UUID);
    console.log('Characteristic UUID:', CHARACTERISTIC_UUID);

    bleno.setServices([primaryService], (error) => {
      if(error) {
        console.error('Failed to set services:', error);
      } else {
        console.log('Services set successfully');
      }
    });
  }
});

bleno.on('accept', (clientAddress) => {
  console.log('Client connected:', clientAddress);
});

bleno.on('disconnect', (clientAddress) => {
  console.log('Client disconnected:', clientAddress);
});

// interactive terminal - send data to capacitor app
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Node.js BLE Server Started ===');
console.log('Commands:');
console.log('  - Type any message to send to Capacitor app');
console.log('  - Type "exit" to quit');
console.log('=============================================\n');

function promptForInput(){
  rl.question('Enter message to send: ', (input) => {
    const command = input.trim();

    if(command.toLowerCase() === 'exit') {
      console.log('Shutting down...');
      bleno.stopAdvertising();
      rl.close();
      process.exit(0);
      return;
    }
    
    if(command) {
      console.log('Sending: "${command}"');
      dataCharacteristic.updateData(command);
    }

    promptForInput();
  });
}

// start input loop after short delay
setTimeout(() => {
  promptForInput();
}, 1000);

// handle process termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  bleno.stopAdvertising;
  rl.close();
  process.exit(0);
});
