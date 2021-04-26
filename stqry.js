var STORAGE_KEY = 'stqry_dataset'

/**
  * @param {string} key storage key
  * @return {string}
  */
function getStoredData(key) {
  var storedData = {}
  try {
    storedData = JSON.parse(window.localStorage.getItem(key) || '') || {}
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

window.stqry = {
  storage: {
    /**
      * @param {Object.<string, any>} changeset object - pair of key value
      * @param {function()} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    set: function (changeset, callback, customKey) {
      var storageKey = customKey || STORAGE_KEY
      
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
      console.warn('Opening internal link: [id] [type] [subtype]', data)
      if (callback) callback()
    },
    /**
      * @param {string} link external link
      * @param {function()} callback callback function - calling after link openned
      */
    openExternal: function (link, callback) {
      console.warn('Opening external link: ', link)
      if (callback) callback()
    }
  },
  camera: {
    /**
      * @param {String} videoTagId - id of video element
      * @param {function()} callback callback function - calling after link openned
      */
    enableBackground: function (videoTagId, callback) {
      console.warn('Enable camera background', videoTagId)

      // Making `this` available inside nested агтсешщті
      var _this = this
      _this._video = document.querySelector('#' + videoTagId);

      setTimeout(function () {
        if (navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }})
            .then(function (stream) {
              _this._video.srcObject = stream;
              if (callback) callback()
            })
            .catch(function (err0r) {
              console.log('Something went wrong!', err0r);
            });
        }
      })
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
}
