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

var reactNativeCallbacks = {}
var lastReactNativeCallbackId = 0;
/**
  * @param {string} action action to take in react native world
  * @param {any} data data to send to react native world
  * @param {function} callback callback for when the action is finished
  */
function callReactNative(action, data, callback) {
  if (callback) {
    var callbackId = lastReactNativeCallbackId
    var message = {
      action: action,
      version: "v1",
      data: data,
      callbackId: callbackId,
    }
    reactNativeCallbacks[callbackId] = callback
    lastReactNativeCallbackId++
    window.ReactNativeWebView.postMessage(JSON.stringify(message))
  }
  else {
    var message = {
      action: action,
      version: "v1",
      data: data,
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(message))
  }
}
if (window.stqryRuntime === "ReactNative") {
  window.addEventListener('message', function(event) {
    var data = event.data
    var message = JSON.parse(data)
    if (message) {
      var action = message.action
      var version = message.version
      if (version === "v1" && action === "callback") {
        var callbackId = message.callbackId
        var args = message.args
        var callback = reactNativeCallbacks[callbackId]
        if (callback) {
          callback.apply(null, args)
          delete reactNativeCallbacks[callbackId] // can only call back once
        }
        else {
          // callback is not set up at the moment
        }
      }
    }
    else {
      // malformed message, ignore
    }
  })
}


window.stqry = {
  storage: {
    /**
      * @param {Object.<string, any>} changeset object - pair of key value
      * @param {function()} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    set: function (changeset, callback, customKey) {
      var storageKey = customKey || STORAGE_KEY
      
      if (window.stqryRuntime === "ReactNative") {
        callReactNative("storage.set", { changeset: changeset, storageKey: storageKey }, callback)
        return
      }
      var storedData = getStoredData(storageKey)
      var value = Object.assign(storedData, changeset)
      setStoredData(storageKey, value)
      
      console.warn('Saving into storage:')
      console.log('[key]', storageKey)
      console.log('[value]', value)
      callback()
    },
    /**
      * @param {Array<string>} [keys] array of keys
      * @param {function(Object.<string, any>)} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    get: function (keys, callback, customKey) {
      var storageKey = customKey || STORAGE_KEY
      if (window.stqryRuntime === "ReactNative") {
        callReactNative("storage.get", { keys: keys, storageKey: storageKey }, callback)
        return
      }
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
    },
    /**
      * @param {Array<string>} [keys] array of keys
      * @param {function()} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    remove: function (keys, callback, customKey) {
      var storageKey = customKey || STORAGE_KEY
      if (window.stqryRuntime === "ReactNative") {
        callReactNative("storage.remove", { keys: keys, storageKey: storageKey }, callback)
        return
      }
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
      if (window.stqryRuntime === "ReactNative") {
        callReactNative("linking.openInternal", { params: data })
        if (callback) callback()
        return
      }
      console.warn('Opening internal link: [id] [type] [subtype]', data)
      if (callback) callback()
    },
    /**
      * @param {string} link external link
      * @param {function()} callback callback function - calling after link openned
      */
    openExternal: function (link, callback) {
      if (window.stqryRuntime === "ReactNative") {
        callReactNative("linking.openExternal", { link: link })
        if (callback) callback()
        return
      }
      console.warn('Opening external link: ', link)
      if (callback) callback()
    }
  },
}