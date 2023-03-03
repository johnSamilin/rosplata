# rosplata
This is an experiment on whether you can create relatively big functional web app using only web platform features and ECMAScript standards (no bundling, no babel, no polyfills)

## Demo
Currently demo can be found [here](https://ros-plata.ru/)

[Drop me a line](mailto:a_salt@lenta.ru) if you have anything in mind!

## Dependencies
There are several features that your browser must support to run the demo:
* [Dialog element](https://caniuse.com/dialog)
* [URL pattern API](https://caniuse.com/mdn-api_urlpattern)
* [Import assertions](https://github.com/tc39/proposal-import-assertions)

Besides, it uses:
* [HTML templates](https://caniuse.com/template) as templating mechanism
* [Battery API](https://caniuse.com/battery-status) and [matchMedia](https://caniuse.com/matchmedia) to decide whether to turn off animations
* Static and dynamic [ES6 imports](https://caniuse.com/es6-module-dynamic-import)
* [Inert attribute](https://caniuse.com/mdn-html_global_attributes_inert)
* [WebAssembly](https://caniuse.com/wasm)

## Start
Basically, startup process is described [here](https://github.com/johnSamilin/rosplata-back)
Plus, edit `firebaseConfig` variable in `rosplata\src\core\AuthManager.mjs` (you'll obtain those credentials when setting up Firebase)

## How to use it?
#### Login
![msg71066564-85607](https://user-images.githubusercontent.com/5821894/222373663-2d3e7708-c233-4f01-b43e-764f698cbe8f.jpg)

#### Create a budget
![msg71066564-85606](https://user-images.githubusercontent.com/5821894/222373689-80378ee3-d180-4256-8858-8b92ccee0d60.jpg)

#### Invite people
Let them scan QR code of just send them the link

![msg71066564-85605](https://user-images.githubusercontent.com/5821894/222373714-27a832d7-eb9c-4ba6-8786-59cdc5c7a9a2.jpg)

#### Approve or reject their participation request
![msg71066564-85604](https://user-images.githubusercontent.com/5821894/222373740-c72b385a-38e7-4ab2-b8cf-3a3ecb1d38f4.jpg)

#### Add transactions
![msg71066564-85603](https://user-images.githubusercontent.com/5821894/222373749-17509375-4fc2-49b3-b840-b87e3146b5b5.jpg)

#### That's all!
Pay the bill, and no one will have questions how much do they owe you

## Look ma, I'm on TV
[How do I make webapps nowadays?](https://medium.com/@alex.saltykov/how-do-they-make-web-apps-nowadays-pt-1-c1a36acc7dd8)
