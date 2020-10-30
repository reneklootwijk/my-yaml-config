# Managing application configuration using yaml

[![Build](https://github.com/reneklootwijk/my-yaml-config/workflows/build/badge.svg)](https://github.com/reneklootwijk/my-yaml-config/actions)
[![Coverage Status](https://coveralls.io/repos/github/reneklootwijk/my-yaml-config/badge.svg?branch=master)](https://coveralls.io/github/reneklootwijk/my-yaml-config?branch=master)
[![npm](https://img.shields.io/npm/v/my-yaml-config)](https://www.npmjs.com/package/my-yaml-config)

This module makes it possible to comfigure your application using a yaml configuration file. It also supports changing, adding and deleting properties of the configuration and persist these changes to the configuration file.

## Installation

```bash
npm install my-yaml-config
```

## Usage

First create a configuration instance by specifying the path of the application configuration file or an array containg the path of multiple configuration files.

```javascript
const Config = require('my-yaml-config')

const config = new Config([
  'global.yaml',
  'my-app.yaml'
])
```

When multiple configuration files are specified they are merged into one configuration. When multiple configuration files specify the same property, the value of that property will be taken from the last file specifying that property. This makes it possible to use, for instance, a global configuration file containing defaults that can be overriden by an application specific configuration file. Note: Any configuration changes will only be applied to the last configuration file in the list when the configuration is persisted.

## Methods

The following methods are provided:

* `load(options)`, this method loads the specified configuration file(s), merges the configuration files in case multiple files are specified and returns a promise. When the promise resolves it returns the resulting configuration as a JSON object. When the *ignoreNonExisting* option is set to true, any non-existing files will be ignored, by default the option is set to false. When the *ignoreNonExisting* option is not set or set to false the promise will be rejected when one of the specified files does not exist.

* `get(path, [separator=])`, this method returns the value of a specific property that must be specified as a JSON path string. By default a dot is used as separator. A different separator can be used by specifying it via the separator attribute. If no path is specified, the whole configuration will be returned as JSON object.

* `set(path, value, [separator=])`, this method will change or add the property specified as a JSON path string, e.g. *log.level*. By default a dot is used as separator. A different separator can be used by specifying it via the separator attribute. The whole configuration including the change is returned as JSON object.

* `delete(path, [separator=])`, this method deletes the property specified as a JSON path string, e.g. *log.level*. When the specified property is a branch instead of a leaf, the whole branch below the property will be deleted.

* `save(data)`, this method will persist either the current configuration or the configuration specified by the data object by saving it to the filesystem. The configuration will be saved to the last file in the list specified when the configuration instance was created.

## Examples

Assume the following configuration files: 

* global.yaml:

  ```yaml
  log:
    level: debug
  ```

* my-app.yaml:

  ```yaml
  database:
    host: 192.168.10.3
  ```

The configuration files can be loaded and converted to a JSON configuration object by the following code:

```javascript
const config = new Config([
  'global.yaml',
  'my-app.yaml'
])

var cfg

config.load()
.then(result => {
  cfg = result
})
.catch(error => {
  return console.log(error.message)
})
```

The returned configuration object will look as follows:

```javascript
{
  "log": {
    "level": "debug"
  },
  "database": {
    "host": "192.168.10.3"
  }
}
```

**get('log.level')** and **get('log/level', '/')** both will return *debug*.

**set('log.level'), 'info')** and **set('log/level'), 'info', '/')** will both result in the following configuration:

```javascript
{
  "log": {
    "level": "info"
  },
  "database": {
    "host": "192.168.10.3"
  }
}
```

**set('database.port'), 27017)** will result in the following configuration:

```javascript
{
  "log": {
    "level": "info"
  },
  "database": {
    "host": "192.168.10.3",
    "port": 27017
  }
}
```

**delete('database')** will result in the following configuration:

```javascript
{
  "log": {
    "level": "info"
  }
}
```

**save()** will persist the following configuration to the my-app.yaml file:

```yaml
log:
  level: info
```
