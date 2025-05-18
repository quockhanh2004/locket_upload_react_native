/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useEffect} from 'react';
import {View} from 'react-native-ui-lib';
import {Colors} from 'react-native-ui-lib';
import {
  LongPressGestureHandler,
  LongPressGestureHandlerGestureEvent,
  PanGestureHandler, // Sử dụng PanGesture để kéo mượt hơn
  PanGestureHandlerGestureEvent,
  State as GestureState,
} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {hapticFeedback} from '../../util/haptic'; // Điều chỉnh đường dẫn

interface CaptureButtonProps {
  isRecording: boolean;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  isPhoto: boolean;
  onTakePicture: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onZoomChange: (newZoom: number) => void;
  longPressDurationMs?: number;
  zoomSensitivity?: number;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({
  isRecording,
  zoom,
  minZoom,
  maxZoom,
  isPhoto,
  onTakePicture,
  onStartRecord,
  onStopRecord,
  onZoomChange,
  longPressDurationMs = 250,
  zoomSensitivity = 0.01,
}) => {
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const startYPan = useRef(0); // Lưu Y ban đầu khi bắt đầu Pan
  const startZoomPan = useRef(zoom); // Lưu zoom ban đầu khi bắt đầu Pan
  const isGestureActive = useRef(false); // Cờ chung cho biết gesture đang hoạt động

  // Cập nhật startZoomPan khi zoom prop thay đổi từ bên ngoài
  useEffect(() => {
    startZoomPan.current = zoom;
  }, [zoom]);

  const handleLongPressStateChange = (
    event: LongPressGestureHandlerGestureEvent,
  ) => {
    const {nativeEvent} = event;

    if (nativeEvent.state === GestureState.BEGAN) {
      isGestureActive.current = true;

      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }

      if (isPhoto) {
        // Chụp ảnh ngay khi tap, không hỗ trợ giữ
        hapticFeedback();
        runOnJS(onTakePicture)();
      } else {
        // Chế độ quay: bắt đầu hẹn giờ long-press
        pressTimer.current = setTimeout(() => {
          if (isGestureActive.current) {
            hapticFeedback();
            startZoomPan.current = zoom;
            runOnJS(onStartRecord)();
            pressTimer.current = null;
          }
        }, longPressDurationMs);
      }
    } else if (
      nativeEvent.state === GestureState.END ||
      nativeEvent.state === GestureState.CANCELLED ||
      nativeEvent.state === GestureState.FAILED
    ) {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;

        if (!isPhoto) {
          // Tap nhẹ trong chế độ quay: toggle quay / dừng
          if (isRecording) {
            runOnJS(onStopRecord)();
          } else {
            hapticFeedback();
            startZoomPan.current = zoom;
            runOnJS(onStartRecord)();
          }
        }
        // nếu là isPhoto thì không làm gì nữa vì BEGAN đã chụp
      } else {
        // Long press đã xảy ra → khi thả ra: dừng quay
        if (!isPhoto && isRecording) {
          runOnJS(onStopRecord)();
        }
      }

      isGestureActive.current = false;
    }
  };

  const handlePanGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    // Chỉ xử lý Pan khi đang quay phim
    if (isRecording && isGestureActive.current) {
      // Chỉ zoom khi đang nhấn giữ (quay)
      const {translationY, state} = event.nativeEvent;

      if (state === GestureState.BEGAN) {
        startYPan.current = translationY; // Lưu vị trí Y tương đối ban đầu của Pan
        startZoomPan.current = zoom; // Lưu zoom hiện tại
      } else if (state === GestureState.ACTIVE) {
        const deltaY = startYPan.current - translationY; // Kéo lên deltaY dương
        const zoomChange = deltaY * zoomSensitivity;
        const newZoomCalculated = startZoomPan.current + zoomChange;
        const newZoomClamped = Math.min(
          Math.max(newZoomCalculated, minZoom),
          maxZoom,
        );

        if (Math.abs(newZoomClamped - zoom) > 0.01) {
          runOnJS(onZoomChange)(newZoomClamped);
        }
      } else if (
        state === GestureState.END ||
        state === GestureState.CANCELLED ||
        state === GestureState.FAILED
      ) {
        // Không làm gì khi Pan kết thúc, LongPress sẽ xử lý việc dừng quay
        // Cập nhật lại startZoom sau khi kéo xong để lần kéo tiếp theo đúng
        startZoomPan.current = zoom;
      }
    }
  };

  return (
    // Kết hợp LongPress và Pan
    // PanGestureHandler bao ngoài để bắt sự kiện kéo
    <PanGestureHandler
      onGestureEvent={handlePanGestureEvent}
      onHandlerStateChange={handlePanGestureEvent} // Pan cũng cần state change để lấy BEGAN/END
      enabled={isRecording} // Chỉ bật Pan khi đang quay
    >
      <View>
        {/* View trung gian để Pan và LongPress không xung đột trực tiếp */}
        <LongPressGestureHandler
          minDurationMs={longPressDurationMs}
          onHandlerStateChange={handleLongPressStateChange}
          // Không cần onGestureEvent cho LongPress vì Pan đã xử lý kéo
        >
          <View // View nhận chạm cho LongPress và hiển thị nút
            style={{alignItems: 'center', justifyContent: 'center'}}>
            <View // Vòng tròn ngoài
              style={{
                width: 70, // Kích thước nút
                height: 70,
                borderRadius: 35,
                borderWidth: isRecording ? 4 : 2,
                borderColor: isRecording ? Colors.red30 : Colors.grey40,
                padding: 5,
                backgroundColor: Colors.rgba(Colors.grey40, 0.2), // Nền mờ nhẹ
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View // Chấm/Hình vuông bên trong
                style={{
                  width: isRecording ? 30 : 50,
                  height: isRecording ? 30 : 50,
                  borderRadius: isRecording ? 8 : 25, // Chuyển sang vuông khi quay
                  backgroundColor: isRecording ? Colors.red40 : Colors.white, // Đổi màu
                }}
              />
            </View>
          </View>
        </LongPressGestureHandler>
      </View>
    </PanGestureHandler>
  );
};

export default CaptureButton;
