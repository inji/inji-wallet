# CSS Themes

We can customize the application by adding a new file under components/ui/themes and import that file in components/ui/styleUtils.ts and assign that file to Theme variable

```
components/ui/styleUtils.ts

eg:-
import { PurpleTheme } from './PurpleTheme';

export const Theme = PurpleTheme;
```

## **Design tokens :**

Screens built to the CredIssuer design (starting with the mDoc share flow in `components/mdocShare`) take their colours from `components/ui/themes/designTokens.ts` instead of hard-coding hex values. The values come from the "CredIssuer Wallet — Frontend Handoff Spec" (Design foundations), and every theme exposes them as `Theme.Tokens`:

```
const {colors: C, brand: B, elevation: E} = Theme.Tokens;

container: {backgroundColor: C.canvas},     // screen background
title: {color: C.ink},                      // primary text and icons
primaryButton: {backgroundColor: B.navy, ...E.btn},
```

- `colors`: the 17 semantic tokens (`canvas`, `sand`, `card`, `ink`, `inkMuted`, `line`, `lineStrong`, `azureInk`, `sel`, `pass`, `warn`, `fail`, `tintAzure`, `tintPass`, `tintWarn`, `ghost1`, `ghost2`). `ColorTokens.light` and `ColorTokens.dark` hold both values; the app uses the light set until dark mode is added.
- `brand`: navy surfaces (`navy`, `onNavy`) and the colours that only appear on navy (`cyan`, `mist`, `navyFill`, `navyLine`, `cyanTint`).
- `elevation`: `btn`, `ghost`, `icon` and `card` shadows.
- `withAlpha(hex, alpha)` derives a translucent variant of a token when the spec has no tint for it.

To change a colour, change the token; don't add a raw hex to a screen.

## **Logo and Background Images :**

To change the mosip logo

```
MosipLogo = require(path of logo you want to use, in string format)

*logo can be png or svg

eg:-
MosipLogo = require('../../assets/mosip-logo.png')
```

To change the profile logo which is available as a demo while loading the vc details

```
ProfileIcon = require(path of logo you want to use, in string format)

*logo can be png or svg

eg:-
ProfileIcon: require('../../assets/placeholder-photo.png')
```

To change the close card details background

```
CloseCard = require(path of image you want to use, in string format)

*Image can be png or svg
-width: 363 pixels
-height: 236 pixels

eg:-
CloseCard: require('../../assets/ID-closed.png')
```

To change the OpenCard card details background

```
OpenCard = require(path of image you want to use, in string format)

*Image can be png or svg
-width: 363 pixels
-height: 623 pixels

eg:-
  OpenCard: require('../../assets/ID-open.png')
```

## **Colors :**

To change the color of TabItemText

![Image](../../../docs\images\tabItemText.png 'Image')

```
export const DefaultTheme = {
  Colors: {
    TabItemText: colors.Primary,
    ...
  }
}
```

To change the color of Details Label Text

![Image](../../../docs\images\detailsLabel.png 'Image')

```
export const DefaultTheme = {
  Colors: {
      DetailsLabel: colors.Primary,
    ...
  }
}
```

To change the color of Details Value Text

![Image](../../../docs\images\detailsValue.png 'Image')

```
export const DefaultTheme = {
  Colors: {
      Details: Colors.Black,
    ...
  }
}
```

To change the color of AddId Button Text and Background

![Image](../../../docs\images\AddIdButton.png 'Image')

```
export const DefaultTheme = {
  Colors: {
     AddIdBtnBg: colors.Primary,
      AddIdBtnTxt: colors.Primary,
    ...
  }
}
```

To change the color of Icons

![Image](../../../docs\images\Icons.png 'Image')

```
export const DefaultTheme = {
  Colors: {
      Icon: colors.Primary,
    ...
  }
}
```

To change the Background Color of Icons

![Image](../../../docs\images\IconBg.png 'Image')

```
export const DefaultTheme = {
  Colors: {
       IconBg: colors.Primary,
    ...
  }
}
```

To change the Color of Loading Transition

![Image](../../../docs\images\LoadingTransition.png 'Image')

```
export const DefaultTheme = {
  Colors: {
       Loading: colors.Primary,
    ...
  }
}
```

To change the Color of Error message

![Image](../../../docs\images\errorMessage.png 'Image')

```
export const DefaultTheme = {
  Colors: {
      errorMessage: Colors.Red,
    ...
  }
}
```

To change the Color of noUinText

![Image](../../../docs\images\noUinText.png 'Image')

```
export const DefaultTheme = {
  Colors: {
       noUinText : colors.Primary,
    ...
  }
}
```

To change the Colors of profile Label and Profile values

![Image](../../../docs\images\Profilevalues.png 'Image')

```
export const DefaultTheme = {
  Colors: {
     profileLabel: Colors.Black,
     profileValue: Colors.Grey,
    ...
  }
}
```

To change the Color of profileVersion

![Image](../../../docs\images\profileVersion.png 'Image')

```
export const DefaultTheme = {
  Colors: {
      profileVersion: Colors.Grey,
    ...
  }
}
```
