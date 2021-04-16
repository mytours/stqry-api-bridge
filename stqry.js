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
      console.warn('Saving into storage: ', changeset)

      var storedData = getStoredData(customKey || STORAGE_KEY)
      setStoredData(customKey || STORAGE_KEY, Object.assign(storedData, changeset))

      callback()
    },
    /**
      * @param {Array<string>} [keys] array of keys
      * @param {function(Object.<string, any>)} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    get: function (keys, callback, customKey) {
      console.warn('Getting from storage: ', keys)

      var storedData = getStoredData(customKey || STORAGE_KEY)

			if (keys && Array.isArray(keys)) {
				Object.keys(storedData).forEach(key => {
					if (!keys.includes(key)) {
						delete storedData[key]
					}
				})
			}

      callback(storedData)
    },
    /**
      * @param {Array<string>} [keys] array of keys
      * @param {function()} callback callback function - use to handle when storage data saved
      * @param {string} [customKey] storage key - add if you want to use custom storage key
      */
    remove: function (keys, callback, customKey) {
      console.warn('Removing from storage:', keys)

      if (keys && Array.isArray(keys)) {
        var storedData = getStoredData(customKey || STORAGE_KEY)

				keys.forEach(key => {
					delete storedData[key]
				})

        setStoredData(customKey || STORAGE_KEY, storedData)
			} else {
				Object.keys(window.localStorage).forEach(function (key) {
          if (key.startsWith(customKey || STORAGE_KEY)) {
            window.localStorage.removeItem(key)
          }
        })
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
}