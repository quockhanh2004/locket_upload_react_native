/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {View, Text} from 'react-native-ui-lib';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {BackHandler, AppState} from 'react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

import {setCameraSettings} from '../../redux/slice/setting.slice';
import {useDispatch, useSelector} from 'react-redux';
import {nav} from '../../navigation/navName';
import Header from '../../components/Header';
import {setMessage} from '../../redux/slice/message.slice';
import {hapticFeedback} from '../../util/haptic';

import CameraPreview from './CameraPreview';
import CameraControls from './CameraControls';
import MediaPreviewControls from './MediaPreviewControls';
import {RootState} from '../../redux/store';
import {resizeImage} from '../../util/uploadImage';
import {navigationTo} from '../../navigation/HomeNavigation';

function CameraScreen() {
  const dispatch = useDispatch();
  const cameraRef = useRef<Camera>(null);

  const [isCameraActive, setIsCameraActive] = useState(true);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('App State:', nextAppState);
      setIsCameraActive(nextAppState === 'active');
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const devices = useCameraDevices();
  const {cameraSettings} = useSelector((state: RootState) => state.setting);
  const device =
    devices.find(cam => cam.position === cameraSettings?.cameraId) ||
    devices[0];

  const format = useMemo(() => {
    if (!device) {
      return undefined;
    }
    return (
      device.formats.find(
        f =>
          (f.videoWidth === 720 && f.videoHeight === 1280) ||
          (f.videoWidth === 1280 && f.videoHeight === 720), // phòng trường hợp máy ngang
      ) || device.formats[0]
    );
  }, [device]);

  // Refs cho việc quay video
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State quản lý media và trạng thái quay
  const [photo, setPhoto] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timeRecording, setTimeRecording] = useState(0);
  const [zoom, setZoom] = useState(device?.minZoom ?? 1);

  // Reset zoom khi device thay đổi
  useEffect(() => {
    setZoom(device?.minZoom ?? 1);
  }, [device]);

  // --- Camera Action Handlers (Callbacks cho các component con) ---

  const handleSwitchCamera = useCallback(() => {
    // startRotation() sẽ được gọi trong CameraControls
    dispatch(
      setCameraSettings({
        cameraId: cameraSettings.cameraId === 'front' ? 'back' : 'front',
      }),
    );
    // Zoom sẽ tự reset trong useEffect [device]
  }, [dispatch, cameraSettings]);

  const handleFlashToggle = useCallback(() => {
    dispatch(
      setCameraSettings({
        flash: !cameraSettings?.flash,
      }),
    );
  }, [dispatch, cameraSettings]);

  const handleTakePicture = useCallback(() => {
    if (!cameraRef.current || !isCameraActive) {
      return;
    }
    console.log('Taking Picture...');
    cameraRef.current
      .takePhoto({
        flash:
          cameraSettings.flash && cameraSettings.cameraId === 'back'
            ? 'on'
            : 'off',
      })
      .then(async data => {
        console.log('Photo taken:', data.path);
        const newImage = await resizeImage(data.path);
        setPhoto(newImage?.uri || '');
        setMediaType('image');
      })
      .catch(error => {
        console.error('Take photo error:', error);
        dispatch(
          setMessage({
            message: `Error taking photo: ${error.message}`,
            type: 'error',
          }),
        );
      });
  }, [cameraRef, cameraSettings, isCameraActive, dispatch]);

  const handleStartRecord = useCallback(async () => {
    if (!cameraRef.current || isRecording || !isCameraActive) {
      return;
    }
    console.log('Starting Record...');
    setIsRecording(true);
    setTimeRecording(0);

    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    timeIntervalRef.current = setInterval(() => {
      setTimeRecording(prev => prev + 1);
    }, 1000);

    // Xóa timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Đặt timeout dừng quay (ví dụ 10 giây)
    timeoutRef.current = setTimeout(async () => {
      console.log('Recording timeout');
      await handleStopRecord();
    }, 10000);

    try {
      await cameraRef.current.startRecording({
        videoCodec: 'h265', // Hoặc 'h265' nếu thiết bị hỗ trợ tốt
        fileType: 'mp4',
        flash: cameraSettings.flash ? 'on' : 'off',
        onRecordingFinished: video => {
          console.log('onRecordingFinished:', video.path);
          // Chỉ set photo nếu không phải do lỗi và state isRecording vẫn là true
          // (để tránh ghi đè nếu stop bị gọi nhiều lần)
          // Logic này sẽ đơn giản hơn nếu isRecording được set false ở stop
          // Tạm thời vẫn set ở đây
          setPhoto('file://' + video.path);
          setMediaType('video');
          setIsRecording(false);
          setTimeRecording(0);
          if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        },
        onRecordingError: error => {
          console.error('onRecordingError:', error);
          setIsRecording(false); // Dừng nếu lỗi
          setTimeRecording(0);
          if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          dispatch(
            setMessage({
              message: `Recording error: ${error.message}`,
              type: 'error',
            }),
          );
        },
      });
    } catch (e) {
      console.error('Error calling startRecording:', e);
      setIsRecording(false);
      setTimeRecording(0);
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      dispatch(
        setMessage({message: `Failed to start recording: ${e}`, type: 'error'}),
      );
    }
  }, [cameraRef, isRecording, cameraSettings, isCameraActive, dispatch]);

  const handleStopRecord = useCallback(async () => {
    if (!cameraRef.current || !isRecording) {
      return;
    }
    console.log('Stopping Record...');
    // Clear các timer ngay lập tức
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeIntervalRef.current = null;
    timeoutRef.current = null;

    try {
      await cameraRef.current.stopRecording();
      // onRecordingFinished sẽ được gọi và cập nhật state photo, isRecording,...
      console.log('stopRecording called successfully');
    } catch (error: any) {
      console.error('Stop recording error:', error);
      // Vẫn reset state nếu stopRecording bị lỗi
      setIsRecording(false);
      setTimeRecording(0);
      dispatch(
        setMessage({
          message: `Error stopping recording: ${error.message}`,
          type: 'error',
        }),
      );
    }
  }, [cameraRef, isRecording, dispatch]);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  // --- Media Preview Action Handlers ---

  const handleSaveMedia = useCallback(async () => {
    if (!photo || !mediaType) {
      return;
    }
    hapticFeedback();
    try {
      const typeToSave = mediaType === 'image' ? 'photo' : 'video';
      // Đảm bảo URI có tiền tố file:// nếu cần (CameraRoll thường tự xử lý)
      const saveUri = photo;
      await CameraRoll.save(saveUri, {type: typeToSave});
      dispatch(
        setMessage({
          message: `${mediaType.toUpperCase()} saved to gallery`,
          type: 'success',
        }),
      );
    } catch (error: any) {
      console.error('Save media error:', error);
      dispatch(
        setMessage({
          message: `Error saving ${mediaType}: ${error.message}`,
          type: 'error',
        }),
      );
    }
  }, [photo, mediaType, dispatch]);

  const handleReturnMedia = useCallback(async () => {
    if (!photo || !mediaType) {
      return;
    }
    hapticFeedback();
    navigationTo(nav.home, {
      camera: {uri: photo, type: mediaType},
      from: nav.camera,
    });
  }, [photo, mediaType]);

  const handleClearMedia = useCallback(() => {
    hapticFeedback();
    setPhoto(null);
    setMediaType(null);
    // Reset zoom khi quay lại camera
    setZoom(device?.minZoom ?? 1);
    return true; // Luôn trả về true cho BackHandler
  }, [device]);

  // --- Back Handler ---
  useEffect(() => {
    const backAction = () => {
      if (photo) {
        return handleClearMedia(); // Xử lý back khi đang xem preview
      }
      return false; // Cho phép back mặc định nếu đang ở camera
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [photo, handleClearMedia]); // Phụ thuộc vào photo và hàm clear

  // --- Render ---
  if (!device) {
    return (
      <>
        <Header />
        <View flex center bg-black>
          <Text white>Loading Camera...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Header />
      <View flex bg-black centerH>
        {/* Phần hiển thị Camera hoặc Preview */}
        <View flex-5 center marginT-s4>
          {/* Chiếm phần lớn không gian */}
          <CameraPreview
            ref={cameraRef}
            cameraRef={cameraRef}
            device={device}
            format={format}
            isActive={isCameraActive}
            zoom={zoom}
            photoUri={photo}
            mediaType={mediaType}
            setZoom={setZoom}
          />
        </View>
        {/* Phần điều khiển */}
        <View width={'100%'} flex-2 centerV>
          {/* Hiển thị timer khi đang quay */}
          {isRecording && (
            <View absT centerH marginT-s2 style={{zIndex: 1, width: '100%'}}>
              <View bg-red40 br10 paddingH-s1 paddingV-xs>
                <Text white text60>
                  {timeRecording < 10 ? `0${timeRecording}` : timeRecording}s
                </Text>
              </View>
            </View>
          )}
          {/* Chọn bộ điều khiển phù hợp */}
          {!photo ? (
            <CameraControls
              isRecording={isRecording}
              flashEnabled={!!cameraSettings?.flash}
              zoom={zoom}
              minZoom={device.minZoom ?? 1}
              maxZoom={device.maxZoom ?? 10}
              onFlashToggle={handleFlashToggle}
              onSwitchCamera={handleSwitchCamera}
              onTakePicture={handleTakePicture}
              onStartRecord={handleStartRecord}
              onStopRecord={handleStopRecord}
              onZoomChange={handleZoomChange}
            />
          ) : (
            <MediaPreviewControls
              onClearMedia={handleClearMedia}
              onReturnMedia={handleReturnMedia}
              onSaveMedia={handleSaveMedia}
            />
          )}
        </View>
      </View>
    </>
  );
}

export default CameraScreen;
