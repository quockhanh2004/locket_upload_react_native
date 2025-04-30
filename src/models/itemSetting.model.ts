export interface ItemSettingModel {
  title: string;
  value?: boolean;
  action: (value: boolean) => void;
  type?: 'switch' | 'button';
}
