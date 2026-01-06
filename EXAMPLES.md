# Examples

## Storage + Badge

Set progress and earn a badge when it reaches 5.

```javascript
window.stqry.storage.get(['progress'], function(data) {
  var progress = data.progress || []
  progress.push(itemId)
  window.stqry.storage.set({ progress: progress }, function() {
    if (progress.length >= 5) {
      window.stqry.badge.earn([badgeId])
    }
  })
})
```

## Language

Get the current language.

```javascript
window.stqry.language.get(function(lang) {
  alert(lang)
})
```

## Linking

Open an internal screen.

```javascript
window.stqry.linking.openInternal({ id: 42, type: 'screen', subtype: 'story' })
```

## Launch Screen

Return to the app's launch screen.

```javascript
window.stqry.linking.openLaunchScreen()
```

## Camera

Stream the device camera to a video element.

```html
<video id="camera" autoplay></video>
```

```javascript
window.stqry.camera.enableBackground('camera', function(err) {
  if (err) alert(err)
})
```

## Media

Load a video from STQRY Builder by media ID. Kiosk runtime only.

```javascript
window.stqry.media.get(1000000000935, undefined, function(item, files) {
  var video = document.getElementById('video')
  video.src = URL.createObjectURL(files.media.blob())
})
```

## Kiosk

Open a projector display, wait for it to load, then send data.

```javascript
// touchscreen
window.stqry.screen.open(new URL('./projector.html', document.baseURI).href)
setTimeout(function() {
  window.stqry.screen.send([year, language])
}, 3000)

// projector.html
window.stqry.screen.receive(function(msg) {
  var year = msg[0]
  var language = msg[1]
  showYear(year, language)
})
```
