/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Colors,
  Icon,
  Card,
  Text,
} from 'react-native-ui-lib';
import {
  Camera,
  useCameraDevices,
  useCameraFormat,
} from 'react-native-vision-camera';
import {BackHandler, Animated, Dimensions, Image} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';

import {setCameraSettings} from '../../redux/slice/setting.slice';
import {useDispatch, useSelector} from 'react-redux';
import {navigationTo} from '../Home';
import {nav} from '../../navigation/navName';
import Header from '../../components/Header';
import {setMessage} from '../../redux/slice/message.slice';
import Video from 'react-native-video';
import {RootState} from '../../redux/store';
import {t} from '../../languages/i18n';
import {hapticFeedback} from '../../util/haptic';

const screenWidth = Dimensions.get('window').width;

function CameraScreen() {
  const dispatch = useDispatch();
  const camera = useRef<any>(null);
  // const pinchRef = useRef(null);
  const scaleRef = useRef(1);
  const lastScaleRef = useRef(1);

  const devices = useCameraDevices();
  const {cameraSettings} = useSelector((state: RootState) => state.setting);

  const device =
    devices.find(cam => cam.position === cameraSettings?.cameraId) ||
    devices[0];
  console.log(JSON.stringify(device));

  const format = useCameraFormat(device, []);

  const timeoutRef = useRef<any>(null);
  const timeIntervalRef = useRef<any>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timeRecording, setTimeRecording] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleSwitchCamera = () => {
    hapticFeedback();
    startRotation();
    dispatch(
      setCameraSettings({
        cameraId: cameraSettings.cameraId === 'front' ? 'back' : 'front',
      }),
    );
    // Reset zoom khi chuyển camera
    setZoom(1);
    scaleRef.current = 1;
    lastScaleRef.current = 1;
  };

  const handleFlash = () => {
    hapticFeedback();
    dispatch(
      setCameraSettings({
        flash: !cameraSettings?.flash,
      }),
    );
  };

  const handleTakePicture = () => {
    hapticFeedback();
    if (camera.current) {
      camera.current
        .takePhoto({
          flash: cameraSettings.flash ? 'on' : 'off',
        })
        .then((data: {path: string}) => {
          setPhoto('file://' + data?.path);
          setType('image');
        });
    }
  };

  const handleRecordVideo = async () => {
    hapticFeedback();
    if (camera.current) {
      setIsRecording(true);
      await camera.current.startRecording({
        videoCodec: 'h264',
        fileType: 'mp4',
        flash: cameraSettings.flash ? 'on' : 'off',
        onRecordingFinished: (video: {path: string}) => {
          setPhoto('file://' + video.path);
          setType('video');
        },
        onRecordingError: (error: any) => {
          dispatch(
            setMessage({
              message: JSON.stringify(error),
              type: t('error'),
            }),
          );
        },
      });
      timeoutRef.current = setTimeout(async () => {
        await stopRecording();
        clearTimeout(timeoutRef.current);
        clearInterval(timeIntervalRef.current);
        timeoutRef.current = null;
        timeIntervalRef.current = null;
      }, 10000);
      timeIntervalRef.current = setInterval(() => {
        setTimeRecording(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  const stopRecording = async () => {
    hapticFeedback();
    if (camera.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        clearInterval(timeIntervalRef.current);
        timeoutRef.current = null;
        timeIntervalRef.current = null;
      }
      await camera.current.stopRecording();
      setIsRecording(false);
      setTimeRecording(0);
    }
  };

  const handleSavePicture = async () => {
    hapticFeedback();
    if (photo) {
      try {
        const newUri = await CameraRoll.saveAsset(photo, {});
        console.log('Saved to camera roll:', newUri);
        dispatch(
          setMessage({
            message: `${type?.toUpperCase()} saved to camera roll`,
            type: 'success',
          }),
        );
      } catch (error: any) {
        console.error('error saving camera roll', error);
        dispatch(
          setMessage({
            message: `Error saving ${type} to camera roll: ${error.message}`,
            type: t('error'),
          }),
        );
      }
    }
  };

  const handleReturnMedia = async () => {
    hapticFeedback();
    if (photo) {
      navigationTo(nav.home, {
        camera: {
          uri: photo,
          type: type,
        },
        from: nav.camera,
      });
    }
  };

  const handleClearMedia = () => {
    hapticFeedback();
    if (photo) {
      setPhoto(null);
      setType(null);
      // Reset zoom khi quay lại camera
      setZoom(1);
      scaleRef.current = 1;
      lastScaleRef.current = 1;
      return true;
    }
    return false; // Thêm return false nếu không có gì để clear
  };

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotateAnim.setValue(0); // Reset animation về 0 trước khi chạy lại
    Animated.timing(rotateAnim, {
      toValue: 0.5, // Giá trị 1 sẽ tương ứng với 360 độ
      duration: 500, // Thời gian quay (ms)
      useNativeDriver: true, // Tăng hiệu suất
    }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // Xoay từ 0 đến 360 độ
  });

  //xử lý sự kiện back
  const onPinchGestureEvent = (event: any) => {
    const scale = event.nativeEvent.scale;
    const newZoom = Math.min(Math.max(lastScaleRef.current * scale, 1), 20);
    scaleRef.current = newZoom;
    setZoom(newZoom);
  };

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      lastScaleRef.current = scaleRef.current;
    }
  };

  useEffect(() => {
    const backAction = () => {
      return handleClearMedia() || false;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, [photo]);

  return (
    <>
      <Header />
      <View flex bg-black centerH>
        <View margin-12 flex-5 center>
          {photo ? (
            type === 'image' ? (
              <Image
                source={{uri: photo}}
                style={{
                  width: screenWidth - 24,
                  height: screenWidth - 24,
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
                resizeMode="cover"
              />
            ) : (
              <Video
                source={{uri: photo}}
                style={{
                  width: screenWidth - 24,
                  height: screenWidth - 24,
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
                resizeMode="cover"
              />
            )
          ) : (
            <PinchGestureHandler
              onGestureEvent={onPinchGestureEvent}
              onHandlerStateChange={onPinchStateChange}>
              <View style={{borderRadius: 20, overflow: 'hidden'}}>
                <Camera
                  ref={camera}
                  style={{
                    width: screenWidth - 24,
                    height: screenWidth - 24,
                    aspectRatio: 1,
                  }}
                  preview={true}
                  isActive={true}
                  photo={true}
                  video={true}
                  resizeMode="cover"
                  device={device}
                  format={format}
                  zoom={zoom}
                />
              </View>
            </PinchGestureHandler>
          )}
        </View>
        <View width={'100%'} flex-2>
          {isRecording && (
            <View center width={'100%'}>
              <Text white text50BL>
                {timeRecording < 10 ? `0${timeRecording}` : timeRecording} / 10
              </Text>
            </View>
          )}

          {!photo && (
            <View
              centerV
              width={'100%'}
              row
              marginT-12
              style={{justifyContent: 'space-around'}}
              backgroundColor={Colors.black}>
              <TouchableOpacity onPress={handleFlash}>
                <Icon
                  assetGroup="icons"
                  assetName={
                    cameraSettings?.flash ? 'ic_flash' : 'ic_flash_off'
                  }
                  size={24}
                  tintColor={Colors.grey40}
                />
              </TouchableOpacity>
              <View row center>
                <TouchableOpacity onPress={handleTakePicture}>
                  <View
                    style={{
                      borderRadius: 99,
                      borderWidth: 2,
                      borderColor: Colors.grey40,
                    }}
                    padding-5>
                    <View
                      width={50}
                      height={50}
                      style={{borderRadius: 50}}
                      bg-grey40
                    />
                  </View>
                </TouchableOpacity>

                <View
                  style={{
                    borderTopRightRadius: 99,
                    borderBottomRightRadius: 99,
                    marginLeft: -9,
                    borderLeftWidth: 0,
                    borderWidth: 2,
                    borderColor: Colors.grey40,
                  }}
                  padding-5>
                  <TouchableOpacity
                    onPress={!isRecording ? handleRecordVideo : stopRecording}>
                    {!isRecording ? (
                      <View
                        marginL-8
                        width={30}
                        height={30}
                        style={{
                          borderRadius: 50,
                        }}
                        bg-red40
                      />
                    ) : (
                      <View
                        marginL-8
                        width={30}
                        height={30}
                        style={{
                          borderRadius: 50,
                        }}
                        center
                        bg-grey40>
                        <View width={10} height={10} backgroundColor="black" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={handleSwitchCamera}>
                <Animated.View
                  style={{transform: [{rotate: rotateInterpolate}]}}>
                  <Icon
                    assetGroup="icons"
                    assetName="ic_camera_rotate"
                    size={24}
                    tintColor={Colors.grey40}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          )}

          {photo && (
            <View
              centerV
              width={'100%'}
              row
              spread
              marginT-12
              style={{justifyContent: 'space-around'}}
              backgroundColor={Colors.transparent}>
              <TouchableOpacity onPress={handleClearMedia}>
                <Icon
                  assetGroup="icons"
                  assetName="ic_cancel"
                  size={24}
                  margin-12
                  tintColor={Colors.grey40}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReturnMedia}>
                <View
                  style={{
                    borderRadius: 99,
                    borderWidth: 2,
                    borderColor: Colors.grey40,
                  }}
                  padding-10
                  bg-black>
                  <View
                    bg-grey40
                    width={50}
                    height={50}
                    style={{
                      borderRadius: 50,
                    }}
                    center>
                    <Icon
                      assetGroup="icons"
                      assetName="ic_check"
                      size={25}
                      tintColor={Colors.black}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <Card backgroundColor={Colors.black}>
                <TouchableOpacity onPress={handleSavePicture}>
                  <Icon
                    assetGroup="icons"
                    assetName="ic_save"
                    size={24}
                    margin-12
                    tintColor={Colors.grey40}
                  />
                </TouchableOpacity>
              </Card>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

export default CameraScreen;
