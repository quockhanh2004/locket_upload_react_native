export interface Friend {
  uid: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}

export type OptionSend = 'all' | 'custom_list' | 'manual';
