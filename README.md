<a href="https://www.producthunt.com/posts/rosplata-collaborative-finance-manager?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-rosplata&#0045;collaborative&#0045;finance&#0045;manager" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=385668&theme=light" alt="Rosplata&#0058;&#0032;collaborative&#0032;finance&#0032;manager - opensource&#0044;&#0032;finance&#0032;management&#0044;&#0032;expense&#0032;tracker&#0044;&#0032;collaborate | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

<a href="https://t.me/rosplata/3" target="_blank">

<img src="https://user-images.githubusercontent.com/5821894/228524760-be244e39-aabe-4b0a-ad17-5b8a9abe9d03.PNG" width="500" />

</a>

# rosplata
This is an experiment on whether you can create relatively big functional web app using only web platform features and ECMAScript standards (no bundling, no babel, almost no polyfills)

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
