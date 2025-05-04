import {Platform, NativeModules} from 'react-native';

export const getDeviceInfo = () => {
  const info = NativeModules.PlatformConstants || {};
  return {
    os: Platform.OS,
    androidVersion: Platform.Version,
    release: info.Release, // Ví dụ: '13'
    model: info.Model, // Ví dụ: 'SM-G780G'
    brand: info.Brand, // Ví dụ: 'samsung'
    manufacturer: info.Manufacturer, // Ví dụ: 'samsung'
    fingerprint: info.Fingerprint, // Ví dụ: 'samsung/...'
    serial: info.Serial, // Thường là 'unknown' trên Android >= 10
    serverHost: info.ServerHost, // Android Emulator mới có
    deviceType: info.DeviceType, // Có thể không có
    supportedAbis: info.SupportedAbis, // ['arm64-v8a', 'armeabi-v7a']
    preferredAbi: info.PreferredAbi, // Ví dụ: 'arm64-v8a'
    isTesting: info.IsTesting, // Emulator hay không
  };
};
