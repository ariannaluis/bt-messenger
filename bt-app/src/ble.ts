import { BleClient } from '@capacitor-community/bluetooth-le';

const SERVICE_UUID_RAW = 'fffffffffffffffffffffffffffffff0';
const CHARACTERISTIC_UUID_RAW = 'fffffffffffffffffffffffffffffff1';

function toDashed(uuid: string) {
  const hex = uuid.replace(/-/g, '').toLowerCase();
  if (hex.length !== 32) throw new Error('UUID must be 32 hex chars');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

const SERVICE_UUID = toDashed(SERVICE_UUID_RAW)
const CHARACTERISTIC_UUID = toDashed(CHARACTERISTIC_UUID_RAW)

export async function main(): Promise<void> {
  try {
    await BleClient.initialize();

    const device = await BleClient.requestDevice({
      services: [SERVICE_UUID],
    });
    
    await BleClient.connect(device.deviceId,
      (deviceId) => {
        console.log(`disconnected from ${deviceId}`);
      }
    );
    console.log(`connected to ${device.deviceId}`);

    await BleClient.startNotifications(
      device.deviceId,
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (value) => {
        console.log(new Date(), value);
      },
    );

  }catch(error){
    console.log(error);
  }
}
