var STORAGE_KEY = 'stqry_dataset'

/**
  * @param {string} key storage key
  * @return {string}
  */
function getStoredData(key) {
  var storedData = {}
  try {
    var dataStr = window.localStorage.getItem(key)
    storedData = dataStr ? JSON.parse(dataStr) : {}
  } catch (error) {
    console.error(error)
  }

  return storedData
}

/**
  * @param {string} key storage key
  * @param {any} data data to storage
  */
 function setStoredData(key, data) {
  try {
    var value = JSON.stringify(data)
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.error(error)
  }
}

var appCallbacks = {}
var lastAppCallbackId = 0;
/**
  * @param {string} action action to take in the parent app
  * @param {any} data data to send to the parent app
  * @param {function} callback callback for when the action is finished
  */
function callApp(action, data, callback) {
  if (callback) {
    var callbackId = lastAppCallbackId
    var message = {
      action: action,
      version: 'v1',
      data: data,
      callbackId: callbackId,
    }
    appCallbacks[callbackId] = callback
    lastAppCallbackId++

    if (window.stqryRuntime === 'ReactNative') {
      window.ReactNativeWebView.postMessage(JSON.stringify(message))
    } else if (window.stqryRuntime === 'MobileWeb') {
      window.parent.postMessage(JSON.stringify(message), '*')
    } else if (window.stqryRuntime === 'Kiosk') {
      window.parent.postMessage(message, '*')
    }
  } else {
    var message = {
      action: action,
      version: 'v1',
      data: data,
    }

    if (window.stqryRuntime === 'ReactNative') {
      window.ReactNativeWebView.postMessage(JSON.stringify(message))
    } else if (window.stqryRuntime === 'MobileWeb') {
      window.parent.postMessage(JSON.stringify(message), '*')
    } else if (window.stqryRuntime === 'Kiosk') {
      window.parent.postMessage(message, '*')
    }
  }
}

window.addEventListener('message', onMessage)
document.addEventListener('message', onMessage)

function onMessage(event) {
  var message
  if (window.stqryRuntime === 'Kiosk') {
    message = event.data
  } else {
    try {
        message = JSON.parse(event.data)
    } catch (error) {
      // here can be any extension, so the error isn't logged
    }
  }
  
  if (!message) {
    return
  }

  var action = message.action
  var version = message.version
  if (version === 'v1' && action === 'callback') {
    var callbackId = message.callbackId
    var args = message.args
    var callback = appCallbacks[callbackId]
    if (callback) {
      callback.apply(null, args)
      delete appCallbacks[callbackId] // can only call back once
    } else {
      // callback is not set up at the moment
    }
  } else if (version === 'v1' && action === 'execute' && message.function) {
    eval(message.function)
  } else {
    // malformed message, ignore
  }
}

if (!window.stqryRuntime) {
  window.stqryRuntime = 'NoRuntime'
}

window.stqry = {
  /**
    * loading parameter show state stqry scripts
    */
  loading: true,
  /**
    * Call init function when stqry can't load oneself
    */
  init: function () {
    this.loading = false;
  },
  storage: {
    /**
      * @param {Object.<string, any>} changeset object - pair of key value
      * @param {function()} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    set: function (changeset, callback, customKey) {
      var storageKey = customKey || STORAGE_KEY
      
      if (window.stqryRuntime === 'NoRuntime') {
        var storedData = getStoredData(storageKey)
        var value = Object.assign(storedData, changeset)
        setStoredData(storageKey, value)
        
        console.warn('Saving into storage:')
        console.log('[key]', storageKey)
        console.log('[value]', value)
        callback()
        return
      }

      callApp('storage.set', { changeset: changeset, storageKey: storageKey }, callback)
    },
    /**
      * @param {Array<string>} [keys] array of keys
      * @param {function(Object.<string, any>)} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    get: function (keys, callback, customKey) {
      var storageKey = customKey || STORAGE_KEY
      if (window.stqryRuntime === 'NoRuntime') {
        var storedData = getStoredData(storageKey)
        
        if (keys && Array.isArray(keys)) {
          Object.keys(storedData).forEach(key => {
            if (!keys.includes(key)) {
              delete storedData[key]
            }
          })
        }

        console.warn('Getting from storage:')
        console.log('[object keys]', keys)
        console.log('[key]', storageKey)
        console.log('[value]', storedData)

        callback(storedData)
        return
      }

      callApp('storage.get', { keys: keys, storageKey: storageKey }, callback)
    },
    /**
      * @param {Array<string>} [keys] array of keys
      * @param {function()} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    remove: function (keys, callback, customKey) {
      var storageKey = customKey || STORAGE_KEY
      if (window.stqryRuntime === 'NoRuntime') {
        if (keys && Array.isArray(keys)) {
          var storedData = getStoredData(storageKey)
          
          keys.forEach(key => {
            delete storedData[key]
          })
          
          setStoredData(storageKey, storedData)
          console.warn('Removing from storage:')
          console.log('[object keys]', keys)
          console.log('[key]', storageKey)
        } else {
          Object.keys(window.localStorage).forEach(function (key) {
            if (key.startsWith(storageKey)) {
              window.localStorage.removeItem(key)
            }
          })
          console.warn('Removing from storage:')
          console.log('[key]', storageKey)
        }

        callback()
        return
      }

      callApp('storage.remove', { keys: keys, storageKey: storageKey }, callback)
    }
  },
  linking: {
    /**
      * @param {Object} data internal link data
      * @param {number} data.id collection or screen id
      * @param {'collection'|'screen'} data.type item type
      * @param {'list'|'tour'|'menu'|'web'|'story'|'panorama'} data.subtype item subtype
      * @param {function()} callback callback function - calling after link openned
      */
    openInternal: function (data, callback) {
      if (window.stqryRuntime === 'NoRuntime') {
        console.warn('Opening internal link: [id] [type] [subtype]', data)
        if (callback) callback()
        return
      }
  
      callApp('linking.openInternal', { params: data })
      if (callback) callback()
    },
    /**
      * @param {string} link external link
      * @param {function()} callback callback function - calling after link openned
      */
    openExternal: function (link, callback) {
      if (window.stqryRuntime === 'NoRuntime') {
        console.warn('Opening external link: ', link, window)
        if (callback) callback()
        return
      }

      callApp('linking.openExternal', { link: link })
      if (callback) callback()
    }
  },
  navigation: {
    back: function () {
      callApp('navigation.back')
    }
  },
  camera: {
    /**
      * @param {String} videoTagId - id of video element
      * @param {function(any)} callback callback function - calling after link openned
      */
    enableBackground: function (videoTagId, callback) {
      console.warn('Enable camera background', videoTagId)

      // Making `this` available inside nested functions
      var _this = this
      _this._video = document.querySelector('#' + videoTagId);

      function enableBackgroundInternal() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }})
            .then(function (stream) {
              _this._video.srcObject = stream;
              if (callback) callback()
            })
            .catch(function (error) {
              if (callback) callback(error)
            });
        }
        else {
          alert("Camera API is not available")
        }
      }

      if (window.stqryRuntime === "ReactNative") {
        callApp("camera.requestCameraPermission", {}, function(permissionStatus, error) {
          if (error) console.error('camera.requestCameraPermission error', error)
          if (permissionStatus !== "granted" && permissionStatus !== "bypassed") {
            if (callback) callback(new Error("Camera permission is not granted or bypassed. Camera permission is '"+permissionStatus+"' instead."))
            return
          }
          enableBackgroundInternal();
        })
        return
      }

      setTimeout(function () {
        enableBackgroundInternal();
      });
    },
    /**
      * @param {function()} callback callback function - calling after link openned
      */
    disableBackground: function (callback) {
      console.warn('Disable camera background')
      
      if (this._video) {
        var stream = this._video.srcObject;

        if (stream) {
          var tracks = stream.getTracks();
          
          for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            track.stop();
          }
        }
        
        this._video.srcObject = null;
        if (callback) callback()
      }
    }
  },
  media: {
    /**
     * Get media by id.
     * @param {number} mediaId The id of the media.
     * @param {string | undefined} language The language of the media. If not
     * provided, the user's selected language will be used. If neither is
     * provided, any language will be used.
     * @param {function()} callback The callback function that will be called
     * with the media item and a dictionary of responses for each file.
     */
    get: function (mediaId, language, callback) {
      if (window.stqryRuntime === 'Kiosk') {
        callApp('media.get', { mediaId, language }, (item, files) => {
          callback(
            item,
            Object.fromEntries(
              Object.entries(files).map(([key, value]) => [
                key,
                new Response(value.blob, {
                  status: value.status,
                  statusText: value.statusText,
                  headers: value.headers,
                }),
              ])
            )
          );
        })
      }
    }
  }
}

// Check if it's self page or react native webview
// If so, then don't need to call window.stqry.init()
if (window.self === window.top || window.stqryRuntime === 'ReactNative') {
  window.stqry.loading = false
}

/**
  * Check if stqry script is fully loaded
  * Use that callback in frontend
  * @param {function()} callback callback function - calling after link openned
  */
window.stqryOnLoad = function (successCallback) {
  var attempt = 0
  var loadingInterval = setInterval(function () {
    if (attempt === 30) {
      clearInterval(loadingInterval);
      throw 'Maximum attempts exceeded';
    }

    if (!window.stqry.loading) {
      successCallback();
      clearInterval(loadingInterval);
    } else {
      attempt++;
    }
  }, 100);
}
