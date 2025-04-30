import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import {clearAppCache} from '../util/uploadImage';
import {clearNavigation} from '../screen/Home';

const useTrimVideo = () => {
  const [videoOut, setVideoOut] = useState<string | null>(null);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener('VideoTrim', async event => {
      switch (event.name) {
        case 'onLoad': {
          console.log('onLoadListener', event);
          break;
        }
        case 'onShow': {
          console.log('onShowListener', event);
          break;
        }
        case 'onHide': {
          console.log('onHide', event);
          break;
        }
        case 'onStartTrimming': {
          console.log('onStartTrimming', event);
          break;
        }
        case 'onFinishTrimming': {
          console.log('onFinishTrimming', event);
          const uri = 'file://' + event?.outputPath;
          setVideoOut(uri);
          clearAppCache();
          break;
        }
        case 'onCancelTrimming': {
          console.log('onCancelTrimming', event);
          clearNavigation();
          clearAppCache();
          break;
        }
        case 'onCancel': {
          console.log('onCancel', event);
          clearNavigation();
          clearAppCache();
          break;
        }
        case 'onError': {
          console.log('onError', event);
          clearNavigation();
          clearAppCache();
          break;
        }
        case 'onLog': {
          console.log('onLog', event);
          break;
        }
        case 'onStatistics': {
          console.log('onStatistics', event);
          break;
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return videoOut;
};

export default useTrimVideo;
