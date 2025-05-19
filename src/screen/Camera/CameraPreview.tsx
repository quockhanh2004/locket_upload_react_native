/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-shadow */
import React, {forwardRef, useRef, useState} from 'react';
import {View, Image as RNUIImage, Colors} from 'react-native-ui-lib'; // Đổi tên Image của ui-lib
import {StyleSheet, Dimensions, Animated, Platform} from 'react-native';
import {Camera, CameraProps} from 'react-native-vision-camera';
import Video from 'react-native-video';
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;
const previewSize = screenWidth - 24;

interface CameraPreviewProps {
  cameraRef: React.Ref<Camera>;
  device: CameraProps['device'];
  format: CameraProps['format'];
  isActive: boolean;
  zoom: number;
  setZoom: (zoom: number) => void;
  photoUri: string | null;
  mediaType: 'image' | 'video' | null;
  enablePinchZoom?: boolean;
  isPhoto: boolean;
  onPinchZoomEvent?: (event: PinchGestureHandlerGestureEvent) => void;
  onPinchZoomStateChange?: (event: PinchGestureHandlerGestureEvent) => void;
}

const CameraPreview = forwardRef<Camera, CameraPreviewProps>(
  (
    {
      cameraRef,
      device,
      format,
      isActive,
      zoom,
      setZoom,
      photoUri,
      mediaType,
      isPhoto,
    },
    ref,
  ) => {
    const [focusCoords, setFocusCoords] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const focusAnim = useRef(new Animated.Value(1)).current;
    const scaleRef = useRef(1);
    const lastScaleRef = useRef(1);
    const [layout, setLayout] = useState({
      width: previewSize,
      height: previewSize,
    });

    const onPinchGestureEvent = (event: any) => {
      const maxZoom = device.maxZoom;
      if (zoom > maxZoom) {
        setZoom(maxZoom);
        return;
      }
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

    function convertTapToCameraPoint(
      tapX: number,
      tapY: number,
      layoutWidth: number,
      layoutHeight: number,
      format: CameraProps['format'],
    ): {x: number; y: number} | null {
      if (!format) {
        return null;
      }

      const camW = format.videoWidth;
      const camH = format.videoHeight;
      const camRatio = camW / camH;
      const viewRatio = layoutWidth / layoutHeight;

      let x: number, y: number;

      if (Math.abs(viewRatio - 1) < 0.01) {
        // 👈 Preview là 1:1, không cần offset crop
        x = tapX;
        y = tapY;
      } else if (camRatio > viewRatio) {
        // 👈 Camera quá rộng → crop chiều ngang
        const scale = layoutHeight / camH;
        const scaledW = camW * scale;
        const offsetX = (scaledW - layoutWidth) / 2;

        x = tapX + offsetX;
        y = tapY;
      } else {
        // 👈 Camera quá cao → crop chiều dọc
        const scale = layoutWidth / camW;
        const scaledH = camH * scale;
        const offsetY = (scaledH - layoutHeight) / 2;

        x = tapX;
        y = tapY + offsetY;
      }

      console.log({
        x: x,
        y: y,
      });

      return {
        x: x,
        y: y,
      };
    }

    const handleTapToFocus = async (
      event: TapGestureHandlerStateChangeEvent,
    ) => {
      if (event.nativeEvent.state !== State.END) {
        return;
      }
      if (
        !cameraRef ||
        typeof cameraRef !== 'object' ||
        !('current' in cameraRef)
      ) {
        return;
      }

      const x = event.nativeEvent.x;
      const y = event.nativeEvent.y;

      // Hiện animation ngay khi nhấn
      setFocusCoords({x, y});
      focusAnim.setValue(1);
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setFocusCoords(null));

      try {
        const focus = convertTapToCameraPoint(
          x,
          y,
          layout.width,
          layout.height,
          format,
        );
        if (!focus) {
          return;
        }
        const {x: normX, y: normY} = focus;
        await cameraRef.current?.focus({x: normX, y: normY});
      } catch (err) {
        console.warn('Focus error:', err); // Không cancel animation nếu lỗi
      }
    };

    const renderContent = () => {
      const getSafeUri = (uri: string) => {
        if (Platform.OS === 'android' && uri.startsWith('file://')) {
          return uri.replace('file://', '');
        }
        return uri;
      };

      if (photoUri) {
        if (mediaType === 'image') {
          return (
            <RNUIImage
              source={{uri: photoUri}}
              style={styles.mediaStyle}
              resizeMode="cover"
            />
          );
        } else {
          return (
            <Video
              source={{uri: getSafeUri(photoUri)}}
              style={styles.mediaStyle}
              resizeMode="cover"
              repeat={true}
              muted={false}
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 20000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
            />
          );
        }
      } else {
        return (
          <>
            <TapGestureHandler onHandlerStateChange={handleTapToFocus}>
              <PinchGestureHandler
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchStateChange}>
                <Camera
                  ref={ref || cameraRef}
                  style={styles.cameraStyle}
                  device={device}
                  format={format}
                  isActive={isActive}
                  photo={isPhoto}
                  video={!isPhoto}
                  audio={!isPhoto}
                  zoom={zoom}
                  resizeMode="cover"
                  photoQualityBalance="speed"
                  enableZoomGesture={true}
                  videoHdr={format?.supportsVideoHdr}
                  photoHdr={format?.supportsPhotoHdr}
                />
              </PinchGestureHandler>
            </TapGestureHandler>
          </>
        );
      }
    };

    return (
      <View
        style={styles.previewContainer}
        onLayout={e => {
          const {width, height} = e.nativeEvent.layout;
          setLayout({width, height});
        }}>
        {renderContent()}
        {focusCoords && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.focusIndicator,
              {
                left: focusCoords.x - 25,
                top: focusCoords.y - 25,
                opacity: focusAnim,
                transform: [{scale: focusAnim}],
              },
            ]}
          />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  focusIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 25,
    backgroundColor: 'transparent',
  },

  previewContainer: {
    width: previewSize,
    height: previewSize,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraStyle: {
    width: '100%',
    height: '100%',
  },
  mediaStyle: {
    width: '100%',
    height: '100%',
  },
});

export default CameraPreview;
