const fs = require('fs')
const merge = require('deepmerge')
const yaml = require('js-yaml')

class NonExistentError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NonExistentError'
    this.message = message || 'The file does not exist'
  }
}

class SyntaxError extends Error {
  constructor (message) {
    super(message)
    this.name = 'SyntaxError'
    this.message = message || 'The file contains a syntax error'
  }
}

function deleteIndex (obj, path) {
  switch (path.length) {
    case 0:
      return obj

    case 1:
      delete obj[path[0]]
      return obj

    default:
      return deleteIndex(obj[path[0]], path.slice(1))
  }
}

function setIndex (obj, path, value) {
  switch (path.length) {
    case 0:
      return obj

    case 1:
      obj[path[0]] = value
      return obj

    default:
      obj[path[0]] || (obj[path[0]] = {})

      return setIndex(obj[path[0]], path.slice(1), value)
  }
}

module.exports = class {
  constructor (files) {
    if (!files) {
      throw new Error('No configuration file(s) specified')
    }

    if (Array.isArray(files)) {
      this.configFiles = files
    } else {
      this.configFiles = [files]
    }

    this._toBePersisted = {}

    this._data = {}
  }

  delete (path, separator = '.') {
    var self = this

    if (typeof path === 'string' && path.length) {
      // Delete property from current config
      deleteIndex(self._data, path.split(separator))

      // Delete property from to be persisted config
      deleteIndex(self._toBePersisted, path.split(separator))
    }

    return self._data
  }

  get (path, separator = '.') {
    var self = this

    if (!path) {
      return self._data
    } else {
      return path.split(separator).reduce((prev, curr) => prev && prev[curr], self._data)
    }
  }

  load (options = {}) {
    var self = this
    var cfgJSON = []

    return new Promise((resolve, reject) => {
      for (const i in self.configFiles) {
        if (!fs.existsSync(self.configFiles[i])) {
          if (!options.ignoreNonExisting) {
            return reject(new NonExistentError(`Configuration file ${self.configFiles[i]} does not exist`))
          }

          continue
        }

        try {
          const cfgYAML = fs.readFileSync(self.configFiles[i], 'utf8')

          const contents = yaml.safeLoad(cfgYAML)

          if (i === self.configFiles.length - 1) {
            self._toBePersisted = contents
          }

          // Merge all configurations
          cfgJSON.push(contents)
        } catch (error) {
          return reject(new SyntaxError(`Error in configuration file ${self.configFiles[i]}: ${error}`))
        }
      }

      self._data = merge.all(cfgJSON)

      resolve(self._data)
    })
  }

  set (path, value, separator = '.') {
    var self = this

    if (typeof path === 'string' && path.length) {
      // Set the property to the current config
      setIndex(self._data, path.split(separator), value)

      // Set the property to the to be persisted config
      setIndex(self._toBePersisted, path.split(separator), value)
    }

    return self._data
  }

  save (data = {}) {
    var self = this

    const yamlStr = yaml.safeDump(self._toBePersisted)

    fs.writeFileSync(self.configFiles[self.configFiles.length - 1], yamlStr, 'utf8')
  }
}
