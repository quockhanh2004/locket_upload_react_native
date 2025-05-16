import {NavigationProp} from '@react-navigation/native';

let navigationRef: NavigationProp<any>;

export const setNavigation = (nav: NavigationProp<any>) => {
  navigationRef = nav;
};

export const navigationTo = (screen: string, params?: any) => {
  if (!navigationRef) {
    console.warn('navigation chưa được gán!');
    return;
  }
  navigationRef.navigate(screen, params);
};

export const clearNavigation = () => {
  if (!navigationRef) {
    return;
  }
  navigationRef.setParams({});
};
