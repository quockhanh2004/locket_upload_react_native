/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {Keyboard, StyleSheet, Animated} from 'react-native';
import {
  TextField,
  Icon,
  Colors,
  Text,
  View,
  TouchableOpacity,
} from 'react-native-ui-lib';
import EmojiPicker, {EmojiType} from 'rn-emoji-keyboard';
import {hapticFeedback} from '../../../util/haptic';

interface EmojiPickerProps {
  onFocusInput: (val: boolean) => void;
  onEmojiSelected: (emoji: string) => void;
  onSendMessage: (message: string) => void;
}

const fastPress = ['💛', '🔥', '😂'];
const REACTION_ICON_SIZE = 26;
const SEND_BUTTON_WIDTH = 60; // Ước tính chiều rộng nút gửi
const ICON_AREA_PADDING = 12; // Padding bên phải cho vùng icon/button

// Tính toán chiều rộng ước tính của khu vực reaction
// (Số icon * kích thước) + (số khoảng trống * gap) + icon add + padding cuối
const reactionsWidthEstimate =
  fastPress.length * REACTION_ICON_SIZE +
  fastPress.length * 12 + // Gap giữa các emoji + icon add
  ICON_AREA_PADDING;

// Chọn giá trị padding lớn hơn giữa nút gửi và reactions để đảm bảo không bị đè
const rightPaddingForInput =
  Math.max(SEND_BUTTON_WIDTH, reactionsWidthEstimate) + ICON_AREA_PADDING;

const EmojiPick: React.FC<EmojiPickerProps> = ({
  onFocusInput,
  onEmojiSelected,
  onSendMessage,
}) => {
  const [visibleEmojiPicker, setVisibleEmojiPicker] = useState(false);
  const [text, setText] = useState('');
  const [flyingEmojis, setFlyingEmojis] = useState<
    {id: number; emoji: string; animation: Animated.Value}[]
  >([]);

  // Animated Values
  const reactionsOpacity = useRef(new Animated.Value(1)).current; // Bắt đầu hiển thị
  const reactionsTranslateX = useRef(new Animated.Value(0)).current; // Bắt đầu ở vị trí 0
  const sendButtonOpacity = useRef(new Animated.Value(0)).current; // Bắt đầu ẩn
  const sendButtonTranslateX = useRef(new Animated.Value(50)).current; // Bắt đầu lệch sang phải

  useEffect(() => {
    const hasText = text.length > 0;

    // Animation cho Reactions
    Animated.parallel([
      Animated.timing(reactionsOpacity, {
        toValue: hasText ? 0 : 1,
        duration: 150, // Nhanh hơn chút
        useNativeDriver: true,
      }),
      Animated.timing(reactionsTranslateX, {
        toValue: hasText ? 50 : 0, // Di chuyển sang phải khi ẩn
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation cho Send Button
    Animated.parallel([
      Animated.timing(sendButtonOpacity, {
        toValue: hasText ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonTranslateX, {
        toValue: hasText ? 0 : 50, // Di chuyển vào từ phải
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [text]);

  const handleFocusInput = () => {
    setVisibleEmojiPicker(false);
    onFocusInput(true);
  };

  const handleBlurInput = () => {
    // Không đóng emoji picker khi blur để người dùng có thể chọn emoji
    // setVisibleEmojiPicker(false);
    onFocusInput(false);
  };

  const handlePressShowEmoji = () => {
    hapticFeedback();
    Keyboard.dismiss(); // Đóng bàn phím trước khi mở emoji
    setTimeout(() => {
      setVisibleEmojiPicker(prev => !prev);
      if (!visibleEmojiPicker) {
        onFocusInput(false); // Coi như input không focus khi mở emoji picker
      }
    }, 100);
  };

  const handleSelectEmoji = (emoji: EmojiType | string) => {
    const selected = typeof emoji === 'string' ? emoji : emoji.emoji;
    onEmojiSelected(selected);
    setVisibleEmojiPicker(false);

    const id = Date.now();
    const animation = new Animated.Value(0);
    setFlyingEmojis(prev => [...prev, {id, emoji: selected, animation}]);

    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // Xóa sau animation
      setFlyingEmojis(prev => prev.filter(e => e.id !== id));
    });
  };

  const handleSend = () => {
    if (text.trim().length > 0) {
      onSendMessage(text);
      handleSelectEmoji('💬');
      setText('');
      Keyboard.dismiss();
    }
  };

  return (
    // Đảm bảo container không bị ảnh hưởng bởi bàn phím nếu cần (sử dụng KeyboardAvoidingView ở component cha)
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextField
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.grey40}
          onFocus={handleFocusInput}
          onBlur={handleBlurInput}
          containerStyle={[
            styles.textFieldContainer,
            {paddingRight: rightPaddingForInput},
          ]}
          style={styles.textInputStyle} // Style cho text input bên trong
          color={Colors.white}
          multiline
        />

        {/* Container cho các nút tuyệt đối */}
        <View style={styles.absoluteButtonsContainer}>
          {/* Các icon reaction */}
          <Animated.View
            style={[
              styles.reactionIconsWrapper, // Style chung cho wrapper tuyệt đối
              {
                opacity: reactionsOpacity,
                transform: [{translateX: reactionsTranslateX}],
                // Pointer events none khi ẩn đi để không chặn nút gửi (nếu có thể)
                pointerEvents: text.length > 0 ? 'none' : 'auto',
              },
            ]}>
            {fastPress.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectEmoji(emoji)}
                hitSlop={{top: 10, bottom: 10, left: 5, right: 5}} // Tăng vùng chạm
              >
                <Text style={{fontSize: REACTION_ICON_SIZE}}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={handlePressShowEmoji}
              hitSlop={{top: 10, bottom: 10, left: 5, right: 5}}>
              <Icon
                assetName="add_emoji"
                size={REACTION_ICON_SIZE}
                tintColor={Colors.grey50}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Nút gửi */}
          <Animated.View
            style={[
              styles.sendButtonWrapper, // Style chung cho wrapper tuyệt đối
              {
                opacity: sendButtonOpacity,
                transform: [{translateX: sendButtonTranslateX}],
                // Pointer events none khi ẩn đi
                pointerEvents: text.length === 0 ? 'none' : 'auto',
              },
            ]}>
            {/* Chỉ render TouchableOpacity khi thực sự có thể gửi */}
            {text.trim().length > 0 && (
              <TouchableOpacity
                onPress={handleSend}
                style={styles.sendButton} // Style riêng cho nút bấm
              >
                <Icon assetName="ic_send" size={20} tintColor={Colors.white} />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </View>

      {/* Emoji Picker */}
      <EmojiPicker
        open={visibleEmojiPicker}
        onClose={() => setVisibleEmojiPicker(false)}
        onEmojiSelected={handleSelectEmoji}
        enableSearchBar
        theme={{
          container: Colors.grey10,
          knob: Colors.grey50,
          category: {
            icon: Colors.white,
          },
          search: {
            text: Colors.white,
            placeholder: Colors.grey40,
            background: Colors.grey20,
          },
          header: Colors.white,
        }}
        categoryPosition="top"
      />
      {flyingEmojis.map(item => (
        <Animated.Text
          key={item.id}
          style={{
            position: 'absolute',
            bottom: 60, // Tuỳ chỉnh vị trí xuất phát
            right: 60, // Tùy chỉnh vị trí xuất phát
            fontSize: 28,
            transform: [
              {
                translateY: item.animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -200], // Bay lên
                }),
              },
              {
                scale: item.animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.8], // Phóng to nhẹ
                }),
              },
            ],
            opacity: item.animation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0], // Mờ dần
            }),
          }}>
          {item.emoji}
        </Animated.Text>
      ))}
    </View>
  );
};

export default EmojiPick;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.transparent, // Nền của cả khu vực (bao gồm cả picker khi mở)
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Căn giữa các item theo chiều dọc
    backgroundColor: Colors.grey10, // Màu nền input field
    borderRadius: 25, // Bo tròn nhiều hơn
    paddingLeft: 15, // Tăng padding trái
    marginHorizontal: 10,
    marginVertical: 5, // Thêm khoảng cách dọc
    minHeight: 50, // Chiều cao tối thiểu để chứa icon/button
    position: 'relative', // Quan trọng cho absolute positioning
  },
  textFieldContainer: {
    flex: 1, // Cho phép TextField chiếm không gian còn lại
    paddingVertical: 5, // Padding dọc bên trong TextField container
  },
  textInputStyle: {
    fontSize: 16,
    color: Colors.white,
    paddingTop: 0, // Reset default padding nếu có
    paddingBottom: 0,
    textAlignVertical: 'center', // Căn text dọc giữa trong multiline
    maxHeight: 100, // Giới hạn chiều cao khi nhập nhiều dòng
  },
  absoluteButtonsContainer: {
    position: 'absolute',
    right: ICON_AREA_PADDING, // Cách lề phải của inputContainer
    top: 0,
    bottom: 0,
    justifyContent: 'center', // Căn giữa các wrapper nút theo chiều dọc
    alignItems: 'center', // Căn giữa nội dung bên trong wrapper (nếu wrapper chỉ chứa 1 nút)
  },
  reactionIconsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Khoảng cách giữa các icon reaction
  },
  sendButtonWrapper: {
    position: 'absolute', // Đặt chồng lên reactionIconsWrapper
    right: 0, // Căn phải bên trong absoluteButtonsContainer
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36, // Kích thước nút tròn
    height: 36,
    borderRadius: 18, // Bo tròn
    backgroundColor: Colors.primary, // Màu nút gửi
    justifyContent: 'center',
    alignItems: 'center',
  },
});
