# JS8-web

**Please note:** This is currently just a quick proof of concept produced in a couple of hours, not a complete project.

One afternoon, I set out to answer the question "Can you have a JS8 QSO via a browser?"  
It turns out, yes you can - as long as you are prepared to accept a few shortcomings. For example, as you cannot see the waterfall, you may well be TXing on top of somebody else. As messages tend to be quite short in nature, this probably isn't _too_ much of a problem, but it's not ideal.

## Installation

### Binaries

Download the binary for your platform from the [Releases tab](https://github.com/Trippnology/js8-web/releases/). You do not need NodeJS installed to use these, but they are quite large because they include the Node runtime executable.

### Running from source

You first need [NodeJS](https://nodejs.org/en/download) >v12 installed (available for most platforms).

```
git clone git@github.com:Trippnology/js8-web.git
cd js8-web
npm install
```

In the future, js8-web could be published to npm to enable install with just `npm i -g js8-web`.

## Usage

There are not currently any configuration options for js8-web, it relies on hard-coded settings. You currently have to use the same machine for both JS8call and js8-web, but you can access the web page via any machine on the same local network.

First, make sure settings in JS8call are configured as follows (under Settings > Reporting):

Allow setting station information: ticked  
TCP Server Hostname: `127.0.0.1`  
Enable TCP Server API: ticked  
TCP Server Port: `2442`  
Accept TCP Requests: ticked

Start js8-web: `npm start`

Open a web browser to `<ip of machine running js8-web>:3000` e.g. `localhost:3000` from the same machine or `192.168.0.123:3000` from a different machine on the same local network.

### Features

The 3 tabs (Activity, QSO, and Callsigns) mirror the 3 main panels in JS8call. As new activity appears, it's added to the bottom of the Activity tab (I was conscious of reducing scroll distance on a mobile). You can't currently interact with the activity directly, but you can click on seen callsigns in the Callsigns tab to address a message to that station.

### Future additions

If there is enough interest in developing this further, I would like to add some pre-formatted messages like you are used to in JS8call, and some for APRS, for example to send a position report, APRS messaging, or APRS commands like SMS/email.

It would also be prudent to be able to manually change the offset, and to be able to move to the offset of a station you are replying to.

This app uses my [lib-js8call](https://www.npmjs.com/package/@trippnology/lib-js8call) library, so we could do anything that the JS8call API allows, although there are many things that are missing/broken.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature develop`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

TODO: Write history

## Credits

Rik M7GMT - m7gmt@qsl.net

## License

UNLICENSED
