# STQRY API Bridge

The STQRY API Bridge allows you to interact with various STQRY App functions from within web screens in the app. The bridge currently supports the following functions:

1. Store and retrieve data that can be reused over sessions and between different web apps. For example storing game scores.
2. Link to internal screens and collections or external websites

More functionality will be added over time.

## Using

To start using STQRY API Bridge you need to create a `start` function and put the next script into your code
```javascript
window.stqryOnLoad(function () {
  // your code here
  // start()
});
```

## Testing

When testing your web app locally the console will output details of what is being stored and what internal links will be opened. This allows you to test the app before uploading it to the STQRY Builder.

## Test suite

The test suite for `stqry.js` can be found in `stqry-test/` folder. Load the page in a browser or one of the STQRY apps to test `stqry.js` methods.

## API

### storage
- `window.stqry.storage.set(changeset, callback, customKey?)` - changeset object - pair of key value. callback callback function - use to handle when storage data saved. customKey storage key - add if you want to use custom storage key.
- `window.stqry.storage.get(keys?, callback, customKey?)` - keys array of keys. callback callback function - use to handle when storage data saved. customKey storage key - add if you want to use custom storage key.
- `window.stqry.storage.remove(keys?, callback, customKey?)` - keys array of keys. callback callback function - use to handle when storage data saved. customKey storage key - add if you want to use custom storage key.

### linking
- `window.stqry.linking.openInternal(data, callback)` - data internal link data. callback callback function - calling after link openned.
- `window.stqry.linking.openExternal(link, callback)` - link external link. callback callback function - calling after link openned.
- `window.stqry.linking.openLaunchScreen(callback)` - callback callback function - calling after launch screen opened.

### navigation
- `window.stqry.navigation.back()` - Go back to the previous screen.

### language
- `window.stqry.language.get(callback)` - Get the current language. callback callback function - receives the language code.
- `window.stqry.language.set(languageCode)` - Set the current language. languageCode language code to set.

### camera
- `window.stqry.camera.enableBackground(videoTagId, callback)` - videoTagId id of video element. callback callback function - calling after link openned.
- `window.stqry.camera.disableBackground(callback)` - callback callback function - calling after link openned.

### media
- `window.stqry.media.get(mediaId, language, callback)` - Get media by id. mediaId The id of the media. language The language of the media. If not provided, the user's selected language will be used. If neither is provided, any language will be used. callback The callback function that will be called with the media item and a dictionary of responses for each file.

### badge
- `window.stqry.badge.earn(badgeIds, callback)` - Earn one or more badges by id. badgeIds Array of badge ids to earn. callback callback function - called after badges are earned.

### screen
- `window.stqry.screen.open(url)` - Opens a window on another screen. Kiosk runtime only. url URL to open on the other screen.
- `window.stqry.screen.send(message)` - Send a message to the other screen. Kiosk runtime only. message message to send.
- `window.stqry.screen.receive(callback)` - Receive messages from the other screen. Kiosk runtime only. callback callback function - receives the message.
