// import {BackHandler} from 'react-native';
// import {resetIcon, setIcon} from 'react-native-app-icon-changer';

// export type AliasName =
//   | 'Default'
//   | 'BlackOnGold'
//   | 'FlatBlue'
//   | 'FlatPink'
//   | 'FlatPurple'
//   | 'FlatYellow'
//   | 'FlowersAutumn'
//   | 'FlowersBeige'
//   | 'FlowersMagenta'
//   | 'FlowersPink'
//   | 'GemBgCandy'
//   | 'GemBgMono'
//   | 'GemBgMulti'
//   | 'GemBgPink'
//   | 'GoldOnBlack'
//   | 'GoldOnBlackOutline'
//   | 'LightHearts'
//   | 'NeonBlue'
//   | 'NeonGreen'
//   | 'NeonPink'
//   | 'NeonYellow'
//   | 'Notebook'
//   | 'Pastel3dGold'
//   | 'Pastel3dGreen'
//   | 'Pastel3dPink'
//   | 'PastelIcPastel3dBlue'
//   | 'Pendant'
//   | 'PhotosHeartsBlack'
//   | 'PhotosHearts'
//   | 'Tunnel'
//   | 'WavesBlack'
//   | 'WavesBlue'
//   | 'WavesGold'
//   | 'WavesPurple';

// export const iconAliases: {name: string; value: AliasName}[] = [
//   {name: 'Default', value: 'Default'},
//   {name: 'Black On Gold', value: 'BlackOnGold'},
//   {name: 'Flat Blue', value: 'FlatBlue'},
//   {name: 'Flat Pink', value: 'FlatPink'},
//   {name: 'Flat Purple', value: 'FlatPurple'},
//   {name: 'Flat Yellow', value: 'FlatYellow'},
//   {name: 'Flowers Autumn', value: 'FlowersAutumn'},
//   {name: 'Flowers Beige', value: 'FlowersBeige'},
//   {name: 'Flowers Magenta', value: 'FlowersMagenta'},
//   {name: 'Flowers Pink', value: 'FlowersPink'},
//   {name: 'Gem Bg Candy', value: 'GemBgCandy'},
//   {name: 'Gem Bg Mono', value: 'GemBgMono'},
//   {name: 'Gem Bg Multi', value: 'GemBgMulti'},
//   {name: 'Gem Bg Pink', value: 'GemBgPink'},
//   {name: 'Gold On Black', value: 'GoldOnBlack'},
//   {name: 'Gold On Black Outline', value: 'GoldOnBlackOutline'},
//   {name: 'Light Hearts', value: 'LightHearts'},
//   {name: 'Neon Blue', value: 'NeonBlue'},
//   {name: 'Neon Green', value: 'NeonGreen'},
//   {name: 'Neon Pink', value: 'NeonPink'},
//   {name: 'Neon Yellow', value: 'NeonYellow'},
//   {name: 'Notebook', value: 'Notebook'},
//   {name: 'Pastel 3d Gold', value: 'Pastel3dGold'},
//   {name: 'Pastel 3d Green', value: 'Pastel3dGreen'},
//   {name: 'Pastel 3d Pink', value: 'Pastel3dPink'},
//   {name: 'Pastel Ic Pastel 3d Blue', value: 'PastelIcPastel3dBlue'},
//   {name: 'Pendant', value: 'Pendant'},
//   {name: 'Photos Hearts Black', value: 'PhotosHeartsBlack'},
//   {name: 'Photos Hearts', value: 'PhotosHearts'},
//   {name: 'Tunnel', value: 'Tunnel'},
//   {name: 'Waves Black', value: 'WavesBlack'},
//   {name: 'Waves Blue', value: 'WavesBlue'},
//   {name: 'Waves Gold', value: 'WavesGold'},
//   {name: 'Waves Purple', value: 'WavesPurple'},
// ];

// export const switchAppIcon = (aliasName: AliasName) => {
//   console.log(`Switching app icon to: ${aliasName}`);
//   if (aliasName === 'Default') {
//     resetIcon();
//     setTimeout(() => {
//       BackHandler.exitApp();
//     }, 1000);
//     return;
//   }
//   setIcon(aliasName);

//   setTimeout(() => {
//     BackHandler.exitApp();
//   }, 1000);
// };
