# Virtual Office WebRTC Project
![The Build Fellowship](images_OA/BuildFellowshipLogo.png)

## Web App Project + Demo

The Virtual Office Web application is a web app that allows users on a 2D board to video chat with each other. This app is supposed to simulate the feeling of being at a virtual office for remote workers. This app was built using React and Node.js on the client side, while also using simple-peer API to facilitate the WebRTC connection between users. Socket.IO powers the server side, providing real-time bidirectional communication to support user movements on the gameboard.

## This app Was Built With: 

* [![React][React.js]][React-url]
* [![Firebase][Firebase-shield]][Firebase-url]
* [![JavaScript][JavaScript-shield]][JavaScript-url]
* [![React_Redux][React_Redux-shield]][React_Redux-url]
* [![Node_js][Node_js-shield]][Node_js-url]
* [![Socket_IO][Socket_IO-shield]][Socket_IO-url]
* [![Peer_JS][Peer_JS-shield]][Peer_JS-url]

## Loom Demo + Presentation Link 
#### Check out the following link for a presentation and demo at the end :)
 https://www.loom.com/share/c64fff055ec94d0bae7b4863a2b112a8?sid=53faedfe-4f3a-4a44-a937-2297b2a1109b

## Architecture
### Client side 
![Client Code Architecture](images_OA/WebRTC%20Client.png)

### Server side
![Server Code Architecture](images_OA/Server%20Side%20WebRTC.png)

## Prerequisites
* Node.js
* npm package manager
* Browser (preferably chrome or safari)
  
## How to Launch the App
1. Install NPM packages for server
   ```sh
   cd server && npm install
   ```
2. Start backend server
   ```sh
   cd src && node index.js
   ```
3. Install NPM packages for frontend
   ```sh
   cd ../client && npm install 
   ```
4. Start frontend web app
   ```sh
   npm run-script build && npx serve -s build
   ```
5. Open a browser window and go to http://localhost:3000/



<!-- MD Links & Images -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[JavaScript-shield]: https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E
[JavaScript-url]: https://www.javascript.com/
[React_Redux-shield]: https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white
[React_Redux-url]: https://react-redux.js.org/
[Firebase-shield]: https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34
[Firebase-url]: https://firebase.google.com/
[Node_js-shield]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Node_js-url]: https://nodejs.org/
[Socket_IO-shield]: https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101
[Socket_IO-url]: https://socket.io/
[Peer_JS-shield]: https://img.shields.io/badge/peerjs-black?style=for-the-badge&logo=peerjs&badgeColor=010101
[Peer_JS-url]: https://peerjs.com/
