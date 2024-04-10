**This is an app from the future**

**Most likely you won't be able to run it now**

**Don't run the demo**

<a href="https://www.producthunt.com/posts/rosplata-collaborative-finance-manager?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-rosplata&#0045;collaborative&#0045;finance&#0045;manager" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=385668&theme=light" alt="Rosplata&#0058;&#0032;collaborative&#0032;finance&#0032;manager - opensource&#0044;&#0032;finance&#0032;management&#0044;&#0032;expense&#0032;tracker&#0044;&#0032;collaborate | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>


DomDig XSS scan result:

![image](https://github.com/johnSamilin/rosplata/assets/5821894/a2fed969-7493-4a01-b174-4117c8cf6c58)


# Index
* [Disclaimer](https://github.com/johnSamilin/rosplata#disclaimer)
* [Demo](https://github.com/johnSamilin/rosplata#demo)
* [When do you need it](https://github.com/johnSamilin/rosplata#when-would-you-need-it)
* [Alternatives](https://github.com/johnSamilin/rosplata#alternatives)
* [Currencies](https://github.com/johnSamilin/rosplata#currently-available-currencies)
* [Usage](https://express.adobe.com/page/XiWR4wcPLBYfH/)
* [Self-host](https://github.com/johnSamilin/rosplata#start)
* [Publications](https://github.com/johnSamilin/rosplata#look-ma-im-on-tv)
* [Support](https://github.com/johnSamilin/rosplata/wiki/Contributing)

## Disclaimer
This is an experiment on whether you can create relatively big functional web app using only web platform features and ECMAScript standards (no bundling, no babel, almost no polyfills, almost no 3rd party libs)

## Demo
Currently demo can be found [here](https://ros-plata.ru/budgets/f3af9c65-1c82-452d-8469-619480e78490)

**Supported browsers: Chrome, Edge, Firefox, Safari**

[Drop me a line](mailto:rosplataapp@mail.ru) if you have anything in mind!

## When would you need it?
Imagine a situation: you and your friends go to a bar (possibly abroad with no internet available). You order something, have fun. In the end you get the check and no one remembers what did they order and who spent how much. This is exactly the problem Rosplata is here to solve.

## Alternatives
* [Splitwise](https://www.splitwise.com/)
* [Kittysplit](https://www.kittysplit.com/)
* [Tricount](https://www.tricount.com/en/organizing-group-expenses-among-friends)
* [IHateMoney](https://github.com/spiral-project/ihatemoney/)

## Currently available currencies
*  Russian Rouble
*  Indian Rupee
*  US Dollar
*  Euro
*  Chinese Yuan
*  Jordanian Dinar

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

## Docs
https://github.com/johnSamilin/rosplata/wiki

## Look ma, I'm on TV
[How do I make webapps nowadays?](https://medium.com/@alex.saltykov/how-do-they-make-web-apps-nowadays-pt-1-c1a36acc7dd8)

[ProductHunt](https://www.producthunt.com/posts/rosplata-collaborative-finance-manager)

[How do I work on opensource project Rosplata](https://www.linkedin.com/posts/asaltykov_github-johnsamilinrosplata-opensource-activity-7046472455246225408-LZ9H)

[Philosophic questions of webapps internationalization](https://medium.com/p/7738a964152e)

[AlternativeTo](https://alternativeto.net/software/rosplata/)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=johnSamilin/rosplata&type=Date)](https://star-history.com/#johnSamilin/rosplata&Date)

