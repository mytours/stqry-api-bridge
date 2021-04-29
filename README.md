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