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

## Start
Basically, startup process is described [here](https://github.com/johnSamilin/rosplata-back)
